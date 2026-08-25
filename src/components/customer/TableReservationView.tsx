import React, { useState, useEffect, useMemo } from 'react';
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
  Zap,
  Check,
} from 'lucide-react';
import { motion } from 'motion/react';

interface TableReservationViewProps {
  restaurant: Restaurant;
  branch: Branch;
  onBack: () => void;
  onReservationComplete: (reservationId: string) => void;
}

// Generate full day 30-minute interval slots from 12:00 PM to 11:30 PM
const ALL_TIME_SLOTS = [
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
  '07:00 PM',
  '07:30 PM',
  '08:00 PM',
  '08:30 PM',
  '09:00 PM',
  '09:30 PM',
  '10:00 PM',
  '10:30 PM',
  '11:00 PM',
  '11:30 PM',
];

export const TableReservationView: React.FC<TableReservationViewProps> = ({
  restaurant,
  branch,
  onBack,
  onReservationComplete,
}) => {
  const { tables, createReservation, startTableSession, language, cancelReservation } = useDastanay();
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

  // Helper to get next upcoming slot based on real-time clock
  const getSmartRealTimeSlot = (dateStr: string): string => {
    const now = new Date();
    const todayStr = getTodayDateString();

    if (dateStr === todayStr) {
      // Advance by 20 minutes to give guest buffer, round to next 30 min block
      const target = new Date(now.getTime() + 20 * 60 * 1000);
      let hr = target.getHours();
      const mins = target.getMinutes();
      let roundedMins = '00';
      if (mins > 0 && mins <= 30) {
        roundedMins = '30';
      } else if (mins > 30) {
        hr += 1;
        roundedMins = '00';
      }

      if (hr < 12) return '12:30 PM';
      if (hr >= 23 && mins > 30) return '11:30 PM';

      const ampm = hr >= 12 ? 'PM' : 'AM';
      const displayHr = hr % 12 || 12;
      return `${String(displayHr).padStart(2, '0')}:${roundedMins} ${ampm}`;
    }

    return '08:00 PM';
  };

  // Live real-time clock
  const [liveClock, setLiveClock] = useState<string>(() =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveClock(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedTime, setSelectedTime] = useState<string>(() => getSmartRealTimeSlot(getTodayDateString()));
  const [selectedTableId, setSelectedTableId] = useState<string>('');
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

  // Sync to real-time clock handler
  const handleSyncRealTime = () => {
    const today = getTodayDateString();
    setSelectedDate(today);
    const nextSlot = getSmartRealTimeSlot(today);
    setSelectedTime(nextSlot);
  };

  // Branch tables with guaranteed fallback so tables are never empty
  const branchTables = useMemo(() => {
    const exact = tables.filter((t) => t.branchId === branch.id);
    if (exact.length > 0) return exact;
    const restMatch = tables.filter((t) => t.restaurantId === branch.restaurantId);
    if (restMatch.length > 0) return restMatch;
    return tables;
  }, [tables, branch.id, branch.restaurantId]);

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
          if (!availIds.includes(selectedTableId) || !selectedTableId) {
            const firstSuitable = data.suitableTables?.[0]?.id || availIds[0] || branchTables[0]?.id || '';
            setSelectedTableId(firstSuitable);
          }
        }
      } catch (err) {
        console.warn('Availability check fallback:', err);
        // Fallback available table IDs
        if (isMounted) {
          const defaultAvail = branchTables
            .filter((t) => t.status !== 'occupied' && t.status !== 'dirty' && t.status !== 'out_of_service')
            .map((t) => t.id);
          setAvailableTableIds(defaultAvail);
        }
      } finally {
        if (isMounted) setIsLoadingAvailability(false);
      }
    };

    checkAvailability();
    return () => {
      isMounted = false;
    };
  }, [branch.id, selectedDate, selectedTime, guestCount, branchTables, selectedTableId]);

  // Auto-select table if none currently selected
  useEffect(() => {
    if (!selectedTableId && branchTables.length > 0) {
      const first =
        branchTables.find(
          (t) =>
            (availableTableIds.length === 0 || availableTableIds.includes(t.id)) &&
            t.status !== 'occupied' &&
            t.status !== 'dirty' &&
            t.capacity >= guestCount
        ) ||
        branchTables.find((t) => t.status !== 'occupied') ||
        branchTables[0];
      if (first) setSelectedTableId(first.id);
    }
  }, [branchTables, selectedTableId, availableTableIds, guestCount]);

  const selectedTable = branchTables.find((tbl) => tbl.id === selectedTableId) || branchTables[0];
  const bookingFee = branch.reservationFee || 300;

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner('');

    if (!selectedTable) {
      setErrorBanner('Please select an available table from the floor plan.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorBanner('Please enter your full name and Pakistani contact number.');
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
        // Auto activate table session in context
        startTableSession(res.reservation.tableNumber, res.reservation.id, branch.id);

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
        setErrorBanner(res.message || 'Table could not be booked. Please choose another time slot.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorBanner(err.message || 'Booking submission failed.');
    }
  };

  const handleCancelBooking = async () => {
    if (!successInfo) return;
    const res = await cancelReservation(successInfo.id, 'User cancelled confirmation');
    if (res.success) {
      setSuccessInfo(null);
      setErrorBanner('Reservation was cancelled. You may select another table.');
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
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="app-card p-6 sm:p-8 text-center space-y-6 max-w-xl mx-auto border-emerald-500/30"
        >
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Table Confirmed & Session Active
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#202124] dark:text-stone-100 pt-2">
              Reservation #{successInfo.id}
            </h2>
            <p className="text-xs text-[#687078]">
              Your table at <span className="font-semibold text-stone-800 dark:text-stone-200">{restaurant.name} ({branch.name})</span> is locked in!
            </p>
          </div>

          {/* Ticket Info Card */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-left text-xs space-y-2.5">
            <div className="flex justify-between">
              <span className="text-[#687078] font-sans">Reserved For:</span>
              <span className="font-bold text-[#202124] dark:text-stone-100">{successInfo.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#687078] font-sans">Table Assigned:</span>
              <span className="font-bold text-[#202124] dark:text-stone-100">{successInfo.tableNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#687078] font-sans">Date & Time:</span>
              <span className="font-bold text-[#202124] dark:text-stone-100">
                {successInfo.date} at {successInfo.time}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#687078] font-sans">Number of Guests:</span>
              <span className="font-bold text-[#202124] dark:text-stone-100">{successInfo.guests} Persons</span>
            </div>
            <div className="flex justify-between text-[#22336F] dark:text-[#E8ECFB] pt-2 border-t border-stone-200 dark:border-stone-700">
              <span className="font-sans">Prepaid Booking Deposit:</span>
              <span className="font-bold">Rs. {successInfo.bookingFee} (Adjustable in Bill)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F3F5FD] dark:bg-[#22336F]/40 border border-[#E8ECFB] dark:border-[#364FAB]/30 text-xs text-[#22336F] dark:text-[#E8ECFB] text-left flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 text-[#364FAB] mt-0.5" />
            <div>
              <span className="font-bold">Arrival Policy & QR Table Ordering:</span>
              <p className="mt-0.5">
                Your table will be held for {branch.gracePeriodMinutes || 15} minutes after {successInfo.time}. Your table session is ready — browse the menu and start ordering dishes directly to the kitchen!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleCancelBooking}
              className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-[#687078] hover:bg-[#F3F5FD] dark:hover:bg-stone-800 text-xs font-bold cursor-pointer transition-colors"
            >
              Cancel Reservation
            </button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => onReservationComplete(successInfo.id)}
              className="px-6 py-2.5 rounded-xl bg-[#364FAB] hover:bg-[#2D428F] text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
            >
              Start Ordering & Browse Menu
            </motion.button>
          </div>
        </motion.div>
      ) : (
        /* Reservation Form */
        <div className="app-card p-5 sm:p-7 space-y-6">
          {/* Header & Live Real-Time Clock Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#364FAB] dark:text-[#E8ECFB] bg-[#E8ECFB] dark:bg-[#22336F]/60 px-2 py-0.5 rounded">
                  Live Table Booking
                </span>
                <span className="text-xs text-[#687078]">• Real-Time Capacity Sync</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202124] dark:text-stone-100">
                Pre-Book Your Table at {restaurant.name}
              </h2>
              <p className="text-xs text-[#687078] mt-0.5">
                {branch.name} • {branch.address}
              </p>
            </div>

            {/* Live Real-Time Clock & 1-Click Sync */}
            <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 px-3 py-2 rounded-xl shrink-0">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400">
                  Live System Time
                </div>
                <div className="text-xs font-mono font-black text-stone-900 dark:text-stone-100">
                  {liveClock}
                </div>
              </div>
              <button
                type="button"
                onClick={handleSyncRealTime}
                className="ml-2 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#364FAB] hover:bg-[#2D428F] text-white text-[11px] font-bold shadow-2xs cursor-pointer transition-all"
                title="Sync with current real time and select upcoming slot"
              >
                <Zap className="w-3 h-3" />
                <span>Sync Now</span>
              </button>
            </div>
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
              <label className="text-xs font-bold text-[#202124] dark:text-stone-200 uppercase tracking-wider">
                1. Choose Date, Time & Guests
              </label>
              {isLoadingAvailability && (
                <span className="text-[11px] text-[#364FAB] dark:text-[#E8ECFB] animate-pulse font-medium">
                  Checking live slot availability...
                </span>
              )}
            </div>

            {/* Quick Date Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const today = getTodayDateString();
                  setSelectedDate(today);
                  setSelectedTime(getSmartRealTimeSlot(today));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDate === getTodayDateString()
                    ? 'bg-[#364FAB] text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                Today ({getTodayDateString()})
              </button>
              <button
                type="button"
                onClick={() => {
                  const tmrw = getTomorrowDateString();
                  setSelectedDate(tmrw);
                  setSelectedTime('08:00 PM');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDate === getTomorrowDateString()
                    ? 'bg-[#364FAB] text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => {
                  const in2 = getDayAfterTomorrowString();
                  setSelectedDate(in2);
                  setSelectedTime('08:00 PM');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDate === getDayAfterTomorrowString()
                    ? 'bg-[#364FAB] text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                In 2 Days
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Selected Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="date"
                    min={getTodayDateString()}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime(getSmartRealTimeSlot(e.target.value));
                    }}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-[#364FAB]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Time Slot (Real-Time Synced)
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-[#364FAB] cursor-pointer"
                  >
                    {ALL_TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot} {slot === selectedTime ? '• (Selected)' : ''}
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
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-[#364FAB] cursor-pointer"
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
              <label className="text-xs font-bold text-[#202124] dark:text-stone-200 uppercase tracking-wider">
                2. Select Table on Floor Plan ({branchTables.length} tables at this branch)
              </label>
              <span className="text-[11px] text-[#687078]">
                {availableTableIds.length > 0 ? `${availableTableIds.length} tables available` : 'All tables ready'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {branchTables.map((table) => {
                const isSelected = selectedTableId === table.id;
                const isAvailable =
                  availableTableIds.length > 0
                    ? availableTableIds.includes(table.id) && table.status !== 'dirty' && table.status !== 'out_of_service'
                    : table.status !== 'occupied' && table.status !== 'dirty' && table.status !== 'out_of_service';
                const fitsGuests = table.capacity >= guestCount;

                return (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => {
                      setSelectedTableId(table.id);
                      setErrorBanner('');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                      isSelected
                        ? 'border-[#364FAB] bg-[#F3F5FD] dark:bg-[#22336F]/60 ring-2 ring-[#364FAB]/40 shadow-xs'
                        : isAvailable
                        ? fitsGuests
                          ? 'border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 hover:border-[#364FAB]/50 hover:bg-white dark:hover:bg-stone-800'
                          : 'border-[#E8ECFB] dark:border-[#22336F]/40 bg-stone-50/30 hover:border-[#364FAB]/40'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs text-[#202124] dark:text-stone-100">
                        {table.tableNumber}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-[#364FAB] text-white'
                            : isAvailable
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {isSelected ? 'Selected' : isAvailable ? 'Available' : 'Busy'}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-600 dark:text-stone-400 font-medium truncate">
                      {table.section}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-stone-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>Seats {table.capacity}</span>
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#364FAB] dark:text-[#E8ECFB]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedTable && (
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-800 dark:text-stone-200">
                    Selected: {selectedTable.tableNumber} ({selectedTable.section})
                  </span>
                  <span className="text-stone-500">• Capacity: {selectedTable.capacity} guests</span>
                </div>
                <span className="text-[11px] font-bold text-[#364FAB] dark:text-[#E8ECFB]">
                  Deposit: Rs. {bookingFee}
                </span>
              </div>
            )}
          </div>

          {/* Step 3: Customer Information */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-3">
            <label className="text-xs font-bold text-[#202124] dark:text-stone-200 uppercase tracking-wider">
              3. Guest Contact Information
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-[#364FAB]"
                  required
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Pakistani Mobile (+92 300 1234567)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-[#364FAB]"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-[#364FAB]"
                  required
                />
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="Special requests (e.g. Birthday decor, high chair for infant, corner sea-view table)..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-[#364FAB]"
              />
            </div>
          </div>

          {/* Step 4: Booking Fee & Pakistani Payment */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#202124] dark:text-stone-200 uppercase tracking-wider">
                4. Reservation Fee & Payment Method
              </label>
              <span className="text-xs font-extrabold text-[#364FAB] dark:text-[#E8ECFB]">
                Rs. {bookingFee} (Adjusted in final food bill)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setSelectedPayment('jazzcash')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedPayment === 'jazzcash'
                    ? 'border-red-600 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 ring-2 ring-red-400'
                    : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                <div className="font-extrabold text-xs text-red-600 dark:text-red-400">JazzCash</div>
                <div className="text-[10px] text-stone-500 mt-0.5">Direct Mobile Wallet</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPayment('easypaisa')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedPayment === 'easypaisa'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-400'
                    : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                <div className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">Easypaisa</div>
                <div className="text-[10px] text-stone-500 mt-0.5">Telenor Microfinance</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPayment('card')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedPayment === 'card'
                    ? 'border-[#364FAB] bg-[#F3F5FD] dark:bg-[#22336F]/40 text-[#364FAB] dark:text-[#E8ECFB] ring-2 ring-[#364FAB]/40'
                    : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                <div className="font-extrabold text-xs text-[#364FAB] dark:text-[#E8ECFB]">PayPak / Visa</div>
                <div className="text-[10px] text-stone-500 mt-0.5">Debit / Credit Card</div>
              </button>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-stone-500 text-center sm:text-left">
              🔒 Instant Confirmation • Table held for {branch.gracePeriodMinutes || 15} minutes
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmReservation}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#364FAB] hover:bg-[#2D428F] disabled:opacity-50 text-white font-bold text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Locking In Table...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Table & Pay Rs. {bookingFee}</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
