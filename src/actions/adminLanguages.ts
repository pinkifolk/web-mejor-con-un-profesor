import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { GetLanguages, NewLanguages, DeleteLanguages, Translate } from "@/lib/db";
export const LanguagesAction = {
  read: defineAction({
    handler: async () => {
      const data = await GetLanguages();
      return JSON.parse(JSON.stringify(data));
    },
  }),
  create: defineAction({
    accept: "form",
    input: z.object({
      name: z.string().min(1, "El nombre es requerido"),
      code: z.string().email("El email no es válido"),
      icon: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    }),
    handler: async ({ name, code, icon }) => {
      const newLanguage = await NewLanguages(name, code, icon);
      return JSON.parse(JSON.stringify(newLanguage));
    },
  }),
  delete: defineAction({
    accept: "form",
    input: z.object({
      id: z.string(),
    }),
    handler: async ({ id }) => {
      const deleteLanguages = await DeleteLanguages(id);
      return JSON.parse(JSON.stringify(deleteLanguages));
    },
  }),
  translate :defineAction({
    accept: 'json',
    input: z.object({
      fields: z.object({
        title: z.string(),
        descripcion: z.string(),
        findme: z.string()
      }),
      targetLang: z.array(z.string())
    }),
    handler: async ({ fields, targetLang }) =>{
      const translate = await Translate(fields, targetLang);
      return JSON.parse(JSON.stringify(translate));
    }
  })
};
