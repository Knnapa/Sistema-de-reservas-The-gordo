import { useEffect, useState, useCallback } from "react";
import { requireAdminSession, signOutAdmin } from "../services/adminAuthService";

const INACTIVIDAD_MS = 5 * 60 * 1000; // 5 minutos

function useAdminGuard() {
  const [checkingAuth, setCheckingAuth] = useState(true);

  const cerrarSesionPorInactividad = useCallback(async () => {
    await signOutAdmin();
    window.location.href = "/admin/login?razon=inactividad";
  }, []);

  useEffect(() => {
    let activo = true;
    let timerInactividad;

    const reiniciarTimer = () => {
      clearTimeout(timerInactividad);
      timerInactividad = setTimeout(cerrarSesionPorInactividad, INACTIVIDAD_MS);
    };

    const eventos = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];

    async function validarSesion() {
      const result = await requireAdminSession();

      if (!activo) return;

      if (!result) {
        window.location.href = "/admin/login";
        return;
      }

      setCheckingAuth(false);

      // Iniciar timer y escuchar actividad
      reiniciarTimer();
      eventos.forEach((ev) => window.addEventListener(ev, reiniciarTimer));
    }

    void validarSesion();

    return () => {
      activo = false;
      clearTimeout(timerInactividad);
      eventos.forEach((ev) => window.removeEventListener(ev, reiniciarTimer));
    };
  }, [cerrarSesionPorInactividad]);

  return checkingAuth;
}

export default useAdminGuard;