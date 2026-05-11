import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createCateringRequest,
  createFeedback,
  createOrder,
  createOrderStatusNotification,
  createProduct,
  createProductReview,
  deleteProduct,
  getAllCateringRequests,
  getAllFeedback,
  getAllOrders,
  getAllPromoCodes,
  getAllUsers,
  getActiveSliders,
  getBranchById,
  getBranches,
  getCateringServices,
  getDashboardStats,
  getLoyaltyHistory,
  getLoyaltyPoints,
  getNutritionPlans,
  getOrderById,
  getOrderByNumber,
  getPackages,
  getProductById,
  getProductImages,
  getProductReviews,
  getProducts,
  getRatingDistribution,
  getRelatedProducts,
  getUnreadCount,
  getUserNotifications,
  getUserOrders,
  getUserReviewForProduct,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeNewsletter,
  updateBranch,
  updateOrderStatus,
  updateProduct,
  validatePromoCode,
  createSubscription,
  getUserSubscriptions,
  getAllSubscriptions,
  updateSubscriptionStatus,
  getInstapaySettings,
  updateInstapaySettings,
  saveProductExtras,
  getProductExtras,
  getAllSettings,
  updateSettings,
  getAllSliders,
  createSlider,
  updateSlider,
  deleteSlider,
  getAllPackagesAdmin,
  createPackage,
  updatePackage,
  deletePackage,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  getAllBranches,
  deleteBranch,
  createBranch,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
createNutritionPlan,
  updateNutritionPlanById,
  deleteNutritionPlan,
  getAllNutritionPlans,
} from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Products ──────────────────────────────────────────────────────────────

  products: router({
    list: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        maxCalories: z.number().optional(),
        search: z.string().optional(),
        featured: z.boolean().optional(),
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0),
      }))
      .query(async ({ input }) => getProducts(input)),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => getProductById(input.id)),

    create: adminProcedure
      .input(z.object({
        nameAr: z.string(),
        nameEn: z.string(),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        category: z.string(),
        price: z.number(),
        imageUrl: z.string().optional(),
        calories: z.number().optional(),
        protein: z.number().optional(),
        carbs: z.number().optional(),
        fat: z.number().optional(),
        isAvailable: z.boolean().optional().default(true),
        isFeatured: z.boolean().optional().default(false),
        branchId: z.number().optional(),
        hasExtras: z.boolean().optional().default(false),
        extras: z.array(z.object({
          type: z.enum(["sauce", "spice", "bread"]),
          nameAr: z.string(),
          nameEn: z.string(),
          price: z.number().optional().default(0),
          isDefault: z.boolean().optional().default(false),
          sortOrder: z.number().optional().default(0),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const productId = await createProduct({
          nameAr: input.nameAr,
          nameEn: input.nameEn,
          descriptionAr: input.descriptionAr ?? null,
          descriptionEn: input.descriptionEn ?? null,
          category: input.category,
          price: String(input.price),
          imageUrl: input.imageUrl ?? null,
          calories: input.calories ?? null,
          protein: input.protein ? String(input.protein) : null,
          carbs: input.carbs ? String(input.carbs) : null,
          fat: input.fat ? String(input.fat) : null,
          isAvailable: input.isAvailable,
          isFeatured: input.isFeatured,
          branchId: input.branchId ?? null,
          hasExtras: input.hasExtras ?? false,
          rating: "0.00",
          reviewCount: 0,
        });
        if (input.extras && input.extras.length > 0 && productId) {
          await saveProductExtras(productId, input.extras.map((e, i) => ({
            productId,
            type: e.type,
            nameAr: e.nameAr,
            nameEn: e.nameEn,
            price: String(e.price ?? 0),
            isDefault: e.isDefault ?? false,
            sortOrder: e.sortOrder ?? i,
          })));
        }
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        category: z.string().optional(),
        price: z.number().optional(),
        imageUrl: z.string().optional(),
        calories: z.number().optional(),
        protein: z.number().optional(),
        carbs: z.number().optional(),
        fat: z.number().optional(),
        isAvailable: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        branchId: z.number().optional().nullable(),
        hasExtras: z.boolean().optional(),
        extras: z.array(z.object({
          type: z.enum(["sauce", "spice", "bread"]),
          nameAr: z.string(),
          nameEn: z.string(),
          price: z.number().default(0),
          isDefault: z.boolean().default(false),
          sortOrder: z.number().default(0),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, price, extras, protein, carbs, fat, ...rest } = input;
        await updateProduct(id, {
          ...rest,
          ...(price !== undefined ? { price: String(price) } : {}),
          ...(protein !== undefined ? { protein: String(protein) } : {}),
          ...(carbs !== undefined ? { carbs: String(carbs) } : {}),
          ...(fat !== undefined ? { fat: String(fat) } : {}),
        });
        if (extras !== undefined) {
          await saveProductExtras(id, extras.map((e, i) => ({
            productId: id,
            type: e.type,
            nameAr: e.nameAr,
            nameEn: e.nameEn,
            price: String(e.price ?? 0),
            isDefault: e.isDefault ?? false,
            sortOrder: e.sortOrder ?? i,
          })));
        }
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteProduct(input.id);
        return { success: true };
      }),

    /** All extras/options for a product */
    extras: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => getProductExtras(input.productId)),
    /** All images for a product (sorted by sortOrder) */
    images: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => getProductImages(input.productId)),

    /** Paginated reviews + average rating + distribution */
    reviews: publicProcedure
      .input(z.object({
        productId: z.number(),
        limit: z.number().optional().default(10),
        offset: z.number().optional().default(0),
      }))
      .query(async ({ input }) => {
        const [reviewData, distribution] = await Promise.all([
          getProductReviews(input.productId, input.limit, input.offset),
          getRatingDistribution(input.productId),
        ]);
        return { ...reviewData, distribution };
      }),

    /** The authenticated user's own review for a product (null if none) */
    myReview: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ ctx, input }) => getUserReviewForProduct(input.productId, ctx.user.id)),

    /** Submit or update a review */
    addReview: protectedProcedure
      .input(z.object({
        productId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().max(1000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await createProductReview({
          productId: input.productId,
          userId: ctx.user.id,
          rating: input.rating,
          comment: input.comment ?? null,
        });
        return { success: true, updated: result.updated };
      }),

    /** Related products in the same category */
    related: publicProcedure
      .input(z.object({ productId: z.number(), category: z.string() }))
      .query(async ({ input }) => getRelatedProducts(input.productId, input.category, 4)),
  }),

  // ─── Branches ──────────────────────────────────────────────────────────────

  branches: router({
    list: publicProcedure.query(async () => getBranches()),
    listAll: adminProcedure.query(async () => getAllBranches()),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => getBranchById(input.id)),
    create: adminProcedure
      .input(z.object({
        nameAr: z.string().min(1),
        nameEn: z.string().min(1),
        addressAr: z.string().optional(),
        addressEn: z.string().optional(),
        phone: z.string().optional(),
        openingHours: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        await createBranch(input as any);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        addressAr: z.string().optional(),
        addressEn: z.string().optional(),
        phone: z.string().optional(),
        openingHours: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...rest } = input;
        await updateBranch(id, rest as any);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => { await deleteBranch(input.id); return { success: true }; }),
  }),

  // ─── Sliders ───────────────────────────────────────────────────────────────
  sliders: router({
    list: publicProcedure.query(async () => getActiveSliders()),
    listAll: publicProcedure.query(() => getAllSliders()),
    create: adminProcedure
      .input(z.object({
        titleAr: z.string(),
        titleEn: z.string(),
        subtitleAr: z.string().optional(),
        subtitleEn: z.string().optional(),
        imageUrl: z.string(),
        link: z.string().optional(),
        displayOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => { await createSlider(input); return { success: true }; }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        titleAr: z.string().optional(),
        titleEn: z.string().optional(),
        subtitleAr: z.string().optional(),
        subtitleEn: z.string().optional(),
        imageUrl: z.string().optional(),
        link: z.string().optional(),
        displayOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => { const { id, ...rest } = input; await updateSlider(id, rest); return { success: true }; }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => { await deleteSlider(input.id); return { success: true }; }),
  }),
  // ─── Orders ────────────────────────────────────────────────────────────────

  orders: router({
    create: protectedProcedure
      .input(z.object({
        branchId: z.number().optional(),
        paymentMethod: z.enum(["cash", "card", "instapay"]),
        deliveryType: z.enum(["dine_in", "delivery", "pickup"]),
        deliveryAddress: z.string().optional(),
        notes: z.string().optional(),
        promoCode: z.string().optional(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number().min(1),
          unitPrice: z.number(),
          specialInstructions: z.string().optional(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const subtotal = input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        let discountAmount = 0;
        let promoCodeId: number | undefined;
        if (input.promoCode) {
          const promoResult = await validatePromoCode(input.promoCode, subtotal);
          if (promoResult) {
            discountAmount = promoResult.discount;
            promoCodeId = promoResult.promo.id;
          }
        }
        const totalAmount = subtotal - discountAmount;
        const orderNumber = await createOrder({
          userId: ctx.user.id,
          branchId: input.branchId,
          paymentMethod: input.paymentMethod,
          deliveryType: input.deliveryType,
          deliveryAddress: input.deliveryAddress,
          notes: input.notes,
          subtotal,
          discountAmount,
          totalAmount,
          promoCodeId,
          items: input.items,
        });
        return { success: true, orderNumber };
      }),

    myOrders: protectedProcedure.query(async ({ ctx }) => getUserOrders(ctx.user.id)),

    byNumber: protectedProcedure
      .input(z.object({ orderNumber: z.string() }))
      .query(async ({ input, ctx }) => getOrderByNumber(input.orderNumber, ctx.user.id)),

    // Admin: get all orders
    all: adminProcedure
      .input(z.object({ limit: z.number().optional().default(50), offset: z.number().optional().default(0), status: z.string().optional() }))
      .query(async ({ input }) => getAllOrders(input.limit, input.offset, input.status)),

    updateStatus: adminProcedure
      .input(z.object({ id: z.number(), status: z.enum(["pending", "confirmed", "preparing", "ready", "on_the_way", "delivered", "cancelled"]) }))
      .mutation(async ({ input }) => {
        // Fetch order before updating to get userId and orderNumber
        const order = await getOrderById(input.id);
        await updateOrderStatus(input.id, input.status);
        // Fire-and-forget: create notification for the order owner
        if (order?.userId) {
          createOrderStatusNotification(
            order.userId,
            order.id,
            order.orderNumber,
            input.status
          ).catch((err) => console.error("[Notification] Failed:", err));
        }
        return { success: true };
      }),
  }),

  // ─── Promo Codes ───────────────────────────────────────────────────────────

  promoCodes: router({
    validate: publicProcedure
      .input(z.object({ code: z.string(), orderAmount: z.number() }))
      .mutation(async ({ input }) => {
        const result = await validatePromoCode(input.code, input.orderAmount);
        if (!result) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired promo code" });
        return {
          valid: true,
          discount: result.discount,
          discountType: result.promo.discountType,
          discountValue: Number(result.promo.discountValue),
          description: result.promo.descriptionAr,
        };
      }),
    all: adminProcedure.query(async () => getAllPromoCodes()),
    listActive: publicProcedure.query(async () => {
      const all = await getAllPromoCodes();
      const now = new Date();
      return all.filter((c: any) => {
        if (!c.isActive || !c.showOnHome) return false;
        if (c.validUntil && new Date(c.validUntil) < now) return false;
        if (c.validFrom && new Date(c.validFrom) > now) return false;
        return true;
      });
    }),
    create: adminProcedure
      .input(z.object({
        code: z.string().min(2).max(50),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        discountType: z.enum(["percentage", "fixed"]),
        discountValue: z.number().positive(),
        minOrderAmount: z.number().optional(),
        maxUsageCount: z.number().optional(),
        validFrom: z.string(),
        validUntil: z.string().optional(),
        isActive: z.boolean().default(true),
        showOnHome: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        await createPromoCode({
          ...input,
          validFrom: new Date(input.validFrom),
          validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
        });
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        discountType: z.enum(["percentage", "fixed"]).optional(),
        discountValue: z.number().optional(),
        minOrderAmount: z.number().optional(),
        maxUsageCount: z.number().optional(),
        validFrom: z.string().optional(),
        validUntil: z.string().nullable().optional(),
        isActive: z.boolean().optional(),
        showOnHome: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, validFrom, validUntil, ...rest } = input;
        await updatePromoCode(id, {
          ...rest,
          ...(validFrom ? { validFrom: new Date(validFrom) } : {}),
          ...(validUntil !== undefined ? { validUntil: validUntil ? new Date(validUntil) : null } : {}),
        });
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => { await deletePromoCode(input.id); return { success: true }; }),
  }),

  // ─── Catering ──────────────────────────────────────────────────────────────

  catering: router({
    services: publicProcedure.query(async () => getCateringServices()),
    request: publicProcedure
      .input(z.object({
        serviceId: z.number(),
        guestCount: z.number().min(1),
        eventDate: z.string(),
        eventType: z.string().optional(),
        locationAr: z.string().optional(),
        locationEn: z.string().optional(),
        contactName: z.string(),
        contactPhone: z.string(),
        contactEmail: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await createCateringRequest({ ...input, userId: ctx.user?.id });
        return { success: true };
      }),
    allRequests: adminProcedure.query(async () => getAllCateringRequests()),
  }),

  // ─── Nutrition Plans ───────────────────────────────────────────────────────

  nutrition: router({
    plans: publicProcedure.query(async () => getNutritionPlans()),
  }),

  // ─── Packages ──────────────────────────────────────────────────────────────

  packages: router({
    list: publicProcedure.query(async () => getPackages()),
  }),

  // ─── Feedback ──────────────────────────────────────────────────────────────

  feedback: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        type: z.enum(["feedback", "complaint", "suggestion"]),
        orderId: z.number().optional(),
        subject: z.string().optional(),
        message: z.string().min(10),
        rating: z.number().min(1).max(5).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await createFeedback({ ...input, userId: ctx.user?.id });
        return { success: true };
      }),
    all: adminProcedure
      .input(z.object({ type: z.string().optional() }))
      .query(async ({ input }) => getAllFeedback(input.type)),
  }),

  // ─── Loyalty ───────────────────────────────────────────────────────────────

  loyalty: router({
    myPoints: protectedProcedure.query(async ({ ctx }) => getLoyaltyPoints(ctx.user.id)),
    myHistory: protectedProcedure.query(async ({ ctx }) => getLoyaltyHistory(ctx.user.id)),
  }),

  // ─── Newsletter ────────────────────────────────────────────────────────────

  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        await subscribeNewsletter(input.email);
        return { success: true };
      }),
  }),

    // ─── Notifications ─────────────────────────────────────────────────────────
  notifications: router({
    /** List latest notifications for the authenticated user */
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional().default(20) }))
      .query(async ({ ctx, input }) => getUserNotifications(ctx.user.id, input.limit)),

    /** Count of unread notifications (used for badge polling) */
    unreadCount: protectedProcedure.query(async ({ ctx }) => ({
      count: await getUnreadCount(ctx.user.id),
    })),

    /** Mark a single notification as read */
    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markNotificationRead(input.id, ctx.user.id);
        return { success: true };
      }),

    /** Mark all notifications as read */
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  // ─── Subscriptions ────────────────────────────────────────────────────────
  subscriptions: router({
    /** Get InstaPay settings (public - needed to show payment info) */
    instapaySettings: publicProcedure.query(async () => getInstapaySettings()),
    /** Subscribe to a nutrition plan */
    subscribe: protectedProcedure
      .input(z.object({
        planId: z.number(),
        planNameAr: z.string(),
        planNameEn: z.string(),
        amount: z.number(),
        instapayRef: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await createSubscription({
          userId: ctx.user.id,
          planId: input.planId,
          planNameAr: input.planNameAr,
          planNameEn: input.planNameEn,
          amount: String(input.amount),
          instapayRef: input.instapayRef,
          status: "pending",
        });
        return { success: true, subscriptionId: id };
      }),
    /** Get current user's subscriptions */
    mySubscriptions: protectedProcedure.query(async ({ ctx }) =>
      getUserSubscriptions(ctx.user.id)
    ),
  }),
  // ─── Admin Dashboard ───────────────────────────────────────────────────────
  admin: router({
    stats: adminProcedure.query(async () => getDashboardStats()),
    users: adminProcedure
      .input(z.object({ limit: z.number().optional().default(50), offset: z.number().optional().default(0) }))
      .query(async ({ input }) => getAllUsers(input.limit, input.offset)),
    /** Admin: list all subscriptions */
    subscriptions: adminProcedure
      .input(z.object({ limit: z.number().optional().default(50), offset: z.number().optional().default(0) }))
      .query(async ({ input }) => getAllSubscriptions(input.limit, input.offset)),
    /** Admin: update subscription status */
    updateSubscription: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "active", "cancelled", "expired"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateSubscriptionStatus(input.id, input.status, input.notes);
        return { success: true };
      }),
    /** Admin: get InstaPay settings */
    getInstapaySettings: adminProcedure.query(async () => getInstapaySettings()),
    /** Admin: update InstaPay settings */
    updateInstapaySettings: adminProcedure
      .input(z.object({
        accountPhone: z.string().optional(),
        accountName: z.string().optional(),
        instructions: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateInstapaySettings(input);
        return { success: true };
      }),
   /** Admin: get all nutrition plans */
    allNutritionPlans: adminProcedure.query(async () => getAllNutritionPlans()),

    /** Admin: create nutrition plan */
    createNutritionPlan: adminProcedure
      .input(z.object({
        titleAr: z.string(),
        titleEn: z.string(),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        price: z.number(),
        imageUrl: z.string().optional(),
        isActive: z.boolean().optional().default(true),
        features: z.string().optional(),
        durationDays: z.number().optional().default(30),
        mealsPerDay: z.number().optional().default(3),
        caloriesTarget: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await createNutritionPlan(input);
        return { success: true };
      }),

    /** Admin: update nutrition plan */
    updateNutritionPlan: adminProcedure
      .input(z.object({
        id: z.number(),
        titleAr: z.string().optional(),
        titleEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        price: z.number().optional(),
        imageUrl: z.string().optional(),
        isActive: z.boolean().optional(),
        features: z.string().optional(),
        durationDays: z.number().optional(),
        mealsPerDay: z.number().optional(),
        caloriesTarget: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...rest } = input;
        await updateNutritionPlanById(id, rest);
        return { success: true };
      }),

    /** Admin: delete nutrition plan */
    deleteNutritionPlan: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteNutritionPlan(input.id);
        return { success: true };
      }),
  }),
  // ─── Packages Admin ────────────────────────────────────────────────────────
  packagesAdmin: router({
    list: publicProcedure.query(() => getAllPackagesAdmin()),
    create: adminProcedure
      .input(z.object({
        titleAr: z.string(),
        titleEn: z.string(),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        mealCount: z.number(),
        originalPrice: z.number(),
        discountedPrice: z.number(),
        discountPercentage: z.number().optional(),
        imageUrl: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => { await createPackage(input); return { success: true }; }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        titleAr: z.string().optional(),
        titleEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        mealCount: z.number().optional(),
        originalPrice: z.number().optional(),
        discountedPrice: z.number().optional(),
        discountPercentage: z.number().optional(),
        imageUrl: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => { const { id, ...rest } = input; await updatePackage(id, rest); return { success: true }; }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => { await deletePackage(input.id); return { success: true }; }),
  }),

  // ─── Image Upload ────────────────────────────────────────────────────────
  upload: router({
    image: adminProcedure
      .input(z.object({
        base64: z.string(),
        filename: z.string(),
        mimeType: z.string().default("image/jpeg"),
        folder: z.string().default("uploads"),
      }))
      .mutation(async ({ input }) => {
        const { storagePut } = await import("./storage");
        const buffer = Buffer.from(input.base64, "base64");
        const key = `${input.folder}/${input.filename}`;
        const result = await storagePut(key, buffer, input.mimeType);
        return { url: result.url, key: result.key };
      }),
  }),

  // ─── Categories ──────────────────────────────────────────────────────────────
  categories: router({
    list: publicProcedure.query(() => getCategories(false)),
    listActive: publicProcedure.query(() => getCategories(true)),
    create: adminProcedure
      .input(z.object({
        nameAr: z.string().min(1),
        nameEn: z.string().min(1),
        icon: z.string().default("Utensils"),
        slug: z.string().min(1),
        displayOrder: z.number().int().default(0),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => { await createCategory(input); return { success: true }; }),
    update: adminProcedure
      .input(z.object({
        id: z.number().int(),
        nameAr: z.string().min(1).optional(),
        nameEn: z.string().min(1).optional(),
        icon: z.string().optional(),
        slug: z.string().optional(),
        displayOrder: z.number().int().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => { const { id, ...data } = input; await updateCategory(id, data); return { success: true }; }),
    delete: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => { await deleteCategory(input.id); return { success: true }; }),
  }),
  // ─── Events / Exhibitions ────────────────────────────────────────────────────
  events: router({
    list: publicProcedure.query(() => getEvents(false)),
    listActive: publicProcedure.query(() => getEvents(true)),
    create: adminProcedure
      .input(z.object({
        titleAr: z.string().min(1),
        titleEn: z.string().min(1),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        imageUrl: z.string().optional(),
        location: z.string().optional(),
        startDate: z.date(),
        endDate: z.date().optional(),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => { await createEvent(input); return { success: true }; }),
    update: adminProcedure
      .input(z.object({
        id: z.number().int(),
        titleAr: z.string().min(1).optional(),
        titleEn: z.string().min(1).optional(),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        imageUrl: z.string().optional(),
        location: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => { const { id, ...data } = input; await updateEvent(id, data); return { success: true }; }),
    delete: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => { await deleteEvent(input.id); return { success: true }; }),
  }),
  // ─── Site Settings ─────────────────────────────────────────────────────────
  settings: router({
    get: publicProcedure.query(() => getAllSettings()),
    update: adminProcedure
      .input(z.object({
        entries: z.array(z.object({ key: z.string(), value: z.string() })),
      }))
      .mutation(async ({ input }) => { await updateSettings(input.entries); return { success: true }; }),
  }),
});
export type AppRouter = typeof appRouter;
