import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAuthRoute = nextUrl.pathname === "/admin/login";

  // Se acessar /admin (mas não for /admin/login) e não logado -> vai pro login
  if (isAdminRoute && !isAuthRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", nextUrl));
  }

  // Se acessar /admin logado, verificar se tem role ADMIN
  if (isAdminRoute && !isAuthRoute && isLoggedIn) {
    if (user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/?error=AccessDenied", nextUrl));
    }
  }

  // Se tentar acessar o login de admin e já for admin logado
  if (isAuthRoute && isLoggedIn && user?.role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
