# ARIA Frontend

Frontend del proyecto ARIA, una aplicacion web para reportar animales en situacion de riesgo, consultar mascotas perdidas y gestionar casos segun el rol del usuario.

Este repositorio contiene la interfaz de usuario construida con React, Vite y Tailwind CSS.

## Tecnologias

- React
- Vite
- React Router DOM
- Tailwind CSS
- Axios
- Lucide React
- clsx
- tailwind-merge
- shadcn/ui parcial
- Docker
- Nginx

## Estructura principal

```txt
src/pages/             Vistas principales de la aplicacion
src/components/        Componentes reutilizables
src/components/ui/     Componentes UI base
src/services/          Clientes para consumir la API
src/context/           Contexto de autenticacion
src/config/            Configuracion de API
src/lib/               Utilidades compartidas
```

## Variables de entorno

Para ejecucion normal con Vite se puede usar un archivo `.env` en el frontend.

Variable principal:

```env
VITE_API_URL=http://localhost:3000/api
```

No subas `.env` al repositorio.

## Ejecucion sin Docker

Instalar dependencias:

```powershell
npm install
```

Ejecutar en desarrollo:

```powershell
npm run dev
```

Validar lint:

```powershell
npm run lint
```

Generar build de produccion:

```powershell
npm run build
```

Vista previa del build:

```powershell
npm run preview
```

## Docker

El frontend se construye con Node.js y se sirve con Nginx.

Normalmente se levanta desde el `docker-compose.yml` del repositorio backend, porque ARIA usa repositorios separados para frontend y backend.

Guia principal:

```txt
../aria-backend/DOCKER.md
```

URL del frontend en Docker:

```txt
http://localhost:5173
```

Healthcheck del contenedor:

```txt
http://localhost:5173/health
```

## Rutas principales

```txt
/                         Landing publica
/login                    Inicio de sesion
/register                 Registro de usuario o entidad
/perdidos                 Vista publica de mascotas perdidas
/animales-perdidos        Vista autenticada de mascotas perdidas
/nuevo-reporte            Crear reporte ciudadano
/mis-reportes             Historial del ciudadano
/feed                     Casos activos para entidad
/admin                    Panel de administracion
/pendiente-aprobacion     Estado de entidad pendiente
```

## Roles soportados

- ciudadano
- entidad
- administrador

## Integracion con backend

Las peticiones HTTP se realizan con Axios desde `src/services/`.

El backend debe estar disponible en:

```txt
http://localhost:3000/api
```

## Seguridad

- No subir `.env`.
- No subir `node_modules`.
- No subir `dist`.
- Mantener las rutas protegidas segun rol.
- Usar ramas y pull requests para integrar cambios.
