import { defineMiddleware } from "astro:middleware";
import { validateSession } from "@/middleware/auth";

export const onRequest = defineMiddleware(async (context, next) => {
    return validateSession(context,next)
})
