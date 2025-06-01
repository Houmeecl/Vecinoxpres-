# VecinoXpress POS

Sistema backend en Node.js + Express para generación de certificados PDF con QR y validación en línea.

## Endpoints principales

- `POST /api/generar-certificado`: Genera un certificado con datos enviados en JSON.
- `GET /validar?id=UUID`: Verifica y muestra el certificado asociado al QR.

## Tecnologías

- Node.js + Express
- HTML-PDF
- UUID
- JSON como base de datos simple

## Uso

1. Instalar dependencias:
   ```
   npm install
   ```

2. Ejecutar servidor:
   ```
   npm start
   ```

3. Enviar datos a `/api/generar-certificado` con JSON para generar PDF.
