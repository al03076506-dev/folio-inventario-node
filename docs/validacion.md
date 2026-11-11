# Evidencia de validación

Fecha: 11 de noviembre de 2026. Entorno local administrado: Node.js 24.22.1 / npm 11.9.0. El proyecto y CI declaran Node 22.x; la ejecución en Node 22 se verificará cuando se active GitHub Actions.

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

## Pendientes externos

Repositorio de destino verificado: https://github.com/al03076506-dev/folio-inventario-node. La conexión se actualizó a `al03076506-dev` y tiene permiso de escritura. Consultar la pestaña Actions para el resultado de CI remoto; la evidencia numérica anterior corresponde a la ejecución local.

No hay secretos de Atlas/Vercel configurados. La conexión Atlas, publicación SaaS y ejecución remota de CI/CD permanecen pendientes. Los archivos de configuración están preparados; no constituyen evidencia de despliegue.
