import { useState, useEffect } from "react";
import {
  getHorarios,
  toggleHorario,
  updateHorario,
  createHorario,
  deleteHorario,
} from "../../services/horariosService";
import AdminLayout from "../../components/AdminLayout";
import useAdminGuard from "../../hooks/useAdminGuard";

const ORDEN_DIAS = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
];

const FORM_INICIAL = {
  dia_semana: "lunes",
  hora_inicio: "16:00",
  hora_fin: "00:30",
  activo: true,
};

function horaCorta(value, fallback) {
  return value ? value.slice(0, 5) : fallback;
}

function GestionHorarios() {
  const checkingAuth = useAdminGuard();

  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [errorModal, setErrorModal] = useState("");

  async function cargarHorarios() {
    setLoading(true);
    try {
      const data = await getHorarios();
      const ordenados = [...data].sort(
        (a, b) =>
          ORDEN_DIAS.indexOf(a.dia_semana) - ORDEN_DIAS.indexOf(b.dia_semana),
      );
      setHorarios(ordenados);
    } catch (error) {
      console.error("Error cargando horarios:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(cargarHorarios);
  }, []);

  const abrirCrear = () => {
    setForm(FORM_INICIAL);
    setErrorModal("");
    setModal("crear");
  };

  const abrirEditar = (horario) => {
    const finSemana =
      horario.dia_semana === "sábado" || horario.dia_semana === "domingo";
    setForm({
      dia_semana: horario.dia_semana,
      hora_inicio: horaCorta(horario.hora_inicio, "16:00"),
      hora_fin: horaCorta(horario.hora_fin, finSemana ? "01:30" : "00:30"),
      activo: Boolean(horario.activo),
    });
    setErrorModal("");
    setModal(horario);
  };

  const cerrarModal = () => {
    setModal(null);
    setErrorModal("");
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrorModal("");
  };

  const getHorarioSaveErrorMessage = (error) => {
    const message = String(error?.message || error?.details || "");

    if (/duplicate|already exists|ya existe|unique constraint|unique violation|violates unique constraint/i.test(message)) {
      return "No se pudo guardar. Ese horario ya existe.";
    }

    if (/hora_inicio|hora_fin|column.*hora_inicio|column.*hora_fin|not-null/i.test(message)) {
      return "No se pudo guardar. Verifica que la tabla horarios tenga hora_inicio y hora_fin.";
    }

    return "No se pudo guardar. Intenta nuevamente.";
  };

  const handleGuardar = async () => {
    if (!form.dia_semana || !form.hora_inicio || !form.hora_fin) {
      setErrorModal("Completa el día y las horas.");
      return;
    }

    setGuardando("modal");
    try {
      const payload = {
        dia_semana: form.dia_semana,
        hora_inicio: `${form.hora_inicio}:00`,
        hora_fin: `${form.hora_fin}:00`,
        activo: form.activo,
      };

      if (modal === "crear") {
        await createHorario(payload);
      } else {
        await updateHorario(modal.id, payload);
      }

      await cargarHorarios();
      cerrarModal();
    } catch (error) {
      console.error("Error guardando horario:", error);
      setErrorModal(getHorarioSaveErrorMessage(error));
    } finally {
      setGuardando(null);
    }
  };

  const handleToggle = async (horario) => {
    setGuardando(horario.id);
    try {
      const actualizado = await toggleHorario(horario.id, !horario.activo);
      setHorarios((prev) =>
        prev.map((h) => (h.id === horario.id ? actualizado : h)),
      );
    } catch (error) {
      console.error("Error actualizando horario:", error);
      alert("No se pudo cambiar el estado del horario.");
    } finally {
      setGuardando(null);
    }
  };

  const handleEliminar = async (horario) => {
    const confirmar = window.confirm(
      `¿Eliminar el horario de ${horario.dia_semana}?`,
    );
    if (!confirmar) return;

    setGuardando(horario.id);
    try {
      await deleteHorario(horario.id);
      setHorarios((prev) => prev.filter((h) => h.id !== horario.id));
    } catch (error) {
      console.error("Error eliminando horario:", error);
      alert("No se pudo eliminar el horario.");
    } finally {
      setGuardando(null);
    }
  };

  const activos = horarios.filter((h) => h.activo).length;
  const inactivos = horarios.length - activos;

  return (
    <AdminLayout active="horarios">
      {checkingAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan border-t-transparent"></div>
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>            
                      </div>
          <button
            onClick={abrirCrear}
            className="bg-cyan text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-teal transition-colors text-sm"
          >
            + Agregar día
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-400">Días configurados</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {horarios.length}
            </p>
          </div>
          <div className="bg-green-50 rounded-2xl border border-green-100 p-4">
            <p className="text-xs text-green-700">Activos</p>
            <p className="text-3xl font-bold text-green-700 mt-1">{activos}</p>
          </div>
          <div className="bg-gray-100 rounded-2xl border border-gray-200 p-4">
            <p className="text-xs text-gray-600">Inactivos</p>
            <p className="text-3xl font-bold text-gray-700 mt-1">
              {inactivos}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan border-t-transparent"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-xs">
                    <th className="px-5 py-3 text-left font-medium">Día</th>
                    <th className="px-5 py-3 text-left font-medium">
                      Apertura
                    </th>
                    <th className="px-5 py-3 text-left font-medium">Cierre</th>
                    <th className="px-5 py-3 text-left font-medium">Estado</th>
                    <th className="px-5 py-3 text-left font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {horarios.map((horario) => {
                    const finSemana =
                      horario.dia_semana === "sábado" ||
                      horario.dia_semana === "domingo";
                    return (
                      <tr key={horario.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-semibold text-gray-800 capitalize">
                          {horario.dia_semana}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {horaCorta(horario.hora_inicio, "16:00")}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {horaCorta(
                            horario.hora_fin,
                            finSemana ? "01:30" : "00:30",
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => handleToggle(horario)}
                            disabled={guardando === horario.id}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                              guardando === horario.id
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                            } ${
                              horario.activo ? "bg-green-400" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                                horario.activo
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                          <span className="ml-3 text-xs text-gray-500">
                            {horario.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => abrirEditar(horario)}
                              className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-semibold"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleEliminar(horario)}
                              className="px-3 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {modal !== null && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4 backdrop-blur-sm bg-black/30">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-lg font-bold text-chocolate mb-4">
                {modal === "crear" ? "Agregar horario" : "Editar horario"}
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Día de la semana
                  </label>
                  <select
                    name="dia_semana"
                    value={form.dia_semana}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan capitalize"
                  >
                    {ORDEN_DIAS.map((dia) => (
                      <option key={dia} value={dia}>
                        {dia}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Hora de apertura
                    </label>
                    <input
                      type="time"
                      name="hora_inicio"
                      value={form.hora_inicio}
                      onChange={handleFormChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Hora de cierre
                    </label>
                    <input
                      type="time"
                      name="hora_fin"
                      value={form.hora_fin}
                      onChange={handleFormChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={form.activo}
                    onChange={handleFormChange}
                    className="h-4 w-4 accent-cyan"
                  />
                  Día activo para reservas
                </label>

                {errorModal && (
                  <p className="text-red-500 text-sm">{errorModal}</p>
                )}
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={handleGuardar}
                  disabled={guardando === "modal"}
                  className={`flex-1 py-3 rounded-xl font-semibold text-white transition-colors ${
                    guardando === "modal"
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-cyan hover:bg-teal cursor-pointer"
                  }`}
                >
                  {guardando === "modal" ? "Guardando..." : "Guardar"}
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
    </AdminLayout>
  );
}

export default GestionHorarios;
