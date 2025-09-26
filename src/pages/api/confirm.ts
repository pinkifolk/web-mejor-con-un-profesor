import type { APIRoute } from "astro";
import { ConfirmBooking } from "../../lib/db.js";

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const response = await ConfirmBooking(data);

    return new Response(JSON.stringify({ response: response }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error al confirmar la reserva:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
