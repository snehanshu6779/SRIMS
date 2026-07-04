import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
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