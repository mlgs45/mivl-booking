import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Exclut assets statiques, routes API Auth.js, et métadonnées générées
  // par Next.js (icon.svg, apple-icon, manifest.webmanifest, etc.)
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|icon.svg|apple-icon|manifest.webmanifest|robots.txt|sitemap.xml|images).*)",
  ],
};

export default middleware;
