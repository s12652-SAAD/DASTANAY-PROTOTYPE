import React, { useState } from 'react';
import { useDastanay } from '../../context/DastanayContext';
import { dictionary } from '../../utils/translations';
import { PaymentMethod, Order } from '../../types';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Tag,
  CheckCircle2,
  QrCode,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DastnayLogo } from '../common/DastnayLogo';

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: (order: Order) => void;
  onOpenQRScanner: () => void;
}

export const CartCheckoutDrawer: React.FC<CartCheckoutDrawerProps> = ({
  isOpen,
  onClose,
  onOrderPlaced,
  onOpenQRScanner,
}) => {
  const {
    cart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    currentTableSession,
    startTableSession,
    tables,
    branches,
    currentBranchId,
    appliedPromo,
    setAppliedPromo,
    promotions,
    loyalty,
    redeemedPoints,
    setRedeemedPoints,
    placeOrder,
    reservations,
    language,
  } = useDastanay();
  const t = dictionary[language];

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [selectedQuickTable, setSelectedQuickTable] = useState<string>('');
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [promoMessage, setPromoMessage] = useState<string>('');
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('Syed Hamza Ali');
  const [customerPhone, setCustomerPhone] = useState<string>('+92 300 8291029');

  if (!isOpen) return null;

  const currentBranch = branches.find((b) => b.id === currentBranchId) || branches[0];
  const branchTables = tables.filter((t) => t.branchId === currentBranchId);
  const subtotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);
  const taxRate = currentBranch?.taxRatePercent || 13;
  const serviceRate = orderType === 'dine_in' ? currentBranch?.serviceChargePercent || 5 : 0;

  const taxAmount = (subtotal * taxRate) / 100;
  const serviceCharge = (subtotal * serviceRate) / 100;

  // Promo calculation
  const promoDiscount = appliedPromo
    ? appliedPromo.discountType === 'percentage'
      ? Math.min((subtotal * appliedPromo.discountValue) / 100, appliedPromo.maxDiscount || 99999)
      : appliedPromo.discountValue
    : 0;

  // Loyalty points discount (100 pts = Rs. 50 off)
  const loyaltyDiscount = (redeemedPoints / 100) * 50;
  const totalDiscount = promoDiscount + loyaltyDiscount;

  // Pre-booked table reservation adjustment
  const activeRes = reservations.find(
    (r) => r.tableId === currentTableSession?.tableId && (r.status === 'checked_in' || r.status === 'confirmed')
  );
  const bookingFeeDeduction = activeRes ? activeRes.bookingFee : 0;

  const finalTotal = Math.max(
    0,
    subtotal + taxAmount + serviceCharge - totalDiscount - bookingFeeDeduction
  );

  const pointsToEarn = Math.floor(finalTotal / 10);

  const handleApplyPromo = (codeToUse?: string) => {
    const code = (codeToUse || promoCodeInput).trim().toLowerCase();
    setPromoMessage('');
    const match = promotions.find(
      (p) => p.code.toLowerCase() === code && p.isActive
    );
    if (!match) {
      setPromoMessage('Invalid voucher code');
      return;
    }
    if (subtotal < match.minSpend) {
      setPromoMessage(`Minimum spend of Rs. ${match.minSpend} required.`);
      return;
    }
    setAppliedPromo(match);
    setPromoMessage(`Voucher applied: ${match.title}`);
  };

  const handlePlaceOrderSubmit = async () => {
    setErrorMsg('');

    if (cart.length === 0) {
      setErrorMsg('Your cart is empty. Please add Pakistani dishes first.');
      return;
    }

    if (orderType === 'dine_in' && !currentTableSession) {
      if (selectedQuickTable) {
        startTableSession(selectedQuickTable);
      } else {
        setErrorMsg('Please select a Table Number or switch to Takeaway.');
        return;
      }
    }

    setIsPlacingOrder(true);

    try {
      const res = await placeOrder(paymentMethod, customerPhone, customerName);
      setIsPlacingOrder(false);

      if (res.success && res.order) {
        onOrderPlaced(res.order);
        onClose();
      } else {
        setErrorMsg(res.message || 'Order submission failed.');
      }
    } catch (err: any) {
      setIsPlacingOrder(false);
      setErrorMsg(err.message || 'Failed to submit order.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-lg bg-white dark:bg-[#18181B] h-full shadow-2xl flex flex-col justify-between border-l border-stone-200 dark:border-stone-800"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-[#F7F8FA] dark:bg-stone-900/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#364FAB]" />
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-[#202124] dark:text-[#F7F8FA]">
                Your Pakistani Food Cart
              </h2>
              <p className="text-[11px] text-[#687078]">{currentBranch.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-[#687078] hover:text-rose-600 font-semibold cursor-pointer p-1"
              >
                Clear Cart
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-[#202124] dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Dine-In vs Takeaway Toggle */}
          <div className="p-3 rounded-xl bg-[#F7F8FA] dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#202124] dark:text-stone-200">
              <span>Order Type</span>
              <div className="flex items-center gap-1 bg-white dark:bg-stone-900 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => setOrderType('dine_in')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    orderType === 'dine_in'
                      ? 'bg-[#364FAB] text-white shadow-2xs'
                      : 'text-[#687078] dark:text-stone-400'
                  }`}
                >
                  Dine-In Table
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('takeaway')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    orderType === 'takeaway'
                      ? 'bg-[#364FAB] text-white shadow-2xs'
                      : 'text-[#687078] dark:text-stone-400'
                  }`}
                >
                  Takeaway / Counter
                </button>
              </div>
            </div>

            {orderType === 'dine_in' && (
              <div className="pt-2 border-t border-stone-200 dark:border-stone-700">
                {currentTableSession ? (
                  <div className="flex items-center justify-between text-xs bg-[#F3F5FD] dark:bg-[#22336F]/40 p-2 rounded-lg border border-[#E8ECFB] dark:border-[#364FAB]/40 text-[#22336F] dark:text-[#E8ECFB]">
                    <span className="font-bold">Active Table: {currentTableSession.tableNumber}</span>
                    <span className="text-[10px] bg-[#E8ECFB] dark:bg-[#22336F] text-[#22336F] dark:text-[#E8ECFB] px-2 py-0.5 rounded font-mono font-bold">
                      Session Active
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#687078] dark:text-stone-400 block">
                      Select Table or Scan QR Code:
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedQuickTable}
                        onChange={(e) => setSelectedQuickTable(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-bold text-[#202124] dark:text-[#F7F8FA] outline-none"
                      >
                        <option value="">-- Choose Table Number --</option>
                        {branchTables.map((t) => (
                          <option key={t.id} value={t.tableNumber}>
                            {t.tableNumber} ({t.section} - {t.capacity} Seats)
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={onOpenQRScanner}
                        className="px-3 py-1.5 rounded-lg bg-[#E8ECFB] hover:bg-[#d8e0f8] text-[#22336F] text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>QR</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Item List */}
          {cart.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <ShoppingBag className="w-10 h-10 text-stone-300 dark:text-stone-700 mx-auto" />
              <p className="text-xs font-bold text-[#202124] dark:text-stone-300">
                Your cart is empty
              </p>
              <p className="text-[11px] text-[#687078]">
                Explore handi karahi, biryani, BBQ platters & fresh naan to add items!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800 space-y-1">
              {cart.map((item) => (
                <div key={item.cartItemId} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-[#202124] dark:text-[#F7F8FA]">
                        {item.name || item.menuItemName}
                      </span>
                    </div>

                    {item.selectedVariation && (
                      <p className="text-[11px] text-[#364FAB] dark:text-[#E8ECFB] font-semibold">
                        Portion: {item.selectedVariation.name}
                      </p>
                    )}

                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <p className="text-[10px] text-[#687078]">
                        Add-ons: {item.selectedAddons.map((a) => a.name).join(', ')}
                      </p>
                    )}

                    {item.specialInstructions && (
                      <p className="text-[10px] text-stone-400 italic">
                        Note: "{item.specialInstructions}"
                      </p>
                    )}

                    <div className="font-mono font-bold text-xs text-[#364FAB] dark:text-[#E8ECFB] pt-1">
                      Rs. {item.itemTotal.toLocaleString()}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 bg-[#F7F8FA] dark:bg-stone-800 p-1 rounded-lg border border-stone-200 dark:border-stone-700 shrink-0">
                    <button
                      onClick={() => updateCartItemQuantity(item.cartItemId, -1)}
                      className="p-1 text-[#687078] dark:text-stone-400 hover:text-[#202124] dark:hover:text-stone-100 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-extrabold text-xs w-5 text-center text-[#202124] dark:text-stone-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartItemQuantity(item.cartItemId, 1)}
                      className="p-1 text-[#687078] dark:text-stone-400 hover:text-[#202124] dark:hover:text-stone-100 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Vouchers & Loyalty */}
          {cart.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              {/* Voucher Code */}
              <div>
                <label className="text-[11px] font-bold text-[#202124] dark:text-stone-300 block mb-1">
                  Pakistani Voucher / Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. DINE20, WELCOME10)"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#F7F8FA] dark:bg-stone-800 text-xs text-[#202124] dark:text-stone-100 uppercase outline-none focus:border-[#364FAB]"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyPromo()}
                    className="px-4 py-1.5 rounded-lg bg-[#364FAB] hover:bg-[#2D428F] text-white font-bold text-xs cursor-pointer transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <p className="text-[10px] font-semibold text-[#364FAB] dark:text-[#E8ECFB] mt-1">
                    {promoMessage}
                  </p>
                )}
              </div>

              {/* DineClub Loyalty Points */}
              {loyalty.pointsBalance > 0 && (
                <div className="p-3 rounded-xl bg-[#F3F5FD] dark:bg-[#22336F]/30 border border-[#E8ECFB] dark:border-[#364FAB]/30 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-extrabold text-[#22336F] dark:text-[#E8ECFB]">
                      DineClub Points: {loyalty.pointsBalance}
                    </div>
                    <div className="text-[10px] text-[#364FAB] dark:text-blue-300">
                      100 pts = Rs. 50 discount
                    </div>
                  </div>
                  {redeemedPoints > 0 ? (
                    <button
                      onClick={() => setRedeemedPoints(0)}
                      className="text-[11px] font-bold text-rose-600 underline cursor-pointer"
                    >
                      Remove (Rs. {loyaltyDiscount})
                    </button>
                  ) : (
                    <button
                      onClick={() => setRedeemedPoints(Math.min(loyalty.pointsBalance, 500))}
                      className="px-3 py-1 bg-[#364FAB] text-white rounded-lg font-bold text-[11px] cursor-pointer hover:bg-[#2D428F]"
                    >
                      Redeem Points
                    </button>
                  )}
                </div>
              )}

              {/* Payment Method Selector */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-bold text-[#202124] dark:text-stone-300 block">
                  Payment Method
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'cash', label: 'Cash', icon: <Banknote className="w-3.5 h-3.5" /> },
                    { id: 'card', label: 'Card', icon: <CreditCard className="w-3.5 h-3.5" /> },
                    { id: 'jazzcash', label: 'JazzCash', icon: <Smartphone className="w-3.5 h-3.5" /> },
                    { id: 'easypaisa', label: 'Easypaisa', icon: <Smartphone className="w-3.5 h-3.5" /> },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                      className={`p-2 rounded-lg border text-center transition-colors flex flex-col items-center gap-1 cursor-pointer ${
                        paymentMethod === pm.id
                          ? 'border-[#364FAB] bg-[#F3F5FD] dark:bg-[#22336F]/40 text-[#364FAB] dark:text-[#E8ECFB] font-bold'
                          : 'border-stone-200 dark:border-stone-700 text-[#687078] dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                    >
                      {pm.icon}
                      <span className="text-[10px]">{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bill Breakdown */}
              <div className="bg-[#F7F8FA] dark:bg-stone-800/40 rounded-xl p-3 space-y-1.5 text-xs border border-stone-200 dark:border-stone-700 font-mono">
                <div className="flex justify-between text-[#687078] dark:text-stone-400 font-sans">
                  <span>Subtotal:</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#687078] dark:text-stone-400 font-sans">
                  <span>PRA/SRB Tax ({taxRate}%):</span>
                  <span>Rs. {taxAmount.toFixed(0)}</span>
                </div>
                {orderType === 'dine_in' && (
                  <div className="flex justify-between text-[#687078] dark:text-stone-400 font-sans">
                    <span>Service Charge ({serviceRate}%):</span>
                    <span>Rs. {serviceCharge.toFixed(0)}</span>
                  </div>
                )}
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-sans font-bold">
                    <span>Discount (Promo + Points):</span>
                    <span>- Rs. {totalDiscount.toFixed(0)}</span>
                  </div>
                )}
                {bookingFeeDeduction > 0 && (
                  <div className="flex justify-between text-[#364FAB] dark:text-[#E8ECFB] font-sans font-bold">
                    <span>Prepaid Table Booking Credit:</span>
                    <span>- Rs. {bookingFeeDeduction}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#202124] dark:text-[#F7F8FA] font-bold text-sm pt-2 border-t border-stone-200 dark:border-stone-700 font-sans">
                  <span>Grand Total Payable:</span>
                  <span className="text-[#364FAB] dark:text-[#E8ECFB] font-mono font-bold text-base">
                    Rs. {finalTotal.toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] text-[#364FAB] dark:text-blue-300 font-sans font-medium">
                  ⭐ You will earn +{pointsToEarn} DineClub reward points with this order.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Checkout Button */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-[#F7F8FA] dark:bg-stone-900/50">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handlePlaceOrderSubmit}
              disabled={isPlacingOrder}
              className="w-full py-3.5 rounded-xl bg-[#364FAB] hover:bg-[#2D428F] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPlacingOrder ? (
                <span>Sending to Kitchen KDS & Database...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#E8ECFB]" />
                  <span>Place Order • Rs. {finalTotal.toLocaleString()}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
