import { supabase } from "./client";
import { t } from "../../constants/Translations";

/**
 * Storage service for uploading images to Supabase Storage
 */
export const storageService = {
  /**
   * Upload a spot image to Supabase Storage
   * @param uri - Local file URI from image picker
   * @param userId - ID of the user uploading the image
   * @returns Public URL of the uploaded image
   */

  async uploadSpotImage(uri: string, userId: string): Promise<string> {
    try {
      console.log("Subiendo imagen desde URI:", uri);

      // 1. Generar nombre de archivo
      const timestamp = Date.now();
      const fileName = `spot-${userId}-${timestamp}.jpg`;

      // 2. Obtener URL firmada desde la Edge Function
      console.log("Solicitando URL firmada...");
      const functionUrl =
        "https://ekuaubrerrjeacssjbcn.supabase.co/functions/v1/generate-upload-url";

      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;

      if (!accessToken) {
        throw new Error(t.errorAuthToken);
      }

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ fileName, userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `${t.errorSignedUrl}: ${errorData.error || response.statusText}`,
        );
      }

      const { signedUrl, path } = await response.json();
      console.log("URL firmada obtenida");

      // 3. Descargar la imagen y preparar el blob
      console.log("Descargando imagen...");
      const imageResponse = await fetch(uri);
      if (!imageResponse.ok) {
        throw new Error(`${t.errorDownloadImage}: ${imageResponse.status}`);
      }
      const blob = await imageResponse.blob();
      console.log("Tamaño del blob (bytes):", blob.size);

      // 4. Subir la imagen usando la URL firmada
      console.log("Subiendo imagen a la URL firmada...");
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: blob,
        headers: {
          "Content-Type": "image/jpeg",
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Error en la subida:", errorText);
        throw new Error(
          `${t.errorUploadImage}: ${uploadResponse.status} ${uploadResponse.statusText}`,
        );
      }
      console.log("Imagen subida exitosamente.");

      // 5. Obtener y devolver la URL pública
      const { data: urlData } = supabase.storage
        .from("spots")
        .getPublicUrl(path);

      console.log("URL pública:", urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error: any) {
      console.error("Storage upload error:", error);
      throw new Error(error.message || t.errorUploadImage);
    }
  },

  /**
   * Upload an avatar image to Supabase Storage
   * @param uri - Local file URI from image picker
   * @param userId - ID of the user uploading the image
   * @returns Public URL of the uploaded image
   */
  async uploadAvatar(uri: string, userId: string): Promise<string> {
    try {
      const timestamp = Date.now();
      const filename = `avatar-${userId}-${timestamp}.jpg`;
      const filePath = `avatars/${filename}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (error) {
        throw new Error(`${t.errorUploadAvatar}: ${error.message}`);
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      throw new Error(error.message || t.errorUploadAvatar);
    }
  },

  /**
   * Delete an image from Supabase Storage
   * @param bucket - Bucket name (spots or avatars)
   * @param path - File path in the bucket
   */
  async deleteImage(bucket: "spots" | "avatars", path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw new Error(`${t.errorDeleteImage}: ${error.message}`);
    }
  },
};
