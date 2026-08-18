import React, { useState } from 'react';
import { useDastanay } from '../../context/DastanayContext';
import { dictionary } from '../../utils/translations';
import {
  TableStatus,
  StaffStatus,
  PaymentMethod,
  MenuItem,
  Branch,
  Table,
} from '../../types';
import {
  LayoutDashboard,
  CalendarCheck,
  UtensilsCrossed,
  Layers,
  Users,
  BarChart3,
  Receipt,
  FileText,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Plus,
  QrCode,
  Printer,
  Sparkles,
  Power,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  DollarSign,
} from 'lucide-react';

export const ManagerPortal: React.FC = () => {
  const {
    branches,
    currentBranchId,
    setCurrentBranchId,
    restaurants,
    currentRestaurantId,
    tables,
    updateTableStatus,
    regenerateTableQR,
    reservations,
    cancelReservation,
    orders,
    completeOrderPayment,
    processRefund,
    menuItems,
    inventory,
    updateStock,
    toggleItemBranchAvailability,
    createMenuItem,
    updateMenuItemPrice,
    staff,
    updateStaffDuty,
    toggleBranchStatus,
    auditLogs,
    reviews,
    setPrintModalData,
    language,
  } = useDastanay();
  const t = dictionary[language];

  const [activeTab, setActiveTab] = useState<
    'overview' | 'tables' | 'reservations' | 'orders' | 'inventory' | 'staff' | 'reports' | 'reviews' | 'audit'
  >('overview');

  const currentBranch = branches.find((b) => b.id === currentBranchId) || branches[0];
  const currentRestaurant = restaurants.find((r) => r.id === currentBranch.restaurantId) || restaurants[0];

  // Modals / forms state
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showCloseBranchModal, setShowCloseBranchModal] = useState(false);
  const [closureReason, setClosureReason] = useState('Kitchen Maintenance & Prep');
  const [showRefundModal, setShowRefundModal] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [newPriceModal, setNewPriceModal] = useState<{ id: string; name: string; price: number } | null>(null);

  // New Menu Item Form
  const [newItemName, setNewItemName] = useState('');
  const [newItemNameUrdu, setNewItemNameUrdu] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Pakistani BBQ & Grills');
  const [newItemPrice, setNewItemPrice] = useState(1200);
  const [newItemPrepTime, setNewItemPrepTime] = useState(15);
  const [newItemDesc, setNewItemDesc] = useState('');

  // Orders search
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Metrics calculation
  const branchOrders = orders.filter((o) => o.branchId === currentBranch.id);
  const todaySales = branchOrders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const activeTablesCount = tables.filter((t) => t.status === 'occupied').length;
  const availableTablesCount = tables.filter((t) => t.status === 'available').length;
  const kitchenPreparingCount = branchOrders.filter((o) => o.status === 'preparing' || o.status === 'received').length;
  const staffOnDutyCount = staff.filter((s) => s.status === 'On Duty' && s.branchId === currentBranch.id).length;

  const lowStockItems = inventory.filter(
    (inv) => inv.branchId === currentBranch.id && inv.stockQuantity <= inv.lowStockThreshold
  );

  const handleCreateMenuItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMenuItem({
      restaurantId: currentRestaurant.id,
      category: newItemCategory,
      name: newItemName,
      nameUrdu: newItemNameUrdu || newItemName,
      description: newItemDesc || 'Prepared fresh upon order with authentic seasonings.',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      basePrice: Number(newItemPrice),
      prepTimeMinutes: Number(newItemPrepTime),
      isAvailableGlobal: true,
      lowStockThreshold: 5,
    });
    setShowAddMenuModal(false);
    setNewItemName('');
    setNewItemNameUrdu('');
  };

  const handleProcessRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRefundModal) return;
    const ord = orders.find((o) => o.id === showRefundModal);
    if (ord) {
      processRefund(ord.id, ord.total, refundReason || 'Guest requested cancellation', 'Muhammad Tariq (Manager)');
      setShowRefundModal(null);
      setRefundReason('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* Branch Header Bento Banner */}
      <div className="bento-card p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {currentRestaurant.name}
              </h2>
              <span className="bento-pill">{currentBranch.name}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Working Hours: {currentBranch.openingHours} • Tax Rate: {currentBranch.taxRatePercent}%
            </p>
          </div>
        </div>

        {/* Branch Open/Close Toggle Control */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                currentBranch.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            ></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              {currentBranch.isOpen ? 'Branch OPEN' : 'Branch CLOSED'}
            </span>
          </div>

          <button
            onClick={() => {
              if (currentBranch.isOpen) {
                setShowCloseBranchModal(true);
              } else {
                toggleBranchStatus(currentBranch.id, true);
              }
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
              currentBranch.isOpen
                ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-2 border-rose-200 dark:border-rose-800'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{currentBranch.isOpen ? 'Close Branch' : 'Open Branch'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs in Bento Style */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-bold">
        {[
          { id: 'overview', label: 'Live Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'tables', label: 'Tables & QR', icon: <Layers className="w-4 h-4" /> },
          { id: 'reservations', label: 'Reservations', icon: <CalendarCheck className="w-4 h-4" /> },
          { id: 'orders', label: 'Orders & Billing', icon: <Receipt className="w-4 h-4" /> },
          { id: 'inventory', label: 'Menu & Stock', icon: <UtensilsCrossed className="w-4 h-4" /> },
          { id: 'staff', label: 'Staff & Duty', icon: <Users className="w-4 h-4" /> },
          { id: 'reports', label: 'Analytics & Sales', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'reviews', label: 'Reviews', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'audit', label: 'Audit Trail', icon: <FileText className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Metrics Cards in Bento Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bento-card p-4">
              <span className="text-[11px] text-slate-500 font-medium block">Today's Sales</span>
              <span className="font-mono text-xl font-black text-slate-900 dark:text-slate-100 mt-1 block">
                Rs. {todaySales.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">{branchOrders.length} orders total</span>
            </div>

            <div className="bento-card p-4">
              <span className="text-[11px] text-slate-500 font-medium block">Active Tables</span>
              <span className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {activeTablesCount} / {tables.length}
              </span>
              <span className="text-[10px] text-slate-500">{availableTablesCount} available</span>
            </div>

            <div className="bento-card p-4">
              <span className="text-[11px] text-slate-500 font-medium block">Kitchen Active</span>
              <span className="font-mono text-xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                {kitchenPreparingCount}
              </span>
              <span className="text-[10px] text-slate-500">tickets in prep queue</span>
            </div>

            <div className="bento-card p-4">
              <span className="text-[11px] text-slate-500 font-medium block">Low Stock Alerts</span>
              <span className={`font-mono text-xl font-black mt-1 block ${
                lowStockItems.length > 0 ? 'text-rose-600' : 'text-slate-900 dark:text-slate-100'
              }`}>
                {lowStockItems.length}
              </span>
              <span className="text-[10px] text-slate-500">items below threshold</span>
            </div>

            <div className="bento-card p-4">
              <span className="text-[11px] text-slate-500 font-medium block">Staff On Duty</span>
              <span className="font-mono text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
                {staffOnDutyCount}
              </span>
              <span className="text-[10px] text-slate-500">rostered today</span>
            </div>

            <div className="bento-card p-4">
              <span className="text-[11px] text-slate-500 font-medium block">Avg Rating</span>
              <span className="font-mono text-xl font-black text-amber-500 mt-1 block">
                ★ 4.8
              </span>
              <span className="text-[10px] text-slate-500">{reviews.length} total reviews</span>
            </div>
          </div>

          {/* Quick Tables & Urgent Stock Overview in Bento Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Table Map */}
            <div className="bento-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Live Branch Floor Plan</h3>
                <span className="text-xs text-slate-500">{tables.length} tables managed</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {tables.map((t) => (
                  <div
                    key={t.id}
                    className={`p-3 rounded-2xl border-2 text-xs space-y-1.5 shadow-2xs ${
                      t.status === 'occupied'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                        : t.status === 'reserved'
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800'
                        : t.status === 'cleaning'
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800'
                        : t.status === 'out_of_service'
                        ? 'bg-slate-100 dark:bg-slate-800 opacity-50 border-slate-300'
                        : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                    }`}
                  >
                    <div className="flex justify-between font-extrabold">
                      <span>{t.tableNumber}</span>
                      <span className="text-[10px] uppercase">{t.status}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{t.section}</p>

                    {/* Quick status dropdown */}
                    <select
                      value={t.status}
                      onChange={(e) => updateTableStatus(t.id, e.target.value as TableStatus)}
                      className="w-full bg-white dark:bg-slate-800 text-[10px] font-bold p-1 rounded-xl border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="reserved">Reserved</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="out_of_service">Out of Service</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock Items Action Bento Card */}
            <div className="bento-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Low Stock & Inventory Warnings
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                >
                  Manage All Stock
                </button>
              </div>

              {lowStockItems.length === 0 ? (
                <div className="text-center py-10 text-xs text-zinc-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  All branch inventory items are well-stocked above thresholds.
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs space-y-2">
                  {lowStockItems.map((inv) => {
                    const item = menuItems.find((m) => m.id === inv.menuItemId);
                    return (
                      <div key={inv.menuItemId} className="pt-2 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                            {item?.name}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            Threshold: {inv.lowStockThreshold} units
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-extrabold text-sm text-rose-600">
                            {inv.stockQuantity} remaining
                          </span>
                          <button
                            onClick={() => updateStock(inv.menuItemId, currentBranch.id, inv.stockQuantity + 20)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                          >
                            +20 Restock
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. TABLES & QR CODES */}
      {activeTab === 'tables' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Table Management & Unique QR Codes
                </h3>
                <p className="text-xs text-zinc-500">
                  Manage seating capacity, floor sections, and security QR tokens for contactless ordering.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-700 text-xs space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 block">
                        {table.tableNumber}
                      </span>
                      <span className="text-zinc-500">{table.section} • {table.capacity} Seats</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        table.status === 'available'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : table.status === 'occupied'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {table.status}
                    </span>
                  </div>

                  {/* QR Security Token display */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-6 h-6 text-emerald-600" />
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-mono">Token:</span>
                        <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                          {table.qrCodeToken}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => regenerateTableQR(table.id)}
                      className="text-[10px] font-bold text-amber-600 hover:underline cursor-pointer flex items-center gap-1"
                      title="Regenerate/Revoke QR Code"
                    >
                      <RotateCcw className="w-3 h-3" /> Revoke
                    </button>
                  </div>

                  {/* Status buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <select
                      value={table.status}
                      onChange={(e) => updateTableStatus(table.id, e.target.value as TableStatus)}
                      className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold outline-none cursor-pointer"
                    >
                      <option value="available">Set: Available</option>
                      <option value="occupied">Set: Occupied</option>
                      <option value="reserved">Set: Reserved</option>
                      <option value="cleaning">Set: Cleaning</option>
                      <option value="out_of_service">Set: Out of Service</option>
                    </select>

                    <button
                      onClick={() => alert(`Printing official QR Sticker for ${table.tableNumber}...`)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-emerald-600 text-white dark:text-zinc-900 hover:text-white font-bold text-[11px] cursor-pointer"
                    >
                      Print QR Sticker
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. RESERVATIONS MANAGER */}
      {activeTab === 'reservations' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Booked Reservations & Arrivals
              </h3>
              <p className="text-xs text-zinc-500">
                Manage confirmed table bookings, customer check-ins, and grace period cancellations.
              </p>
            </div>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            {reservations.map((res) => (
              <div key={res.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      {res.id}
                    </span>
                    <span className="font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                      {res.tableNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        res.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : res.status === 'checked_in'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>

                  <p className="text-zinc-800 dark:text-zinc-200 font-semibold">
                    {res.customerName} ({res.customerPhone}) • {res.guests} Guests
                  </p>
                  <p className="text-zinc-500 text-[11px]">
                    Date: {res.date} at {res.time} • Prepaid Fee: Rs. {res.bookingFee} ({res.paymentStatus})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {res.status === 'confirmed' && (
                    <button
                      onClick={() => cancelReservation(res.id, 'No-show after 15 min grace period')}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-[11px] font-bold border border-rose-200 dark:border-rose-800 cursor-pointer"
                    >
                      Mark No-Show / Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ORDERS & BILLING */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Branch Orders & Cashier Billing
              </h3>
              <p className="text-xs text-zinc-500">
                Track payments, print tax invoices, and process authorized guest refunds.
              </p>
            </div>

            <input
              type="text"
              placeholder="Search by Order ID or Table..."
              value={orderSearchQuery}
              onChange={(e) => setOrderSearchQuery(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
            />
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            {orders
              .filter(
                (o) =>
                  o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                  o.tableNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                  o.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase())
              )
              .map((order) => (
                <div key={order.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm">{order.id}</span>
                      <span className="font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800">
                        {order.tableNumber}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-emerald-600">
                        {order.status}
                      </span>
                      <span className="text-[10px] text-zinc-400">({order.createdAt})</span>
                    </div>

                    <div className="text-zinc-600 dark:text-zinc-400">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(' • ')}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-0.5">
                      <span>Total: <strong className="text-zinc-900 dark:text-zinc-100">Rs. {order.total.toFixed(0)}</strong></span>
                      <span>Payment: <strong>{order.paymentMethod.toUpperCase()}</strong> ({order.paymentStatus})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {order.paymentStatus === 'pending' && (
                      <button
                        onClick={() => completeOrderPayment(order.id, 'cash')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                      >
                        Confirm Cash Received
                      </button>
                    )}

                    <button
                      onClick={() => setPrintModalData({ type: 'receipt', order })}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-[11px] cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Bill</span>
                    </button>

                    {order.paymentStatus === 'paid' && (
                      <button
                        onClick={() => setShowRefundModal(order.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-[11px] font-bold border border-rose-200 dark:border-rose-800 cursor-pointer"
                      >
                        Issue Refund
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 5. MENU & INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Menu Management & Branch Stock Levels
              </h3>
              <p className="text-xs text-zinc-500">
                Adjust branch inventory, enable/disable items, and create new central menu dishes.
              </p>
            </div>

            <button
              onClick={() => setShowAddMenuModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Menu Item</span>
            </button>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            {menuItems
              .filter((m) => m.restaurantId === currentRestaurant.id)
              .map((item) => {
                const inv = inventory.find(
                  (i) => i.menuItemId === item.id && i.branchId === currentBranch.id
                );
                const stock = inv ? inv.stockQuantity : 0;
                const isAvail = inv ? inv.isAvailableAtBranch : true;

                return (
                  <div key={item.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {item.name}
                        </span>
                        <span className="text-[11px] font-medium text-emerald-600 font-serif">
                          {item.nameUrdu}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-zinc-500">
                        <span>Price: <strong className="text-zinc-900 dark:text-zinc-100">Rs. {item.basePrice}</strong></span>
                        <span>Prep Time: <strong>{item.prepTimeMinutes} mins</strong></span>
                        <button
                          onClick={() => setNewPriceModal({ id: item.id, name: item.name, price: item.basePrice })}
                          className="text-emerald-600 hover:underline font-bold text-[10px] cursor-pointer"
                        >
                          Change Price
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Stock Adjuster */}
                      <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl">
                        <span className="text-zinc-500">Stock:</span>
                        <span className="font-mono font-bold text-sm w-8 text-center">{stock}</span>
                        <button
                          onClick={() => updateStock(item.id, currentBranch.id, stock + 10)}
                          className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] cursor-pointer"
                        >
                          +10
                        </button>
                      </div>

                      {/* Availability Toggle */}
                      <button
                        onClick={() => toggleItemBranchAvailability(item.id, currentBranch.id, !isAvail)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                          isAvail
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {isAvail ? 'Available' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 6. STAFF & DUTY ATTENDANCE */}
      {activeTab === 'staff' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Staff Roster & Duty Attendance System
              </h3>
              <p className="text-xs text-zinc-500">
                Track staff clock-in / clock-out times, breaks, weekly hours, and shift statuses.
              </p>
            </div>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            {staff
              .filter((s) => s.branchId === currentBranch.id)
              .map((member) => (
                <div key={member.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {member.name}
                      </span>
                      <span className="font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {member.role}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          member.status === 'On Duty'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : member.status === 'Break'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {member.status}
                      </span>
                    </div>

                    <p className="text-zinc-500 text-[11px]">
                      Clocked In: {member.clockInTime || 'Not clocked in'} • Week: {member.totalHoursThisWeek} hrs • Month: {member.totalHoursThisMonth} hrs
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {member.status === 'Off Duty' ? (
                      <button
                        onClick={() => updateStaffDuty(member.id, 'On Duty')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                      >
                        Start Duty (Clock In)
                      </button>
                    ) : member.status === 'On Duty' ? (
                      <>
                        <button
                          onClick={() => updateStaffDuty(member.id, 'Break')}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer"
                        >
                          Start Break
                        </button>
                        <button
                          onClick={() => updateStaffDuty(member.id, 'Off Duty')}
                          className="px-3 py-1.5 rounded-xl bg-zinc-700 hover:bg-zinc-800 text-white font-bold cursor-pointer"
                        >
                          End Duty (Clock Out)
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => updateStaffDuty(member.id, 'On Duty')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                      >
                        End Break (Resume Duty)
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 7. ANALYTICS & REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Revenue Breakdown</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Gross Sales Today:</span>
                  <span className="font-mono font-bold">Rs. {todaySales.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Sindh/Punjab GST Collected:</span>
                  <span className="font-mono font-bold">Rs. {(todaySales * 0.13).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Service Charges:</span>
                  <span className="font-mono font-bold">Rs. {(todaySales * 0.05).toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-extrabold pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span>Net Platform Volume:</span>
                  <span className="font-mono text-emerald-600">Rs. {todaySales.toFixed(0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Payment Methods Split</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>JazzCash / Easypaisa:</span>
                  <span className="font-bold">45%</span>
                </div>
                <div className="flex justify-between">
                  <span>Debit/Credit Card:</span>
                  <span className="font-bold">35%</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash to Staff:</span>
                  <span className="font-bold">20%</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Top Performing Dishes</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Mutton Peshawari Karahi:</span>
                  <span className="font-bold text-emerald-600">42 orders</span>
                </div>
                <div className="flex justify-between">
                  <span>Special Reshmi Seekh Kabab:</span>
                  <span className="font-bold text-emerald-600">38 orders</span>
                </div>
                <div className="flex justify-between">
                  <span>Special Roghani Naan:</span>
                  <span className="font-bold text-emerald-600">95 orders</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Customer Ratings & Feedback
            </h3>
            <span className="text-xs text-zinc-500">{reviews.length} reviews</span>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="pt-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{rev.customerName}</span>
                  <span className="font-mono text-amber-500 font-extrabold">★ {rev.overallRating} / 5</span>
                </div>
                <div className="flex gap-4 text-[11px] text-zinc-500">
                  <span>Food: {rev.foodRating}★</span>
                  <span>Service: {rev.serviceRating}★</span>
                  <span>Staff: {rev.staffRating}★</span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 italic">"{rev.comment}"</p>
                {rev.response && (
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-[11px] text-emerald-700 dark:text-emerald-400">
                    <strong>Manager Response:</strong> {rev.response}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                System Audit & Security Logs
              </h3>
              <p className="text-xs text-zinc-500">
                Immutable records of price updates, stock changes, cancellations, and staff actions.
              </p>
            </div>
            <span className="text-xs text-zinc-500 font-mono">{auditLogs.length} events</span>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs font-mono">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 font-sans">
                    [{log.action}] {log.userName} ({log.userRole})
                  </span>
                  <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                    {log.entity} #{log.entityId} • {log.newValue}
                  </p>
                </div>
                <span className="text-[10px] text-zinc-400">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Menu Item Modal */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs">
            <h3 className="font-bold text-base">Create New Central Menu Dish</h3>
            <form onSubmit={handleCreateMenuItemSubmit} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Dish Name (English)</label>
                <input
                  type="text"
                  placeholder="e.g. Mutton Shinwari Karahi"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Urdu Name</label>
                <input
                  type="text"
                  placeholder="مٹن شنواری کڑاہی"
                  value={newItemNameUrdu}
                  onChange={(e) => setNewItemNameUrdu(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-serif"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Base Price (PKR)</label>
                  <input
                    type="number"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Prep Time (Mins)</label>
                  <input
                    type="number"
                    value={newItemPrepTime}
                    onChange={(e) => setNewItemPrepTime(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMenuModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-500 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Branch Modal */}
      {showCloseBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs">
            <h3 className="font-bold text-base text-rose-600">Temporary Branch Closure</h3>
            <p className="text-zinc-500">
              Closing the branch disables new reservations and new customer orders while existing active orders finish cooking.
            </p>

            <div>
              <label className="font-bold block mb-1">Closure Reason</label>
              <select
                value={closureReason}
                onChange={(e) => setClosureReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
              >
                <option value="Kitchen Prep & Rush Overload">Kitchen Prep & Rush Overload</option>
                <option value="Emergency Generator Maintenance">Emergency Generator Maintenance</option>
                <option value="Private VIP Hall Event">Private VIP Hall Event</option>
                <option value="Staff Shortage">Staff Shortage</option>
                <option value="Standard Scheduled Closing">Standard Scheduled Closing</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCloseBranchModal(false)}
                className="px-4 py-2 rounded-xl text-zinc-500 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toggleBranchStatus(currentBranch.id, false, closureReason);
                  setShowCloseBranchModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
              >
                Confirm Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs">
            <h3 className="font-bold text-base text-rose-600">Authorize Guest Refund</h3>
            <form onSubmit={handleProcessRefundSubmit} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Reason for Refund</label>
                <input
                  type="text"
                  placeholder="e.g. Accidental duplicate payment / Customer emergency cancellation"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(null)}
                  className="px-4 py-2 rounded-xl text-zinc-500 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                >
                  Authorize & Process
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Price Change Modal */}
      {newPriceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs">
            <h3 className="font-bold text-base">Update Dish Price</h3>
            <p className="text-zinc-500">{newPriceModal.name}</p>
            <div>
              <label className="font-bold block mb-1">New Base Price (PKR)</label>
              <input
                type="number"
                value={newPriceModal.price}
                onChange={(e) => setNewPriceModal({ ...newPriceModal, price: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewPriceModal(null)}
                className="px-4 py-2 rounded-xl text-zinc-500 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateMenuItemPrice(newPriceModal.id, newPriceModal.price);
                  setNewPriceModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                Update Price
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
