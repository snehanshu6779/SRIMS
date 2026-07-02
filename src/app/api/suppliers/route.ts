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

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const prisma = getPrismaClient();
    const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(suppliers);
  } catch (err) {
    console.error("[api/suppliers GET]", err);
    return NextResponse.json({ error: "Failed to load suppliers" }, { status: 500 });
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
    const { name, contact, address } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.create({
        data: {
          name,
          contact: contact || null,
          address: address || null,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "CREATE",
          entity: "Supplier",
          entityId: supplier.id,
          after: `Created supplier ${name}`,
        },
      });

      return supplier;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("[api/suppliers POST]", err);
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
  }
}
