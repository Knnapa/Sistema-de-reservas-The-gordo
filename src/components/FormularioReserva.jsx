// src/components/FormularioReserva.jsx
import { useState, useEffect } from 'react'
import { createReserva, verificarDisponibilidad } from '../services/reservasService'
import { getHorariosActivos } from '../services/horariosService'

function FormularioReserva({ mesa, onCerrar, onExito }) {
  const [horarios, setHorarios] = useState([])
  const [confirmado, setConfirmado] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const diasSemana = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']

  const [form, setForm] = useState({
    fecha: '',
    hora: '',
    num_personas: '',
    cliente_nombre: '',
    cliente_tel: '',
    cliente_email: ''
  })

  useEffect(() => {
    getHorariosActivos().then(setHorarios)
  }, [])

  const getHorasDisponibles = () => {
    if (!form.fecha) return []
    const dia = diasSemana[new Date(form.fecha + 'T00:00:00').getDay()]
    const horario = horarios.find(h => h.dia_semana === dia)
    if (!horario) return []
    const horas = []
    const [hInicio] = horario.hora_inicio.split(':').map(Number)
    const [hFin] = horario.hora_fin.split(':').map(Number)
    for (let h = hInicio; h < hFin; h++) {
      horas.push(`${String(h).padStart(2, '0')}:00`)
    }
    return horas
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const formularioValido = () => {
    const emailValido = /^[^@]+@[^@]+\.[^@]+$/.test(form.cliente_email)
    return (
      form.fecha &&
      form.hora &&
      form.num_personas &&
      form.cliente_nombre &&
      form.cliente_tel &&
      emailValido &&
      Number(form.num_personas) <= mesa.capacidad &&
      Number(form.num_personas) > 0
    )
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const disponible = await verificarDisponibilidad(mesa.id, form.fecha, form.hora)
      if (!disponible) {
        setError('Esta mesa ya fue reservada en ese horario. Por favor elige otra mesa u horario.')
        setLoading(false)
        return
      }
      await createReserva({
        mesa_id: mesa.id,
        fecha: form.fecha,
        hora: form.hora,
        num_personas: Number(form.num_personas),
        cliente_nombre: form.cliente_nombre,
        cliente_tel: form.cliente_tel,
        cliente_email: form.cliente_email,
        estado: 'activa'
      })
      setConfirmado(true)
    } catch (err) {
      setError('Ocurrió un error al confirmar la reserva. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (confirmado) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-teal mb-2">¡Reserva confirmada!</h2>
          <p className="text-gray-500 mb-6">Tu reserva ha sido registrada exitosamente.</p>
          <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-2">
            <p className="text-sm text-gray-600">🍽️ <strong>Mesa:</strong> {mesa.numero} — {mesa.ubicacion}</p>
            <p className="text-sm text-gray-600">📅 <strong>Fecha:</strong> {form.fecha}</p>
            <p className="text-sm text-gray-600">🕐 <strong>Hora:</strong> {form.hora}</p>
            <p className="text-sm text-gray-600">👤 <strong>Cliente:</strong> {form.cliente_nombre}</p>
            <p className="text-sm text-gray-600">👥 <strong>Personas:</strong> {form.num_personas}</p>
          </div>
          <button
            onClick={onExito}
            className="w-full bg-cyan text-white py-3 rounded-xl font-semibold hover:bg-teal transition-colors"
          >
            Volver al salón
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold text-teal mb-1">
          Reservar Mesa #{mesa.numero}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Capacidad: {mesa.capacidad} personas · {mesa.ubicacion}
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Fecha</label>
            <input
              type="date"
              name="fecha"
              min={new Date().toISOString().split('T')[0]}
              value={form.fecha}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Hora</label>
            <select
              name="hora"
              value={form.hora}
              onChange={handleChange}
              disabled={!form.fecha}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan"
            >
              <option value="">Selecciona una hora</option>
              {getHorasDisponibles().map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            {form.fecha && getHorasDisponibles().length === 0 && (
              <p className="text-red-500 text-xs mt-1">No hay horario disponible para ese día</p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">
              Número de personas (máx. {mesa.capacidad})
            </label>
            <input
              type="number"
              name="num_personas"
              min="1"
              max={mesa.capacidad}
              value={form.num_personas}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Nombre completo</label>
            <input
              type="text"
              name="cliente_nombre"
              value={form.cliente_nombre}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Teléfono</label>
            <input
              type="tel"
              name="cliente_tel"
              value={form.cliente_tel}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Correo electrónico</label>
            <input
              type="email"
              name="cliente_email"
              value={form.cliente_email}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-3">{error}</p>
        )}

        <div className="flex gap-3 mt-5">
          <button
            onClick={handleSubmit}
            disabled={!formularioValido() || loading}
            className={`flex-1 py-3 rounded-xl font-semibold text-white transition-colors ${
              formularioValido() && !loading
                ? 'bg-cyan hover:bg-teal cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {loading ? 'Confirmando...' : 'Confirmar reserva'}
          </button>
          <button
            onClick={onCerrar}
            className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default FormularioReserva