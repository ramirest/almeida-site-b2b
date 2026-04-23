import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  // No edge runtime, a role pode vir direto no token dependendo da versão do Auth.js
  const userRole = req.auth?.user?.role || (req.auth as any)?.role;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAuthRoute = nextUrl.pathname === "/admin/login";

  if (isAdminRoute) {
    if (isAuthRoute) {
      // Se for a tela de login, mas já estiver logado como admin, vai pro dashboard
      if (isLoggedIn && userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", nextUrl));
      }
      return NextResponse.next();
    }

    // Se tentar acessar qualquer outra página de /admin e não estiver logado
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", nextUrl));
    }

    // Se estiver logado, mas não for ADMIN
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/?error=AccessDenied", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
