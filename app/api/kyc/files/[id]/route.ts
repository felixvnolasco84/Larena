import { NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const origin = request.headers.get("origin");
  if (
    !origin ||
    origin !== `${request.nextUrl.protocol}//${request.headers.get("host")}`
  )
    return new Response(null, { status: 403 });
  if (!process.env.NEXT_PUBLIC_CONVEX_URL || !process.env.KYC_FILE_PROXY_SECRET)
    return new Response(null, { status: 503 });
  try {
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
      logger: false,
    });
    const auth = await convexAuthNextjsToken();
    if (auth) client.setAuth(auth);
    const payload = await request.json();
    const result = await client.query(api.kyc.fileSource, {
      id: params.id as Id<"files">,
      proxyKey: process.env.KYC_FILE_PROXY_SECRET,
      ...(typeof payload.token === "string" ? { token: payload.token } : {}),
    });
    if (!result.url) return new Response(null, { status: 404 });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    let file: Response;
    try {
      file = await fetch(result.url, {
        cache: "no-store",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    if (!file.ok) return new Response(null, { status: 404 });
    return new Response(file.body, {
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(result.name).replace(/'/g, "%27")}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch {
    return new Response(null, { status: 403 });
  }
}
