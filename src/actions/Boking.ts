import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { GetHoursBySlug, GetAvailability,NewBooking,ConfirmBooking, GetBookingStatus, RandomTour } from "@/lib/db";

export const bookingActions = {
  readBySlug: defineAction({
    input: z.object({
      slug: z.string(),
    }),
    handler: async ({slug}) => {
        const getTourBySlug = await GetHoursBySlug(slug);
        return JSON.parse(JSON.stringify(getTourBySlug));
    },
  }),
  availability: defineAction({
    input: z.object({
      slug: z.string(),
      date: z.string(),
    }),
    handler: async ({ slug, date }) => {
      const getAvailability = await GetAvailability(date,slug);
      return JSON.parse(JSON.stringify(getAvailability));
    },
  }),
  newBooking: defineAction({
    input: z.object({
      slug: z.string(),
      date: z.string(),
      hour: z.string(), 
      adultos: z.number(),
      ninos: z.number(),
    }),
    handler: async ({ slug, date, hour, adultos, ninos }) => {
      const newBooking = await NewBooking({slug, date, hour, adultos, ninos});
      return JSON.parse(JSON.stringify(newBooking));
    },
  }),
  confirmBooking: defineAction({
    input: z.object({
      nombre: z.string().min(1, "El nombre es requerido"),
      apellido: z.string().min(1, "El apellido es requerido"),
      email: z.string().email("El email no es válido"),
      telefono: z.string().min(1, "El teléfono es requerido"),
      id: z.string(),
    }),
    handler: async ({ nombre, apellido, email, telefono, id }) => {
      const confirmBooking = await ConfirmBooking({nombre, apellido, email, telefono, id});
      return JSON.parse(JSON.stringify(confirmBooking));
    },
  }),
  getBookingStatus: defineAction({
    input: z.object({
      id: z.string(),
    }),
    handler: async ({ id }) => {
      const getBookingStatus = await GetBookingStatus({ id });
      return JSON.parse(JSON.stringify(getBookingStatus));
    },
  }),
  randomTour: defineAction({
    handler: async () => {
      const randomTour = await RandomTour();
      return JSON.parse(JSON.stringify(randomTour));
    },
  }),
};