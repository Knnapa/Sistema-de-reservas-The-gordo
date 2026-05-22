import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeChain } from '../helpers/supabaseMock'

vi.mock('../../supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))

import { supabase } from '../../supabaseClient'
import {
  getHorarios,
  getHorariosActivos,
  getHorarioPorDia,
  updateHorario,
  createHorario,
  deleteHorario,
  toggleHorario,
} from '../../services/horariosService'

const horarioEjemplo = {
  id: 1,
  dia_semana: 'lunes',
  hora_inicio: '12:00',
  hora_fin: '22:00',
  activo: true,
}

describe('horariosService', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('getHorarios', () => {
    it('retorna todos los horarios', async () => {
      supabase.from.mockReturnValue(makeChain({ data: [horarioEjemplo], error: null }))

      const result = await getHorarios()

      expect(result).toEqual([horarioEjemplo])
      expect(supabase.from).toHaveBeenCalledWith('horarios')
    })

    it('lanza error si Supabase falla', async () => {
      supabase.from.mockReturnValue(makeChain({ data: null, error: { message: 'db error' } }))

      await expect(getHorarios()).rejects.toMatchObject({ message: 'db error' })
    })
  })

  describe('getHorariosActivos', () => {
    it('retorna sólo los horarios con activo=true', async () => {
      supabase.from.mockReturnValue(makeChain({ data: [horarioEjemplo], error: null }))

      const result = await getHorariosActivos()

      expect(result).toEqual([horarioEjemplo])
    })

    it('retorna arreglo vacío si no hay horarios activos', async () => {
      supabase.from.mockReturnValue(makeChain({ data: [], error: null }))

      const result = await getHorariosActivos()

      expect(result).toHaveLength(0)
    })
  })

  describe('getHorarioPorDia', () => {
    it('retorna el horario de un día específico', async () => {
      supabase.from.mockReturnValue(makeChain({ data: horarioEjemplo, error: null }))

      const result = await getHorarioPorDia('lunes')

      expect(result.dia_semana).toBe('lunes')
    })

    it('lanza error si el día no tiene horario', async () => {
      supabase.from.mockReturnValue(
        makeChain({ data: null, error: { message: 'Row not found' } })
      )

      await expect(getHorarioPorDia('domingo')).rejects.toMatchObject({ message: 'Row not found' })
    })
  })

  describe('createHorario', () => {
    it('crea y retorna el nuevo horario', async () => {
      supabase.from.mockReturnValue(makeChain({ data: [horarioEjemplo], error: null }))

      const result = await createHorario({ dia_semana: 'lunes', hora_inicio: '12:00', hora_fin: '22:00' })

      expect(result).toEqual([horarioEjemplo])
    })

    it('lanza error si la inserción falla', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      supabase.from.mockReturnValue(
        makeChain({ data: null, error: { message: 'constraint error' } })
      )

      await expect(createHorario({ dia_semana: 'lunes' })).rejects.toMatchObject({
        message: 'constraint error',
      })
      errorSpy.mockRestore()
    })
  })

  describe('updateHorario', () => {
    it('actualiza y retorna el horario modificado', async () => {
      const updated = { ...horarioEjemplo, hora_fin: '23:00' }
      supabase.from.mockReturnValue(makeChain({ data: updated, error: null }))

      const result = await updateHorario(1, { hora_fin: '23:00' })

      expect(result.hora_fin).toBe('23:00')
    })
  })

  describe('deleteHorario', () => {
    it('elimina un horario y retorna true', async () => {
      supabase.from.mockReturnValue(makeChain({ data: null, error: null }))

      const result = await deleteHorario(1)

      expect(result).toBe(true)
    })

    it('lanza error si la eliminación falla', async () => {
      supabase.from.mockReturnValue(
        makeChain({ data: null, error: { message: 'delete denied' } })
      )

      await expect(deleteHorario(1)).rejects.toMatchObject({ message: 'delete denied' })
    })
  })

  describe('toggleHorario', () => {
    it('desactiva un horario activo', async () => {
      const inactivo = { ...horarioEjemplo, activo: false }
      supabase.from.mockReturnValue(makeChain({ data: inactivo, error: null }))

      const result = await toggleHorario(1, false)

      expect(result.activo).toBe(false)
    })

    it('activa un horario inactivo', async () => {
      supabase.from.mockReturnValue(makeChain({ data: horarioEjemplo, error: null }))

      const result = await toggleHorario(1, true)

      expect(result.activo).toBe(true)
    })
  })
})
