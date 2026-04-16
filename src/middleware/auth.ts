import type { MiddlewareNext } from "astro";

export async function validateSession(context: any, next: MiddlewareNext) {
  const { url, cookies, redirect } = context;
  const isLoginPage =
    url.pathname === "/aNKiNFLow" || url.pathname === "/aNKiNFLow/";

  if (url.pathname.startsWith("/aNKiNFLow") && !isLoginPage) {
    const token = cookies.get("loginToken")?.value || cookies.get("2fa_token")?.value;

    if (!token) return redirect("/aNKiNFLow");
  }
  return next();
}
