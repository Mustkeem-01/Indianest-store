import { pgTable, text, integer, timestamp, uuid, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type UserRole = "admin" | "user" | "customer";

export type CheckoutSession = {
  productId: string;
  quantity: number;
  unitPrice: number;
  url: string;
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  role: text("role").$type<UserRole>().notNull().default("customer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  currency: text("currency").notNull().default("Rupees"),
  description: text("description"),
  price: integer("price").notNull(),
  imageUrl: text("image_url"),
  imagekitFileId: text("imagekit_file_id"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const checkoutSessions = pgTable("checkout_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  polarCheckoutSessionId: text("polar_checkout_session_id").notNull().unique(),
  lines: jsonb("lines").$type<CheckoutSession[]>().notNull(),
  totalRupees: integer("total_rupees").notNull(),
  currency: text("currency").notNull().default("Rupees"),
  sessionData: jsonb("session_data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  checkoutSessionId: uuid("checkout_session_id").notNull().references(() => checkoutSessions.id, { onDelete: "cascade" }),
  polarCheckoutSessionId: text("polar_checkout_session_id").notNull(),
  polarOrderId: text("polar_order_id").notNull().unique(),
  totalRupees: integer("total_rupees").notNull(),
  currency: text("currency").notNull().default("Rupees"),
  status: text("status").$type<OrderStatus>().notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
  totalPrice: integer("total_price").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userRelations = relations(users, ({ many }) => ({
  checkoutSessions: many(checkoutSessions),
  orders: many(orders),
}));

export const productRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
}));

export const checkoutSessionRelations = relations(checkoutSessions, ({ one }) => ({
  user: one(users, {
    fields: [checkoutSessions.userId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  checkoutSession: one(checkoutSessions, {
    fields: [orders.checkoutSessionId],
    references: [checkoutSessions.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));