import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user; // Garante que tem um objeto user real
  const userRole = req.auth?.user?.role || (req.auth as any)?.role;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAuthRoute = nextUrl.pathname === "/admin/login";

  if (isAdminRoute) {
    if (isAuthRoute) {
      if (isLoggedIn && userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", nextUrl));
      }
      return NextResponse.next();
    }

    // Se não estiver logado OU não for ADMIN, manda de volta pro login
    if (!isLoggedIn || userRole !== "ADMIN") {
      // Usando uma URL limpa para o login
      return NextResponse.redirect(new URL("/admin/login", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
