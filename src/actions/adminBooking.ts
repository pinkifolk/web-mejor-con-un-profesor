import { actions, defineAction } from "astro:actions";
import { DetailBooking,ActionsBooking } from "@/lib/db";

import { z } from "astro:schema";
export const bookingAction = {
  readDetail: defineAction({
    input: z.object({
      id: z.string(),
      hour: z.string(),
    }),
    handler: async ({ id, hour }) => {
      const detailBooking = await DetailBooking(id, hour);
      return JSON.parse(JSON.stringify(detailBooking));
    },
  }),
  actions: defineAction({
    input: z.object({
      id: z.string(),
      hour: z.string(),
      accion: z.string(),
    }),
    handler: async ({ id, hour, accion }) => {
      const actionsBooking = await ActionsBooking(id, hour, accion);
      return JSON.parse(JSON.stringify(actionsBooking));
    },
  }),
};
