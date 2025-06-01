const express = require('express');
const fs = require('fs');
const path = require('path');
const pdf = require('html-pdf');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

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
    pdf.create(html).toFile(pdfPath, (err, result) => {
        if (err) return res.status(500).send('Error al generar PDF');
        fs.appendFileSync(path.join(__dirname, 'public', 'certificados.json'), JSON.stringify({
            id: uuid,
            ...data,
            archivo: `cert-${uuid}.pdf`
        }) + ',
');
        res.json({ success: true, id: uuid, pdf: `/cert-${uuid}.pdf` });
    });
});

app.get('/validar', (req, res) => {
    const id = req.query.id;
    const certs = fs.readFileSync(path.join(__dirname, 'public', 'certificados.json'), 'utf8').split(',
').filter(Boolean);
    const cert = certs.map(c => JSON.parse(c)).find(c => c.id === id);
    if (!cert) return res.send("Certificado no encontrado.");
    res.send(`<h2>Certificado válido</h2><p>Emitido a nombre de: <strong>${cert.nombre}</strong><br>Dirección: <strong>${cert.direccion}</strong><br>Certificador: ${cert.certificador}</p><a href="/${cert.archivo}" target="_blank">Ver PDF</a>`);
});

app.listen(5000, () => console.log("Servidor PDF escuchando en puerto 5000"));
