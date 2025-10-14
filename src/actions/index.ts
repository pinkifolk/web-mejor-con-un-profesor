import { defineAction } from "astro:actions";
import {GetDestinosPopulate} from '@/lib/db'
import { z } from "astro:schema";

export const server = {
  GetDestinosPopulate: defineAction({
    async handler(){
      const data = await GetDestinosPopulate()
      return JSON.parse(JSON.stringify(data));

    }
  }
  ),

}