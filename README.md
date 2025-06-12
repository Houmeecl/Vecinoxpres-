# VecinoXpress POS

Este proyecto contiene un backend sencillo para generar certificados en PDF con código QR y un panel de administración básico. Además incluye activación de POS y gestión de documentos con diferentes estados.

## Uso rápido

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Ejecutar el servidor:
   ```bash
   npm start
   ```
3. Acceder al panel en [http://localhost:5000/admin](http://localhost:5000/admin).
4. Activar un POS en [http://localhost:5000/pos](http://localhost:5000/pos).

El endpoint `/api/generar-certificado` permite crear certificados en formato PDF. Los documentos generados se almacenan en `certificados.json` y pueden listarse desde `/api/certificados`. También se exponen endpoints para consultar `/api/documentos` y actualizar su estado con `PATCH /api/documentos/:id/estado`.
