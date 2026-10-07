import {
  NextResponse,
  type NextRequest,
  type NextFetchEvent,
} from "next/server";
import {
  convexAuthNextjsMiddleware,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const authenticated = convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    if (
      request.nextUrl.pathname.startsWith("/admin/kyc") &&
      !(await convexAuth.isAuthenticated())
    )
      return nextjsMiddlewareRedirect(request, "/admin/login");
  },
);
export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  const response = process.env.NEXT_PUBLIC_CONVEX_URL
    ? await authenticated(request, event)
    : NextResponse.next();
  if (response) {
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Content-Type-Options", "nosniff");
  }
  return response;
}
export const config = {
  matcher: [
    "/kyc/:path*",
    "/admin/:path*",
    "/api/auth/:path*",
    "/api/kyc/:path*",
  ],
};
