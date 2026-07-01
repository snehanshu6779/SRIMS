// ─── Roles ───
export type UserRole = "ADMIN" | "USER" | "APPROVER" | "INVENTORY_MGR";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  departmentName?: string;
  avatarUrl?: string;
}

// ─── Requisition ───
export type RequisitionStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ISSUED"
  | "PARTIAL";

export interface RequisitionItem {
  id: string;
  itemId: string;
  itemName: string;
  categoryName: string;
  unit: string;
  requestedQty: number;
  approvedQty: number;
  issuedQty: number;
  unitPrice: number;
}

export interface Requisition {
  id: string;
  userId: string;
  userName: string;
  departmentName: string;
  status: RequisitionStatus;
  purpose: string;
  remarks: string;
  requiredDate: string;
  totalAmount: number;
  createdAt: string;
  approvedById?: string;
  approvedAt?: string;
  rejectedReason?: string;
  items: RequisitionItem[];
}

// ─── Inventory ───
export type StockStatus = "IN_STOCK" | "LOW" | "CRITICAL" | "OUT_OF_STOCK";
export type StockTransactionType = "INWARD" | "OUTWARD" | "ADJUSTMENT";

export interface Item {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  unit: string;
  unitPrice: number;
  currentStock: number;
  minStockLevel: number;
  isActive: boolean;
  iconKey: string;
}

export interface StockTransaction {
  id: string;
  type: StockTransactionType;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  referenceNo: string;
  date: string;
}

// ─── Navigation ───
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  roles?: UserRole[];
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

// ─── Status pill variants ───
export type StatusVariant =
  | "pending"
  | "approved"
  | "issued"
  | "rejected"
  | "new"
  | "low"
  | "critical"
  | "inStock"
  | "outOfStock"
  | "partial"
  | "draft"
  | "inward"
  | "outward";

// ─── Stat Card ───
export type TintColor = "blue" | "amber" | "green" | "purple" | "red";
export type DeltaTone = "positive" | "negative";
