// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import GestionMesas from "./pages/admin/GestionMesas";
import GestionReservas from "./pages/admin/GestionReservas";
import GestionHorarios from "./pages/admin/GestionHorarios";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/reservas" element={<GestionReservas />} />
        <Route path="/admin/mesas" element={<GestionMesas />} />
        <Route path="/admin/horarios" element={<GestionHorarios />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
