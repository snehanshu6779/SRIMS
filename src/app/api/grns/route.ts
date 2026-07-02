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
      id, // referenceNo/id (e.g. GRN-2025-XXXX)
      supplierId,
      grnDate,
      invoiceNo,
      invoiceDate,
      deliveryChallan,
      deliveryDate,
      remarks,
      lines, // array of { itemId: string, itemName: string, receivedQty: number, unitPrice: number }
    } = body;

    if (!id || !supplierId || !lines || !Array.isArray(lines)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const totalValue = lines.reduce((sum, l) => sum + l.receivedQty * l.unitPrice, 0);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create GRN Record
      const newGRN = await tx.gRN.create({
        data: {
          id,
          supplierId,
          grnDate: new Date(grnDate),
          invoiceNo: invoiceNo || null,
          invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
          deliveryChallan: deliveryChallan || null,
          deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
          remarks: remarks || null,
          totalValue,
        },
      });

      // 2. Process each line-item
      for (const line of lines) {
        // a. Create GRNItem
        await tx.gRNItem.create({
          data: {
            grnId: id,
            itemId: line.itemId,
            receivedQty: line.receivedQty,
            unitPrice: line.unitPrice,
          },
        });

        // b. Increment Item Stock
        await tx.item.update({
          where: { id: line.itemId },
          data: {
            currentStock: {
              increment: line.receivedQty,
            },
          },
        });

        // c. Create INWARD StockTransaction
        await tx.stockTransaction.create({
          data: {
            type: StockTransactionType.INWARD,
            itemId: line.itemId,
            quantity: line.receivedQty,
            unitPrice: line.unitPrice,
            referenceNo: id,
            referenceType: "GRN",
            userId: session.user.id,
            date: new Date(grnDate),
          },
        });
      }

      // 3. Log Audit Trail
      const supplier = await tx.supplier.findUnique({ where: { id: supplierId } });
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "STOCK_INWARD",
          entity: "GRN",
          entityId: id,
          after: `Received ${lines.length} item(s) from ${supplier?.name || "Supplier"}. Total value: ₹${totalValue.toFixed(2)}`,
        },
      });

      return newGRN;
    });

    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (err) {
    console.error("[api/grns POST]", err);
    return NextResponse.json({ error: "Failed to submit GRN" }, { status: 500 });
  }
}
