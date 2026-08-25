import React, { useState, useEffect } from 'react';
import { useDastanay } from '../../context/DastanayContext';
import { dictionary } from '../../utils/translations';
import { Restaurant, Branch, Table } from '../../types';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  Info,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { DastnayLogo } from '../common/DastnayLogo';

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
  const { tables, createReservation, language, cancelReservation } = useDastanay();
  const t = dictionary[language];

  // Helper date generators for dynamic Pakistani dates
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTomorrowDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDayAfterTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedTime, setSelectedTime] = useState<string>('08:30 PM');
  const [guestCount, setGuestCount] = useState<number>(4);
  const [customerName, setCustomerName] = useState<string>('Syed Hamza Ali');
  const [customerPhone, setCustomerPhone] = useState<string>('+92 300 8291029');
  const [customerEmail, setCustomerEmail] = useState<string>('hamza.ali@gmail.com');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<'jazzcash' | 'easypaisa' | 'card'>('jazzcash');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState<boolean>(false);
  const [availableTableIds, setAvailableTableIds] = useState<string[]>([]);
  const [successInfo, setSuccessInfo] = useState<{
    id: string;
    tableNumber: string;
    date: string;
    time: string;
    guests: number;
    bookingFee: number;
    customerName: string;
    createdAt: string;
  } | null>(null);
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

  // Fetch real-time availability from database for selected date and time
  useEffect(() => {
    let isMounted = true;
    const checkAvailability = async () => {
      setIsLoadingAvailability(true);
      try {
        const res = await fetch(
          `/api/availability?branchId=${branch.id}&date=${selectedDate}&time=${encodeURIComponent(
            selectedTime
          )}&guests=${guestCount}`
        );
        const data = await res.json();
        if (isMounted && data.availableTables) {
          const availIds = data.availableTables.map((t: any) => t.id);
          setAvailableTableIds(availIds);

          // If current selected table is not in available, pick the first suitable one
          if (!availIds.includes(selectedTableId)) {
            const firstSuitable = data.suitableTables?.[0]?.id || availIds[0] || '';
            setSelectedTableId(firstSuitable);
          }
        }
      } catch (err) {
        console.warn('Availability check fallback:', err);
      } finally {
        if (isMounted) setIsLoadingAvailability(false);
      }
    };

    checkAvailability();
    return () => {
      isMounted = false;
    };
  }, [branch.id, selectedDate, selectedTime, guestCount]);

  const branchTables = tables.filter((t) => t.branchId === branch.id);
  const selectedTable = branchTables.find((tbl) => tbl.id === selectedTableId);
  const bookingFee = branch.reservationFee || 300;

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner('');

    if (!selectedTable) {
      setErrorBanner('Please select an available table from the live floor plan.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorBanner('Please enter your full name and Pakistani mobile number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createReservation({
        restaurantId: restaurant.id,
        branchId: branch.id,
        tableId: selectedTable.id,
        tableNumber: selectedTable.tableNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        date: selectedDate,
        time: selectedTime,
        guests: guestCount,
        bookingFee,
        paymentStatus: 'paid',
        paymentMethod: selectedPayment,
        specialRequests: specialRequests.trim() || undefined,
      });

      setIsSubmitting(false);

      if (res.success && res.reservation) {
        setSuccessInfo({
          id: res.reservation.id,
          tableNumber: res.reservation.tableNumber,
          date: res.reservation.date,
          time: res.reservation.time,
          guests: res.reservation.guests,
          bookingFee: res.reservation.bookingFee,
          customerName: res.reservation.customerName,
          createdAt: res.reservation.createdAt || new Date().toISOString(),
        });
      } else {
        setErrorBanner(res.message || 'Table could not be booked. Please try another slot.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorBanner(err.message || 'Booking submission error.');
    }
  };

  const handleCancelBooking = async () => {
    if (!successInfo) return;
    const res = await cancelReservation(successInfo.id, 'User cancelled confirmation');
    if (res.success) {
      setSuccessInfo(null);
      setErrorBanner('Reservation was cancelled. You may select a new table.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6 pb-12"
    >
      {/* Top Breadcrumb */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Restaurant Details</span>
      </button>

      {/* Success State Screen */}
      {successInfo ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="app-card p-6 sm:p-8 border border-amber-500/40 shadow-xl text-center space-y-6"
        >
          <div className="flex justify-center">
            <DastnayLogo variant="tile" size="md" rounded="2xl" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Real Database Booking Confirmed</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100">
              Table Reservation Secured!
            </h2>
            <p className="text-xs text-stone-500">
              Your table is reserved at {restaurant.name} ({branch.name}).
            </p>
          </div>

          <div className="max-w-md mx-auto bg-stone-50 dark:bg-stone-800/60 rounded-xl p-5 border border-stone-200 dark:border-stone-700 text-left text-xs space-y-3 font-mono">
            <div className="flex justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
              <span className="text-stone-500 font-sans">Official Booking ID:</span>
              <span className="font-bold text-[#9A2D22] dark:text-[#FEE248] text-sm">
                {successInfo.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-sans">Reserved For:</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">{successInfo.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-sans">Table Assigned:</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">{successInfo.tableNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-sans">Date & Time:</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">
                {successInfo.date} at {successInfo.time}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-sans">Number of Guests:</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">{successInfo.guests} Persons</span>
            </div>
            <div className="flex justify-between text-amber-900 dark:text-amber-300 pt-2 border-t border-stone-200 dark:border-stone-700">
              <span className="font-sans">Prepaid Booking Deposit:</span>
              <span className="font-bold">Rs. {successInfo.bookingFee} (Adjustable in Bill)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 text-left flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 text-[#9A2D22] mt-0.5" />
            <div>
              <span className="font-bold">Arrival Policy & QR Table Ordering:</span>
              <p className="mt-0.5">
                Your table will be held for {branch.gracePeriodMinutes || 15} minutes after {successInfo.time}. Upon arrival, start your table session or scan the QR code on Table {successInfo.tableNumber} to order directly from the kitchen!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleCancelBooking}
              className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold cursor-pointer transition-colors"
            >
              Cancel Reservation
            </button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => onReservationComplete(successInfo.id)}
              className="px-6 py-2.5 rounded-xl bg-[#9A2D22] hover:bg-[#83241A] text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
            >
              Start Table Session & Browse Menu
            </motion.button>
          </div>
        </motion.div>
      ) : (
        /* Reservation Form */
        <div className="app-card p-5 sm:p-7 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9A2D22] dark:text-[#E5A324] bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                Live SQL Database Booking
              </span>
              <span className="text-xs text-stone-500">• Real-Time Capacity Verified</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Pre-Book Your Table at {restaurant.name}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {branch.name} • {branch.address}
            </p>
          </div>

          {errorBanner && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorBanner}</span>
            </div>
          )}

          {/* Step 1: Date, Time & Guests Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                1. Choose Date, Time & Guests
              </label>
              {isLoadingAvailability && (
                <span className="text-[11px] text-amber-700 dark:text-amber-400 animate-pulse font-medium">
                  Checking live slot availability...
                </span>
              )}
            </div>

            {/* Quick Date Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedDate(getTodayDateString())}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDate === getTodayDateString()
                    ? 'bg-[#9A2D22] text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(getTomorrowDateString())}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDate === getTomorrowDateString()
                    ? 'bg-[#9A2D22] text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(getDayAfterTomorrowString())}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDate === getDayAfterTomorrowString()
                    ? 'bg-[#9A2D22] text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                In 2 Days
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Custom Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="date"
                    min={getTodayDateString()}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-[#9A2D22]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Time Slot (PST)
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-[#9A2D22] cursor-pointer"
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
                <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Number of Guests
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-[#9A2D22] cursor-pointer"
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
          </div>

          {/* Step 2: Visual Table Floor Plan */}
          <div className="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                2. Select Table on Live Floor Plan
              </label>
              <span className="text-[11px] text-stone-500">
                {availableTableIds.length} tables free for {selectedTime}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {branchTables.map((table) => {
                const isSelected = selectedTableId === table.id;
                const isAvailable = availableTableIds.includes(table.id) && table.status !== 'dirty';
                const fitsGuests = table.capacity >= guestCount;

                return (
                  <button
                    key={table.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      setSelectedTableId(table.id);
                      setErrorBanner('');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                      isSelected
                        ? 'border-[#9A2D22] bg-amber-50 dark:bg-amber-950/60 ring-2 ring-[#9A2D22]/40 shadow-xs'
                        : isAvailable
                        ? fitsGuests
                          ? 'border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 hover:border-[#9A2D22]/50 hover:bg-white dark:hover:bg-stone-800'
                          : 'border-amber-200 dark:border-amber-900 bg-stone-50/30 opacity-75'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800/30 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs text-stone-900 dark:text-stone-100">
                        {table.tableNumber}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          isAvailable
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {isAvailable ? 'Available' : 'Booked'}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-600 dark:text-stone-400 font-medium truncate">
                      {table.section}
                    </p>

                    <div className="flex items-center gap-1 text-[10px] text-stone-500 mt-1">
                      <Users className="w-3 h-3" />
                      <span>Capacity: {table.capacity} Persons</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Customer Information */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-3">
            <label className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
              3. Guest Contact Information
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-[#9A2D22]"
                  required
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Pakistani Mobile (+92 300 1234567)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-[#9A2D22]"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-[#9A2D22]"
                  required
                />
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="Special requests (e.g. Birthday decor, high chair for infant, corner table)..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-[#9A2D22]"
              />
            </div>
          </div>

          {/* Step 4: Booking Fee & Pakistani Payment */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                4. Booking Deposit & Pakistani Wallet
              </label>
              <span className="font-extrabold text-sm text-[#9A2D22] dark:text-[#FEE248]">
                Rs. {bookingFee}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {[
                { id: 'jazzcash', name: 'JazzCash', desc: 'Instant Wallet' },
                { id: 'easypaisa', name: 'Easypaisa', desc: 'Direct Pay' },
                { id: 'card', name: 'Debit/Credit', desc: 'PayPak / Visa' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedPayment(m.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedPayment === m.id
                      ? 'border-[#9A2D22] bg-amber-50 dark:bg-amber-950/40 text-[#9A2D22] dark:text-[#FEE248] font-bold ring-1 ring-[#9A2D22]'
                      : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <span className="font-bold text-xs block">{m.name}</span>
                  <span className="text-[10px] text-stone-500 font-normal">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirmReservation}
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-[#9A2D22] hover:bg-[#83241A] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Confirming Reservation in Database...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-[#FEE248]" />
                <span>
                  Confirm & Pre-Pay Rs. {bookingFee} for {selectedTable?.tableNumber || 'Selected Table'}
                </span>
              </>
            )}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};
