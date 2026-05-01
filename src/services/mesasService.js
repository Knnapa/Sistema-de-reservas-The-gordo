// src/services/mesasService.js
import { supabase } from '../supabaseClient'

// Obtener todas las mesas
export const getMesas = async () => {
  const { data, error } = await supabase
    .from('mesas')
    .select('*')
    .order('numero', { ascending: true })

  if (error) throw error
  return data
}

// Obtener una mesa por ID
export const getMesaById = async (id) => {
  const { data, error } = await supabase
    .from('mesas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Crear una nueva mesa (admin)
export const createMesa = async (mesa) => {
  const { data, error } = await supabase
    .from('mesas')
    .insert([mesa])
    .select()
    .single()

  if (error) throw error
  return data
}

// Editar una mesa existente (admin)
export const updateMesa = async (id, cambios) => {
  const { data, error } = await supabase
    .from('mesas')
    .update(cambios)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Bloquear o desbloquear una mesa (admin)
export const cambiarEstadoMesa = async (id, estado) => {
  const { data, error } = await supabase
    .from('mesas')
    .update({ estado })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}