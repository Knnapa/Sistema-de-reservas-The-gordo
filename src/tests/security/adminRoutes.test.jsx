/**
 * Pruebas de seguridad: rutas admin protegidas
 *
 * Verifican que useAdminGuard redirige a /admin/login cuando:
 * - No hay sesión activa en Supabase Auth.
 * - Hay un token falso en localStorage (intento de evasión).
 *
 * Nota: el guard usa window.location.href (no React Router navigate) para la
 * redirección forzada, por lo que se espía window.location.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import useAdminGuard from '../../hooks/useAdminGuard'

vi.mock('../../services/adminAuthService', () => ({
  requireAdminSession: vi.fn(),
  signOutAdmin: vi.fn().mockResolvedValue(undefined),
}))

import { requireAdminSession } from '../../services/adminAuthService'

const RUTAS_PROTEGIDAS = [
  '/admin/dashboard',
  '/admin/reservas',
  '/admin/mesas',
  '/admin/horarios',
]

describe('Seguridad de rutas admin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('location', { href: '' })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('redirige a /admin/login cuando no hay sesión (sin importar la ruta intentada)', async () => {
    requireAdminSession.mockResolvedValue(null)

    for (const ruta of RUTAS_PROTEGIDAS) {
      vi.stubGlobal('location', { href: ruta })

      const { unmount } = renderHook(() => useAdminGuard())

      await waitFor(() => {
        expect(window.location.href).toBe('/admin/login')
      })

      unmount()
    }
  })

  it('manipular localStorage NO permite evadir la redirección a /admin/login', async () => {
    requireAdminSession.mockResolvedValue(null)
    // Simula un atacante que pone un token en localStorage esperando saltarse la validación
    localStorage.setItem('adminToken', 'eyJhbGciOiJub25lIn0.fake.payload')
    localStorage.setItem('sb-session', JSON.stringify({ access_token: 'fake' }))

    renderHook(() => useAdminGuard())

    await waitFor(() => {
      expect(window.location.href).toBe('/admin/login')
    })
    // La verificación debe haberse hecho contra Supabase Auth, no localStorage
    expect(requireAdminSession).toHaveBeenCalled()
  })

  it('NO redirige si requireAdminSession retorna una sesión válida de admin', async () => {
    requireAdminSession.mockResolvedValue({
      session: { user: { id: 'uid-123' } },
      admin: { id: 'uid-123', email: 'admin@thegordo.com' },
    })

    const { result } = renderHook(() => useAdminGuard())

    await waitFor(() => {
      expect(result.current).toBe(false)
    })

    // No hubo redirección
    expect(window.location.href).not.toContain('/admin/login')
  })

  it('redirige aunque localStorage tenga adminToken con cualquier valor', async () => {
    requireAdminSession.mockResolvedValue(null)

    const intentos = ['admin', 'true', '1', 'eyJtoken.fake', '{}']
    for (const valor of intentos) {
      localStorage.setItem('adminToken', valor)
      vi.stubGlobal('location', { href: '' })

      const { unmount } = renderHook(() => useAdminGuard())

      await waitFor(() => {
        expect(window.location.href).toBe('/admin/login')
      })

      unmount()
    }
  })
})
