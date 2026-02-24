import type { APIRoute } from "astro";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import { GetFactorCode } from "@/lib/db";

const secret = import.meta.env.SECRET;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    const token = formData.get("token") as string;
    const code = formData.get("verification-code");
    const decode = jwt.verify(token, secret) as { id: string; email: string } ;

    const factor = await GetFactorCode(decode.id);

    const verified = speakeasy.totp.verify({
      secret: factor,
      encoding: "base32",
      token: code as string,
      window: 1,
    });
    if (!verified) {
      return new Response(
        JSON.stringify({ success: false, message: "Código inválido" }),
        { status: 400 }
      );
    }
    const sessionToken = jwt.sign(
      { id: decode.id, email: decode.email },
      secret,
      { expiresIn: "1h" }
    );

    return new Response(
      JSON.stringify({ success: true, token: sessionToken }),
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
