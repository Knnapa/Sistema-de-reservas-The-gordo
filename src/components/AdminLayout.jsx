import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { signOutAdmin } from "../services/adminAuthService";

function AdminLayout({ active, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [menuAdminAbierto, setMenuAdminAbierto] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setCollapsed((value) => !value);

  const handleCerrarSesion = async () => {
    await signOutAdmin();
    navigate("/admin/login");
  };

  const activeTitles = {
    dashboard: "Dashboard",
    reservas: "Reservas",
    mesas: "Mesas",
    horarios: "Horarios",
  };

  const activeTitle = activeTitles[active] || "";

  return (
    <div className="flex min-h-screen bg-[#fbf7f1] font-sans">
      <AdminSidebar active={active} collapsed={collapsed} />
      <main className="flex-1 min-w-0">
        {typeof children === "function" ? (
          children({ collapsed, toggleSidebar })
        ) : (
          <>
            <div className="h-[72px] bg-white/95 border-b border-gray-200 flex items-center px-6 shadow-sm justify-between">
              <div className="text-lg font-bold text-chocolate">
                {activeTitle}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSidebar}
                  className="h-10 w-10 rounded-xl text-teal hover:bg-gray-100 transition-colors flex flex-col items-center justify-center gap-1"
                  title="Colapsar o desplegar sidebar"
                >
                  <span className="block h-0.5 w-5 bg-current" />
                  <span className="block h-0.5 w-5 bg-current" />
                  <span className="block h-0.5 w-5 bg-current" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setMenuAdminAbierto((value) => !value)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">
                      AD
                    </div>
                    <span className="font-medium text-gray-800">Administrador</span>
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
            </div>
            {children}
          </>
        )}
      </main>
    </div>
  );
}

export default AdminLayout;
