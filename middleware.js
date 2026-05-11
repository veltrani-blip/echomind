export default function middleware(request) {
  const { pathname } = new URL(request.url);

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_expo/") ||
    pathname.startsWith("/assets/") ||
    pathname === "/favicon.ico"
  ) {
    return;
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k.trim(), v.join("=")];
    })
  );

  const token = cookies["echomind_token"];

  if (token && token === process.env.ADMIN_TOKEN) {
    return;
  }

  const loginUrl = new URL("/api/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return Response.redirect(loginUrl, 302);
}

export const config = {
  matcher: ["/((?!_expo|assets|favicon\\.ico).*)"],
};
