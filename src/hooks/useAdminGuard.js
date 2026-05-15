import { useEffect, useState } from "react";
import { requireAdminSession } from "../services/adminAuthService";

function useAdminGuard() {
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let activo = true;

    async function validarSesion() {
      const result = await requireAdminSession();

      if (!activo) return;

      if (!result) {
        window.location.href = "/admin/login";
        return;
      }

      setCheckingAuth(false);
    }

    void validarSesion();

    return () => {
      activo = false;
    };
  }, []);

  return checkingAuth;
}

export default useAdminGuard;
