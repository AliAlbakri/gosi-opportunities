import { NextResponse, type NextRequest } from "next/server";

function configured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  return url.length > 20 && key.length > 20 && !url.includes("xxxx");
}

export function middleware(request: NextRequest) {
  if (configured()) return NextResponse.next();
  if (request.nextUrl.pathname === "/") return NextResponse.next();
  return NextResponse.rewrite(new URL("/", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api|brand|favicon.ico).*)"],
};
