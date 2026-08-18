import React, { useState } from 'react';
import { useDastanay } from '../../context/DastanayContext';
import { dictionary } from '../../utils/translations';
import { Restaurant, Branch, Table } from '../../types';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface TableReservationViewProps {
  restaurant: Restaurant;
  branch: Branch;
  onBack: () => void;
  onReservationComplete: (reservationId: string) => void;
}

export const TableReservationView: React.FC<TableReservationViewProps> = ({
  restaurant,
  branch,
  onBack,
  onReservationComplete,
}) => {
  const { tables, createReservation, language, currentBranchId } = useDastanay();
  const t = dictionary[language];

  const [selectedTableId, setSelectedTableId] = useState<string>('tbl-4');
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-14');
  const [selectedTime, setSelectedTime] = useState<string>('08:30 PM');
  const [guestCount, setGuestCount] = useState<number>(4);
  const [customerName, setCustomerName] = useState<string>('Syed Hamza Ali');
  const [customerPhone, setCustomerPhone] = useState<string>('+92 300 8291029');
  const [customerEmail, setCustomerEmail] = useState<string>('hamza.ali@gmail.com');
  const [selectedPayment, setSelectedPayment] = useState<'jazzcash' | 'easypaisa' | 'card'>('jazzcash');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successInfo, setSuccessInfo] = useState<{ id: string; tableNumber: string } | null>(null);
  const [errorBanner, setErrorBanner] = useState<string>('');

  const timeSlots = [
    '12:30 PM',
    '01:30 PM',
    '03:00 PM',
    '07:00 PM',
    '08:00 PM',
    '08:30 PM',
    '09:30 PM',
    '10:30 PM',
    '11:30 PM',
  ];

  const selectedTable = tables.find((t) => t.id === selectedTableId);
  const bookingFee = branch.reservationFee || 300;

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner('');

    if (!selectedTable) {
      setErrorBanner('Please choose an available table.');
      return;
    }

    if (selectedTable.status !== 'available') {
      setErrorBanner(
        'This table was just booked by another customer. Please select another available table.'
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = createReservation({
        restaurantId: restaurant.id,
        branchId: branch.id,
        tableId: selectedTable.id,
        tableNumber: selectedTable.tableNumber,
        customerName,
        customerPhone,
        customerEmail,
        date: selectedDate,
        time: selectedTime,
        guests: guestCount,
        bookingFee,
        paymentStatus: 'paid',
      });

      setIsSubmitting(false);

      if (res.success && res.reservation) {
        setSuccessInfo({
          id: res.reservation.id,
          tableNumber: res.reservation.tableNumber,
        });
      } else {
        setErrorBanner(res.message);
      }
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-12">
      {/* Top Breadcrumb */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Restaurant Details</span>
      </button>

      {/* Success State Screen */}
      {successInfo ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-emerald-500/40 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              Reservation Confirmed!
            </h2>
            <p className="text-xs text-zinc-500">
              Your table is secured at {restaurant.name} ({branch.name}).
            </p>
          </div>

          <div className="max-w-md mx-auto bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-700 text-left text-xs space-y-3 font-mono">
            <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-700 pb-2">
              <span className="text-zinc-500 font-sans">Reservation ID:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {successInfo.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 font-sans">Table Assigned:</span>
              <span className="font-bold">{successInfo.tableNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 font-sans">Date & Time:</span>
              <span className="font-bold">
                {selectedDate} at {selectedTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 font-sans">Number of Guests:</span>
              <span className="font-bold">{guestCount} Persons</span>
            </div>
            <div className="flex justify-between text-emerald-700 dark:text-emerald-300 pt-2 border-t border-zinc-200 dark:border-zinc-700">
              <span className="font-sans">Prepaid Booking Fee:</span>
              <span className="font-bold">Rs. {bookingFee} (Adjustable in Bill)</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 text-left flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-bold">Arrival Policy & Grace Period:</span>
              <p className="mt-0.5">
                Your table will be held for {branch.gracePeriodMinutes || 15} minutes after{' '}
                {selectedTime}. Upon arrival, simply tap "Start Table Session" or scan the QR code on your table to browse the live kitchen menu!
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => onReservationComplete(successInfo.id)}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg cursor-pointer"
            >
              Go to Table Session & Menu
            </button>
          </div>
        </div>
      ) : (
        /* Reservation Form */
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Pre-Book Your Table at {restaurant.name}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              {branch.name} • {branch.address}
            </p>
          </div>

          {errorBanner && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorBanner}</span>
            </div>
          )}

          {/* Step 1: Visual Table Floor Plan */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                1. Select Desired Table from Live Floor Plan
              </label>
              <span className="text-[11px] text-zinc-500">Live Availability Updated</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {tables.map((table) => {
                const isSelected = selectedTableId === table.id;
                const isAvailable = table.status === 'available';

                return (
                  <button
                    key={table.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      setSelectedTableId(table.id);
                      setErrorBanner('');
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500/50 shadow-md'
                        : isAvailable
                        ? 'border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 hover:border-emerald-400 hover:bg-white dark:hover:bg-zinc-800'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/30 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                        {table.tableNumber}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                          table.status === 'available'
                            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                            : table.status === 'reserved'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {table.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium truncate">
                      {table.section}
                    </p>

                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-1">
                      <Users className="w-3 h-3" />
                      <span>Up to {table.capacity} Guests</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Date, Time & Guests Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Reservation Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Time Slot
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Number of Guests
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: Customer Information */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
              2. Guest Contact Information
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Pakistani Mobile (+92 300 1234567)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Step 4: Booking Fee & Pakistani Payment */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                3. Booking Fee & Payment (Adjustable against dining bill)
              </label>
              <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                Rs. {bookingFee}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'jazzcash', name: 'JazzCash', desc: 'Instant OTP / Mobile Wallet' },
                { id: 'easypaisa', name: 'Easypaisa', desc: 'Direct App / QR Pay' },
                { id: 'card', name: 'Debit/Credit Card', desc: 'Visa / Mastercard / PayPak' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedPayment(m.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedPayment === m.id
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                      : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="font-bold text-xs block">{m.name}</span>
                  <span className="text-[10px] text-zinc-500">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleConfirmReservation}
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Securing Table & Processing Token...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>
                  Confirm & Pre-Pay Rs. {bookingFee} for {selectedTable?.tableNumber || 'Table'}
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
