# Diagnóstico basado en las tarjetas de errores

Se consultó el PDF “Tarjetas de errores – Actividad 4” enlazado en la consigna, descargado el 11 de noviembre de 2026. No se redistribuye el PDF de la universidad.

| Incidente | Comprobación y respuesta del proyecto |
|---|---|
| Atlas no conecta | Revisar MONGODB_URI, usuario, contraseña codificada, IP de salida y red. Health devuelve 503 sin revelar URI. No abrir todas las IP por defecto. |
| Ruta sin protección | El router de productos ejecuta JWT y consulta de Session antes de cada operación. Jest exige 401 sin credenciales para todos los verbos. |
| Contraseña en texto plano | bcrypt coste 12; prueba verifica hash y exclusión de respuesta. |
| Token inválido o expirado | verify valida algoritmo, firma, issuer, audience y exp; sesión se consulta con expiresAt. Respuesta 401. |
| Acceso a producto ajeno | Consultas filtran owner y _id de forma conjunta. Pruebas cubren GET/PATCH/DELETE y listado con dos usuarios. |
| Datos o identificador inválido | Zod y validación ObjectId: 400 antes de consultar documento; JSON inválido también 400. |
| Error inesperado en controlador | Express 5 propaga promesas rechazadas al middleware final; 500 genérico, sin URI ni stack. |
| Pruebas no encuentran MongoDB | El primer test descarga un servidor efímero; revisar red de descarga y bibliotecas. Atlas no es dependencia de CI. |
| Secretos o despliegue fallido | Guardar secretos en Vercel/GitHub, no en código; CI debe pasar antes de CD. Revisar logs sin imprimir valores. |
| Frontend no conserva sesión | Verificar mismo dominio, APP_ORIGIN exacto, HTTPS y cookie Secure/HttpOnly/SameSite. |

La tabla es una adaptación al proyecto; no pretende transcribir literalmente todas las tarjetas.
