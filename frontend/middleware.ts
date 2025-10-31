import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Récupérer le cookie d'authentification
  const authCookie = request.cookies.get("auth");
  let isAuthenticated = false;

  if (authCookie) {
    try {
      const authData = JSON.parse(decodeURIComponent(authCookie.value));
      isAuthenticated = authData?.state?.isAuthenticated === true;
    } catch {
      // Si erreur de parsing, considérer comme non authentifié
      isAuthenticated = false;
    }
  }

  // Routes d'authentification (accessibles uniquement si NON connecté)
  const authRoutes = [
    "/auth/sign-in",
    "/auth/sign-up",
    "/email/verify-email",
    "/password/forgot-password",
    "/password/reset-password",
  ];

  // Routes protégées (accessibles uniquement si connecté)
  const protectedRoutes = ["/dashboard"];

  // Vérifier si c'est une route d'authentification
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Vérifier si c'est une route protégée
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Si l'utilisateur est authentifié et tente d'accéder aux routes auth
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Si l'utilisateur n'est pas authentifié et tente d'accéder aux routes protégées
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
