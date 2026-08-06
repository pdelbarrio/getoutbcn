import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from './client';

WebBrowser.maybeCompleteAuthSession();

export const socialAuthService = {
  async signInWithGoogle(): Promise<void> {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'getoutbcn', // Debe coincidir con el scheme en app.json
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error('No se pudo obtener la URL de autenticación');

    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUri
    );

    if (result.type === 'success') {
      // La sesión se actualiza automáticamente en el cliente de Supabase
      // gracias a la configuración de redirectTo y la URL de callback.
      // Podemos verificar la sesión con supabase.auth.getSession()
    } else {
      throw new Error('Autenticación cancelada o fallida');
    }
  },
};
