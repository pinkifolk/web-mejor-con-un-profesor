import type { APIRoute } from "astro";
import { GetHours, deleteHour, NewHour, ChangeStatusHour } from "../../../lib/db.js";
import { string } from "astro:schema";
export const GET: APIRoute = async () => {
  try {
      const hours = await GetHours();
      return new Response(JSON.stringify(hours), { status: 200 });
  } catch (err: string | any) {
    return new Response(
      JSON.stringify({ error: err.message || "Error al obtener los tours" }),
      {
        status: 400,
      }
    );
  }
};
export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const hora = formData.get("nuevaHora");

    if (!hora) {
      return new Response(JSON.stringify({ error: "Horario no indicado" }), {
        status: 400,
      });
    }
    const newHour = await NewHour(hora);
    return new Response(JSON.stringify(newHour), { status: 200 });
  } catch (err: string | any) {
    return new Response(
      JSON.stringify({ error: err.message || "Error al crear el nuevo horario" }),
      {
        status: 400,
      }
    );
  }
};
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return new Response(JSON.stringify({ error: "ID no válido" }), {
        status: 400,
      });
    }
    const deleted = await deleteHour(id);
    return new Response(JSON.stringify(deleted), { status: 200 });
  } catch (err: string | any) {
    return new Response(
      JSON.stringify({ error: err.message || "Error al eliminar la hora" }),
      {
        status: 400,
      }
    );
  }
};
export const PUT: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const hour = url.searchParams.get("hora");
    if (!id) {
      return new Response(JSON.stringify({ error: "ID no válido" }), {
        status: 400,
      });
    }
    if (!hour) {
      return new Response(JSON.stringify({ error: "Hora no válida" }), {
        status: 400,
      });
    }
    const edited = await ChangeStatusHour(id, hour);
    return new Response(JSON.stringify(edited), { status: 200 });
  } catch (err: string | any) {
    return new Response(
      JSON.stringify({ error: err.message || "Error al editar la hora" }),
      {
        status: 400,
      }
    );
  }
};