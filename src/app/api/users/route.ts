import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { isDatabaseConfigured, getPrismaClient } from "@/lib/prisma";

/**
 * Real persistence for the Masters → Users page, used only when a database
 * is connected. Without DATABASE_URL set, these routes return 503 and the
 * Users page falls back to its existing Zustand-only behavior (the user is
 * added to the in-memory store and the UI updates, but won't survive a
 * refresh and can't log in — this is the known, documented limitation).
 *
 * All routes require an authenticated ADMIN session.
 */

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET() {
  if (!isDatabaseConfigured) {
    return NextResponse.json(
      { error: "No database configured. Set DATABASE_URL to enable persistent users." },
      { status: 503 }
    );
  }
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const prisma = getPrismaClient();
    const dbUsers = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true,
        departmentId: true, isActive: true, avatarUrl: true,
        department: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(dbUsers);
  } catch (err) {
    console.error("[api/users GET]", err);
    return NextResponse.json({ error: "Database query failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured) {
    return NextResponse.json(
      { error: "No database configured. Set DATABASE_URL to enable persistent users." },
      { status: 503 }
    );
  }
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { name, email, role, departmentId, password } = body;
    if (!name || !email || !role || !departmentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prisma = getPrismaClient();
    const passwordHash = await bcrypt.hash(password || "Welcome@123", 10);

    const newUser = await prisma.user.create({
      data: { name, email, role, departmentId, passwordHash, isActive: true },
    });

    return NextResponse.json({ id: newUser.id, name: newUser.name, email: newUser.email }, { status: 201 });
  } catch (err: unknown) {
    console.error("[api/users POST]", err);
    const message = err instanceof Error && err.message.includes("Unique constraint")
      ? "A user with this email already exists"
      : "Failed to create user";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
