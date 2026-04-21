import api from "@/services/api";
import type {
  AffiliateAccountStatus,
  PaginatedResult,
  PayoutStatus,
} from "@/types/affiliate.types";
import type { UserRole } from "@/types/auth.types";
import type {
  AdminAffiliateAccount,
  AdminAffiliateAccountsQueryParams,
  AdminLowStockProductsResult,
  AdminOrderDetail,
  AdminOrdersQueryParams,
  AdminPayoutRequest,
  AdminPayoutRequestsQueryParams,
  AdminProductsQueryParams,
  AdminUserProfile,
  AdminUsersQueryParams,
  ProductImageUploadResult,
  ResetUserPasswordPayload,
  UpdateAffiliateAccountStatusPayload,
  UpdateAffiliateCommissionRatePayload,
  UpdateCategoryStatusPayload,
  UpdateOrderStatusPayload,
  UpdatePayoutRequestStatusPayload,
  UpdateProductStatusPayload,
  UpdateUserStatusPayload,
  UpsertCategoryPayload,
  UpsertProductPayload,
  UserStatus,
} from "@/types/admin.types";
import type { OrderDetail, OrderItemDetail, OrderSummary } from "@/types/order.types";
import type { Category, Product, ProductListResponse } from "@/types/product.types";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface PagePayload<T> {
  content: T[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
  last: boolean;
}

interface CategoryPayload {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ProductPayload {
  id: number;
  category_id: number;
  category_name: string;
  name: string;
  sku?: string | null;
  slug: string;
  description?: string | null;
  price: number | string;
  stock_quantity?: number | null;
  image_url?: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface UserSummaryPayload {
  id: number;
  email: string;
  full_name: string;
  phone?: string | null;
  status: string;
  roles: string[];
  created_at?: string;
  updated_at?: string;
}

interface UserProfilePayload extends UserSummaryPayload {
  default_shipping_address?: string | null;
}

interface OrderSummaryPayload {
  id: number;
  status: string;
  total_amount: number | string;
  shipping_address: string;
  created_at?: string;
}

interface OrderItemDetailPayload {
  product_id: number;
  product_name: string;
  product_sku?: string | null;
  quantity: number;
  price_at_time: number | string;
  line_total: number | string;
}

interface OrderDetailPayload {
  id: number;
  status: string;
  total_amount: number | string;
  discount_amount: number | string;
  shipping_address: string;
  created_at?: string;
  updated_at?: string;
  items: OrderItemDetailPayload[];
}

interface AdminAffiliateAccountPayload {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  bank_info?: string | null;
  ref_code: string;
  promotion_channel: string;
  status: string;
  commission_rate: number | string;
  balance: number | string;
  created_at?: string;
  updated_at?: string;
}

interface AdminPayoutRequestPayload {
  id: number;
  affiliate_account_id: number;
  affiliate_user_id: number;
  affiliate_full_name: string;
  affiliate_email: string;
  affiliate_ref_code: string;
  bank_info?: string | null;
  amount: number | string;
  status: string;
  admin_note?: string | null;
  resolved_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface ProductImageUploadPayload {
  secure_url: string;
}

interface AffiliateAccountUpdatePayload {
  id: number;
  user_id: number;
  ref_code: string;
  promotion_channel: string;
  status: string;
  commission_rate: number | string;
  balance: number | string;
  created_at?: string;
  updated_at?: string;
}

interface PayoutRequestUpdatePayload {
  id: number;
  affiliate_account_id: number;
  amount: number | string;
  status: string;
  admin_note?: string | null;
  resolved_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

const unwrapData = <T>(payload: ApiResponse<T> | T, errorMessage: string): T => {
  const data =
    payload && typeof payload === "object" && "data" in payload
      ? payload.data
      : payload;

  if (data === undefined || data === null) {
    throw new Error(errorMessage);
  }

  return data as T;
};

const toNumber = (value: number | string | undefined | null, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeUserRole = (role: string): UserRole | null => {
  const normalizedRole = role.replace(/^ROLE_/, "").toUpperCase();

  if (normalizedRole === "ADMIN") {
    return "ADMIN";
  }

  if (normalizedRole === "AFFILIATE") {
    return "AFFILIATE";
  }

  if (normalizedRole === "CUSTOMER") {
    return "CUSTOMER";
  }

  return null;
};

const normalizeRoles = (roles: string[] | undefined): UserRole[] => {
  if (!roles?.length) {
    return ["CUSTOMER"];
  }

  const uniqueRoles = Array.from(
    new Set(roles.map(normalizeUserRole).filter((role): role is UserRole => Boolean(role))),
  );

  return uniqueRoles.length ? uniqueRoles : ["CUSTOMER"];
};

const toCategory = (payload: CategoryPayload): Category => ({
  id: payload.id,
  name: payload.name,
  slug: payload.slug,
  isActive: payload.active,
  createdAt: payload.created_at,
  updatedAt: payload.updated_at,
});

const toProduct = (payload: ProductPayload): Product => ({
  id: payload.id,
  categoryId: payload.category_id,
  categoryName: payload.category_name,
  name: payload.name,
  sku: payload.sku ?? undefined,
  slug: payload.slug,
  description: payload.description ?? null,
  price: toNumber(payload.price),
  stockQuantity: payload.stock_quantity ?? 0,
  imageUrl: payload.image_url ?? null,
  isActive: payload.active,
  createdAt: payload.created_at,
  updatedAt: payload.updated_at,
});

const toOrderSummary = (payload: OrderSummaryPayload): OrderSummary => ({
  id: payload.id,
  status: payload.status as OrderSummary["status"],
  totalAmount: toNumber(payload.total_amount),
  shippingAddress: payload.shipping_address,
  createdAt: payload.created_at ?? "",
});

const toOrderItemDetail = (payload: OrderItemDetailPayload): OrderItemDetail => ({
  productId: payload.product_id,
  productName: payload.product_name,
  productSku: payload.product_sku ?? null,
  quantity: payload.quantity,
  priceAtTime: toNumber(payload.price_at_time),
  lineTotal: toNumber(payload.line_total),
});

const toOrderDetail = (payload: OrderDetailPayload): OrderDetail => ({
  id: payload.id,
  status: payload.status as OrderDetail["status"],
  totalAmount: toNumber(payload.total_amount),
  discountAmount: toNumber(payload.discount_amount),
  shippingAddress: payload.shipping_address,
  createdAt: payload.created_at ?? "",
  updatedAt: payload.updated_at ?? "",
  items: payload.items.map(toOrderItemDetail),
});

const toAdminUserProfile = (payload: UserProfilePayload): AdminUserProfile => ({
  id: payload.id,
  email: payload.email,
  fullName: payload.full_name,
  phone: payload.phone ?? null,
  defaultShippingAddress: payload.default_shipping_address ?? null,
  status: payload.status as UserStatus,
  roles: normalizeRoles(payload.roles),
  createdAt: payload.created_at,
  updatedAt: payload.updated_at,
});

const toAdminUserSummary = (payload: UserSummaryPayload) => ({
  id: payload.id,
  email: payload.email,
  fullName: payload.full_name,
  phone: payload.phone ?? null,
  status: payload.status as UserStatus,
  roles: normalizeRoles(payload.roles),
  createdAt: payload.created_at,
  updatedAt: payload.updated_at,
});

const toAdminAffiliateAccount = (
  payload: AdminAffiliateAccountPayload,
): AdminAffiliateAccount => ({
  id: payload.id,
  userId: payload.user_id,
  fullName: payload.full_name,
  email: payload.email,
  bankInfo: payload.bank_info ?? null,
  refCode: payload.ref_code,
  promotionChannel: payload.promotion_channel,
  status: payload.status as AffiliateAccountStatus,
  commissionRate: toNumber(payload.commission_rate),
  balance: toNumber(payload.balance),
  createdAt: payload.created_at,
  updatedAt: payload.updated_at,
});

const toAdminAffiliateAccountFromUpdate = (
  payload: AffiliateAccountUpdatePayload,
): AdminAffiliateAccount => ({
  id: payload.id,
  userId: payload.user_id,
  fullName: "",
  email: "",
  bankInfo: null,
  refCode: payload.ref_code,
  promotionChannel: payload.promotion_channel,
  status: payload.status as AffiliateAccountStatus,
  commissionRate: toNumber(payload.commission_rate),
  balance: toNumber(payload.balance),
  createdAt: payload.created_at,
  updatedAt: payload.updated_at,
});

const toAdminPayoutRequest = (
  payload: AdminPayoutRequestPayload,
): AdminPayoutRequest => ({
  id: payload.id,
  affiliateAccountId: payload.affiliate_account_id,
  affiliateUserId: payload.affiliate_user_id,
  affiliateFullName: payload.affiliate_full_name,
  affiliateEmail: payload.affiliate_email,
  affiliateRefCode: payload.affiliate_ref_code,
  bankInfo: payload.bank_info ?? null,
  amount: toNumber(payload.amount),
  status: payload.status as PayoutStatus,
  adminNote: payload.admin_note ?? null,
  resolvedAt: payload.resolved_at ?? null,
  createdAt: payload.created_at,
  updatedAt: payload.updated_at,
});

const toAdminPayoutRequestFromUpdate = (
  payload: PayoutRequestUpdatePayload,
): AdminPayoutRequest => ({
  id: payload.id,
  affiliateAccountId: payload.affiliate_account_id,
  affiliateUserId: 0,
  affiliateFullName: "",
  affiliateEmail: "",
  affiliateRefCode: "",
  bankInfo: null,
  amount: toNumber(payload.amount),
  status: payload.status as PayoutStatus,
  adminNote: payload.admin_note ?? null,
  resolvedAt: payload.resolved_at ?? null,
  createdAt: payload.created_at,
  updatedAt: payload.updated_at,
});

const toPaginatedResult = <T, U>(
  payload: PagePayload<T>,
  mapper: (item: T) => U,
): PaginatedResult<U> => ({
  content: payload.content.map(mapper),
  page: payload.page,
  size: payload.size,
  totalElements: payload.total_elements,
  totalPages: payload.total_pages,
  last: payload.last,
});

const sanitizeAdminListParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

const getAdminCategoriesForRead = async (active?: boolean) => {
  const { data } = await api.get<ApiResponse<CategoryPayload[]>>("/admin/categories", {
    params: sanitizeAdminListParams({
      active,
    }),
  });
  const responsePayload = unwrapData(data, "Invalid admin categories response payload.");

  return responsePayload.map(toCategory);
};

export const getAdminCategories = async () => ({
  items: await getAdminCategoriesForRead(),
});

export const getAdminCategoryDetail = async (categoryId: number) => {
  const categories = await getAdminCategoriesForRead();
  const category = categories.find((item) => item.id === categoryId);

  if (!category) {
    throw new Error("Admin category detail endpoint is unavailable and category was not found.");
  }

  return category;
};

export const createAdminCategory = async (payload: UpsertCategoryPayload) => {
  const { data } = await api.post<ApiResponse<CategoryPayload>>("/categories", {
    name: payload.name.trim(),
    slug: payload.slug?.trim() || undefined,
  });
  const responsePayload = unwrapData(data, "Invalid create category response payload.");

  return toCategory(responsePayload);
};

export const updateAdminCategory = async (
  categoryId: number,
  payload: UpsertCategoryPayload,
) => {
  const { data } = await api.put<ApiResponse<CategoryPayload>>(
    `/categories/${categoryId}`,
    {
      name: payload.name.trim(),
      slug: payload.slug?.trim() || undefined,
    },
  );
  const responsePayload = unwrapData(data, "Invalid update category response payload.");

  return toCategory(responsePayload);
};

export const updateAdminCategoryStatus = async (
  categoryId: number,
  payload: UpdateCategoryStatusPayload,
) => {
  const { data } = await api.put<ApiResponse<CategoryPayload>>(
    `/categories/${categoryId}/status`,
    {
      active: payload.active,
    },
  );
  const responsePayload = unwrapData(data, "Invalid category status response payload.");

  return toCategory(responsePayload);
};

export const getAdminProducts = async (
  params: AdminProductsQueryParams = {},
): Promise<ProductListResponse> => {
  const { data } = await api.get<ApiResponse<PagePayload<ProductPayload>>>("/admin/products", {
    params: sanitizeAdminListParams({
      keyword: params.search,
      category_id: params.categoryId,
      min_price: params.minPrice,
      max_price: params.maxPrice,
      page: params.page,
      size: params.size,
      sort_by: params.sortBy,
      sort_dir: params.sortDir,
      active: params.active,
    }),
  });
  const responsePayload = unwrapData(data, "Invalid admin products response payload.");

  return {
    content: responsePayload.content.map(toProduct),
    page: responsePayload.page,
    size: responsePayload.size,
    totalElements: responsePayload.total_elements,
    totalPages: responsePayload.total_pages,
    last: responsePayload.last,
  };
};

export const getAdminProductDetail = async (productId: number) => {
  throw new Error(
    `Backend does not expose an admin product detail endpoint for product id ${productId} yet.`,
  );
};

export const createAdminProduct = async (payload: UpsertProductPayload) => {
  const { data } = await api.post<ApiResponse<ProductPayload>>("/products", {
    category_id: payload.categoryId,
    name: payload.name.trim(),
    sku: payload.sku.trim(),
    slug: payload.slug?.trim() || undefined,
    description: payload.description?.trim() || undefined,
    price: payload.price,
    stock_quantity: payload.stockQuantity,
    image_url: payload.imageUrl?.trim() || undefined,
  });
  const responsePayload = unwrapData(data, "Invalid create product response payload.");

  return toProduct(responsePayload);
};

export const updateAdminProduct = async (
  productId: number,
  payload: UpsertProductPayload,
) => {
  const { data } = await api.put<ApiResponse<ProductPayload>>(
    `/products/${productId}`,
    {
      category_id: payload.categoryId,
      name: payload.name.trim(),
      sku: payload.sku.trim(),
      slug: payload.slug?.trim() || undefined,
      description: payload.description?.trim() || undefined,
      price: payload.price,
      stock_quantity: payload.stockQuantity,
      image_url: payload.imageUrl?.trim() || undefined,
    },
  );
  const responsePayload = unwrapData(data, "Invalid update product response payload.");

  return toProduct(responsePayload);
};

export const updateAdminProductStatus = async (
  productId: number,
  payload: UpdateProductStatusPayload,
) => {
  const { data } = await api.put<ApiResponse<ProductPayload>>(
    `/products/${productId}/status`,
    {
      active: payload.active,
    },
  );
  const responsePayload = unwrapData(data, "Invalid product status response payload.");

  return toProduct(responsePayload);
};

export const uploadAdminProductImage = async (file: File): Promise<ProductImageUploadResult> => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<ApiResponse<ProductImageUploadPayload>>(
    "/products/upload-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  const responsePayload = unwrapData(data, "Invalid product image upload response payload.");

  return {
    secureUrl: responsePayload.secure_url,
  };
};

export const getAdminLowStockProducts = async (): Promise<AdminLowStockProductsResult> => {
  const { data } = await api.get<ApiResponse<ProductPayload[]>>("/products/low-stock");
  const responsePayload = unwrapData(data, "Invalid low-stock products response payload.");

  return {
    items: responsePayload.map(toProduct),
  };
};

export const getAdminUsers = async (params: AdminUsersQueryParams = {}) => {
  const { data } = await api.get<ApiResponse<PagePayload<UserSummaryPayload>>>("/users", {
    params: sanitizeAdminListParams({
      page: params.page,
      size: params.size,
      sortBy: params.sortBy,
      sortDir: params.sortDir,
    }),
  });
  const responsePayload = unwrapData(data, "Invalid admin users response payload.");

  return toPaginatedResult(responsePayload, toAdminUserSummary);
};

export const getAdminUserDetail = async (userId: number) => {
  const { data } = await api.get<ApiResponse<UserProfilePayload>>(`/users/${userId}`);
  const responsePayload = unwrapData(data, "Invalid admin user detail response payload.");

  return toAdminUserProfile(responsePayload);
};

export const updateAdminUserStatus = async (
  userId: number,
  payload: UpdateUserStatusPayload,
) => {
  const { data } = await api.put<ApiResponse<UserProfilePayload>>(
    `/users/${userId}/status`,
    {
      status: payload.status,
    },
  );
  const responsePayload = unwrapData(data, "Invalid user status response payload.");

  return toAdminUserProfile(responsePayload);
};

export const resetAdminUserPassword = async (
  userId: number,
  payload: ResetUserPasswordPayload,
) => {
  await api.put<ApiResponse<void>>(`/users/${userId}/reset-password`, {
    new_password: payload.newPassword,
  });
};

export const getAdminOrders = async (params: AdminOrdersQueryParams = {}) => {
  const { data } = await api.get<ApiResponse<PagePayload<OrderSummaryPayload>>>("/orders", {
    params: sanitizeAdminListParams({
      page: params.page,
      size: params.size,
      sort_by: params.sortBy,
      sort_dir: params.sortDir,
      status: params.status,
      from_date: params.fromDate,
      to_date: params.toDate,
    }),
  });
  const responsePayload = unwrapData(data, "Invalid admin orders response payload.");

  return toPaginatedResult(responsePayload, toOrderSummary);
};

export const getAdminOrderDetail = async (orderId: number): Promise<AdminOrderDetail> => {
  const { data } = await api.get<ApiResponse<OrderDetailPayload>>(`/orders/${orderId}`);
  const responsePayload = unwrapData(data, "Invalid admin order detail response payload.");

  return toOrderDetail(responsePayload);
};

export const updateAdminOrderStatus = async (
  orderId: number,
  payload: UpdateOrderStatusPayload,
): Promise<AdminOrderDetail> => {
  const { data } = await api.put<ApiResponse<OrderDetailPayload>>(
    `/orders/${orderId}/status`,
    {
      status: payload.status,
    },
  );
  const responsePayload = unwrapData(data, "Invalid order status response payload.");

  return toOrderDetail(responsePayload);
};

export const getAdminAffiliateAccounts = async (
  params: AdminAffiliateAccountsQueryParams = {},
) => {
  const { data } = await api.get<ApiResponse<PagePayload<AdminAffiliateAccountPayload>>>(
    "/affiliate/accounts",
    {
      params: sanitizeAdminListParams({
        page: params.page,
        size: params.size,
        sort_by: params.sortBy,
        sort_dir: params.sortDir,
        status: params.status,
      }),
    },
  );
  const responsePayload = unwrapData(data, "Invalid admin affiliate accounts response payload.");

  return toPaginatedResult(responsePayload, toAdminAffiliateAccount);
};

export const updateAdminAffiliateAccountStatus = async (
  accountId: number,
  payload: UpdateAffiliateAccountStatusPayload,
) => {
  const { data } = await api.put<ApiResponse<AffiliateAccountUpdatePayload>>(
    `/affiliate/accounts/${accountId}/status`,
    {
      status: payload.status,
    },
  );
  const responsePayload = unwrapData(data, "Invalid affiliate account status response payload.");

  return toAdminAffiliateAccountFromUpdate(responsePayload);
};

export const updateAdminAffiliateCommissionRate = async (
  accountId: number,
  payload: UpdateAffiliateCommissionRatePayload,
) => {
  const { data } = await api.put<ApiResponse<AdminAffiliateAccountPayload>>(
    `/affiliate/accounts/${accountId}/commission-rate`,
    {
      commission_rate: payload.commissionRate,
    },
  );
  const responsePayload = unwrapData(data, "Invalid commission rate response payload.");

  return toAdminAffiliateAccount(responsePayload);
};

export const getAdminPayoutRequests = async (
  params: AdminPayoutRequestsQueryParams = {},
) => {
  const { data } = await api.get<ApiResponse<PagePayload<AdminPayoutRequestPayload>>>(
    "/affiliate/payouts",
    {
      params: sanitizeAdminListParams({
        page: params.page,
        size: params.size,
        sort_by: params.sortBy,
        sort_dir: params.sortDir,
        status: params.status,
      }),
    },
  );
  const responsePayload = unwrapData(data, "Invalid admin payout requests response payload.");

  return toPaginatedResult(responsePayload, toAdminPayoutRequest);
};

export const updateAdminPayoutRequestStatus = async (
  payoutRequestId: number,
  payload: UpdatePayoutRequestStatusPayload,
) => {
  const { data } = await api.put<ApiResponse<PayoutRequestUpdatePayload>>(
    `/affiliate/payouts/${payoutRequestId}/status`,
    {
      status: payload.status,
      admin_note: payload.adminNote?.trim() || undefined,
    },
  );
  const responsePayload = unwrapData(data, "Invalid payout status response payload.");

  return toAdminPayoutRequestFromUpdate(responsePayload);
};
