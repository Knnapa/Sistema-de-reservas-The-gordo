import { useEffect } from 'react'
import { getHorarios, getHorariosActivos } from './services/horariosService'

function App() {

  useEffect(() => {
    // Prueba 1: traer todos los horarios
    getHorarios().then(data => console.log('HORARIOS:', data))
    
    // Prueba 2: traer solo los horarios activos
    getHorariosActivos().then(data => console.log('HORARIOS ACTIVOS:', data))
  }, [])

  return (
    <div>
      <h1>Sistema de Reservas</h1>
    </div>
  )
}

export default App