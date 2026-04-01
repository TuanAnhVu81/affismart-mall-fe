# 📄 PRD: AffiSmart Mall – Data-Driven E-commerce & Affiliate Platform

**Document Status:** MVP Final | **Author:** Tuan Anh| **Target Phase:** Portfolio Showcase

---

## 1. Project Overview
**AffiSmart Mall** là một ứng dụng thương mại điện tử mô hình Single-Vendor (một người bán), được tích hợp sẵn hệ thống tiếp thị liên kết (Affiliate Marketing) và các tính năng hỗ trợ từ AI (Recommender & Chatbot). 

Dự án được xây dựng với mục tiêu chứng minh năng lực phát triển một hệ thống Fullstack hoàn chỉnh: từ xử lý giao dịch e-commerce, tracking dữ liệu người dùng, đến tích hợp API bên thứ ba (Stripe, Gemini/OpenAI-compatible LLM API).

## 2. Problem Statement (Vấn đề giải quyết)
Nhiều cửa hàng trực tuyến quy mô nhỏ/vừa (SME) đang gặp 3 điểm nghẽn chính:
1. **Thiếu kênh phân phối:** Không có sẵn hệ thống Affiliate minh bạch để thu hút KOLs/Cộng tác viên bán hàng.
2. **Trải nghiệm rời rạc:** Thiếu khả năng phân tích hành vi để gợi ý sản phẩm cá nhân hóa, dẫn đến tỷ lệ chuyển đổi (Conversion Rate) thấp.
3. **Chi phí công nghệ cao:** Việc tích hợp các nền tảng E-commerce, Affiliate Tracking và AI rời rạc đòi hỏi chi phí và nỗ lực kỹ thuật lớn.

## 3. Product Vision (Tầm nhìn sản phẩm)
Trở thành một nền tảng bán lẻ tinh gọn "3-in-1": Nơi người bán dễ dàng vận hành, Cộng tác viên có công cụ kiếm tiền minh bạch, và Khách hàng được tận hưởng trải nghiệm mua sắm thông minh, được cá nhân hóa nhờ dữ liệu và AI.

## 4. Core Goals & Non-Goals (Phạm vi MVP)

### ✅ Goals (Sẽ làm)
- Hoàn thiện luồng mua sắm cốt lõi (Cart, Checkout, Order Tracking).
- Xây dựng hệ thống Affiliate Tracking chính xác, tự động tính toán hoa hồng.
- Ứng dụng AI/Data cơ bản để tăng trải nghiệm (Gợi ý sản phẩm, Chatbot CSKH).
- Đảm bảo hệ thống bảo mật, có xử lý chống gian lận (Anti-fraud click).

### ❌ Non-Goals (Không làm trong phase này)
- Multi-vendor (Marketplace nhiều người bán).
- Tích hợp đơn vị vận chuyển (Logistics) thực tế.
- Tự train mô hình AI Deep Learning (sẽ sử dụng OpenAI API & Rule-based system).
- Ứng dụng Mobile Native (chỉ tập trung Web Responsive).

## 5. Target Users / User Roles
Hệ thống xoay quanh 3 nhóm người dùng chính:
1. **Customer (Khách mua hàng):** Tìm kiếm, nhận gợi ý sản phẩm, đặt hàng và thanh toán.
2. **Affiliate (Cộng tác viên):** Lấy link giới thiệu, theo dõi lượt click/đơn hàng, yêu cầu rút tiền.
3. **Admin (Chủ shop / Vận hành):** Quản lý danh mục, sản phẩm, xử lý đơn hàng, phê duyệt Affiliate, cấu hình hệ thống và theo dõi analytics toàn diện.

## 6. Key Features (Tính năng MVP)

### 🛒 Dành cho Customer
- Duyệt sản phẩm, tìm kiếm, xem chi tiết và thêm vào giỏ hàng.
- Thanh toán đơn hàng qua cổng **Stripe (Sandbox)**.
- Quản lý tài khoản và lịch sử mua hàng.
- **AI Feature:** Nhận gợi ý sản phẩm (*"Sản phẩm bạn có thể thích"*) và tương tác với AI Chatbot để hỏi đáp về sản phẩm.

### 🔗 Dành cho Affiliate
- Dashboard cá nhân theo dõi Real-time: Lượt click, Đơn hàng thành công, Hoa hồng dự kiến.
- Tạo Affiliate Link/Mã giới thiệu (Ref code) cho từng sản phẩm.
- Tạo yêu cầu rút tiền (Payout Request) khi đạt hạn mức.

### ⚙️ Dành cho Admin (Chủ shop)
- Quản lý danh mục, sản phẩm (CRUD) và xử lý trạng thái đơn hàng.
- Quản lý users, phê duyệt Affiliate và yêu cầu rút tiền.
- Theo dõi Dashboard toàn diện: Doanh thu, Tỷ lệ chuyển đổi, Nguồn traffic và Top Affiliate.
- Kích hoạt cronjob phân tích tồn kho để gắn tag "Giảm giá" cho sản phẩm bán chậm.

## 7. Core User Flows (Luồng nghiệp vụ chính)

*   **Luồng 1 - Mua hàng qua Affiliate:** 
    Affiliate tạo Link ➔ Khách hàng Click (hệ thống lưu Cookie) ➔ Khách thêm giỏ hàng & Thanh toán thành công ➔ Hệ thống ghi nhận đơn hàng & Tự động chia % hoa hồng cho Affiliate.
*   **Luồng 2 - AI Recommendation:** 
    Khách hàng xem/thêm SP vào giỏ (Event Tracking theo `user_id` hoặc `session_id`) ➔ Hệ thống phân tích hành vi (Cosine Similarity / Rule-based) ➔ Gợi ý các sản phẩm liên quan ở Homepage và trang Chi tiết SP.

## 8. Business Rules (Quy tắc nghiệp vụ cốt lõi)
1. **Attribution Model:** Áp dụng mô hình *Last-click* (Tính hoa hồng cho Affiliate có link được click cuối cùng).
2. **Cookie Lifespan:** Tracking Cookie của Affiliate có hiệu lực trong **30 ngày**.
3. **Commission Logic:** Hoa hồng được tính dựa trên **giá trị thực trả** của đơn hàng (sau khi trừ khuyến mãi, không bao gồm phí ship).
4. **Anti-Fraud:** Áp dụng Rate Limiting chặn IP spam click vào link Affiliate trong thời gian ngắn.
5. **Refund/Cancel:** Nếu đơn hàng bị hủy hoặc hoàn tiền, hoa hồng tạm tính của Affiliate sẽ tự động bị khấu trừ.

## 9. Success Metrics (Chỉ số đánh giá dự án)
Vì là dự án Portfolio, thành công được đo lường bằng hiệu năng và tính hoàn thiện của Codebase:
- **Functional:** 100% Core Flows (Đặt hàng, Tracking Affiliate) chạy không lỗi (Cover bởi Unit/Integration Tests).
- **Performance:** API Response Time trung bình dưới `300ms` (nhờ Caching với Redis).
- **Reliability:** Hệ thống Affiliate tracking chính xác 100% trong môi trường test tích hợp. AI Chatbot phản hồi dưới `3s`.
- **Clean Code:** Không có code rác, kiến trúc module rõ ràng, setup Docker Compose chạy được ngay trong 1 nốt nhạc.

---

# 📋 Danh sách Tính năng chi tiết - AffiSmart Mall

## Phase 1: MVP (Minimum Viable Product)
*Đây là các tính năng cốt lõi bắt buộc phải hoàn thiện để chứng minh được toàn bộ luồng nghiệp vụ (Business Flow) của hệ thống e-commerce kết hợp Affiliate và AI.*

### 👤 1. Khách hàng (Customer)
**Tài khoản & Hồ sơ**
*   Đăng ký tài khoản (Email/Password) & Đăng nhập.
*   Quản lý thông tin cá nhân (Tên, Số điện thoại, Địa chỉ giao hàng mặc định).

**Mua sắm & Trải nghiệm**
*   Xem danh sách sản phẩm theo danh mục (Category).
*   Tìm kiếm sản phẩm theo tên/từ khóa.
*   Xem chi tiết sản phẩm (Hình ảnh, giá cả, mô tả, số lượng tồn kho).
*   Thêm sản phẩm vào giỏ hàng (Add to Cart).
*   Cập nhật số lượng hoặc xóa sản phẩm khỏi giỏ hàng.
*   Thanh toán đơn hàng (Checkout) qua flow 2 bước: tạo Order trước, sau đó tạo Stripe Checkout Session.

**Quản lý Đơn hàng**
*   Xem lịch sử các đơn hàng đã đặt.
*   Xem chi tiết đơn hàng và theo dõi trạng thái chuẩn của hệ thống: `PENDING` → `PAID` → `CONFIRMED` → `SHIPPED` → `DONE` hoặc `CANCELLED`.

**Tính năng AI (Tương tác)**
*   Xem khối "Gợi ý cho bạn" (Recommender) tại Trang chủ và Trang chi tiết sản phẩm.
*   Homepage recommendation cho phép guest truy cập; nếu chưa đăng nhập thì dùng dữ liệu theo `session_id` hoặc hành vi của phiên hiện tại để fallback.
*   Mở cửa sổ Chatbot và đặt câu hỏi về sản phẩm/chính sách cửa hàng.

---

### 🔗 2. Cộng tác viên (Affiliate)
**Onboarding & Tài khoản**
*   Đăng ký trở thành Affiliate (Form điền thông tin bổ sung: Kênh quảng bá, STK ngân hàng).
*   Nhận thông báo trạng thái phê duyệt tài khoản (Pending / Approved / Rejected).

**Quản lý Chiến dịch & Link**
*   Tạo Affiliate Link tự động cho trang chủ hoặc một sản phẩm cụ thể.
*   Sao chép (Copy) link nhanh chóng để chia sẻ.

**Dashboard & Báo cáo (Real-time)**
*   Xem thống kê tổng quan: Tổng số lượt Click, Số đơn hàng thành công, Tỷ lệ chuyển đổi (Conversion Rate), Tổng hoa hồng tạm tính.
*   Xem danh sách chi tiết các đơn hàng được ghi nhận từ Link của mình (Che một phần thông tin khách hàng để bảo mật).

**Thanh toán (Payout)**
*   Xem số dư hoa hồng khả dụng (Chỉ cộng khi commission đạt trạng thái `APPROVED`, tức đơn hàng đã `DONE`).
*   Tạo yêu cầu rút tiền (Payout Request) khi số dư đạt mức tối thiểu (VD: 200.000 VNĐ).
*   Xem lịch sử rút tiền và trạng thái (`PENDING`, `APPROVED`, `TRANSFERRED`, `REJECTED`).

---

---

### 👑 3. Quản trị viên (Admin / Chủ shop)
**Quản lý Bán hàng (Catalog & Orders)**
*   CRUD Danh mục và Sản phẩm (Tải ảnh lên Cloudinary, quản lý tồn kho).
*   Quản lý đơn hàng và cập nhật trạng thái (`PAID` ➔ `CONFIRMED` ➔ `SHIPPED` ➔ `DONE`).
*   Hủy đơn hàng / Hoàn tiền (Hệ thống tự động khấu trừ commission Affiliate).

**Quản lý Đối tác Affiliate**
*   Phê duyệt/Từ chối người đăng ký làm Affiliate.
*   Cấu hình tỷ lệ % hoa hồng chung/chi tiết.
*   Phê duyệt Payout Requests và đánh dấu `TRANSFERRED`.

**Quản trị & Analytics**
*   Xem Dashboard tổng quan: Doanh thu, Tổng số đơn, Top Affiliate, Traffic sources.
*   Xem logs hệ thống: IP bị chặn (Anti-fraud click).
*   Kích hoạt Cronjob quét tồn kho cũ gán nhãn "Giảm giá".

---

## Phase 2: Future Features (Tính năng mở rộng trong tương lai)
*Đây là các tính năng được lên kế hoạch để nâng cấp sản phẩm sau khi MVP đã chạy ổn định. Có thể dùng để trả lời câu hỏi: "Nếu có thêm thời gian, em sẽ phát triển thêm gì?" trong buổi phỏng vấn.*

*   **E-commerce Nâng cao:**
    *   Hệ thống Đánh giá & Bình luận sản phẩm (Reviews & Ratings).
    *   Tích hợp API Đơn vị vận chuyển thật (Giao Hàng Nhanh / Viettel Post) để tính phí ship động.
    *   Hệ thống Mã giảm giá (Coupon Code / Voucher).
*   **Affiliate Nâng cao:**
    *   Cấu hình mức hoa hồng (Commission Rate) riêng biệt cho từng danh mục sản phẩm (Ví dụ: Đồ điện tử 2%, Quần áo 10%).
    *   Hỗ trợ Affiliate đa cấp (Sub-affiliate): CTV giới thiệu CTV khác để hưởng % nhỏ.
*   **AI & Data Nâng cao:**
    *   Gửi Email tự động nhắc nhở khách hàng quên thanh toán giỏ hàng (Abandoned Cart Recovery).
    *   AI Sentiment Analysis: Tự động đọc bình luận của khách hàng để đánh giá thái độ (Tích cực/Tiêu cực) và cảnh báo Admin.
*   **Vận hành & Bảo mật:**
    *   Xác thực 2 lớp (2FA) cho tài khoản Admin và Affiliate.
    *   Đăng nhập bằng Google / Facebook (OAuth2).

---

# 🏗️ Tech Stack Proposal (Updated) – AffiSmart Mall

## 1. Sơ đồ Kiến trúc Tổng quan (High-Level Architecture)
Hệ thống được thiết kế theo mô hình **Modular Monolith + 1 AI Microservice**: Core business chạy trong một ứng dụng Spring Boot theo module nghiệp vụ, còn AI service tách riêng để xử lý recommendation và chatbot.

```text
[Khách hàng / Affiliate / Admin]
           │ (HTTPS)
           ▼
┌───────────────────────────────┐
│     FRONTEND (Vercel)         │ ──(JS/TS Requirement: Next.js + TS)
│  Next.js 14 + Tailwind CSS    │
└──────────┬────────────────────┘
           │ (REST API / JSON)
           ▼
┌───────────────────────────────┐        ┌───────────────────────────────┐
│  CORE BACKEND (Render)        │        │   AI MICROSERVICE (Render)    │
│  Java Spring Boot 3.x         │ ──────►│   FastAPI (Python)            │
│  (E-com, Affiliate, Auth)     │        │   (Recommender, Chatbot API)  │
└──────┬───────────────┬────────┘        └──────┬───────┬────────────────┘
       │               │                        │       │
       │               ▼                        │       ▼
       │         ┌────────────┐                 │  ┌────────────┐
       │         │   Redis    │                 │  │ Gemini API │
       │         │ (Upstash)  │                 │  │(GG AI Studio)
       ▼         └────────────┘                 ▼  └────────────┘
┌────────────┐                           (Read-only)
│ PostgreSQL │◄─────────────────────────────────┘
│ (Supabase) │
└────────────┘
```

---

## 2. Chi tiết Công nghệ & Lý do lựa chọn

### 💻 2.1. Frontend (Giao diện & Trải nghiệm người dùng)
*   **Framework:** **Next.js 14 (App Router) + TypeScript**
*   **UI / Styling:** **Tailwind CSS + shadcn/ui**
*   **State Management & Fetching:** **Zustand** (Global state cho Giỏ hàng) + **TanStack Query** (React Query cho việc gọi API).
*   **Lý do chọn:**
    *   *Next.js* hỗ trợ Server-Side Rendering (SSR), cực kỳ quan trọng cho E-commerce để tối ưu SEO (Google dễ dàng index sản phẩm).
    *   *shadcn/ui* đang là tiêu chuẩn công nghiệp mới, giao diện hiện đại, dễ tùy biến, code sạch hơn so với Bootstrap hay Material UI.
    *   *TypeScript* giúp bắt lỗi ngay khi code, chứng minh bạn có tư duy viết code chặt chẽ.

### ☕ 2.2. Backend (Core Business Logic)
*   **Framework:** **Java Spring Boot 3.2+ (Java 21)**
*   **ORM / Data Access:** **Spring Data JPA + Hibernate**
*   **Security:** **Spring Security + JWT**
*   **Validation:** **Jakarta Bean Validation**
*   **Lý do chọn:**
    *   **Độ tin cậy cho E-commerce:** Spring Boot quản lý Transaction (`@Transactional`) cực kỳ chặt chẽ, đảm bảo tính toàn vẹn dữ liệu khi có nhiều người cùng mua một mặt hàng (tránh lỗi race condition/âm kho).
    *   **Kiến trúc chuẩn chỉ:** Mô hình Layered Architecture (Controller -> Service -> Repository) giúp code rất dễ đọc và maintain. Cấu trúc này là điểm cộng tuyệt đối trong mắt các Tech Lead phỏng vấn.
    *   **Hệ sinh thái:** Dễ dàng tích hợp Redis (Spring Data Redis) để làm caching và hệ thống Tracking Affiliate một cách mượt mà.

### 🤖 2.3. AI Service (Xử lý Dữ liệu & AI)
*   **Framework:** **FastAPI (Python)** *(Đáp ứng yêu cầu biết Python trong JD)*
*   **Tích hợp LLM:** **Google Gemini API (thông qua Google AI Studio - Free 100%)**
*   **Thuật toán Gợi ý (Recommender):** **Scikit-learn** (Tính toán Cosine Similarity để gợi ý sản phẩm).
*   **Lý do chọn & Chiến lược:**
    *   *FastAPI* cực kỳ nhẹ và nhanh, dễ dàng deploy chung lên nền tảng Render bản Free.
    *   Dùng **Gemini API** để làm Chatbot CSKH vì tốc độ phản hồi cực nhanh (dòng 1.5 Flash) và miễn phí, tránh rủi ro sập hệ thống khi hết credit OpenAI.
    *   *Ghi chú cho CV:* Gói gọn logic gọi Gemini vào một class `LLMProvider`. Điều này chứng minh bạn biết cách tích hợp AI API (giống hệt cách gọi OpenAI), chỉ khác endpoint.

### 🗄️ 2.4. Database (Lưu trữ dữ liệu tĩnh)
*   **Công nghệ:** **PostgreSQL**
*   **Hosting:** **Supabase** (Cung cấp gói Free trọn đời rất xịn).
*   **Lý do chọn:**
    *   E-commerce đòi hỏi tính toàn vẹn dữ liệu cực cao (ACID) cho các giao dịch đơn hàng và tính toán hoa hồng. Quan hệ giữa các bảng (User -> Order -> Affiliate) rất phức tạp, do đó CSDL Quan hệ (Relational DB) như PostgreSQL là bắt buộc. Tuyệt đối không dùng MongoDB cho dự án này.

### ⚡ 2.5. Caching & Tracking (Lưu trữ tốc độ cao)
*   **Công nghệ:** **Redis**
*   **Hosting:** **Upstash** (Serverless Redis, cực kỳ phù hợp cho Next.js/NestJS, gói Free rộng rãi).
*   **Lý do chọn:**
    *   *Bắt buộc phải có cho hệ thống Affiliate:* Dùng cho cache, rate limiting anti-fraud và các counter thống kê tốc độ cao. Attribution chính thức dùng cookie ở trình duyệt.
    *   *Bảo mật:* Áp dụng Rate Limiting chặn IP spam click ảo.

### 🖼️ 2.6. Storage (Lưu trữ hình ảnh/File)
*   **Dịch vụ:** **Cloudinary**
*   **Lý do chọn:**
    *   Hoàn toàn miễn phí cho mức độ MVP. Cung cấp API upload trực tiếp từ Backend.
    *   Điểm ăn tiền lớn nhất: Cloudinary tự động nén ảnh (WebP) và crop ảnh vừa khung hình, giúp trang web load nhanh hơn hẳn mà không cần viết thêm code xử lý ảnh.

### 🚀 2.7. DevOps & Hosting (Vận hành & Triển khai)
*   **CI/CD Pipeline:** **GitHub Actions** (Tự động build và deploy khi có code mới).
*   **Môi trường Dev:** **Docker & Docker Compose** (Gói toàn bộ DB, Redis, Backend vào 1 lệnh chạy `docker-compose up` - Cực kỳ ghi điểm với nhà tuyển dụng).
*   **Hosting Frontend:** **Vercel** (Miễn phí, tối ưu 100% cho Next.js).
*   **Hosting Backend & AI:** **Render** (Miễn phí cho Web Service, tự động deploy từ GitHub, có hỗ trợ cả Node.js và Python).

## 🎯 Tổng kết (Architect Note)
Với bộ Tech Stack này, hệ thống của bạn sở hữu kiến trúc **production-oriented**:
1. Có tính phân tán hợp lý (Next.js - Spring Boot - FastAPI).
2. Sử dụng đúng công cụ cho đúng việc (Postgres lưu giao dịch, Redis lưu cache/cart/rate limiting, Python tính toán AI).
3. Đạt chuẩn kỹ thuật theo yêu cầu JD (JS/TS, Python, tích hợp AI).
4. **Chi phí duy trì hệ thống: 0đ/tháng** – Lý tưởng để đính kèm link thật vào CV cho nhà tuyển dụng trải nghiệm trực tiếp.

---

## 💡 "Vũ khí" phỏng vấn dành cho bạn (Architect's Advice)

Khi nhà tuyển dụng hỏi: *"JD yêu cầu biết OpenAI API, nhưng anh thấy em dùng Gemini của Google?"*

**Hãy trả lời theo phong cách của một Senior Engineer:**

> *"Dạ đúng, để duy trì dự án chạy Live 24/7 cho portfolio với chi phí 0đ, em đã quyết định sử dụng Gemini 3.0 Flash Preview qua Google AI Studio vì họ có free-tier rất hào phóng.* 
>
> *Tuy nhiên, về mặt thiết kế hệ thống, em đã áp dụng **Adapter Pattern** trong microservice Python. Code của em gọi LLM thông qua một Interface trừu tượng (Abstract Interface). Việc gọi OpenAI API hay Gemini API thực chất chỉ khác nhau ở JSON Payload và Endpoint. Nếu công ty mình đang dùng OpenAI, em chỉ mất đúng 5 phút để đổi API Key và thay thư viện HTTP Client là hệ thống của em chạy được ngay lập tức mà không cần sửa logic Chatbot của Business."*

Câu trả lời này sẽ khiến nhà tuyển dụng **"wow"**, vì nó cho thấy:
1. Bạn có **Tư duy tối ưu chi phí (Cost-awareness)** (thông qua vụ chọn API Gemini free).
2. Bạn có **Tư duy thiết kế phần mềm linh hoạt (Design Patterns - Adapter)**.
3. Bạn tự tin với kỹ năng làm việc cùng API của bất kỳ hãng AI nào.