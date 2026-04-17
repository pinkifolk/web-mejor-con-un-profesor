import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { Storage } from "@google-cloud/storage";
import { GetAwarded, GetToursAdmin, NewAwarded, DeleteAwarded } from "@/lib/db";
import fs from "fs";
import path from "node:path";
const storage = new Storage();
const bucketName = "betterwhitateacher";

export const awardedActions = {
  read: defineAction({
    handler: async () => {
      const getAwarded = await GetAwarded();
      return JSON.parse(JSON.stringify(getAwarded));
    },
  }),
  create: defineAction({
    accept: "form",
    input: z.object({
      tour: z.number().min(1, "El tour es requerido"),
      logo: z
        .instanceof(File, { message: "La imagen debe ser un archivo válido" })
        .refine(
          (file) =>
            ["image/jpeg", "image/png", "image/webp"].includes(file.type),
          "Solo se permiten formatos JPG, PNG o WEBP",
        ),
    }),
    handler: async ({ tour, logo }) => {
      const ext = logo?.name.split(".").pop();
      const newFileName = `logo-${Date.now()}.${ext}`;
      const buffer = Buffer.from(await logo.arrayBuffer());
      const isLocal = process.env.SSL === "false";
      if (!isLocal) {
        const publicPath = path.join(
          process.cwd(),
          "public",
          "img",
          newFileName,
        );
        await fs.promises.writeFile(publicPath, buffer);
      } else {
        const buffer = Buffer.from(await logo.arrayBuffer());
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(`img/${newFileName}`);

        await file.save(buffer, {
          metadata: { contentType: logo.type },
        });
      }

      const urlImage = !isLocal
        ? newFileName
        : `https://storage.googleapis.com/${bucketName}/img/${newFileName}`;
      const newAwarded = await NewAwarded({ tour, urlImage });
      return JSON.parse(JSON.stringify(newAwarded));
    },
  }),
  delete: defineAction({
    accept: "form",
    input: z.object({
      id: z.string().min(1, "El ID es requerido para eliminar un premiado"),
    }),
    handler: async ({ id }) => {
      const deletedAwarded = await DeleteAwarded({ id });
      return JSON.parse(JSON.stringify(deletedAwarded));
    },
  }),
  selectTours: defineAction({
    handler: async () => {
      const tours = await GetToursAdmin();
      return JSON.parse(JSON.stringify(tours));
    },
  }),
};
