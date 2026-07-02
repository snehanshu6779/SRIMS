import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isDatabaseConfigured, getPrismaClient } from "@/lib/prisma";
import { RequisitionStatus, Priority } from "@prisma/client";

// Mock auto-approval settings for database routing (Low priority auto-approves by default)
const AUTO_APPROVAL_ENABLED = true;
const AUTO_APPROVAL_PRIORITIES = ["LOW"];
const AUTO_APPROVAL_ACTOR_ID = "system-auto-approval";

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
      id,
      userId,
      departmentId,
      status,
      purpose,
      remarks,
      requiredDate,
      totalAmount,
      priority,
      items,
    } = body;

    if (!id || !userId || !departmentId || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Determine if the requisition qualifies for auto-approval
    let finalStatus = status as RequisitionStatus;
    let approvedById: string | null = null;
    let approvedAt: Date | null = null;
    let isAutoApproved = false;

    if (
      finalStatus === "PENDING" &&
      AUTO_APPROVAL_ENABLED &&
      AUTO_APPROVAL_PRIORITIES.includes(priority)
    ) {
      finalStatus = "APPROVED";
      approvedById = AUTO_APPROVAL_ACTOR_ID;
      approvedAt = new Date();
      isAutoApproved = true;
    }

    // Create the requisition inside a transaction to ensure all line items are recorded
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Requisition record
      const newReq = await tx.requisition.create({
        data: {
          id,
          userId,
          departmentId,
          status: finalStatus,
          purpose: purpose || null,
          remarks: remarks || null,
          requiredDate: requiredDate ? new Date(requiredDate) : null,
          totalAmount,
          priority: priority as Priority,
          approvedById,
          approvedAt,
        },
      });

      // 2. Create RequisitionItem records
      for (const item of items) {
        await tx.requisitionItem.create({
          data: {
            requisitionId: newReq.id,
            itemId: item.itemId,
            requestedQty: item.quantity || item.requestedQty,
            approvedQty: finalStatus === "APPROVED" ? (item.quantity || item.requestedQty) : 0,
            issuedQty: 0,
            unitPrice: item.unitPrice,
          },
        });
      }

      // 3. Log Audit Trail
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: isAutoApproved ? "AUTO_APPROVE" : "CREATE",
          entity: "Requisition",
          entityId: newReq.id,
          after: JSON.stringify({
            id: newReq.id,
            status: finalStatus,
            totalAmount,
            priority,
          }),
        },
      });

      // 4. Create Notification for Approvers if pending, or user if auto-approved
      if (finalStatus === "PENDING") {
        // Find approver users
        const approvers = await tx.user.findMany({
          where: { role: "APPROVER", isActive: true },
        });
        for (const app of approvers) {
          await tx.notification.create({
            data: {
              userId: app.id,
              type: "REQUISITION_PENDING",
              message: `New requisition ${newReq.id} raised by ${session.user.name} requires approval.`,
              link: "/approvals/pending",
            },
          });
        }
      } else if (finalStatus === "APPROVED") {
        await tx.notification.create({
          data: {
            userId: userId,
            type: "REQUISITION_APPROVED",
            message: `Your requisition ${newReq.id} has been auto-approved.`,
            link: "/requisitions/my",
          },
        });
      }

      return newReq;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("[api/requisitions POST]", err);
    return NextResponse.json({ error: "Failed to create requisition" }, { status: 500 });
  }
}
