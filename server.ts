import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getDb } from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Initialize SQLite Database
  const db = await getDb();

  // Helper to run modifications safely
  function safeRun(sql: string, params: any[] = []) {
    const safeParams = params.map((p) => (p === undefined ? null : p));
    db.run(sql, safeParams);
  }

  // Helper to run SELECT queries returning objects
  function queryAll(sql: string, params: any[] = []): any[] {
    const stmt = db.prepare(sql);
    const safeParams = params.map((p) => (p === undefined ? null : p));
    if (safeParams.length > 0) stmt.bind(safeParams);
    const results: any[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  function queryOne(sql: string, params: any[] = []): any | null {
    const rows = queryAll(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  // ----------------------------------------------------
  // REST API ROUTES
  // ----------------------------------------------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 1. Restaurants API
  app.get('/api/restaurants', (req, res) => {
    try {
      const rows = queryAll('SELECT * FROM restaurants ORDER BY rating DESC');
      const restaurants = rows.map((r) => ({
        ...r,
        cuisine: JSON.parse(r.cuisine || '[]'),
        facilities: JSON.parse(r.facilities || '[]'),
        isApproved: Boolean(r.isApproved),
        isSuspended: Boolean(r.isSuspended),
      }));
      res.json(restaurants);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/restaurants', (req, res) => {
    try {
      const { name, tagline, cuisine, priceRange, coverImage, description, facilities } = req.body;
      if (!name) return res.status(400).json({ error: 'Restaurant name is required' });

      const id = `rest-${Date.now()}`;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      db.run(
        `INSERT INTO restaurants (id, name, slug, tagline, cuisine, rating, reviewCount, priceRange, logo, coverImage, description, facilities, isApproved, isSuspended, commissionPercent)
         VALUES (?, ?, ?, ?, ?, 4.5, 0, ?, ?, ?, ?, ?, 1, 0, 5.0)`,
        [
          id,
          name,
          slug,
          tagline || '',
          JSON.stringify(cuisine || ['Pakistani']),
          priceRange || 'PKR PKR',
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
          coverImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
          description || '',
          JSON.stringify(facilities || ['Air Conditioned', 'Halal']),
        ]
      );

      const created = queryOne('SELECT * FROM restaurants WHERE id = ?', [id]);
      res.status(201).json({
        ...created,
        cuisine: JSON.parse(created.cuisine || '[]'),
        facilities: JSON.parse(created.facilities || '[]'),
        isApproved: Boolean(created.isApproved),
        isSuspended: Boolean(created.isSuspended),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Branches API
  app.get('/api/branches', (req, res) => {
    try {
      const { restaurantId, city } = req.query;
      let sql = 'SELECT * FROM branches WHERE 1=1';
      const params: any[] = [];

      if (restaurantId) {
        sql += ' AND restaurantId = ?';
        params.push(restaurantId);
      }
      if (city && city !== 'All') {
        sql += ' AND city = ?';
        params.push(city);
      }

      const rows = queryAll(sql, params);
      const branches = rows.map((b) => ({
        ...b,
        isOpen: Boolean(b.isOpen),
        kitchenPrinters: JSON.parse(b.kitchenPrinters || '[]'),
      }));
      res.json(branches);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/branches/:id/status', (req, res) => {
    try {
      const { id } = req.params;
      const { isOpen, closureReason } = req.body;
      db.run('UPDATE branches SET isOpen = ?, closureReason = ? WHERE id = ?', [
        isOpen ? 1 : 0,
        closureReason || null,
        id,
      ]);
      const updated = queryOne('SELECT * FROM branches WHERE id = ?', [id]);
      res.json({
        ...updated,
        isOpen: Boolean(updated.isOpen),
        kitchenPrinters: JSON.parse(updated.kitchenPrinters || '[]'),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Dining Tables API
  app.get('/api/tables', (req, res) => {
    try {
      const { branchId } = req.query;
      let sql = 'SELECT * FROM dining_tables';
      const params: any[] = [];

      if (branchId) {
        sql += ' WHERE branchId = ?';
        params.push(branchId);
      }
      sql += ' ORDER BY tableNumber ASC';

      const rows = queryAll(sql, params);
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/tables/:id/status', (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!['available', 'reserved', 'occupied', 'dirty'].includes(status)) {
        return res.status(400).json({ error: 'Invalid table status' });
      }
      db.run('UPDATE dining_tables SET status = ? WHERE id = ?', [status, id]);
      const updated = queryOne('SELECT * FROM dining_tables WHERE id = ?', [id]);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tables/:id/regenerate-qr', (req, res) => {
    try {
      const { id } = req.params;
      const newToken = `DST-QR-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      db.run('UPDATE dining_tables SET activeQrToken = ? WHERE id = ?', [newToken, id]);
      const updated = queryOne('SELECT * FROM dining_tables WHERE id = ?', [id]);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Live Menu API
  app.get('/api/menu', (req, res) => {
    try {
      const { restaurantId, category } = req.query;
      let sql = 'SELECT * FROM menu_items WHERE isAvailableGlobal = 1';
      const params: any[] = [];

      if (restaurantId) {
        sql += ' AND restaurantId = ?';
        params.push(restaurantId);
      }
      if (category && category !== 'All') {
        sql += ' AND category = ?';
        params.push(category);
      }

      const rows = queryAll(sql, params);
      const items = rows.map((m) => ({
        ...m,
        isAvailableGlobal: Boolean(m.isAvailableGlobal),
        isPopular: Boolean(m.isPopular),
        isSpicy: Boolean(m.isSpicy),
        variations: JSON.parse(m.variations || '[]'),
        addons: JSON.parse(m.addons || '[]'),
      }));
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/menu', (req, res) => {
    try {
      const { restaurantId, category, name, nameUrdu, description, image, basePrice, prepTimeMinutes, variations, addons } = req.body;
      if (!restaurantId || !name || !basePrice) {
        return res.status(400).json({ error: 'restaurantId, name, and basePrice are required' });
      }

      const id = `dish-${Date.now()}`;
      db.run(
        `INSERT INTO menu_items (id, restaurantId, category, name, nameUrdu, description, image, basePrice, prepTimeMinutes, isAvailableGlobal, isPopular, isSpicy, variations, addons, lowStockThreshold)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0, ?, ?, 5)`,
        [
          id,
          restaurantId,
          category || 'Main Course',
          name,
          nameUrdu || name,
          description || '',
          image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
          Number(basePrice),
          Number(prepTimeMinutes || 15),
          JSON.stringify(variations || []),
          JSON.stringify(addons || []),
        ]
      );

      // Create branch inventory for all branches of this restaurant
      const branches = queryAll('SELECT id FROM branches WHERE restaurantId = ?', [restaurantId]);
      for (const b of branches) {
        db.run(
          `INSERT INTO branch_inventory (id, branchId, restaurantId, menuItemId, stockQuantity, isSoldOut, isAvailableInBranch, lowStockThreshold)
           VALUES (?, ?, ?, ?, 50, 0, 1, 5)`,
          [`inv-${b.id}-${id}`, b.id, restaurantId, id]
        );
      }

      const created = queryOne('SELECT * FROM menu_items WHERE id = ?', [id]);
      res.status(201).json({
        ...created,
        isAvailableGlobal: Boolean(created.isAvailableGlobal),
        isPopular: Boolean(created.isPopular),
        isSpicy: Boolean(created.isSpicy),
        variations: JSON.parse(created.variations || '[]'),
        addons: JSON.parse(created.addons || '[]'),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/menu/:id/price', (req, res) => {
    try {
      const { id } = req.params;
      const { price } = req.body;
      if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ error: 'Valid positive price required' });
      }
      db.run('UPDATE menu_items SET basePrice = ? WHERE id = ?', [price, id]);
      const updated = queryOne('SELECT * FROM menu_items WHERE id = ?', [id]);
      res.json({
        ...updated,
        isAvailableGlobal: Boolean(updated.isAvailableGlobal),
        isPopular: Boolean(updated.isPopular),
        isSpicy: Boolean(updated.isSpicy),
        variations: JSON.parse(updated.variations || '[]'),
        addons: JSON.parse(updated.addons || '[]'),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Inventory API
  app.get('/api/inventory', (req, res) => {
    try {
      const { branchId } = req.query;
      let sql = 'SELECT * FROM branch_inventory';
      const params: any[] = [];

      if (branchId) {
        sql += ' WHERE branchId = ?';
        params.push(branchId);
      }

      const rows = queryAll(sql, params);
      const inventory = rows.map((i) => ({
        ...i,
        isSoldOut: Boolean(i.isSoldOut),
        isAvailableInBranch: Boolean(i.isAvailableInBranch),
      }));
      res.json(inventory);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/inventory/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { stockQuantity, isSoldOut, isAvailableInBranch } = req.body;
      const current = queryOne('SELECT * FROM branch_inventory WHERE id = ?', [id]);
      if (!current) return res.status(404).json({ error: 'Inventory record not found' });

      const newQty = stockQuantity !== undefined ? stockQuantity : current.stockQuantity;
      const newSoldOut = isSoldOut !== undefined ? (isSoldOut ? 1 : 0) : current.isSoldOut;
      const newAvail = isAvailableInBranch !== undefined ? (isAvailableInBranch ? 1 : 0) : current.isAvailableInBranch;

      db.run(
        'UPDATE branch_inventory SET stockQuantity = ?, isSoldOut = ?, isAvailableInBranch = ? WHERE id = ?',
        [newQty, newSoldOut, newAvail, id]
      );
      const updated = queryOne('SELECT * FROM branch_inventory WHERE id = ?', [id]);
      res.json({
        ...updated,
        isSoldOut: Boolean(updated.isSoldOut),
        isAvailableInBranch: Boolean(updated.isAvailableInBranch),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Real-Time Table Availability API
  app.get('/api/availability', (req, res) => {
    try {
      const { branchId, date, time, guests } = req.query;
      if (!branchId) return res.status(400).json({ error: 'branchId is required' });

      const guestCount = Number(guests) || 1;
      const checkDate = (date as string) || new Date().toISOString().split('T')[0];
      const checkTime = (time as string) || '08:30 PM';

      // Get all tables for the branch with sufficient capacity
      const allBranchTables = queryAll(
        'SELECT * FROM dining_tables WHERE branchId = ? ORDER BY capacity ASC',
        [branchId]
      );

      // Find all active bookings for this branch, date, and time
      const activeBookings = queryAll(
        `SELECT tableId FROM bookings 
         WHERE branchId = ? AND date = ? AND time = ? 
         AND status NOT IN ('cancelled', 'no_show')`,
        [branchId, checkDate, checkTime]
      );

      const bookedTableIds = new Set(activeBookings.map((b) => b.tableId));

      const availableTables = allBranchTables.filter(
        (t) => !bookedTableIds.has(t.id) && t.status !== 'dirty'
      );

      const suitableTables = availableTables.filter((t) => t.capacity >= guestCount);

      res.json({
        totalTables: allBranchTables.length,
        bookedCount: bookedTableIds.size,
        availableCount: availableTables.length,
        isAvailable: suitableTables.length > 0,
        availableTables,
        suitableTables,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Bookings / Reservations API
  app.get('/api/bookings', (req, res) => {
    try {
      const { branchId, customerPhone, id } = req.query;
      let sql = 'SELECT * FROM bookings WHERE 1=1';
      const params: any[] = [];

      if (id) {
        sql += ' AND id = ?';
        params.push(id);
      }
      if (branchId) {
        sql += ' AND branchId = ?';
        params.push(branchId);
      }
      if (customerPhone) {
        sql += ' AND customerPhone = ?';
        params.push(customerPhone);
      }
      sql += ' ORDER BY created_at DESC';

      const rows = queryAll(sql, params);
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/bookings', (req, res) => {
    try {
      const {
        restaurantId,
        branchId,
        tableId,
        tableNumber,
        customerName,
        customerPhone,
        customerEmail,
        date,
        time,
        guests,
        bookingFee,
        paymentMethod,
        specialRequests,
      } = req.body;

      // Validation
      if (!restaurantId || !branchId || !tableId || !customerName || !customerPhone || !date || !time) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: restaurant, branch, table, customer name, phone, date, and time are required.',
        });
      }

      if (Number(guests) < 1) {
        return res.status(400).json({ success: false, error: 'Party size must be at least 1 guest.' });
      }

      // Check if table is already booked for this branch, date, and time slot
      const conflict = queryOne(
        `SELECT id, tableNumber FROM bookings 
         WHERE branchId = ? AND tableId = ? AND date = ? AND time = ? 
         AND status NOT IN ('cancelled', 'no_show')`,
        [branchId, tableId, date, time]
      );

      if (conflict) {
        return res.status(409).json({
          success: false,
          error: `Table ${tableNumber || conflict.tableNumber} is already reserved for ${time} on ${date}. Please select another table or time slot.`,
        });
      }

      // Create new booking record with unique ID
      const bookingId = `DST-RES-${Math.floor(100000 + Math.random() * 900000)}`;
      const createdAt = new Date().toISOString();

      db.run(
        `INSERT INTO bookings (id, restaurantId, branchId, tableId, tableNumber, customerName, customerPhone, customerEmail, date, time, guests, bookingFee, paymentStatus, paymentMethod, status, specialRequests, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?, 'confirmed', ?, ?)`,
        [
          bookingId,
          restaurantId,
          branchId,
          tableId,
          tableNumber,
          customerName,
          customerPhone,
          customerEmail || '',
          date,
          time,
          Number(guests),
          Number(bookingFee || 300),
          paymentMethod || 'jazzcash',
          specialRequests || '',
          createdAt,
        ]
      );

      // Update table status in database
      db.run('UPDATE dining_tables SET status = ?, guestName = ?, guestPhone = ? WHERE id = ?', [
        'reserved',
        customerName,
        customerPhone,
        tableId,
      ]);

      // Add audit log
      db.run(
        `INSERT INTO audit_logs (id, userName, userRole, action, entity, entityId, previousValue, newValue, branchId, created_at)
         VALUES (?, ?, 'Customer', 'Create Reservation', 'Reservation', ?, 'None', 'Confirmed', ?, ?)`,
        [`audit-${Date.now()}`, customerName, bookingId, branchId, createdAt]
      );

      const newBooking = queryOne('SELECT * FROM bookings WHERE id = ?', [bookingId]);
      res.status(201).json({
        success: true,
        message: 'Table reservation created and confirmed successfully.',
        reservation: newBooking,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/bookings/:id/cancel', (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const booking = queryOne('SELECT * FROM bookings WHERE id = ?', [id]);
      if (!booking) return res.status(404).json({ error: 'Reservation not found' });

      db.run('UPDATE bookings SET status = ?, cancellationReason = ? WHERE id = ?', [
        'cancelled',
        reason || 'Customer cancelled',
        id,
      ]);

      // Free the table
      db.run('UPDATE dining_tables SET status = ?, guestName = NULL, guestPhone = NULL WHERE id = ?', [
        'available',
        booking.tableId,
      ]);

      // Audit log
      db.run(
        `INSERT INTO audit_logs (id, userName, userRole, action, entity, entityId, previousValue, newValue, branchId, created_at)
         VALUES (?, 'Customer', 'Customer', 'Cancel Reservation', 'Reservation', ?, 'Confirmed', 'Cancelled', ?, ?)`,
        [`audit-${Date.now()}`, id, booking.branchId, new Date().toISOString()]
      );

      const updated = queryOne('SELECT * FROM bookings WHERE id = ?', [id]);
      res.json({ success: true, reservation: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/bookings/:id/checkin', (req, res) => {
    try {
      const { id } = req.params;
      const booking = queryOne('SELECT * FROM bookings WHERE id = ?', [id]);
      if (!booking) return res.status(404).json({ error: 'Reservation not found' });

      const sessionId = `sess-${Date.now()}`;
      db.run('UPDATE bookings SET status = "checked_in" WHERE id = ?', [id]);
      db.run(
        'UPDATE dining_tables SET status = "occupied", currentSessionId = ?, guestName = ?, guestPhone = ? WHERE id = ?',
        [sessionId, booking.customerName, booking.customerPhone, booking.tableId]
      );

      const updated = queryOne('SELECT * FROM bookings WHERE id = ?', [id]);
      const table = queryOne('SELECT * FROM dining_tables WHERE id = ?', [booking.tableId]);
      res.json({ success: true, reservation: updated, table, sessionId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. Orders API
  app.get('/api/orders', (req, res) => {
    try {
      const { branchId, status, id, tableId } = req.query;
      let sql = 'SELECT * FROM orders WHERE 1=1';
      const params: any[] = [];

      if (id) {
        sql += ' AND id = ?';
        params.push(id);
      }
      if (branchId) {
        sql += ' AND branchId = ?';
        params.push(branchId);
      }
      if (tableId) {
        sql += ' AND tableId = ?';
        params.push(tableId);
      }
      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }
      sql += ' ORDER BY created_at DESC';

      const rows = queryAll(sql, params);
      const orders = rows.map((o) => ({
        ...o,
        items: JSON.parse(o.items || '[]'),
        isReviewed: Boolean(o.isReviewed),
      }));
      res.json(orders);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/orders', (req, res) => {
    try {
      const {
        restaurantId,
        branchId,
        tableId,
        tableNumber,
        customerName,
        customerPhone,
        items,
        paymentMethod,
        appliedPromoCode,
        redeemedPoints,
      } = req.body;

      if (!restaurantId || !branchId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'Restaurant, branch, and items array are required.' });
      }

      const branch = queryOne('SELECT * FROM branches WHERE id = ?', [branchId]);
      if (!branch) return res.status(404).json({ success: false, error: 'Branch not found' });

      // Check branch inventory and decrement stock
      for (const item of items) {
        const menuItemId = item.menuItemId || item.id;
        const inv = queryOne('SELECT * FROM branch_inventory WHERE branchId = ? AND menuItemId = ?', [branchId, menuItemId]);
        if (inv) {
          if (inv.stockQuantity < item.quantity) {
            return res.status(400).json({
              success: false,
              error: `Item "${item.name}" is low on stock (Only ${inv.stockQuantity} remaining).`,
            });
          }
          db.run('UPDATE branch_inventory SET stockQuantity = stockQuantity - ? WHERE id = ?', [
            item.quantity,
            inv.id,
          ]);
        }
      }

      const subtotal = items.reduce((sum: number, it: any) => sum + Number(it.itemTotal || it.basePrice * it.quantity), 0);
      const taxRate = Number(branch.taxRatePercent) || 13;
      const serviceRate = Number(branch.serviceChargePercent) || 5;

      const taxAmount = (subtotal * taxRate) / 100;
      const serviceCharge = (subtotal * serviceRate) / 100;

      // Promo discount calculation
      let discountAmount = 0;
      if (appliedPromoCode) {
        const promo = queryOne('SELECT * FROM promotions WHERE LOWER(code) = LOWER(?) AND isActive = 1', [appliedPromoCode]);
        if (promo && subtotal >= promo.minSpend) {
          if (promo.discountType === 'percentage') {
            discountAmount = Math.min((subtotal * promo.discountValue) / 100, promo.maxDiscount || 99999);
          } else {
            discountAmount = promo.discountValue;
          }
        }
      }

      // Loyalty points redemption (100 pts = Rs. 50)
      const ptsRedeemed = Number(redeemedPoints) || 0;
      const loyaltyDiscount = (ptsRedeemed / 100) * 50;
      const totalDiscount = discountAmount + loyaltyDiscount;

      // Check if table has a checked-in reservation to adjust booking fee
      let bookingFeeDeduction = 0;
      if (tableId) {
        const activeRes = queryOne(
          `SELECT bookingFee FROM bookings 
           WHERE tableId = ? AND status = 'checked_in' 
           ORDER BY created_at DESC LIMIT 1`,
          [tableId]
        );
        if (activeRes) {
          bookingFeeDeduction = Number(activeRes.bookingFee) || 0;
        }
      }

      const total = Math.max(0, subtotal + taxAmount + serviceCharge - totalDiscount - bookingFeeDeduction);
      const orderId = `DST-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const createdAt = new Date().toISOString();
      const pointsEarned = Math.floor(total / 10);

      const estimatedPrepMinutes = 20;
      const prepStartedAt = createdAt;
      const expectedReady = new Date(Date.now() + estimatedPrepMinutes * 60 * 1000).toISOString();

      db.run(
        `INSERT INTO orders (id, restaurantId, branchId, tableId, tableNumber, customerName, customerPhone, subtotal, taxAmount, serviceCharge, discountAmount, bookingFeeDeduction, total, status, paymentMethod, paymentStatus, paymentId, transactionRef, items, prepStartedAt, estimatedPrepMinutes, expectedReadyAt, pointsEarned, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'received', ?, 'paid', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          restaurantId,
          branchId,
          tableId || null,
          tableNumber || null,
          customerName || 'Customer',
          customerPhone || '+92 300 0000000',
          subtotal,
          taxAmount,
          serviceCharge,
          totalDiscount,
          bookingFeeDeduction,
          total,
          paymentMethod || 'jazzcash',
          `PAY-${Date.now()}`,
          `TXN-PK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          JSON.stringify(items),
          prepStartedAt,
          estimatedPrepMinutes,
          expectedReady,
          pointsEarned,
          createdAt,
        ]
      );

      // Award loyalty points in DB
      if (customerPhone) {
        const customerId = `cust-${customerPhone.replace(/[^0-9]/g, '')}`;
        let acc = queryOne('SELECT * FROM loyalty_accounts WHERE customerPhone = ?', [customerPhone]);
        if (!acc) {
          db.run(
            `INSERT INTO loyalty_accounts (id, customerId, customerName, customerPhone, pointsBalance, totalEarned, totalRedeemed, tier)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'Bronze')`,
            [`loyalty-${Date.now()}`, customerId, customerName || 'Customer', customerPhone, pointsEarned, pointsEarned, ptsRedeemed]
          );
        } else {
          db.run(
            `UPDATE loyalty_accounts 
             SET pointsBalance = pointsBalance + ? - ?, totalEarned = totalEarned + ?, totalRedeemed = totalRedeemed + ? 
             WHERE id = ?`,
            [pointsEarned, ptsRedeemed, pointsEarned, ptsRedeemed, acc.id]
          );
        }

        db.run(
          `INSERT INTO loyalty_transactions (id, customerId, type, points, orderId, description, created_at)
           VALUES (?, ?, 'earn', ?, ?, 'Points earned on order dine-in', ?)`,
          [`tx-${Date.now()}`, customerId, pointsEarned, orderId, createdAt]
        );
      }

      // Audit log
      db.run(
        `INSERT INTO audit_logs (id, userName, userRole, action, entity, entityId, previousValue, newValue, branchId, created_at)
         VALUES (?, ?, 'Customer', 'Place Order', 'Order', ?, 'None', 'Received', ?, ?)`,
        [`audit-${Date.now()}`, customerName || 'Customer', orderId, branchId, createdAt]
      );

      const createdOrder = queryOne('SELECT * FROM orders WHERE id = ?', [orderId]);
      res.status(201).json({
        success: true,
        order: {
          ...createdOrder,
          items: JSON.parse(createdOrder.items || '[]'),
          isReviewed: Boolean(createdOrder.isReviewed),
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const validStatuses = ['received', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid order status' });
      }

      const order = queryOne('SELECT * FROM orders WHERE id = ?', [id]);
      if (!order) return res.status(404).json({ error: 'Order not found' });

      let prepStartedAt = order.prepStartedAt;
      if (status === 'preparing' && !prepStartedAt) {
        prepStartedAt = new Date().toISOString();
      }

      db.run('UPDATE orders SET status = ?, prepStartedAt = ? WHERE id = ?', [status, prepStartedAt, id]);

      // Audit log
      db.run(
        `INSERT INTO audit_logs (id, userName, userRole, action, entity, entityId, previousValue, newValue, branchId, created_at)
         VALUES (?, 'Kitchen Staff', 'Kitchen', 'Update Order Status', 'Order', ?, ?, ?, ?, ?)`,
        [`audit-${Date.now()}`, id, order.status, status, order.branchId, new Date().toISOString()]
      );

      const updated = queryOne('SELECT * FROM orders WHERE id = ?', [id]);
      res.json({
        ...updated,
        items: JSON.parse(updated.items || '[]'),
        isReviewed: Boolean(updated.isReviewed),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/orders/:id/payment', (req, res) => {
    try {
      const { id } = req.params;
      const { paymentMethod, paymentStatus } = req.body;
      db.run(
        'UPDATE orders SET paymentStatus = ?, paymentMethod = ? WHERE id = ?',
        [paymentStatus || 'paid', paymentMethod || 'cash', id]
      );
      const updated = queryOne('SELECT * FROM orders WHERE id = ?', [id]);
      res.json({
        ...updated,
        items: JSON.parse(updated.items || '[]'),
        isReviewed: Boolean(updated.isReviewed),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/orders/:id/refund', (req, res) => {
    try {
      const { id } = req.params;
      const { refundReason, managerName } = req.body;
      const order = queryOne('SELECT * FROM orders WHERE id = ?', [id]);
      if (!order) return res.status(404).json({ error: 'Order not found' });

      db.run(
        'UPDATE orders SET status = "cancelled", paymentStatus = "refunded", refundReason = ? WHERE id = ?',
        [refundReason || 'Customer requested cancellation', id]
      );

      // Audit log
      db.run(
        `INSERT INTO audit_logs (id, userName, userRole, action, entity, entityId, previousValue, newValue, branchId, created_at)
         VALUES (?, ?, 'Manager', 'Process Refund', 'Order', ?, 'Paid', 'Refunded', ?, ?)`,
        [`audit-${Date.now()}`, managerName || 'Manager', id, order.branchId, new Date().toISOString()]
      );

      const updated = queryOne('SELECT * FROM orders WHERE id = ?', [id]);
      res.json({
        success: true,
        order: {
          ...updated,
          items: JSON.parse(updated.items || '[]'),
          isReviewed: Boolean(updated.isReviewed),
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 9. Reviews API
  app.get('/api/reviews', (req, res) => {
    try {
      const { restaurantId, branchId } = req.query;
      let sql = 'SELECT * FROM reviews WHERE status = "published"';
      const params: any[] = [];

      if (restaurantId) {
        sql += ' AND restaurantId = ?';
        params.push(restaurantId);
      }
      if (branchId) {
        sql += ' AND branchId = ?';
        params.push(branchId);
      }
      sql += ' ORDER BY created_at DESC';

      const rows = queryAll(sql, params);
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/reviews', (req, res) => {
    try {
      const { restaurantId, branchId, orderId, customerName, foodRating, serviceRating, staffRating, overallRating, comment } = req.body;
      if (!restaurantId || !branchId || !customerName || !comment) {
        return res.status(400).json({ error: 'Missing required review fields' });
      }

      const reviewId = `rev-${Date.now()}`;
      const createdAt = new Date().toISOString();

      db.run(
        `INSERT INTO reviews (id, restaurantId, branchId, orderId, customerName, foodRating, serviceRating, staffRating, overallRating, comment, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?)`,
        [
          reviewId,
          restaurantId,
          branchId,
          orderId || null,
          customerName,
          Number(foodRating || 5),
          Number(serviceRating || 5),
          Number(staffRating || 5),
          Number(overallRating || 5),
          comment,
          createdAt,
        ]
      );

      if (orderId) {
        db.run('UPDATE orders SET isReviewed = 1 WHERE id = ?', [orderId]);
      }

      const created = queryOne('SELECT * FROM reviews WHERE id = ?', [reviewId]);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10. Promotions API
  app.get('/api/promotions', (req, res) => {
    try {
      const rows = queryAll('SELECT * FROM promotions WHERE isActive = 1');
      res.json(rows.map((p) => ({ ...p, isActive: Boolean(p.isActive) })));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 11. Loyalty API
  app.get('/api/loyalty/:customerId', (req, res) => {
    try {
      const { customerId } = req.params;
      const acc = queryOne('SELECT * FROM loyalty_accounts WHERE customerId = ?', [customerId]);
      const txs = queryAll('SELECT * FROM loyalty_transactions WHERE customerId = ? ORDER BY created_at DESC', [customerId]);

      if (!acc) {
        return res.json({
          id: `loyalty-${Date.now()}`,
          customerId,
          customerName: 'Loyal Diner',
          customerPhone: customerId.replace('cust-', ''),
          pointsBalance: 0,
          totalEarned: 0,
          totalRedeemed: 0,
          tier: 'Bronze',
          transactions: [],
        });
      }

      res.json({
        ...acc,
        transactions: txs,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 12. Staff API
  app.get('/api/staff', (req, res) => {
    try {
      const { branchId } = req.query;
      let sql = 'SELECT * FROM staff';
      const params: any[] = [];

      if (branchId) {
        sql += ' WHERE branchId = ?';
        params.push(branchId);
      }

      const rows = queryAll(sql, params);
      const staff = rows.map((s) => ({
        ...s,
        assignedTables: JSON.parse(s.assignedTables || '[]'),
      }));
      res.json(staff);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/staff/:id/duty', (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      db.run('UPDATE staff SET status = ? WHERE id = ?', [status, id]);
      const updated = queryOne('SELECT * FROM staff WHERE id = ?', [id]);
      res.json({
        ...updated,
        assignedTables: JSON.parse(updated.assignedTables || '[]'),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 13. Audit Logs API
  app.get('/api/audit-logs', (req, res) => {
    try {
      const { branchId } = req.query;
      let sql = 'SELECT * FROM audit_logs';
      const params: any[] = [];

      if (branchId) {
        sql += ' WHERE branchId = ?';
        params.push(branchId);
      }
      sql += ' ORDER BY created_at DESC LIMIT 100';

      const rows = queryAll(sql, params);
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // VITE MIDDLEWARE / STATIC ASSETS
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dastanay Food Platform Server running on port ${PORT}`);
  });
}

startServer();
