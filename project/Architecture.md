# AffiSmart Mall — Software Architecture

> **Role:** Solution Architect · **Stack:** Spring Boot 3 · Next.js 14

---

## 1. Kiến trúc Backend (Spring Boot & FastAPI)

### 🎯 Quyết định kiến trúc: Modular Monolith + 1 AI Microservice

Thay vì làm Microservices toàn diện (quá cồng kềnh, over-engineering cho 1 dự án cá nhân), chúng ta sử dụng kiến trúc **Modular Monolith** cho Core Java, kết hợp với một **External Microservice** cho AI (Python).

- **Core E-commerce & Affiliate (Spring Boot):** Xây dựng chung trong 1 App nhưng chia code theo từng Module nghiệp vụ. Cấu trúc bên trong mỗi module tuân theo **Layered Architecture** (Controller → Service → Repository).
- **AI Service (FastAPI):** Chạy độc lập hoàn toàn. Backend Java gọi REST API sang Python để lấy kết quả AI. FastAPI có kết nối trực tiếp Read-only đến PostgreSQL (`recommendation_events`) để fetch data train Cosine Similarity model theo định kỳ.

> 💡 *Khi interviewer hỏi tại sao không dùng Clean Architecture:* "Với MVP, Clean Architecture sinh ra quá nhiều boilerplate (Ports, Adapters). Layered Architecture trong Modular Monolith giúp code nhanh hơn, dễ maintain mà vẫn đảm bảo Separation of Concerns."

---

### 📁 Cấu trúc thư mục Spring Boot (Core Backend)
```text
affismart-backend/
├── src/main/java/com/affismart/
│   ├── config/                        # Spring Security, Redis, CORS, Swagger, Cloudinary, Stripe
│   ├── exception/                     # GlobalExceptionHandler, Custom AppException & ErrorCodes
│   ├── common/                        # Constants, Enums, ApiResponse, BaseEntity
│   │
│   ├── modules/
│   │   ├── auth/                      # Module: Đăng ký/Đăng nhập & JWT
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── util/                  # JwtProvider.java (Tạo & validate JWT)
│   │   │   ├── mapper/                # MapStruct mappers (e.g., AuthMapper.java)
│   │   │   └── dto/
│   │   │
│   │   ├── user/                      # Module: Quản lý User (Profile, Admin block)
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── entity/                # User.java, Role.java, UserRole.java (Join table users ↔ roles)
│   │   │   ├── mapper/                # MapStruct mappers (e.g. UserMapper)
│   │   │   └── dto/
│   │   │
│   │   ├── product/                   # Module: Sản phẩm & Danh mục
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── entity/                # Product.java, Category.java
│   │   │   ├── mapper/                # MapStruct mappers
│   │   │   └── dto/
│   │   │
│   │   ├── order/                     # Module: Đơn hàng & Giỏ hàng payload
│   │   │   ├── controller/
│   │   │   ├── service/               # OrderService (Tạo đơn), OrderStatusService (State Machine)
│   │   │   ├── repository/
│   │   │   ├── entity/                # Order.java, OrderItem.java, StatusEnum
│   │   │   ├── mapper/                # MapStruct mappers
│   │   │   └── dto/
│   │   │
│   │   ├── affiliate/                 # Module: Affiliate & Hoa hồng
│   │   │   ├── controller/
│   │   │   ├── service/               # ClickTrackingService, CommissionService, PayoutService
│   │   │   ├── repository/
│   │   │   ├── entity/                # AffiliateAccount, ReferralLink, Commission, Payout, BlockedClickLog
│   │   │   ├── mapper/                # MapStruct mappers
│   │   │   └── dto/
│   │   │
│   │   ├── ai/                        # Module: AI Ingestion & Proxy
│   │   │   ├── controller/            # EventController.java (Ghi DB), AiController.java (Gọi Proxy)
│   │   │   ├── service/               # EventLoggingService (Bất đồng bộ), AiProxyService (WebClient FastAPI)
│   │   │   ├── repository/            # RecommendationEventRepository.java
│   │   │   └── entity/                # RecommendationEvent.java
│   │   │
│   │   ├── analytics/                 # Module: Dashboards cho Admin
│   │   │       ├── controller/
│   │   │       ├── service/               # AnalyticsReportService
│   │   │       ├── repository/            # Thêm repository cho analytics
│   │   │       ├── mapper/                # MapStruct mappers
│   │   │       └── dto/
│   │
│   └── integration/                   # Giao tiếp hệ thống ngoài
│       ├── stripe/                    # Stripe SDK & Webhook handler
│       ├── cloudinary/                # Image hosting adapter
│       └── aiclient/                  # REST Client gọi sang FastAPI
│
└── src/main/resources/
     ├── application.yml
     ├── application-dev.yml           # Kết nối Docker Containers local
     ├── application-prod.yml          # Kết nối Supabase/Render
     └── db/migration/
         └── V1__init_schema.sql       # Flyway Migration Schema
```

---

### 📁 Cấu trúc thư mục FastAPI (AI Microservice)
```text
affismart-ai-service/
├── app/
│   ├── main.py                        # Init FastAPI app
│   ├── api/                           # Routes: /chat, /recommend
│   ├── services/                      # Logic gọi Gemini API & thuật toán Scikit-learn
│   └── schemas/                       # Pydantic models (validate request/response)
└── requirements.txt                   # fastapi, uvicorn, scikit-learn, google-generativeai
```

---

## 2. Kiến trúc Frontend (Next.js 14)

### 🎯 Design Patterns sử dụng

| Pattern | Áp dụng ở đâu |
|---|---|
| **Server / Client Components** | SSR cho storefront (SEO), CSR cho dashboard (interactive) |
| **Container / Presentational** | Page lo fetch data, Component lo render UI |
| **Repository Pattern** | Mọi API call tập trung trong `services/`, không gọi thẳng trong component |
| **Zustand** | Client state: giỏ hàng, trạng thái modal |
| **TanStack Query** | Server state: fetch, cache, loading/error tự động |

> 💡 *Tại sao không dùng Redux?* Quá nhiều boilerplate. Zustand + TanStack Query giải quyết đủ 2 loại state mà code ngắn hơn nhiều.

---

### 📁 Cấu trúc thư mục Next.js
```text
affismart-frontend/
├── src/
│   ├── app/                           # Next.js 14 App Router
│   │   ├── (storefront)/              # Public: Homepage, /products/[slug]
│   │   ├── (auth)/                    # Login, Register
│   │   ├── affiliate/                 # Affiliate Portal (protected)
│   │   │   ├── dashboard/
│   │   │   ├── links/
│   │   │   └── payouts/
│   │   ├── admin/                      # Admin Dashboard (quản lý vận hành toàn hệ thống)
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── affiliates/
│   │   │   ├── analytics/
│   │   │   └── blocked-ips/
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn/ui primitives (Button, Card, Dialog...)
│   │   ├── layout/                    # Navbar, Footer, Sidebar
│   │   ├── product/                   # ProductCard, ProductGrid, RecommendationSection
│   │   ├── cart/                      # CartDrawer
│   │   ├── affiliate/                 # ReferralLinkCard, CommissionChart
│   │   └── shared/                    # DataTable, StatCard
│   │
│   ├── services/                      # API layer — mọi fetch đều qua đây
│   │   ├── api.ts                     # Axios instance, interceptors, base URL
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   ├── order.service.ts
│   │   ├── affiliate.service.ts
│   │   └── ai.service.ts              # Recommendation + Chatbot calls
│   │
│   ├── hooks/                         # Custom hooks bọc TanStack Query
│   │   ├── useProducts.ts
│   │   ├── useCart.ts
│   │   └── useAffiliate.ts
│   │
│   ├── store/                         # Zustand stores
│   │   ├── auth.store.ts
│   │   └── cart.store.ts
│   │
│   ├── types/                         # TypeScript interfaces
│   │   ├── product.types.ts
│   │   ├── order.types.ts
│   │   └── affiliate.types.ts
│   │
│   └── lib/
│       ├── utils.ts                   # cn(), formatCurrency()...
│       └── validators.ts              # Zod schemas
│
├── middleware.ts                      # Auth guard cho protected routes
└── tailwind.config.ts
```

---

## 3. End-to-End Data Flow

Kịch bản: **Khách hàng click Affiliate Link → Xem gợi ý AI → Đặt hàng**

### Bước 1: Click Affiliate Link & Attribution
```
User click affismart.com/products/123?ref=AFF999
        │
        ▼
[middleware.ts]                        # Next.js bắt query param ?ref=
        │
        ▼
[api.service.ts (Server/Edge)]         # Gọi API xác thực: POST /api/v1/affiliate/track-click { ref_code, ip }
        │
        ▼
[AffiliateController.java]             # Request đi vào Spring Boot
        │
        ▼
[Redis Rate Limiting]                  # Spring kiểm tra IP. Nếu spam -> block & lưu log vào blocked_click_logs (Entity: BlockedClickLog)
        │
        ▼
[PostgreSQL]                           # Nếu hợp lệ -> UPDATE total_clicks + 1 cho referral_links
        │
        ▼
[middleware.ts]                        # Nhận status 200 OK -> Set cookie ref_code=AFF999
                                       # max-age = 30 ngày, HttpOnly, SameSite=Lax
        │
        ▼
[Browser Cookie]                       # Cookie dùng để tracking Affiliate khi Checkout
```

### Bước 2: Xem gợi ý sản phẩm (AI)
```
[RecommendationSection.tsx]            # Component render "Có thể bạn thích"
        │
        ▼
[ai.service.ts]                        # Gọi GET /api/v1/ai/recommendations
        │
        ▼
[AiServiceClient.java]                 # Forward sang FastAPI
        │  GET http://ai-service/recommend?user_id=... hoặc ?session_id=...
        ▼
[FastAPI - Python]                     # Cosine Similarity (Scikit-learn)
        │                              # Logged-in: personalize theo user_id
        │                              # Guest: fallback theo session_id / hành vi phiên hiện tại
        │                              # Trả về danh sách product_id
        ▼
[ProductService.java]                  # Lấy chi tiết sản phẩm từ PostgreSQL
        │
        ▼
[RecommendationSection.tsx]            # Render danh sách gợi ý
```

### Bước 3: Thêm giỏ hàng & Checkout
```
User click "Thêm vào giỏ"
        │
        ▼
[cart.store.ts - Zustand]              # addItem() lưu vào LocalStorage (Client-side Cart)

User click "Đặt hàng"
        │
        ▼
[order.service.ts]                     # POST /api/v1/orders (Gửi toàn bộ items từ Zustand lên backend)
        │
        ▼
[OrderController.java]                 # @Valid → Bean Validation payload giỏ hàng
        │
        ▼
[OrderService.java @Transactional]
        │  1. Đọc list items từ Body, kiểm tra tồn kho (ProductRepository)
        │  2. Tính tổng tiền dựa trên giá DB (không tin tưởng giá Client gửi)
        │  3. Đọc ref_code từ request body → map sang affiliate_account_id
        │  4. Tạo Order + OrderItems → INSERT PostgreSQL
        │  5. Trả về order_id
        ▼
[PostgreSQL]                           # INSERT: orders, order_items
        │
        ▼
[payment.service.ts]                   # POST /api/v1/payment/create-session { order_id }
        │
        ▼
[StripePaymentService.java]            # Validate order thuộc user và status = PENDING
        │
        ▼
User redirect sang Stripe Checkout (Khách thanh toán)
        │
        ├──▶ (Luồng 1 - Server) Stripe bắn Webhook ngầm về Backend
        │       │  POST /api/v1/payment/webhook
        │       ▼
        │    [StripeWebhookController.java]
        │       │  1. Xác minh Stripe signature (Tránh Fake webhook)
        │       │  2. Ủy quyền `OrderStatusService` cập nhật Order.status = PAID
        │       │  3. NẾU order.affiliate_account_id != null 
        │       │     → Ủy quyền `CommissionService` tạo Entity Commission (status: PENDING)
        │       ▼
        │    [PostgreSQL]               # UPDATE: orders, INSERT: commissions
        │
        └──▶ (Luồng 2 - Client) Stripe redirect User về Frontend URL
                │  GET /payment/success
                ▼
             [Next.js - Success Page]
                │  1. Gọi `cart.store.clearCart()` (Xóa LocalStorage qua Zustand Persist)
                │  2. Kích hoạt TanStack Query `invalidateQueries(['orders'])`
                ▼
             [Giao diện báo Mua hàng thành công]
Admin xác nhận xử lý đơn               # Order.status = CONFIRMED
        │
        ▼
Admin giao hàng                        # Order.status = SHIPPED
        │
        ▼
Admin xác nhận hoàn tất                # Order.status = DONE
        │
        ▼
CommissionService.java                 # Commission PENDING -> APPROVED
```

---

## 4. Nguyên tắc chung

**Backend:**
- Controller chỉ nhận request, trả response — **không chứa business logic**
- Service chứa toàn bộ logic — **không gọi Repository của module khác**
- Entity không expose ra ngoài — luôn convert sang **DTO** trước khi trả về

**Frontend:**
- Page component chỉ lo **layout và data fetching**
- Mọi API call đi qua `services/` — **không fetch thẳng trong component**
- **Zustand** cho client state · **TanStack Query** cho server state