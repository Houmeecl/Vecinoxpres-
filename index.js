// index.js - Backend Express PDF + QR
const express = require('express');
const fs = require('fs');
const path = require('path');
const pdf = require('html-pdf');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const cron = require('node-cron');

const POS_FILE = path.join(__dirname, 'poses.json');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/pos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pos.html'));
});

const DATA_FILE = path.join(__dirname, 'certificados.json');

function loadCertificados() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, '[]');
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    try {
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
}

function saveCertificados(arr) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2));
}

let certificados = loadCertificados();

function loadPoses() {
    if (!fs.existsSync(POS_FILE)) {
        fs.writeFileSync(POS_FILE, '[]');
    }
    const raw = fs.readFileSync(POS_FILE, 'utf8');
    try {
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
}

function savePoses(arr) {
    fs.writeFileSync(POS_FILE, JSON.stringify(arr, null, 2));
}

let poses = loadPoses();

app.post('/api/generar-certificado', (req, res) => {
    const data = req.body;
    const template = fs.readFileSync(path.join(__dirname, 'templates', 'certificado_residencia.html'), 'utf8');
    const uuid = uuidv4();
    const html = template
        .replace('{{nombre}}', data.nombre)
        .replace('{{rut}}', data.rut)
        .replace('{{direccion}}', data.direccion)
        .replace('{{comuna}}', data.comuna)
        .replace('{{region}}', data.region)
        .replace('{{fecha}}', data.fecha)
        .replace('{{certificador}}', data.certificador)
        .replace(/{{qr_url}}/g, `https://vecinoxpress.cl/validar?id=${uuid}`)
        .replace(/{{validacion_url}}/g, `https://vecinoxpress.cl/validar?id=${uuid}`);

    const pdfPath = path.join(__dirname, 'public', `cert-${uuid}.pdf`);
    pdf.create(html).toFile(pdfPath, (err) => {
        if (err) return res.status(500).send('Error al generar PDF');
        const record = {
            id: uuid,
            ...data,
            archivo: `cert-${uuid}.pdf`,
            estado: 'PENDIENTE_FIRMA'
        };
        certificados.push(record);
        saveCertificados(certificados);
        res.json({ success: true, id: uuid, pdf: `/cert-${uuid}.pdf` });
    });
});

app.post('/api/activar-pos', (req, res) => {
    const { id, clave } = req.body;
    if (!id || !clave) return res.status(400).json({ error: 'Datos incompletos' });
    const pos = { id, activado: new Date().toISOString(), qr: `POS-${id}-${uuidv4()}` };
    poses.push(pos);
    savePoses(poses);
    res.json({ ok: true, qr: pos.qr });
});

app.get('/validar', (req, res) => {
    const id = req.query.id;
    const cert = certificados.find(c => c.id === id);
    if (!cert) return res.send("Certificado no encontrado.");
    res.send(`<h2>Certificado válido</h2><p>Emitido a nombre de: <strong>${cert.nombre}</strong><br>Dirección: <strong>${cert.direccion}</strong><br>Certificador: ${cert.certificador}</p><a href="/${cert.archivo}" target="_blank">Ver PDF</a>`);
});

app.get('/api/certificados', (req, res) => {
    res.json(certificados);
});

app.get('/api/documentos', (req, res) => {
    const { estado } = req.query;
    let list = certificados;
    if (estado) list = list.filter(c => c.estado === estado);
    res.json(list);
});

app.patch('/api/documentos/:id/estado', (req, res) => {
    const doc = certificados.find(c => c.id === req.params.id);
    if (!doc) return res.status(404).json({ error: 'No encontrado' });
    doc.estado = req.body.estado || doc.estado;
    saveCertificados(certificados);
    res.json({ ok: true });
});

app.get('/api/poses', (req, res) => {
    res.json(poses);
});

app.get('/api/kpis', (req, res) => {
    res.json({ total: certificados.length });
});

cron.schedule('0 0 * * *', () => {
    const reportDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);
    const today = new Date().toISOString().slice(0, 10);
    const content = `Total certificados: ${certificados.length}`;
    fs.writeFileSync(path.join(reportDir, `daily-${today}.txt`), content);
    console.log('Reporte diario generado');
});

app.listen(5000, () => console.log("Servidor ejecutándose en puerto 5000"));
