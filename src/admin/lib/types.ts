export type Role = 'user' | 'admin' | 'supplier';
export type UserStatus = 'active' | 'pending' | 'suspended';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  status: UserStatus;
  address?: string;
  area?: string;
  supplier?: {
    businessName?: string;
    serviceAreas?: string[];
    tradeLicense?: string;
  };
  lastSeenAt?: string;
  createdAt: string;
  updatedAt: string;
  // Present on admin user listings
  orderCount?: number;
  assignedCount?: number;
  deliveredCount?: number;
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
  notes?: string;
  status: OrderStatus;
  supplier?: (Pick<User, '_id' | 'name' | 'phone' | 'email'> & { supplier?: { businessName?: string } }) | null;
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
