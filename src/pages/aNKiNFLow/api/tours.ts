import type { APIRoute } from "astro";
import { DeleteTour, GetToursAdmin } from "../../../lib/db.js";
import fs from "fs";

export const GET: APIRoute = async () => { 
  try {
    const tours = await GetToursAdmin();
    return new Response(JSON.stringify(tours), { status: 200 });
  } catch (err:string|any) {
    return new Response(
      JSON.stringify({ error: err.message || "Error al obtener los tours" }),
      {
        status: 400,
      }
    );
  }
}
export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const { NewTour } = await import("../../../lib/db.js");
    const title = formData.get("title");
    const imgFile = formData.get("imgTour");

    if (!(imgFile instanceof File)) {
      return new Response(JSON.stringify({ error: "Archivo no válido" }), {
        status: 400,
      });
    }

    const slug = title
      ?.toString()
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
    const ext = imgFile?.name.split(".").pop();
    const newFileName = `${slug}.${ext}`;
    formData.set("imgTour", newFileName);

    //cargar la imagen y obtener nnombre
    const buffer = Buffer.from(await imgFile?.arrayBuffer());
    await fs.promises.writeFile(`./public/img/${newFileName}`, buffer);
    const tour = {
      title: formData.get("title"),
      description: formData.get("description"),
      imgTour: newFileName,
      timing: formData.get("timing"),
      persons: formData.get("persons"),
      points: JSON.parse((formData.get("points") as string) || "[]"),
      slug: slug,
      populate: formData.get("popular") === 'on' ? true : false,
      horario: JSON.parse((formData.get("horario") as string) || "[]"),
    };
    const newTour = await NewTour(tour);
    return new Response(JSON.stringify(newTour), { status: 200 });
  } catch (err:string|any) {
    return new Response(
      JSON.stringify({ error: err.message || "Error al crear el tour" }),
      {
        status: 400,
      }
    );
  }
};
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id  = url.searchParams.get("id");
    if (!id) {
      return new Response(JSON.stringify({ error: "ID no válido" }), {
        status: 400,
      });
    }
    const deleted = await DeleteTour(id);
    return new Response(JSON.stringify(deleted), { status: 200 });
  } catch (err:string|any) {
    return new Response(
      JSON.stringify({ error: err.message || "Error al eliminar el tour" }),
      {
        status: 400,
      }
    );
  }
}

