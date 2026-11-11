# Publicar desde la cuenta correcta

La cuenta indicada por el usuario es `al03076506-dev`. La integración actual tiene solo lectura en `al03076506-dev/inventario-facil-tecmilenio`. No se ha modificado ese repositorio.

## Repositorio nuevo (recomendado para evitar sobrescribir otro trabajo)

1. Inicia sesión en GitHub con `al03076506-dev` y crea un repositorio vacío `folio-inventario-node` sin README inicial.
2. Extrae el ZIP, entra a la carpeta `folio-inventario-node` y ejecuta:

```sh
git init -b main
git add .
git commit -m "Implementar inventario con JWT, CRUD, pruebas y CI/CD"
git remote add origin https://github.com/al03076506-dev/folio-inventario-node.git
git push -u origin main
```

Autentica Git con GitHub CLI o el administrador de credenciales de tu equipo. No pegues tokens en el código ni en el chat. El proyecto incluye .gitignore para excluir .env, node_modules y cobertura.

## Si usarás un repositorio que ya contiene trabajo

Clónalo, crea una rama e integra los archivos revisando diferencias. No uses push --force ni reemplaces archivos sin revisar. Abre una pull request. Después de publicar, completa en el informe Word la URL real del repositorio y verifica GitHub Actions.

## Despliegue

Sigue el apartado Atlas y Vercel del README. Hasta configurar esos servicios y ejecutar el workflow, no existe una URL de producción verificada para esta versión.
