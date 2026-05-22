import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeChain } from '../helpers/supabaseMock'

vi.mock('../../supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

import { supabase } from '../../supabaseClient'
import {
  getReservas,
  getReservasFiltradas,
  createReserva,
  cancelarReserva,
  verificarDisponibilidad,
} from '../../services/reservasService'

const reservaEjemplo = {
  id: 1,
  mesa_id: 1,
  fecha: '2025-06-01',
  hora: '13:00',
  estado: 'activa',
  nombre_cliente: 'Juan',
  mesas: { numero: 1, ubicacion: 'terraza' },
}

describe('reservasService', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('getReservas', () => {
    it('retorna todas las reservas con info de mesa', async () => {
      supabase.from.mockReturnValue(makeChain({ data: [reservaEjemplo], error: null }))

      const result = await getReservas()

      expect(result).toHaveLength(1)
      expect(result[0].mesas.numero).toBe(1)
    })

    it('lanza error si Supabase falla', async () => {
      supabase.from.mockReturnValue(makeChain({ data: null, error: { message: 'db error' } }))

      await expect(getReservas()).rejects.toMatchObject({ message: 'db error' })
    })
  })

  describe('getReservasFiltradas', () => {
    it('retorna reservas filtradas por fecha', async () => {
      supabase.from.mockReturnValue(makeChain({ data: [reservaEjemplo], error: null }))

      const result = await getReservasFiltradas({ fecha: '2025-06-01', estado: null })

      expect(result).toEqual([reservaEjemplo])
    })

    it('retorna reservas filtradas por estado', async () => {
      const cancelada = { ...reservaEjemplo, estado: 'cancelada' }
      supabase.from.mockReturnValue(makeChain({ data: [cancelada], error: null }))

      const result = await getReservasFiltradas({ fecha: null, estado: 'cancelada' })

      expect(result[0].estado).toBe('cancelada')
    })

    it('retorna todas las reservas si no hay filtros', async () => {
      supabase.from.mockReturnValue(makeChain({ data: [reservaEjemplo], error: null }))

      const result = await getReservasFiltradas({ fecha: null, estado: null })

      expect(result).toHaveLength(1)
    })
  })

  describe('createReserva', () => {
    it('crea y retorna la nueva reserva', async () => {
      supabase.from.mockReturnValue(makeChain({ data: reservaEjemplo, error: null }))

      const result = await createReserva({
        mesa_id: 1,
        fecha: '2025-06-01',
        hora: '13:00',
        nombre_cliente: 'Juan',
      })

      expect(result.id).toBe(1)
      expect(result.estado).toBe('activa')
    })

    it('lanza error si la inserción falla', async () => {
      supabase.from.mockReturnValue(
        makeChain({ data: null, error: { message: 'mesa no disponible' } })
      )

      await expect(createReserva({ mesa_id: 1 })).rejects.toMatchObject({
        message: 'mesa no disponible',
      })
    })
  })

  describe('cancelarReserva', () => {
    it('cambia el estado de la reserva a cancelada', async () => {
      const cancelada = { ...reservaEjemplo, estado: 'cancelada' }
      supabase.from.mockReturnValue(makeChain({ data: cancelada, error: null }))

      const result = await cancelarReserva(1)

      expect(result.estado).toBe('cancelada')
    })

    it('lanza error si Supabase falla', async () => {
      supabase.from.mockReturnValue(
        makeChain({ data: null, error: { message: 'update error' } })
      )

      await expect(cancelarReserva(1)).rejects.toMatchObject({ message: 'update error' })
    })
  })

  describe('verificarDisponibilidad', () => {
    it('retorna true cuando la mesa está disponible (sin reservas activas)', async () => {
      supabase.from.mockReturnValue(makeChain({ data: [], error: null }))

      const disponible = await verificarDisponibilidad(1, '2025-06-01', '13:00')

      expect(disponible).toBe(true)
    })

    it('retorna false cuando la mesa está ocupada (existe reserva activa)', async () => {
      supabase.from.mockReturnValue(makeChain({ data: [{ id: 1 }], error: null }))

      const disponible = await verificarDisponibilidad(1, '2025-06-01', '13:00')

      expect(disponible).toBe(false)
    })

    it('lanza error si Supabase falla', async () => {
      supabase.from.mockReturnValue(
        makeChain({ data: null, error: { message: 'query error' } })
      )

      await expect(verificarDisponibilidad(1, '2025-06-01', '13:00')).rejects.toMatchObject({
        message: 'query error',
      })
    })
  })
})
