import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    console.log("[MIDDLEWARE] TOKEN:", req.nextauth.token);

    return NextResponse.next();
  },
  {
    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {
      authorized: ({ token }) => {
        console.log("[MIDDLEWARE] AUTHORIZED:", token);
        return !!token;
      },
    },

    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/requisitions/:path*",
    "/approvals/:path*",
    "/inventory/:path*",
    "/issue/:path*",
    "/masters/:path*",
    "/reports/:path*",
    "/system/:path*",
  ],
};