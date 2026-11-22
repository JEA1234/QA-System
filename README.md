# Frontend — Sistema de Trazabilidad QA (Angular)

Base del frontend (Angular 17, standalone components, sin NgModules),
organizada por módulo según la Sección 3 y 4 del SRS.

## Abrir en Antigravity (o cualquier IDE)
1. Abrir esta carpeta `frontend/` como proyecto.
2. Instalar dependencias: `npm install`
3. Levantar en desarrollo: `npm start` (usa `proxy.conf.json`, que redirige
   `/api` hacia `http://localhost:8080`, el backend base).
4. Abrir http://localhost:4200 — debe mostrar el estado del backend
   (requiere el backend corriendo, ver `../backend/README.md`).

## Requisitos previos
- Node.js 20+
- Angular CLI (`npm i -g @angular/cli`), opcional: también funciona con `npx ng`

## Estructura
```
src/
  main.ts                 Punto de entrada (bootstrapApplication)
  app/
    app.component.ts      Root standalone (<router-outlet>)
    app.config.ts         Providers base (router, HttpClient)
    app.routes.ts         Rutas base
    core/services/        ApiService (wrapper de HttpClient hacia /api)
    layout/                Layout + Sidebar
    features/              Una carpeta por módulo del SRS (auth, proyectos,
                            requerimientos, trazabilidad, casosprueba,
                            ejecucion, incidencias, correccionretest,
                            reportes, configuracion, auditoria,
                            busquedanotificaciones)
  environments/            environment.ts / environment.development.ts
```

Solo `features/auth/home/` tiene contenido (pantalla de verificación).
El resto de módulos están vacíos como punto de partida, sin romper el
build: la app corre igual aunque estén sin implementar.

## Nota
Este frontend reemplaza la versión anterior en React/Vite. El puerto de
desarrollo cambió de 5173 (Vite) a **4200** (Angular por defecto); el
`CorsConfig` del backend ya fue actualizado para permitir ese origen.
