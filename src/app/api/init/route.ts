import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isDatabaseConfigured, getPrismaClient } from "@/lib/prisma";

export async function GET() {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const prisma = getPrismaClient();

    // 1. Fetch Users
    const users = await prisma.user.findMany({
      include: { department: true },
    });

    const allUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      departmentId: u.departmentId,
      departmentName: u.department.name,
      approverId: u.approverId,
      isActive: u.isActive,
      passwordHash: "", // Redacted for security
      avatarUrl: u.avatarUrl,
    }));

    // 2. Fetch Categories
    const categories = await prisma.category.findMany();

    // 3. Fetch Suppliers
    const suppliers = await prisma.supplier.findMany();

    // 4. Fetch Items
    const items = await prisma.item.findMany({
      include: { category: true },
    });

    const stockItems = items.map((i) => ({
      id: i.id,
      name: i.name,
      categoryId: i.categoryId,
      categoryName: i.category.name,
      unit: i.unit,
      unitPrice: i.unitPrice,
      currentStock: i.currentStock,
      minStockLevel: i.minStockLevel,
      isActive: i.isActive,
      iconKey: i.iconKey || undefined,
    }));

    // 5. Fetch Requisitions
    const dbRequisitions = await prisma.requisition.findMany({
      include: {
        user: true,
        department: true,
        approvedBy: true,
        items: {
          include: {
            item: {
              include: { category: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const requisitions = dbRequisitions.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.user.name,
      departmentName: r.department.name,
      departmentId: r.departmentId,
      status: r.status,
      purpose: r.purpose || "",
      remarks: r.remarks || "",
      requiredDate: r.requiredDate ? r.requiredDate.toISOString() : "",
      totalAmount: r.totalAmount,
      priority: r.priority,
      createdAt: r.createdAt.toISOString(),
      approvedById: r.approvedById || undefined,
      approvedByName: r.approvedBy?.name || undefined,
      approvedAt: r.approvedAt ? r.approvedAt.toISOString() : undefined,
      rejectedReason: r.rejectedReason || undefined,
      items: r.items.map((it) => ({
        id: it.id,
        itemId: it.itemId,
        itemName: it.item.name,
        categoryName: it.item.category.name,
        unit: it.item.unit,
        requestedQty: it.requestedQty,
        approvedQty: it.approvedQty,
        issuedQty: it.issuedQty,
        unitPrice: it.unitPrice,
      })),
    }));

    // 6. Fetch Stock Transactions
    const dbTransactions = await prisma.stockTransaction.findMany({
      include: { item: true, user: true },
      orderBy: { date: "desc" },
    });

    const stockTransactions = dbTransactions.map((t) => ({
      id: t.id,
      type: t.type,
      itemId: t.itemId,
      itemName: t.item.name,
      quantity: t.quantity,
      unitPrice: t.unitPrice,
      referenceNo: t.referenceNo || "",
      date: t.date.toISOString().split("T")[0],
      userId: t.userId,
      linkedRequisitionId: t.linkedRequisitionId || undefined,
    }));

    // 7. Fetch Issuances
    const dbIssuances = await prisma.issuance.findMany({
      include: {
        issuedBy: true,
        issuedTo: true,
        requisition: {
          include: {
            items: {
              include: { item: true },
            },
          },
        },
      },
      orderBy: { issueDate: "desc" },
    });

    const issuances = dbIssuances.map((iss) => {
      // Find matching items issued
      const lines = iss.requisition.items.map((rit) => ({
        itemId: rit.itemId,
        itemName: rit.item.name,
        issuedQty: rit.issuedQty,
        unitPrice: rit.unitPrice,
      })).filter(l => l.issuedQty > 0);

      return {
        id: iss.id,
        requisitionId: iss.requisitionId,
        issuedById: iss.issuedById,
        issuedByName: iss.issuedBy.name,
        issuedToId: iss.issuedToId,
        issuedToName: iss.issuedTo.name,
        receivedBy: iss.receivedBy || "",
        issueDate: iss.issueDate.toISOString(),
        referenceNo: iss.referenceNo,
        remarks: iss.remarks || "",
        lines,
      };
    });

    // 8. Fetch Audit Logs
    const dbAuditLogs = await prisma.auditLog.findMany({
      include: { actor: true },
      orderBy: { timestamp: "desc" },
    });

    const auditLogs = dbAuditLogs.map((log) => ({
      id: log.id,
      actorId: log.actorId,
      actorName: log.actor.name,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      details: log.after || "",
      timestamp: log.timestamp.toISOString(),
    }));

    // 9. Fetch Notifications for the logged-in user
    const dbNotifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    const notifications = dbNotifications.map((n) => ({
      id: n.id,
      message: n.message,
      isRead: n.isRead,
      link: n.link || "",
      createdAt: n.createdAt.toISOString(),
    }));

    return NextResponse.json({
      allUsers,
      categories,
      suppliers,
      stockItems,
      requisitions,
      stockTransactions,
      issuances,
      auditLogs,
      notifications,
    });
  } catch (err) {
    console.error("[api/init GET]", err);
    return NextResponse.json({ error: "Failed to load database values" }, { status: 500 });
  }
}
