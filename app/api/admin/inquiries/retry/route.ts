import { authorizeMutation, getAdmin } from "@/lib/auth";
import { serviceDb } from "@/lib/supabase";
import { z } from "zod";
import { sendStaffInquiryNotification } from "@/lib/email-adapter";

export async function POST(request: Request) {
  const denied = await authorizeMutation(request);
  if (denied)
    return Response.json({ error: denied.error }, { status: denied.status });

  const body = await request.json().catch(() => null);
  const parsed = z.object({ id: z.string().uuid() }).safeParse(body);
  if (!parsed.success)
    return Response.json({ error: "Invalid inquiry ID." }, { status: 400 });

  const supabase = serviceDb();
  const { data: inquiry, error } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", parsed.data.id)
    .single();

  if (error || !inquiry)
    return Response.json({ error: "Inquiry not found." }, { status: 404 });

  const result = await sendStaffInquiryNotification({
    id: inquiry.id,
    reference_code: inquiry.reference_code,
    name: inquiry.name,
    email: inquiry.email,
    company: inquiry.company,
    type: inquiry.type,
    brand: inquiry.brand,
    message: inquiry.message,
    source_url: inquiry.source_url,
    details: inquiry.details,
  });

  const attempts = (inquiry.notification_attempts || 0) + 1;

  await supabase
    .from("inquiries")
    .update({
      notification_status: result.status,
      notification_attempts: attempts,
      notification_last_attempt: new Date().toISOString(),
      notification_error: result.error || null,
    })
    .eq("id", inquiry.id);

  if (!result.success) {
    return Response.json(
      { error: result.error || "Notification delivery retry failed.", status: result.status },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, status: result.status });
}
