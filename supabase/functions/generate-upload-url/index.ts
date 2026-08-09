// supabase/functions/generate-upload-url/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Usa tus secrets personalizados
    const supabaseClient = createClient(
      Deno.env.get("SB_URL") ?? "",
      Deno.env.get("SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const { fileName, userId } = await req.json();
    if (!fileName || !userId) {
      return new Response(
        JSON.stringify({ error: "Faltan parámetros: fileName y userId" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const filePath = `spots/${userId}/${fileName}`;
    const { data, error } = await supabaseClient.storage
      .from("spots")
      .createSignedUploadUrl(filePath);

    if (error) {
      console.error("Error al generar URL firmada:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ signedUrl: data.signedUrl, path: filePath }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error en la función:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
