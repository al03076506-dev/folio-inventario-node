# Evidencia de validación

Fecha: 11 de noviembre de 2026. Entorno local administrado: Node.js 24.22.1 / npm 11.9.0. El proyecto y CI declaran Node 22.x; la primera ejecución remota con Node 22 pasó en GitHub Actions: https://github.com/al03076506-dev/folio-inventario-node/actions/runs/43088390882.

- Comando: `npm run test:coverage`.
- Resultado: 4 suites, 46 pruebas aprobadas; 22.839 segundos.
- Cobertura: líneas 100%; funciones 100%; sentencias 99.47%; ramas 92.75%.
- Controladores de autenticación y productos: 100% de líneas, funciones, sentencias y ramas.
- MongoDB: proceso efímero real creado por mongodb-memory-server. No representa una conexión a Atlas.
- `npm audit --omit=dev`: 0 vulnerabilidades conocidas reportadas en dependencias de producción al momento de la consulta.
- QA visual en navegador no realizada: este entorno declara SITES_MANAGED_LINUX_CONTAINER=1 y no dispone de cua_repl.js; la guía de preview exige omitir esa verificación cuando falta esa herramienta. El HTML y los recursos estáticos se verifican mediante Supertest.
- Registro de ejecución: `docs/jest-ejecucion.txt`; resultados de audit: `docs/audit-produccion.json`.

## Asistencia de IA y revisión

Codex generó las pruebas a partir de los controladores y rutas existentes. Se revisaron y ampliaron durante la implementación para cubrir dos usuarios, acceso ajeno, tokens alterados/expirados, revocación inmediata tras logout, sesión caducada en MongoDB, contraseña Unicode mayor de 72 bytes, payloads inválidos, paginación, fallos de persistencia y reintento de conexión. No se usó Copilot. La revisión por el alumno debe contrastar cada caso con la rúbrica y añadir su evidencia personal; no se atribuye una revisión humana no realizada.

## Publicación y pendientes

Repositorio de destino verificado: https://github.com/al03076506-dev/folio-inventario-node. La conexión se actualizó a `al03076506-dev` y tiene permiso de escritura. Consultar la pestaña Actions para el resultado de CI remoto; la evidencia numérica anterior corresponde a la ejecución local.

La aplicación fue publicada por el usuario con la integración Git de Vercel: https://folio-inventario-node.vercel.app/ . Se verificó /api/health con HTTP 200 y {"status":"ok","database":"connected"}, y /api/products sin sesión con HTTP 401. La ruta raíz redirige a /index.html (307), que sirve la interfaz con HTTP 200. Se corrigió el enrutamiento de portada observado en producción.

El usuario mostró una captura del formulario de productos tras autenticarse y reportó completar las operaciones de prueba. Esto constituye evidencia aportada por el usuario, no una sesión de navegador automatizada por el asistente. Falta adjuntar capturas de alta, consulta, modificación y eliminación y verificar persistencia al volver a iniciar sesión.

Atlas: proyecto separado Folio Inventario, clúster FolioCluster. Se autorizó acceso de red temporal 0.0.0.0/0 durante seis horas para la prueba. Al caducar, el alojamiento perderá acceso salvo que se configure otra regla válida. La disponibilidad para evaluación requiere resolver esta configuración; no se declara disponibilidad permanente.

CI inicial: aprobado. Las últimas ejecuciones tras cambios de enrutamiento estaban en cola al consultar. CD de GitHub Actions: configurado, pero su ejecución anterior fue omitida porque ENABLE_VERCEL_DEPLOY no está habilitado. Faltan secretos VERCEL_TOKEN, VERCEL_ORG_ID y VERCEL_PROJECT_ID y habilitar esa variable para demostrar el pipeline de despliegue posterior a pruebas. El despliegue Git automático de Vercel sí se completó, pero no demuestra por sí mismo el CD mediante GitHub Actions.
