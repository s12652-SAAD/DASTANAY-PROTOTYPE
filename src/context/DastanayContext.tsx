import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  Language,
  Theme,
  Restaurant,
  Branch,
  Table,
  MenuItem,
  BranchInventoryItem,
  StaffMember,
  Reservation,
  Order,
  CartItem,
  Review,
  Promotion,
  LoyaltyAccount,
  LoyaltyTransaction,
  AuditLog,
  NotificationItem,
  PaymentMethod,
  StaffStatus,
} from '../types';
import {
  INITIAL_RESTAURANTS,
  INITIAL_BRANCHES,
  INITIAL_TABLES,
  INITIAL_MENU_ITEMS,
  INITIAL_INVENTORY,
  INITIAL_STAFF,
  INITIAL_RESERVATIONS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_PROMOTIONS,
  INITIAL_LOYALTY,
  INITIAL_AUDIT_LOGS,
} from '../data/seedData';

interface DastanayContextType {
  role: Role;
  setRole: (role: Role) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  networkStatus: 'online' | 'weak' | 'offline';
  setNetworkStatus: (status: 'online' | 'weak' | 'offline') => void;

  // Selected scope
  currentRestaurantId: string;
  setCurrentRestaurantId: (id: string) => void;
  currentBranchId: string;
  setCurrentBranchId: (id: string) => void;
  currentTableSession: { tableId: string; tableNumber: string; sessionId: string } | null;
  setCurrentTableSession: (session: { tableId: string; tableNumber: string; sessionId: string } | null) => void;

  // Data collections
  restaurants: Restaurant[];
  branches: Branch[];
  tables: Table[];
  menuItems: MenuItem[];
  inventory: BranchInventoryItem[];
  staff: StaffMember[];
  reservations: Reservation[];
  orders: Order[];
  reviews: Review[];
  promotions: Promotion[];
  loyalty: LoyaltyAccount;
  loyaltyHistory: LoyaltyTransaction[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];

  // Customer Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartItemQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  appliedPromo: Promotion | null;
  setAppliedPromo: (promo: Promotion | null) => void;
  redeemedPoints: number;
  setRedeemedPoints: (pts: number) => void;

  // Actions
  createReservation: (resData: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => { success: boolean; message: string; reservation?: Reservation };
  cancelReservation: (reservationId: string, reason?: string) => { success: boolean; message: string };
  checkInReservation: (reservationId: string) => { success: boolean; message: string };
  startTableSession: (tableNumber: string, reservationId?: string) => { success: boolean; message: string; table?: Table };
  endTableSession: (tableId: string) => void;
  placeOrder: (paymentMethod: PaymentMethod, customerPhone?: string, customerName?: string) => { success: boolean; message: string; order?: Order };
  updateOrderStatus: (orderId: string, status: Order['status'], delayMinutes?: number, delayReason?: string) => void;
  completeOrderPayment: (orderId: string, method: PaymentMethod, staffName?: string) => void;
  processRefund: (orderId: string, refundAmount: number, reason: string, staffName: string) => void;
  submitReview: (orderId: string, foodRating: number, serviceRating: number, staffRating: number, comment: string) => void;

  // Manager & Staff Actions
  toggleBranchStatus: (branchId: string, isOpen: boolean, reason?: string) => void;
  updateTableStatus: (tableId: string, status: Table['status']) => void;
  regenerateTableQR: (tableId: string) => void;
  updateStock: (menuItemId: string, branchId: string, quantity: number) => void;
  toggleItemBranchAvailability: (menuItemId: string, branchId: string, isAvailable: boolean) => void;
  updateMenuItemPrice: (menuItemId: string, newPrice: number) => void;
  createMenuItem: (newItem: Omit<MenuItem, 'id'>) => void;
  updateStaffDuty: (staffId: string, status: StaffStatus) => void;

  // Admin Actions
  approveRestaurant: (restaurantId: string) => void;
  suspendRestaurant: (restaurantId: string) => void;
  createRestaurant: (data: Partial<Restaurant>) => void;
  createBranch: (data: Partial<Branch>) => void;

  // Thermal Printing
  printModalData: { type: 'kot' | 'receipt' | 'bar'; order: Order } | null;
  setPrintModalData: (data: { type: 'kot' | 'receipt' | 'bar'; order: Order } | null) => void;

  // Notification Helpers
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

const DastanayContext = createContext<DastanayContextType | undefined>(undefined);

export const DastanayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // App Config States
  const [role, setRole] = useState<Role>('customer');
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('dst_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [networkStatus, setNetworkStatus] = useState<'online' | 'weak' | 'offline'>('online');

  // Selected Scope
  const [currentRestaurantId, setCurrentRestaurantId] = useState<string>('rest-kolachi');
  const [currentBranchId, setCurrentBranchId] = useState<string>('br-kolachi-dha');
  const [currentTableSession, setCurrentTableSession] = useState<{ tableId: string; tableNumber: string; sessionId: string } | null>(null);

  // Core Data
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const saved = localStorage.getItem('dst_restaurants');
    return saved ? JSON.parse(saved) : INITIAL_RESTAURANTS;
  });

  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem('dst_branches');
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });

  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem('dst_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('dst_menu_items');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [inventory, setInventory] = useState<BranchInventoryItem[]>(() => {
    const saved = localStorage.getItem('dst_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('dst_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('dst_reservations');
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('dst_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('dst_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [promotions] = useState<Promotion[]>(INITIAL_PROMOTIONS);
  const [loyalty, setLoyalty] = useState<LoyaltyAccount>(() => {
    const saved = localStorage.getItem('dst_loyalty');
    return saved ? JSON.parse(saved) : INITIAL_LOYALTY;
  });

  const [loyaltyHistory, setLoyaltyHistory] = useState<LoyaltyTransaction[]>([
    {
      id: 'ltx-1',
      customerId: 'cust-current-user',
      type: 'earn',
      points: 398,
      orderId: 'DST-ORD-9101',
      description: 'Points earned on Kolachi DHA order',
      timestamp: '2026-08-14 07:45 PM',
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('dst_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      targetRole: 'all',
      title: 'Welcome to Dastanay',
      message: 'Explore authentic dining across Karachi, Lahore & Islamabad.',
      type: 'info',
      timestamp: 'Just now',
      read: false,
    }
  ]);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('dst_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [redeemedPoints, setRedeemedPoints] = useState<number>(0);

  // Printing state
  const [printModalData, setPrintModalData] = useState<{ type: 'kot' | 'receipt' | 'bar'; order: Order } | null>(null);

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem('dst_restaurants', JSON.stringify(restaurants));
    localStorage.setItem('dst_branches', JSON.stringify(branches));
    localStorage.setItem('dst_tables', JSON.stringify(tables));
    localStorage.setItem('dst_menu_items', JSON.stringify(menuItems));
    localStorage.setItem('dst_inventory', JSON.stringify(inventory));
    localStorage.setItem('dst_staff', JSON.stringify(staff));
    localStorage.setItem('dst_reservations', JSON.stringify(reservations));
    localStorage.setItem('dst_orders', JSON.stringify(orders));
    localStorage.setItem('dst_reviews', JSON.stringify(reviews));
    localStorage.setItem('dst_loyalty', JSON.stringify(loyalty));
    localStorage.setItem('dst_audit_logs', JSON.stringify(auditLogs));
    localStorage.setItem('dst_cart', JSON.stringify(cart));
  }, [restaurants, branches, tables, menuItems, inventory, staff, reservations, orders, reviews, loyalty, auditLogs, cart]);

  // Handle Theme class on body
  useEffect(() => {
    localStorage.setItem('dst_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Helper to add notification & play subtle tone
  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 40)]);
  };

  const addAuditLog = (entry: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...entry,
      id: 'aud-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Cart operations
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.menuItemId === item.menuItemId &&
          i.selectedVariation?.id === item.selectedVariation?.id &&
          JSON.stringify(i.selectedAddons) === JSON.stringify(item.selectedAddons) &&
          i.specialInstructions === item.specialInstructions
      );
      if (existingIdx > -1) {
        const next = [...prev];
        const nextQty = next[existingIdx].quantity + item.quantity;
        const singlePrice = next[existingIdx].itemTotal / next[existingIdx].quantity;
        next[existingIdx].quantity = nextQty;
        next[existingIdx].itemTotal = singlePrice * nextQty;
        return next;
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const updateCartItemQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            const singlePrice = item.itemTotal / item.quantity;
            return {
              ...item,
              quantity: nextQty,
              itemTotal: singlePrice * nextQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
    setRedeemedPoints(0);
  };

  // 1. Table Reservation
  const createReservation = (resData: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => {
    // Check if table is available for branch
    const table = tables.find((t) => t.id === resData.tableId);
    if (!table || table.status === 'occupied' || table.status === 'out_of_service') {
      return {
        success: false,
        message: 'This table was just booked by another customer. Please select another table.',
      };
    }

    const resId = `DST-RES-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReservation: Reservation = {
      ...resData,
      id: resId,
      status: 'confirmed',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setReservations((prev) => [newReservation, ...prev]);

    // Update table status to reserved
    setTables((prev) =>
      prev.map((t) => (t.id === resData.tableId ? { ...t, status: 'reserved' } : t))
    );

    addNotification({
      targetRole: 'all',
      title: 'Reservation Confirmed',
      message: `Reservation ${resId} confirmed for ${resData.customerName} at ${resData.tableNumber}.`,
      type: 'success',
      tableNumber: resData.tableNumber,
    });

    addAuditLog({
      userName: resData.customerName,
      userRole: 'Customer',
      action: 'RESERVATION_CREATED',
      entity: 'Reservation',
      entityId: resId,
      newValue: `Table ${resData.tableNumber}, ${resData.guests} guests, Fee: Rs. ${resData.bookingFee}`,
      branchId: resData.branchId,
    });

    return {
      success: true,
      message: 'Table booked successfully! Your reservation ID is ' + resId,
      reservation: newReservation,
    };
  };

  const cancelReservation = (reservationId: string, reason?: string) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return { success: false, message: 'Reservation not found' };

    setReservations((prev) =>
      prev.map((r) =>
        r.id === reservationId ? { ...r, status: 'cancelled', cancellationReason: reason } : r
      )
    );

    // Free up table
    setTables((prev) =>
      prev.map((t) => (t.id === res.tableId ? { ...t, status: 'available' } : t))
    );

    addNotification({
      targetRole: 'all',
      title: 'Reservation Cancelled',
      message: `Reservation ${reservationId} for ${res.tableNumber} has been cancelled.`,
      type: 'warning',
      tableNumber: res.tableNumber,
    });

    addAuditLog({
      userName: 'Customer / Staff',
      userRole: 'System',
      action: 'RESERVATION_CANCELLED',
      entity: 'Reservation',
      entityId: reservationId,
      newValue: reason || 'Cancelled by user',
      branchId: res.branchId,
    });

    return { success: true, message: 'Reservation has been cancelled.' };
  };

  const checkInReservation = (reservationId: string) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return { success: false, message: 'Reservation not found' };

    const sessionId = `DST-SESS-${Math.floor(10000 + Math.random() * 90000)}`;

    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status: 'checked_in' } : r))
    );

    setTables((prev) =>
      prev.map((t) =>
        t.id === res.tableId ? { ...t, status: 'occupied', currentSessionId: sessionId } : t
      )
    );

    addNotification({
      targetRole: 'all',
      title: 'Guest Checked In',
      message: `${res.customerName} checked in for ${res.tableNumber}.`,
      type: 'success',
      tableNumber: res.tableNumber,
    });

    addAuditLog({
      userName: 'Branch Manager',
      userRole: 'Manager',
      action: 'RESERVATION_CHECKED_IN',
      entity: 'Reservation',
      entityId: reservationId,
      newValue: `Table ${res.tableNumber} occupied for ${res.customerName}`,
      branchId: res.branchId,
    });

    return { success: true, message: `${res.customerName} successfully checked in at ${res.tableNumber}.` };
  };

  // 2. Table Session Check-In
  const startTableSession = (tableNumber: string, reservationId?: string) => {
    const table = tables.find(
      (t) => t.tableNumber.toLowerCase() === tableNumber.toLowerCase() || t.id === tableNumber
    );
    if (!table) {
      return { success: false, message: 'Table not found in this branch.' };
    }
    if (table.status === 'out_of_service') {
      return { success: false, message: 'This table is currently out of service.' };
    }

    const sessionId = `DST-SESS-${Math.floor(10000 + Math.random() * 90000)}`;

    setTables((prev) =>
      prev.map((t) =>
        t.id === table.id
          ? { ...t, status: 'occupied', currentSessionId: sessionId }
          : t
      )
    );

    if (reservationId) {
      setReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, status: 'checked_in' } : r))
      );
    }

    setCurrentTableSession({
      tableId: table.id,
      tableNumber: table.tableNumber,
      sessionId,
    });

    addNotification({
      targetRole: 'manager',
      title: 'Table Session Started',
      message: `Table ${table.tableNumber} is now occupied and active.`,
      type: 'info',
      tableNumber: table.tableNumber,
    });

    return {
      success: true,
      message: `Session started at ${table.tableNumber}. You can now browse menu and order directly.`,
      table,
    };
  };

  const endTableSession = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, status: 'cleaning', currentSessionId: undefined }
          : t
      )
    );
    if (currentTableSession?.tableId === tableId) {
      setCurrentTableSession(null);
    }
  };

  // 3. Order Placement & Stock Safety
  const placeOrder = (
    paymentMethod: PaymentMethod,
    customerPhone: string = '+92 300 1234567',
    customerName: string = 'Syed Ahmed'
  ) => {
    if (cart.length === 0) {
      return { success: false, message: 'Your cart is empty.' };
    }

    // Check branch open
    const currentBranch = branches.find((b) => b.id === currentBranchId);
    if (currentBranch && !currentBranch.isOpen) {
      return { success: false, message: 'This restaurant branch is currently closed for new orders.' };
    }

    // Transaction-safe stock check
    for (const item of cart) {
      const inv = inventory.find(
        (i) => i.menuItemId === item.menuItemId && i.branchId === currentBranchId
      );
      if (inv) {
        if (!inv.isAvailableAtBranch || inv.stockQuantity < item.quantity) {
          return {
            success: false,
            message: `Sorry, ${item.name} is currently out of stock or insufficient quantity (Only ${inv.stockQuantity} remaining).`,
          };
        }
      }
    }

    // Calculate financials
    const subtotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);
    const taxRate = currentBranch?.taxRatePercent || 13;
    const serviceRate = currentBranch?.serviceChargePercent || 5;

    const discountAmount = appliedPromo
      ? appliedPromo.discountType === 'percentage'
        ? Math.min((subtotal * appliedPromo.discountValue) / 100, appliedPromo.maxDiscount || 99999)
        : appliedPromo.discountValue
      : 0;

    const loyaltyDiscount = redeemedPoints > 0 ? (redeemedPoints / 100) * 50 : 0;
    const totalDiscount = discountAmount + loyaltyDiscount;

    const taxAmount = (subtotal * taxRate) / 100;
    const serviceCharge = (subtotal * serviceRate) / 100;

    // Check if table has a reservation booking fee to deduct
    const currentTableId = currentTableSession?.tableId || 'tbl-1';
    const currentTableNum = currentTableSession?.tableNumber || 'Table 01';
    const activeRes = reservations.find(
      (r) => r.tableId === currentTableId && r.status === 'checked_in'
    );
    const bookingFeeDeduction = activeRes ? activeRes.bookingFee : 0;

    const total = Math.max(0, subtotal + taxAmount + serviceCharge - totalDiscount - bookingFeeDeduction);

    // Calculate maximum prep time among items
    let maxPrepMinutes = 15;
    for (const cItem of cart) {
      const mItem = menuItems.find((m) => m.id === cItem.menuItemId);
      if (mItem && mItem.prepTimeMinutes > maxPrepMinutes) {
        maxPrepMinutes = mItem.prepTimeMinutes;
      }
    }

    // Expected ready timestamp
    const now = new Date();
    const readyDate = new Date(now.getTime() + maxPrepMinutes * 60000);
    const readyTimeStr = readyDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const orderId = `DST-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentId = `PAY-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrderItems = cart.map((c) => ({
      menuItemId: c.menuItemId,
      name: c.name,
      quantity: c.quantity,
      unitPrice: c.itemTotal / c.quantity,
      selectedVariation: c.selectedVariation?.name,
      selectedAddons: c.selectedAddons.map((a) => a.name),
      specialInstructions: c.specialInstructions,
      totalPrice: c.itemTotal,
    }));

    const pointsEarned = Math.floor(total / 10);

    const newOrder: Order = {
      id: orderId,
      restaurantId: currentRestaurantId,
      branchId: currentBranchId,
      tableId: currentTableId,
      tableNumber: currentTableNum,
      customerName,
      customerPhone,
      items: newOrderItems,
      subtotal,
      taxAmount,
      serviceCharge,
      discountAmount: totalDiscount,
      bookingFeeDeduction,
      total,
      status: 'received',
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
      paymentId,
      transactionRef: `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedPrepMinutes: maxPrepMinutes,
      expectedReadyAt: readyTimeStr,
      pointsEarned,
    };

    // Deduct stock safely
    setInventory((prev) =>
      prev.map((inv) => {
        const matchingCart = cart.find(
          (c) => c.menuItemId === inv.menuItemId && inv.branchId === currentBranchId
        );
        if (matchingCart) {
          const nextStock = Math.max(0, inv.stockQuantity - matchingCart.quantity);
          // Check if low stock
          if (nextStock <= inv.lowStockThreshold && nextStock > 0) {
            addNotification({
              targetRole: 'manager',
              title: 'Low Stock Alert',
              message: `${matchingCart.name} reached ${nextStock} items remaining.`,
              type: 'warning',
            });
          } else if (nextStock === 0) {
            addNotification({
              targetRole: 'manager',
              title: 'Item Out of Stock',
              message: `${matchingCart.name} is now 0 stock and marked unavailable.`,
              type: 'error',
            });
          }
          return {
            ...inv,
            stockQuantity: nextStock,
            isAvailableAtBranch: nextStock > 0,
          };
        }
        return inv;
      })
    );

    // Save order
    setOrders((prev) => [newOrder, ...prev]);

    // Handle Loyalty Points if redeemed
    if (redeemedPoints > 0) {
      setLoyalty((prev) => ({
        ...prev,
        pointsBalance: Math.max(0, prev.pointsBalance - redeemedPoints),
        totalRedeemed: prev.totalRedeemed + redeemedPoints,
      }));
      setLoyaltyHistory((prev) => [
        {
          id: 'ltx-' + Date.now(),
          customerId: 'cust-current-user',
          type: 'redeem',
          points: redeemedPoints,
          orderId,
          description: `Redeemed on order ${orderId}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);
    }

    // Auto-trigger thermal KOT ticket for the kitchen
    setPrintModalData({ type: 'kot', order: newOrder });

    addNotification({
      targetRole: 'all',
      title: 'Order Placed Successfully',
      message: `Order #${orderId} sent to kitchen for ${currentTableNum}. Estimated prep: ${maxPrepMinutes} mins.`,
      type: 'success',
      orderId,
      tableNumber: currentTableNum,
    });

    addAuditLog({
      userName: customerName,
      userRole: 'Customer',
      action: 'ORDER_PLACED',
      entity: 'Order',
      entityId: orderId,
      newValue: `Total: Rs. ${total.toFixed(0)}, Items: ${newOrderItems.length}, Method: ${paymentMethod}`,
      branchId: currentBranchId,
    });

    clearCart();

    return {
      success: true,
      message: `Order #${orderId} placed successfully!`,
      order: newOrder,
    };
  };

  // 4. Update Order Status in Kitchen/Serving
  const updateOrderStatus = (
    orderId: string,
    status: Order['status'],
    delayMinutes?: number,
    delayReason?: string
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated: Order = {
            ...ord,
            status,
            delayMinutes: delayMinutes !== undefined ? (ord.delayMinutes || 0) + delayMinutes : ord.delayMinutes,
            delayReason: delayReason || ord.delayReason,
          };
          if (status === 'preparing' && !ord.prepStartedAt) {
            updated.prepStartedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
          if (status === 'completed' && ord.paymentStatus === 'paid' && !ord.isReviewed) {
            // award loyalty points
            setLoyalty((l) => ({
              ...l,
              pointsBalance: l.pointsBalance + ord.pointsEarned,
              totalEarned: l.totalEarned + ord.pointsEarned,
            }));
            setLoyaltyHistory((lh) => [
              {
                id: 'ltx-' + Date.now(),
                customerId: 'cust-current-user',
                type: 'earn',
                points: ord.pointsEarned,
                orderId: ord.id,
                description: `Earned from completed order ${ord.id}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
              ...lh,
            ]);
          }
          return updated;
        }
        return ord;
      })
    );

    const targetOrder = orders.find((o) => o.id === orderId);
    const tableNum = targetOrder?.tableNumber || 'Table';

    let notifTitle = `Order Status: ${status}`;
    let notifMsg = `Order #${orderId} is now ${status}`;

    if (status === 'ready') {
      notifTitle = 'Your food is ready!';
      notifMsg = `Order #${orderId} for ${tableNum} is freshly prepared and being dispatched to your table.`;
    } else if (status === 'served') {
      notifTitle = 'Order Served';
      notifMsg = `Your order has been served. Enjoy your meal!`;
    } else if (delayMinutes) {
      notifTitle = 'Kitchen Delay Notice';
      notifMsg = `Order #${orderId} has a brief ${delayMinutes} min delay: ${delayReason || 'Quality preparation'}.`;
    }

    addNotification({
      targetRole: 'all',
      title: notifTitle,
      message: notifMsg,
      type: status === 'ready' || status === 'served' ? 'success' : 'info',
      orderId,
      tableNumber: tableNum,
    });
  };

  const completeOrderPayment = (orderId: string, method: PaymentMethod, staffName: string = 'Muhammad Bilal (Cashier)') => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentStatus: 'paid',
              paymentMethod: method,
              status: o.status === 'served' ? 'completed' : o.status,
            }
          : o
      )
    );

    const ord = orders.find((o) => o.id === orderId);
    if (ord) {
      addAuditLog({
        userName: staffName,
        userRole: 'Cashier',
        action: 'PAYMENT_CONFIRMED',
        entity: 'Payment',
        entityId: ord.paymentId,
        newValue: `Amount: Rs. ${ord.total.toFixed(0)}, Method: ${method}`,
        branchId: ord.branchId,
      });

      addNotification({
        targetRole: 'all',
        title: 'Payment Confirmed',
        message: `Payment of Rs. ${ord.total.toFixed(0)} received for ${ord.tableNumber} via ${method.toUpperCase()}.`,
        type: 'success',
        orderId,
        tableNumber: ord.tableNumber,
      });

      // Auto-trigger Customer Bill Receipt
      setPrintModalData({ type: 'receipt', order: { ...ord, paymentStatus: 'paid' } });
    }
  };

  const processRefund = (orderId: string, refundAmount: number, reason: string, staffName: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentStatus: 'refunded',
              status: 'refunded',
            }
          : o
      )
    );

    const ord = orders.find((o) => o.id === orderId);

    addAuditLog({
      userName: staffName,
      userRole: 'Branch Manager',
      action: 'REFUND_PROCESSED',
      entity: 'OrderRefund',
      entityId: orderId,
      newValue: `Refund: Rs. ${refundAmount}, Reason: ${reason}`,
      branchId: ord?.branchId,
    });

    addNotification({
      targetRole: 'all',
      title: 'Refund Processed',
      message: `Refund of Rs. ${refundAmount} authorized for Order #${orderId}. Reason: ${reason}`,
      type: 'warning',
      orderId,
    });
  };

  const submitReview = (
    orderId: string,
    foodRating: number,
    serviceRating: number,
    staffRating: number,
    comment: string
  ) => {
    const ord = orders.find((o) => o.id === orderId);
    const overall = Number(((foodRating + serviceRating + staffRating) / 3).toFixed(1));

    const newRev: Review = {
      id: 'rev-' + Date.now(),
      restaurantId: ord?.restaurantId || currentRestaurantId,
      branchId: ord?.branchId || currentBranchId,
      orderId,
      customerName: ord?.customerName || 'Happy Customer',
      foodRating,
      serviceRating,
      staffRating,
      overallRating: overall,
      comment,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'published',
    };

    setReviews((prev) => [newRev, ...prev]);

    // Mark order as reviewed
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, isReviewed: true } : o))
    );

    addNotification({
      targetRole: 'manager',
      title: 'New Customer Review',
      message: `${newRev.customerName} rated ${overall} Stars: "${comment.substring(0, 45)}..."`,
      type: 'success',
      orderId,
    });
  };

  // Branch & Table operations
  const toggleBranchStatus = (branchId: string, isOpen: boolean, reason?: string) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === branchId ? { ...b, isOpen, closureReason: reason } : b))
    );

    addAuditLog({
      userName: 'Branch Manager',
      userRole: 'Manager',
      action: isOpen ? 'BRANCH_OPENED' : 'BRANCH_CLOSED',
      entity: 'Branch',
      entityId: branchId,
      newValue: isOpen ? 'Open' : `Closed: ${reason || 'Manual'}`,
      branchId,
    });

    addNotification({
      targetRole: 'all',
      title: isOpen ? 'Branch Opened' : 'Branch Closed',
      message: `Branch status changed to ${isOpen ? 'OPEN' : 'CLOSED'}${reason ? ' (' + reason + ')' : ''}`,
      type: isOpen ? 'success' : 'warning',
    });
  };

  const updateTableStatus = (tableId: string, status: Table['status']) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status } : t))
    );
  };

  const regenerateTableQR = (tableId: string) => {
    const newToken = `DST-QR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, qrCodeToken: newToken } : t))
    );
    addNotification({
      targetRole: 'manager',
      title: 'QR Code Regenerated',
      message: `Security token refreshed for Table. Previous QR invalidated.`,
      type: 'info',
    });
  };

  // Stock operations
  const updateStock = (menuItemId: string, branchId: string, quantity: number) => {
    setInventory((prev) => {
      const idx = prev.findIndex(
        (i) => i.menuItemId === menuItemId && i.branchId === branchId
      );
      if (idx > -1) {
        const next = [...prev];
        const prevQty = next[idx].stockQuantity;
        next[idx] = {
          ...next[idx],
          stockQuantity: quantity,
          isAvailableAtBranch: quantity > 0,
        };

        addAuditLog({
          userName: 'Branch Manager',
          userRole: 'Manager',
          action: 'STOCK_RESTOCKED',
          entity: 'BranchInventory',
          entityId: menuItemId,
          previousValue: prevQty.toString(),
          newValue: quantity.toString(),
          branchId,
        });

        return next;
      } else {
        return [
          ...prev,
          {
            menuItemId,
            branchId,
            stockQuantity: quantity,
            isAvailableAtBranch: quantity > 0,
            lowStockThreshold: 5,
          },
        ];
      }
    });
  };

  const toggleItemBranchAvailability = (menuItemId: string, branchId: string, isAvailable: boolean) => {
    setInventory((prev) => {
      const idx = prev.findIndex(
        (i) => i.menuItemId === menuItemId && i.branchId === branchId
      );
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], isAvailableAtBranch: isAvailable };
        return next;
      }
      return [
        ...prev,
        {
          menuItemId,
          branchId,
          stockQuantity: 10,
          isAvailableAtBranch: isAvailable,
          lowStockThreshold: 5,
        },
      ];
    });

    addAuditLog({
      userName: 'Branch Manager',
      userRole: 'Manager',
      action: isAvailable ? 'ITEM_ENABLED' : 'ITEM_DISABLED',
      entity: 'MenuItem',
      entityId: menuItemId,
      newValue: isAvailable ? 'Available' : 'Unavailable',
      branchId,
    });
  };

  const updateMenuItemPrice = (menuItemId: string, newPrice: number) => {
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === menuItemId) {
          addAuditLog({
            userName: 'Restaurant Owner',
            userRole: 'Owner',
            action: 'PRICE_UPDATE',
            entity: 'MenuItem',
            entityId: menuItemId,
            previousValue: `Rs. ${item.basePrice}`,
            newValue: `Rs. ${newPrice}`,
          });
          return { ...item, basePrice: newPrice };
        }
        return item;
      })
    );
  };

  const createMenuItem = (newItem: Omit<MenuItem, 'id'>) => {
    const id = `item-${Date.now()}`;
    const itemWithId: MenuItem = { ...newItem, id };
    setMenuItems((prev) => [itemWithId, ...prev]);

    // Add to all branches inventory with default 20 stock
    setInventory((prev) => [
      ...prev,
      {
        menuItemId: id,
        branchId: currentBranchId,
        stockQuantity: 20,
        isAvailableAtBranch: true,
        lowStockThreshold: 5,
      },
    ]);

    addAuditLog({
      userName: 'Restaurant Owner',
      userRole: 'Owner',
      action: 'MENU_ITEM_CREATED',
      entity: 'MenuItem',
      entityId: id,
      newValue: `${newItem.name} (Rs. ${newItem.basePrice})`,
    });
  };

  const updateStaffDuty = (staffId: string, newStatus: StaffStatus) => {
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const updated: StaffMember = { ...s, status: newStatus };
          if (newStatus === 'On Duty') {
            updated.clockInTime = nowStr;
          } else if (newStatus === 'Break') {
            updated.breakStartTime = nowStr;
          } else if (newStatus === 'Off Duty') {
            updated.breakStartTime = undefined;
          }
          return updated;
        }
        return s;
      })
    );

    const member = staff.find((s) => s.id === staffId);
    addAuditLog({
      userName: member?.name || 'Staff',
      userRole: member?.role || 'Staff',
      action: 'DUTY_STATUS_CHANGED',
      entity: 'StaffDuty',
      entityId: staffId,
      newValue: newStatus,
      branchId: member?.branchId,
    });
  };

  // Admin Actions
  const approveRestaurant = (restaurantId: string) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === restaurantId ? { ...r, isApproved: true, isSuspended: false } : r))
    );
    addNotification({
      targetRole: 'admin',
      title: 'Restaurant Approved',
      message: 'Restaurant registration approved for platform listing.',
      type: 'success',
    });
  };

  const suspendRestaurant = (restaurantId: string) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === restaurantId ? { ...r, isSuspended: !r.isSuspended } : r))
    );
  };

  const createRestaurant = (data: Partial<Restaurant>) => {
    const newRest: Restaurant = {
      id: `rest-${Date.now()}`,
      name: data.name || 'New Restaurant',
      slug: (data.name || 'new').toLowerCase().replace(/\s+/g, '-'),
      tagline: data.tagline || 'Fine Pakistani Dining',
      cuisine: data.cuisine || ['Pakistani'],
      rating: 5.0,
      reviewCount: 0,
      priceRange: data.priceRange || 'PKR PKR',
      logo: data.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      description: data.description || 'Authentic restaurant added on Dastanay.',
      facilities: data.facilities || ['Dine-in', 'Air Conditioned', 'Card Accepted'],
      isApproved: true,
      isSuspended: false,
      commissionPercent: 5.0,
    };
    setRestaurants((prev) => [...prev, newRest]);
  };

  const createBranch = (data: Partial<Branch>) => {
    const newBranch: Branch = {
      id: `br-${Date.now()}`,
      restaurantId: data.restaurantId || currentRestaurantId,
      name: data.name || 'New Branch',
      city: data.city || 'Karachi',
      area: data.area || 'City Center',
      address: data.address || 'Main Commercial Area',
      phone: data.phone || '+92 21 0000 0000',
      email: data.email || 'branch@dastanay.pk',
      isOpen: true,
      openingHours: data.openingHours || '12:00 PM – 12:00 AM',
      reservationFee: data.reservationFee || 200,
      gracePeriodMinutes: 15,
      cancellationDeadlineHours: 2,
      cancellationFee: 50,
      taxRatePercent: 13,
      serviceChargePercent: 5,
      kitchenPrinters: ['Kitchen-Thermal-1'],
    };
    setBranches((prev) => [...prev, newBranch]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <DastanayContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
        theme,
        setTheme,
        networkStatus,
        setNetworkStatus,
        currentRestaurantId,
        setCurrentRestaurantId,
        currentBranchId,
        setCurrentBranchId,
        currentTableSession,
        setCurrentTableSession,
        restaurants,
        branches,
        tables,
        menuItems,
        inventory,
        staff,
        reservations,
        orders,
        reviews,
        promotions,
        loyalty,
        loyaltyHistory,
        auditLogs,
        notifications,
        cart,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        appliedPromo,
        setAppliedPromo,
        redeemedPoints,
        setRedeemedPoints,
        createReservation,
        cancelReservation,
        checkInReservation,
        startTableSession,
        endTableSession,
        placeOrder,
        updateOrderStatus,
        completeOrderPayment,
        processRefund,
        submitReview,
        toggleBranchStatus,
        updateTableStatus,
        regenerateTableQR,
        updateStock,
        toggleItemBranchAvailability,
        updateMenuItemPrice,
        createMenuItem,
        updateStaffDuty,
        approveRestaurant,
        suspendRestaurant,
        createRestaurant,
        createBranch,
        printModalData,
        setPrintModalData,
        markNotificationRead,
        clearNotifications,
      }}
    >
      {children}
    </DastanayContext.Provider>
  );
};

export const useDastanay = () => {
  const context = useContext(DastanayContext);
  if (!context) {
    throw new Error('useDastanay must be used within a DastanayProvider');
  }
  return context;
};
