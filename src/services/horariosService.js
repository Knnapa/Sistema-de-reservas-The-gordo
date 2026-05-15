// src/services/horariosService.js
import { supabase } from '../supabaseClient'

export const getHorarios = async () => {
  const { data, error } = await supabase
    .from('horarios')
    .select('*')
    .order('dia_semana', { ascending: true })

  if (error) throw error
  return data
}

export const getHorariosActivos = async () => {
  const { data, error } = await supabase
    .from('horarios')
    .select('*')
    .eq('activo', true)
    .order('dia_semana', { ascending: true })

  if (error) throw error
  return data
}

export const getHorarioPorDia = async (dia_semana) => {
  const { data, error } = await supabase
    .from('horarios')
    .select('*')
    .eq('dia_semana', dia_semana)
    .single()

  if (error) throw error
  return data
}

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

export async function createHorario(payload) {
  const { data, error } = await supabase
    .from("horarios")
    .insert(payload)
    .select();

  if (error) {
    console.error("🔥 ERROR SUPABASE:", error);
    throw error; // 👈 IMPORTANTE
  }

  return data;
}

export const deleteHorario = async (id) => {
  const { error } = await supabase
    .from('horarios')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

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
