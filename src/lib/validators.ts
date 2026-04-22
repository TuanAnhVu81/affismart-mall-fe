import { z } from "zod";

const requiredNumber = (fieldLabel: string) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      if (typeof value === "number") {
        return value;
      }

      return Number(value);
    },
    z.number({
      error: () => `${fieldLabel} is required.`,
    }),
  );

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long."),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters long.")
      .max(100, "Full name must be 100 characters or fewer."),
    email: z.string().email("Please enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const checkoutSchema = z.object({
  shippingAddress: z
    .string()
    .trim()
    .min(10, "Shipping address must be at least 10 characters long.")
    .max(300, "Shipping address must be 300 characters or fewer."),
});

export const affiliateRegisterSchema = z.object({
  promotionChannel: z
    .string()
    .trim()
    .min(1, "Promotion channel is required.")
    .max(100, "Promotion channel must be 100 characters or fewer."),
  bankInfo: z
    .string()
    .trim()
    .min(1, "Bank info is required.")
    .max(1000, "Bank info must be 1000 characters or fewer."),
});

export const adminCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required.")
    .max(100, "Category name must be 100 characters or fewer."),
  slug: z
    .string()
    .trim()
    .max(120, "Category slug must be 120 characters or fewer.")
    .optional()
    .or(z.literal("")),
});

export const adminProductSchema = z.object({
  categoryId: requiredNumber("Category").pipe(
    z.number().int("Category is required.").positive("Category is required."),
  ),
  name: z
    .string()
    .trim()
    .min(1, "Product name is required.")
    .max(255, "Product name must be 255 characters or fewer."),
  sku: z
    .string()
    .trim()
    .min(1, "SKU is required.")
    .max(100, "SKU must be 100 characters or fewer."),
  slug: z
    .string()
    .trim()
    .max(300, "Slug must be 300 characters or fewer.")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  price: requiredNumber("Price").pipe(
    z.number().positive("Price must be greater than 0."),
  ),
  stockQuantity: requiredNumber("Stock quantity").pipe(
    z
      .number()
      .int("Stock quantity must be a whole number.")
      .min(0, "Stock quantity cannot be negative."),
  ),
  imageUrl: z
    .string()
    .trim()
    .max(500, "Image URL must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
});

export const adminOrderStatusUpdateSchema = z.object({
  status: z.enum(["CONFIRMED", "SHIPPED", "DONE"], {
    error: () => "Please choose a valid next order status.",
  }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
export type AffiliateRegisterFormValues = z.infer<typeof affiliateRegisterSchema>;
export type AdminCategoryFormValues = z.infer<typeof adminCategorySchema>;
export type AdminProductFormValues = z.infer<typeof adminProductSchema>;
export type AdminOrderStatusUpdateFormValues = z.infer<typeof adminOrderStatusUpdateSchema>;
