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
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [promoMessage, setPromoMessage] = useState<string>('');
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [customerName] = useState<string>('Hamza Ali');
  const [customerPhone] = useState<string>('+92 300 8291029');

  if (!isOpen) return null;

  const currentBranch = branches.find((b) => b.id === currentBranchId);
  const subtotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);
  const taxRate = currentBranch?.taxRatePercent || 13;
  const serviceRate = currentBranch?.serviceChargePercent || 5;

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
    (r) => r.tableId === currentTableSession?.tableId && r.status === 'checked_in'
  );
  const bookingFeeDeduction = activeRes ? activeRes.bookingFee : 0;

  const finalTotal = Math.max(
    0,
    subtotal + taxAmount + serviceCharge - totalDiscount - bookingFeeDeduction
  );

  const pointsToEarn = Math.floor(finalTotal / 10);

  const handleApplyPromo = () => {
    setPromoMessage('');
    const match = promotions.find(
      (p) => p.code.toLowerCase() === promoCodeInput.trim().toLowerCase() && p.isActive
    );
    if (!match) {
      setPromoMessage('Invalid voucher code');
      return;
    }
    if (subtotal < match.minSpend) {
      setPromoMessage(`Minimum spend of Rs. ${match.minSpend} required for this code.`);
      return;
    }
    setAppliedPromo(match);
    setPromoMessage(`Promo code applied: ${match.title}`);
  };

  const handlePlaceOrderSubmit = () => {
    setErrorMsg('');

    if (!currentTableSession) {
      setErrorMsg('Please start a table session or scan your table QR before sending order to kitchen.');
      return;
    }

    setIsPlacingOrder(true);

    setTimeout(() => {
      const res = placeOrder(paymentMethod, customerPhone, customerName);
      setIsPlacingOrder(false);

      if (res.success && res.order) {
        onOrderPlaced(res.order);
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 w-full max-w-md h-full flex flex-col shadow-2xl border-l border-stone-200 dark:border-stone-800"
      >
        {/* Top Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <DastnayLogo variant="tile" size="xs" rounded="md" />
            <h3 className="font-extrabold text-base">{t.cart}</h3>
            <span className="text-xs text-stone-500">
              ({cart.reduce((s, i) => s + i.quantity, 0)} items)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Table Session Status in Cart */}
          {currentTableSession ? (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-xs text-amber-900 dark:text-amber-300 block">
                  Delivering to: {currentTableSession.tableNumber}
                </span>
                <span className="text-[10px] text-stone-500">
                  Kitchen will dispatch directly to your table
                </span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5A324] animate-pulse"></span>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
              <span className="font-bold text-amber-900 dark:text-amber-200 block">
                No Table Connected Yet
              </span>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                Are you sitting at a table? Scan the table QR sticker to link your order.
              </p>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  onClose();
                  onOpenQRScanner();
                }}
                className="w-full py-2 rounded-xl bg-[#9A2D22] hover:bg-[#83241A] text-white font-bold text-xs cursor-pointer shadow-2xs"
              >
                Scan Table QR / Check In
              </motion.button>
            </div>
          )}

          {/* Cart Items List */}
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-700" />
              <p className="text-stone-500 font-medium">Your cart is empty.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                <span>Ordered Items</span>
                <button
                  onClick={clearCart}
                  className="text-rose-600 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>

              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {cart.map((item) => (
                  <div key={item.cartItemId} className="py-3 space-y-1.5">
                    <div className="flex items-start justify-between">
                      <div className="pr-2">
                        <span className="font-bold text-stone-900 dark:text-stone-100">
                          {item.name}
                        </span>
                        {item.selectedVariation && (
                          <span className="block text-[10px] text-stone-500">
                            Portion: {item.selectedVariation.name}
                          </span>
                        )}
                        {item.selectedAddons.length > 0 && (
                          <span className="block text-[10px] text-stone-500">
                            + {item.selectedAddons.map((a) => a.name).join(', ')}
                          </span>
                        )}
                        {item.specialInstructions && (
                          <span className="block text-[10px] font-bold text-amber-700 dark:text-amber-400">
                            Note: {item.specialInstructions}
                          </span>
                        )}
                      </div>

                      <span className="font-mono font-bold text-stone-900 dark:text-stone-100 whitespace-nowrap">
                        Rs. {item.itemTotal.toLocaleString()}
                      </span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-lg">
                        <button
                          onClick={() => updateCartItemQuantity(item.cartItemId, -1)}
                          className="p-1 hover:text-rose-600 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItemQuantity(item.cartItemId, 1)}
                          className="p-1 hover:text-[#9A2D22] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-stone-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cart.length > 0 && (
            <>
              {/* Promo Voucher Code */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
                <label className="font-bold text-stone-700 dark:text-stone-300 block text-[11px]">
                  Have a Promo Code? (e.g. AZADI14, KOLACHI500)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Code"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 uppercase font-mono tracking-wider outline-none focus:border-[#9A2D22]"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleApplyPromo}
                    className="px-4 py-2 rounded-xl bg-stone-800 dark:bg-stone-700 hover:bg-stone-900 text-white font-bold cursor-pointer transition-colors"
                  >
                    Apply
                  </motion.button>
                </div>
                {promoMessage && (
                  <p
                    className={`text-[11px] ${
                      appliedPromo ? 'text-[#9A2D22] dark:text-[#FEE248] font-bold' : 'text-rose-500'
                    }`}
                  >
                    {promoMessage}
                  </p>
                )}
              </div>

              {/* Loyalty Points Redemption Slider */}
              {loyalty.pointsBalance > 0 && (
                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#E5A324]" />
                      Redeem dastnay Points
                    </span>
                    <span className="text-[11px] font-mono text-stone-500">
                      Balance: {loyalty.pointsBalance} pts
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={Math.min(loyalty.pointsBalance, 1000)}
                    step="50"
                    value={redeemedPoints}
                    onChange={(e) => setRedeemedPoints(Number(e.target.value))}
                    className="w-full accent-[#9A2D22] cursor-pointer"
                  />

                  <div className="flex justify-between text-[11px] font-medium text-[#9A2D22] dark:text-[#FEE248]">
                    <span>Redeeming: {redeemedPoints} Points</span>
                    <span>Discount: - Rs. {loyaltyDiscount}</span>
                  </div>
                </div>
              )}

              {/* Pakistani Payment Methods Selection */}
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <label className="font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider block text-[11px]">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'cash', name: 'Cash to Waiter', icon: <Banknote className="w-4 h-4" /> },
                    { id: 'jazzcash', name: 'JazzCash Wallet', icon: <Smartphone className="w-4 h-4" /> },
                    { id: 'easypaisa', name: 'Easypaisa QR', icon: <Smartphone className="w-4 h-4" /> },
                    { id: 'card', name: 'Debit/Credit Card', icon: <CreditCard className="w-4 h-4" /> },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                        paymentMethod === pm.id
                          ? 'border-[#9A2D22] bg-amber-50 dark:bg-amber-950/50 font-bold text-[#9A2D22] dark:text-[#FEE248]'
                          : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                    >
                      {pm.icon}
                      <span>{pm.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-1.5">
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Subtotal:</span>
                  <span className="font-mono">Rs. {subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Sindh/Punjab GST ({taxRate}%):</span>
                  <span className="font-mono">Rs. {taxAmount.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>Service Charge ({serviceRate}%):</span>
                  <span className="font-mono">Rs. {serviceCharge.toFixed(0)}</span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-[#9A2D22] dark:text-[#FEE248] font-semibold">
                    <span>Discounts Applied:</span>
                    <span className="font-mono">- Rs. {totalDiscount.toFixed(0)}</span>
                  </div>
                )}

                {bookingFeeDeduction > 0 && (
                  <div className="flex justify-between text-[#9A2D22] dark:text-[#FEE248] font-semibold">
                    <span>Prepaid Reservation Adjusted:</span>
                    <span className="font-mono">- Rs. {bookingFeeDeduction.toFixed(0)}</span>
                  </div>
                )}

                <div className="flex justify-between font-extrabold text-sm pt-2 border-t border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100">
                  <span>{t.bill_total}:</span>
                  <span className="font-mono text-[#9A2D22] dark:text-[#FEE248] text-base">
                    Rs. {finalTotal.toFixed(0)}
                  </span>
                </div>

                <div className="flex justify-between text-[10px] text-stone-500 pt-1">
                  <span>Points to Earn on completion:</span>
                  <span className="font-bold text-[#E5A324]">+{pointsToEarn} dastnay Points</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Place Order CTA Button */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shrink-0">
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              onClick={handlePlaceOrderSubmit}
              disabled={isPlacingOrder}
              className="w-full py-3 rounded-xl bg-[#9A2D22] hover:bg-[#83241A] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPlacingOrder ? (
                <span>Dispatching Order to Kitchen KDS...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#FEE248]" />
                  <span>
                    {t.order_now} • Rs. {finalTotal.toFixed(0)}
                  </span>
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
