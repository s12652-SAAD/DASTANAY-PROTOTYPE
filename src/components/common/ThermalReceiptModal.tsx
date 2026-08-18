import React from 'react';
import { useDastanay } from '../../context/DastanayContext';
import { Printer, X, Check, Utensils, QrCode } from 'lucide-react';

export const ThermalReceiptModal: React.FC = () => {
  const { printModalData, setPrintModalData, restaurants, branches } = useDastanay();

  if (!printModalData) return null;

  const { type, order } = printModalData;
  const restaurant = restaurants.find((r) => r.id === order.restaurantId);
  const branch = branches.find((b) => b.id === order.branchId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white text-zinc-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-zinc-300">
        {/* Top Control Bar */}
        <div className="bg-zinc-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>
              {type === 'kot' ? 'Kitchen Order Ticket (KOT)' : type === 'bar' ? 'Bar Beverage Slip' : 'Cashier Tax Invoice'}
            </span>
          </div>
          <button
            onClick={() => setPrintModalData(null)}
            className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 80mm Thermal Receipt Content */}
        <div className="p-6 bg-[#fcfcf9] font-mono text-[11px] leading-relaxed select-text border-b border-dashed border-zinc-300 max-h-[75vh] overflow-y-auto print:max-h-none print:p-0">
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-zinc-400">
            <div className="font-extrabold text-sm tracking-wider uppercase">
              {restaurant?.name || 'DASTANAY RESTAURANT'}
            </div>
            <div className="text-[10px] text-zinc-600 uppercase font-sans font-medium mt-0.5">
              {branch?.name || 'Branch'}
            </div>
            <div className="text-[9px] text-zinc-500 font-sans mt-0.5">
              {branch?.address || 'Karachi, Pakistan'} | {branch?.phone}
            </div>
            <div className="text-[10px] font-bold mt-1.5 uppercase px-2 py-0.5 inline-block bg-zinc-200 rounded">
              {type === 'kot' ? '*** KITCHEN ORDER TICKET ***' : '*** GUEST TAX INVOICE ***'}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="py-2.5 border-b border-dashed border-zinc-400 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
            <div>
              <span className="text-zinc-500">Order ID: </span>
              <span className="font-bold">{order.id}</span>
            </div>
            <div className="text-right">
              <span className="text-zinc-500">Table: </span>
              <span className="font-extrabold text-xs px-1 bg-zinc-800 text-white rounded">
                {order.tableNumber}
              </span>
            </div>
            <div>
              <span className="text-zinc-500">Guest: </span>
              <span className="font-semibold">{order.customerName}</span>
            </div>
            <div className="text-right">
              <span className="text-zinc-500">Time: </span>
              <span>{order.createdAt}</span>
            </div>
            {type === 'kot' && (
              <div className="col-span-2 text-emerald-800 font-bold mt-1">
                Target Prep: {order.estimatedPrepMinutes} Mins (Est. Ready: {order.expectedReadyAt})
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-3 border-b border-dashed border-zinc-400">
            <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-zinc-300 uppercase">
              <span>Qty Item Details</span>
              {type === 'receipt' && <span>Amount</span>}
            </div>

            <div className="divide-y divide-zinc-200">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-1.5">
                  <div className="flex justify-between items-start">
                    <span className="font-bold">
                      {item.quantity}x {item.name}
                    </span>
                    {type === 'receipt' && (
                      <span className="font-semibold">Rs. {item.totalPrice.toLocaleString()}</span>
                    )}
                  </div>
                  {item.selectedVariation && (
                    <div className="text-[9px] text-zinc-600 pl-4">
                      • Size: {item.selectedVariation}
                    </div>
                  )}
                  {item.selectedAddons && item.selectedAddons.length > 0 && (
                    <div className="text-[9px] text-zinc-600 pl-4">
                      • Add-ons: {item.selectedAddons.join(', ')}
                    </div>
                  )}
                  {item.specialInstructions && (
                    <div className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1 py-0.5 rounded mt-0.5">
                      ⚠️ Note: {item.specialInstructions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bill Calculation (Only for Receipt) */}
          {type === 'receipt' && (
            <div className="py-2.5 space-y-1 text-[10px] border-b border-dashed border-zinc-400">
              <div className="flex justify-between">
                <span className="text-zinc-600">Subtotal:</span>
                <span>Rs. {order.subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Sindh/Punjab GST (13%):</span>
                <span>Rs. {order.taxAmount.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Service Charge (5%):</span>
                <span>Rs. {order.serviceCharge.toFixed(0)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discounts & Loyalty Points:</span>
                  <span>- Rs. {order.discountAmount.toFixed(0)}</span>
                </div>
              )}
              {order.bookingFeeDeduction > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Pre-paid Table Fee Adjusted:</span>
                  <span>- Rs. {order.bookingFeeDeduction.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-xs pt-1.5 border-t border-zinc-300">
                <span>NET PAYABLE (PKR):</span>
                <span>Rs. {order.total.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-[9px] text-zinc-500 pt-1">
                <span>Payment: {order.paymentMethod.toUpperCase()}</span>
                <span className="font-bold uppercase text-emerald-800">{order.paymentStatus}</span>
              </div>
            </div>
          )}

          {/* Footer & Barcode */}
          <div className="pt-3 text-center text-[9px] text-zinc-500 space-y-1">
            <p>Thank you for dining with {restaurant?.name}!</p>
            <p className="font-sans">Powered by Dastanay Platform PK</p>
            <div className="flex justify-center pt-1">
              <div className="text-[10px] tracking-widest font-mono bg-zinc-200 px-3 py-1 rounded">
                |||||| | ||||| |||| || | |||||
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
          <button
            onClick={() => setPrintModalData(null)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print Thermal Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
