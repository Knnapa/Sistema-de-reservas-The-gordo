import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeChain } from '../helpers/supabaseMock'

vi.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}))

import { supabase } from '../../supabaseClient'
import {
  getAdminProfile,
  signInAdmin,
  requireAdminSession,
  signOutAdmin,
} from '../../services/adminAuthService'

describe('adminAuthService', () => {
  beforeEach(() => vi.clearAllMocks())

  // ─── getAdminProfile ────────────────────────────────────────────────────────

  describe('getAdminProfile', () => {
    it('devuelve el perfil cuando el usuario existe en admin_users', async () => {
      const adminData = { id: 'uid-123', email: 'admin@thegordo.com' }
      supabase.from.mockReturnValue(
        makeChain({ data: adminData, error: null })
      )

      const result = await getAdminProfile('uid-123')

      expect(result).toEqual(adminData)
      expect(supabase.from).toHaveBeenCalledWith('admin_users')
    })

    it('devuelve null cuando el usuario no está en admin_users', async () => {
      supabase.from.mockReturnValue(makeChain({ data: null, error: null }))

      const result = await getAdminProfile('no-admin')
      expect(result).toBeNull()
    })

    it('devuelve null y loguea el error cuando Supabase falla', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      supabase.from.mockReturnValue(
        makeChain({ data: null, error: { message: 'permission denied' } })
      )

      const result = await getAdminProfile('uid-123')

      expect(result).toBeNull()
      expect(errorSpy).toHaveBeenCalled()
      errorSpy.mockRestore()
    })
  })

  // ─── signInAdmin ─────────────────────────────────────────────────────────────

  describe('signInAdmin', () => {
    it('retorna user y admin cuando las credenciales son válidas y el usuario es admin', async () => {
      const user = { id: 'uid-123', email: 'admin@thegordo.com' }
      const adminData = { id: 'uid-123', email: 'admin@thegordo.com' }

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user, session: {} },
        error: null,
      })
      supabase.from.mockReturnValue(makeChain({ data: adminData, error: null }))

      const result = await signInAdmin('admin@thegordo.com', 'pass1234')

      expect(result.user).toEqual(user)
      expect(result.admin).toEqual(adminData)
    })

    it('lanza error cuando las credenciales son inválidas', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      })

      await expect(signInAdmin('malo@test.com', 'incorrecta')).rejects.toThrow(
        'Correo o contraseña incorrectos.'
      )
    })

    it('lanza error y cierra sesión cuando el usuario no está en admin_users', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'uid-999' }, session: {} },
        error: null,
      })
      supabase.from.mockReturnValue(makeChain({ data: null, error: null }))
      supabase.auth.signOut.mockResolvedValue({ error: null })

      await expect(signInAdmin('noadmin@test.com', 'pass123')).rejects.toThrow(
        'Este usuario no tiene permisos de administrador.'
      )
      expect(supabase.auth.signOut).toHaveBeenCalled()
    })
  })

  // ─── requireAdminSession ─────────────────────────────────────────────────────

  describe('requireAdminSession', () => {
    it('retorna session y admin cuando hay sesión activa y el usuario es admin', async () => {
      const session = { user: { id: 'uid-123' } }
      const adminData = { id: 'uid-123', email: 'admin@thegordo.com' }

      supabase.auth.getSession.mockResolvedValue({ data: { session }, error: null })
      supabase.from.mockReturnValue(makeChain({ data: adminData, error: null }))

      const result = await requireAdminSession()

      expect(result).toEqual({ session, admin: adminData })
    })

    it('retorna null cuando no hay sesión activa', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const result = await requireAdminSession()
      expect(result).toBeNull()
    })

    it('retorna null y cierra sesión cuando la sesión existe pero el usuario no es admin', async () => {
      const session = { user: { id: 'uid-noAdmin' } }
      supabase.auth.getSession.mockResolvedValue({ data: { session }, error: null })
      supabase.from.mockReturnValue(makeChain({ data: null, error: null }))
      supabase.auth.signOut.mockResolvedValue({ error: null })

      const result = await requireAdminSession()

      expect(result).toBeNull()
      expect(supabase.auth.signOut).toHaveBeenCalled()
    })

    it('retorna null cuando getSession devuelve error', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'network error' },
      })

      const result = await requireAdminSession()
      expect(result).toBeNull()
    })
  })

  // ─── signOutAdmin ─────────────────────────────────────────────────────────────

  describe('signOutAdmin', () => {
    it('llama a supabase.auth.signOut', async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null })

      await signOutAdmin()

      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1)
    })
  })
})
