// src/pages/admin/Login.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/logo.jpg";
import { signInAdmin } from "../../services/adminAuthService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await signInAdmin(email, password);
      navigate("/admin/dashboard");
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Permitir enviar con la tecla Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-chocolate to-teal flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">

        {/* Logo y título */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={logo}
            alt="The Gordo"
            className="w-24 h-24 rounded-full object-cover border-4 border-sandy shadow-lg mb-4"
          />
          <h1 className="text-2xl font-bold text-chocolate">The Gordo</h1>
          <p className="text-gray-400 text-sm mt-1">Panel de Administración</p>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1 font-medium">
              Correo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="admin@thegordo.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1 font-medium">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ingresa tu contraseña"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-colors"
            />
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Botón de ingreso */}
          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-colors mt-2 ${
              loading || !email || !password
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-cyan hover:bg-teal cursor-pointer"
            }`}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </div>

        {/* Link para volver al inicio */}
        <p className="text-center text-xs text-gray-400 mt-6">
          ¿Eres cliente?{" "}
          <a href="/" className="text-cyan hover:text-teal underline">
            Ir al inicio
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
