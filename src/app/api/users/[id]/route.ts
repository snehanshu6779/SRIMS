import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { isDatabaseConfigured, getPrismaClient } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "No database configured." }, { status: 503 });
  }
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { name, email, role, departmentId, isActive, avatarUrl, password } = body;

    const prisma = getPrismaClient();
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (role !== undefined) data.role = role;
    if (departmentId !== undefined) data.departmentId = departmentId;
    if (isActive !== undefined) data.isActive = isActive;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    if (password) data.passwordHash = await bcrypt.hash(password, 10);

    const updated = await prisma.user.update({ where: { id: params.id }, data });
    return NextResponse.json({ id: updated.id });
  } catch (err) {
    console.error("[api/users/:id PATCH]", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "No database configured." }, { status: 503 });
  }
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (session.user.id === params.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  try {
    const prisma = getPrismaClient();
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/users/:id DELETE]", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 400 });
  }
}
