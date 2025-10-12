import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const server = {
  getHours: defineAction({
    handler: async (input, context) => {
      return context
    }
  }
  ),

}