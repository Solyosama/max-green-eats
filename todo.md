# Max Green Eats - TODO

## Database & Backend
- [x] Extended schema: products, branches, orders, promo codes, sliders, catering, nutrition plans, packages, feedback, loyalty points
- [x] Seed data for all tables
- [x] Backend API routes for all features
- [x] Admin authentication system (role-based)
- [x] Order management procedures
- [x] Promo code validation
- [x] Loyalty points system

## Frontend - Core
- [x] i18n system (Arabic/English with RTL support)
- [x] Global layout with Navbar and Footer
- [x] Green color theme in index.css (OKLCH)
- [x] Language switcher component (AR/EN toggle)
- [x] Cart context with localStorage persistence
- [x] RTL/LTR CSS support

## Frontend - Pages
- [x] Home page: hero slider, featured products, categories, offers, testimonials, stats
- [x] Menu/Products page with filters (category, price, calories, sort)
- [x] Shopping cart with promo code, address, payment method
- [x] Checkout flow (address, payment, confirmation)
- [x] Order tracking page with stages and timeline
- [x] Branches page with cards and Google Maps integration
- [x] Catering services page with booking form
- [x] Nutrition plans page
- [x] Packages page with add to cart
- [x] Contact/feedback/complaints/suggestions page with star rating
- [x] Loyalty points page with history
- [x] Admin dashboard (products CRUD, orders, users, catering, feedback)

## Tests
- [x] Auth logout test passing

## Additional Enhancements
- [x] Product card hover animations
- [x] Promo code copy button on home page
- [x] Default data fallbacks when DB is empty
- [x] Mobile-responsive design
- [x] Skeleton loading states
- [x] Error handling with toast notifications

## Notification System
- [x] Add notifications table to schema (id, userId, type, titleAr, titleEn, messageAr, messageEn, isRead, orderId, createdAt)
- [x] Add DB helpers: createNotification, getUserNotifications, markAsRead, markAllAsRead
- [x] Add tRPC procedures: notifications.list, notifications.markRead, notifications.markAllRead, notifications.unreadCount
- [x] Auto-send notification when order status changes (in updateStatus procedure)
- [x] Build NotificationBell component with dropdown and unread badge
- [x] Add polling (every 30s) for new notifications when user is authenticated
- [x] Show toast popup when new notification arrives
- [x] Add notification bell to Navbar
- [x] Write vitest test for notification creation

## Product Detail Page
- [x] Add productReviews table (id, productId, userId, rating 1-5, comment, isVerified, createdAt)
- [x] Add productImages table (id, productId, imageUrl, altAr, altEn, sortOrder)
- [x] Seed product images and sample reviews
- [x] Add DB helpers: getProductReviews, createReview, getProductImages, getAverageRating, getRatingDistribution, getRelatedProducts
- [x] Add tRPC procedures: products.reviews, products.addReview, products.images, products.myReview, products.related
- [x] Build ProductDetail page (/product/:id) with image gallery, nutrition facts, reviews
- [x] Add star rating input component for submitting reviews
- [x] Add rating distribution bar chart
- [x] Add related products section
- [x] Link product cards in Menu and Home to /product/:id
- [x] Register /product/:id route in App.tsx
- [x] All 5 tests passing

## InstaPay Payment & Subscriptions Management
- [x] Add nutritionSubscriptions table (id, userId, planId, status, startDate, endDate, amount, instapayRef, createdAt)
- [x] Add instapaySettings table (id, accountPhone, accountName, updatedAt) for admin config
- [x] Add DB helpers for subscriptions CRUD
- [x] Add tRPC procedures: subscriptions.subscribe, subscriptions.mySubscriptions, subscriptions.cancel, admin.subscriptions.list, admin.subscriptions.updateStatus, admin.instapay.getSettings, admin.instapay.updateSettings
- [x] Update Nutrition page: replace "اشترك الآن" button with InstaPay direct payment flow (show phone, amount, reference)
- [x] Add subscription confirmation dialog with InstaPay instructions
- [x] Build Admin Subscriptions panel: list all subscriptions, filter by status, update status, view details
- [x] Build Admin Nutrition Plans panel: edit plan name, description, price, image, features
- [x] Build Admin InstaPay Settings panel: update account phone and name

## WhatsApp Floating Button
- [x] Create WhatsAppButton component with animated floating button
- [x] Show tooltip on hover with "تواصل معنا عبر واتساب"
- [x] Open WhatsApp chat with pre-filled message on click
- [x] Add to App.tsx so it appears on all pages
- [x] Hide on admin page to avoid clutter
- [x] Chat panel with message bubble and Start Chat button

## Product Branch & Extras Management
- [x] Add branchId FK to products table (nullable)
- [x] Add hasExtras boolean to products table
- [x] Add productExtras table: (id, productId, type [sauce|spice|bread], nameAr, nameEn, price, isDefault)
- [x] Update DB helpers: getProducts to join branch name, CRUD for productExtras
- [x] Update tRPC procedures: admin.products.create/update to accept branchId and extras
- [x] Update Admin products table to show branch name column
- [x] Add branch select dropdown to product add/edit form
- [x] Add extras section to product form: enable/disable, add sauce options, spicy/original toggle, bread type options
- [x] Show extras in product detail page (ProductDetail.tsx)

## Admin Dashboard Extended Panels
- [x] Add siteSettings table (key, value, updatedAt) for logo, colors, phone, address, social links
- [x] Add full CRUD procedures for sliders (sliders.listAll/create/update/delete)
- [x] Add full CRUD procedures for packages (packagesAdmin.list/create/update/delete)
- [x] Add siteSettings procedures (settings.get/update)
- [x] Build Admin Slider panel: list sliders, add/edit/delete with image, title, subtitle, CTA
- [x] Build Admin Packages panel: list packages, add/edit/delete like products
- [x] Build Admin Shipment Tracking panel: visual progress bar per order, search, status update
- [x] Build Admin Site Settings panel: logo URL, primary color, phone, address, social links, site name
- [x] Apply siteSettings dynamically on frontend (CSS variable injection, logo, contact info, WhatsApp)

## Promo Codes & Branches Management + Image Upload
- [x] Add Admin Promo Codes panel: list/create/edit/delete promo codes with expiry date, discount %, visibility toggle (show/hide on home page)
- [x] Add Admin Branches panel: list/create/edit/delete branches with name (AR/EN), address, phone, hours, lat/lng
- [x] Add direct image upload for Products (no URL required)
- [x] Add direct image upload for Sliders (no URL required)
- [x] Add direct image upload for Packages (no URL required)
- [x] Primary color default is green (#16a34a) in DB, admin can still customize it

## Categories & Events Management
- [ ] Add categories table (id, nameAr, nameEn, icon, slug, displayOrder, isActive)
- [ ] Add events table (id, titleAr, titleEn, descriptionAr, descriptionEn, imageUrl, location, startDate, endDate, isActive, createdAt)
- [ ] Add DB helpers for categories and events CRUD
- [ ] Add tRPC procedures: categories.list (public), admin.categories.create/update/delete
- [ ] Add tRPC procedures: events.list (public), admin.events.create/update/delete
- [ ] Build Admin Categories panel: list/add/edit/delete categories with icon and order
- [ ] Build Admin Events panel: list/add/edit/delete events with image upload, date, location
- [ ] Update Menu page to use dynamic categories from DB (replace hardcoded list)
- [ ] Create Events/Exhibitions page (/events) with cards, dates, and details
- [ ] Add "الفاعليات" link to Navbar next to "الفروع"
- [ ] Register /events route in App.tsx

## Product Extras Enhancement (Bread & Sauce with Calories)
- [ ] Add calories field to productExtras table (nullable int)
- [ ] Update admin product form: bread types section with name (AR/EN), price, calories, add/edit/delete
- [ ] Update admin product form: sauce types section with name (AR/EN), price, calories, add/edit/delete
- [ ] Show bread/sauce calories in ProductDetail page
