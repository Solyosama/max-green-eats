import {
  boolean,
  date,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Core Auth ───────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Branches ────────────────────────────────────────────────────────────────

export const branches = mysqlTable("branches", {
  id: int("id").autoincrement().primaryKey(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  addressAr: text("addressAr"),
  addressEn: text("addressEn"),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  openingHours: varchar("openingHours", { length: 100 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Branch = typeof branches.$inferSelect;

// ─── Products ────────────────────────────────────────────────────────────────

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  category: varchar("category", { length: 50 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("imageUrl"),
  calories: int("calories"),
  protein: decimal("protein", { precision: 6, scale: 1 }),
  carbs: decimal("carbs", { precision: 6, scale: 1 }),
  fat: decimal("fat", { precision: 6, scale: 1 }),
  branchId: int("branchId"),
  hasExtras: boolean("hasExtras").default(false).notNull(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: int("reviewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;

// ─── Sliders ─────────────────────────────────────────────────────────────────

export const sliders = mysqlTable("sliders", {
  id: int("id").autoincrement().primaryKey(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  titleEn: varchar("titleEn", { length: 255 }).notNull(),
  subtitleAr: text("subtitleAr"),
  subtitleEn: text("subtitleEn"),
  imageUrl: text("imageUrl").notNull(),
  link: varchar("link", { length: 500 }),
  displayOrder: int("displayOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Slider = typeof sliders.$inferSelect;

// ─── Promo Codes ─────────────────────────────────────────────────────────────

export const promoCodes = mysqlTable("promoCodes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  descriptionAr: varchar("descriptionAr", { length: 255 }),
  descriptionEn: varchar("descriptionEn", { length: 255 }),
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).default("percentage").notNull(),
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal("minOrderAmount", { precision: 10, scale: 2 }),
  maxUsageCount: int("maxUsageCount"),
  currentUsageCount: int("currentUsageCount").default(0).notNull(),
  validFrom: timestamp("validFrom").notNull(),
  validUntil: timestamp("validUntil"),
  isActive: boolean("isActive").default(true).notNull(),
  showOnHome: boolean("showOnHome").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PromoCode = typeof promoCodes.$inferSelect;

// ─── Orders ──────────────────────────────────────────────────────────────────

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orderNumber: varchar("orderNumber", { length: 20 }).notNull().unique(),
  branchId: int("branchId"),
  status: mysqlEnum("status", ["pending", "confirmed", "preparing", "ready", "on_the_way", "delivered", "cancelled"]).default("pending").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "card", "instapay"]).default("cash").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed"]).default("pending").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  promoCodeId: int("promoCodeId"),
  deliveryType: mysqlEnum("deliveryType", ["dine_in", "delivery", "pickup"]).default("delivery").notNull(),
  deliveryAddress: text("deliveryAddress"),
  notes: text("notes"),
  estimatedDeliveryTime: timestamp("estimatedDeliveryTime"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;

export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  specialInstructions: text("specialInstructions"),
});

export type OrderItem = typeof orderItems.$inferSelect;

// ─── Catering Services ───────────────────────────────────────────────────────

export const cateringServices = mysqlTable("cateringServices", {
  id: int("id").autoincrement().primaryKey(),
  titleAr: varchar("titleAr", { length: 100 }).notNull(),
  titleEn: varchar("titleEn", { length: 100 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  minGuests: int("minGuests").notNull(),
  maxGuests: int("maxGuests"),
  pricePerPerson: decimal("pricePerPerson", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("imageUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const cateringRequests = mysqlTable("cateringRequests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  serviceId: int("serviceId").notNull(),
  guestCount: int("guestCount").notNull(),
  eventDate: date("eventDate").notNull(),
  eventType: varchar("eventType", { length: 100 }),
  locationAr: text("locationAr"),
  locationEn: text("locationEn"),
  contactName: varchar("contactName", { length: 100 }).notNull(),
  contactPhone: varchar("contactPhone", { length: 20 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 100 }),
  notes: text("notes"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "completed"]).default("pending").notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Nutrition Plans ─────────────────────────────────────────────────────────

export const nutritionPlans = mysqlTable("nutritionPlans", {
  id: int("id").autoincrement().primaryKey(),
  titleAr: varchar("titleAr", { length: 100 }).notNull(),
  titleEn: varchar("titleEn", { length: 100 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  durationDays: int("durationDays").notNull(),
  mealsPerDay: int("mealsPerDay").notNull(),
  caloriesTarget: int("caloriesTarget"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("imageUrl"),
  features: text("features"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Packages ────────────────────────────────────────────────────────────────

export const packages = mysqlTable("packages", {
  id: int("id").autoincrement().primaryKey(),
  titleAr: varchar("titleAr", { length: 100 }).notNull(),
  titleEn: varchar("titleEn", { length: 100 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  mealCount: int("mealCount").notNull(),
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }).notNull(),
  discountedPrice: decimal("discountedPrice", { precision: 10, scale: 2 }).notNull(),
  discountPercentage: int("discountPercentage"),
  imageUrl: text("imageUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Feedback & Complaints ───────────────────────────────────────────────────

export const feedbackComplaints = mysqlTable("feedbackComplaints", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  type: mysqlEnum("type", ["feedback", "complaint", "suggestion"]).notNull(),
  orderId: int("orderId"),
  subject: varchar("subject", { length: 200 }),
  message: text("message").notNull(),
  rating: int("rating"),
  status: mysqlEnum("status", ["new", "reviewed", "resolved"]).default("new").notNull(),
  adminResponse: text("adminResponse"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Loyalty Points ──────────────────────────────────────────────────────────

export const loyaltyPoints = mysqlTable("loyaltyPoints", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  points: int("points").default(0).notNull(),
  totalEarned: int("totalEarned").default(0).notNull(),
  totalRedeemed: int("totalRedeemed").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const loyaltyTransactions = mysqlTable("loyaltyTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["earned", "redeemed", "expired"]).notNull(),
  points: int("points").notNull(),
  orderId: int("orderId"),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Newsletter ──────────────────────────────────────────────────────────────

export const newsletter = mysqlTable("newsletter", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Notifications ───────────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["order_status", "promo", "general"]).default("general").notNull(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  titleEn: varchar("titleEn", { length: 255 }).notNull(),
  messageAr: text("messageAr").notNull(),
  messageEn: text("messageEn").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  orderId: int("orderId"),
  orderNumber: varchar("orderNumber", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ─── Product Images ───────────────────────────────────────────────────────────
export const productImages = mysqlTable("productImages", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  altAr: varchar("altAr", { length: 255 }),
  altEn: varchar("altEn", { length: 255 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductImage = typeof productImages.$inferSelect;
export type InsertProductImage = typeof productImages.$inferInsert;

// ─── Product Reviews ──────────────────────────────────────────────────────────
export const productReviews = mysqlTable("productReviews", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  userId: int("userId").notNull(),
  rating: int("rating").notNull(),           // 1–5
  comment: text("comment"),
  isVerified: boolean("isVerified").default(false).notNull(), // verified purchase
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductReview = typeof productReviews.$inferSelect;
export type InsertProductReview = typeof productReviews.$inferInsert;

// ─── Nutrition Subscriptions ──────────────────────────────────────────────────
export const nutritionSubscriptions = mysqlTable("nutritionSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: int("planId").notNull(),
  planNameAr: varchar("planNameAr", { length: 255 }).notNull(),
  planNameEn: varchar("planNameEn", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  instapayRef: varchar("instapayRef", { length: 100 }),
  status: mysqlEnum("status", ["pending", "active", "cancelled", "expired"]).default("pending").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type NutritionSubscription = typeof nutritionSubscriptions.$inferSelect;
export type InsertNutritionSubscription = typeof nutritionSubscriptions.$inferInsert;

// ─── InstaPay Settings ────────────────────────────────────────────────────────
export const instapaySettings = mysqlTable("instapaySettings", {
  id: int("id").autoincrement().primaryKey(),
  accountPhone: varchar("accountPhone", { length: 20 }).notNull().default("+201142839399"),
  accountName: varchar("accountName", { length: 255 }).notNull().default("Max Green Eats"),
  instructions: text("instructions"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type InstapaySettings = typeof instapaySettings.$inferSelect;
export type InsertInstapaySettings = typeof instapaySettings.$inferInsert;

// ─── Product Extras ───────────────────────────────────────────────────────────
export const productExtras = mysqlTable("productExtras", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  type: mysqlEnum("type", ["sauce", "spice", "bread"]).notNull(),
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }).notNull(),
  price: decimal("price", { precision: 8, scale: 2 }).default("0.00").notNull(),
  calories: int("calories"),
  isDefault: boolean("isDefault").default(false).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ProductExtra = typeof productExtras.$inferSelect;
export type InsertProductExtra = typeof productExtras.$inferInsert;

// ─── Site Settings ────────────────────────────────────────────────────────────
export const siteSettings = mysqlTable("siteSettings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;
// ─── Categories ───────────────────────────────────────────────────────────────
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }).default("Utensils").notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  displayOrder: int("displayOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
// ─── Events / Exhibitions ─────────────────────────────────────────────────────
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  titleAr: varchar("titleAr", { length: 200 }).notNull(),
  titleEn: varchar("titleEn", { length: 200 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  imageUrl: text("imageUrl"),
  location: varchar("location", { length: 300 }),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
