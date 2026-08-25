import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  isLoading: boolean;
  refreshData: () => Promise<void>;

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
  createReservation: (resData: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => Promise<{ success: boolean; message: string; reservation?: Reservation }> | { success: boolean; message: string; reservation?: Reservation };
  cancelReservation: (reservationId: string, reason?: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  checkInReservation: (reservationId: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  startTableSession: (tableNumber: string, reservationId?: string) => { success: boolean; message: string; table?: Table };
  endTableSession: (tableId: string) => void;
  placeOrder: (paymentMethod: PaymentMethod, customerPhone?: string, customerName?: string) => Promise<{ success: boolean; message: string; order?: Order }> | { success: boolean; message: string; order?: Order };
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Selected Scope
  const [currentRestaurantId, setCurrentRestaurantId] = useState<string>('rest-kolachi');
  const [currentBranchId, setCurrentBranchId] = useState<string>('br-kolachi-dha');
  const [currentTableSession, setCurrentTableSession] = useState<{ tableId: string; tableNumber: string; sessionId: string } | null>(null);

  // Core Data loaded from SQLite API
  const [restaurants, setRestaurants] = useState<Restaurant[]>(INITIAL_RESTAURANTS);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [inventory, setInventory] = useState<BranchInventoryItem[]>(INITIAL_INVENTORY);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [promotions, setPromotions] = useState<Promotion[]>(INITIAL_PROMOTIONS);
  const [loyalty, setLoyalty] = useState<LoyaltyAccount>(INITIAL_LOYALTY);
  const [loyaltyHistory, setLoyaltyHistory] = useState<LoyaltyTransaction[]>([
    {
      id: 'ltx-1',
      customerId: 'cust-current-user',
      type: 'earn',
      points: 398,
      orderId: 'DST-ORD-9101',
      description: 'Points earned on Kolachi DHA order',
      timestamp: '2026-08-14 07:45 PM',
    },
  ]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      targetRole: 'all',
      title: 'Welcome to Dastanay',
      message: 'Pakistan’s premier restaurant ecosystem with live table booking & kitchen KDS.',
      type: 'info',
      timestamp: 'Just now',
      read: false,
    },
  ]);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dst_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [redeemedPoints, setRedeemedPoints] = useState<number>(0);

  // Printing state
  const [printModalData, setPrintModalData] = useState<{ type: 'kot' | 'receipt' | 'bar'; order: Order } | null>(null);

  // Fetch all initial data from SQLite backend API
  const refreshData = useCallback(async () => {
    try {
      const [restRes, branchRes, tableRes, menuRes, invRes, staffRes, bookRes, ordRes, revRes, promoRes, auditRes] =
        await Promise.all([
          fetch('/api/restaurants').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/branches').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/tables').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/menu').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/inventory').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/staff').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/bookings').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/orders').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/reviews').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/promotions').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/audit-logs').then((r) => (r.ok ? r.json() : null)),
        ]);

      if (restRes) setRestaurants(restRes);
      if (branchRes) setBranches(branchRes);
      if (tableRes) setTables(tableRes);
      if (menuRes) setMenuItems(menuRes);
      if (invRes) setInventory(invRes);
      if (staffRes) setStaff(staffRes);
      if (bookRes) setReservations(bookRes);
      if (ordRes) setOrders(ordRes);
      if (revRes) setReviews(revRes);
      if (promoRes) setPromotions(promoRes);
      if (auditRes) setAuditLogs(auditRes);

      setIsLoading(false);
    } catch (err) {
      console.warn('Backend sync failed, using fallback data:', err);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    // Background polling every 8s for live multi-user / KDS updates
    const interval = setInterval(refreshData, 8000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Cart local persistence
  useEffect(() => {
    try {
      localStorage.setItem('dst_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Handle Theme class on body
  useEffect(() => {
    localStorage.setItem('dst_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Cart Handlers
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) =>
          i.menuItemId === item.menuItemId &&
          (i.selectedVariation?.id || null) === (item.selectedVariation?.id || null) &&
          JSON.stringify((i.selectedAddons || []).map((a) => (typeof a === 'object' && a ? a.id : a)).sort()) ===
            JSON.stringify((item.selectedAddons || []).map((a) => (typeof a === 'object' && a ? a.id : a)).sort()) &&
          (i.specialInstructions || '') === (item.specialInstructions || '')
      );

      if (existing) {
        return prev.map((i) =>
          i.cartItemId === existing.cartItemId
            ? {
                ...i,
                quantity: i.quantity + item.quantity,
                itemTotal: (i.itemTotal / i.quantity) * (i.quantity + item.quantity),
              }
            : i
        );
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
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const unitPrice = item.itemTotal / item.quantity;
            return {
              ...item,
              quantity: newQty,
              itemTotal: unitPrice * newQty,
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

  // ----------------------------------------------------
  // REAL-TIME TABLE RESERVATIONS
  // ----------------------------------------------------
  const createReservation = async (resData: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.error || data.message || 'Table reservation failed. Please try again.',
        };
      }

      const createdRes: Reservation = data.reservation;

      // Optimistically update local state
      setReservations((prev) => [createdRes, ...prev]);
      setTables((prev) =>
        prev.map((t) =>
          t.id === createdRes.tableId
            ? { ...t, status: 'reserved', guestName: createdRes.customerName, guestPhone: createdRes.customerPhone }
            : t
        )
      );

      // Trigger user notification
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        targetRole: 'customer',
        title: 'Table Reserved Successfully',
        message: `Your table ${createdRes.tableNumber} is reserved for ${createdRes.time} on ${createdRes.date}. (ID: ${createdRes.id})`,
        type: 'success',
        timestamp: 'Just now',
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      return {
        success: true,
        message: 'Table reservation confirmed successfully in database!',
        reservation: createdRes,
      };
    } catch (err: any) {
      console.error('Reservation error:', err);
      // Fallback local creation if offline
      const id = `DST-RES-${Math.floor(100000 + Math.random() * 900000)}`;
      const fallbackRes: Reservation = {
        ...resData,
        id,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };
      setReservations((prev) => [fallbackRes, ...prev]);
      return {
        success: true,
        message: 'Table reservation recorded successfully.',
        reservation: fallbackRes,
      };
    }
  };

  const cancelReservation = async (reservationId: string, reason?: string) => {
    try {
      const response = await fetch(`/api/bookings/${reservationId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await response.json();

      setReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, status: 'cancelled', cancellationReason: reason } : r))
      );

      const targetRes = reservations.find((r) => r.id === reservationId);
      if (targetRes) {
        setTables((prev) =>
          prev.map((t) =>
            t.id === targetRes.tableId ? { ...t, status: 'available', guestName: undefined, guestPhone: undefined } : t
          )
        );
      }

      return { success: true, message: 'Reservation cancelled and table freed.' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const checkInReservation = async (reservationId: string) => {
    try {
      const response = await fetch(`/api/bookings/${reservationId}/checkin`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success && data.reservation) {
        setReservations((prev) =>
          prev.map((r) => (r.id === reservationId ? { ...r, status: 'checked_in' } : r))
        );
        if (data.table) {
          setTables((prev) => prev.map((t) => (t.id === data.table.id ? data.table : t)));
        }
        if (data.sessionId) {
          setCurrentTableSession({
            tableId: data.reservation.tableId,
            tableNumber: data.reservation.tableNumber,
            sessionId: data.sessionId,
          });
        }
        return { success: true, message: 'Guest checked in. Table session activated.' };
      }
      return { success: false, message: 'Check-in failed.' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const startTableSession = (tableNumber: string, reservationId?: string) => {
    const table = tables.find((t) => t.tableNumber.toLowerCase() === tableNumber.toLowerCase());
    if (!table) {
      return { success: false, message: `Table ${tableNumber} does not exist at this branch.` };
    }

    const sessionId = `sess-${Date.now()}`;
    setCurrentTableSession({
      tableId: table.id,
      tableNumber: table.tableNumber,
      sessionId,
    });

    updateTableStatus(table.id, 'occupied');

    if (reservationId) {
      checkInReservation(reservationId);
    }

    return { success: true, message: `Table ${table.tableNumber} session active!`, table };
  };

  const endTableSession = (tableId: string) => {
    setCurrentTableSession(null);
    updateTableStatus(tableId, 'dirty');
  };

  // ----------------------------------------------------
  // REAL-TIME ORDERS & CHECKOUT
  // ----------------------------------------------------
  const placeOrder = async (paymentMethod: PaymentMethod, customerPhone?: string, customerName?: string) => {
    if (cart.length === 0) {
      return { success: false, message: 'Your cart is empty.' };
    }

    try {
      const payload = {
        restaurantId: currentRestaurantId,
        branchId: currentBranchId,
        tableId: currentTableSession?.tableId,
        tableNumber: currentTableSession?.tableNumber,
        customerName: customerName || 'Hamza Ali',
        customerPhone: customerPhone || '+92 300 8291029',
        items: cart,
        paymentMethod,
        appliedPromoCode: appliedPromo?.code,
        redeemedPoints,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.error || data.message || 'Order submission failed.',
        };
      }

      const createdOrder: Order = data.order;
      setOrders((prev) => [createdOrder, ...prev]);

      // Trigger notifications
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        targetRole: 'kitchen',
        title: `New Order: ${createdOrder.id}`,
        message: `Order received for Table ${createdOrder.tableNumber || 'Takeaway'} (${createdOrder.items.length} items)`,
        type: 'order',
        timestamp: 'Just now',
        read: false,
      };
      setNotifications((prev) => [notif, ...prev]);

      // Clear cart
      clearCart();

      return {
        success: true,
        message: 'Order placed and sent to the kitchen KDS!',
        order: createdOrder,
      };
    } catch (err: any) {
      console.error('Order error:', err);
      // Fallback
      return { success: false, message: err.message || 'Failed to place order.' };
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: Order['status'],
    delayMinutes?: number,
    delayReason?: string
  ) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, delayMinutes, delayReason }),
      });
      const data = await response.json();

      if (response.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data : o)));
      }
    } catch (err) {
      console.error('Update status error:', err);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    }
  };

  const completeOrderPayment = async (orderId: string, method: PaymentMethod, staffName?: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: method, paymentStatus: 'paid' }),
      });
      const data = await response.json();

      if (response.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data : o)));
      }
    } catch (err) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: 'paid', paymentMethod: method } : o))
      );
    }
  };

  const processRefund = async (orderId: string, refundAmount: number, reason: string, staffName: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refundReason: reason, managerName: staffName }),
      });
      const data = await response.json();

      if (response.ok && data.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      }
    } catch (err) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: 'cancelled', paymentStatus: 'refunded', refundReason: reason } : o
        )
      );
    }
  };

  // ----------------------------------------------------
  // REVIEWS & REPUTATION
  // ----------------------------------------------------
  const submitReview = async (
    orderId: string,
    foodRating: number,
    serviceRating: number,
    staffRating: number,
    comment: string
  ) => {
    try {
      const ord = orders.find((o) => o.id === orderId);
      const overall = Number(((foodRating + serviceRating + staffRating) / 3).toFixed(1));

      const payload = {
        restaurantId: ord?.restaurantId || currentRestaurantId,
        branchId: ord?.branchId || currentBranchId,
        orderId,
        customerName: ord?.customerName || 'Hamza Ali',
        foodRating,
        serviceRating,
        staffRating,
        overallRating: overall,
        comment,
      };

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setReviews((prev) => [data, ...prev]);
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, isReviewed: true } : o)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // MANAGER & STAFF ACTIONS
  // ----------------------------------------------------
  const toggleBranchStatus = async (branchId: string, isOpen: boolean, reason?: string) => {
    try {
      const response = await fetch(`/api/branches/${branchId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen, closureReason: reason }),
      });
      const data = await response.json();
      if (response.ok) {
        setBranches((prev) => prev.map((b) => (b.id === branchId ? data : b)));
      }
    } catch (err) {
      setBranches((prev) =>
        prev.map((b) => (b.id === branchId ? { ...b, isOpen, closureReason: reason } : b))
      );
    }
  };

  const updateTableStatus = async (tableId: string, status: Table['status']) => {
    try {
      const response = await fetch(`/api/tables/${tableId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (response.ok) {
        setTables((prev) => prev.map((t) => (t.id === tableId ? data : t)));
      }
    } catch (err) {
      setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, status } : t)));
    }
  };

  const regenerateTableQR = async (tableId: string) => {
    try {
      const response = await fetch(`/api/tables/${tableId}/regenerate-qr`, {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        setTables((prev) => prev.map((t) => (t.id === tableId ? data : t)));
      }
    } catch (err) {
      const newToken = `DST-QR-${Date.now()}`;
      setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, activeQrToken: newToken } : t)));
    }
  };

  const updateStock = async (menuItemId: string, branchId: string, quantity: number) => {
    const inv = inventory.find((i) => i.menuItemId === menuItemId && i.branchId === branchId);
    if (!inv) return;

    try {
      const response = await fetch(`/api/inventory/${inv.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: quantity, isSoldOut: quantity <= 0 }),
      });
      const data = await response.json();
      if (response.ok) {
        setInventory((prev) => prev.map((i) => (i.id === inv.id ? data : i)));
      }
    } catch (err) {
      setInventory((prev) =>
        prev.map((i) => (i.id === inv.id ? { ...i, stockQuantity: quantity, isSoldOut: quantity <= 0 } : i))
      );
    }
  };

  const toggleItemBranchAvailability = async (menuItemId: string, branchId: string, isAvailable: boolean) => {
    const inv = inventory.find((i) => i.menuItemId === menuItemId && i.branchId === branchId);
    if (!inv) return;

    try {
      const response = await fetch(`/api/inventory/${inv.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailableInBranch: isAvailable }),
      });
      const data = await response.json();
      if (response.ok) {
        setInventory((prev) => prev.map((i) => (i.id === inv.id ? data : i)));
      }
    } catch (err) {
      setInventory((prev) =>
        prev.map((i) => (i.id === inv.id ? { ...i, isAvailableInBranch: isAvailable } : i))
      );
    }
  };

  const updateMenuItemPrice = async (menuItemId: string, newPrice: number) => {
    try {
      const response = await fetch(`/api/menu/${menuItemId}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newPrice }),
      });
      const data = await response.json();
      if (response.ok) {
        setMenuItems((prev) => prev.map((m) => (m.id === menuItemId ? data : m)));
      }
    } catch (err) {
      setMenuItems((prev) => prev.map((m) => (m.id === menuItemId ? { ...m, basePrice: newPrice } : m)));
    }
  };

  const createMenuItem = async (newItem: Omit<MenuItem, 'id'>) => {
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const data = await response.json();
      if (response.ok) {
        setMenuItems((prev) => [...prev, data]);
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStaffDuty = async (staffId: string, status: StaffStatus) => {
    try {
      const response = await fetch(`/api/staff/${staffId}/duty`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (response.ok) {
        setStaff((prev) => prev.map((s) => (s.id === staffId ? data : s)));
      }
    } catch (err) {
      setStaff((prev) => prev.map((s) => (s.id === staffId ? { ...s, status } : s)));
    }
  };

  // ----------------------------------------------------
  // ADMIN ACTIONS
  // ----------------------------------------------------
  const approveRestaurant = (restaurantId: string) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === restaurantId ? { ...r, isApproved: true, isSuspended: false } : r))
    );
  };

  const suspendRestaurant = (restaurantId: string) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === restaurantId ? { ...r, isSuspended: true } : r))
    );
  };

  const createRestaurant = async (data: Partial<Restaurant>) => {
    try {
      const response = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const created = await response.json();
      if (response.ok) {
        setRestaurants((prev) => [...prev, created]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createBranch = (data: Partial<Branch>) => {
    const id = `br-${Date.now()}`;
    const newBr: Branch = {
      id,
      restaurantId: data.restaurantId || currentRestaurantId,
      name: data.name || 'New Branch',
      city: data.city || 'Karachi',
      area: data.area || 'Gulshan-e-Iqbal',
      address: data.address || 'Main University Road, Karachi',
      phone: data.phone || '+92 21 3499 0000',
      email: data.email || 'info@dastanay.pk',
      isOpen: true,
      openingHours: '12:00 PM – 12:00 AM (Mon-Sun)',
      reservationFee: 300,
      gracePeriodMinutes: 15,
      cancellationDeadlineHours: 2,
      cancellationFee: 100,
      taxRatePercent: 13,
      serviceChargePercent: 5,
      kitchenPrinters: ['KDS-Kitchen-1', 'Receipt-Cashier-1'],
    };
    setBranches((prev) => [...prev, newBr]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
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
        isLoading,
        refreshData,
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
