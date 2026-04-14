import { defineAction } from "astro:actions";
import {
  BookingByDate,
  BookingByid,
  CancelPerson,
  CloseBooking,
  CancelBooking
} from "@/lib/db";

import { z } from "astro:schema";
export const bookingAction = {
  read: defineAction({
    handler: async () => {
      const detailBooking = await BookingByDate();
      return JSON.parse(JSON.stringify(detailBooking));
    },
  }),
  readById: defineAction({
    input: z.object({
      id: z.string(),
    }),
    handler: async ({ id }) => {
      const detailBooking = await BookingByid(id);
      return JSON.parse(JSON.stringify(detailBooking));
    },
  }),
  cancelPerson: defineAction({
    input: z.object({
      id: z.number().min(1,"Tour requerido"),
    }),
    handler: async ({ id }) => {
      const cancelPerson = await CancelPerson(id);
      return JSON.parse(JSON.stringify(cancelPerson));
    },
  }),
  closeBooking: defineAction({
    input: z.object({
      tour: z.string().min(1,"Tour requerido"),
      date: z. string().min(1,"Fecha requerida"),
      hour: z.string().min(1,"Hora requerida"),
    }),
    handler: async ({tour,date,hour}) => {
      const closeBooking = await CloseBooking(tour,date,hour);
      return JSON.parse(JSON.stringify(closeBooking));
    }
  }),
  cancelBooking: defineAction({
    input: z.object({
      tour: z.string().min(1,"Tour requerido"),
      date: z. string().min(1,"Fecha requerida"),
      hour: z.string().min(1,"Hora requerida"),
    }),
    handler: async ({tour,date,hour}) => {
      const cancelBooking = await CancelBooking(tour,date,hour);
      return JSON.parse(JSON.stringify(cancelBooking));
    }
  }),
};
