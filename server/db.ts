import initSqlJs, { Database } from 'sql.js';
import {
  INITIAL_RESTAURANTS,
  INITIAL_BRANCHES,
  INITIAL_TABLES,
  INITIAL_MENU_ITEMS,
  INITIAL_INVENTORY,
  INITIAL_STAFF,
  INITIAL_RESERVATIONS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_PROMOTIONS,
  INITIAL_LOYALTY,
  INITIAL_AUDIT_LOGS,
} from '../src/data/seedData';

function safeRun(db: Database, sql: string, params: any[] = []) {
  const safeParams = params.map((p) => (p === undefined ? null : p));
  db.run(sql, safeParams);
}

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();
  const db = new SQL.Database();
  dbInstance = db;

  // Initialize all SQL schema tables
  db.run(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      tagline TEXT,
      cuisine TEXT, -- JSON array
      rating REAL DEFAULT 4.5,
      reviewCount INTEGER DEFAULT 0,
      priceRange TEXT,
      logo TEXT,
      coverImage TEXT,
      description TEXT,
      facilities TEXT, -- JSON array
      isApproved INTEGER DEFAULT 1,
      isSuspended INTEGER DEFAULT 0,
      commissionPercent REAL DEFAULT 5.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY,
      restaurantId TEXT NOT NULL,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      area TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      isOpen INTEGER DEFAULT 1,
      openingHours TEXT,
      closureReason TEXT,
      reservationFee INTEGER DEFAULT 300,
      gracePeriodMinutes INTEGER DEFAULT 15,
      cancellationDeadlineHours INTEGER DEFAULT 2,
      cancellationFee INTEGER DEFAULT 100,
      taxRatePercent REAL DEFAULT 13.0,
      serviceChargePercent REAL DEFAULT 5.0,
      kitchenPrinters TEXT, -- JSON array
      FOREIGN KEY (restaurantId) REFERENCES restaurants(id)
    );

    CREATE TABLE IF NOT EXISTS dining_tables (
      id TEXT PRIMARY KEY,
      branchId TEXT NOT NULL,
      restaurantId TEXT NOT NULL,
      tableNumber TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      section TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'available', -- 'available' | 'reserved' | 'occupied' | 'dirty'
      activeQrToken TEXT NOT NULL,
      currentSessionId TEXT,
      guestName TEXT,
      guestPhone TEXT,
      FOREIGN KEY (branchId) REFERENCES branches(id),
      FOREIGN KEY (restaurantId) REFERENCES restaurants(id)
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      restaurantId TEXT NOT NULL,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      nameUrdu TEXT NOT NULL,
      description TEXT,
      image TEXT,
      basePrice REAL NOT NULL,
      prepTimeMinutes INTEGER DEFAULT 15,
      isAvailableGlobal INTEGER DEFAULT 1,
      isPopular INTEGER DEFAULT 0,
      isSpicy INTEGER DEFAULT 0,
      variations TEXT, -- JSON array
      addons TEXT, -- JSON array
      lowStockThreshold INTEGER DEFAULT 5,
      FOREIGN KEY (restaurantId) REFERENCES restaurants(id)
    );

    CREATE TABLE IF NOT EXISTS branch_inventory (
      id TEXT PRIMARY KEY,
      branchId TEXT NOT NULL,
      restaurantId TEXT NOT NULL,
      menuItemId TEXT NOT NULL,
      stockQuantity INTEGER NOT NULL DEFAULT 50,
      isSoldOut INTEGER DEFAULT 0,
      isAvailableInBranch INTEGER DEFAULT 1,
      lowStockThreshold INTEGER DEFAULT 5,
      FOREIGN KEY (branchId) REFERENCES branches(id),
      FOREIGN KEY (menuItemId) REFERENCES menu_items(id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      restaurantId TEXT NOT NULL,
      branchId TEXT NOT NULL,
      tableId TEXT NOT NULL,
      tableNumber TEXT NOT NULL,
      customerName TEXT NOT NULL,
      customerPhone TEXT NOT NULL,
      customerEmail TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      guests INTEGER NOT NULL,
      bookingFee REAL DEFAULT 0,
      paymentStatus TEXT DEFAULT 'paid', -- 'paid' | 'pending' | 'refunded'
      paymentMethod TEXT DEFAULT 'jazzcash',
      status TEXT DEFAULT 'confirmed', -- 'confirmed' | 'checked_in' | 'cancelled' | 'no_show'
      cancellationReason TEXT,
      specialRequests TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (restaurantId) REFERENCES restaurants(id),
      FOREIGN KEY (branchId) REFERENCES branches(id),
      FOREIGN KEY (tableId) REFERENCES dining_tables(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      restaurantId TEXT NOT NULL,
      branchId TEXT NOT NULL,
      tableId TEXT,
      tableNumber TEXT,
      customerName TEXT NOT NULL,
      customerPhone TEXT NOT NULL,
      subtotal REAL NOT NULL,
      taxAmount REAL NOT NULL,
      serviceCharge REAL NOT NULL,
      discountAmount REAL DEFAULT 0,
      bookingFeeDeduction REAL DEFAULT 0,
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'received', -- 'received' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled'
      paymentMethod TEXT NOT NULL,
      paymentStatus TEXT NOT NULL DEFAULT 'unpaid', -- 'unpaid' | 'paid' | 'refunded'
      paymentId TEXT,
      transactionRef TEXT,
      items TEXT NOT NULL, -- JSON array of OrderItem
      prepStartedAt DATETIME,
      estimatedPrepMinutes INTEGER DEFAULT 20,
      expectedReadyAt DATETIME,
      refundReason TEXT,
      isReviewed INTEGER DEFAULT 0,
      pointsEarned INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (restaurantId) REFERENCES restaurants(id),
      FOREIGN KEY (branchId) REFERENCES branches(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      restaurantId TEXT NOT NULL,
      branchId TEXT NOT NULL,
      orderId TEXT,
      customerName TEXT NOT NULL,
      foodRating REAL NOT NULL,
      serviceRating REAL NOT NULL,
      staffRating REAL NOT NULL,
      overallRating REAL NOT NULL,
      comment TEXT NOT NULL,
      status TEXT DEFAULT 'published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (restaurantId) REFERENCES restaurants(id),
      FOREIGN KEY (branchId) REFERENCES branches(id)
    );

    CREATE TABLE IF NOT EXISTS promotions (
      id TEXT PRIMARY KEY,
      restaurantId TEXT,
      code TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      discountType TEXT NOT NULL, -- 'percentage' | 'fixed'
      discountValue REAL NOT NULL,
      minSpend REAL DEFAULT 0,
      maxDiscount REAL,
      validUntil TEXT,
      isActive INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      branchId TEXT NOT NULL,
      restaurantId TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'On Duty', -- 'On Duty' | 'Break' | 'Off Duty'
      assignedTables TEXT, -- JSON array
      clockInTime TEXT,
      FOREIGN KEY (branchId) REFERENCES branches(id)
    );

    CREATE TABLE IF NOT EXISTS loyalty_accounts (
      id TEXT PRIMARY KEY,
      customerId TEXT NOT NULL UNIQUE,
      customerName TEXT NOT NULL,
      customerPhone TEXT NOT NULL,
      pointsBalance INTEGER DEFAULT 0,
      totalEarned INTEGER DEFAULT 0,
      totalRedeemed INTEGER DEFAULT 0,
      tier TEXT DEFAULT 'Bronze'
    );

    CREATE TABLE IF NOT EXISTS loyalty_transactions (
      id TEXT PRIMARY KEY,
      customerId TEXT NOT NULL,
      type TEXT NOT NULL, -- 'earn' | 'redeem'
      points INTEGER NOT NULL,
      orderId TEXT,
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      userName TEXT NOT NULL,
      userRole TEXT NOT NULL,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entityId TEXT NOT NULL,
      previousValue TEXT,
      newValue TEXT,
      branchId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed data if empty
  const countRes = db.exec('SELECT COUNT(*) as count FROM restaurants');
  const count = countRes[0]?.values[0]?.[0] as number;

  if (count === 0) {
    console.log('Seeding SQL Database with initial Pakistani restaurants & menus...');

    // Seed restaurants
    for (const r of INITIAL_RESTAURANTS) {
      safeRun(
        db,
        `INSERT INTO restaurants (id, name, slug, tagline, cuisine, rating, reviewCount, priceRange, logo, coverImage, description, facilities, isApproved, isSuspended, commissionPercent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          r.id,
          r.name,
          r.slug,
          r.tagline || '',
          JSON.stringify(r.cuisine || []),
          r.rating || 4.5,
          r.reviewCount || 0,
          r.priceRange || 'PKR PKR',
          r.logo || '',
          r.coverImage || '',
          r.description || '',
          JSON.stringify(r.facilities || []),
          r.isApproved ? 1 : 0,
          r.isSuspended ? 1 : 0,
          r.commissionPercent || 5.0,
        ]
      );
    }

    // Seed branches
    for (const b of INITIAL_BRANCHES) {
      safeRun(
        db,
        `INSERT INTO branches (id, restaurantId, name, city, area, address, phone, email, isOpen, openingHours, reservationFee, gracePeriodMinutes, cancellationDeadlineHours, cancellationFee, taxRatePercent, serviceChargePercent, kitchenPrinters)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          b.id,
          b.restaurantId,
          b.name,
          b.city,
          b.area,
          b.address,
          b.phone || '',
          b.email || '',
          b.isOpen ? 1 : 0,
          b.openingHours || '12:00 PM – 12:00 AM',
          b.reservationFee || 300,
          b.gracePeriodMinutes || 15,
          b.cancellationDeadlineHours || 2,
          b.cancellationFee || 100,
          b.taxRatePercent || 13,
          b.serviceChargePercent || 5,
          JSON.stringify(b.kitchenPrinters || []),
        ]
      );
    }

    // Seed dining tables
    for (const t of INITIAL_TABLES) {
      safeRun(
        db,
        `INSERT INTO dining_tables (id, branchId, restaurantId, tableNumber, capacity, section, status, activeQrToken, currentSessionId, guestName, guestPhone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          t.id,
          t.branchId || 'br-kolachi-dha',
          t.restaurantId || 'rest-kolachi',
          t.tableNumber,
          t.capacity || 4,
          t.section || 'Main Dining',
          t.status || 'available',
          t.activeQrToken || t.qrCodeToken || `DST-QR-${t.id}`,
          t.currentSessionId || null,
          t.guestName || null,
          t.guestPhone || null,
        ]
      );
    }

    // Seed menu items
    for (const m of INITIAL_MENU_ITEMS) {
      safeRun(
        db,
        `INSERT INTO menu_items (id, restaurantId, category, name, nameUrdu, description, image, basePrice, prepTimeMinutes, isAvailableGlobal, isPopular, isSpicy, variations, addons, lowStockThreshold)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          m.id,
          m.restaurantId,
          m.category,
          m.name,
          m.nameUrdu || m.name,
          m.description || '',
          m.image || '',
          m.basePrice || 0,
          m.prepTimeMinutes || 15,
          m.isAvailableGlobal ? 1 : 0,
          m.isPopular ? 1 : 0,
          m.isSpicy ? 1 : 0,
          JSON.stringify(m.variations || []),
          JSON.stringify(m.addons || []),
          m.lowStockThreshold || 5,
        ]
      );
    }

    // Seed branch inventory
    for (const inv of INITIAL_INVENTORY) {
      const invId = `inv-${inv.branchId}-${inv.menuItemId}`;
      const restId = inv.branchId.startsWith('br-howdy') ? 'rest-howdy' : 'rest-kolachi';
      safeRun(
        db,
        `INSERT INTO branch_inventory (id, branchId, restaurantId, menuItemId, stockQuantity, isSoldOut, isAvailableInBranch, lowStockThreshold)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          invId,
          inv.branchId,
          restId,
          inv.menuItemId,
          inv.stockQuantity || 0,
          inv.stockQuantity <= 0 ? 1 : 0,
          inv.isAvailableAtBranch ? 1 : 0,
          inv.lowStockThreshold || 5,
        ]
      );
    }

    // Seed staff
    for (const s of INITIAL_STAFF) {
      safeRun(
        db,
        `INSERT INTO staff (id, branchId, restaurantId, name, phone, role, status, assignedTables, clockInTime)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          s.id,
          s.branchId || 'br-kolachi-dha',
          s.restaurantId || 'rest-kolachi',
          s.name,
          s.phone || '',
          s.role,
          s.status,
          JSON.stringify(s.assignedTables || []),
          s.clockInTime || null,
        ]
      );
    }

    // Seed reservations with dynamically generated today/tomorrow dates
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    for (const res of INITIAL_RESERVATIONS) {
      safeRun(
        db,
        `INSERT INTO bookings (id, restaurantId, branchId, tableId, tableNumber, customerName, customerPhone, customerEmail, date, time, guests, bookingFee, paymentStatus, paymentMethod, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          res.id,
          res.restaurantId || 'rest-kolachi',
          res.branchId || 'br-kolachi-dha',
          res.tableId,
          res.tableNumber,
          res.customerName,
          res.customerPhone,
          res.customerEmail || null,
          todayStr,
          res.time,
          res.guests || 2,
          res.bookingFee || 300,
          res.paymentStatus || 'paid',
          'jazzcash',
          res.status || 'confirmed',
          new Date().toISOString(),
        ]
      );
    }

    // Seed initial orders
    for (const ord of INITIAL_ORDERS) {
      safeRun(
        db,
        `INSERT INTO orders (id, restaurantId, branchId, tableId, tableNumber, customerName, customerPhone, subtotal, taxAmount, serviceCharge, discountAmount, bookingFeeDeduction, total, status, paymentMethod, paymentStatus, paymentId, transactionRef, items, prepStartedAt, estimatedPrepMinutes, expectedReadyAt, pointsEarned, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ord.id,
          ord.restaurantId,
          ord.branchId,
          ord.tableId || null,
          ord.tableNumber || null,
          ord.customerName || 'Customer',
          ord.customerPhone || '+92 300 0000000',
          ord.subtotal || 0,
          ord.taxAmount || 0,
          ord.serviceCharge || 0,
          ord.discountAmount || 0,
          ord.bookingFeeDeduction || 0,
          ord.total || 0,
          ord.status || 'received',
          ord.paymentMethod || 'cash',
          ord.paymentStatus || 'paid',
          ord.paymentId || null,
          ord.transactionRef || null,
          JSON.stringify(ord.items || []),
          ord.prepStartedAt || null,
          ord.estimatedPrepMinutes || 20,
          ord.expectedReadyAt || null,
          ord.pointsEarned || 0,
          ord.createdAt || new Date().toISOString(),
        ]
      );
    }

    // Seed reviews
    for (const rev of INITIAL_REVIEWS) {
      safeRun(
        db,
        `INSERT INTO reviews (id, restaurantId, branchId, orderId, customerName, foodRating, serviceRating, staffRating, overallRating, comment, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rev.id,
          rev.restaurantId,
          rev.branchId,
          rev.orderId || null,
          rev.customerName,
          rev.foodRating || 5,
          rev.serviceRating || 5,
          rev.staffRating || 5,
          rev.overallRating || 5,
          rev.comment || '',
          rev.status || 'published',
          rev.createdAt || new Date().toISOString(),
        ]
      );
    }

    // Seed promotions
    for (const p of INITIAL_PROMOTIONS) {
      safeRun(
        db,
        `INSERT INTO promotions (id, restaurantId, code, title, description, discountType, discountValue, minSpend, maxDiscount, validUntil, isActive)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id,
          p.restaurantId || null,
          p.code,
          p.title,
          p.description || '',
          p.discountType || 'percentage',
          p.discountValue || 10,
          p.minSpend || 0,
          p.maxDiscount || null,
          p.validUntil || '2026-12-31',
          p.isActive ? 1 : 0,
        ]
      );
    }

    // Seed loyalty
    safeRun(
      db,
      `INSERT INTO loyalty_accounts (id, customerId, customerName, customerPhone, pointsBalance, totalEarned, totalRedeemed, tier)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'loyalty-1',
        INITIAL_LOYALTY.customerId,
        'Hamza Ali',
        '+92 300 8291029',
        INITIAL_LOYALTY.pointsBalance || 0,
        INITIAL_LOYALTY.totalEarned || 0,
        INITIAL_LOYALTY.totalRedeemed || 0,
        INITIAL_LOYALTY.tier || 'Bronze',
      ]
    );

    safeRun(
      db,
      `INSERT INTO loyalty_transactions (id, customerId, type, points, orderId, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'ltx-1',
        INITIAL_LOYALTY.customerId,
        'earn',
        398,
        'DST-ORD-9101',
        'Points earned on Kolachi DHA order',
        '2026-08-14 07:45 PM',
      ]
    );

    // Seed audit logs
    for (const a of INITIAL_AUDIT_LOGS) {
      safeRun(
        db,
        `INSERT INTO audit_logs (id, userName, userRole, action, entity, entityId, previousValue, newValue, branchId, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          a.id,
          a.userName || 'System',
          a.userRole || 'Admin',
          a.action,
          a.entity,
          a.entityId,
          a.previousValue || null,
          a.newValue || null,
          a.branchId || null,
          a.timestamp || new Date().toISOString(),
        ]
      );
    }

    console.log('SQL Database initialized and seeded successfully.');
  }

  return db;
}
