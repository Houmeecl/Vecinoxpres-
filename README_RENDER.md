# 🌐 VecinoXpress POS - Deploy en Render.com

Este archivo explica cómo desplegar y ejecutar correctamente el backend de **VecinoXpress POS** usando [Render.com](https://render.com), un servicio gratuito para aplicaciones Node.js.

---

## 🚀 1. Requisitos

- Cuenta en [GitHub](https://github.com)
- Cuenta en [Render.com](https://render.com)
- Repositorio GitHub con los archivos:
  - `index.js`
  - `package.json`
  - `/templates/certificado_residencia.html`
  - `/public/certificados.json`

---

## 🛠️ 2. Crear un servicio en Render

1. Ingresa a https://dashboard.render.com
2. Clic en **"New Web Service"**
3. Conecta tu cuenta GitHub
4. Selecciona el repositorio `VecinoXpress_POS_GitHub_Ready`
5. Configura:

| Campo                 | Valor                          |
|----------------------|---------------------------------|
| Runtime              | Node                            |
| Build Command        | `npm install`                  |
| Start Command        | `node index.js`                |
| Root Directory       | (vacío si index.js está en la raíz) |
| Region               | Oregón (gratis)                |
| Plan                 | FREE                            |

6. Haz clic en **"Create Web Service"**

---

## 🌐 3. Acceso y uso

Una vez desplegado, Render entregará una URL pública como:

```
https://vecinoxpress-api.onrender.com
```

Puedes probar directamente:

### ➕ Generar certificado PDF (POST):
```
POST /api/generar-certificado
Content-Type: application/json
```

Cuerpo:
```json
{
  "nombre": "Juan Pérez",
  "rut": "12.345.678-9",
  "direccion": "Av. Los Pinos 1234",
  "comuna": "Antofagasta",
  "region": "Antofagasta",
  "fecha": "31 de mayo de 2025",
  "certificador": "Eduardo Venegas"
}
```

### 🔍 Validar certificado:
```
GET /validar?id=ID_GENERADO
```

---

## 🧾 Documentos generados

- Guardados en `/public/cert-ID.pdf`
- Registro en `/public/certificados.json`

---

## 🤝 Autor

VecinoXpress POS - Sistema LegalTech con impacto social.  
Repositorio creado por **Edward Gonzalo Venegas**.
