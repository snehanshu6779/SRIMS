import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isDatabaseConfigured, getPrismaClient } from "@/lib/prisma";
import { RequisitionStatus, StockTransactionType } from "@prisma/client";

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
      id, // referenceNo/id (e.g. ISS-2025-XXXXX)
      requisitionId,
      issuedToId,
      receivedBy,
      remarks,
      lines, // array of { itemId: string, itemName: string, issuedQty: number, approvedQty: number, unitPrice: number }
    } = body;

    if (!id || !requisitionId || !issuedToId || !lines || !Array.isArray(lines)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Issuance Record
      const newIssuance = await tx.issuance.create({
        data: {
          id,
          requisitionId,
          issuedById: session.user.id,
          issuedToId,
          receivedBy: receivedBy || null,
          remarks: remarks || null,
          referenceNo: id,
        },
      });

      // 2. Process each line-item
      for (const line of lines) {
        if (line.issuedQty > 0) {
          // a. Decrement Item Stock
          await tx.item.update({
            where: { id: line.itemId },
            data: {
              currentStock: {
                decrement: line.issuedQty,
              },
            },
          });

          // b. Create OUTWARD StockTransaction
          await tx.stockTransaction.create({
            data: {
              type: StockTransactionType.OUTWARD,
              itemId: line.itemId,
              quantity: line.issuedQty,
              unitPrice: line.unitPrice,
              referenceNo: id,
              referenceType: "ISSUANCE",
              userId: session.user.id,
            },
          });

          // c. Update issuedQty in RequisitionItem
          // Find the specific requisition item record first
          const reqItem = await tx.requisitionItem.findFirst({
            where: { requisitionId, itemId: line.itemId },
          });
          if (reqItem) {
            await tx.requisitionItem.update({
              where: { id: reqItem.id },
              data: {
                issuedQty: {
                  increment: line.issuedQty,
                },
              },
            });
          }
        }
      }

      // 3. Re-evaluate Requisition overall status
      const reqItems = await tx.requisitionItem.findMany({
        where: { requisitionId },
      });

      const isFullyIssued = reqItems.every((item) => item.issuedQty >= item.approvedQty);
      const finalStatus: RequisitionStatus = isFullyIssued ? "ISSUED" : "PARTIAL";

      await tx.requisition.update({
        where: { id: requisitionId },
        data: {
          status: finalStatus,
        },
      });

      // 4. Log Audit Trail
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: isFullyIssued ? "ISSUE_COMPLETE" : "ISSUE_PARTIAL",
          entity: "Requisition",
          entityId: requisitionId,
          after: `Issued via ${id}. Status: ${finalStatus}`,
        },
      });

      // 5. Log Notification for User
      await tx.notification.create({
        data: {
          userId: issuedToId,
          type: "REQUISITION_ISSUED",
          message: `Stationery items from requisition ${requisitionId} have been issued.`,
          link: "/requisitions/my",
        },
      });

      return newIssuance;
    });

    return NextResponse.json({ referenceNo: result.referenceNo }, { status: 201 });
  } catch (err) {
    console.error("[api/issuances POST]", err);
    return NextResponse.json({ error: "Failed to confirm issuance" }, { status: 500 });
  }
}
