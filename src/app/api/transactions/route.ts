import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isDatabaseConfigured, getPrismaClient } from "@/lib/prisma";
import { StockTransactionType } from "@prisma/client";

export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const prisma = getPrismaClient();
    const body = await req.json();
    const {
      type, // "OUTWARD" or "ADJUSTMENT"
      itemId,
      quantity,
      unitPrice,
      referenceNo,
      remarks,
      linkedRequisitionId,
    } = body;

    if (!type || !itemId || quantity === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const delta = type === "OUTWARD" ? -Math.abs(quantity) : quantity;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Adjust Stock
      const updatedItem = await tx.item.update({
        where: { id: itemId },
        data: {
          currentStock: {
            increment: delta, // positive or negative
          },
        },
      });

      // 2. Create Stock Transaction
      const txn = await tx.stockTransaction.create({
        data: {
          type: type as StockTransactionType,
          itemId,
          quantity: type === "OUTWARD" ? Math.abs(quantity) : quantity,
          unitPrice: unitPrice || 0,
          referenceNo: referenceNo || null,
          referenceType: "MANUAL",
          linkedRequisitionId: linkedRequisitionId || null,
          userId: session.user.id,
        },
      });

      // 3. Log Audit Trail
      const action = type === "OUTWARD" ? "STOCK_OUTWARD" : "STOCK_ADJUSTMENT";
      const requisitionNote = linkedRequisitionId ? ` Requisition: ${linkedRequisitionId}.` : "";
      const details = `${type === "OUTWARD" ? "Issued" : "Adjusted"} ${updatedItem.name} by ${quantity > 0 ? "+" : ""}${quantity}. Ref: ${referenceNo || "None"}${requisitionNote}${remarks ? ` — ${remarks}` : ""}`;

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action,
          entity: "Item",
          entityId: itemId,
          after: details,
        },
      });

      return txn;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("[api/transactions POST]", err);
    return NextResponse.json({ error: "Failed to record stock movement" }, { status: 500 });
  }
}
