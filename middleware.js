export default function middleware(request) {
  const { pathname } = new URL(request.url);

  // Libera rotas de API e assets estáticos
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_expo/") ||
    pathname.startsWith("/assets/") ||
    pathname === "/favicon.ico"
  ) {
    return;
  }

  const token = request.cookies.get("echomind_token")?.value;

  if (token && token === process.env.ADMIN_TOKEN) {
    return; // autenticado
  }

  const loginUrl = new URL("/api/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return Response.redirect(loginUrl, 302);
}

export const config = {
  matcher: ["/((?!_expo|assets|favicon\\.ico).*)"],
};
