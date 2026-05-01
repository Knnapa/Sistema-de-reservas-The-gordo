// src/services/reservasService.js
import { supabase } from '../supabaseClient'

// Obtener todas las reservas (admin)
export const getReservas = async () => {
  const { data, error } = await supabase
    .from('reservas')
    .select(`
      *,
      mesas (numero, ubicacion)
    `)
    .order('fecha', { ascending: true })

  if (error) throw error
  return data
}

// Obtener reservas filtradas por fecha y/o estado (admin)
export const getReservasFiltradas = async ({ fecha, estado }) => {
  let query = supabase
    .from('reservas')
    .select(`
      *,
      mesas (numero, ubicacion)
    `)

  if (fecha) query = query.eq('fecha', fecha)
  if (estado) query = query.eq('estado', estado)

  const { data, error } = await query.order('hora', { ascending: true })

  if (error) throw error
  return data
}

// Crear una reserva (cliente)
export const createReserva = async (reserva) => {
  const { data, error } = await supabase
    .from('reservas')
    .insert([reserva])
    .select()
    .single()

  if (error) throw error
  return data
}

// Cancelar una reserva (admin)
export const cancelarReserva = async (id) => {
  const { data, error } = await supabase
    .from('reservas')
    .update({ estado: 'cancelada' })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Verificar disponibilidad de una mesa en fecha y hora (cliente)
export const verificarDisponibilidad = async (mesa_id, fecha, hora) => {
  const { data, error } = await supabase
    .from('reservas')
    .select('id')
    .eq('mesa_id', mesa_id)
    .eq('fecha', fecha)
    .eq('hora', hora)
    .eq('estado', 'activa')

  if (error) throw error
  return data.length === 0 // true = disponible, false = ocupada
}