import { test, expect } from '@playwright/test'

/**
 * Pruebas funcionales — usuario público (sin autenticación)
 * Requiere que el servidor esté activo: npm run dev
 */

test.describe('Página pública — Home', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('muestra el nombre del restaurante', async ({ page }) => {
    await expect(page.locator('text=The Gordo').first()).toBeVisible()
  })

  test('muestra sección de reservas o botón para reservar', async ({ page }) => {
    // El formulario o CTA de reserva debe estar visible
    const reservarBtn = page.locator('button, a').filter({ hasText: /reservar/i }).first()
    await expect(reservarBtn).toBeVisible()
  })

  test('puede abrir el formulario de reserva al clicar una mesa disponible', async ({ page }) => {
    // Las mesas disponibles tienen clase cursor-pointer (ver getEstiloMesa en Home.jsx)
    const mesaDisponible = page.locator('.cursor-pointer').first()

    // Si no hay mesas disponibles en el entorno de test, omitir
    const count = await mesaDisponible.count()
    if (count === 0) {
      test.skip('No hay mesas disponibles en el entorno de test')
      return
    }

    await mesaDisponible.waitFor({ timeout: 8000 })
    await mesaDisponible.click()

    // El formulario muestra h2 "Reservar Mesa #N"
    await expect(
      page.locator('h2').filter({ hasText: /Reservar Mesa/i })
    ).toBeVisible({ timeout: 5000 })
  })
})
