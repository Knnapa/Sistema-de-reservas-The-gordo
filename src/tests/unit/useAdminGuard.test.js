import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import useAdminGuard from '../../hooks/useAdminGuard'

vi.mock('../../services/adminAuthService', () => ({
  requireAdminSession: vi.fn(),
  signOutAdmin: vi.fn().mockResolvedValue(undefined),
}))

import { requireAdminSession } from '../../services/adminAuthService'

describe('useAdminGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // jsdom no permite sobreescribir window.location directamente
    vi.stubGlobal('location', { href: '' })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('empieza en estado checkingAuth=true', () => {
    requireAdminSession.mockResolvedValue(null)
    const { result } = renderHook(() => useAdminGuard())
    expect(result.current).toBe(true)
  })

  it('redirige a /admin/login cuando no hay sesión activa', async () => {
    requireAdminSession.mockResolvedValue(null)

    renderHook(() => useAdminGuard())

    await waitFor(() => {
      expect(window.location.href).toBe('/admin/login')
    })
  })

  it('pone checkingAuth=false cuando la sesión es válida', async () => {
    requireAdminSession.mockResolvedValue({
      session: { user: { id: 'uid-123' } },
      admin: { id: 'uid-123', email: 'admin@thegordo.com' },
    })

    const { result } = renderHook(() => useAdminGuard())

    await waitFor(() => {
      expect(result.current).toBe(false)
    })
  })

  it('NO permite evadir la seguridad con localStorage — redirige igual', async () => {
    requireAdminSession.mockResolvedValue(null)
    localStorage.setItem('adminToken', 'token-falso')

    renderHook(() => useAdminGuard())

    await waitFor(() => {
      expect(window.location.href).toBe('/admin/login')
    })

    localStorage.removeItem('adminToken')
  })

  it('llama a requireAdminSession exactamente una vez al montar', async () => {
    requireAdminSession.mockResolvedValue({
      session: { user: { id: 'uid-123' } },
      admin: { id: 'uid-123', email: 'admin@test.com' },
    })

    renderHook(() => useAdminGuard())

    await waitFor(() => expect(requireAdminSession).toHaveBeenCalledTimes(1))
  })
})
