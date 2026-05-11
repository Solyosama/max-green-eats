import { and, asc, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Branch,
  InsertNotification,
  InsertUser,
  InsertProductReview,
  Notification,
  Product,
  branches,
  cateringRequests,
  cateringServices,
  feedbackComplaints,
  loyaltyPoints,
  loyaltyTransactions,
  newsletter,
  notifications,
  nutritionPlans,
  orderItems,
  orders,
  packages,
  productImages,
  productReviews,
  products,
  promoCodes,
  sliders,
  users,
  nutritionSubscriptions,
  instapaySettings,
  InsertNutritionSubscription,
  NutritionSubscription,
  productExtras,
  ProductExtra,
  InsertProductExtra,
  siteSettings,
  SiteSetting,
  categories,
  Category,
  InsertCategory,
  events,
  Event,
  InsertEvent,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return { users: [], total: 0 };
  const [rows, countResult] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(users),
  ]);
  return { users: rows, total: Number(countResult[0]?.count ?? 0) };
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProducts(filters?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  maxCalories?: number;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { products: [], total: 0 };
  const conditions = [eq(products.isAvailable, true)];
  if (filters?.category) conditions.push(eq(products.category, filters.category));
  if (filters?.featured) conditions.push(eq(products.isFeatured, true));
  if (filters?.minPrice) conditions.push(gte(products.price, String(filters.minPrice)));
  if (filters?.maxPrice) conditions.push(lte(products.price, String(filters.maxPrice)));
  if (filters?.maxCalories) conditions.push(lte(products.calories, filters.maxCalories));
  if (filters?.search) {
    conditions.push(or(
      sql`${products.nameAr} LIKE ${`%${filters.search}%`}`,
      sql`${products.nameEn} LIKE ${`%${filters.search}%`}`
    )!);
  }
  const limit = filters?.limit ?? 20;
  const offset = filters?.offset ?? 0;
  const [rows, countResult] = await Promise.all([
    db.select().from(products).where(and(...conditions)).orderBy(desc(products.rating)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(products).where(and(...conditions)),
  ]);
  return { products: rows, total: Number(countResult[0]?.count ?? 0) };
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function createProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<number | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  // MySQL returns insertId in the result header
  return (result as unknown as [{ insertId: number }])[0]?.insertId ?? null;
}

export async function updateProduct(id: number, data: Partial<Product>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set({ isAvailable: false }).where(eq(products.id, id));
}

// ─── Branches ────────────────────────────────────────────────────────────────

export async function getBranches() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(branches).where(eq(branches.isActive, true)).orderBy(asc(branches.id));
}

export async function getBranchById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(branches).where(eq(branches.id, id)).limit(1);
  return result[0];
}

export async function createBranch(data: Omit<Branch, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(branches).values(data);
}

export async function updateBranch(id: number, data: Partial<Branch>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(branches).set(data).where(eq(branches.id, id));
}

// ─── Sliders ─────────────────────────────────────────────────────────────────

export async function getActiveSliders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sliders).where(eq(sliders.isActive, true)).orderBy(asc(sliders.displayOrder));
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function createOrder(data: {
  userId: number;
  branchId?: number;
  paymentMethod: "cash" | "card" | "instapay";
  deliveryType: "dine_in" | "delivery" | "pickup";
  deliveryAddress?: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  promoCodeId?: number;
  notes?: string;
  items: { productId: number; quantity: number; unitPrice: number; specialInstructions?: string }[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const orderNumber = `MGE-${Date.now().toString(36).toUpperCase()}`;
  await db.insert(orders).values({
    userId: data.userId,
    orderNumber,
    branchId: data.branchId,
    paymentMethod: data.paymentMethod,
    deliveryType: data.deliveryType,
    deliveryAddress: data.deliveryAddress,
    subtotal: String(data.subtotal),
    discountAmount: String(data.discountAmount),
    totalAmount: String(data.totalAmount),
    promoCodeId: data.promoCodeId,
    notes: data.notes,
  });
  const newOrder = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  if (newOrder[0]) {
    const orderId = newOrder[0].id;
    await db.insert(orderItems).values(data.items.map(item => ({
      orderId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: String(item.unitPrice),
      totalPrice: String(item.unitPrice * item.quantity),
      specialInstructions: item.specialInstructions,
    })));
    // Award loyalty points (1 point per 10 EGP)
    const pointsEarned = Math.floor(data.totalAmount / 10);
    if (pointsEarned > 0) {
      await db.insert(loyaltyPoints).values({ userId: data.userId, points: pointsEarned, totalEarned: pointsEarned })
        .onDuplicateKeyUpdate({ set: { points: sql`points + ${pointsEarned}`, totalEarned: sql`totalEarned + ${pointsEarned}` } });
      await db.insert(loyaltyTransactions).values({ userId: data.userId, type: "earned", points: pointsEarned, orderId, description: `Earned from order ${orderNumber}` });
    }
  }
  return orderNumber;
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt)).limit(20);
}

export async function getOrderByNumber(orderNumber: string, userId?: number) {
  const db = await getDb();
  if (!db) return undefined;
  const conditions = [eq(orders.orderNumber, orderNumber)];
  if (userId) conditions.push(eq(orders.userId, userId));
  const result = await db.select().from(orders).where(and(...conditions)).limit(1);
  if (!result[0]) return undefined;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, result[0].id));
  return { ...result[0], items };
}

export async function getAllOrders(limit = 50, offset = 0, status?: string) {
  const db = await getDb();
  if (!db) return { orders: [], total: 0 };
  const conditions = status ? [eq(orders.status, status as any)] : [];
  const [rows, countResult] = await Promise.all([
    db.select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      totalAmount: orders.totalAmount,
      subtotal: orders.subtotal,
      discountAmount: orders.discountAmount,
      paymentMethod: orders.paymentMethod,
      deliveryType: orders.deliveryType,
      deliveryAddress: orders.deliveryAddress,
      notes: orders.notes,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(orders).where(conditions.length ? and(...conditions) : undefined),
  ]);
  // Map to include user object for compatibility
  const ordersWithUser = rows.map(row => ({
    ...row,
    user: row.userName ? { name: row.userName, email: row.userEmail } : null,
  }));
  return { orders: ordersWithUser, total: Number(countResult[0]?.count ?? 0) };
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0] ?? null;
}

export async function updateOrderStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ status: status as any }).where(eq(orders.id, id));
}

// ─── Promo Codes ─────────────────────────────────────────────────────────────

export async function validatePromoCode(code: string, orderAmount: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(promoCodes).where(
    and(
      eq(promoCodes.code, code.toUpperCase()),
      eq(promoCodes.isActive, true),
      lte(promoCodes.validFrom, new Date()),
    )
  ).limit(1);
  const promo = result[0];
  if (!promo) return null;
  if (promo.validUntil && new Date() > promo.validUntil) return null;
  if (promo.maxUsageCount && promo.currentUsageCount >= promo.maxUsageCount) return null;
  if (promo.minOrderAmount && orderAmount < Number(promo.minOrderAmount)) return null;
  let discount = 0;
  if (promo.discountType === "percentage") {
    discount = (orderAmount * Number(promo.discountValue)) / 100;
  } else {
    discount = Number(promo.discountValue);
  }
  return { promo, discount: Math.min(discount, orderAmount) };
}

export async function getAllPromoCodes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
}

// ─── Catering ────────────────────────────────────────────────────────────────

export async function getCateringServices() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cateringServices).where(eq(cateringServices.isActive, true));
}

export async function createCateringRequest(data: {
  userId?: number;
  serviceId: number;
  guestCount: number;
  eventDate: string;
  eventType?: string;
  locationAr?: string;
  locationEn?: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const service = await db.select().from(cateringServices).where(eq(cateringServices.id, data.serviceId)).limit(1);
  const totalPrice = service[0] ? Number(service[0].pricePerPerson) * data.guestCount : undefined;
  await db.insert(cateringRequests).values({ ...data, eventDate: data.eventDate as any, totalPrice: totalPrice ? String(totalPrice) : undefined });
}

export async function getAllCateringRequests() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cateringRequests).orderBy(desc(cateringRequests.createdAt));
}

// ─── Nutrition Plans ─────────────────────────────────────────────────────────

export async function getNutritionPlans() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(nutritionPlans).where(eq(nutritionPlans.isActive, true));
}
export async function getAllNutritionPlans() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(nutritionPlans).orderBy(nutritionPlans.createdAt);
}

export async function createNutritionPlan(data: { titleAr: string; titleEn: string; descriptionAr?: string; descriptionEn?: string; price: number; imageUrl?: string; isActive?: boolean; features?: string; }) {  const db = await getDb();
  if (!db) return;
  await db.insert(nutritionPlans).values({ titleAr: data.titleAr, titleEn: data.titleEn, descriptionAr: data.descriptionAr ?? null, descriptionEn: data.descriptionEn ?? null, durationDays: 30, mealsPerDay: 3, price: String(data.price), imageUrl: data.imageUrl ?? null, isActive: data.isActive ?? true, features: data.features ?? null });
}

export async function updateNutritionPlanById(id: number, data: { titleAr?: string; titleEn?: string; descriptionAr?: string; descriptionEn?: string; price?: number; imageUrl?: string; isActive?: boolean; }) {
  const db = await getDb();
  if (!db) return;
  const updateData: Record<string, unknown> = {};
  if (data.titleAr !== undefined) updateData.titleAr = data.titleAr;
  if (data.titleEn !== undefined) updateData.titleEn = data.titleEn;
  if (data.descriptionAr !== undefined) updateData.descriptionAr = data.descriptionAr;
  if (data.descriptionEn !== undefined) updateData.descriptionEn = data.descriptionEn;
  if (data.price !== undefined) updateData.price = String(data.price);
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.features !== undefined) updateData.features = data.features;
  await db.update(nutritionPlans).set(updateData).where(eq(nutritionPlans.id, id));
}

export async function deleteNutritionPlan(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(nutritionPlans).where(eq(nutritionPlans.id, id));
}
// ─── Packages ────────────────────────────────────────────────────────────────

export async function getPackages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(packages).where(eq(packages.isActive, true));
}

// ─── Feedback ────────────────────────────────────────────────────────────────

export async function createFeedback(data: {
  userId?: number;
  name?: string;
  email?: string;
  phone?: string;
  type: "feedback" | "complaint" | "suggestion";
  orderId?: number;
  subject?: string;
  message: string;
  rating?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(feedbackComplaints).values(data);
}

export async function getAllFeedback(type?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = type ? [eq(feedbackComplaints.type, type as any)] : [];
  return db.select().from(feedbackComplaints).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(feedbackComplaints.createdAt));
}

// ─── Loyalty ─────────────────────────────────────────────────────────────────

export async function getLoyaltyPoints(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(loyaltyPoints).where(eq(loyaltyPoints.userId, userId)).limit(1);
  return result[0] ?? { userId, points: 0, totalEarned: 0, totalRedeemed: 0 };
}

export async function getLoyaltyHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(loyaltyTransactions).where(eq(loyaltyTransactions.userId, userId)).orderBy(desc(loyaltyTransactions.createdAt)).limit(20);
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

export async function subscribeNewsletter(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(newsletter).values({ email }).onDuplicateKeyUpdate({ set: { isActive: true } });
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;
  const [totalOrders, totalRevenue, totalProducts, totalUsers, recentOrders] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(orders),
    db.select({ sum: sql<string>`COALESCE(SUM(totalAmount), 0)` }).from(orders).where(eq(orders.paymentStatus, "completed")),
    db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.isAvailable, true)),
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5),
  ]);
  return {
    totalOrders: Number(totalOrders[0]?.count ?? 0),
    totalRevenue: Number(totalRevenue[0]?.sum ?? 0),
    totalProducts: Number(totalProducts[0]?.count ?? 0),
    totalUsers: Number(totalUsers[0]?.count ?? 0),
    recentOrders,
  };
}

// ─── Notifications ────────────────────────────────────────────────────────────

/** Arabic/English messages for each order status transition */
const ORDER_STATUS_MESSAGES: Record<string, { titleAr: string; titleEn: string; messageAr: string; messageEn: string }> = {
  confirmed: {
    titleAr: "تم تأكيد طلبك ✅",
    titleEn: "Order Confirmed ✅",
    messageAr: "تم استلام طلبك وتأكيده. سيبدأ فريقنا في التحضير قريباً.",
    messageEn: "Your order has been received and confirmed. Our team will start preparing it shortly.",
  },
  preparing: {
    titleAr: "طلبك قيد التحضير 👨‍🍳",
    titleEn: "Order Being Prepared 👨‍🍳",
    messageAr: "يقوم فريقنا الآن بتحضير طلبك بعناية. سيكون جاهزاً قريباً!",
    messageEn: "Our team is carefully preparing your order. It will be ready soon!",
  },
  ready: {
    titleAr: "طلبك جاهز 🎉",
    titleEn: "Order Ready 🎉",
    messageAr: "طلبك جاهز وسيتم تسليمه إليك قريباً.",
    messageEn: "Your order is ready and will be delivered to you shortly.",
  },
  on_the_way: {
    titleAr: "طلبك في الطريق إليك 🚴",
    titleEn: "Order On the Way 🚴",
    messageAr: "المندوب في طريقه إليك الآن. تتبع طلبك من صفحة الطلبات.",
    messageEn: "The delivery rider is on the way to you. Track your order from the orders page.",
  },
  delivered: {
    titleAr: "تم توصيل طلبك 🌿",
    titleEn: "Order Delivered 🌿",
    messageAr: "تم توصيل طلبك بنجاح. نتمنى لك وجبة شهية وصحية!",
    messageEn: "Your order has been delivered successfully. Enjoy your healthy meal!",
  },
  cancelled: {
    titleAr: "تم إلغاء طلبك ❌",
    titleEn: "Order Cancelled ❌",
    messageAr: "تم إلغاء طلبك. إذا كان لديك استفسار، تواصل معنا.",
    messageEn: "Your order has been cancelled. If you have any questions, please contact us.",
  },
};

export async function createOrderStatusNotification(
  userId: number,
  orderId: number,
  orderNumber: string,
  status: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const msg = ORDER_STATUS_MESSAGES[status];
  if (!msg) return; // no notification for pending/unknown statuses
  try {
    await db.insert(notifications).values({
      userId,
      type: "order_status",
      titleAr: msg.titleAr,
      titleEn: msg.titleEn,
      messageAr: `${msg.messageAr} (طلب #${orderNumber})`,
      messageEn: `${msg.messageEn} (Order #${orderNumber})`,
      isRead: false,
      orderId,
      orderNumber,
    });
  } catch (err) {
    console.error("[Notifications] Failed to create notification:", err);
  }
}

export async function getUserNotifications(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return Number(result[0]?.count ?? 0);
}

export async function markNotificationRead(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}

// ─── Product Images ───────────────────────────────────────────────────────────

export async function getProductImages(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(asc(productImages.sortOrder));
}

// ─── Product Reviews ──────────────────────────────────────────────────────────

export async function getProductReviews(productId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return { reviews: [], total: 0, avgRating: 0 };

  const [reviewRows, countRows, avgRows] = await Promise.all([
    db
      .select({
        id: productReviews.id,
        productId: productReviews.productId,
        userId: productReviews.userId,
        rating: productReviews.rating,
        comment: productReviews.comment,
        isVerified: productReviews.isVerified,
        createdAt: productReviews.createdAt,
        userName: users.name,
      })
      .from(productReviews)
      .leftJoin(users, eq(productReviews.userId, users.id))
      .where(eq(productReviews.productId, productId))
      .orderBy(desc(productReviews.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(productReviews)
      .where(eq(productReviews.productId, productId)),
    db
      .select({ avg: sql<number>`COALESCE(AVG(rating), 0)` })
      .from(productReviews)
      .where(eq(productReviews.productId, productId)),
  ]);

  return {
    reviews: reviewRows,
    total: Number(countRows[0]?.count ?? 0),
    avgRating: Number(Number(avgRows[0]?.avg ?? 0).toFixed(1)),
  };
}

export async function getRatingDistribution(productId: number) {
  const db = await getDb();
  if (!db) return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const rows = await db
    .select({ rating: productReviews.rating, count: sql<number>`count(*)` })
    .from(productReviews)
    .where(eq(productReviews.productId, productId))
    .groupBy(productReviews.rating);
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of rows) dist[row.rating] = Number(row.count);
  return dist;
}

export async function createProductReview(data: InsertProductReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Check if user already reviewed this product
  const existing = await db
    .select({ id: productReviews.id })
    .from(productReviews)
    .where(and(eq(productReviews.productId, data.productId), eq(productReviews.userId, data.userId)))
    .limit(1);
  if (existing.length > 0) {
    // Update existing review
    await db
      .update(productReviews)
      .set({ rating: data.rating, comment: data.comment })
      .where(eq(productReviews.id, existing[0].id));
    return { updated: true };
  }
  await db.insert(productReviews).values(data);
  return { updated: false };
}

export async function getUserReviewForProduct(productId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(productReviews)
    .where(and(eq(productReviews.productId, productId), eq(productReviews.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function getRelatedProducts(productId: number, category: string, limit = 4) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(products)
    .where(and(eq(products.category, category), eq(products.isAvailable, true)))
    .orderBy(desc(products.isFeatured))
    .limit(limit + 1)
    .then((rows) => rows.filter((p) => p.id !== productId).slice(0, limit));
}

// ─── Nutrition Subscriptions ──────────────────────────────────────────────────
export async function createSubscription(data: InsertNutritionSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(nutritionSubscriptions).values(data);
  return (result as any).insertId as number;
}

export async function getUserSubscriptions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(nutritionSubscriptions)
    .where(eq(nutritionSubscriptions.userId, userId))
    .orderBy(desc(nutritionSubscriptions.createdAt));
}

export async function getAllSubscriptions(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return { subscriptions: [], total: 0 };
  const [rows, countResult] = await Promise.all([
    db
      .select({
        id: nutritionSubscriptions.id,
        userId: nutritionSubscriptions.userId,
        planId: nutritionSubscriptions.planId,
        planNameAr: nutritionSubscriptions.planNameAr,
        planNameEn: nutritionSubscriptions.planNameEn,
        amount: nutritionSubscriptions.amount,
        instapayRef: nutritionSubscriptions.instapayRef,
        status: nutritionSubscriptions.status,
        startDate: nutritionSubscriptions.startDate,
        endDate: nutritionSubscriptions.endDate,
        notes: nutritionSubscriptions.notes,
        createdAt: nutritionSubscriptions.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(nutritionSubscriptions)
      .leftJoin(users, eq(nutritionSubscriptions.userId, users.id))
      .orderBy(desc(nutritionSubscriptions.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(nutritionSubscriptions),
  ]);
  return { subscriptions: rows, total: Number(countResult[0]?.count ?? 0) };
}

export async function updateSubscriptionStatus(
  id: number,
  status: NutritionSubscription["status"],
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Partial<NutritionSubscription> = { status };
  if (notes !== undefined) updateData.notes = notes;
  if (status === "active") {
    updateData.startDate = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    updateData.endDate = end;
  }
  await db
    .update(nutritionSubscriptions)
    .set(updateData)
    .where(eq(nutritionSubscriptions.id, id));
}

// ─── InstaPay Settings ────────────────────────────────────────────────────────
export async function getInstapaySettings() {
  const db = await getDb();
  if (!db) return { accountPhone: "+201142839399", accountName: "Max Green Eats", instructions: "" };
  const rows = await db.select().from(instapaySettings).limit(1);
  if (rows.length === 0) {
    // Insert default if missing
    await db.insert(instapaySettings).values({
      accountPhone: "+201142839399",
      accountName: "Max Green Eats",
      instructions: "قم بتحويل المبلغ المطلوب عبر InstaPay إلى الرقم المحدد، ثم أدخل رقم المرجع الخاص بالتحويل لتأكيد اشتراكك.",
    });
    return { accountPhone: "+201142839399", accountName: "Max Green Eats", instructions: "قم بتحويل المبلغ المطلوب عبر InstaPay إلى الرقم المحدد، ثم أدخل رقم المرجع الخاص بالتحويل لتأكيد اشتراكك." };
  }
  return rows[0];
}

export async function updateInstapaySettings(data: {
  accountPhone?: string;
  accountName?: string;
  instructions?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.select().from(instapaySettings).limit(1);
  if (rows.length === 0) {
    await db.insert(instapaySettings).values({
      accountPhone: data.accountPhone ?? "+201142839399",
      accountName: data.accountName ?? "Max Green Eats",
      instructions: data.instructions ?? "",
    });
  } else {
    await db.update(instapaySettings).set(data).where(eq(instapaySettings.id, rows[0].id));
  }
}

// ─── Product Extras ───────────────────────────────────────────────────────────
export async function getProductExtras(productId: number): Promise<ProductExtra[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productExtras).where(eq(productExtras.productId, productId)).orderBy(asc(productExtras.sortOrder));
}

export async function saveProductExtras(productId: number, extras: Omit<InsertProductExtra, "id" | "createdAt">[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  // Delete existing extras for this product then re-insert
  await db.delete(productExtras).where(eq(productExtras.productId, productId));
  if (extras.length > 0) {
    await db.insert(productExtras).values(extras.map(e => ({ ...e, productId })));
  }
}

// ─── Site Settings ────────────────────────────────────────────────────────────
export async function getAllSettings(): Promise<Record<string, string>> {
  const db = await getDb();
  if (!db) return {};
  const rows = await db.select().from(siteSettings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
}

export async function updateSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(siteSettings).values({ key, value }).onDuplicateKeyUpdate({ set: { value } });
}

export async function updateSettings(entries: { key: string; value: string }[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  for (const { key, value } of entries) {
    await db.insert(siteSettings).values({ key, value }).onDuplicateKeyUpdate({ set: { value } });
  }
}

// ─── Sliders Admin CRUD ───────────────────────────────────────────────────────
export async function getAllSliders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sliders).orderBy(asc(sliders.displayOrder));
}

export async function createSlider(data: {
  titleAr: string; titleEn: string;
  subtitleAr?: string; subtitleEn?: string;
  imageUrl: string; link?: string;
  displayOrder?: number; isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(sliders).values({
    titleAr: data.titleAr, titleEn: data.titleEn,
    subtitleAr: data.subtitleAr ?? null, subtitleEn: data.subtitleEn ?? null,
    imageUrl: data.imageUrl, link: data.link ?? null,
    displayOrder: data.displayOrder ?? 0, isActive: data.isActive ?? true,
  });
}

export async function updateSlider(id: number, data: Partial<{
  titleAr: string; titleEn: string;
  subtitleAr: string; subtitleEn: string;
  imageUrl: string; link: string;
  displayOrder: number; isActive: boolean;
}>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(sliders).set(data).where(eq(sliders.id, id));
}

export async function deleteSlider(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(sliders).where(eq(sliders.id, id));
}

// ─── Packages Admin CRUD ──────────────────────────────────────────────────────
export async function getAllPackagesAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(packages).orderBy(asc(packages.id));
}

export async function createPackage(data: {
  titleAr: string; titleEn: string;
  descriptionAr?: string; descriptionEn?: string;
  mealCount: number; originalPrice: number; discountedPrice: number;
  discountPercentage?: number; imageUrl?: string; isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(packages).values({
    titleAr: data.titleAr, titleEn: data.titleEn,
    descriptionAr: data.descriptionAr ?? null, descriptionEn: data.descriptionEn ?? null,
    mealCount: data.mealCount,
    originalPrice: String(data.originalPrice),
    discountedPrice: String(data.discountedPrice),
    discountPercentage: data.discountPercentage ?? null,
    imageUrl: data.imageUrl ?? null,
    isActive: data.isActive ?? true,
  });
}

export async function updatePackage(id: number, data: Partial<{
  titleAr: string; titleEn: string;
  descriptionAr: string; descriptionEn: string;
  mealCount: number; originalPrice: number; discountedPrice: number;
  discountPercentage: number; imageUrl: string; isActive: boolean;
}>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const updateData: Record<string, unknown> = { ...data };
  if (data.originalPrice !== undefined) updateData.originalPrice = String(data.originalPrice);
  if (data.discountedPrice !== undefined) updateData.discountedPrice = String(data.discountedPrice);
  await db.update(packages).set(updateData).where(eq(packages.id, id));
}

export async function deletePackage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(packages).where(eq(packages.id, id));
}

// ─── Promo Codes CRUD ─────────────────────────────────────────────────────────
export async function createPromoCode(data: {
  code: string;
  descriptionAr?: string;
  descriptionEn?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  maxUsageCount?: number;
  validFrom: Date;
  validUntil?: Date;
  isActive: boolean;
  showOnHome: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(promoCodes).values({
    ...data,
    discountValue: String(data.discountValue),
    minOrderAmount: data.minOrderAmount !== undefined ? String(data.minOrderAmount) : undefined,
  } as any);
}
export async function updatePromoCode(id: number, data: Partial<{
  code: string;
  descriptionAr: string;
  descriptionEn: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxUsageCount: number;
  validFrom: Date;
  validUntil: Date | null;
  isActive: boolean;
  showOnHome: boolean;
}>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const updateData: Record<string, unknown> = { ...data };
  if (data.discountValue !== undefined) updateData.discountValue = String(data.discountValue);
  if (data.minOrderAmount !== undefined) updateData.minOrderAmount = String(data.minOrderAmount);
  await db.update(promoCodes).set(updateData).where(eq(promoCodes.id, id));
}
export async function deletePromoCode(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(promoCodes).where(eq(promoCodes.id, id));
}
// ─── Branches CRUD ────────────────────────────────────────────────────────────
export async function getAllBranches() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(branches).orderBy(asc(branches.id));
}
export async function deleteBranch(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(branches).where(eq(branches.id, id));
}

// ─── Categories CRUD ──────────────────────────────────────────────────────────
export async function getCategories(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const q = db.select().from(categories).orderBy(asc(categories.displayOrder));
  if (activeOnly) return (await q).filter((c: Category) => c.isActive);
  return q;
}
export async function createCategory(data: Omit<InsertCategory, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(categories).values(data);
}
export async function updateCategory(id: number, data: Partial<Omit<InsertCategory, "id" | "createdAt">>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(categories).set(data).where(eq(categories.id, id));
}
export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(categories).where(eq(categories.id, id));
}
// ─── Events CRUD ──────────────────────────────────────────────────────────────
export async function getEvents(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(events).orderBy(desc(events.startDate));
  if (activeOnly) return rows.filter((e: Event) => e.isActive);
  return rows;
}
export async function createEvent(data: Omit<InsertEvent, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(events).values(data);
}
export async function updateEvent(id: number, data: Partial<Omit<InsertEvent, "id" | "createdAt">>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(events).set(data).where(eq(events.id, id));
}
export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(events).where(eq(events.id, id));
}
