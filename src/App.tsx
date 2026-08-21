import React, { useState } from 'react';
import { DastanayProvider, useDastanay } from './context/DastanayContext';
import { Header } from './components/common/Header';
import { ThermalReceiptModal } from './components/common/ThermalReceiptModal';
import { QRScannerModal } from './components/common/QRScannerModal';
import { CustomerApp } from './components/customer/CustomerApp';
import { ManagerPortal } from './components/manager/ManagerPortal';
import { KitchenKDS } from './components/kitchen/KitchenKDS';
import { AdminPortal } from './components/admin/AdminPortal';
import { DastnayLogo } from './components/common/DastnayLogo';
import { motion, AnimatePresence } from 'motion/react';

const AppContent: React.FC = () => {
  const { role } = useDastanay();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200 flex flex-col font-sans">
      {/* Global Responsive Navigation Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenQRScanner={() => setIsQRScannerOpen(true)}
      />

      {/* Main Role-Specific Workspace with animated page transition */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden py-2 sm:py-4">
        <AnimatePresence mode="wait">
          {role === 'customer' && (
            <motion.div
              key="customer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <CustomerApp
                isCartOpen={isCartOpen}
                onOpenCart={() => setIsCartOpen(true)}
                onCloseCart={() => setIsCartOpen(false)}
                isQRScannerOpen={isQRScannerOpen}
                onCloseQRScanner={() => setIsQRScannerOpen(false)}
                onOpenQRScanner={() => setIsQRScannerOpen(true)}
              />
            </motion.div>
          )}

          {role === 'manager' && (
            <motion.div
              key="manager"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <ManagerPortal />
            </motion.div>
          )}

          {role === 'kitchen' && (
            <motion.div
              key="kitchen"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <KitchenKDS />
            </motion.div>
          )}

          {role === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <AdminPortal />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 80mm Thermal Receipt / KOT Printer Modal */}
      <ThermalReceiptModal />

      {/* Global QR Code Table Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
      />

      {/* Clean, minimalist footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/70 backdrop-blur-xs py-6 mt-12 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <DastnayLogo size="sm" />

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-stone-500 dark:text-stone-400">
            <span className="app-pill">PKR (Rs.)</span>
            <span className="app-pill">JazzCash • Easypaisa • Raast</span>
            <span className="app-pill">FBR / SRB Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <DastanayProvider>
      <AppContent />
    </DastanayProvider>
  );
}
