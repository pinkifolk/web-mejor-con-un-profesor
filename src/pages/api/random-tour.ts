import type { APIRoute } from "astro";
import { RandomTour } from "../../lib/db.js";

export const GET: APIRoute = async () => {
  const res = await RandomTour();
  return new Response(JSON.stringify({ response: res }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
}