import React, { useState } from 'react';
import { useDastanay } from '../../context/DastanayContext';
import { dictionary } from '../../utils/translations';
import { Order, OrderStatus } from '../../types';
import {
  ChefHat,
  Clock,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Flame,
  Utensils,
  Plus,
  Bell,
  RefreshCw,
} from 'lucide-react';

export const KitchenKDS: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    reportKitchenDelay,
    setPrintModalData,
    currentBranchId,
    branches,
    restaurants,
    currentRestaurantId,
    language,
  } = useDastanay();
  const t = dictionary[language];

  const currentBranch = branches.find((b) => b.id === currentBranchId) || branches[0];
  const currentRestaurant = restaurants.find((r) => r.id === currentBranch.restaurantId) || restaurants[0];

  const [stationFilter, setStationFilter] = useState<string>('All');
  const [delayModalOrderId, setDelayModalOrderId] = useState<string | null>(null);
  const [delayMins, setDelayMins] = useState<number>(10);
  const [delayReason, setDelayReason] = useState<string>('High Coal Flame Charcoal Restock');

  // Filter orders belonging to this branch and active in kitchen
  const branchOrders = orders.filter((o) => o.branchId === currentBranch.id);

  const activeKitchenOrders = branchOrders.filter(
    (o) => o.status === 'received' || o.status === 'confirmed' || o.status === 'preparing' || o.status === 'ready'
  );

  const completedKitchenOrders = branchOrders.filter(
    (o) => o.status === 'served' || o.status === 'completed'
  );

  const stations = ['All', 'BBQ & Grill Station', 'Karahi & Handi Station', 'Tandoor Station', 'Beverages & Desserts'];

  const handleAdvanceStatus = (order: Order) => {
    if (order.status === 'received' || order.status === 'confirmed') {
      updateOrderStatus(order.id, 'preparing');
    } else if (order.status === 'preparing') {
      updateOrderStatus(order.id, 'ready');
    } else if (order.status === 'ready') {
      updateOrderStatus(order.id, 'served');
    }
  };

  const handleConfirmDelay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delayModalOrderId) return;
    reportKitchenDelay(delayModalOrderId, delayMins, delayReason);
    setDelayModalOrderId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* KDS Header Bento Bar */}
      <div className="bento-card bg-slate-900 text-white p-5 sm:p-6 border-2 border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-100">
                {currentRestaurant.name} • Kitchen Display System
              </h2>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live Cooking Station Monitor • {currentBranch.name} • {activeKitchenOrders.length} Active Tickets
            </p>
          </div>
        </div>

        {/* Station Bento Pills */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
          {stations.map((st) => (
            <button
              key={st}
              onClick={() => setStationFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                stationFilter === st
                  ? 'bg-indigo-600 text-white border border-indigo-500 shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Active Kitchen Tickets Grid in Bento Format */}
      {activeKitchenOrders.length === 0 ? (
        <div className="text-center py-20 bento-card p-8 space-y-3">
          <ChefHat className="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">
            Kitchen Queue Clear!
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All active table orders have been cooked and dispatched. New customer orders will appear automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeKitchenOrders.map((order) => {
            const isReady = order.status === 'ready';
            const isCooking = order.status === 'preparing';

            return (
              <div
                key={order.id}
                className={`bento-card overflow-hidden flex flex-col justify-between shadow-md transition-all ${
                  isReady
                    ? 'border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : isCooking
                    ? 'border-amber-500/80 shadow-amber-500/5'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Ticket Header */}
                <div
                  className={`p-4 border-b flex items-center justify-between text-xs ${
                    isReady
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : isCooking
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="font-mono font-black text-sm block">
                      {order.tableNumber}
                    </span>
                    <span className="text-[10px] opacity-80">
                      {order.id} • {order.createdAt}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-black uppercase tracking-wider block">
                      {order.status}
                    </span>
                    <span className="text-[10px]">
                      Target: {order.expectedReadyAt}
                    </span>
                  </div>
                </div>

                {/* Items in this Ticket */}
                <div className="p-5 space-y-3 flex-1 text-xs">
                  {order.delayMinutes && order.delayMinutes > 0 && (
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[11px] flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        +{order.delayMinutes}m Delayed: {order.delayReason}
                      </span>
                    </div>
                  )}

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-3 space-y-1">
                        <div className="flex items-start justify-between">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {item.station}
                          </span>
                        </div>

                        {item.selectedAddons && item.selectedAddons.length > 0 && (
                          <span className="block text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                            Add-ons: {item.selectedAddons.join(', ')}
                          </span>
                        )}

                        {item.specialInstructions && (
                          <span className="block text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200 dark:border-amber-800">
                            Chef Note: {item.specialInstructions}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ticket Footer Action Buttons */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t-2 border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    {/* Print KOT */}
                    <button
                      onClick={() => setPrintModalData({ type: 'kot', order })}
                      className="p-2.5 rounded-2xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 cursor-pointer shadow-2xs"
                      title="Print KOT Slip"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {/* Report Delay */}
                    {order.status !== 'ready' && (
                      <button
                        onClick={() => setDelayModalOrderId(order.id)}
                        className="px-3 py-2 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200 text-[11px] font-bold border border-amber-300 dark:border-amber-800 cursor-pointer"
                      >
                        +Delay
                      </button>
                    )}
                  </div>

                  {/* Advance Workflow */}
                  <button
                    onClick={() => handleAdvanceStatus(order)}
                    className={`px-4 py-2.5 rounded-2xl text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer ${
                      isReady
                        ? 'bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-indigo-600'
                        : isCooking
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                  >
                    {isReady ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Served</span>
                      </>
                    ) : isCooking ? (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Mark Food Ready</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-4 h-4" />
                        <span>Start Cooking</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delay Modal in Bento Style */}
      {delayModalOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-[2rem] shadow-2xl max-w-md w-full p-6 border-2 border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <h3 className="font-black text-base text-amber-600">Notify Customer of Kitchen Delay</h3>
            <p className="text-slate-500">
              Updating the cooking countdown notifies the diner at the table in real-time.
            </p>

            <form onSubmit={handleConfirmDelay} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Additional Minutes</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDelayMins(m)}
                      className={`p-2.5 rounded-2xl border-2 text-center font-bold cursor-pointer ${
                        delayMins === m
                          ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      +{m} Mins
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Reason for Delay</label>
                <select
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="High Coal Charcoal Restock">High Coal Charcoal Restock</option>
                  <option value="Slow Dum Cooking for Tender Mutton">Slow Dum Cooking for Tender Mutton</option>
                  <option value="High Rush Order Queuing">High Rush Order Queuing</option>
                  <option value="Fresh Naan Tandoor Firing">Fresh Naan Tandoor Firing</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDelayModalOrderId(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                >
                  Send Delay Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
