import type { APIRoute } from "astro";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { SetSecret2FA } from "@/lib/db";


const SECRET = process.env.SECRET || import.meta.env.SECRET;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { token } = await request.json();
    const decode = jwt.verify(token, SECRET) as { id: string; email: string };
    const secretqr = speakeasy.generateSecret({
      name: `Better With a Teacher (${decode.email})`,
    });
    const qrCode = await QRCode.toDataURL(secretqr.otpauth_url!);
    await SetSecret2FA(decode.id,secretqr.base32);
    return new Response(
      JSON.stringify({
        success: true,
        qr: qrCode,
      }),
      { status: 200 }
    );
  } catch (err: string | any) {
    return new Response(
      JSON.stringify({
        error: err.message || "Error al crear el nuevo horario",
      }),
      {
        status: 400,
      }
    );
  }
};
