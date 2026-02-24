import type { APIRoute } from "astro";
import { ValidateLogin } from "../../../lib/db.js";
export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const email = formData.get("email");
    const clave = formData.get("pass");

    if (!email) {
      return new Response(JSON.stringify({ error: "Ingrese el usuario" }), {
        status: 400,
      });
    }
    if (!clave) {
      return new Response(JSON.stringify({ error: "Ingrese la clave" }), {
        status: 400,
      });
    }
    const login = await ValidateLogin(email,clave);
    if (!login.success) {
      return new Response(JSON.stringify({ error: login.message }), {
        status: 401,
      });
    }

    return new Response(JSON.stringify(login), { status: 200 });
  } catch (err: string | any) {
    return new Response(
      JSON.stringify({ error: err.message || "No podemos iniciar la sesión" }),
      {
        status: 400,
      }
    );
  }
};