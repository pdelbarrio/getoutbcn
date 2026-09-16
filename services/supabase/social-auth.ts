import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { supabase } from "./client";
import { t } from "../../constants/Translations";

WebBrowser.maybeCompleteAuthSession();

export const socialAuthService = {
  async signInWithGoogle(): Promise<void> {
    try {
      console.log("🟢 Iniciando signIn con Google");
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: "getoutbcn",
      });
      console.log("🔗 Redirect URI:", redirectUri);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.error("🔴 Error en signInWithGoogle:", error);
        throw error;
      }
      console.log("✅ URL de OAuth obtenida:", data.url);
      if (!data.url) throw new Error(t.errorAuthUrl);

      console.log("⏳ Abriendo navegador...");
      let result;
      try {
        result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
      } catch (error) {
        console.error("❌ Error en openAuthSessionAsync:", error);
        throw error;
      }
      console.log("📱 Resultado de WebBrowser:", result.type);
      console.log("📱 Detalle completo:", JSON.stringify(result, null, 2));

      if (result.type === "success") {
        const { url } = result;
        console.log("🔗 URL de retorno:", url);

        // Parsear la URL correctamente (query string y fragmento)
        const parsedUrl = new URL(url);
        const params = new URLSearchParams(parsedUrl.search);
        const fragmentParams = new URLSearchParams(parsedUrl.hash.substring(1));

        const access_token =
          params.get("access_token") || fragmentParams.get("access_token");
        const refresh_token =
          params.get("refresh_token") || fragmentParams.get("refresh_token");
        const code = params.get("code") || fragmentParams.get("code");

        console.log("🔑 access_token:", access_token ? "presente" : "no");
        console.log("🔑 refresh_token:", refresh_token ? "presente" : "no");
        console.log("🔑 code:", code ? "presente" : "no");

        if (access_token && refresh_token) {
          console.log("⏳ Estableciendo sesión con tokens directos...");
          await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          console.log("✅ Sesión establecida con tokens directos");
        } else if (code) {
          console.log("⏳ Intercambiando código por sesión...");
          const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          console.log("✅ Sesión establecida mediante exchangeCodeForSession");
        } else {
          console.error(
            "🔴 No se encontraron tokens ni código en la URL:",
            url,
          );
          throw new Error("No se pudo obtener la sesión");
        }
      } else {
        console.error("🔴 Autenticación cancelada o fallida:", result);
        throw new Error(t.errorAuthCancelled);
      }
    } catch (error) {
      console.error("❌ Error general en signInWithGoogle:", error);
      throw error;
    }
  },
};
