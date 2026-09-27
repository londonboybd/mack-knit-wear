import { LoginForm } from "@/components/login-form";
import { configured } from "@/lib/supabase";
export const metadata = {
  title: "Administrator sign-in",
  robots: { index: false, follow: false },
};
export default function Login() {
  return <LoginForm configured={configured} />;
}
