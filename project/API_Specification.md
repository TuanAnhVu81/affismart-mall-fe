# AffiSmart Mall — RESTful API Design

> **Role:** Backend Lead · **Base URL:** `/api/v1` · **Auth:** JWT Bearer Token

---

## Auth Legend

| Ký hiệu | Ý nghĩa |
|---|---|
| 🌐 Public | Không cần token |
| 🔐 Private | Cần JWT — bất kỳ role nào |
| 👤 Customer | Cần JWT — role CUSTOMER |
| 🔗 Affiliate | Cần JWT — role AFFILIATE (đã APPROVED) |
| 🛠️ Admin | Cần JWT — role ADMIN |

---

## 1. Auth Module

| # | Method | Endpoint | Mục đích | Auth |
|---|---|---|---|---|
| 1 | POST | `/auth/register` | Đăng ký tài khoản mới (Customer) | 🌐 Public |
| 2 | POST | `/auth/login` | Đăng nhập, trả về JWT access token | 🌐 Public |
| 3 | POST | `/auth/refresh` | Làm mới access token bằng refresh token | 🌐 Public |
| 4 | POST | `/auth/logout` | Vô hiệu hóa refresh token | 🔐 Private |

---

## 2. User Module

| # | Method | Endpoint | Mục đích | Auth |
|---|---|---|---|---|
| 5 | GET | `/users/me` | Lấy thông tin profile cá nhân | 🔐 Private |
| 6 | PUT | `/users/me` | Cập nhật thông tin cá nhân (tên, SĐT, địa chỉ) | 🔐 Private |
| 7 | PUT | `/users/me/password` | Đổi mật khẩu | 🔐 Private |
| 8 | GET | `/users` | Lấy danh sách tất cả users (phân trang) | 🛠️ Admin |
| 9 | GET | `/users/{id}` | Xem chi tiết 1 user | 🛠️ Admin |
| 10 | PUT | `/users/{id}/status` | Kích hoạt / vô hiệu hóa / ban tài khoản | 🛠️ Admin |
| 11 | PUT | `/users/{id}/reset-password` | Admin reset mật khẩu hộ user | 🛠️ Admin |

---

## 3. Category Module

| # | Method | Endpoint | Mục đích | Auth |
|---|---|---|---|---|
| 12 | GET | `/categories` | Lấy danh sách danh mục đang active | 🌐 Public |
| 13 | GET | `/categories/{slug}` | Lấy chi tiết 1 danh mục theo slug | 🌐 Public |
| 14 | POST | `/categories` | Tạo danh mục mới | 🛠️ Admin |
| 15 | PUT | `/categories/{id}` | Cập nhật tên / slug danh mục | 🛠️ Admin |
| 16 | PUT | `/categories/{id}/status` | Ẩn / hiện danh mục (soft delete) | 🛠️ Admin |

---

## 4. Product Module

| # | Method | Endpoint | Mục đích | Auth |
|---|---|---|---|---|
| 17 | GET | `/products` | Lấy danh sách sản phẩm (filter: category, price, search, phân trang) | 🌐 Public |
| 18 | GET | `/products/{slug}` | Lấy chi tiết sản phẩm theo slug | 🌐 Public |
| 19 | GET | `/products/search` | Tìm kiếm sản phẩm theo từ khóa | 🌐 Public |
| 20 | POST | `/products` | Tạo sản phẩm mới | 🛠️ Admin |
| 21 | PUT | `/products/{id}` | Cập nhật thông tin sản phẩm | 🛠️ Admin |
| 22 | PUT | `/products/{id}/status` | Ẩn / hiện sản phẩm (soft delete) | 🛠️ Admin |
| 23 | POST | `/products/upload-image` | Upload ảnh rác lên Cloudinary để lấy chuỗi URL trước, sau đó nhúng URL vào body để tạo/cập nhật Product sau | 🛠️ Admin |
| 24 | GET | `/products/low-stock` | Danh sách sản phẩm sắp hết hàng | 🛠️ Admin |

---

## 5. Order Module

| # | Method | Endpoint | Mục đích | Auth |
|---|---|---|---|---|
| 25 | POST | `/orders` | Tạo order mới từ giỏ hàng, validate tồn kho, nhận `ref_code` nếu có và trả về `order_id` (status ban đầu: `PENDING`) | 👤 Customer |
| 26 | GET | `/orders/my` | Lấy danh sách đơn hàng của chính mình | 👤 Customer |
| 27 | GET | `/orders/my/{id}` | Xem chi tiết đơn hàng của chính mình | 👤 Customer |
| 28 | PUT | `/orders/my/{id}/cancel` | Customer tự hủy đơn (chỉ khi `PENDING` hoặc `PAID`, trước `SHIPPED`) | 👤 Customer |
| 29 | GET | `/orders` | Admin xem toàn bộ đơn hàng của shop (filter, phân trang) | 🛠️ Admin |
| 30 | GET | `/orders/{id}` | Xem chi tiết 1 đơn hàng bất kỳ | 🛠️ Admin |
| 31 | PUT | `/orders/{id}/status` | Admin cập nhật trạng thái đơn (`CONFIRMED` / `SHIPPED` / `DONE`) | 🛠️ Admin |

---

## 6. Payment Module

| # | Method | Endpoint | Mục đích | Auth |
|---|---|---|---|---|
| 32 | POST | `/payment/create-session` | Tạo Stripe Checkout Session từ `order_id`, chỉ chấp nhận order thuộc user hiện tại và đang ở trạng thái `PENDING`, trả về `payment_url` | 👤 Customer |
| 33 | POST | `/payment/webhook` | Nhận webhook từ Stripe, xác nhận thanh toán thành công và cập nhật order sang `PAID` | 🌐 Public* |
| 34 | GET | `/payment/success` | Redirect sau khi Stripe thanh toán thành công | 🌐 Public |
| 35 | GET | `/payment/cancel` | Redirect khi user hủy tại trang Stripe | 🌐 Public |

> *`/payment/webhook` là Public về transport nhưng được bảo vệ bằng **Stripe Signature Verification** (`stripe-signature` header) — không dùng JWT.

---

## 7. Affiliate Module

| # | Method | Endpoint | Mục đích | Auth |
|---|---|---|---|---|
| 36 | POST | `/affiliate/register` | Đăng ký trở thành Affiliate, gửi kèm `promotion_channel` và thông tin thanh toán, chờ Admin duyệt | 🔐 Private |
| 37 | GET | `/affiliate/me` | Xem thông tin affiliate account của mình | 🔗 Affiliate |
| 38 | GET | `/affiliate/me/dashboard` | Tổng quan: clicks, conversions, balance, commission earned | 🔗 Affiliate |
| 39 | GET | `/affiliate/me/links` | Danh sách referral links đã tạo | 🔗 Affiliate |
| 40 | POST | `/affiliate/me/links` | Tạo referral link mới (cho product hoặc toàn shop) | 🔗 Affiliate |
| 41 | PUT | `/affiliate/me/links/{id}/status` | Bật / tắt referral link | 🔗 Affiliate |
| 42 | GET | `/affiliate/me/commissions` | Danh sách hoa hồng (filter theo trạng thái, thời gian) | 🔗 Affiliate |
| 43 | GET | `/affiliate/me/payouts` | Lịch sử các lần yêu cầu payout (`PENDING`, `APPROVED`, `TRANSFERRED`, `REJECTED`) | 🔗 Affiliate |
| 44 | POST | `/affiliate/me/payouts` | Tạo yêu cầu payout mới (≥ 200,000 VNĐ) | 🔗 Affiliate |
| 45 | POST | `/affiliate/track-click` | Validate ref_code, check spam IP, tăng `total_clicks`. (Chỉ trả JSON báo hợp lệ, việc set Cookie do Frontend Next.js tự lo) | 🌐 Public |
| 46 | GET | `/affiliate/accounts` | Admin xem danh sách tất cả affiliate accounts | 🛠️ Admin |
| 47 | PUT | `/affiliate/accounts/{id}/status` | Admin duyệt/từ chối affiliate (Duyệt `APPROVED` auto cấp role `AFFILIATE`) | 🛠️ Admin |
| 48 | PUT | `/affiliate/accounts/{id}/commission-rate` | Admin cấu hình % hoa hồng riêng cho affiliate | 🛠️ Admin |
| 49 | GET | `/affiliate/payouts` | Admin xem danh sách payout đang chờ duyệt | 🛠️ Admin |
| 50 | PUT | `/affiliate/payouts/{id}` | Admin duyệt, từ chối hoặc đánh dấu `TRANSFERRED` cho payout (kèm note) | 🛠️ Admin |

---

## 8. AI Module

| # | Method | Endpoint | Mục đích | Auth |
|---|---|---|---|---|
| 51 | GET | `/ai/recommendations` | Gợi ý sản phẩm cho homepage; guest dùng fallback theo `session_id`, user đăng nhập dùng personalization theo lịch sử | 🌐 Public |
| 52 | GET | `/ai/recommendations/product/{id}` | Gợi ý sản phẩm liên quan trên trang chi tiết | 🌐 Public |
| 53 | POST | `/ai/chat` | Gửi message tới chatbot, nhận response từ Gemini | 🔐 Private |
| 54 | POST | `/ai/events` | Ghi nhận hành vi (VIEW / ADD_TO_CART / PURCHASE) vào bảng `recommendation_events` (Spring Boot lưu thông tin xuống DB) | 🌐 Public |

---

## 9. Analytics Module

| # | Method | Endpoint | Mục đích | Auth |
|---|---|---|---|---|
| 55 | GET | `/analytics/overview` | Tổng quan hệ thống: GMV, tổng đơn, users mới, affiliates active | 🛠️ Admin |
| 56 | GET | `/analytics/revenue` | Doanh thu theo ngày / tuần / thời gian | 🛠️ Admin |
| 57 | GET | `/analytics/top-products` | Top sản phẩm bán chạy nhất | 🛠️ Admin |
| 58 | GET | `/analytics/top-affiliates` | Top affiliates theo doanh thu mang lại | 🛠️ Admin |
| 59 | GET | `/analytics/conversion-rate` | Tỉ lệ chuyển đổi toàn hệ thống | 🛠️ Admin |
| 60 | GET | `/analytics/traffic-sources` | Phân tích nguồn traffic: trực tiếp vs affiliate | 🛠️ Admin |

---

## Tổng hợp theo Auth

| Loại | Số lượng | Ghi chú |
|---|---|---|
| 🌐 Public | 14 | Storefront, Stripe webhook, affiliate tracking, guest recommendation |
| 👤 Customer | 5 | Đặt hàng, xem đơn, hủy đơn |
| 🔗 Affiliate | 9 | Quản lý link, hoa hồng, payout |
| 🛠️ Admin | 26 | Quản lý danh mục, sản phẩm, đơn hàng, users, affiliate, analytics toàn hệ thống |
| 🔐 Private (any role) | 6 | Profile và chatbot |
| **Tổng** | **60** | |

---

## Checkout & Attribution Notes

- Flow checkout chuẩn gồm 2 bước: `POST /orders` để tạo order trước, sau đó `POST /payment/create-session` để tạo Stripe Checkout Session.
- Affiliate attribution dùng cookie `ref_code` TTL 30 ngày ở frontend; khi checkout, frontend gửi `ref_code` kèm request `POST /orders`.
- Frontend gọi public endpoint `POST /affiliate/track-click` để Backend check IP Spam qua Redis và tăng biến `total_clicks` trong bảng `referral_links`. Backend chỉ trả về JSON `{"status": 200, "message": "Valid"}`. Sau đó **Next.js Server Action / Route Handler** tự đặt Cookie `ref_code` vào trình duyệt người dùng (Mô hình Attribution chính thức vẫn là Cookie-based Last-click).
- Recommendation homepage cho phép guest truy cập; client gửi `session_id` khi chưa đăng nhập để hệ thống fallback theo hành vi phiên hiện tại.

---

## Naming Conventions

- Dùng **danh từ số nhiều** cho resource: `/products`, `/orders`, `/users`
- Dùng **hành động qua HTTP method**, không dùng verb trong URL: ✅ `DELETE /products/{id}` thay vì ❌ `/products/delete/{id}`
- Tài nguyên của chính mình dùng `/me`: `/orders/my`, `/affiliate/me` — tránh user đoán ID của người khác
- Action không thuần CRUD dùng sub-resource rõ nghĩa: `/orders/{id}/status`, `/users/{id}/status`
- Version trong URL: `/api/v1/` — dễ nâng cấp sau này mà không breaking change