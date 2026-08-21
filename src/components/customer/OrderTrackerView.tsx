import React, { useState, useEffect } from 'react';
import { useDastanay } from '../../context/DastanayContext';
import { dictionary } from '../../utils/translations';
import { OrderStatus } from '../../types';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Bell,
  Printer,
  Sparkles,
  AlertTriangle,
  Star,
} from 'lucide-react';
import { motion } from 'motion/react';
import { DastnayLogo } from '../common/DastnayLogo';

interface OrderTrackerViewProps {
  orderId?: string;
  onOpenReviewModal: (orderId: string) => void;
}

export const OrderTrackerView: React.FC<OrderTrackerViewProps> = ({
  orderId,
  onOpenReviewModal,
}) => {
  const {
    orders,
    language,
    setPrintModalData,
  } = useDastanay();
  const t = dictionary[language];

  // Pick target order or most recent order
  const targetOrder = orderId
    ? orders.find((o) => o.id === orderId)
    : orders[0];

  const [remainingSeconds, setRemainingSeconds] = useState<number>(18 * 60);

  useEffect(() => {
    if (!targetOrder) return;
    const initialSeconds = (targetOrder.estimatedPrepMinutes + (targetOrder.delayMinutes || 0)) * 60;
    setRemainingSeconds(initialSeconds);

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetOrder?.id, targetOrder?.delayMinutes]);

  if (!targetOrder) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 app-card p-8 space-y-3"
      >
        <Clock className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto" />
        <h3 className="font-bold text-base text-stone-800 dark:text-stone-200">No Active Orders</h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Browse the menu and place your order to track real-time kitchen preparation.
        </p>
      </motion.div>
    );
  }

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const steps: { key: OrderStatus; label: string; desc: string; icon: React.ReactNode }[] = [
    { key: 'received', label: 'Order Received', desc: 'Logged on server & verified', icon: <Bell className="w-4 h-4" /> },
    { key: 'confirmed', label: 'Confirmed', desc: 'Inventory deducted & allocated', icon: <CheckCircle2 className="w-4 h-4" /> },
    { key: 'preparing', label: 'Cooking in Kitchen', desc: 'Chef started preparation on station', icon: <ChefHat className="w-4 h-4" /> },
    { key: 'ready', label: 'Ready to Serve', desc: 'Plated & awaiting waiter dispatch', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'served', label: 'Served at Table', desc: 'Delivered to your table', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const currentStepIdx = steps.findIndex((s) => s.key === targetOrder.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6 pb-10"
    >
      {/* Header Card */}
      <div className="app-card p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-5">
          <div className="flex items-center gap-3">
            <DastnayLogo variant="tile" size="sm" rounded="xl" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-lg text-[#9A2D22] dark:text-[#FEE248]">
                  {targetOrder.id}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                  {targetOrder.tableNumber}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Placed at {targetOrder.createdAt} • Guest: {targetOrder.customerName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setPrintModalData({ type: 'receipt', order: targetOrder })}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#9A2D22] dark:text-[#FEE248]" />
              <span>Tax Invoice Slip</span>
            </motion.button>
          </div>
        </div>

        {/* Live Prep Countdown Clock Banner */}
        {targetOrder.status === 'preparing' || targetOrder.status === 'received' || targetOrder.status === 'confirmed' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-[#591610] via-[#83241A] to-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border border-amber-500/30"
          >
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-[#FEE248] text-xs font-bold uppercase tracking-wider">
                <ChefHat className="w-4 h-4 animate-bounce" />
                <span>Estimated Preparation Target</span>
              </div>
              <p className="text-xs text-stone-300">
                Expected Ready Around: <span className="font-bold text-white">{targetOrder.expectedReadyAt}</span>
              </p>
            </div>

            <div className="text-center sm:text-right">
              <div className="font-mono text-3xl font-extrabold tracking-widest text-[#FEE248]">
                {formatCountdown(remainingSeconds)}
              </div>
              <span className="text-[10px] text-stone-300 font-medium">Minutes Remaining</span>
            </div>
          </motion.div>
        ) : targetOrder.status === 'ready' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200 flex items-center gap-3"
          >
            <Sparkles className="w-6 h-6 text-[#9A2D22] dark:text-[#FEE248] shrink-0 animate-pulse" />
            <div>
              <span className="font-extrabold text-sm block">Your food is ready!</span>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Our staff is bringing the fresh sizzling dishes to {targetOrder.tableNumber} shortly.
              </p>
            </div>
          </motion.div>
        ) : targetOrder.status === 'served' || targetOrder.status === 'completed' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#9A2D22] dark:text-[#FEE248] shrink-0" />
              <div>
                <span className="font-bold text-sm text-stone-900 dark:text-stone-100 block">
                  Food Served. Enjoy your meal!
                </span>
                <p className="text-xs text-stone-500">Khana nosh farmayein.</p>
              </div>
            </div>

            {!targetOrder.isReviewed && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onOpenReviewModal(targetOrder.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9A2D22] hover:bg-[#83241A] text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
              >
                <Star className="w-3.5 h-3.5 fill-[#FEE248] text-[#FEE248]" />
                <span>Rate & Review</span>
              </motion.button>
            )}
          </motion.div>
        ) : null}

        {/* Delay Notice Banner if Kitchen flagged delay */}
        {targetOrder.delayMinutes && targetOrder.delayMinutes > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#9A2D22]" />
            <div>
              <span className="font-bold">Kitchen Update: +{targetOrder.delayMinutes} Mins</span>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                {targetOrder.delayReason || 'Chef is ensuring proper high-heat dum cooking.'}
              </p>
            </div>
          </div>
        )}

        {/* Real-time Order Progress Steps */}
        <div className="space-y-4 pt-2">
          <label className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider block">
            Kitchen & Serving Workflow
          </label>

          <div className="relative border-l-2 border-stone-200 dark:border-stone-800 ml-4 space-y-6 py-2">
            {steps.map((step, idx) => {
              const isPastOrCurrent =
                currentStepIdx >= idx ||
                (targetOrder.status === 'completed' && idx <= 4) ||
                (targetOrder.status === 'served' && idx <= 4);
              const isCurrent = targetOrder.status === step.key;

              return (
                <div key={step.key} className="relative pl-6">
                  {/* Indicator Dot */}
                  <div
                    className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'bg-[#9A2D22] border-amber-300 ring-4 ring-[#9A2D22]/20'
                        : isPastOrCurrent
                        ? 'bg-[#9A2D22] border-white dark:border-stone-900'
                        : 'bg-stone-200 dark:bg-stone-700 border-white dark:border-stone-900'
                    }`}
                  ></div>

                  <div>
                    <span
                      className={`text-xs font-bold block ${
                        isCurrent
                          ? 'text-[#9A2D22] dark:text-[#FEE248]'
                          : isPastOrCurrent
                          ? 'text-stone-900 dark:text-stone-100'
                          : 'text-stone-400'
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-[11px] text-stone-500">{step.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Itemized Order Breakdown */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-stone-800 dark:text-stone-200">
            <span>Ordered Items</span>
            <span className="text-stone-500">{targetOrder.items.length} items</span>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
            {targetOrder.items.map((item, i) => (
              <div key={i} className="py-2 flex justify-between items-start">
                <div>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">
                    {item.quantity}x {item.name}
                  </span>
                  {item.selectedAddons && item.selectedAddons.length > 0 && (
                    <span className="block text-[10px] text-stone-500">
                      + {item.selectedAddons.join(', ')}
                    </span>
                  )}
                  {item.specialInstructions && (
                    <span className="block text-[10px] font-bold text-[#9A2D22] dark:text-[#FEE248]">
                      Note: {item.specialInstructions}
                    </span>
                  )}
                </div>
                <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                  Rs. {item.totalPrice.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Payment info bar */}
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs">
            <div>
              <span className="text-stone-500">Payment Status:</span>
              <span className="font-bold ml-1 uppercase text-[#9A2D22] dark:text-[#FEE248]">
                {targetOrder.paymentStatus} ({targetOrder.paymentMethod.toUpperCase()})
              </span>
            </div>
            <span className="font-mono font-extrabold text-sm text-stone-900 dark:text-stone-100">
              Total: Rs. {targetOrder.total.toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
