import { test, expect } from '@playwright/test'

/**
 * Pruebas funcionales — panel admin
 * Requiere que el servidor esté activo: npm run dev
 *
 * NOTA: los tests de admin autenticado (login exitoso, navegación entre páginas)
 * requieren credenciales reales en las variables de entorno:
 *   E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD
 * Sin estas variables los tests de admin autenticado se omiten.
 */

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD

// ─── Seguridad: rutas admin sin autenticar ────────────────────────────────────

test.describe('Seguridad: acceso sin autenticación', () => {
  const rutasProtegidas = [
    '/admin/dashboard',
    '/admin/reservas',
    '/admin/mesas',
    '/admin/horarios',
  ]

  for (const ruta of rutasProtegidas) {
    test(`${ruta} redirige a /admin/login sin sesión activa`, async ({ page }) => {
      // Playwright usa contextos frescos por test (sin sesión preexistente).
      // Solo limpiamos cookies por si acaso.
      await page.context().clearCookies()

      await page.goto(ruta)
      // Esperar la redirección
      await page.waitForURL('**/admin/login**', { timeout: 8000 })
      expect(page.url()).toContain('/admin/login')
    })
  }

  test('manipular localStorage no evita la redirección a /admin/login', async ({ page }) => {
    await page.context().clearCookies()
    // Primero cargar el origen para poder escribir en localStorage
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('adminToken', 'eyJhbGciOiJub25lIn0.fake')
    })

    await page.goto('/admin/dashboard')
    await page.waitForURL('**/admin/login**', { timeout: 8000 })
    expect(page.url()).toContain('/admin/login')
  })
})

// ─── Admin autenticado ────────────────────────────────────────────────────────

test.describe('Admin autenticado', () => {
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD no configuradas')

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login')
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button:has-text("Ingresar")')
    await page.waitForURL('**/admin/dashboard**', { timeout: 10000 })
  })

  test('dashboard carga correctamente después del login', async ({ page }) => {
    await expect(page).toHaveURL(/admin\/dashboard/)
    // Debe mostrar alguna sección del dashboard
    await expect(page.locator('text=Dashboard, text=Reservas').first()).toBeVisible()
  })

  test('puede navegar a la sección de Reservas', async ({ page }) => {
    await page.click('a[href="/admin/reservas"], text=Reservas')
    await expect(page).toHaveURL(/admin\/reservas/)
  })

  test('puede navegar a la sección de Mesas', async ({ page }) => {
    await page.click('a[href="/admin/mesas"], text=Mesas')
    await expect(page).toHaveURL(/admin\/mesas/)
  })

  test('puede navegar a la sección de Horarios', async ({ page }) => {
    await page.click('a[href="/admin/horarios"], text=Horarios')
    await expect(page).toHaveURL(/admin\/horarios/)
  })

  test('puede abrir popup de nueva reserva desde dashboard', async ({ page }) => {
    // Volver al dashboard si es necesario
    await page.goto('/admin/dashboard')
    const btnNuevaReserva = page.locator('button').filter({ hasText: /nueva reserva|reservar/i }).first()
    await btnNuevaReserva.click()
    // Verificar que se abre el popup/modal
    await expect(page.locator('[role="dialog"], form').first()).toBeVisible({ timeout: 4000 })
  })

  test('puede abrir popup de agregar mesa', async ({ page }) => {
    await page.goto('/admin/mesas')
    const btnAgregarMesa = page.locator('button').filter({ hasText: /agregar|nueva mesa/i }).first()
    await btnAgregarMesa.click()
    await expect(page.locator('[role="dialog"], form').first()).toBeVisible({ timeout: 4000 })
  })
})
