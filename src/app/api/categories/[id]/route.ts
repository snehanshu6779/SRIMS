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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const session = await requireManager();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const prisma = getPrismaClient();
    const body = await req.json();
    const { name, parentId, icon, color } = body;

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.category.update({
        where: { id: params.id },
        data: {
          name: name !== undefined ? name : undefined,
          parentId: parentId !== undefined ? (parentId || null) : undefined,
          icon: icon !== undefined ? (icon || null) : undefined,
          color: color !== undefined ? (color || null) : undefined,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "UPDATE",
          entity: "Category",
          entityId: params.id,
          after: `Updated category details for ${updated.name}`,
        },
      });

      return updated;
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/categories/:id PATCH]", err);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const session = await requireManager();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const prisma = getPrismaClient();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Promote subcategories to root (set parentId = null)
      await tx.category.updateMany({
        where: { parentId: params.id },
        data: { parentId: null },
      });

      // 2. We should handle Items attached to this category.
      // In the prototype's store, deleting a category doesn't explicitly delete items,
      // but in real RDBMS, this might violate referential integrity if it's set as restrict or cascade.
      // In schema.prisma: `item` has `categoryId String` which is a foreign key with default behavior (restrict).
      // So if items still exist in this category, we cannot delete it without throwing an error!
      // To prevent crashes, let's reassign items to an "Uncategorized" category, or a fallback category.
      // Or we can query if items exist first.
      const itemsCount = await tx.item.count({ where: { categoryId: params.id } });
      if (itemsCount > 0) {
        // Find or create an "Uncategorized" category
        let uncategorized = await tx.category.findFirst({
          where: { name: "Uncategorized" },
        });
        if (!uncategorized) {
          uncategorized = await tx.category.create({
            data: { name: "Uncategorized", icon: "HelpCircle", color: "#64748B" },
          });
        }
        // Move items to Uncategorized
        await tx.item.updateMany({
          where: { categoryId: params.id },
          data: { categoryId: uncategorized.id },
        });
      }

      // 3. Delete the Category
      const deleted = await tx.category.delete({
        where: { id: params.id },
      });

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "DELETE",
          entity: "Category",
          entityId: params.id,
          after: `Deleted category ${deleted.name}`,
        },
      });

      return { success: true };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/categories/:id DELETE]", err);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
