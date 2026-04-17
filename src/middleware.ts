import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;
  const pathname = url.pathname;

  const isAdminPath = pathname.includes("/aNKiNFLow");

  if (!isAdminPath) {
    return next();
  }

  const isLoginPage = pathname.endsWith("/aNKiNFLow") || pathname.endsWith("/aNKiNFLow/");
  const token = cookies.get("loginToken")?.value || cookies.get("2fa_token")?.value;

  if (!isLoginPage && !token) {
    const loginUrl = pathname.split("/aNKiNFLow")[0] + "/aNKiNFLow";
    return redirect(loginUrl);
  }

  return next();
});