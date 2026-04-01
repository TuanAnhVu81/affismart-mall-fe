# 🎨 AffiSmart Mall - Frontend Implementation Plan (Next.js 14)
> **Mục tiêu:** Kế hoạch thực thi chi tiết cho Frontend Agent. Bám sát kiến trúc Next.js 14 App Router, đảm bảo đúng thứ tự phụ thuộc, có thể code song song với Backend từ Phase 2 trở đi.

---

## 📁 1. Cấu trúc Thư mục Mục tiêu (Folder Structure Target)

```text
affismart-frontend/
├── src/
│   ├── app/                                    # Next.js 14 App Router
│   │   ├── (storefront)/                       # Route Group: Public Storefront
│   │   │   ├── page.tsx                        # Homepage (SSR)
│   │   │   ├── products/
│   │   │   │   ├── page.tsx                    # Danh sách sản phẩm (SSR + filter)
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx                # Chi tiết sản phẩm (SSR)
│   │   │   ├── cart/
│   │   │   │   └── page.tsx                    # Trang giỏ hàng (CSR - Zustand)
│   │   │   └── layout.tsx                      # Layout Storefront: Navbar + Footer
│   │   │
│   │   ├── (auth)/                             # Route Group: Auth pages (public)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx                      # Minimal layout: chỉ logo
│   │   │
│   │   ├── (customer)/                         # Route Group: Protected - Customer
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx                    # Lịch sử đơn hàng
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx                # Chi tiết đơn hàng
│   │   │   ├── profile/
│   │   │   │   └── page.tsx                    # Chỉnh sửa thông tin cá nhân
│   │   │   └── layout.tsx                      # Middleware guard: CUSTOMER role
│   │   │
│   │   ├── payment/                            # Payment Result pages (Public)
│   │   │   ├── success/
│   │   │   │   └── page.tsx                    # Thanh toán thành công → xoá Cart → redirect
│   │   │   └── cancel/
│   │   │       └── page.tsx                    # Thanh toán bị huỷ
│   │   │
│   │   ├── affiliate/                          # Protected: AFFILIATE role
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx                    # Tổng quan: clicks, balance, commissions
│   │   │   ├── links/
│   │   │   │   └── page.tsx                    # Quản lý referral links
│   │   │   ├── commissions/
│   │   │   │   └── page.tsx                    # Danh sách hoa hồng
│   │   │   ├── payouts/
│   │   │   │   └── page.tsx                    # Lịch sử & tạo yêu cầu rút tiền
│   │   │   └── layout.tsx                      # Sidebar Affiliate + Guard
│   │   │
│   │   ├── admin/                              # Protected: ADMIN role
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx                    # Analytics tổng quan
│   │   │   ├── products/
│   │   │   │   ├── page.tsx                    # Danh sách sản phẩm
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx                # Chỉnh sửa sản phẩm
│   │   │   ├── categories/
│   │   │   │   └── page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── users/
│   │   │   │   └── page.tsx
│   │   │   ├── affiliates/
│   │   │   │   └── page.tsx                    # Phê duyệt affiliate + payout requests
│   │   │   ├── blocked-ips/
│   │   │   │   └── page.tsx                    # Danh sách IP bị chặn (Fraud log)
│   │   │   └── layout.tsx                      # Sidebar Admin + Guard
│   │   │
│   │   ├── layout.tsx                          # Root Layout: Provider wrappers
│   │   ├── not-found.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                                 # shadcn/ui primitives (auto-generated)
│   │   │   └── (button, card, dialog, table, badge, input, select, toast...)
│   │   ├── layout/
│   │   │   ├── Navbar.tsx                      # Logo, Cart icon, User menu
│   │   │   ├── Footer.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   └── AffiliateSidebar.tsx
│   │   ├── product/
│   │   │   ├── ProductCard.tsx                 # Card sản phẩm (ảnh, tên, giá)
│   │   │   ├── ProductGrid.tsx                 # Grid nhiều ProductCard
│   │   │   ├── ProductFilters.tsx              # Filter sidebar (category, price range)
│   │   │   └── RecommendationSection.tsx       # "Gợi ý cho bạn" (gọi AI API)
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx                  # Slide-in drawer giỏ hàng
│   │   │   └── CartItem.tsx
│   │   ├── order/
│   │   │   ├── OrderCard.tsx
│   │   │   └── OrderStatusBadge.tsx
│   │   ├── affiliate/
│   │   │   ├── ReferralLinkCard.tsx
│   │   │   ├── CommissionTable.tsx
│   │   │   └── StatCard.tsx                    # Click, Conversion, Balance widget
│   │   ├── admin/
│   │   │   ├── DataTable.tsx                   # Tái sử dụng cho mọi list Admin
│   │   │   ├── ProductForm.tsx                 # Form tạo/sửa sản phẩm + ảnh upload
│   │   │   └── AnalyticsChart.tsx              # Recharts/Chart.js wrapper
│   │   └── shared/
│   │       ├── ConfirmDialog.tsx               # Modal xác nhận hành động nguy hiểm
│   │       ├── ChatbotWidget.tsx               # Floating chatbot button + cửa sổ chat
│   │       └── LoadingSpinner.tsx
│   │
│   ├── services/                               # API layer - TẤT CẢ fetch đều qua đây
│   │   ├── api.ts                              # Axios instance, interceptors, token refresh
│   │   ├── auth.service.ts                     # register, login, logout, refresh
│   │   ├── user.service.ts                     # getMe, updateMe, changePassword
│   │   ├── product.service.ts                  # getProducts, getBySlug, search
│   │   ├── category.service.ts                 # getCategories, getBySlug
│   │   ├── order.service.ts                    # createOrder, getMyOrders, cancelOrder
│   │   ├── payment.service.ts                  # createSession
│   │   ├── affiliate.service.ts                # register, dashboard, links, commissions, payouts
│   │   ├── admin.service.ts                    # Toàn bộ API Admin (user, product, order, affiliate mgmt)
│   │   └── ai.service.ts                       # getRecommendations, chat, trackEvent
│   │
│   ├── hooks/                                  # Custom hooks bọc TanStack Query
│   │   ├── useAuth.ts                          # useLogin, useLogout, useRegister
│   │   ├── useProducts.ts                      # useProductList, useProductDetail
│   │   ├── useOrders.ts                        # useMyOrders, useCancelOrder
│   │   ├── useAffiliate.ts                     # useDashboard, useLinks, usePayouts
│   │   ├── useAdmin.ts                         # useAdminProducts, useAdminOrders...
│   │   ├── useRecommendations.ts               # Bọc GET /ai/recommendations và GET /ai/recommendations/product/{id}
│   │   └── useChat.ts                          # Bọc POST /ai/chat
│   ├── store/                                  # Zustand global state
│   │   ├── auth.store.ts                       # accessToken, user info (in-memory)
│   │   └── cart.store.ts                       # items[], addItem, removeItem, clear (LocalStorage)
│   │
│   ├── types/                                  # TypeScript interfaces khớp với API Response
│   │   ├── api.types.ts                        # ApiResponse<T> wrapper type
│   │   ├── auth.types.ts
│   │   ├── product.types.ts
│   │   ├── order.types.ts
│   │   └── affiliate.types.ts
│   │
│   └── lib/
│       ├── utils.ts                            # cn(), formatCurrency(VND), formatDate()
│       ├── validators.ts                       # Zod schemas cho forms
│       └── constants.ts                        # ORDER_STATUS labels, ROUTES map
│
├── middleware.ts                               # Next.js Middleware: Route guard theo role
├── next.config.ts
├── tailwind.config.ts
├── .env.local                                  # NEXT_PUBLIC_API_URL, NEXT_PUBLIC_GEMINI_KEY (nếu cần)
└── .env.production
```

---

## 🏃 2. Sprints & Execution Phases

**Quy tắc bất di bất dịch (FE Coding Standard):**
1. **Không** gọi API trực tiếp trong component. Mọi call đều qua `services/` → hook TanStack Query → component nhận data.
2. **Không** lưu `accessToken` vào `localStorage` hay `cookie` phía client. Chỉ lưu in-memory (Zustand store). Cookie `refresh_token` do Backend set HttpOnly.
3. Mọi Form phải dùng `react-hook-form` + `Zod` validation. Không validate thủ công.
4. Mọi thao tác gọi API mutation (POST/PUT/DELETE) phải hiển thị Loading state và Toast thông báo kết quả.
5. SSR cho các trang Public (Storefront) để tối ưu SEO. CSR cho các trang Dashboard (Admin, Affiliate, Customer Portal).

---

### 🟡 Phase 0: Project Bootstrap & Design System 
*Khởi tạo project, cài đặt công cụ và xây dựng Design System trước khi code bất kỳ trang nào.*

- [ ] **Bước 1: Khởi tạo Project**
  - Chạy `npx create-next-app@latest affismart-frontend` với các tuỳ chọn: TypeScript ✅, Tailwind CSS ✅, App Router ✅, `src/` directory ✅.
  - Cài đặt các dependencies bắt buộc:
    - `axios` — HTTP client.
    - `@tanstack/react-query` — Server state management.
    - `zustand` — Client state management.
    - `react-hook-form` + `@hookform/resolvers` + `zod` — Form validation.
    - `recharts` — Biểu đồ analytics.
    - `lucide-react` — Icon library.
    - `sonner` — Toast notifications (nhẹ, đẹp hơn react-toastify).
  - Khởi tạo `shadcn/ui`: chạy `npx shadcn@latest init`, chọn theme "Slate", cài sẵn các components: `Button`, `Card`, `Input`, `Dialog`, `Table`, `Badge`, `Select`, `Tabs`, `Skeleton`, `Dropdown Menu`.

- [ ] **Bước 2: Cấu hình Môi trường**
  - Tạo `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1`
  - Tạo `.env.production`: `NEXT_PUBLIC_API_URL=https://affismart-api.onrender.com/api/v1`
  - Không dùng bất kỳ biến môi trường nào khai báo `NEXT_PUBLIC_` cho thông tin nhạy cảm (secrets).

- [ ] **Bước 3: Thiết lập Design System & Global Styles (Chủ đạo: Indigo & White)**
  - Cấu hình UI theo phong cách Modern Tech Ecommerce & SaaS (vừa Trustworthy vừa mang nét AI data):
    - **Primary:** `#4F46E5` (Indigo 600) — Nút mua hàng chính, active states.
    - **Primary Hover:** `#4338CA` (Indigo 700)
    - **Background:** `#FFFFFF` (Nền nền nã, sạch sẽ)
    - **Surface / Cards:** `#F9FAFB` (Gray 50) — Nền cho các Box, Card, Menu.
    - **Text:** `#111827` (Gray 900) — Chữ tiêu đề tối đa độ tương phản.
    - **Muted Text:** `#6B7280` (Gray 500) — Note, sub-title.
    - **Border:** `#E5E7EB` (Gray 200)
    - **Status (Badge / Toast):** Success `#10B981` (DONE/APPROVED), Warning `#F59E0B` (PENDING), Danger `#EF4444` (CANCELLED/REJECTED).
  - Khai báo các mã màu này thành CSS Variables trong file `globals.css` để over-ride bộ màu mặc định của thư viện `shadcn/ui`.
  - Cài đặt Google Fonts (Inter) qua `next/font/google` trong Root Layout.
  - Tạo file `lib/utils.ts`: Export hàm `cn()` (kết hợp `clsx` + `tailwind-merge`), `formatCurrency(amount: number)` trả về chuỗi VNĐ chuẩn, `formatDate(date: string)`.

- [ ] **Bước 4: Setup Providers (Root Layout)**
  - Tạo component `Providers.tsx` (Client Component) bọc: `QueryClientProvider` (TanStack Query) + `Toaster` (Sonner).
  - Mount `Providers` vào `app/layout.tsx` (Root Layout - Server Component). Đây là nơi duy nhất khai báo `<html>`, `<body>`, và global metadata SEO.

- [ ] **Bước 5: Cấu hình Axios Instance & Interceptors**
  - Tạo `services/api.ts`. Khởi tạo `axios.create()` với `baseURL: process.env.NEXT_PUBLIC_API_URL`.
  - **Request Interceptor:** Đọc `accessToken` từ Zustand store, gắn vào Header `Authorization: Bearer <token>` cho mọi request.
  - **Response Interceptor (Token Refresh):** Khi nhận 401, tự động gọi `POST /auth/refresh` (cookie HttpOnly tự gửi kèm), nhận `accessToken` mới → Cập nhật Zustand store → Retry request ban đầu. Nếu refresh thất bại → Xoá store → Redirect sang `/login`.

- [ ] **Bước 6: Thiết lập Next.js Middleware (Route Guard bằng UI Cookie)**
  - Lỗ hổng cần tránh: Middleware chạy ở Edge Runtime nên **KHÔNG thể đọc Zustand/RAM** và cũng **KHÔNG giải mã được Refresh Token** (do BE mã hóa dạng HttpOnly UUID).
  - Giải pháp chốt: `middleware.ts` sẽ hoàn toàn dựa vào việc đọc một cookie định danh cơ bản (vú dụ: `ui_role`) do Frontend tự set lúc login thành công. Tính bảo mật thực sự vẫn do Backend chặn API 401/403 quyết định, middleware chỉ đóng vai trò điều hướng UX cho mượt.
  - `middleware.ts` bắt buộc xử lý chính xác 3 trường hợp:
    1. **Không có cookie `ui_role`** (Chưa đăng nhập) → cố tình truy cập `/affiliate/*` hoặc `/admin/*` → Redirect về `/login`.
    2. **Cookie `ui_role=CUSTOMER`** → cố tình truy cập `/admin/*` → Redirect về trang chủ `/`.
    3. **Cookie `ui_role=AFFILIATE_PENDING`** (Role affiliate nhưng chưa duyệt) → truy cập `/affiliate/*` → Redirect trang "Chờ duyệt" (`/affiliate/pending`).

---

### 🟢 Phase 1: Auth Flow & Identity (Song song với BE Phase 1)

*Xây dựng luồng Đăng ký / Đăng nhập / Đăng xuất đầy đủ. Đây là nền tảng cho mọi tính năng Protected.*

- [ ] **Bước 1: Định nghĩa Types & Zustand Auth Store**
  - Tạo `types/auth.types.ts`: Interface `User` (id, email, fullName, roles), `LoginRequest`, `RegisterRequest`, `AuthResponse` (accessToken, user).
  - Tạo `store/auth.store.ts`: State gồm `user`, `accessToken`, `isAuthenticated`. Actions: `setAuth(user, token)`, `clearAuth()`. Store này **chỉ tồn tại trong RAM** — không persist vào localStorage.

- [ ] **Bước 2: Auth Service (Kết hợp ghi UI Cookie)**
  - Tạo `services/auth.service.ts`: Implement `login(payload)`, `register(payload)`, `logout()`, `refreshToken()`.
  - `login` → gọi `POST /auth/login` → nhận `accessToken` và thông tin User trong body → gọi `setAuth()` lưu vô RAM/Zustand. **Bắt buộc:** Phải chủ động set 1 non-HttpOnly cookie đơn giản từ Frontend: `document.cookie = "ui_role=ADMIN; path=/;"` (hoặc `CUSTOMER`, `AFFILIATE`, `AFFILIATE_PENDING` tùy status trả về) để phục vụ Middleware.
  - `logout` → gọi `POST /auth/logout` → gọi `clearAuth()` → xóa sạch cookie bằng `document.cookie = "ui_role=; Max-Age=0; path=/;"` → redirect.
  - `refreshToken` → gọi `POST /auth/refresh` (cookie refresh_token HttpOnly sẽ tự gửi ngầm) → nhận `accessToken` mới → update Zustand.

- [ ] **Bước 3: Auth Hooks (TanStack Query Mutations)**
  - Tạo `hooks/useAuth.ts`: Export `useLogin()`, `useRegister()`, `useLogout()` dùng `useMutation`.
  - `onSuccess` của `useLogin`: Gọi `setAuth()`, hiển thị toast "Đăng nhập thành công!", redirect theo role (`ADMIN` → `/admin/dashboard`, `AFFILIATE` → `/affiliate/dashboard`, `CUSTOMER` → `/`).
  - `onError`: Hiển thị toast lỗi từ `error.response.data.message`.

- [ ] **Bước 4: Pages — Login & Register**
  - Xây dựng `(auth)/login/page.tsx` và `(auth)/register/page.tsx`.
  - Dùng `react-hook-form` + Zod schema. Hiển thị lỗi validation ngay dưới từng field.
  - Form Login: `email`, `password`. Form Register: `fullName`, `email`, `password`, `confirmPassword`.
  - Khi submit: Gọi hook mutation, xử lý trạng thái `isPending` để disable button và hiện spinner.

- [ ] **Bước 5: Hydrate Auth State (Token Storage Strategy)**
  - **Mô hình bảo mật chốt:** Tiêu chuẩn **Memory + HttpOnly Cookie** (Access Token lưu trong biến cục bộ Zustand, Refresh Token lưu trong HttpOnly Cookie do Backend tự đối chiếu). Mô hình này hoàn toàn miễn nhiễm với tấn công XSS.
  - Vấn đề: Do lưu trong Memory (RAM), khi user ấn F5 Refresh trang, Zustand bị reset → mất trắng `accessToken`.
  - Cách giải quyết: Tạo component `AuthInitializer.tsx` (một silent background task, không hiện UI) nhúng vào Client Layout. Ngay khi App bị load lại, component này sẽ tự động gọi ngầm API `POST /auth/refresh`. Trình duyệt sẽ tự gắn HttpOnly Cookie gửi đi. Nếu BE xác thực hợp lệ, nó trả về `accessToken` mới kèm thông tin User → Cập nhật lại Zustand qua `setAuth()`. Ngược lại nếu lỗi `401` → Không làm gì cả (Chưa đăng nhập).

---

### 📦 Phase 2: Storefront — Catalog & Browsing (Song song với BE Phase 2)

*Xây dựng giao diện mua sắm công khai. BE chưa cần hoàn thiện — có thể dùng Mock data trước.*

- [ ] **Bước 1: Định nghĩa Product & Category Types**
  - Tạo `types/product.types.ts`: Interface `Product` (id, name, slug, price, stockQuantity, imageUrl, category, isActive), `Category`, `ProductListResponse` (content, pageable, totalElements).

- [ ] **Bước 2: Services & Hooks**
  - `services/product.service.ts`: `getProducts(params)` (search, categoryId, minPrice, maxPrice, page, size, sortBy). Gọi API chi tiết sản phẩm BẮT BUỘC DÙNG SLUG `GET /products/{slug}` qua hàm `getProductBySlug(slug)`, tuyệt đối không dùng `:id`.
  - `services/category.service.ts`: `getActiveCategories()`, `getCategoryBySlug(slug)`.
  - `hooks/useProducts.ts`: Dùng `useQuery` với `queryKey: ['products', params]` để tự động refetch khi filter thay đổi.

- [ ] **Bước 3: Components**
  - `ProductCard.tsx`: Nhận `Product` prop. Hiển thị ảnh (dùng `next/image`), tên, giá (formatCurrency), badge "Hết hàng" nếu `stockQuantity = 0`.
  - `ProductGrid.tsx`: Nhận `Product[]`, render grid responsive.
  - `ProductFilters.tsx`: Client Component. State filter local. Debounce input search 500ms trước khi push lên URL Params.

- [ ] **Bước 4: Pages — Storefront**
  - `(storefront)/products/page.tsx` (Server Component): Đọc `searchParams` từ URL → Pass vào `getProducts()` → Render `ProductGrid` + `ProductFilters`. Metadata SEO: `title`, `description`.
  - `(storefront)/products/[slug]/page.tsx` (Server Component): Gọi `getProductBySlug()` → Render chi tiết. Nếu `notFound()` thì render 404. Thêm `generateStaticParams()` để pre-render các sản phẩm phổ biến.
  - `(storefront)/page.tsx` (Homepage — Server Component): Fetch danh sách products nổi bật. Render hero banner + `ProductGrid`.

- [ ] **Bước 5: Tối ưu Affiliate Tracking (Tránh block SSR)**
  - **Tối kỵ:** KHÔNG dùng `middleware.ts` cho việc tracking này. Nếu `middleware.ts` trên Edge Server phải `await axios.post('/track-click')` mỗi khi có người vào web, nó sẽ làm tăng độ trễ (latency) khủng khiếp và làm mất hoàn toàn lợi điểm của SSR.
  - **Giải pháp chốt:** Tạo một Client Component ẩn tên là `<AffiliateTracker />`, nhúng vào Root Layout `(storefront)/layout.tsx`.
  - Component này sử dụng `useEffect`:
    1. Đọc URL Params xem có `?ref=xxx` không.
    2. Nếu có, gọi API ngầm ở background: `POST /affiliate/track-click` body `{ ref_code: "xxx" }`.
    3. **NẾU response trả về `200 OK`** (link hợp lệ, không dính IP Spam) → Frontend tự lưu vết Cookie: `document.cookie = "ref_code=xxx; path=/; max-age=2592000"` (30 ngày).
    4. (Optional) Dọn dẹp URL bằng cách gọi `window.history.replaceState` xóa đuôi `?ref...` cho sạch sẽ. Mọi thứ diễn ra Client-side mà không chặn render trang.

---

### 🛒 Phase 3: Cart & Checkout Flow (Song song với BE Phase 3)

*Xây dựng luồng thêm giỏ hàng và tạo đơn hàng. Đây là luồng quan trọng nhất của Storefront.*

- [ ] **Bước 1: Zustand Cart Store**
  - Tạo `store/cart.store.ts`. State: `items: CartItem[]` (productId, name, price, imageUrl, quantity, slug), `totalItems`, `totalPrice`.
  - Actions: `addItem(product)`, `removeItem(productId)`, `updateQuantity(productId, qty)`, `clearCart()`.
  - **Persist to LocalStorage (Bắt buộc):** Bắt buộc phải sử dụng `persist` middleware của Zustand để lưu cứng giỏ hàng. Tránh việc user reload F5 bị mất thông tin giỏ hàng chờ thanh toán.
    ```typescript
    import { persist } from 'zustand/middleware';

    export const useCartStore = create<CartState>()(
      persist(
        (set, get) => ({ /* ... state & actions ... */ }),
        { name: 'affismart-cart' } // Key lưu trong localStorage
      )
    );
    ```

- [ ] **Bước 2: Cart UI Components**
  - `CartDrawer.tsx`: Slide-in từ phải. Hiển thị danh sách `CartItem`. Tổng tiền. Nút "Checkout".
  - `CartItem.tsx`: Ảnh SP, tên, giá, input số lượng (+/-), nút xoá.
  - Nút "Thêm vào giỏ" trên `ProductCard` gọi `addItem()`. Hiện Drawer, cập nhật số lượng trên Navbar icon.

- [ ] **Bước 3: Order Service & Checkout Logic**
  - Tạo `services/order.service.ts`: `createOrder(payload)` → `POST /orders` (body: `shippingAddress`, `items`, `refCode` đọc từ cookie).
  - `createPaymentSession(orderId)` → `POST /payment/create-session` → nhận `payment_url`.
  - Tạo `hooks/useOrders.ts`: `useCreateOrder()` (mutation), `useMyOrders()` (query), `useCancelOrder()` (mutation).

- [ ] **Bước 4: Checkout Page**
  - Tạo `(customer)/checkout/page.tsx` (CSR, protected).
  - Form điền `shippingAddress`. Tóm tắt đơn hàng từ Zustand cart.
  - Khi submit:
    1. Gọi `createOrder()` → nhận `orderId`.
    2. Ngay lập tức gọi `createPaymentSession(orderId)` → nhận `payment_url`.
    3. `window.location.href = payment_url` để redirect sang Stripe.

- [ ] **Bước 5: Payment Result Pages**
  - `payment/success/page.tsx`: **Xoá toàn bộ Cart** (`clearCart()`). Hiển thị thông báo thành công + nút "Xem đơn hàng của tôi". **LƯU Ý:** Không cập nhật Order status ở đây — việc đó do Stripe Webhook (BE) xử lý.
  - `payment/cancel/page.tsx`: Thông báo huỷ + nút "Quay lại giỏ hàng".

- [ ] **Bước 6: Customer Order History**
  - `(customer)/orders/page.tsx`: Danh sách đơn hàng dùng `useMyOrders()`. Hiển thị Status badge dùng màu sắc phân biệt (`PENDING`, `PAID`, `CONFIRMED`, `SHIPPED`, `DONE`, `CANCELLED`).
  - `(customer)/orders/[id]/page.tsx`: Chi tiết đơn hàng. Nút "Huỷ đơn" chỉ hiện khi status là `PENDING` hoặc `PAID`;  khi click → `ConfirmDialog` xác nhận → `useCancelOrder()`.

---

### 💳 Phase 4: Affiliate Portal (Song song với BE Phase 5)

*Giao diện dành cho Cộng tác viên đã được phê duyệt.*

- [ ] **Bước 1: Affiliate Service & Hooks**
  - `services/affiliate.service.ts`: Implement tất cả API Affiliate (#36-#44). CHÚ Ý bắt buộc thêm `/me/` vào các endpoint: `GET /affiliate/me/dashboard`, `GET /affiliate/me/links`, `GET /affiliate/me/commissions`, `GET /affiliate/me/payouts`,... để khớp với API Spec. Các hàm tương ứng: `registerAffiliate()`, `getMyDashboard()`, `getMyLinks()`, `createLink()`, `toggleLink()`, `getMyCommissions()`, `getMyPayouts()`, `createPayoutRequest()`.
  - `hooks/useAffiliate.ts`: Wrap từng API bằng `useQuery` hoặc `useMutation` tương ứng.

- [ ] **Bước 2: Affiliate Register Flow**
  - Nút "Trở thành Affiliate" trên Navbar (chỉ hiện khi đã đăng nhập nhưng chưa có role AFFILIATE).
  - Khi click → Mở `Dialog` với Form đăng ký: `promotionChannel`, `bankInfo`. Submit → `registerAffiliate()` → toast "Đăng ký thành công! Vui lòng chờ Admin phê duyệt".

- [ ] **Bước 3: Affiliate Dashboard Page**
  - `affiliate/dashboard/page.tsx`: 4 `StatCard` widget (Total Clicks, Conversions, Balance, Total Earned). Hiển thị danh sách Commission gần nhất dạng mini-table.

- [ ] **Bước 4: Referral Links Page**
  - `affiliate/links/page.tsx`: Danh sách links dùng `DataTable`. Mỗi row: ref_code, product target, total_clicks, is_active toggle.
  - Nút "Tạo link mới" → Dialog chọn Product (dropdown) hoặc link toàn shop → Submit `createLink()`.
  - Nút Copy link vào clipboard (`navigator.clipboard.writeText`).

- [ ] **Bước 5: Commission & Payout Pages**
  - `affiliate/commissions/page.tsx`: Filter theo Status (PENDING, APPROVED, PAID, REJECTED). Hiển thị `DataTable` với `OrderStatusBadge`.
  - `affiliate/payouts/page.tsx`: Lịch sử Payout. Nút "Rút tiền" → Validate `balance >= 200,000` → ConfirmDialog → `createPayoutRequest()`.

---

### ⚙️ Phase 5: Admin Panel (Song song với BE Phase 3-5)

*Bảng điều khiển quản trị toàn hệ thống.*

- [ ] **Bước 1: Admin Service & Hooks**
  - `services/admin.service.ts`: Implement tất cả API Admin (#8-#11, #14-#16, #20-#24, #29-#31, #46-#50).
  - `hooks/useAdmin.ts`: Tổng hợp các query/mutation cho Admin.

- [ ] **Bước 2: Shared DataTable Component**
  - Tạo `components/admin/DataTable.tsx` tái sử dụng cho mọi list: nhận `columns`, `data`, `isLoading`, `pagination` props. Tích hợp sẵn loading skeleton và "Không có dữ liệu" state.

- [ ] **Bước 3: Admin — Catalog Management**
  - `admin/categories/page.tsx`: Danh sách + Nút tạo mới + Inline toggle status.
  - `admin/products/page.tsx`: Danh sách với filter. Nút "Tạo mới" → `/admin/products/new`.
  - `admin/products/[id]/page.tsx`: `ProductForm` với đầy đủ fields. **Upload ảnh:** Chọn file → gọi `POST /products/upload-image` → nhận URL → tự nhúng vào form state → Submit form tạo/sửa sản phẩm.

- [ ] **Bước 4: Admin — Order Management**
  - `admin/orders/page.tsx`: Bảng đơn hàng với filter Status và Date range.
  - `admin/orders/[id]/page.tsx`: Chi tiết đơn hàng. Dropdown chọn trạng thái tiếp theo (`CONFIRMED` / `SHIPPED` / `DONE`). Submit → `PUT /orders/{id}/status`.

- [ ] **Bước 5: Admin — User & Affiliate Management**
  - `admin/users/page.tsx`: Danh sách User. Nút toggle Status (ACTIVE/BANNED) + Nút "Reset mật khẩu".
  - `admin/affiliates/page.tsx`: 2 Tab: "Tài khoản Affiliate" (duyệt/từ chối) và "Payout Requests" (xét duyệt thanh toán). Status badge màu phân biệt `PENDING`/`APPROVED`/`TRANSFERRED`/`REJECTED`.
  - `admin/blocked-ips/page.tsx`: Hiển thị `DataTable` danh sách `BlockedClickLog` (#51-#53). Nút "Gỡ chặn" gửi `DELETE /admin/blocked-ips/{id}`.

---

### 🤖 Phase 6: AI Features (Song song với BE Phase 6)

*Tích hợp Gợi ý sản phẩm và Chatbot vào Storefront.*

- [ ] **Bước 1: AI Service & Hooks**
  - `services/ai.service.ts`: `getHomepageRecommendations(sessionId?)`, `getRelatedProducts(productId)`, `sendChatMessage(message)`, `trackEvent(eventType, productId, sessionId?)`.
  - `hooks/useRecommendations.ts`: Tạo hook để bọc riêng 2 API `GET /ai/recommendations` và `GET /ai/recommendations/product/{id}`.
  - `hooks/useChat.ts`: Tạo hook bọc `POST /ai/chat`.

- [ ] **Bước 2: Quản lý Guest Session ID (Bổ sung vào `services/ai.service.ts`)**
  - Để các API (`POST /ai/events` và `GET /ai/recommendations`) có `session_id` để gửi đi, hãy định nghĩa logic tự động cấp phát ID ngay trong file `ai.service.ts`. Mọi hàm call API trong file này đều tự động lấy thông qua cơ chế này:
    ```typescript
    const getSessionId = () => {
      if (typeof window === 'undefined') return ''; // Xử lý lỗi SSR của Next.js
      const sessionId = localStorage.getItem('session_id')
        ?? (() => {
            const id = crypto.randomUUID();
            localStorage.setItem('session_id', id);
            return id;
        })();
      return sessionId;
    };
    ```
  - Khi gọi `axios.post('/ai/events', { ..., session_id: getSessionId() })`. Điều này giải quyết hoàn toàn vấn đề ẩn danh của Guest.

- [ ] **Bước 3: Event Tracking (Chú ý Dữ liệu User)**
  - Bắn event `VIEW` sau khi render trang `products/[slug]` bằng `useEffect`.
  - Bắn event `ADD_TO_CART` khi user click "Thêm vào giỏ".
  - Bắn event `PURCHASE` trên trang `payment/success`.
  - **Pattern:** Mọi tracking call phải "fire-and-forget" (không await, không block UI).
  - **Cực kỳ quan trọng:** Trong hàm `trackEvent()` của `ai.service.ts`, phải lấy thông tin từ `auth.store.ts`. **Nếu user đã đăng nhập, ưu tiên gửi payload chứa `user_id`. Nếu là guest, mới gửi payload chứa `session_id`.**

- [ ] **Bước 4: Recommendation UI**
  - `RecommendationSection.tsx`: Client Component. Dùng `useRecommendations()`. Hiển thị `Skeleton` khi loading. Render `ProductGrid` sau khi có data. Mount ở cuối trang Homepage và trang chi tiết sản phẩm.

- [ ] **Bước 5: Chatbot Widget**
  - `ChatbotWidget.tsx`: Floating button ở góc phải màn hình. Click → Mở cửa sổ chat.
  - Cửa sổ chat: Input nhập tin nhắn + danh sách messages (user + bot). Gọi `POST /ai/chat` khi submit. Hiển thị typing indicator `(...)` khi đang chờ response.
  - Mount `ChatbotWidget` trong `(storefront)/layout.tsx` để chỉ hiển thị trên Storefront, không hiện trong Admin.

- [ ] **Bước 6: Analytics Dashboard**
  - `admin/dashboard/page.tsx`: Gọi tất cả analytics APIs. Hiển thị StatCard (GMV, Tổng đơn, Users mới) + `AnalyticsChart` dùng Recharts (LineChart doanh thu theo thời gian, BarChart top sản phẩm).
  - **Widget Cảnh báo Tồn kho (Low Stock):** Yêu cầu tạo thêm một Widget/Table nhỏ mang tên "Cảnh báo tồn kho", gọi hook `useLowStockProducts()`, hiển thị danh sách các sản phẩm sắp hết (`stockQuantity < 10`) ngay trên trang `/admin/dashboard` để Admin kịp thời bổ sung.

---

### 🚀 Phase 7: Polish, SEO & Deployment (Song song với BE Phase 7)

*Hoàn thiện UX, tối ưu hiệu năng và triển khai lên Vercel.*

- [ ] **Bước 1: SEO & Metadata**
  - Đảm bảo mọi trang có `generateMetadata()` hoặc static `metadata` object: title, description, openGraph image.
  - Trang sản phẩm dùng dynamic metadata: title = tên sản phẩm, description = mô tả sản phẩm (100 ký tự đầu).

- [ ] **Bước 2: Loading & Error UI**
  - Thêm file `loading.tsx` cho các route group nặng (storefront products, admin) → Next.js tự wrap trong `<Suspense>`.
  - Thêm file `error.tsx` để hiển thị giao diện thân thiện khi có lỗi runtime.
  - Thêm `not-found.tsx` cho 404.

- [ ] **Bước 3: Accessibility & UX Polish**
  - Mọi interactive element phải có `aria-label`. Images phải có `alt`.
  - Form validation hiện lỗi inline (không dùng alert). Toast tự dismiss sau 4 giây.
  - Responsive: Test trên mobile 375px, tablet 768px, desktop 1280px.

- [ ] **Bước 4: Performance Audit**
  - Dùng `next/image` cho tất cả ảnh. Không dùng `<img>` thuần.
  - Lazy load `RecommendationSection` và `ChatbotWidget` bằng `dynamic(() => import(...), { ssr: false })`.
  - Chạy `next build` → Kiểm tra `Bundle Analyzer`. Không có chunk nào vượt 500KB.

- [ ] **Bước 5: Deploy lên Vercel**
  - Kết nối GitHub repo với Vercel.
  - Cấu hình Environment Variables trên Vercel Dashboard: `NEXT_PUBLIC_API_URL=https://affismart-api.onrender.com/api/v1`.
  - Kiểm tra build thành công (0 TypeScript errors, 0 ESLint errors bắt buộc).
  - Test luồng End-to-End trên Production URL: Register → Login → Thêm giỏ hàng → Checkout → Confirm đơn hàng.

---

## 🗂 3. Phụ lục: API Mapping — FE Phase → BE Phase

| FE Phase | Phụ thuộc BE Phase | APIs sử dụng |
|---|---|---|
| Phase 0 | (Không cần BE) | — |
| Phase 1 | BE Phase 1 | #1, #2, #3, #4, #5, #6, #7 |
| Phase 2 | BE Phase 2 | #12, #13, #17, #18, #19, #23, #45 |
| Phase 3 | BE Phase 3 + 4 | #25, #26, #27, #28, #32, #33, #34, #35 |
| Phase 4 | BE Phase 5 | #36, #37, #38, #39, #40, #41, #42, #43, #44 |
| Phase 5 | BE Phase 2 + 3 + 5 | #8-#11, #14-#16, #20-#22, #24, #29-#31, #46-#50 |
| Phase 6 | BE Phase 6 | #51, #52, #53, #54, #55-#60 |
| Phase 7 | BE Phase 7 | (Toàn bộ) |

---

## ⚠️ 4. Ghi chú quan trọng cho Agent

- **KHÔNG persist accessToken** vào bất kỳ storage nào. Chỉ giữ in-memory (Zustand). Refresh token nằm trong HttpOnly Cookie do BE quản lý.
- **Ref code cookie:** Do Next.js Middleware đặt (Server-side), KHÔNG phải Axios hay component client đặt. Cookie path `/`, max-age 30 ngày.
- **Cart:** Zustand + LocalStorage. Xoá hoàn toàn sau khi user redirect về trang `/payment/success`.
- **Session ID cho AI:** Là UUID do client tự sinh và lưu LocalStorage. Không liên quan đến HTTP Session hay JWT.
- **Image upload:** Gọi `POST /products/upload-image` độc lập trước → nhận URL string → nhúng vào form data → submit `POST /products` hoặc `PUT /products/{id}`.
