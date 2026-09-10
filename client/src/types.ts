export interface WaterPackage {
  id: string;
  title: string;
  subtitle: string;
  volume: string;
  price: number;
  regularPrice?: number;
  unit: string;
  popular?: boolean;
  bestValue?: boolean;
  features: string[];
  depositRequired: boolean;
  depositAmount: number;
  iconName: 'droplets' | 'sparkles' | 'zap' | 'building';
}

export interface OrderItem {
  packageId: string;
  packageTitle: string;
  quantity: number;
  unitPrice: number;
  hasEmptyJar: boolean;
  jarDeposit: number;
  totalPrice: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  area: string;
  address: string;
  deliverySlot: string;
  paymentMethod: 'cod' | 'bkash' | 'nagad';
  notes?: string;
}

export interface ConfirmedOrder {
  orderId: string;
  createdAt: string;
  customer: CustomerDetails;
  item: OrderItem;
  status: 'নিশ্চিত হয়েছে' | 'ডেলিভারিতে আছে' | 'সম্পন্ন';
}
