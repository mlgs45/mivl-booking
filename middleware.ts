import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Exclut assets statiques et routes API Auth.js
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|images).*)"],
};

export default middleware;
