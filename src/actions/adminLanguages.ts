import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import {GetLanguages, NewLanguages} from '@/lib/db'
export const LanguagesAction = {
    read: defineAction({
        handler: async () => {
            const data = await GetLanguages()
            return JSON.parse(JSON.stringify(data));
        }
    }),
    create: defineAction({
        accept: 'form',
        input: z.object({
            name: z.string().min(1, "El nombre es requerido"),
            code: z.string().email("El email no es válido"),
            icon: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
        }),
        handler: async ({ name, code, icon }) => {
            const newLanguage = await NewLanguages(name, code, icon);
            return JSON.parse(JSON.stringify(newLanguage));
        }

    }),
    // update: defineAction({
    //     accept: 'form',
    //     input: z.object({
    //         id: z.string().min(1, "El ID es requerido"),
    //         editName: z.string().min(1, "El nombre es requerido").optional(),
    //         editEmail: z.string().email("El email no es válido").optional(),
    //         editStatus: z.any().optional().transform((val) => val === "on" ? true : false)
    //     }),
    //     handler: async ({ id, editName, editEmail, editStatus }) => {
    //         const updatedUser = await updateUser(id, editName, editEmail, editStatus);
    //         return JSON.parse(JSON.stringify(updatedUser));
    //     }
    // })
    
}