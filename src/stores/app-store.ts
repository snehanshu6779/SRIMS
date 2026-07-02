import { create } from "zustand";
import {
  MockUser,
  MockItem,
  MockRequisition,
  MockStockTransaction,
  MockCategory,
  users as initialUsers,
  items as initialItems,
  categories as initialCategories,
  suppliers as initialSuppliers,
  requisitions as initialRequisitions,
  stockTransactions as initialStockTransactions,
  generateIssuanceId,
} from "@/lib/data/mock-data";

// ─── Supplier record ───
export interface MockSupplier {
  id: string;
  name: string;
  contact: string;
  address: string;
}

// ─── Auto-Approval Rules ───
// Configured by Admin / Inventory Manager under Masters → Auto-Approval.
// When enabled, any requisition submitted (not saved as draft) whose
// priority is in `priorities` skips Pending Approvals entirely and is
// marked APPROVED immediately, attributed to a synthetic "system" actor.
export interface AutoApprovalSettings {
  enabled: boolean;
  priorities: ("LOW" | "NORMAL" | "URGENT")[];
}

const AUTO_APPROVAL_ACTOR_ID = "system-auto-approval";
const AUTO_APPROVAL_ACTOR_NAME = "Auto-Approval System";

/**
 * Pure function — given a requisition that's about to become PENDING and
 * the current auto-approval config, returns either the unchanged
 * requisition or one that's already APPROVED. Deliberately has no side
 * effects (no store writes) so it's safe to call from multiple store
 * actions without worrying about call order.
 */
function computeAutoApproval(
  req: MockRequisition,
  settings: AutoApprovalSettings
): { result: MockRequisition; autoApproved: boolean } {
  // Only an actual submission (PENDING) is eligible — never a draft.
  if (req.status !== "PENDING" || !settings.enabled || !settings.priorities.includes(req.priority)) {
    return { result: req, autoApproved: false };
  }
  return {
    result: {
      ...req,
      status: "APPROVED",
      approvedById: AUTO_APPROVAL_ACTOR_ID,
      approvedByName: AUTO_APPROVAL_ACTOR_NAME,
      approvedAt: new Date().toISOString(),
      items: req.items.map((item) => ({ ...item, approvedQty: item.requestedQty })),
    },
    autoApproved: true,
  };
}

// ─── Cart Item for New Requisition ───
export interface CartItem {
  itemId: string;
  itemName: string;
  categoryName: string;
  unit: string;
  unitPrice: number;
  availableStock: number;
  quantity: number;
  iconKey?: string;
}

// ─── Issuance record ───
export interface MockIssuance {
  id: string;
  requisitionId: string;
  issuedById: string;
  issuedByName: string;
  issuedToId: string;
  issuedToName: string;
  receivedBy: string;
  issueDate: string;
  referenceNo: string;
  remarks: string;
  lines: { itemId: string; itemName: string; issuedQty: number; unitPrice: number }[];
}

// ─── GRN record ───
export interface MockGRN {
  id: string;
  supplierId: string;
  supplierName: string;
  grnDate: string;
  invoiceNo: string;
  invoiceDate: string;
  deliveryChallan: string;
  deliveryDate: string;
  remarks: string;
  totalValue: number;
  lines: { itemId: string; itemName: string; receivedQty: number; unitPrice: number }[];
}

// ─── Audit Log entry ───
export interface MockAuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  timestamp: string;
}

// ─── App Store ───
interface AppState {
  // Auth
  currentUser: MockUser;
  setCurrentUser: (userId: string) => void;
  setCurrentUserObject: (user: MockUser) => void;

  // Users (master + auth)
  allUsers: MockUser[];
  addUser: (user: Omit<MockUser, "id">) => void;
  updateUser: (id: string, updates: Partial<MockUser>) => void;
  toggleUserActive: (id: string) => void;
  deleteUser: (id: string) => void;

  // Categories (master)
  categories: MockCategory[];
  addCategory: (cat: Omit<MockCategory, "id">) => void;
  updateCategory: (id: string, updates: Partial<MockCategory>) => void;
  deleteCategory: (id: string) => void;

  // Suppliers (master)
  suppliers: MockSupplier[];
  addSupplier: (sup: Omit<MockSupplier, "id">) => void;
  updateSupplier: (id: string, updates: Partial<MockSupplier>) => void;
  deleteSupplier: (id: string) => void;

  // Items / Stock (mutable, lives in memory)
  stockItems: MockItem[];
  getItem: (itemId: string) => MockItem | undefined;
  adjustStock: (itemId: string, delta: number) => void;
  addItem: (item: Omit<MockItem, "id">) => void;
  updateItem: (id: string, updates: Partial<MockItem>) => void;
  toggleItemActive: (id: string) => void;
  deleteItem: (id: string) => void;

  // Requisitions
  requisitions: MockRequisition[];
  addRequisition: (req: MockRequisition) => void;
  updateRequisitionStatus: (
    reqId: string,
    status: MockRequisition["status"],
    opts?: {
      approvedById?: string;
      approvedByName?: string;
      rejectedReason?: string;
      approvedQty?: Record<string, number>;
    }
  ) => void;
  updateRequisitionFull: (reqId: string, updates: Partial<MockRequisition>) => void;
  deleteRequisition: (reqId: string) => void;
  loadRequisitionToCart: (reqId: string) => void;

  // Auto-Approval Rules (Masters → Auto-Approval, ADMIN + INVENTORY_MGR only)
  autoApprovalSettings: AutoApprovalSettings;
  updateAutoApprovalSettings: (settings: AutoApprovalSettings) => void;

  // Cart for New Requisition
  cart: CartItem[];
  addToCart: (item: MockItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: () => number;

  // Issuances
  issuances: MockIssuance[];
  confirmIssuance: (params: {
    requisitionId: string;
    issuedToId: string;
    issuedToName: string;
    receivedBy: string;
    remarks: string;
    lines: { itemId: string; itemName: string; issuedQty: number; approvedQty: number; unitPrice: number }[];
  }) => string; // returns issuance referenceNo

  // GRNs / Stock Inward
  grns: MockGRN[];
  stockTransactions: MockStockTransaction[];
  submitGRN: (params: {
    supplierId: string;
    supplierName: string;
    grnDate: string;
    invoiceNo: string;
    invoiceDate: string;
    deliveryChallan: string;
    deliveryDate: string;
    remarks: string;
    lines: { itemId: string; itemName: string; receivedQty: number; unitPrice: number }[];
  }) => Promise<string>; // returns GRN id

  // Manual Stock Outward / Adjustment
  recordManualMovement: (params: {
    type: "OUTWARD" | "ADJUSTMENT";
    itemId: string;
    itemName: string;
    quantity: number; // signed for adjustment (+/-), positive for outward
    unitPrice: number;
    referenceNo: string;
    remarks?: string;
    linkedRequisitionId?: string;
  }) => void;

  // In-progress drafts for the two-step wizards (Issue Items, Stock Inward).
  // These are session-only — they exist so a half-filled wizard survives
  // navigating away and back, but they are NOT persisted to a backend.
  issueDrafts: Record<string, { itemId: string; itemName: string; unit: string; requestedQty: number; approvedQty: number; availableStock: number; issueQty: number; unitPrice: number; iconKey?: string }[]>;
  saveIssueDraft: (requisitionId: string, lines: { itemId: string; itemName: string; unit: string; requestedQty: number; approvedQty: number; availableStock: number; issueQty: number; unitPrice: number; iconKey?: string }[]) => void;
  clearIssueDraft: (requisitionId: string) => void;

  draftGRNs: {
    id: string;
    supplierId: string;
    grnDate: string;
    invoiceNo: string;
    invoiceDate: string;
    deliveryChallan: string;
    deliveryDate: string;
    remarks: string;
    lines: { id: string; itemId: string; itemName: string; categoryName: string; unit: string; receivedQty: number; unitPrice: number; iconKey?: string }[];
    savedAt: string;
  }[];
  saveGRNDraft: (draft: {
    supplierId: string;
    grnDate: string;
    invoiceNo: string;
    invoiceDate: string;
    deliveryChallan: string;
    deliveryDate: string;
    remarks: string;
    lines: { id: string; itemId: string; itemName: string; categoryName: string; unit: string; receivedQty: number; unitPrice: number; iconKey?: string }[];
  }) => string;
  deleteGRNDraft: (id: string) => void;

  // Audit Logs
  auditLogs: MockAuditLog[];
  addAuditLog: (action: string, entity: string, entityId: string, details: string) => void;

  // Notifications
  notifications: { id: string; message: string; isRead: boolean; link: string; createdAt: string }[];
  markNotificationRead: (id: string) => void;
  addNotification: (message: string, link: string) => void;

  // DB Hydration — called once on client mount when DATABASE_URL is set.
  // Fetches all master + transactional data from /api/init and replaces
  // the in-memory Zustand state with live database values.
  hydrateStore: () => Promise<void>;
  isHydrated: boolean;
}

let grnCounter = 47;
function generateGrnId(): string {
  return `GRN-2025-${String(grnCounter++).padStart(4, "0")}`;
}

export const useAppStore = create<AppState>((set, get) => ({
  // ─── Auth ───
  currentUser: initialUsers[0], // Default: Admin (Rahul Sharma)

  setCurrentUser: (userId: string) => {
    const user = get().allUsers.find((u) => u.id === userId);
    if (user) set({ currentUser: user });
  },

  setCurrentUserObject: (user: MockUser) => {
    set({ currentUser: user });
  },

  // ─── Users (master + auth) ───
  allUsers: initialUsers,

  addUser: (user) => {
    const newUser: MockUser = { ...user, id: `user-${Date.now()}` };
    set((s) => ({ allUsers: [...s.allUsers, newUser] }));
    get().addAuditLog("CREATE", "User", newUser.id, `Created user ${newUser.name} (${newUser.role})`);

    // Best-effort persistence — only succeeds once a real database is connected.
    // The UI above has already updated regardless, so this never blocks anything.
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        departmentId: newUser.departmentId,
        password: newUser.passwordHash,
      }),
    }).catch(() => {
      // No database configured yet, or unreachable — this is expected and fine.
      // The user still exists locally for this session; see README for details.
    });
  },

  updateUser: (id, updates) => {
    set((s) => ({
      allUsers: s.allUsers.map((u) => (u.id === id ? { ...u, ...updates } : u)),
      currentUser: s.currentUser.id === id ? { ...s.currentUser, ...updates } : s.currentUser,
    }));
    get().addAuditLog("UPDATE", "User", id, `Updated user details`);

    fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => {});
  },

  toggleUserActive: (id) => {
    const target = get().allUsers.find((u) => u.id === id);
    set((s) => ({
      allUsers: s.allUsers.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)),
    }));
    get().addAuditLog("UPDATE", "User", id, `Toggled active status`);

    fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !(target?.isActive ?? true) }),
    }).catch(() => {});
  },

  deleteUser: (id) => {
    set((s) => ({ allUsers: s.allUsers.filter((u) => u.id !== id) }));
    get().addAuditLog("DELETE", "User", id, `Deleted user`);

    fetch(`/api/users/${id}`, { method: "DELETE" }).catch(() => {});
  },

  // ─── Categories (master) ───
  categories: initialCategories,

  addCategory: (cat) => {
    const newCat: MockCategory = { ...cat, id: `cat-${Date.now()}` };
    set((s) => ({ categories: [...s.categories, newCat] }));
    get().addAuditLog("CREATE", "Category", newCat.id, `Created category ${newCat.name}`);

    fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCat.name, parentId: newCat.parentId, icon: newCat.icon, color: newCat.color }),
    }).then(async (res) => {
      if (res.ok) {
        const created = await res.json();
        // Replace the temp id with the real DB id
        set((s) => ({
          categories: s.categories.map((c) => (c.id === newCat.id ? { ...c, id: created.id } : c)),
        }));
      }
    }).catch(() => {});
  },

  updateCategory: (id, updates) => {
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
    get().addAuditLog("UPDATE", "Category", id, `Updated category`);

    fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => {});
  },

  deleteCategory: (id) => {
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
    get().addAuditLog("DELETE", "Category", id, `Deleted category`);

    fetch(`/api/categories/${id}`, { method: "DELETE" }).catch(() => {});
  },

  // ─── Suppliers (master) ───
  suppliers: initialSuppliers,

  addSupplier: (sup) => {
    const newSup: MockSupplier = { ...sup, id: `sup-${Date.now()}` };
    set((s) => ({ suppliers: [...s.suppliers, newSup] }));
    get().addAuditLog("CREATE", "Supplier", newSup.id, `Created supplier ${newSup.name}`);

    fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSup.name, contact: newSup.contact, address: newSup.address }),
    }).then(async (res) => {
      if (res.ok) {
        const created = await res.json();
        set((s) => ({
          suppliers: s.suppliers.map((su) => (su.id === newSup.id ? { ...su, id: created.id } : su)),
        }));
      }
    }).catch(() => {});
  },

  updateSupplier: (id, updates) => {
    set((s) => ({
      suppliers: s.suppliers.map((sup) => (sup.id === id ? { ...sup, ...updates } : sup)),
    }));
    get().addAuditLog("UPDATE", "Supplier", id, `Updated supplier`);

    fetch(`/api/suppliers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => {});
  },

  deleteSupplier: (id) => {
    set((s) => ({ suppliers: s.suppliers.filter((sup) => sup.id !== id) }));
    get().addAuditLog("DELETE", "Supplier", id, `Deleted supplier`);

    fetch(`/api/suppliers/${id}`, { method: "DELETE" }).catch(() => {});
  },

  // ─── Items / Stock ───
  stockItems: initialItems,

  getItem: (itemId) => get().stockItems.find((i) => i.id === itemId),

  adjustStock: (itemId, delta) =>
    set((state) => ({
      stockItems: state.stockItems.map((i) =>
        i.id === itemId ? { ...i, currentStock: Math.max(0, i.currentStock + delta) } : i
      ),
    })),

  addItem: (item) => {
    const newItem: MockItem = { ...item, id: `ITM-${String(Date.now()).slice(-4)}` };
    set((s) => ({ stockItems: [...s.stockItems, newItem] }));
    get().addAuditLog("CREATE", "Item", newItem.id, `Created item ${newItem.name}`);

    fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newItem.name,
        categoryId: newItem.categoryId,
        unit: newItem.unit,
        unitPrice: newItem.unitPrice,
        minStockLevel: newItem.minStockLevel,
        currentStock: newItem.currentStock,
        iconKey: newItem.iconKey,
      }),
    }).then(async (res) => {
      if (res.ok) {
        const created = await res.json();
        set((s) => ({
          stockItems: s.stockItems.map((i) => (i.id === newItem.id ? { ...i, id: created.id } : i)),
        }));
      }
    }).catch(() => {});
  },

  updateItem: (id, updates) => {
    set((s) => ({
      stockItems: s.stockItems.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    }));
    get().addAuditLog("UPDATE", "Item", id, `Updated item details`);

    fetch(`/api/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => {});
  },

  toggleItemActive: (id) => {
    const target = get().stockItems.find((i) => i.id === id);
    set((s) => ({
      stockItems: s.stockItems.map((i) => (i.id === id ? { ...i, isActive: !i.isActive } : i)),
    }));
    get().addAuditLog("UPDATE", "Item", id, `Toggled active status`);

    fetch(`/api/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !(target?.isActive ?? true) }),
    }).catch(() => {});
  },

  deleteItem: (id) => {
    set((s) => ({ stockItems: s.stockItems.filter((i) => i.id !== id) }));
    get().addAuditLog("DELETE", "Item", id, `Deleted item`);

    fetch(`/api/items/${id}`, { method: "DELETE" }).catch(() => {});
  },

  // ─── Requisitions ───
  requisitions: initialRequisitions,

  addRequisition: (req) => {
    const { result, autoApproved } = computeAutoApproval(req, get().autoApprovalSettings);
    set((state) => ({
      requisitions: [result, ...state.requisitions],
    }));
    if (autoApproved) {
      get().addAuditLog(
        "AUTO_APPROVE",
        "Requisition",
        result.id,
        `Auto-approved (priority: ${result.priority}) per Auto-Approval Rules`
      );
    }
  },

  updateRequisitionStatus: (reqId, status, opts) => {
    let autoApprovedId: string | null = null;
    let autoApprovedPriority = "";

    set((state) => ({
      requisitions: state.requisitions.map((r) => {
        if (r.id !== reqId) return r;
        let updated = { ...r, status };
        if (opts?.approvedById) {
          updated.approvedById = opts.approvedById;
          updated.approvedByName = opts.approvedByName || null;
          updated.approvedAt = new Date().toISOString();
        }
        if (opts?.rejectedReason) {
          updated.rejectedReason = opts.rejectedReason;
        }
        if (opts?.approvedQty) {
          updated.items = r.items.map((item) => ({
            ...item,
            approvedQty: opts.approvedQty![item.itemId] ?? item.requestedQty,
          }));
        }

        // A draft moving straight to PENDING (e.g. the "Submit" action on
        // the Drafts page) is the one transition not already covered by
        // addRequisition/updateRequisitionFull, so check it here too.
        if (status === "PENDING" && r.status !== "PENDING") {
          const { result, autoApproved } = computeAutoApproval(updated, get().autoApprovalSettings);
          updated = result;
          if (autoApproved) {
            autoApprovedId = result.id;
            autoApprovedPriority = result.priority;
          }
        }
        return updated;
      }),
    }));

    if (autoApprovedId) {
      get().addAuditLog(
        "AUTO_APPROVE",
        "Requisition",
        autoApprovedId,
        `Auto-approved (priority: ${autoApprovedPriority}) per Auto-Approval Rules`
      );
    }
  },

  updateRequisitionFull: (reqId, updates) => {
    const existing = get().requisitions.find((r) => r.id === reqId);
    let autoApproved = false;
    let merged: MockRequisition | null = existing ? { ...existing, ...updates } : null;

    if (merged && updates.status === "PENDING" && existing!.status !== "PENDING") {
      const computed = computeAutoApproval(merged, get().autoApprovalSettings);
      merged = computed.result;
      autoApproved = computed.autoApproved;
    }

    set((state) => ({
      requisitions: state.requisitions.map((r) => (r.id === reqId && merged ? merged : r)),
    }));

    if (autoApproved && merged) {
      get().addAuditLog(
        "AUTO_APPROVE",
        "Requisition",
        reqId,
        `Auto-approved (priority: ${merged.priority}) per Auto-Approval Rules`
      );
    }
  },

  deleteRequisition: (reqId) => {
    set((state) => ({
      requisitions: state.requisitions.filter((r) => r.id !== reqId),
    }));
    get().addAuditLog("DELETE", "Requisition", reqId, "Deleted draft requisition");
  },

  // ─── Auto-Approval Rules ───
  // Default: low-priority requisitions auto-approve, everything else still
  // goes through Pending Approvals. Admin / Inventory Manager can change
  // this from Masters → Auto-Approval.
  autoApprovalSettings: { enabled: true, priorities: ["LOW"] },

  updateAutoApprovalSettings: (settings) => {
    set({ autoApprovalSettings: settings });
    get().addAuditLog(
      "UPDATE",
      "AutoApprovalSettings",
      "global",
      `Auto-approval ${settings.enabled ? "enabled" : "disabled"} for priorities: ${settings.priorities.join(", ") || "none"}`
    );
  },

  loadRequisitionToCart: (reqId) => {
    const req = get().requisitions.find((r) => r.id === reqId);
    if (!req) return;
    const stockItems = get().stockItems;
    const cartItems: CartItem[] = req.items.map((item) => {
      const stockItem = stockItems.find((s) => s.id === item.itemId);
      return {
        itemId: item.itemId,
        itemName: item.itemName,
        categoryName: item.categoryName,
        unit: item.unit,
        unitPrice: item.unitPrice,
        availableStock: stockItem?.currentStock ?? item.requestedQty,
        quantity: item.requestedQty,
        iconKey: stockItem?.iconKey,
      };
    });
    set({ cart: cartItems });
  },

  // ─── Cart ───
  cart: [],

  addToCart: (item) =>
    set((state) => {
      if (state.cart.find((c) => c.itemId === item.id)) return state;
      return {
        cart: [
          ...state.cart,
          {
            itemId: item.id,
            itemName: item.name,
            categoryName: item.categoryName,
            unit: item.unit,
            unitPrice: item.unitPrice,
            availableStock: item.currentStock,
            quantity: 1,
            iconKey: item.iconKey,
          },
        ],
      };
    }),

  removeFromCart: (itemId) =>
    set((state) => ({
      cart: state.cart.filter((c) => c.itemId !== itemId),
    })),

  updateCartQuantity: (itemId, qty) =>
    set((state) => ({
      cart: state.cart.map((c) =>
        c.itemId === itemId ? { ...c, quantity: Math.max(1, Math.min(qty, c.availableStock)) } : c
      ),
    })),

  clearCart: () => set({ cart: [] }),

  cartTotal: () => {
    return get().cart.reduce((sum, c) => sum + c.unitPrice * c.quantity, 0);
  },

  // ─── Issuances ───
  issuances: [],

  confirmIssuance: ({ requisitionId, issuedToId, issuedToName, receivedBy, remarks, lines }) => {
    const state = get();
    const referenceNo = generateIssuanceId();
    const actor = state.currentUser;

    // Determine overall status: Issued if every line fully issued, else Partial
    const isFullyIssued = lines.every((l) => l.issuedQty >= l.approvedQty);

    // Decrement stock for each issued line
    lines.forEach((l) => {
      if (l.issuedQty > 0) {
        state.adjustStock(l.itemId, -l.issuedQty);
      }
    });

    // Record issuance
    const issuance: MockIssuance = {
      id: referenceNo,
      requisitionId,
      issuedById: actor.id,
      issuedByName: actor.name,
      issuedToId,
      issuedToName,
      receivedBy,
      issueDate: new Date().toISOString(),
      referenceNo,
      remarks,
      lines: lines.map((l) => ({
        itemId: l.itemId,
        itemName: l.itemName,
        issuedQty: l.issuedQty,
        unitPrice: l.unitPrice,
      })),
    };

    // Add stock transactions (OUTWARD)
    const newTransactions: MockStockTransaction[] = lines
      .filter((l) => l.issuedQty > 0)
      .map((l, idx) => ({
        id: `st-iss-${referenceNo}-${idx}`,
        type: "OUTWARD" as const,
        itemId: l.itemId,
        itemName: l.itemName,
        quantity: l.issuedQty,
        unitPrice: l.unitPrice,
        referenceNo,
        date: new Date().toISOString().split("T")[0],
        userId: actor.id,
        linkedRequisitionId: requisitionId,
      }));

    // Update requisition: issuedQty per line + overall status
    set((s) => ({
      issuances: [issuance, ...s.issuances],
      stockTransactions: [...newTransactions, ...s.stockTransactions],
      requisitions: s.requisitions.map((r) => {
        if (r.id !== requisitionId) return r;
        return {
          ...r,
          status: isFullyIssued ? "ISSUED" : "PARTIAL",
          items: r.items.map((item) => {
            const line = lines.find((l) => l.itemId === item.itemId);
            return line ? { ...item, issuedQty: line.issuedQty } : item;
          }),
        };
      }),
    }));

    // Audit log
    get().addAuditLog(
      isFullyIssued ? "ISSUE_COMPLETE" : "ISSUE_PARTIAL",
      "Requisition",
      requisitionId,
      `Issued via ${referenceNo}. ${lines.length} line(s) processed.`
    );

    return referenceNo;
  },

  // ─── GRNs / Stock Inward ───
  grns: [],
  stockTransactions: initialStockTransactions,

  submitGRN: async ({ supplierId, supplierName, grnDate, invoiceNo, invoiceDate, deliveryChallan, deliveryDate, remarks, lines }) => {
const grnId = generateGrnId();

const res = await fetch("/api/grns", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id: grnId,
    supplierId,
    grnDate,
    invoiceNo,
    invoiceDate,
    deliveryChallan,
    deliveryDate,
    remarks,
    lines,
  }),
});

if (!res.ok) {
  const err = await res.json().catch(() => null);
  throw new Error(err?.error || "Failed to submit GRN");
}

// allow rehydration
set({ isHydrated: false });
await get().hydrateStore();

return grnId;
  },

  // ─── Manual Stock Outward / Adjustment ───
  recordManualMovement: ({ type, itemId, itemName, quantity, unitPrice, referenceNo, remarks, linkedRequisitionId }) => {
    const state = get();
    const actor = state.currentUser;

    // OUTWARD always decrements; ADJUSTMENT applies signed delta directly
    const delta = type === "OUTWARD" ? -Math.abs(quantity) : quantity;
    state.adjustStock(itemId, delta);

    const newTransaction: MockStockTransaction = {
      id: `st-manual-${Date.now()}`,
      type,
      itemId,
      itemName,
      quantity: type === "OUTWARD" ? Math.abs(quantity) : quantity,
      unitPrice,
      referenceNo,
      date: new Date().toISOString().split("T")[0],
      userId: actor.id,
      linkedRequisitionId,
    };

    set((s) => ({
      stockTransactions: [newTransaction, ...s.stockTransactions],
    }));

    get().addAuditLog(
      type === "OUTWARD" ? "STOCK_OUTWARD" : "STOCK_ADJUSTMENT",
      "Item",
      itemId,
      `${type === "OUTWARD" ? "Issued" : "Adjusted"} ${itemName} by ${quantity > 0 ? "+" : ""}${quantity}. Ref: ${referenceNo}${remarks ? ` — ${remarks}` : ""}`
    );
  },

  // ─── Issue Items wizard drafts (per-requisition, session-only) ───
  issueDrafts: {},

  saveIssueDraft: (requisitionId, lines) =>
    set((state) => ({
      issueDrafts: { ...state.issueDrafts, [requisitionId]: lines },
    })),

  clearIssueDraft: (requisitionId) =>
    set((state) => {
      const next = { ...state.issueDrafts };
      delete next[requisitionId];
      return { issueDrafts: next };
    }),

  // ─── Stock Inward (GRN) wizard drafts (session-only) ───
  draftGRNs: [],

  saveGRNDraft: (draft) => {
    const id = `grn-draft-${Date.now()}`;
    set((state) => ({
      draftGRNs: [
        { ...draft, id, savedAt: new Date().toISOString() },
        ...state.draftGRNs,
      ],
    }));
    return id;
  },

  deleteGRNDraft: (id) =>
    set((state) => ({
      draftGRNs: state.draftGRNs.filter((d) => d.id !== id),
    })),

  // ─── Audit Logs ───
  auditLogs: [
    {
      id: "audit-1",
      actorId: "user-4",
      actorName: "Sandeep Kumar",
      action: "STOCK_INWARD",
      entity: "GRN",
      entityId: "GRN-2025-0045",
      details: "Received 500 units of A4 Copier Paper",
      timestamp: "2025-05-31T09:00:00",
    },
    {
      id: "audit-2",
      actorId: "user-1",
      actorName: "Rahul Sharma",
      action: "APPROVE",
      entity: "Requisition",
      entityId: "REQ-2025-00127",
      details: "Approved requisition for Amit Verma",
      timestamp: "2025-05-30T16:00:00",
    },
  ],

  addAuditLog: (action, entity, entityId, details) => {
    const actor = get().currentUser;
    set((s) => ({
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          actorId: actor.id,
          actorName: actor.name,
          action,
          entity,
          entityId,
          details,
          timestamp: new Date().toISOString(),
        },
        ...s.auditLogs,
      ],
    }));
  },

  // ─── Notifications ───
  notifications: [
    {
      id: "notif-1",
      message: "Low stock alert: Ball Pen (Blue) is below minimum level",
      isRead: false,
      link: "/inventory/low-stock",
      createdAt: "2025-05-31T10:00:00",
    },
    {
      id: "notif-2",
      message: "REQ-2025-00128 submitted for your approval",
      isRead: false,
      link: "/approvals/pending",
      createdAt: "2025-05-31T10:30:00",
    },
    {
      id: "notif-3",
      message: "Critical: Highlighter (Yellow) stock is critically low",
      isRead: false,
      link: "/inventory/low-stock",
      createdAt: "2025-05-31T09:00:00",
    },
  ],

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    })),

  addNotification: (message, link) =>
    set((state) => ({
      notifications: [
        {
          id: `notif-${Date.now()}`,
          message,
          isRead: false,
          link,
          createdAt: new Date().toISOString(),
        },
        ...state.notifications,
      ],
    })),

  // ─── DB Hydration ───
  isHydrated: false,

  hydrateStore: async () => {
    // Only run on the client — this fetches from a Next.js API route
    if (typeof window === "undefined") return;
    // Avoid double-hydrating
    if (get().isHydrated) return;

    try {
      const res = await fetch("/api/init");
      if (!res.ok) {
        // 503 = DB not configured; 401 = not logged in yet. Both are fine — just
        // continue with mock data. Any other status is logged as a warning.
        if (res.status !== 503 && res.status !== 401) {
          console.warn("[hydrateStore] Unexpected status:", res.status);
        }
        return;
      }

      const data = await res.json();

      set((s) => ({
        isHydrated: true,
        allUsers: data.allUsers ?? s.allUsers,
        categories: data.categories ?? s.categories,
        suppliers: data.suppliers ?? s.suppliers,
        stockItems: data.stockItems ?? s.stockItems,
        requisitions: data.requisitions ?? s.requisitions,
        stockTransactions: data.stockTransactions ?? s.stockTransactions,
        issuances: data.issuances ?? s.issuances,
        auditLogs: data.auditLogs ?? s.auditLogs,
        notifications: data.notifications ?? s.notifications,
      }));
    } catch (err) {
      // Network error — silently continue with in-memory mock data
      console.warn("[hydrateStore] Could not reach /api/init:", err);
    }
  },
}));
