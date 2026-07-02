import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isDatabaseConfigured, getPrismaClient } from "@/lib/prisma";

async function requireManager() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "INVENTORY_MGR")) {
    return null;
  }
  return session;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const prisma = getPrismaClient();
    const supplier = await prisma.supplier.findUnique({ where: { id: params.id } });
    if (!supplier) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    return NextResponse.json(supplier);
  } catch (err) {
    console.error("[api/suppliers/:id GET]", err);
    return NextResponse.json({ error: "Failed to load supplier" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const session = await requireManager();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const prisma = getPrismaClient();
    const body = await req.json();
    const { name, contact, address } = body;

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.supplier.update({
        where: { id: params.id },
        data: {
          ...(name !== undefined && { name }),
          ...(contact !== undefined && { contact: contact || null }),
          ...(address !== undefined && { address: address || null }),
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "UPDATE",
          entity: "Supplier",
          entityId: params.id,
          after: `Updated supplier ${updated.name}`,
        },
      });

      return updated;
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/suppliers/:id PATCH]", err);
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const session = await requireManager();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const prisma = getPrismaClient();

    const result = await prisma.$transaction(async (tx) => {
      const deleted = await tx.supplier.delete({ where: { id: params.id } });

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "DELETE",
          entity: "Supplier",
          entityId: params.id,
          after: `Deleted supplier ${deleted.name}`,
        },
      });

      return { success: true };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/suppliers/:id DELETE]", err);
    return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 });
  }
}
