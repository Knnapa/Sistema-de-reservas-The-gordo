// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { getMesas } from "../services/mesasService";
import FormularioReserva from "../components/FormularioReserva";
import logo from "../assets/logo.jpg";
import hamburguesas from "../assets/hamburguesas.png";

function Home() {
  const [mesas, setMesas] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMesas();
  }, []);

  const cargarMesas = async () => {
    try {
      const data = await getMesas();
      setMesas(data);
    } catch (error) {
      console.error("Error cargando mesas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClickMesa = (mesa) => {
    if (mesa.estado === "disponible") {
      setMesaSeleccionada(mesa);
    }
  };

  const handleReservaExitosa = () => {
    setMesaSeleccionada(null);
    cargarMesas();
  };

  const getEstiloMesa = (estado) => {
    if (estado === "disponible")
      return "bg-green-100 border-green-400 cursor-pointer hover:scale-105 hover:shadow-lg transition-transform";
    if (estado === "ocupada")
      return "bg-red-100 border-red-300 cursor-not-allowed opacity-70";
    if (estado === "bloqueada")
      return "bg-gray-100 border-gray-300 cursor-not-allowed opacity-60";
  };

  const getTextoEstado = (estado) => {
    if (estado === "disponible")
      return (
        <span className="text-green-700 font-medium text-xs">Disponible</span>
      );
    if (estado === "ocupada")
      return <span className="text-red-700 font-medium text-xs">Ocupada</span>;
    if (estado === "bloqueada")
      return (
        <span className="text-gray-500 font-medium text-xs">Bloqueada</span>
      );
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* NAVBAR */}
      <nav className="bg-chocolate flex justify-between items-center px-8 py-4 shadow-md ">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="The Gordo"
            className="w-12 h-12 rounded-full object-cover border-2 border-sandy"
          />
          <span className="text-white font-semibold text-lg tracking-wide">
            {/* Comidas Rápidas The Gordo */}
          </span>
        </div>
        <button
          onClick={() => (window.location.href = "/admin")}
          className="bg-cyan text-white px-4 py-2 rounded-lg text-sm hover:bg-teal hover:text-white transition-colors"
        >
          Ingresar como administrador
        </button>
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-b from-chocolate to-cinnamon flex flex-col items-center justify-center py-20 px-6 text-center">
        <img
          src={logo}
          alt="Logo The Gordo"
          className="w-32 h-32 rounded-full object-cover border-4 border-sandy shadow-xl mb-6"
        />
        <h1 className="text-white text-5xl font-bold mb-4 tracking-tight">
          Comidas Rápidas The Gordo
        </h1>
        <p className="text-white text-xl max-w-lg mb-8">
          El sabor que te hace volver. Reserva tu mesa y disfruta de la mejor
          experiencia.
        </p>
        <button
          onClick={() =>
            document
              .getElementById("reservas")
              .scrollIntoView({ behavior: "smooth" })
          }
          className="bg-cyan text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-teal transition-colors shadow-lg"
        >
          Reservar mesa
        </button>
      </section>

      {/* FOTOS DE PLATOS */}
      <section className="bg-gradient-to-b from-cinnamon to-sandy py-16 px-8">
        <h2 className="text-white text-3xl font-bold text-center mb-10">
          Nuestro sabor
        </h2>
        <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl">
          <img
            src={hamburguesas}
            alt="Nuestros platos"
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* FRASE */}
      <section className="bg-sandy py-12 px-6 text-center">
        <p className="text-white text-2xl italic max-w-2xl mx-auto font-light">
          "Donde cada plato cuenta una historia y cada visita se convierte en un
          recuerdo."
        </p>
      </section>

      {/* SECCIÓN DE RESERVAS */}
      <section
        id="reservas"
        className="bg-gradient-to-b from-sandy to-teal py-16 px-8"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-white text-3xl font-bold text-center mb-2">
            Selecciona tu mesa
          </h2>
          <p className="text-white text-center mb-8">
            Haz clic en una mesa disponible para iniciar tu reserva
          </p>

          {/* Leyenda */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-400"></div>
              <span className="text-sm text-white">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-400"></div>
              <span className="text-sm text-white">Ocupada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-400"></div>
              <span className="text-sm text-white">Bloqueada</span>
            </div>
          </div>

          {/* Tablero de mesas */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {mesas.map((mesa) => (
                <div
                  key={mesa.id}
                  onClick={() => handleClickMesa(mesa)}
                  className={`border-2 rounded-2xl p-6 text-center ${getEstiloMesa(mesa.estado)}`}
                >
                  <div className="text-2xl font-bold text-ash mb-1">
                    Mesa {mesa.numero}
                  </div>
                  <div className="text-gray-500 text-sm mb-1">
                    👥 {mesa.capacidad} personas
                  </div>
                  <div className="text-gray-400 text-xs mb-2">
                    📍 {mesa.ubicacion}
                  </div>
                  {getTextoEstado(mesa.estado)}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MODAL FORMULARIO */}
      {mesaSeleccionada && (
        <FormularioReserva
          mesa={mesaSeleccionada}
          onCerrar={() => setMesaSeleccionada(null)}
          onExito={handleReservaExitosa}
        />
      )}

      {/* FOOTER */}
      <footer className="bg-teal text-white py-8 text-center">
        <p className="font-semibold mb-1">Comidas Rápidas The Gordo</p>
        <p className="text-sm opacity-80">
          📞 +57 300 45306404 · 📍 Carrera 19 # 11 - 07 Bucaramanga, Colombia
        </p>
        <p className="text-sm opacity-80 mt-1">
          Lunes a viernes · 04:00 p.m – 12.30 am · Sábados y domingos · 04:00 pm – 01:30 am
        </p>
      </footer>
    </div>
  );
}

export default Home;
