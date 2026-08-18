export type Role = 'customer' | 'manager' | 'kitchen' | 'admin';

export type Language = 'en' | 'ur_roman';

export type Theme = 'light' | 'dark';

export type TableStatus = 'available' | 'reserved' | 'occupied' | 'cleaning' | 'out_of_service';

export type ReservationStatus = 'confirmed' | 'checked_in' | 'no_show' | 'cancelled' | 'expired' | 'refunded';

export type RestaurantStatus = 'active' | 'pending' | 'suspended';

export type OrderStatus =
  | 'received'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'serving'
  | 'served'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 'cash' | 'card' | 'easypaisa' | 'jazzcash' | 'raast';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';

export type StaffRole = 'Branch Manager' | 'Supervisor' | 'Cashier' | 'Kitchen Staff' | 'Waiter' | 'Reception';

export type StaffStatus = 'On Duty' | 'Off Duty' | 'Break' | 'Absent';

export interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  section: string; // e.g. 'Indoor AC', 'Terrace Sea-View', 'Family Hall', 'Courtyard'
  status: TableStatus;
  qrCodeToken: string;
  currentSessionId?: string;
}

export interface MenuItemAddon {
  id: string;
  name: string;
  nameUrdu?: string;
  price: number;
}

export interface MenuItemVariation {
  id: string;
  name: string; // e.g., 'Regular', 'Large', 'Half', 'Full'
  priceModifier: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  category: string;
  name: string;
  nameUrdu: string;
  description: string;
  image: string;
  basePrice: number;
  prepTimeMinutes: number;
  isAvailableGlobal: boolean;
  lowStockThreshold: number;
  ingredients?: string[];
  addons?: MenuItemAddon[];
  variations?: MenuItemVariation[];
  taxPercent?: number;
  discountPercent?: number;
  isPopular?: boolean;
  isSpicy?: boolean;
}

export interface BranchInventoryItem {
  menuItemId: string;
  branchId: string;
  stockQuantity: number;
  isAvailableAtBranch: boolean;
  lowStockThreshold: number;
}

export interface Branch {
  id: string;
  restaurantId: string;
  name: string;
  city: string;
  area: string;
  address: string;
  phone: string;
  email: string;
  isOpen: boolean;
  closureReason?: string;
  openingHours: string;
  reservationFee: number;
  gracePeriodMinutes: number;
  cancellationDeadlineHours: number;
  cancellationFee: number;
  taxRatePercent: number;
  serviceChargePercent: number;
  kitchenPrinters: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  cuisine: string[];
  cuisineTypes?: string[];
  rating: number;
  reviewCount: number;
  priceRange: 'PKR' | 'PKR PKR' | 'PKR PKR PKR';
  logo: string;
  coverImage: string;
  description: string;
  facilities: string[];
  isApproved: boolean;
  isSuspended: boolean;
  commissionPercent: number;
  status?: RestaurantStatus;
  ntn?: string;
  phone?: string;
  email?: string;
  city?: string;
}

export interface CartItem {
  cartItemId: string;
  menuItemId: string;
  name: string;
  basePrice: number;
  selectedVariation?: MenuItemVariation;
  selectedAddons: MenuItemAddon[];
  quantity: number;
  specialInstructions?: string;
  itemTotal: number;
}

export interface Reservation {
  id: string;
  restaurantId: string;
  branchId: string;
  tableId: string;
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string;
  time: string;
  guests: number;
  bookingFee: number;
  paymentStatus: PaymentStatus;
  status: ReservationStatus;
  createdAt: string;
  cancellationReason?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  selectedVariation?: string;
  selectedAddons?: string[];
  specialInstructions?: string;
  totalPrice: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  branchId: string;
  tableId: string;
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  discountAmount: number;
  bookingFeeDeduction: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId: string;
  transactionRef?: string;
  createdAt: string;
  prepStartedAt?: string;
  estimatedPrepMinutes: number;
  expectedReadyAt?: string;
  delayMinutes?: number;
  delayReason?: string;
  isReviewed?: boolean;
  pointsEarned: number;
}

export interface LoyaltyAccount {
  customerId: string;
  pointsBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Dastanay Elite';
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  type: 'earn' | 'redeem';
  points: number;
  orderId?: string;
  description: string;
  timestamp: string;
}

export interface Review {
  id: string;
  restaurantId: string;
  branchId: string;
  orderId: string;
  customerName: string;
  foodRating: number;
  serviceRating: number;
  staffRating: number;
  overallRating: number;
  comment: string;
  createdAt: string;
  status: 'published' | 'hidden' | 'flagged';
  response?: string;
}

export interface StaffMember {
  id: string;
  branchId: string;
  restaurantId: string;
  name: string;
  phone: string;
  role: StaffRole;
  status: StaffStatus;
  clockInTime?: string;
  breakStartTime?: string;
  totalBreakMinutesToday: number;
  totalHoursThisWeek: number;
  totalHoursThisMonth: number;
}

export interface StaffAttendanceLog {
  id: string;
  staffId: string;
  staffName: string;
  branchId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  totalBreakMinutes: number;
  netWorkHours: number;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string;
  previousValue?: string;
  newValue?: string;
  branchId?: string;
}

export interface NotificationItem {
  id: string;
  targetRole: 'customer' | 'manager' | 'kitchen' | 'admin' | 'all';
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  orderId?: string;
  tableNumber?: string;
  read: boolean;
}

export interface Promotion {
  id: string;
  restaurantId: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
  maxDiscount?: number;
  validUntil: string;
  isActive: boolean;
}
