import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeChain } from '../helpers/supabaseMock'

vi.mock('../../supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

import { supabase } from '../../supabaseClient'
import {
  getMesas,
  getMesaById,
  createMesa,
  updateMesa,
  cambiarEstadoMesa,
} from '../../services/mesasService'

const mesaEjemplo = { id: 1, numero: 1, capacidad: 4, ubicacion: 'terraza', estado: 'disponible' }

describe('mesasService', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('getMesas', () => {
    it('retorna la lista de mesas ordenada', async () => {
      supabase.from.mockReturnValue(makeChain({ data: [mesaEjemplo], error: null }))

      const result = await getMesas()

      expect(result).toEqual([mesaEjemplo])
      expect(supabase.from).toHaveBeenCalledWith('mesas')
    })

    it('lanza error cuando Supabase falla', async () => {
      supabase.from.mockReturnValue(makeChain({ data: null, error: { message: 'db error' } }))

      await expect(getMesas()).rejects.toMatchObject({ message: 'db error' })
    })
  })

  describe('getMesaById', () => {
    it('retorna una mesa por id', async () => {
      supabase.from.mockReturnValue(makeChain({ data: mesaEjemplo, error: null }))

      const result = await getMesaById(1)

      expect(result).toEqual(mesaEjemplo)
    })

    it('lanza error cuando la mesa no existe', async () => {
      supabase.from.mockReturnValue(
        makeChain({ data: null, error: { message: 'Row not found' } })
      )

      await expect(getMesaById(999)).rejects.toMatchObject({ message: 'Row not found' })
    })
  })

  describe('createMesa', () => {
    it('crea y retorna la nueva mesa', async () => {
      supabase.from.mockReturnValue(makeChain({ data: mesaEjemplo, error: null }))

      const result = await createMesa({ numero: 1, capacidad: 4, ubicacion: 'terraza' })

      expect(result).toEqual(mesaEjemplo)
    })

    it('lanza error si la inserción falla', async () => {
      supabase.from.mockReturnValue(
        makeChain({ data: null, error: { message: 'duplicate key' } })
      )

      await expect(createMesa({ numero: 1 })).rejects.toMatchObject({ message: 'duplicate key' })
    })
  })

  describe('updateMesa', () => {
    it('actualiza y retorna la mesa modificada', async () => {
      const updated = { ...mesaEjemplo, capacidad: 6 }
      supabase.from.mockReturnValue(makeChain({ data: updated, error: null }))

      const result = await updateMesa(1, { capacidad: 6 })

      expect(result.capacidad).toBe(6)
    })

    it('lanza error si la actualización falla', async () => {
      supabase.from.mockReturnValue(
        makeChain({ data: null, error: { message: 'update failed' } })
      )

      await expect(updateMesa(1, { capacidad: 6 })).rejects.toMatchObject({ message: 'update failed' })
    })
  })

  describe('cambiarEstadoMesa', () => {
    it('bloquea una mesa (estado → bloqueada)', async () => {
      const blocked = { ...mesaEjemplo, estado: 'bloqueada' }
      supabase.from.mockReturnValue(makeChain({ data: blocked, error: null }))

      const result = await cambiarEstadoMesa(1, 'bloqueada')

      expect(result.estado).toBe('bloqueada')
    })

    it('desbloquea una mesa (estado → disponible)', async () => {
      const available = { ...mesaEjemplo, estado: 'disponible' }
      supabase.from.mockReturnValue(makeChain({ data: available, error: null }))

      const result = await cambiarEstadoMesa(1, 'disponible')

      expect(result.estado).toBe('disponible')
    })
  })
})
