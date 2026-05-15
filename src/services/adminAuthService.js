import { supabase } from "../supabaseClient";

export async function getAdminProfile(userId) {
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, email")
    .eq("id", userId)
    .maybeSingle(); // 🔥 CAMBIO AQUÍ

  if (error) {
    console.error("Error consultando admin:", error);
    return null;
  }

  return data;
}

export async function signInAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error("Correo o contraseña incorrectos.");
  }

  console.log("USER ID:", data.user.id); // 👈 DEBUG

  const admin = await getAdminProfile(data.user.id);

  console.log("ADMIN:", admin); // 👈 DEBUG

  if (!admin) {
    await supabase.auth.signOut();
    throw new Error("Este usuario no tiene permisos de administrador.");
  }

  return { user: data.user, admin };
}

export async function requireAdminSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.user) {
    return null;
  }

  const admin = await getAdminProfile(data.session.user.id);

  if (!admin) {
    await supabase.auth.signOut();
    return null;
  }

  return { session: data.session, admin };
}

export async function signOutAdmin() {
  await supabase.auth.signOut();
}
