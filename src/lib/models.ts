export type Role = 'user' | 'admin' | 'supplier';
export type UserStatus = 'active' | 'pending' | 'suspended';

export interface User {
  _id: string;
  name: string;
  /** Optional for customers & suppliers; always set for admins. */
  email?: string;
  /** Required for customers & suppliers (01XXXXXXXXX). */
  phone?: string;
  role: Role;
  status: UserStatus;
  address?: string;
  area?: string;
  supplier?: {
    businessName?: string;
    /** Approved areas only. */
    serviceAreas?: string[];
    tradeLicense?: string;
    /** Areas the supplier asked to add; kept as history after a decision. */
    areaRequests?: AreaRequest[];
    /** When the supplier can deliver anywhere in a zone. */
    availability?: ZoneAvailability[];
  };
  lastSeenAt?: string;
  createdAt: string;
  updatedAt: string;
  // Present on admin user listings
  orderCount?: number;
  assignedCount?: number;
  deliveredCount?: number;
}

export type AreaRequestStatus = 'pending' | 'approved' | 'rejected';

/** Delivery windows (Bangladesh time) shared by suppliers' availability and customers' orders. */
export type SupplierWindow = 'morning' | 'afternoon' | 'evening';
export type DeliveryWindow = 'express' | SupplierWindow;

export interface ZoneAvailability {
  zone: string;
  windows: SupplierWindow[];
  /** 0 = Sunday … 6 = Saturday */
  days: number[];
}

export type AssignmentMethod = 'locked' | 'auto_area' | 'auto_zone_time' | 'admin';
export type AssignmentFlag = 'locked_supplier_unavailable' | 'no_match';

/** A delivery zone: a group of locations (GET /api/areas). */
export interface Zone {
  _id: string;
  /** Display name: Bengali if set, otherwise English. */
  name: string;
  nameEn: string;
  nameBn?: string;
  minMinutes: number;
  maxMinutes: number;
  sortOrder: number;
}

/** A delivery location (GET /api/areas). Users and orders store its `name`. */
export interface Location {
  _id: string;
  /** Display name: Bengali if set, otherwise English. */
  name: string;
  /** Missing only on locations created before English names were required. */
  nameEn?: string;
  nameBn?: string;
  aliases: string[];
  zone: string | null;
  sortOrder: number;
}

/** A location that isn't on the list yet, proposed by a supplier. */
export interface NewLocation {
  nameEn: string;
  nameBn?: string;
  aliases?: string[];
  zone?: string | null;
}

export interface AreaRequest {
  _id: string;
  name: string;
  nameEn?: string;
  nameBn?: string;
  aliases?: string[];
  zone?: string | null;
  status: AreaRequestStatus;
  requestedAt: string;
  decidedAt?: string;
}

/** A location as the admin manages it (GET /api/areas/manage). */
export interface ManagedArea extends Location {
  supplierCount: number;
  customerCount: number;
  createdAt: string;
}

/** A zone as the admin manages it (GET /api/areas/manage). */
export interface ManagedZone extends Zone {
  areaCount: number;
  createdAt: string;
}

/** A pending request across all suppliers (GET /api/areas/manage). */
export interface PendingAreaRequest extends AreaRequest {
  supplier: { _id: string; name: string; phone?: string; status: UserStatus; businessName?: string };
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'bkash' | 'nagad';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface OrderHistoryEntry {
  status: OrderStatus;
  note?: string;
  at: string;
  by?: { _id: string; name: string; role: Role } | null;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user?: Pick<User, '_id' | 'name' | 'email' | 'phone'> | null;
  customer: { name: string; phone: string; area: string; address: string };
  item: {
    package?: string;
    packageSlug: string;
    packageTitle: string;
    quantity: number;
    unitPrice: number;
    hasEmptyJar: boolean;
    jarDeposit: number;
  };
  deliveryCharge: number;
  total: number;
  deliverySlot?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  notes?: string;
  status: OrderStatus;
  supplier?: (Pick<User, '_id' | 'name' | 'phone' | 'email' | 'status'> & { supplier?: { businessName?: string } }) | null;
  /** How the supplier was chosen, and why an order was left unassigned. */
  assignment?: { method?: AssignmentMethod; at?: string; flag?: AssignmentFlag | null };
  delivery?: { date?: string; window?: DeliveryWindow };
  zone?: string;
  /** Admin only: the person behind the order (shared by their guest and signed-in orders). */
  customerRef?: {
    _id: string;
    phones: string[];
    supplier?: (Pick<User, '_id' | 'name' | 'phone' | 'status'> & { supplier?: { businessName?: string } }) | null;
    supplierSetBy?: 'auto' | 'admin';
    supplierSetAt?: string;
  } | null;
  deviceId?: string;
  clientIp?: string;
  userAgent?: string;
  history: OrderHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export type PackageIcon = 'droplets' | 'sparkles' | 'zap' | 'building';

export interface Package {
  _id: string;
  slug: string;
  title: string;
  subtitle?: string;
  volume?: string;
  price: number;
  regularPrice?: number;
  unit?: string;
  popular?: boolean;
  bestValue?: boolean;
  features: string[];
  depositRequired: boolean;
  depositAmount: number;
  iconName: PackageIcon;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  user: Pick<User, '_id' | 'name' | 'email' | 'role' | 'phone' | 'status' | 'supplier'>;
  lastMessage: string;
  lastMessageAt: string;
  lastSender?: string;
  unreadForAdmin: number;
  unreadForUser: number;
}

export interface ChatMessage {
  _id: string;
  conversation: string;
  sender: { _id: string; name: string; role: Role };
  text: string;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export interface StatsOverview {
  totals: {
    orders: number;
    today: number;
    revenue: number;
    jarsDelivered: number;
    pending: number;
    inProgress: number;
    delivered: number;
    cancelled: number;
    users?: number;
    activeSuppliers?: number;
    pendingSuppliers?: number;
    packages?: number;
    unreadChats?: number;
  };
  statusCounts: Partial<Record<OrderStatus, number>>;
  series: { date: string; orders: number; revenue: number; jars: number }[];
  topPackages: { name: string; quantity: number; revenue: number; orders: number }[];
  topSuppliers?: { _id: string; name: string; delivered: number; revenue: number }[];
  recentOrders: Order[];
}
