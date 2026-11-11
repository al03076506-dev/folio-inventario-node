# Requerimientos

## Funcionales

### RF-01 · Registro
Registrar nombre (2–80), correo único y contraseña de 12–72 caracteres y máximo 72 bytes; guardar hash bcrypt.

Aceptación: 201; duplicado 409; entrada inválida 400.

### RF-02 · Inicio de sesión
Validar correo y contraseña; emitir JWT HS256 por una hora con issuer, audience y jti.

Aceptación: 200 y cookie HttpOnly; credenciales erróneas 401.

### RF-03 · Perfil
Consultar identidad autenticada sin exponer hash.

Aceptación: GET /api/auth/me devuelve id, nombre y correo.

### RF-04 · Cierre de sesión
Eliminar la sesión actual en MongoDB y limpiar la cookie.

Aceptación: 204; reutilizar el JWT revocado produce 401.

### RF-05 · Crear producto
Guardar nombre, descripción opcional, precio MXN y existencias enteras con propietario asignado por el servidor.

Aceptación: 201 y documento persistido.

### RF-06 · Consultar productos
Listar y ver detalle de productos propios con paginación; máximo 100 por consulta.

Aceptación: 200; metadatos total, página y páginas.

### RF-07 · Modificar producto
Actualizar parcialmente campos permitidos, conservando propietario.

Aceptación: PATCH 200; vacío o valores inválidos 400.

### RF-08 · Eliminar producto
Solicitar confirmación en la interfaz y borrar documento propio.

Aceptación: 204; consultas posteriores 404.

### RF-09 · Autorización por propiedad
Filtrar todas las consultas por usuario autenticado. Nunca aceptar owner desde el cliente.

Aceptación: Otra cuenta no puede listar, ver, editar o borrar productos ajenos.

### RF-10 · Interfaz web
Vistas HTML estáticas de login/registro e inventario con formularios, detalle, paginación y mensajes de error.

Aceptación: Interfaz responsive y navegación mediante botones etiquetados.

### RF-11 · Salud
Comprobar conectividad real a la base de datos.

Aceptación: /api/health: 200 conectado o 503 desconectado.

### RF-12 · Automatización
Ejecutar pruebas por push/PR y desplegar el SHA validado al habilitar CD.

Aceptación: Archivos YAML incluidos; ejecución remota pendiente de repositorio y secretos.

## No funcionales

### RNF-01 · Seguridad
JWT verificado con HS256, issuer, audience, exp y sesión activa; bcrypt coste 12; HTTPS y cookie Secure en producción.

### RNF-02 · Privacidad
No exponer contraseña/hash, tokens en JSON, URI o stack de errores. No usar localStorage para el JWT; respuestas API no-store.

### RNF-03 · Validación
Esquemas estrictos Zod, rechazo de campos extra, límite JSON 16 KB, máximo dos decimales y stock entero no negativo.

### RNF-04 · Protección HTTP
Helmet/CSP, sin CORS, verificación de Origin en escrituras, SameSite=Strict y JSON obligatorio. Rate limit de autenticación por instancia.

### RNF-05 · Mantenibilidad
Separación por modelos, controladores, rutas y middleware; configuración central; lockfile y scripts reproducibles.

### RNF-06 · Pruebas
Jest con Supertest y MongoDB efímero. Umbrales CI: 80% líneas/sentencias/funciones y 65% ramas. Pruebas de propietario, revocación y errores.

### RNF-07 · Rendimiento
Paginación y límite de 100; índice en owner; índice único en email; reutilización de conexión por instancia caliente. Objetivo de evaluación: p95 menor de 2 s con 10 usuarios, excluyendo arranque frío; pendiente de medir en hosting.

### RNF-08 · Persistencia
MongoDB externo y Mongoose; índice TTL en sesiones. Validar expiresAt en cada petición sin depender de la puntualidad del borrado TTL.

### RNF-09 · Usabilidad y accesibilidad
HTML semántico, etiquetas de campos, controles por teclado, foco visible, errores con role=alert y diálogos nativos; diseño adaptable desde 320 px. Revisión visual y auditoría accesible completa pendientes.

### RNF-10 · Despliegue y operación
Variables de entorno para secretos, HTTPS administrado y CI/CD. Disponibilidad y backups dependen del plan contratado; no se afirma SLA ni pruebas de carga realizadas.
