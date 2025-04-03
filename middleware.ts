import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "./types/user";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (req.nextUrl.pathname.startsWith("/auth/login")) {
    return NextResponse.next();
  }

  if (
    token?.exp &&
    typeof token.exp === "number" &&
    token.exp * 1000 < Date.now()
  ) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (!token || !token.accessToken) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const restrictedRoutes: Record<string, string> = {
    "/dashboard/incidents/admin": Role.ADMIN,
    "/dashboard/nurses": Role.ADMIN,
  };

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BE_API_URL}/users/me/role`,
      {
        headers: { Authorization: `Bearer ${token.accessToken}` },
      },
    );

    if (!res.ok) throw new Error("Failed to fetch user role");

    const userRole = await res.json();
    const role = userRole.role;

    for (const [path, requiredRole] of Object.entries(restrictedRoutes)) {
      if (req.nextUrl.pathname.startsWith(path) && role !== requiredRole) {
        return NextResponse.redirect(new URL("/dashboard/home", req.url));
      }
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/incidents/admin/:path*", "/dashboard/nurses/:path*"],
};
