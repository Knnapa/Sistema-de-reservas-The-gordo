import { useState, useEffect } from "react";
import {
  getReservasFiltradas,
  cancelarReserva,
} from "../../services/reservasService";
import AdminLayout from "../../components/AdminLayout";
import useAdminGuard from "../../hooks/useAdminGuard";

function GestionReservas() {
  const checkingAuth = useAdminGuard();

  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [reservaDetalle, setReservaDetalle] = useState(null);

  async function cargarReservas() {
    setLoading(true);
    try {
      const data = await getReservasFiltradas({
        fecha: filtroFecha || undefined,
        estado: filtroEstado || undefined,
      });
      setReservas(data);
    } catch (error) {
      console.error("Error cargando reservas:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(cargarReservas);
  }, [filtroFecha, filtroEstado]);

  const handleCancelar = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas cancelar esta reserva? Esta acción no se puede deshacer.",
    );
    if (!confirmar) return;
    try {
      await cancelarReserva(id);
      setReservas((prev) =>
        prev.map((r) => (r.id === id ? { ...r, estado: "cancelada" } : r)),
      );
      if (reservaDetalle?.id === id) {
        setReservaDetalle((prev) => ({ ...prev, estado: "cancelada" }));
      }
    } catch (error) {
      console.error("Error cancelando:", error);
    }
  };

  const getBadge = (estado) => {
    if (estado === "activa")
      return (
        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
          Activa
        </span>
      );
    if (estado === "cancelada")
      return (
        <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full">
          Cancelada
        </span>
      );
    if (estado === "bloqueada")
      return (
        <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
          Bloqueada
        </span>
      );
  };

  return (
    <AdminLayout active="reservas">
      {checkingAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan border-t-transparent"></div>
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5 flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-xs text-gray-400 block mb-1">
              Filtrar por fecha
            </label>
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">
              Filtrar por estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan"
            >
              <option value="">Todos los estados</option>
              <option value="activa">Activa</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          {(filtroFecha || filtroEstado) && (
            <button
              onClick={() => {
                setFiltroFecha("");
                setFiltroEstado("");
              }}
              className="mt-4 text-sm text-gray-400 hover:text-red-400 underline"
            >
              Limpiar filtros
            </button>
          )}
          <div className="ml-auto text-sm text-gray-400">
            {reservas.length} reserva{reservas.length !== 1 ? "s" : ""}{" "}
            encontrada{reservas.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan border-t-transparent"></div>
            </div>
          ) : reservas.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-medium">
                No hay reservas con esos filtros
              </p>
              <p className="text-sm mt-1">
                Intenta cambiar la fecha o el estado
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-xs">
                    <th className="px-5 py-3 text-left font-medium">Fecha</th>
                    <th className="px-5 py-3 text-left font-medium">Hora</th>
                    <th className="px-5 py-3 text-left font-medium">Cliente</th>
                    <th className="px-5 py-3 text-left font-medium">
                      Teléfono
                    </th>
                    <th className="px-5 py-3 text-left font-medium">Mesa</th>
                    <th className="px-5 py-3 text-left font-medium">
                      Personas
                    </th>
                    <th className="px-5 py-3 text-left font-medium">Estado</th>
                    <th className="px-5 py-3 text-left font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reservas.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3 text-gray-500">{r.fecha}</td>
                      <td className="px-5 py-3 font-medium text-gray-700">
                        {r.hora?.slice(0, 5)}
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        {r.cliente_nombre}
                      </td>
                      <td className="px-5 py-3 text-gray-400">
                        {r.cliente_tel}
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {r.mesas?.numero ?? "-"}
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {r.num_personas}
                      </td>
                      <td className="px-5 py-3">{getBadge(r.estado)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setReservaDetalle(r)}
                            className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 transition-colors text-xs font-semibold"
                            title="Ver detalles"
                          >
                            Ver detalles
                          </button>
                          {r.estado === "activa" && (
                            <button
                              onClick={() => handleCancelar(r.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-200 hover:bg-red-50 text-red-400 transition-colors"
                              title="Cancelar reserva"
                            >
                              X
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {reservaDetalle && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4 backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-lg font-bold text-chocolate mb-4">
              Detalle de la Reserva
            </h2>
            <div className="space-y-2 bg-gray-50 rounded-xl p-4 text-sm">
              <p>
                <span className="text-gray-400">Mesa:</span>{" "}
                <strong>{reservaDetalle.mesas?.numero}</strong> -{" "}
                {reservaDetalle.mesas?.ubicacion}
              </p>
              <p>
                <span className="text-gray-400">Fecha:</span>{" "}
                <strong>{reservaDetalle.fecha}</strong>
              </p>
              <p>
                <span className="text-gray-400">Hora:</span>{" "}
                <strong>{reservaDetalle.hora?.slice(0, 5)}</strong>
              </p>
              <p>
                <span className="text-gray-400">Cliente:</span>{" "}
                <strong>{reservaDetalle.cliente_nombre}</strong>
              </p>
              <p>
                <span className="text-gray-400">Teléfono:</span>{" "}
                {reservaDetalle.cliente_tel}
              </p>
              <p>
                <span className="text-gray-400">Email:</span>{" "}
                {reservaDetalle.cliente_email}
              </p>
              <p>
                <span className="text-gray-400">Personas:</span>{" "}
                {reservaDetalle.num_personas}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Estado:</span>
                {getBadge(reservaDetalle.estado)}
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              {reservaDetalle.estado === "activa" && (
                <button
                  onClick={() => handleCancelar(reservaDetalle.id)}
                  className="flex-1 py-2.5 rounded-xl font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition-colors text-sm"
                >
                  Cancelar reserva
                </button>
              )}
              <button
                onClick={() => setReservaDetalle(null)}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default GestionReservas;
