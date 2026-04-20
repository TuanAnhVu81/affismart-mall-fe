import { z } from "zod";

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

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
export type AffiliateRegisterFormValues = z.infer<typeof affiliateRegisterSchema>;
