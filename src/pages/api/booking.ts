import type { APIRoute } from "astro";
import { NewBooking } from "../../lib/db.js";
import type { a } from "node_modules/tailwindcss/dist/types-B254mqw1.mjs";

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    const hash = await NewBooking(data)

    return new Response(JSON.stringify({ id: hash}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error:any) {
    console.error("Error al procesar la reserva:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};