import type { APIRoute } from "astro";
import { GetUsers, deleteHour, NewUser, ChangeStatusHour } from "../../../lib/db.js";
export const GET: APIRoute = async () => {
  try {
      const users = await GetUsers();
      return new Response(JSON.stringify(users), { status: 200 });
  } catch (err: string | any) {
    return new Response(
      JSON.stringify({ error: err.message || "Error al obtener los usuarios" }),
      {
        status: 400,
      }
    );
  }
};
export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("pass");

    if (!name) {
      return new Response(JSON.stringify({ error: "Debe indicar el nombre" }), {
        status: 400,
      });
    }
    if (!email) {
      return new Response(JSON.stringify({ error: "Debe indicar el email" }), {
        status: 400,
      });
    }
    if (!password) {
      return new Response(JSON.stringify({ error: "Debe indicar la contraseña" }), {
        status: 400,
      });
    }
    const newUser = await NewUser(name,email,password);
    return new Response(JSON.stringify(newUser), { status: 200 });
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