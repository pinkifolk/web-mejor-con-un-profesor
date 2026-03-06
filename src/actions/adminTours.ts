import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { Storage } from "@google-cloud/storage";
import fs from "fs";
import path from "node:path";
import {
  NewTour,
  ChangeStatus,
  GetToursAdmin,
  GetToursAdminById,
  DeleteTour,
} from "@/lib/db";
const storage = new Storage();
const bucketName = "betterwhitateacher";

export const toursActions = {
  read: defineAction({
    handler: async () => {
      const getTourAdmin = await GetToursAdmin();
      return JSON.parse(JSON.stringify(getTourAdmin));
    },
  }),
  readById: defineAction({
    input: z.object({
      id: z.string(),
    }),
    handler: async ({ id }) => {
      const getTourByid = await GetToursAdminById(id);
      return JSON.parse(JSON.stringify(getTourByid));
    },
  }),
  create: defineAction({
    accept: "form",
    input: z.object({
      title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
      description: z
        .string()
        .max(2000, "La descripción no puede exceder 2000 caracteres"),
      imgTour: z
        .instanceof(File, { message: "La imagen debe ser un archivo válido" })
        .refine(
          (file) =>
            ["image/jpeg", "image/png", "image/webp"].includes(file.type),
          "Solo se permiten formatos JPG, PNG o WEBP",
        ),
      timing: z.string().min(1, "Debe haber al menos un punto de interés"),
      horario: z.string().min(1, "Debe haber al menos un horario disponible"),
      points: z
        .string()
        .min(
          3,
          "El título del punto de interés debe tener al menos 3 caracteres",
        ),
      persons: z
        .string()
        .min(1, "Debe haber al menos una persona permitida para el tour"),
      popular: z.boolean().optional(),
    }),
    handler: async ({
      title,
      description,
      imgTour,
      timing,
      horario,
      points,
      persons,
      popular,
    }) => {
      const slug = title
        ?.toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-");
      if (!imgTour || !(imgTour instanceof File)) {
        throw new Error("No se recibió una imagen válida");
      }
      const ext = imgTour?.name.split(".").pop();
      const newFileName = `${slug}.${ext}`;
      const buffer = Buffer.from(await imgTour.arrayBuffer());

      // subir local y en qa subir al bucket de google cloud storage
      const isLocal = process.env.SSL === "false";
      if (!isLocal) {
        const publicPath = path.join(process.cwd(), 'public', 'img', newFileName);
        await fs.promises.writeFile(publicPath, buffer);
      } else {
        const buffer = Buffer.from(await imgTour.arrayBuffer());
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(`img/${newFileName}`);

        await file.save(buffer, {
          metadata: { contentType: imgTour.type },
        });
      }

      const urlImage = !isLocal
        ? newFileName
        : `https://storage.googleapis.com/${bucketName}/img/${newFileName}`;
      const newTour = await NewTour({
        title,
        description,
        imgTour: urlImage,
        timing,
        persons,
        points,
        slug,
        popular,
        horario,
      });
      return JSON.parse(JSON.stringify(newTour));
    },
  }),
  changeStatus: defineAction({
    input: z.object({
      id: z.string(),
      status: z.boolean(),
    }),
    handler: async ({ id, status }) => {
      const changeStatus = await ChangeStatus(id, status);
      return JSON.parse(JSON.stringify(changeStatus));
    },
  }),
  delete: defineAction({
    input: z.object({
      id: z.string(),
     
    }),
    handler: async ({ id }) => {
      const deleteTour = await DeleteTour(id);
      return JSON.parse(JSON.stringify(deleteTour));
    },
  }),

};
