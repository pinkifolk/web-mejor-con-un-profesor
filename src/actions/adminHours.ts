import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { GetHours, NewHour, updateHour, deleteHour } from '@/lib/db'

export const hourActions = {
    read: defineAction({
        handler: async () => {
            const data = await GetHours()
            return JSON.parse(JSON.stringify(data));
        }
    }),
    create: defineAction({
        accept: 'form',
        input: z.object({
            hour: z.string().min(1, "La hora es requerida"),
        }),
        handler: async ({ hour }) => {
            const newHour = await NewHour(hour);
            return JSON.parse(JSON.stringify(newHour));
        }
    }),
    update: defineAction({
        accept: 'form',
        input: z.object({
            id: z.string().min(1, "El ID es requerido"),
            editHour: z.string().min(1, "La hora es requerida").optional(),
        }),
        handler: async ({ id, editHour }) => {
            console.log({ id, editHour })
            const updatedHour = await updateHour(id, editHour);
            return JSON.parse(JSON.stringify(updatedHour));
        }
    }),
    delete: defineAction({
        accept: 'form',
        input: z.object({
            id: z.string().min(1, "El ID es requerido"),
        }),
        handler: async ({ id }) => {
            const deletedHour = await deleteHour(id);
            return JSON.parse(JSON.stringify(deletedHour));
        }
    }),
}