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

export async function GET() {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const prisma = getPrismaClient();
    const items = await prisma.item.findMany({
      include: { category: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(items);
  } catch (err) {
    console.error("[api/items GET]", err);
    return NextResponse.json({ error: "Failed to load items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const session = await requireManager();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const prisma = getPrismaClient();
    const body = await req.json();
    const { name, categoryId, unit, unitPrice, minStockLevel, currentStock, iconKey } = body;

    if (!name || !categoryId || !unit || unitPrice === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Auto-generate item ID (format ITM-XXXX)
    const id = `ITM-${String(Date.now()).slice(-4)}`;

    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.item.create({
        data: {
          id,
          name,
          categoryId,
          unit,
          unitPrice,
          minStockLevel: minStockLevel !== undefined ? minStockLevel : 10,
          currentStock: currentStock !== undefined ? currentStock : 0,
          iconKey: iconKey || null,
          isActive: true,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "CREATE",
          entity: "Item",
          entityId: item.id,
          after: `Created stationery item ${name} (${id})`,
        },
      });

      return item;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("[api/items POST]", err);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
