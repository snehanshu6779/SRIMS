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
    const item = await prisma.item.findUnique({
      where: { id: params.id },
      include: { category: true },
    });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (err) {
    console.error("[api/items/:id GET]", err);
    return NextResponse.json({ error: "Failed to load item" }, { status: 500 });
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
    const { name, categoryId, unit, unitPrice, minStockLevel, currentStock, iconKey, isActive } = body;

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.item.update({
        where: { id: params.id },
        data: {
          ...(name !== undefined && { name }),
          ...(categoryId !== undefined && { categoryId }),
          ...(unit !== undefined && { unit }),
          ...(unitPrice !== undefined && { unitPrice }),
          ...(minStockLevel !== undefined && { minStockLevel }),
          ...(currentStock !== undefined && { currentStock }),
          ...(iconKey !== undefined && { iconKey: iconKey || null }),
          ...(isActive !== undefined && { isActive }),
        },
        include: { category: true },
      });

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "UPDATE",
          entity: "Item",
          entityId: params.id,
          after: `Updated item ${updated.name} (${params.id})`,
        },
      });

      return updated;
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/items/:id PATCH]", err);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
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
      const deleted = await tx.item.delete({ where: { id: params.id } });

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "DELETE",
          entity: "Item",
          entityId: params.id,
          after: `Deleted item ${deleted.name} (${params.id})`,
        },
      });

      return { success: true };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/items/:id DELETE]", err);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
