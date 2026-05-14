// src/pages/admin/GestionMesas.jsx
import { useState, useEffect } from "react";
import {
  getMesas,
  createMesa,
  updateMesa,
  cambiarEstadoMesa,
} from "../../services/mesasService";

// Guard: si no está autenticado, redirigir al login
function useAdminGuard() {
  useEffect(() => {
    if (!localStorage.getItem("admin_auth")) {
      window.location.href = "/admin";
    }
  }, []);
}

function GestionMesas() {
  useAdminGuard();

  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado del modal (null = cerrado, "crear" = crear nueva, objeto = editar)
  const [modal, setModal] = useState(null);

  // Datos del formulario del modal
  const [form, setForm] = useState({
    numero: "",
    capacidad: "",
    ubicacion: "",
    estado: "disponible",
  });

  const [errorModal, setErrorModal] = useState("");
  const [loadingModal, setLoadingModal] = useState(false);

  // Cargar mesas al iniciar
  useEffect(() => {
    cargarMesas();
  }, []);

  const cargarMesas = async () => {
    try {
      setLoading(true);
      const data = await getMesas();
      setMesas(data);
    } catch (error) {
      console.error("Error cargando mesas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para CREAR una mesa nueva (formulario vacío)
  const abrirCrear = () => {
    setForm({ numero: "", capacidad: "", ubicacion: "", estado: "disponible" });
    setErrorModal("");
    setModal("crear");
  };

  // Abrir modal para EDITAR una mesa (formulario con datos de la mesa)
  const abrirEditar = (mesa) => {
    setForm({
      numero: mesa.numero,
      capacidad: mesa.capacidad,
      ubicacion: mesa.ubicacion,
      estado: mesa.estado,
    });
    setErrorModal("");
    setModal(mesa); // guardamos el objeto mesa para saber el id
  };

  // Cerrar modal
  const cerrarModal = () => {
    setModal(null);
    setErrorModal("");
  };

  // Manejar cambios en los inputs del formulario del modal
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorModal("");
  };

  // Validar que el formulario del modal esté completo
  const formularioValido = () => {
    return (
      form.numero &&
      form.capacidad &&
      form.ubicacion &&
      Number(form.capacidad) > 0 &&
      Number(form.numero) > 0
    );
  };

  // Guardar (crear o editar según el estado del modal)
  const handleGuardar = async () => {
    setLoadingModal(true);
    setErrorModal("");
    try {
      if (modal === "crear") {
        // Crear mesa nueva
        await createMesa({
          numero: Number(form.numero),
          capacidad: Number(form.capacidad),
          ubicacion: form.ubicacion,
          estado: form.estado,
        });
      } else {
        // Editar mesa existente (modal tiene el objeto mesa con el id)
        await updateMesa(modal.id, {
          numero: Number(form.numero),
          capacidad: Number(form.capacidad),
          ubicacion: form.ubicacion,
          estado: form.estado,
        });
      }
      await cargarMesas(); // recargar lista
      cerrarModal();
    } catch (error) {
      console.error("Error guardando mesa:", error);
      setErrorModal("Ocurrió un error al guardar. Intenta de nuevo.");
    } finally {
      setLoadingModal(false);
    }
  };

  // Cambiar estado de una mesa directamente desde la tarjeta
  const handleCambiarEstado = async (mesa, nuevoEstado) => {
    try {
      await cambiarEstadoMesa(mesa.id, nuevoEstado);
      // Actualizar en el estado local sin recargar todo
      setMesas((prev) =>
        prev.map((m) => (m.id === mesa.id ? { ...m, estado: nuevoEstado } : m))
      );
    } catch (error) {
      console.error("Error cambiando estado:", error);
    }
  };

  // Colores y textos según el estado de la mesa
  const getEstiloMesa = (estado) => {
    if (estado === "disponible") return "bg-green-50 border-green-300";
    if (estado === "ocupada") return "bg-red-50 border-red-300";
    if (estado === "bloqueada") return "bg-gray-100 border-gray-300";
    return "bg-gray-50 border-gray-200";
  };

  const getBadgeEstado = (estado) => {
    if (estado === "disponible")
      return <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">Disponible</span>;
    if (estado === "ocupada")
      return <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">Ocupada</span>;
    if (estado === "bloqueada")
      return <span className="bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">Bloqueada</span>;
  };

  // Contadores para el resumen superior
  const disponibles = mesas.filter((m) => m.estado === "disponible").length;
  const ocupadas = mesas.filter((m) => m.estado === "ocupada").length;
  const bloqueadas = mesas.filter((m) => m.estado === "bloqueada").length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-chocolate">Gestión de Mesas</h1>
          <p className="text-gray-400 text-sm mt-1">
            Administra las mesas del restaurante
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="bg-cyan text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-teal transition-colors text-sm"
        >
          + Agregar mesa
        </button>
      </div>

      {/* Contadores resumen */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{disponibles}</div>
          <div className="text-green-700 text-sm font-medium mt-1">Disponibles</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-red-500">{ocupadas}</div>
          <div className="text-red-600 text-sm font-medium mt-1">Ocupadas</div>
        </div>
        <div className="bg-gray-100 border border-gray-200 rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-gray-500">{bloqueadas}</div>
          <div className="text-gray-600 text-sm font-medium mt-1">Bloqueadas</div>
        </div>
      </div>

      {/* Lista de mesas */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mesas.map((mesa) => (
            <div
              key={mesa.id}
              className={`border-2 rounded-2xl p-5 ${getEstiloMesa(mesa.estado)}`}
            >
              {/* Info de la mesa */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Mesa #{mesa.numero}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    👥 {mesa.capacidad} personas
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    📍 {mesa.ubicacion}
                  </p>
                </div>
                {getBadgeEstado(mesa.estado)}
              </div>

              {/* Cambiar estado rápido */}
              <div className="mb-3">
                <label className="text-xs text-gray-400 block mb-1">
                  Cambiar estado:
                </label>
                <select
                  value={mesa.estado}
                  onChange={(e) => handleCambiarEstado(mesa, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-cyan bg-white"
                >
                  <option value="disponible">Disponible</option>
                  <option value="ocupada">Ocupada</option>
                  <option value="bloqueada">Bloqueada</option>
                </select>
              </div>

              {/* Botón editar */}
              <button
                onClick={() => abrirEditar(mesa)}
                className="w-full bg-white border border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors font-medium"
              >
                ✏️ Editar mesa
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      {modal !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4 backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-lg font-bold text-chocolate mb-4">
              {modal === "crear" ? "Agregar nueva mesa" : `Editar Mesa #${modal.numero}`}
            </h2>

            <div className="space-y-3">
            {/* Número de mesa */}
            <div>
            <label className="text-xs text-gray-500 block mb-1">
                Número de mesa
            </label>
            <input
                type="number"
                name="numero"
                value={form.numero}
                onChange={handleFormChange}
                onKeyDown={(e) => {
                if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
                }}
                min="1"
                placeholder="Ej: 5"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan"
            />
            </div>

             {/* Capacidad */}
            <div>
            <label className="text-xs text-gray-500 block mb-1">
                Capacidad (personas)
            </label>
            <input
                type="number"
                name="capacidad"
                value={form.capacidad}
                onChange={handleFormChange}
                onKeyDown={(e) => {
                if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
                }}
                min="1"
                placeholder="Ej: 4"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan"
            />
            </div>

              {/* Ubicación */}
                <div>
                <label className="text-xs text-gray-500 block mb-1">
                    Ubicación
                </label>
                <select
                    name="ubicacion"
                    value={form.ubicacion}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan"
                >
                    <option value="">Selecciona una ubicación</option>
                    <option value="zona ventana">Zona Ventana</option>
                    <option value="zona central">Zona Central</option>
                    <option value="terraza">Terraza</option>
                </select>
                </div>

              {/* Estado inicial */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Estado
                </label>
                <select
                  name="estado"
                  value={form.estado}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan"
                >
                  <option value="disponible">Disponible</option>
                  <option value="ocupada">Ocupada</option>
                  <option value="bloqueada">Bloqueada</option>
                </select>
              </div>

              {errorModal && (
                <p className="text-red-500 text-sm">{errorModal}</p>
              )}
            </div>

            {/* Botones del modal */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleGuardar}
                disabled={!formularioValido() || loadingModal}
                className={`flex-1 py-3 rounded-xl font-semibold text-white transition-colors ${
                  formularioValido() && !loadingModal
                    ? "bg-cyan hover:bg-teal cursor-pointer"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {loadingModal ? "Guardando..." : "Guardar"}
              </button>
              <button
                onClick={cerrarModal}
                className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionMesas;