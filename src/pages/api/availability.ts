import type { APIRoute } from "astro";
import { GetAvailability } from "../../lib/db.js";
import type { Availability } from "../../types/tours.js";

export const GET: APIRoute = async ({ url }) => {
  const date = url.searchParams.get("date");
  const slug = url.searchParams.get("slug");
  if (!date || !slug) {
    return new Response(JSON.stringify({ error: "Falta la fecha y el slug" }), {
      status: 400,
    });
  }
  try {
    const availability: Availability[] = await GetAvailability(date,slug);
    return new Response(JSON.stringify(availability[0] || { total: "0", disponible: "0" }), {
      status: 200,
    });
  } catch (error: any) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
