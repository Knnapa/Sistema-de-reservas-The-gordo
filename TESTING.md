# Documentación de Pruebas — Sistema de Reservas The Gordo

## Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Stack de Testing](#stack-de-testing)
3. [Estructura de Archivos](#estructura-de-archivos)
4. [Comandos de Ejecución](#comandos-de-ejecución)
5. [Tests Unitarios](#tests-unitarios)
   - [adminAuthService](#adminauthservice)
   - [useAdminGuard](#useadminguard)
   - [mesasService](#mesasservice)
   - [reservasService](#reservasservice)
   - [horariosService](#horariosservice)
6. [Tests de Seguridad](#tests-de-seguridad)
7. [Tests E2E (Playwright)](#tests-e2e-playwright)
8. [Cobertura de Código](#cobertura-de-código)
9. [Bug Corregido Durante el Testing](#bug-corregido-durante-el-testing)
10. [Variables de Entorno](#variables-de-entorno)
11. [Configuración CI/CD](#configuración-cicd)
12. [Riesgos y Recomendaciones](#riesgos-y-recomendaciones)

---

## Resumen Ejecutivo

| Métrica | Valor |
|---|---|
| Framework unitario | Vitest 4 + React Testing Library |
| Framework E2E | Playwright |
| Tests unitarios totales | **55 tests** |
| Tests E2E totales | **14 tests** |
| Cobertura — Statements | **94.36%** |
| Cobertura — Functions | **96.55%** |
| Cobertura — Lines | **98.34%** |
| Resultado lint | ✅ 0 errores |
| Resultado build | ✅ Exitoso |
| Resultado `npm test` | ✅ 55/55 pasados |
| Resultado `npm run test:e2e` | ✅ 7 pasados / 7 omitidos (requieren credenciales) / 0 fallos |

---

## Stack de Testing

### Unitarios
- **[Vitest](https://vitest.dev/)** — framework de tests compatible con Vite, sintaxis Jest-compatible
- **[@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/)** — renderizado de hooks y componentes
- **[@testing-library/jest-dom](https://github.com/testing-library/jest-dom)** — matchers DOM adicionales
- **[jsdom](https://github.com/jsdom/jsdom)** — entorno de navegador simulado para Node.js
- **[@vitest/coverage-v8](https://vitest.dev/guide/coverage.html)** — cobertura de código nativa de V8

### E2E (Funcionales)
- **[@playwright/test](https://playwright.dev/)** — automatización de navegador real (Chromium)

---

## Estructura de Archivos

```
proyecto/
├── src/
│   └── tests/
│       ├── setup.js                         # Configuración global (jest-dom)
│       ├── helpers/
│       │   └── supabaseMock.js              # Helper para mockear el cliente Supabase
│       ├── unit/
│       │   ├── adminAuthService.test.js     # Tests del servicio de auth admin
│       │   ├── useAdminGuard.test.js        # Tests del hook de protección de rutas
│       │   ├── mesasService.test.js         # Tests del servicio de mesas
│       │   ├── reservasService.test.js      # Tests del servicio de reservas
│       │   └── horariosService.test.js      # Tests del servicio de horarios
│       └── security/
│           └── adminRoutes.test.jsx         # Tests de seguridad de rutas admin
├── tests/
│   └── e2e/
│       ├── public.spec.js                   # Tests E2E — página pública
│       └── admin.spec.js                    # Tests E2E — panel admin (seguridad + autenticado)
├── playwright.config.js                     # Configuración de Playwright
└── vite.config.js                           # Configuración de Vite + Vitest
```

---

## Comandos de Ejecución

```bash
# Ejecutar todos los tests unitarios y de seguridad (una sola vez)
npm test

# Ejecutar en modo watch (re-ejecuta al guardar cambios)
npm run test:watch

# Ejecutar con reporte de cobertura de código
npm run test:coverage

# Ejecutar tests E2E con Playwright (necesita el servidor de dev activo)
npm run test:e2e

# Solo iniciar el servidor de dev (sin tests)
npm run dev
```

> **Nota:** `npm run test:e2e` levanta el servidor de desarrollo automáticamente antes de correr los tests. Si el puerto 5173 ya está en uso, reutiliza el servidor existente.

---

## Tests Unitarios

Todos los tests unitarios mockean el cliente de Supabase mediante `vi.mock()`. El helper `src/tests/helpers/supabaseMock.js` expone `makeChain(result)`, una función que construye un query-builder fluido que es además `PromiseLike`, compatible con todos los patrones de consulta usados en los servicios.

### adminAuthService

**Archivo:** `src/tests/unit/adminAuthService.test.js`
**Módulo testeado:** `src/services/adminAuthService.js`

| # | Test | Descripción | Resultado |
|---|---|---|---|
| 1 | `getAdminProfile` — usuario existe | Retorna el perfil cuando el ID existe en `admin_users` | ✅ |
| 2 | `getAdminProfile` — usuario no existe | Retorna `null` cuando no hay fila en `admin_users` | ✅ |
| 3 | `getAdminProfile` — error Supabase | Retorna `null` y loguea el error | ✅ |
| 4 | `signInAdmin` — credenciales válidas + es admin | Retorna `{ user, admin }` correctamente | ✅ |
| 5 | `signInAdmin` — credenciales inválidas | Lanza "Correo o contraseña incorrectos." | ✅ |
| 6 | `signInAdmin` — auth ok pero no es admin | Lanza "Este usuario no tiene permisos de administrador." y llama `signOut` | ✅ |
| 7 | `requireAdminSession` — sesión válida + admin | Retorna `{ session, admin }` | ✅ |
| 8 | `requireAdminSession` — sin sesión activa | Retorna `null` | ✅ |
| 9 | `requireAdminSession` — sesión pero no admin | Retorna `null` y llama `signOut` | ✅ |
| 10 | `requireAdminSession` — error en `getSession` | Retorna `null` | ✅ |
| 11 | `signOutAdmin` | Llama a `supabase.auth.signOut()` exactamente una vez | ✅ |

**Lógica crítica verificada:**
- Cuando `signInAdmin` detecta que el usuario autenticado no está en `admin_users`, cierra la sesión en Supabase automáticamente antes de lanzar el error.
- `requireAdminSession` hace lo mismo: si hay sesión pero el usuario no es admin, cierra la sesión y devuelve `null`.

---

### useAdminGuard

**Archivo:** `src/tests/unit/useAdminGuard.test.js`
**Módulo testeado:** `src/hooks/useAdminGuard.js`

Este hook es el guardián de todas las rutas admin. Se monta en cada página protegida (`Dashboard`, `GestionMesas`, `GestionReservas`, `GestionHorarios`).

| # | Test | Descripción | Resultado |
|---|---|---|---|
| 1 | Estado inicial | Empieza en `checkingAuth = true` mientras valida | ✅ |
| 2 | Sin sesión → redirige | Cuando `requireAdminSession` retorna `null`, redirige a `/admin/login` via `window.location.href` | ✅ |
| 3 | Con sesión válida | Pone `checkingAuth = false` para renderizar el contenido | ✅ |
| 4 | localStorage no bypasea la seguridad | Aunque `localStorage.adminToken` tenga un valor, si no hay sesión Supabase → redirige igual | ✅ |
| 5 | Llamada única | `requireAdminSession` es llamado exactamente una vez al montar | ✅ |

---

### mesasService

**Archivo:** `src/tests/unit/mesasService.test.js`
**Módulo testeado:** `src/services/mesasService.js`

| # | Test | Función | Descripción | Resultado |
|---|---|---|---|---|
| 1 | getMesas — éxito | `getMesas` | Retorna lista de mesas | ✅ |
| 2 | getMesas — error | `getMesas` | Lanza error si Supabase falla | ✅ |
| 3 | getMesaById — existe | `getMesaById` | Retorna la mesa por ID | ✅ |
| 4 | getMesaById — no existe | `getMesaById` | Lanza error "Row not found" | ✅ |
| 5 | createMesa — éxito | `createMesa` | Crea y retorna la nueva mesa | ✅ |
| 6 | createMesa — error | `createMesa` | Lanza error si hay conflicto de clave | ✅ |
| 7 | updateMesa — éxito | `updateMesa` | Actualiza y retorna la mesa modificada | ✅ |
| 8 | updateMesa — error | `updateMesa` | Lanza error si falla la actualización | ✅ |
| 9 | cambiarEstadoMesa — bloquear | `cambiarEstadoMesa` | Estado cambia a `bloqueada` | ✅ |
| 10 | cambiarEstadoMesa — desbloquear | `cambiarEstadoMesa` | Estado cambia a `disponible` | ✅ |

---

### reservasService

**Archivo:** `src/tests/unit/reservasService.test.js`
**Módulo testeado:** `src/services/reservasService.js`

| # | Test | Función | Descripción | Resultado |
|---|---|---|---|---|
| 1 | getReservas — éxito | `getReservas` | Retorna reservas con join de mesas | ✅ |
| 2 | getReservas — error | `getReservas` | Lanza error si Supabase falla | ✅ |
| 3 | getReservasFiltradas — por fecha | `getReservasFiltradas` | Filtra por fecha correctamente | ✅ |
| 4 | getReservasFiltradas — por estado | `getReservasFiltradas` | Filtra por estado correctamente | ✅ |
| 5 | getReservasFiltradas — sin filtros | `getReservasFiltradas` | Retorna todas las reservas | ✅ |
| 6 | createReserva — éxito | `createReserva` | Crea y retorna la reserva con estado `activa` | ✅ |
| 7 | createReserva — error | `createReserva` | Lanza error si mesa no disponible | ✅ |
| 8 | cancelarReserva — éxito | `cancelarReserva` | Cambia estado a `cancelada` | ✅ |
| 9 | cancelarReserva — error | `cancelarReserva` | Lanza error si falla | ✅ |
| 10 | verificarDisponibilidad — disponible | `verificarDisponibilidad` | Retorna `true` si no hay reservas activas | ✅ |
| 11 | verificarDisponibilidad — ocupada | `verificarDisponibilidad` | Retorna `false` si existe reserva activa | ✅ |
| 12 | verificarDisponibilidad — error | `verificarDisponibilidad` | Lanza error si falla la consulta | ✅ |

---

### horariosService

**Archivo:** `src/tests/unit/horariosService.test.js`
**Módulo testeado:** `src/services/horariosService.js`

| # | Test | Función | Descripción | Resultado |
|---|---|---|---|---|
| 1 | getHorarios — éxito | `getHorarios` | Retorna todos los horarios | ✅ |
| 2 | getHorarios — error | `getHorarios` | Lanza error si Supabase falla | ✅ |
| 3 | getHorariosActivos — con datos | `getHorariosActivos` | Retorna solo los activos | ✅ |
| 4 | getHorariosActivos — vacío | `getHorariosActivos` | Retorna arreglo vacío si no hay activos | ✅ |
| 5 | getHorarioPorDia — existe | `getHorarioPorDia` | Retorna el horario del día | ✅ |
| 6 | getHorarioPorDia — no existe | `getHorarioPorDia` | Lanza "Row not found" | ✅ |
| 7 | createHorario — éxito | `createHorario` | Crea y retorna el horario | ✅ |
| 8 | createHorario — error | `createHorario` | Lanza error de constraint | ✅ |
| 9 | updateHorario — éxito | `updateHorario` | Actualiza y retorna el horario | ✅ |
| 10 | deleteHorario — éxito | `deleteHorario` | Elimina y retorna `true` | ✅ |
| 11 | deleteHorario — error | `deleteHorario` | Lanza error si falla | ✅ |
| 12 | toggleHorario — desactivar | `toggleHorario` | Pone `activo = false` | ✅ |
| 13 | toggleHorario — activar | `toggleHorario` | Pone `activo = true` | ✅ |

---

## Tests de Seguridad

**Archivo:** `src/tests/security/adminRoutes.test.jsx`

Verifican que el hook `useAdminGuard` protege correctamente las rutas admin **sin depender de localStorage**.

| # | Test | Descripción | Resultado |
|---|---|---|---|
| 1 | Rutas protegidas sin sesión | Para cada una de las 4 rutas (`/admin/dashboard`, `/reservas`, `/mesas`, `/horarios`): sin sesión Supabase → redirige a `/admin/login` | ✅ |
| 2 | localStorage no bypasea la seguridad | Aunque `localStorage.adminToken` y `localStorage['sb-session']` tengan valores falsos, la redirección ocurre igual porque el guard valida contra Supabase Auth | ✅ |
| 3 | Sesión válida → no redirige | Con `requireAdminSession` retornando datos válidos, `checkingAuth` pasa a `false` y no hay redirección | ✅ |
| 4 | Múltiples valores en localStorage | Probados 5 valores diferentes en `adminToken` (`'admin'`, `'true'`, `'1'`, token JWT falso, `'{}'`) — ninguno evita la redirección | ✅ |

**Diseño de seguridad verificado:**

```
Intento de acceso a ruta admin
         │
         ▼
useAdminGuard() se monta
         │
         ▼
requireAdminSession()  ←── Consulta Supabase Auth (NO localStorage)
         │
   ┌─────┴──────┐
   │            │
null         { session, admin }
   │            │
   ▼            ▼
redirige     checkingAuth = false
/admin/login → renderiza contenido
```

> **Conclusión de seguridad:** Manipular `localStorage` **no puede** evadir la protección de rutas. El guard siempre consulta la sesión real de Supabase Auth.

---

## Tests E2E (Playwright)

Los tests E2E se ejecutan contra la aplicación real con Playwright Chromium. El servidor de desarrollo se levanta automáticamente antes de los tests.

### public.spec.js — Página Pública

| # | Test | Descripción | Resultado |
|---|---|---|---|
| 1 | Muestra nombre del restaurante | `text=The Gordo` es visible en el Home | ✅ Pasado |
| 2 | Botón "Reservar mesa" visible | El CTA para ir a la sección de reservas está visible | ✅ Pasado |
| 3 | Formulario de reserva | Al clicar una mesa disponible (clase `cursor-pointer`) aparece el modal "Reservar Mesa #N" | ✅ Pasado (o Omitido si no hay mesas disponibles en Supabase) |

### admin.spec.js — Panel Admin (seguridad sin autenticación)

| # | Test | Descripción | Resultado |
|---|---|---|---|
| 1 | `/admin/dashboard` → login | Sin sesión activa → redirige a `/admin/login` | ✅ Pasado |
| 2 | `/admin/reservas` → login | Sin sesión activa → redirige a `/admin/login` | ✅ Pasado |
| 3 | `/admin/mesas` → login | Sin sesión activa → redirige a `/admin/login` | ✅ Pasado |
| 4 | `/admin/horarios` → login | Sin sesión activa → redirige a `/admin/login` | ✅ Pasado |
| 5 | localStorage no bypasea | Token falso en localStorage → sigue redirigiendo a `/admin/login` | ✅ Pasado |

### admin.spec.js — Panel Admin (autenticado) — requieren credenciales

Estos tests se **omiten automáticamente** si las variables `E2E_ADMIN_EMAIL` y `E2E_ADMIN_PASSWORD` no están definidas. Son seguros para CI sin secretos.

| # | Test | Descripción |
|---|---|---|
| 6 | Login exitoso → dashboard | Admin se loguea y llega al dashboard |
| 7 | Navegar a Reservas | Admin accede a `/admin/reservas` desde el sidebar |
| 8 | Navegar a Mesas | Admin accede a `/admin/mesas` |
| 9 | Navegar a Horarios | Admin accede a `/admin/horarios` |
| 10 | Popup nueva reserva | Admin abre modal de nueva reserva desde dashboard |
| 11 | Popup agregar mesa | Admin abre modal de agregar mesa en `/admin/mesas` |

Para ejecutarlos con credenciales reales:

```bash
E2E_ADMIN_EMAIL=tu@email.com E2E_ADMIN_PASSWORD=tucontraseña npm run test:e2e
```

---

## Cobertura de Código

Ejecutar con: `npm run test:coverage`

```
File               | % Stmts | % Branch | % Funcs | % Lines
-------------------|---------|----------|---------|--------
All files          |   94.36 |    88.88 |   96.55 |   98.34
 hooks             |   89.28 |    75.00 |   87.50 |   92.00
  useAdminGuard.js |   89.28 |    75.00 |   87.50 |   92.00
 services          |   95.61 |    90.00 |  100.00 |  100.00
  horariosService  |   91.42 |    78.57 |  100.00 |  100.00
  mesasService     |   96.00 |    90.00 |  100.00 |  100.00
  reservasService  |   96.66 |    92.85 |  100.00 |  100.00
```

**Líneas no cubiertas:**
- `useAdminGuard.js:10-11` — Constante `INACTIVIDAD_MS` y el `useCallback` del cierre por inactividad. No se testean porque requieren timers de 5 minutos.
- `horariosService.js:21,44,80` — Ramas de error en `.order()` con condiciones no ejercidas.

El reporte HTML se genera en `coverage/index.html` al ejecutar `npm run test:coverage`.

---

## Bug Corregido Durante el Testing

### AdminLayout.jsx — Cierre de sesión incompleto

**Archivo:** `src/components/AdminLayout.jsx`

**Antes (bug):**
```js
const handleCerrarSesion = async () => {
  localStorage.removeItem("adminToken"); // ❌ Solo borra localStorage
  navigate("/admin/login");
};
```

**Después (fix):**
```js
const handleCerrarSesion = async () => {
  await signOutAdmin(); // ✅ Cierra la sesión real en Supabase Auth
  navigate("/admin/login");
};
```

**Impacto:** Con el bug, el usuario era redirigido a `/admin/login` pero la sesión de Supabase permanecía activa. Si volvía directamente a `/admin/dashboard`, el guard `useAdminGuard` encontraba la sesión activa y le dejaba pasar sin requerir login nuevamente. Ahora `signOutAdmin()` invalida el token JWT en Supabase antes de la redirección.

---

## Variables de Entorno

Copiar `.env.example` como `.env` y completar con los valores reales:

```bash
cp .env.example .env
```

```env
# .env.example
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_publica
```

Variables adicionales para tests E2E de admin autenticado (opcionales):

```env
E2E_ADMIN_EMAIL=admin@thegordo.com
E2E_ADMIN_PASSWORD=tu_password_segura
```

> **Importante:** Nunca subir `.env` al repositorio. El `.gitignore` ya está configurado para ignorarlo.

---

## Configuración CI/CD

Ejemplo para GitHub Actions (`.github/workflows/ci.yml`):

```yaml
name: CI

on:
  push:
    branches: [main, feature/pruebas-despliegue]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Unit tests + coverage
        run: npm run test:coverage

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: E2E tests (seguridad sin auth)
        run: npm run test:e2e
        env:
          CI: true
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          # Sin E2E_ADMIN_EMAIL → tests de admin autenticado se omiten automáticamente

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Riesgos y Recomendaciones

### Riesgos identificados

| Riesgo | Severidad | Estado |
|---|---|---|
| `.env` con credenciales en historial git de `main` | Media | `.gitignore` corregido — rotar clave si es sensible |
| `react-hooks/exhaustive-deps` en Dashboard y GestionReservas | Baja | Pre-existente — puede causar re-renders incorrectos al refactorizar |
| Policy RLS `SELECT` en `admin_users` puede estar ausente | Alta | Ver SQL abajo |
| Tests de admin autenticado E2E sin credenciales en CI | Baja | Diseñados para omitirse sin credenciales |

### Policy RLS recomendada

Si el login admin falla con "Este usuario no tiene permisos de administrador" a pesar de que el usuario existe en `admin_users`, ejecutar en Supabase SQL Editor:

```sql
create policy "Admin puede leer su propio perfil"
on public.admin_users
for select
to authenticated
using (id = auth.uid());
```

### Mejoras futuras

1. **Tests de timer de inactividad** en `useAdminGuard`: usar `vi.useFakeTimers()` para simular los 5 minutos sin requerir espera real.
2. **Tests del componente `Login.jsx`**: validar que el formulario muestra error, deshabilita el botón con campos vacíos, etc.
3. **Tests del componente `FormularioReserva.jsx`**: validar campos obligatorios, formato de fecha, horarios disponibles.
4. **Smoke test E2E de deploy**: verificar que la URL de producción responde con status 200.
