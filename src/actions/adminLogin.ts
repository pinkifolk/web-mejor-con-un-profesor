import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { ValidateLogin,GetFactorCode, Actived2FA,SetSecret2FA } from '@/lib/db'
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

const SECRET = process.env.SECRET || import.meta.env.SECRET;

export const loginActions = {
    login: defineAction({
        accept: 'form',
        input: z.object({
            email: z.string().min(1, "Ingrese el usuario"),
            pass: z.string().min(1, "Ingrese la clave"),
        }),
        handler: async ({ email, pass }) => {
            const login = await ValidateLogin(email, pass);
            console.log(login)
            return JSON.parse(JSON.stringify(login));
        }
    }),
    verify2FA: defineAction({
        accept: 'form',
        input: z.object({
            token: z.string().min(1, "Token requerido"),
            verificationCode: z.string().min(1, "Código de verificación requerido"),
        }),
        handler: async ({ token, verificationCode: code }) => {
            console.log("Token recibido:", token, "Código recibido:", code);
            try {
                const decode = jwt.verify(token, SECRET) as { id: string; email: string } ;
                const factor = await GetFactorCode(decode.id);
                const verified = speakeasy.totp.verify({
                    secret: factor,
                    encoding: "base32",
                    token: code,
                });
                if (!verified) {
                    return { success: false, message: "Código inválido" };
                }
                const actived = await Actived2FA(decode.id);
                if(!actived){
                    return { success: false, message: "Error al actualizar la activacion" };
                }
                return { success: true, message: "2FA activado correctamente" };
            } catch (err: string | any) {
                return { error: err.message || "Error al verificar el codigo" };
            }
        }
    }),
    activa2FA: defineAction({
        input: z.object({
            token: z.string().min(1, "Token requerido"),
        }),
        handler: async ({ token }) => {
            try {
                const decode = jwt.verify(token, SECRET) as { id: string; email: string };
                const secretqr = speakeasy.generateSecret({
                    name: `Better With a Teacher (${decode.email})`,
                });
                const qrCode = await QRCode.toDataURL(secretqr.otpauth_url!);
                await SetSecret2FA(decode.id,secretqr.base32);
                return { success: true, qr: qrCode };
            } catch (err: string | any) {
                return { error: err.message || "Error al crear el nuevo horario" };
            }
        }
    })
}