import logo from "../assets/logo.jpg";

const navItems = [
  { id: "dashboard", label: "Dashboard", marker: "D", href: "/admin/dashboard" },
  { id: "reservas", label: "Reservas", marker: "R", href: "/admin/reservas" },
  { id: "mesas", label: "Mesas", marker: "M", href: "/admin/mesas" },
  { id: "horarios", label: "Horarios", marker: "H", href: "/admin/horarios" },
];

function AdminSidebar({ active, collapsed }) {
  return (
    <aside
      className={`min-h-screen bg-teal text-white flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div
        className={`flex flex-col items-center border-b border-white/10 ${
          collapsed ? "px-3 py-5" : "px-4 py-6"
        }`}
      >
        <img
          src={logo}
          alt="The Gordo"
          className={`rounded-full object-cover border-2 border-sandy shadow-lg ${
            collapsed ? "w-12 h-12" : "w-28 h-28"
          }`}
        />
        {!collapsed && (
          <>
            <p className="font-bold text-xl mt-4">The Gordo</p>
            <p className="text-sm text-white/75 mt-1">Panel de Administración</p>
          </>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-2">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={`flex items-center rounded-xl text-sm font-medium transition-colors ${
              collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"
            } ${
              item.id === active
                ? "bg-orange-500 text-white shadow-lg shadow-orange-950/20"
                : "text-white/80 hover:bg-white/10"
            }`}
            title={collapsed ? item.label : undefined}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/10 text-[11px] font-bold">
              {item.marker}
            </span>
            {!collapsed && item.label}
          </a>
        ))}
      </nav>

      <div className="h-4 border-t border-white/10" />
    </aside>
  );
}

export default AdminSidebar;
