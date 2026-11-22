import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 5 * 1024 * 1024;

type Payload = {
  requestType?: "quote" | "contact";
  customerType?: string;
  services?: string[];
  propertyDetails?: Record<string, string>;
  description?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  preferredContact?: string;
  consent?: boolean;
};

const jsonResponse = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const cleanFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (request.method !== "POST") return jsonResponse({ error: "Methode nicht erlaubt." }, 405);

    const contentType = request.headers.get("content-type") ?? "";
    let payload: Payload;
    const photos: File[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const rawPayload = formData.get("payload");
      if (typeof rawPayload !== "string") return jsonResponse({ error: "Ungültige Anfrage." }, 400);
      payload = JSON.parse(rawPayload) as Payload;
      formData.getAll("photos").forEach((value) => {
        if (value instanceof File) photos.push(value);
      });
    } else {
      payload = await request.json() as Payload;
    }

    const contactName = payload.contactName?.trim() ?? "";
    const email = payload.email?.trim().toLowerCase() ?? "";
    const description = payload.description?.trim() ?? "";
    const requestType = payload.requestType === "contact" ? "contact" : "quote";

    if (!payload.consent || contactName.length < 2 || contactName.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || description.length > 5000) {
      return jsonResponse({ error: "Bitte prüfen Sie Ihre Angaben." }, 400);
    }

    if (photos.length > 6 || photos.some((file) => !allowedTypes.has(file.type) || file.size > maxFileSize)) {
      return jsonResponse({ error: "Mindestens eine Datei ist ungültig." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) return jsonResponse({ error: "Dienst momentan nicht verfügbar." }, 503);

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const requestId = crypto.randomUUID();
    const { error: insertError } = await supabase.from("quote_requests").insert({
      id: requestId,
      request_type: requestType,
      customer_type: payload.customerType?.slice(0, 40) ?? null,
      services: (payload.services ?? []).slice(0, 8),
      property_details: payload.propertyDetails ?? {},
      description,
      contact_name: contactName,
      email,
      phone: payload.phone?.trim().slice(0, 40) ?? null,
      preferred_contact: payload.preferredContact?.slice(0, 40) ?? null,
      consent: true,
      photo_paths: [],
    });

    if (insertError) return jsonResponse({ error: "Anfrage konnte nicht gespeichert werden." }, 500);

    const photoPaths: string[] = [];
    for (const file of photos) {
      const path = `requests/${requestId}/${crypto.randomUUID()}-${cleanFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage.from("quote-photos").upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) return jsonResponse({ error: "Fotos konnten nicht gespeichert werden." }, 500);
      photoPaths.push(path);
    }

    if (photoPaths.length > 0) {
      const { error: updateError } = await supabase.from("quote_requests").update({ photo_paths: photoPaths }).eq("id", requestId);
      if (updateError) return jsonResponse({ error: "Anfrage konnte nicht vollständig gespeichert werden." }, 500);
    }

    return jsonResponse({ success: true });
  } catch {
    return jsonResponse({ error: "Anfrage konnte nicht verarbeitet werden." }, 500);
  }
});
