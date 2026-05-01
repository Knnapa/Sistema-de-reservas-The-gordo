// src/services/horariosService.js
import { supabase } from '../supabaseClient'

// Obtener todos los horarios
export const getHorarios = async () => {
  const { data, error } = await supabase
    .from('horarios')
    .select('*')
    .order('dia_semana', { ascending: true })

  if (error) throw error
  return data
}

// Obtener solo los horarios activos (para mostrar al cliente)
export const getHorariosActivos = async () => {
  const { data, error } = await supabase
    .from('horarios')
    .select('*')
    .eq('activo', true)
    .order('dia_semana', { ascending: true })

  if (error) throw error
  return data
}

// Obtener horario de un día específico
export const getHorarioPorDia = async (dia_semana) => {
  const { data, error } = await supabase
    .from('horarios')
    .select('*')
    .eq('dia_semana', dia_semana)
    .single()

  if (error) throw error
  return data
}

// Actualizar horario de un día (admin)
export const updateHorario = async (id, cambios) => {
  const { data, error } = await supabase
    .from('horarios')
    .update(cambios)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Activar o desactivar un día (admin - el toggle)
export const toggleHorario = async (id, activo) => {
  const { data, error } = await supabase
    .from('horarios')
    .update({ activo })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}