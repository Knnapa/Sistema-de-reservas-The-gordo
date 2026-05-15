import { useState, useEffect } from "react";
import {
  getReservasFiltradas,
  cancelarReserva,
} from "../../services/reservasService";
import {
  getMesas,
  createMesa,
  cambiarEstadoMesa,
} from "../../services/mesasService";
import AdminLayout from "../../components/AdminLayout";
import FormularioReserva from "../../components/FormularioReserva";
import useAdminGuard from "../../hooks/useAdminGuard";
import { signOutAdmin } from "../../services/adminAuthService";

function fechaHoyFormateada() {
  return new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function IconBadge({ children, tone = "teal" }) {
  const toneClass =
    tone === "orange"
      ? "from-orange-500 to-orange-700"
      : "from-cyan to-teal";

  return (
    <div
      className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${toneClass} text-2xl font-bold text-white shadow-lg`}
    >
      {children}
    </div>
  );
}

function Dashboard() {
  const checkingAuth = useAdminGuard();

  const hoy = new Date().toISOString().split("T")[0];
  const [fechaFiltro, setFechaFiltro] = useState(hoy);
  const [reservas, setReservas] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(true);
  const [menuAdminAbierto, setMenuAdminAbierto] = useState(false);
  const [modalReserva, setModalReserva] = useState(false);
  const [mesaReserva, setMesaReserva] = useState(null);
  const [modalAccion, setModalAccion] = useState(null);
  const [mesaForm, setMesaForm] = useState({
    numero: "",
    capacidad: "",
    ubicacion: "",
    estado: "disponible",
  });
  const [mesaBloqueoId, setMesaBloqueoId] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [guardandoAccion, setGuardandoAccion] = useState(false);

  async function cargarReservas() {
    setLoadingReservas(true);
    try {
      const data = await getReservasFiltradas({ fecha: fechaFiltro });
      setReservas(data);
    } catch (error) {
      console.error("Error cargando reservas:", error);
    } finally {
      setLoadingReservas(false);
    }
  }

  async function cargarMesas() {
    try {
      const data = await getMesas();
      setMesas(data);
    } catch (error) {
      console.error("Error cargando mesas:", error);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(cargarReservas);
  }, [fechaFiltro]);

  useEffect(() => {
    void Promise.resolve().then(cargarMesas);
  }, []);

  const handleCancelarReserva = async (id) => {
    if (!window.confirm("¿Cancelar reserva?")) return;
    await cancelarReserva(id);
    setReservas((prev) =>
      prev.map((r) => (r.id === id ? { ...r, estado: "cancelada" } : r)),
    );
  };

  const handleCerrarSesion = async () => {
    await signOutAdmin();
    window.location.href = "/admin/login";
  };

  const abrirAgregarMesa = () => {
    setMesaForm({
      numero: "",
      capacidad: "",
      ubicacion: "",
      estado: "disponible",
    });
    setErrorAccion("");
    setModalAccion("agregarMesa");
  };

  const abrirBloquearMesa = () => {
    setMesaBloqueoId("");
    setErrorAccion("");
    setModalAccion("bloquearMesa");
  };

  const cerrarAccion = () => {
    setModalAccion(null);
    setErrorAccion("");
    setGuardandoAccion(false);
  };

  const handleCrearMesa = async () => {
    if (
      !mesaForm.numero ||
      !mesaForm.capacidad ||
      !mesaForm.ubicacion ||
      Number(mesaForm.numero) <= 0 ||
      Number(mesaForm.capacidad) <= 0
    ) {
      setErrorAccion("Completa los datos de la mesa.");
      return;
    }

    setGuardandoAccion(true);
    try {
      await createMesa({
        numero: Number(mesaForm.numero),
        capacidad: Number(mesaForm.capacidad),
        ubicacion: mesaForm.ubicacion,
        estado: mesaForm.estado,
      });
      await cargarMesas();
      cerrarAccion();
    } catch (error) {
      console.error("Error creando mesa:", error);
      setErrorAccion("No se pudo crear la mesa.");
    } finally {
      setGuardandoAccion(false);
    }
  };

  const handleBloquearMesa = async () => {
    if (!mesaBloqueoId) {
      setErrorAccion("Selecciona una mesa.");
      return;
    }

    setGuardandoAccion(true);
    try {
      await cambiarEstadoMesa(mesaBloqueoId, "bloqueada");
      await cargarMesas();
      cerrarAccion();
    } catch (error) {
      console.error("Error bloqueando mesa:", error);
      setErrorAccion("No se pudo bloquear la mesa.");
    } finally {
      setGuardandoAccion(false);
    }
  };

  const handleReservaExitosa = async () => {
    setMesaReserva(null);
    setModalReserva(false);
    await cargarReservas();
    await cargarMesas();
  };

  const getBadge = (estado) => {
    if (estado === "activa")
      return (
        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-lg">
          Activa
        </span>
      );
    if (estado === "cancelada")
      return (
        <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-lg">
          Cancelada
        </span>
      );
    if (estado === "bloqueada")
      return (
        <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-lg">
          Bloqueada
        </span>
      );
  };

  const reservasActivas = reservas.filter((r) => r.estado === "activa").length;
  const reservasCanceladas = reservas.filter(
    (r) => r.estado === "cancelada",
  ).length;
  const mesasDisponibles = mesas.filter(
    (m) => m.estado === "disponible",
  ).length;
  const mesasOcupadas = mesas.filter((m) => m.estado === "ocupada").length;
  const mesasBloqueadas = mesas.filter((m) => m.estado === "bloqueada").length;
  const mesasFueraServicio = Math.max(
    0,
    mesas.length - mesasDisponibles - mesasOcupadas - mesasBloqueadas,
  );
  const clientesHoy = reservas.filter((r) => r.estado === "activa").length;
  const promedioPersonas = reservasActivas
    ? (
        reservas
          .filter((r) => r.estado === "activa")
          .reduce((total, r) => total + Number(r.num_personas || 0), 0) /
        reservasActivas
      ).toFixed(1)
    : "0.0";
  const proximaReserva = reservas
    .filter((r) => r.estado === "activa")
    .sort((a, b) => a.hora.localeCompare(b.hora))[0];

  return (
    <AdminLayout active="dashboard">
      {({ toggleSidebar }) => (
        <>
          {checkingAuth && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan border-t-transparent"></div>
            </div>
          )}
          <header className="h-[72px] bg-white/95 border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
            <div className="flex items-center gap-5">
              <button
                onClick={toggleSidebar}
                className="h-10 w-10 rounded-xl text-teal hover:bg-gray-100 transition-colors flex flex-col items-center justify-center gap-1"
                title="Colapsar o desplegar sidebar"
              >
                <span className="block h-0.5 w-5 bg-current" />
                <span className="block h-0.5 w-5 bg-current" />
                <span className="block h-0.5 w-5 bg-current" />
              </button>
            </div>
            <div className="flex items-center text-gray-800">
              <div className="relative">
                <button
                  onClick={() => setMenuAdminAbierto((value) => !value)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-gray-100 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">
                    AD
                  </div>
                  <span className="font-medium">Administrador</span>
                </button>
                {menuAdminAbierto && (
                  <div className="absolute right-0 top-12 w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-xl z-30">
                    <button
                      onClick={handleCerrarSesion}
                      className="w-full rounded-lg px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="p-7 space-y-6">
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
                <IconBadge>R</IconBadge>
                <div>
                  <p className="font-medium text-gray-900">Reservas hoy</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {reservas.length}
                  </p>
                  <p className="text-sm text-gray-600">
                    {reservasActivas} activas / {reservasCanceladas} canceladas
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
                <IconBadge tone="orange">M</IconBadge>
                <div>
                  <p className="font-medium text-gray-900">
                    Mesas disponibles
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {mesasDisponibles} / {mesas.length}
                  </p>
                  <p className="text-sm text-gray-600">
                    {mesas.length
                      ? Math.round((mesasDisponibles / mesas.length) * 100)
                      : 0}
                    % disponibles
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
                <IconBadge>C</IconBadge>
                <div>
                  <p className="font-medium text-gray-900">Clientes hoy</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {clientesHoy}
                  </p>
                  <p className="text-sm text-gray-600">
                    Promedio por reserva: {promedioPersonas}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
                <IconBadge tone="orange">H</IconBadge>
                <div>
                  <p className="font-medium text-gray-900">Próxima reserva</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {proximaReserva?.hora?.slice(0, 5) ?? "--:--"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {proximaReserva
                      ? `Mesa ${proximaReserva.mesas?.numero ?? "-"} - ${
                          proximaReserva.num_personas
                        } personas`
                      : "Sin reservas activas"}
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Acciones rápidas
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  ["Nueva reserva", () => setModalReserva(true)],
                  ["Agregar mesa", abrirAgregarMesa],
                  ["Bloquear mesa", abrirBloquearMesa],
                ].map(([label, onClick]) => (
                  <button
                    key={label}
                    onClick={onClick}
                    className="rounded-xl bg-gradient-to-br from-cyan/10 to-orange-50 p-4 text-center text-sm font-medium text-gray-900 hover:shadow-md transition-shadow"
                  >
                    <span className="block text-2xl font-bold text-cyan mb-2">
                      +
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[1fr_430px] gap-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Reservas del día
                  </h2>
                  <div className="flex items-center gap-3">
                    <input
                      type="date"
                      value={fechaFiltro}
                      onChange={(e) => setFechaFiltro(e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan"
                    />
                    <button
                      onClick={() => setModalReserva(true)}
                      className="bg-cyan text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal transition-colors text-sm"
                    >
                      + Nueva reserva
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200">
                  {loadingReservas ? (
                    <div className="flex justify-center py-16">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan border-t-transparent"></div>
                    </div>
                  ) : reservas.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      No hay reservas para esta fecha
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-[#f5efe7] text-gray-800">
                        <tr>
                          <th className="px-5 py-3 text-left font-medium">
                            Hora
                          </th>
                          <th className="px-5 py-3 text-left font-medium">
                            Cliente
                          </th>
                          <th className="px-5 py-3 text-left font-medium">
                            Mesa
                          </th>
                          <th className="px-5 py-3 text-left font-medium">
                            Personas
                          </th>
                          <th className="px-5 py-3 text-left font-medium">
                            Estado
                          </th>
                          <th className="px-5 py-3 text-left font-medium">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {reservas.map((r) => (
                          <tr key={r.id} className="hover:bg-gray-50">
                            <td className="px-5 py-3 font-medium">
                              {r.hora?.slice(0, 5)}
                            </td>
                            <td className="px-5 py-3">{r.cliente_nombre}</td>
                            <td className="px-5 py-3">
                              {r.mesas?.numero ?? "-"}
                            </td>
                            <td className="px-5 py-3">{r.num_personas}</td>
                            <td className="px-5 py-3">{getBadge(r.estado)}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <a
                                  href="/admin/reservas"
                                  className="h-8 w-8 rounded-lg border border-cyan/30 text-cyan flex items-center justify-center font-bold hover:bg-cyan/10"
                                  title="Ver detalles"
                                >
                                  V
                                </a>
                                {r.estado === "activa" ? (
                                  <button
                                    onClick={() => handleCancelarReserva(r.id)}
                                    className="h-8 w-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                                    title="Cancelar reserva"
                                  >
                                    X
                                  </button>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="flex justify-center mt-4">
                  <a
                    href="/admin/reservas"
                    className="px-8 py-2 rounded-lg border border-cyan/40 text-cyan font-semibold text-sm hover:bg-cyan/10"
                  >
                    Ver todas las reservas
                  </a>
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Estado de mesas
                    </h2>
                    <a
                      href="/admin/mesas"
                      className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-cyan hover:bg-gray-50"
                    >
                      Ver todas
                    </a>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-green-50 p-4 text-center">
                      <p className="text-2xl font-bold text-green-700">
                        {mesasDisponibles}
                      </p>
                      <p className="text-sm text-green-700">Disponibles</p>
                    </div>
                    <div className="rounded-xl bg-orange-50 p-4 text-center">
                      <p className="text-2xl font-bold text-orange-700">
                        {mesasOcupadas}
                      </p>
                      <p className="text-sm text-orange-700">Ocupadas</p>
                    </div>
                    <div className="rounded-xl bg-yellow-50 p-4 text-center">
                      <p className="text-2xl font-bold text-yellow-700">
                        {mesasBloqueadas}
                      </p>
                      <p className="text-sm text-yellow-700">Bloqueadas</p>
                    </div>
                    <div className="rounded-xl bg-gray-100 p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {mesasFueraServicio}
                      </p>
                      <p className="text-sm text-gray-700">Fuera de servicio</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Próximas reservas
                  </h2>
                  <div className="rounded-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                    {reservas.slice(0, 5).map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between gap-4 p-4"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {r.hora?.slice(0, 5)} · {r.cliente_nombre}
                          </p>
                          <p className="text-sm text-gray-600">
                            Mesa {r.mesas?.numero ?? "-"} · {r.num_personas}{" "}
                            personas
                          </p>
                        </div>
                        {getBadge(r.estado)}
                      </div>
                    ))}
                    {reservas.length === 0 && (
                      <div className="p-6 text-sm text-gray-400">
                        No hay próximas reservas
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {modalReserva && !mesaReserva && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Nueva reserva
                    </h2>
                    <p className="text-sm text-gray-400">
                      Selecciona una mesa disponible para continuar
                    </p>
                  </div>
                  <button
                    onClick={() => setModalReserva(false)}
                    className="rounded-lg px-3 py-2 text-gray-400 hover:bg-gray-100"
                  >
                    X
                  </button>
                </div>

                <div className="max-h-80 space-y-2 overflow-y-auto">
                  {mesas
                    .filter((mesa) => mesa.estado === "disponible")
                    .map((mesa) => (
                      <button
                        key={mesa.id}
                        onClick={() => setMesaReserva(mesa)}
                        className="flex w-full items-center justify-between rounded-xl border border-gray-100 p-4 text-left hover:border-cyan hover:bg-cyan/5"
                      >
                        <span>
                          <span className="block font-semibold text-gray-900">
                            Mesa #{mesa.numero}
                          </span>
                          <span className="text-sm text-gray-500">
                            {mesa.capacidad} personas - {mesa.ubicacion}
                          </span>
                        </span>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Disponible
                        </span>
                      </button>
                    ))}
                  {mesas.filter((mesa) => mesa.estado === "disponible")
                    .length === 0 && (
                    <p className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-400">
                      No hay mesas disponibles para reservar.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {mesaReserva && (
            <FormularioReserva
              mesa={mesaReserva}
              onCerrar={() => {
                setMesaReserva(null);
                setModalReserva(false);
              }}
              onExito={handleReservaExitosa}
            />
          )}

          {modalAccion && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    {modalAccion === "agregarMesa"
                      ? "Agregar mesa"
                      : "Bloquear mesa"}
                  </h2>
                  <button
                    onClick={cerrarAccion}
                    className="rounded-lg px-3 py-2 text-gray-400 hover:bg-gray-100"
                  >
                    X
                  </button>
                </div>

                {modalAccion === "agregarMesa" ? (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">
                        Número de mesa
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={mesaForm.numero}
                        onChange={(e) =>
                          setMesaForm((prev) => ({
                            ...prev,
                            numero: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-cyan focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">
                        Capacidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={mesaForm.capacidad}
                        onChange={(e) =>
                          setMesaForm((prev) => ({
                            ...prev,
                            capacidad: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-cyan focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">
                        Ubicación
                      </label>
                      <select
                        value={mesaForm.ubicacion}
                        onChange={(e) =>
                          setMesaForm((prev) => ({
                            ...prev,
                            ubicacion: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-cyan focus:outline-none"
                      >
                        <option value="">Selecciona una ubicación</option>
                        <option value="zona ventana">Zona ventana</option>
                        <option value="zona central">Zona central</option>
                        <option value="terraza">Terraza</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">
                      Mesa a bloquear
                    </label>
                    <select
                      value={mesaBloqueoId}
                      onChange={(e) => setMesaBloqueoId(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-cyan focus:outline-none"
                    >
                      <option value="">Selecciona una mesa</option>
                      {mesas
                        .filter((mesa) => mesa.estado !== "bloqueada")
                        .map((mesa) => (
                          <option key={mesa.id} value={mesa.id}>
                            Mesa #{mesa.numero} - {mesa.ubicacion}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {errorAccion && (
                  <p className="mt-3 text-sm text-red-500">{errorAccion}</p>
                )}

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={
                      modalAccion === "agregarMesa"
                        ? handleCrearMesa
                        : handleBloquearMesa
                    }
                    disabled={guardandoAccion}
                    className={`flex-1 rounded-xl py-3 font-semibold text-white ${
                      guardandoAccion
                        ? "bg-gray-300"
                        : "bg-cyan hover:bg-teal"
                    }`}
                  >
                    {guardandoAccion ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={cerrarAccion}
                    className="flex-1 rounded-xl bg-gray-100 py-3 font-semibold text-gray-600 hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}

export default Dashboard;
