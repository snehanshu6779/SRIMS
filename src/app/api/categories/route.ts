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
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (err) {
    console.error("[api/categories GET]", err);
    return NextResponse.json({ error: "Failed to load categories" }, { status: 500 });
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
    const { name, parentId, icon, color } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const cat = await tx.category.create({
        data: {
          name,
          parentId: parentId || null,
          icon: icon || null,
          color: color || null,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "CREATE",
          entity: "Category",
          entityId: cat.id,
          after: `Created category ${name}`,
        },
      });

      return cat;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("[api/categories POST]", err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
