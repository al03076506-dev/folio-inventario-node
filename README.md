# Folio · Gestión segura de productos

Repositorio del proyecto: https://github.com/al03076506-dev/folio-inventario-node

Aplicación publicada: https://folio-inventario-node.vercel.app/

Estado: Atlas verificado y CI inicial aprobado. El acceso de red Atlas de la prueba es temporal (seis horas); debe configurarse para mantener disponibilidad. Falta activar y demostrar el CD mediante GitHub Actions. Ver `docs/validacion.md`.

Aplicación web en español con Node.js 22+, Express 5, MongoDB/Mongoose, JWT, HTML/CSS/JavaScript y Jest. Cada cuenta administra únicamente sus productos. Precio expresado en MXN; máximo dos decimales. No hay roles administrativos ni catálogo compartido.

## Ejecutar

```sh
npm ci
cp .env.example .env
# Editar .env: URI propia de MongoDB, JWT_SECRET aleatorio y APP_ORIGIN.
npm start
```

Abrir http://localhost:3000. MongoDB debe estar disponible (local o Atlas). Generar el secreto con `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`. No usar el valor de ejemplo en producción. No subir `.env` ni credenciales a GitHub. `npm run dev` activa recarga del servidor.

## Pruebas

```sh
npm ci
npm run test:coverage
```

Jest ejecuta pruebas unitarias de controladores y configuración, y pruebas de integración de rutas con Supertest y MongoDB efímero real (`mongodb-memory-server`). La primera ejecución descarga un binario de MongoDB y requiere internet y las bibliotecas del sistema correspondientes. No usa Atlas ni borra datos externos. CI exige al menos 80% de líneas, sentencias y funciones; 65% de ramas. Se incluye `docs/validacion.md` con la evidencia de ejecución. Las pruebas fueron creadas con asistencia de IA (Codex), revisadas y ajustadas durante el desarrollo. No se afirma haber usado Copilot ni una revisión humana no realizada.

## API

| Método | Ruta | Resultado |
|---|---|---|
| POST | /api/auth/register | Registro `{name,email,password}`, cookie JWT, 201 |
| POST | /api/auth/login | Inicio `{email,password}`, cookie JWT, 200 |
| GET | /api/auth/me | Perfil autenticado |
| POST | /api/auth/logout | Revoca sesión actual, 204 |
| GET | /api/products?page=1&limit=20 | Lista privada y paginada (máximo 100) |
| POST | /api/products | Alta `{name,description,price,stock}`, 201 |
| GET | /api/products/:id | Consulta privada |
| PATCH | /api/products/:id | Actualiza campos enviados |
| DELETE | /api/products/:id | Elimina, 204 |
| GET | /api/health | Conexión MongoDB real: 200 o 503 |

Las escrituras exigen `Content-Type: application/json`, incluyendo logout y DELETE (cuerpo `{}`). Autenticación por cookie HttpOnly o encabezado `Authorization: Bearer <jwt>` para clientes API. El navegador no recibe el token en JSON ni lo almacena en localStorage. Registro inicia sesión automáticamente. Contraseñas: 12–72 caracteres y máximo 72 bytes por límite de bcrypt. JWT HS256 con issuer, audience y expiración de una hora; Session persiste `jti` y permite revocación inmediata. Un token vencido o una sesión eliminada devuelve 401. Un producto ajeno devuelve 404 para no revelar su existencia.

Validación estricta rechaza campos extra (incluido `owner`), precios negativos, fracciones de stock e intentos de inyección por objetos. bcrypt con coste 12, Helmet/CSP, JSON limitado a 16KB, mismo origen y SameSite=Strict para CSRF. Producción exige HTTPS y cookie Secure. No se habilita CORS. Límite de 20 intentos de autenticación por 15 minutos e IP **por proceso**; para despliegues serverless se recomienda un almacén compartido de rate limit antes de uso público intensivo. No configurar `trust proxy` sin conocer y validar la cadena de proxies.

## Organización

- `src/app.js`: middleware HTTP, seguridad, rutas y manejo de errores.
- `src/server.js`, `src/db.js`, `src/config.js`: arranque, conexión reutilizable y configuración.
- `src/models/`, `src/controllers/`, `src/routes/`, `src/middleware/`: datos, lógica, recursos y validación/autenticación.
- `public/`: interfaz estática responsive, registro/login, catálogo, formularios y confirmación de borrado.
- `tests/`: pruebas unitarias y de integración.
- `api/index.js`, `vercel.json`: entrada serverless.
- `.github/workflows/`: CI y despliegue condicionado a pruebas correctas.
- `docs/`: requerimientos, diagrama, decisiones, pruebas y despliegue.

## Atlas y Vercel

1. Crear un clúster de Atlas y un usuario de base de datos con acceso de lectura/escritura únicamente a la base `inventario`. Copiar la URI, codificando caracteres especiales de usuario/contraseña. Configurar la lista de acceso de red con las IP de salida del hosting; usar egreso fijo cuando sea posible. No abrir 0.0.0.0/0 por defecto.
2. Crear un proyecto en Vercel importando el repositorio, raíz del proyecto `.` y Node.js 22. `api/index.js` exporta Express sin `listen`; `vercel.json` envía las rutas a esta función. No se requiere build del frontend. Desactivar despliegues automáticos de la integración Git para que el despliegue quede gobernado por el pipeline posterior a Jest.
3. Configurar en Vercel, entorno Production: `MONGODB_URI`, `JWT_SECRET` (sensible), `APP_ORIGIN=https://<dominio-produccion>` y `NODE_ENV=production`. Usar un dominio de producción estable. No configurar MONGODB_URI o JWT_SECRET como variables públicas del frontend.
4. En GitHub configurar Environment `production` (opcionalmente con revisores), secretos `VERCEL_TOKEN`, `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID`; IDs disponibles al vincular el proyecto con Vercel. Crear variable de repositorio `ENABLE_VERCEL_DEPLOY=true` solo después de configurar todo.
5. Hacer push a `main`: CI ejecuta `npm ci`, Jest y publica cobertura. Si el evento es push y las pruebas pasan, CD toma **el mismo SHA** validado, construye con Vercel CLI y despliega. No despliega código de pull requests externos. Concurrencia serializa despliegues. Si faltan servicios, CD permanece desactivado; no se representa como despliegue completado.
6. Comprobar `https://<dominio>/api/health`: debe devolver `{"status":"ok","database":"connected"}`. Registrar una cuenta desde la web, crear/editar/consultar/eliminar un producto y cerrar sesión. Abrir otra cuenta y comprobar aislamiento. Guardar URL y capturas como evidencia. Este paso debe realizarse con Atlas real; los tests efímeros no lo sustituyen.

Vercel se elige por soporte Node.js serverless, HTTPS administrado, gestión de secretos y CLI integrable en GitHub Actions. MongoDB Atlas ofrece persistencia independiente de funciones efímeras. La conexión se reutiliza dentro de cada instancia caliente. Límites: arranque en frío, duración y conexiones concurrentes según plan, egreso de red para Atlas y ausencia de almacenamiento local persistente. Un despliegue de alta carga debe revisar pool de conexiones, rate limit distribuido, backups y observabilidad.

## Incidentes y entrega

Consultar `docs/incidentes.md` para aplicar las tarjetas de errores de la actividad. `docs/Informe-proyecto.docx` incluye requerimientos, diagrama y justificación SaaS. La documentación distingue lo ejecutado localmente de las configuraciones pendientes de servicios externos. Entregar el ZIP y la URL real del repositorio; completar la URL de producción tras desplegar. Nunca adjuntar secretos ni `node_modules`.
