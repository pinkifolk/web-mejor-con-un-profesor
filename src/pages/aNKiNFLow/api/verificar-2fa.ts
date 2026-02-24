import type { APIRoute } from "astro";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import { GetFactorCode, Actived2FA } from "@/lib/db";

const secret = import.meta.env.SECRET;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    const token = formData.get("token") as string;
    const code = formData.get("verification-code") as string;
    const decode = jwt.verify(token, secret);

    const factor = await GetFactorCode(decode.id);

    const verified = speakeasy.totp.verify({
      secret: factor,
      encoding: "base32",
      token: code,
    });
    if (!verified) {
      return new Response(
        JSON.stringify({ success: false, message: "Código inválido" }),
        { status: 400 }
      );
    }
    const actived = await Actived2FA(decode.id);
    if(!actived){
        return new Response(
        JSON.stringify({ success: false, message: "Error al actualizar la activacion" }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "2FA activado correctamente" }),
      { status: 200 }
    );
  } catch (err: string | any) {
    return new Response(
      JSON.stringify({
        error: err.message || "Error al verificar el codigo",
      }),
      {
        status: 400,
      }
    );
  }
};
