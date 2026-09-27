import "server-only";
import { db, configured } from "./supabase";
export async function getAdmin() {
  if (!configured) return null;
  const client = await db();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) return null;
  const { data } = await client
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  return data ? user : null;
}
export async function authorizeMutation(request: Request) {
  const origin = request.headers.get("origin");
  const expected = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin || !expected || origin !== new URL(expected).origin)
    return { error: "Request origin is not allowed.", status: 403 };
  if (!(await getAdmin()))
    return { error: "Sign in with an administrator account.", status: 401 };
  return null;
}
