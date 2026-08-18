import React, { useState } from 'react';
import { useDastanay } from '../../context/DastanayContext';
import { QrCode, X, CheckCircle, Smartphone, Search, AlertCircle } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionStarted?: (tableNum: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onSessionStarted }) => {
  const { tables, currentBranchId, startTableSession, reservations } = useDastanay();
  const [activeTab, setActiveTab] = useState<'qr' | 'manual' | 'reservation'>('qr');
  const [manualTable, setManualTable] = useState('');
  const [reservationCode, setReservationCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleStartWithTable = (tableNumber: string, resId?: string) => {
    setErrorMsg('');
    const res = startTableSession(tableNumber, resId);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setSuccessMsg('');
        if (onSessionStarted) onSessionStarted(tableNumber);
        onClose();
      }, 1000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleReservationVerify = () => {
    setErrorMsg('');
    const matchingRes = reservations.find(
      (r) => r.id.toLowerCase() === reservationCode.trim().toLowerCase() && r.status === 'confirmed'
    );
    if (!matchingRes) {
      setErrorMsg('Active reservation code not found or already checked-in.');
      return;
    }
    handleStartWithTable(matchingRes.tableNumber, matchingRes.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Table Session Activation</h3>
              <p className="text-xs text-zinc-500">Scan physical QR or select table to order</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-5 pt-4 flex gap-2 border-b border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => { setActiveTab('qr'); setErrorMsg(''); }}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'qr'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Camera QR Scan
          </button>
          <button
            onClick={() => { setActiveTab('reservation'); setErrorMsg(''); }}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'reservation'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Reservation ID
          </button>
          <button
            onClick={() => { setActiveTab('manual'); setErrorMsg(''); }}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Pick Table #
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="text-center py-2 space-y-3">
              {/* Simulated Camera Viewfinder */}
              <div className="relative mx-auto w-56 h-56 bg-zinc-950 rounded-2xl border-2 border-emerald-500 flex flex-col items-center justify-center overflow-hidden shadow-inner">
                {/* Laser scan line */}
                <div className="absolute inset-x-0 h-0.5 bg-emerald-400 animate-pulse top-1/2 -translate-y-1/2 shadow-[0_0_8px_#34d399]"></div>

                <div className="w-36 h-36 border border-dashed border-emerald-400/60 rounded-xl flex items-center justify-center p-3">
                  <QrCode className="w-20 h-20 text-emerald-400/80 animate-pulse" />
                </div>
                <span className="text-[10px] text-zinc-400 font-mono mt-2">Point at Table QR Code</span>
              </div>

              <div className="pt-2">
                <span className="text-xs text-zinc-500">Quick Test: Tap an active QR sticker on your table:</span>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {tables.slice(0, 4).map((tbl) => (
                    <button
                      key={tbl.id}
                      onClick={() => handleStartWithTable(tbl.tableNumber)}
                      className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700"
                    >
                      {tbl.tableNumber}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reservation' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Enter Your Reservation ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. DST-RES-7821"
                    value={reservationCode}
                    onChange={(e) => setReservationCode(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 uppercase font-mono tracking-wider focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    onClick={handleReservationVerify}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Check In
                  </button>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs space-y-1">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Active booked reservations:</span>
                {reservations.filter((r) => r.status === 'confirmed').map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleStartWithTable(r.tableNumber, r.id)}
                    className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer border border-zinc-200/60 dark:border-zinc-700"
                  >
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{r.id}</span>
                    <span className="text-zinc-600 dark:text-zinc-400">{r.tableNumber} • {r.customerName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Select from Branch Tables:
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto">
                {tables.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleStartWithTable(t.tableNumber)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      t.status === 'occupied'
                        ? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20'
                        : t.status === 'out_of_service'
                        ? 'opacity-40 border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 bg-white dark:bg-zinc-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{t.tableNumber}</span>
                      <span className="text-[10px] uppercase font-bold text-zinc-500">{t.status}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">{t.section} • {t.capacity} seats</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
