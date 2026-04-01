# AffiSmart Mall — Database Schema

> **Role:** Database Expert · **Database:** PostgreSQL 16 · **Chuẩn:** 3NF

---

## Quyết định thiết kế

**Tách Role thành bảng riêng thay vì dùng VARCHAR enum:**
Với hệ thống hiện có 3 role chính (`CUSTOMER`, `AFFILIATE`, `ADMIN`), thiết kế `users` → `user_roles` → `roles` giúp RBAC rõ ràng, dễ maintain và dễ mở rộng nhẹ trong tương lai mà không phải sửa schema lõi.

**BaseEntity của Spring Boot:**
Các bảng sẽ kế thừa `created_at`, `updated_at` từ `@MappedSuperclass BaseEntity` — không cần khai báo lại ở từng bảng. Chỉ các bảng **không extend BaseEntity** (bảng log/event thuần) mới ghi chú riêng.

---

## 1. Danh sách Tables tổng quan

```
┌──────────────┐       ┌──────────────┐       ┌───────────────────┐
│    users     │──────<│  user_roles  │>──────│      roles        │
└──────┬───────┘       └──────────────┘       └───────────────────┘
       │
       │ 1                         1──────────┐
       ▼ N                                    ▼
┌──────────────┐    ┌──────────────┐    ┌─────────────────────┐
│    orders    │    │  categories  │    │  affiliate_accounts │
└──────┬───────┘    └──────┬───────┘    └──────────┬──────────┘
       │ 1                 │ 1                      │ 1
       ▼ N                 ▼ N                      ├──────────────> referral_links
┌──────────────┐    ┌──────────────┐                ├──────────────> commissions
│ order_items  │    │   products   │                └──────────────> payout_requests
└──────────────┘    └──────────────┘
                           │ 1
                           ▼ N
                    ┌──────────────────────┐
                    │ recommendation_events│
                    └──────────────────────┘
```

---

## 2. Chi tiết từng Table

---

### 🔵 Nhóm 1 — User & Phân quyền

**`users`** *(extends BaseEntity → có `created_at`, `updated_at`)*

| Column | Type | PK/FK | Constraints | Ghi chú |
|---|---|---|---|---|
| `id` | BIGSERIAL | PK | | Auto increment |
| `email` | VARCHAR(255) | | NOT NULL, UNIQUE | Dùng để đăng nhập |
| `password_hash` | VARCHAR(255) | | NOT NULL | Bcrypt hash |
| `full_name` | VARCHAR(100) | | NOT NULL | |
| `phone` | VARCHAR(20) | | NULLABLE | |
| `default_shipping_address` | TEXT | | NULLABLE | Địa chỉ giao hàng mặc định |
| `status` | VARCHAR(20) | | NOT NULL, DEFAULT `'ACTIVE'` | `ACTIVE`, `INACTIVE`, `BANNED` |
| `bank_info` | TEXT | | NULLABLE | STK nhận tiền payout |

> `role` không còn nằm trong bảng này — đã tách sang `roles` + `user_roles`.

---

**`roles`** *(không extends BaseEntity — bảng cấu hình tĩnh)*

| Column | Type | PK/FK | Constraints | Ghi chú |
|---|---|---|---|---|
| `id` | BIGSERIAL | PK | | |
| `name` | VARCHAR(50) | | NOT NULL, UNIQUE | `CUSTOMER`, `AFFILIATE`, `ADMIN` |
| `description` | VARCHAR(255) | | NULLABLE | Mô tả vai trò |

> Trong MVP này, role `ADMIN` đồng thời đảm nhiệm nghiệp vụ vận hành shop (quản lý catalog, order, affiliate approval, analytics).

---

**`user_roles`** *(bảng trung gian N-N — không extends BaseEntity)*

| Column | Type | PK/FK | Constraints | Ghi chú |
|---|---|---|---|---|
| `user_id` | BIGINT | PK, FK → `users.id` | NOT NULL | |
| `role_id` | BIGINT | PK, FK → `roles.id` | NOT NULL | |
| `assigned_at` | TIMESTAMP | | DEFAULT `now()` | Thời điểm cấp quyền |

> Composite PK `(user_id, role_id)` — đảm bảo không cấp trùng role.

---

### 🔵 Nhóm 2 — E-Commerce Core

**`categories`** *(extends BaseEntity)*

| Column | Type | PK/FK | Constraints | Ghi chú |
|---|---|---|---|---|
| `id` | BIGSERIAL | PK | | |
| `name` | VARCHAR(100) | | NOT NULL | |
| `slug` | VARCHAR(120) | | NOT NULL, UNIQUE | URL-friendly: `ao-thun` |
| `is_active` | BOOLEAN | | DEFAULT `true` | Soft delete |

---

**`products`** *(extends BaseEntity)*

| Column | Type | PK/FK | Constraints | Ghi chú |
|---|---|---|---|---|
| `id` | BIGSERIAL | PK | | |
| `category_id` | BIGINT | FK → `categories.id` | NOT NULL | |
| `name` | VARCHAR(255) | | NOT NULL | |
| `sku` | VARCHAR(100) | | NOT NULL, UNIQUE | Mã hàng nội bộ của Merchant |
| `slug` | VARCHAR(300) | | NOT NULL, UNIQUE | Dùng cho URL |
| `description` | TEXT | | NULLABLE | |
| `price` | DECIMAL(12,2) | | NOT NULL, CHECK > 0 | Không dùng FLOAT — tránh rounding error |
| `stock_quantity` | INTEGER | | NOT NULL, DEFAULT `0`, CHECK ≥ 0 | Chốt chặn cuối ở DB level |
| `image_url` | VARCHAR(500) | | NULLABLE | Cloudinary URL |
| `is_active` | BOOLEAN | | DEFAULT `true` | Soft delete — giữ FK integrity cho order_items |

---

**`orders`** *(extends BaseEntity)*

| Column | Type | PK/FK | Constraints | Ghi chú |
|---|---|---|---|---|
| `id` | BIGSERIAL | PK | | |
| `user_id` | BIGINT | FK → `users.id` | NOT NULL | Người đặt hàng |
| `affiliate_account_id` | BIGINT | FK → `affiliate_accounts.id` | NULLABLE | NULL nếu mua trực tiếp |
| `total_amount` | DECIMAL(12,2) | | NOT NULL, CHECK > 0 | Tổng sau discount |
| `discount_amount` | DECIMAL(12,2) | | NOT NULL, DEFAULT `0` | |
| `status` | VARCHAR(20) | | NOT NULL, DEFAULT `'PENDING'` | `PENDING` → `PAID` → `CONFIRMED` → `SHIPPED` → `DONE` \| `CANCELLED` |
| `stripe_session_id` | VARCHAR(255) | | UNIQUE, NULLABLE | Stripe nhận diện qua Webhook |
| `shipping_address` | TEXT | | NOT NULL | |

---

**`order_items`** *(không extends BaseEntity — bảng giao dịch bất biến)*

| Column | Type | PK/FK | Constraints | Ghi chú |
|---|---|---|---|---|
| `id` | BIGSERIAL | PK | | |
| `order_id` | BIGINT | FK → `orders.id` | NOT NULL, ON DELETE CASCADE | |
| `product_id` | BIGINT | FK → `products.id` | NOT NULL | |
| `quantity` | INTEGER | | NOT NULL, CHECK > 0 | |
| `price_at_time` | DECIMAL(12,2) | | NOT NULL, CHECK > 0 | ⚠️ Snapshot giá — không join ngược `products.price` |

---

### 🔵 Nhóm 3 — Affiliate System

**`affiliate_accounts`** *(extends BaseEntity)*

| Column | Type | PK/FK | Constraints | Ghi chú |
|---|---|---|---|---|
| `id` | BIGSERIAL | PK | | |
| `user_id` | BIGINT | FK → `users.id` | NOT NULL, UNIQUE | 1 user → 1 affiliate account |
| `ref_code` | VARCHAR(50) | | NOT NULL, UNIQUE | VD: `KIEN123` — link toàn shop |
| `promotion_channel` | VARCHAR(100) | | NULLABLE | Kênh quảng bá chính: TikTok, Facebook, Blog... |
| `status` | VARCHAR(20) | | NOT NULL, DEFAULT `'PENDING'` | `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED` |
| `commission_rate` | DECIMAL(5,2) | | NOT NULL, DEFAULT `10.00`, CHECK 0–100 | % hoa hồng |
| `balance` | DECIMAL(12,2) | | NOT NULL, DEFAULT `0`, CHECK ≥ 0 | Số dư khả dụng — stored, không computed |

> `balance` lưu trực tiếp thay vì `SUM(commissions)` — tránh full scan mỗi lần load dashboard. Chỉ cộng vào `balance` khi commission chuyển sang `APPROVED` (tức đơn hàng đã `DONE`) và chỉ chuyển sang `PAID` khi payout đã được chuyển tiền thực tế.

---

**`referral_links`** *(extends BaseEntity)*

| Column | Type | PK/FK | Constraints | Ghi chú |
|---|---|---|---|---|
| `id` | BIGSERIAL | PK | | |
| `affiliate_account_id` | BIGINT | FK → `affiliate_accounts.id` | NOT NULL | |
| `product_id` | BIGINT | FK → `products.id` | NULLABLE | NULL = link toàn shop |
| `ref_code` | VARCHAR(20) | | NOT NULL, UNIQUE | VD: `AFF999-P123` |
| `total_clicks` | INTEGER | | NOT NULL, DEFAULT `0` | Counter cache |
| `total_conversions` | INTEGER | | NOT NULL, DEFAULT `0` | Counter cache |
| `is_active` | BOOLEAN | | DEFAULT `true` | |

---

**`commissions`** *(extends BaseEntity)*

| Column | Type | PK/FK | Constraints | Ghi chú |
|---|---|---|---|---|
| `id` | BIGSERIAL | PK | | |
| `affiliate_account_id` | BIGINT | FK → `affiliate_accounts.id` | NOT NULL | |
| `order_id` | BIGINT | FK → `orders.id` | NOT NULL, UNIQUE | 1 đơn → 1 commission (last-click) |
| `amount` | DECIMAL(12,2) | | NOT NULL, CHECK > 0 | Tiền hoa hồng thực tế |
| `rate_snapshot` | DECIMAL(5,2) | | NOT NULL | ⚠️ Snapshot % tại thời điểm tạo |
| `status` | VARCHAR(20) | | NOT NULL, DEFAULT `'PENDING'` | `PENDING` → `APPROVED` → `PAID` \| `REJECTED` |
| `payout_request_id` | BIGINT | FK → `payout_requests.id` | NULLABLE | Trống nếu chưa được gom vào yêu cầu rút tiền nào |

*(Logic: Khi tạo Payout Request, Backend sẽ update các commission có status=APPROVED -> gán payout_request_id = ID vừa tạo. Khi Admin chuyển Payout thành TRANSFERRED, chỉ cần update status='PAID' cho các commission có cùng ID này).*

---

**`payout_requests`** *(extends BaseEntity)*

| Column | Type | PK/FK | Constraints | Ghi chú |
|---|---|---|---|---|
| `id` | BIGSERIAL | PK | | |
| `affiliate_account_id` | BIGINT | FK → `affiliate_accounts.id` | NOT NULL | |
| `amount` | DECIMAL(12,2) | | NOT NULL, CHECK ≥ 200000 | Ngưỡng tối thiểu theo PRD |
| `status` | VARCHAR(20) | | NOT NULL, DEFAULT `'PENDING'` | `PENDING`, `APPROVED`, `TRANSFERRED`, `REJECTED` |
| `admin_note` | TEXT | | NULLABLE | Lý do từ chối |
| `resolved_at` | TIMESTAMP | | NULLABLE | Thời điểm Admin xử lý |

---

**`blocked_click_logs`** *(không extends BaseEntity — anti-fraud log)*

| Column | Type | PK/FK | Constraints | Ghi chú |
|---|---|---|---|---|
| `id` | BIGSERIAL | PK | | |
| `ip_address` | VARCHAR(45) | | NOT NULL | IPv4 / IPv6 |
| `reason` | VARCHAR(100) | | NOT NULL | `RATE_LIMIT_EXCEEDED` |
| `expires_at` | TIMESTAMP | | NULLABLE | Nếu NULL = block vĩnh viễn |
| `created_at` | TIMESTAMP | | DEFAULT `now()` | |

---

### 🔵 Nhóm 4 — AI & Data Tracking

**`recommendation_events`** *(không extends BaseEntity — event log, chỉ cần `created_at`)*

| Column | Type | PK/FK | Constraints | Ghi chú |
|---|---|---|---|---|
| `id` | BIGSERIAL | PK | | |
| `user_id` | BIGINT | FK → `users.id` | NULLABLE | Có thể NULL với guest user |
| `session_id` | VARCHAR(100) | | NULLABLE | Guest/session tracking cho storefront |
| `product_id` | BIGINT | FK → `products.id` | NOT NULL | |
| `action` | VARCHAR(20) | | NOT NULL | `VIEW`, `ADD_TO_CART`, `PURCHASE` |
| `created_at` | TIMESTAMP | | DEFAULT `now()` | Phục vụ time-decay trong model AI |

> Bảng này chỉ INSERT, không UPDATE/DELETE — append-only log. Python FastAPI đọc trực tiếp để train Cosine Similarity model. Mỗi event phải có ít nhất `user_id` hoặc `session_id` để phục vụ cả logged-in user lẫn guest.

---

## 3. Quan hệ giữa các bảng

### 1-1
| Bảng A | Bảng B | Ghi chú |
|---|---|---|
| `users` | `affiliate_accounts` | UNIQUE trên `user_id` — 1 user chỉ có 1 affiliate account |
| `orders` | `commissions` | UNIQUE trên `order_id` — 1 đơn chỉ có 1 hoa hồng |

### 1-N
| Bảng "1" | Bảng "N" | Ghi chú |
|---|---|---|
| `users` | `orders` | 1 user đặt nhiều đơn |
| `users` | `recommendation_events` | 1 user sinh nhiều event |
| `orders` | `order_items` | 1 đơn có nhiều dòng sản phẩm |
| `categories` | `products` | 1 danh mục chứa nhiều sản phẩm |
| `affiliate_accounts` | `referral_links` | 1 affiliate tạo nhiều link |
| `affiliate_accounts` | `commissions` | 1 affiliate nhận nhiều hoa hồng |
| `affiliate_accounts` | `payout_requests` | 1 affiliate tạo nhiều yêu cầu rút |

### N-N
| Quan hệ | Bảng trung gian | Ghi chú |
|---|---|---|
| `users` ↔ `roles` | `user_roles` | Composite PK `(user_id, role_id)` |
| `orders` ↔ `products` | `order_items` | Kèm `price_at_time` — snapshot tại thời điểm mua |

---

## 4. Indexes khuyến nghị

| Index | Bảng | Column | Lý do |
|---|---|---|---|
| `idx_products_category` | `products` | `category_id` | Filter sản phẩm theo danh mục |
| `idx_products_slug` | `products` | `slug` | Lookup trang chi tiết sản phẩm |
| `idx_products_active` | `products` | `is_active` | Filter sản phẩm đang bán |
| `idx_orders_user` | `orders` | `user_id` | Load lịch sử đơn hàng |
| `idx_orders_status` | `orders` | `status` | Admin filter đơn theo trạng thái |
| `idx_orders_affiliate` | `orders` | `affiliate_account_id` | Tính doanh thu theo affiliate |
| `idx_referral_code` | `referral_links` | `ref_code` | Lookup nhanh khi tracking click |
| `idx_commission_affiliate` | `commissions` | `affiliate_account_id` | Load dashboard affiliate |
| `idx_rec_events_user` | `recommendation_events` | `user_id, product_id` | AI model query |
| `idx_rec_events_session` | `recommendation_events` | `session_id, product_id` | Guest recommendation query |

---

## 5. Lưu ý quan trọng khi implement

> **Snapshot Pattern** — `price_at_time` và `rate_snapshot`
> Bắt buộc snapshot giá sản phẩm và % hoa hồng tại thời điểm giao dịch. Không join ngược bảng gốc để tính toán đơn hàng cũ — đây là lỗi nghiệp vụ nghiêm trọng ảnh hưởng báo cáo tài chính.

> **Stored Balance** — `affiliate_accounts.balance`
> Lưu `balance` trực tiếp, cập nhật trong `@Transactional` khi commission `APPROVED` (đơn đã `DONE`). Khi tạo payout request hợp lệ thì trừ số dư khả dụng; khi payout đạt `TRANSFERRED` thì các commission liên quan mới được đánh dấu `PAID`. Không dùng `SUM(commissions)` mỗi lần query — với hàng nghìn commission records sẽ gây full table scan.

> **Chống Race Condition tồn kho**
> `CHECK (stock_quantity >= 0)` ở DB level là chốt chặn cuối cùng. Kết hợp với `SELECT ... FOR UPDATE` (pessimistic lock) trong `OrderService` khi trừ tồn kho — đảm bảo không bán âm dù có concurrent requests.

> **Cart không có bảng riêng**
> Cart lưu ở Zustand (Local Storage) trên trình duyệt để tối ưu tốc độ và giảm tải backend cho MVP. Khi Checkout, Frontend gửi toàn bộ payload giỏ hàng qua `POST /orders` để persist trực tiếp xuống `order_items`.

> **BaseEntity**
> `users`, `categories`, `products`, `orders`, `affiliate_accounts`, `referral_links`, `commissions`, `payout_requests` đều extend `BaseEntity` — tự động có `created_at`, `updated_at` qua `@PrePersist` / `@PreUpdate`.