import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import {GetUsers, NewUser,updateUser,deleteUser,resetPasswordUser} from '@/lib/db'
export const userActions = {
    read: defineAction({
        handler: async () => {
            const data = await GetUsers()
            return JSON.parse(JSON.stringify(data));
        }
    }),
    create: defineAction({
        accept: 'form',
        input: z.object({
            name: z.string().min(1, "El nombre es requerido"),
            email: z.string().email("El email no es válido"),
            password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
        }),
        handler: async ({ name, email, password }) => {
            const newUser = await NewUser(name, email, password);
            return JSON.parse(JSON.stringify(newUser));
        }

    }),
    update: defineAction({
        accept: 'form',
        input: z.object({
            id: z.string().min(1, "El ID es requerido"),
            editName: z.string().min(1, "El nombre es requerido").optional(),
            editEmail: z.string().email("El email no es válido").optional(),
            editStatus: z.any().optional().transform((val) => val === "on" ? true : false)
        }),
        handler: async ({ id, editName, editEmail, editStatus }) => {
            const updatedUser = await updateUser(id, editName, editEmail, editStatus);
            return JSON.parse(JSON.stringify(updatedUser));
        }
    }),
    resetpassword: defineAction({
        accept: 'form',
        input: z.object({
            id: z.string().min(1, "El ID es requerido"),
            passwordNew: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
            repitPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres")
        }).refine((data) => data.passwordNew === data.repitPassword, {
                message: "Las contraseñas no coinciden",
        }),
        handler: async ({ id, repitPassword }) => {
            const resetPassword = await resetPasswordUser(id,repitPassword);
            return JSON.parse(JSON.stringify(resetPassword));
        } 
    }),
    delete: defineAction({
        accept: 'form',
        input: z.object({
            id: z.string().min(1, "El ID es requerido"),
        }),
        handler: async ({ id }) => {
            const deletedUser = await deleteUser(id);
            return JSON.parse(JSON.stringify(deletedUser));
        }
    })
    
}