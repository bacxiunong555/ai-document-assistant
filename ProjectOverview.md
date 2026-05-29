# TỔNG QUAN DỰ ÁN: AI ADMINISTRATIVE ASSISTANT - RAG SYSTEM

## 1. Giới thiệu
Đây là hệ thống **Trợ lý Trí tuệ Nhân tạo hỗ trợ soạn thảo Văn bản hành chính** ứng dụng công nghệ **RAG** (Retrieval-Augmented Generation). 
Hệ thống giúp tự động hóa việc tạo ra các tài liệu như Quyết định, Công văn, Tờ trình,... tuân thủ tuyệt đối về cả nội dung và thể thức trình bày theo **Nghị định 30/2020/NĐ-CP** của Chính phủ Việt Nam.

## 2. Kiến trúc Hệ thống
- **Frontend:** Xây dựng bằng React/Vite, cung cấp giao diện soạn thảo trực quan (WYSIWYG), quản lý người dùng, phân hệ Admin, và các tính năng xuất file (PDF, Word).
- **Backend:** Xây dựng bằng Python (FastAPI/Flask), tích hợp ChromaDB để lưu trữ vector nội dung văn bản pháp lý.
- **AI Engine:** Hệ thống sử dụng mô hình LLM kết hợp với kỹ thuật RAG để tra cứu các "căn cứ pháp lý" chuẩn xác trước khi sinh ra nội dung văn bản.
- **Database:** MySQL lưu trữ thông tin người dùng, lịch sử soạn thảo và siêu dữ liệu (metadata) của tài liệu RAG.

## 3. Quá trình triển khai & Những hạng mục đã hoàn thành

### 3.1. Tối ưu hóa RAG & Quản lý tri thức (Knowledge Base)
- Xây dựng giao diện Admin cho phép upload tài liệu pháp lý trực tiếp lên hệ thống thay vì dùng script thủ công.
- Tự động bóc tách (chunking) và vector hóa dữ liệu (embeddings) để AI có thể trích xuất chính xác các điều khoản, luật định.

### 3.2. Soạn thảo văn bản thông minh
- Phát triển module `prompt_builder.py` ép AI trả về dữ liệu dưới dạng cấu trúc JSON (chia rõ tiêu ngữ, quốc hiệu, căn cứ, điều khoản, nơi nhận,...).
- Xây dựng `DocumentRenderer` trên Frontend để map cấu trúc JSON thành giao diện tờ giấy A4 trực quan, cho phép người dùng click vào từng dòng để chỉnh sửa (Inline Editing) mà không làm vỡ cấu trúc.
- Tự động lọc các ký tự thừa (như `/.`) thường bị AI sinh nhầm ở cuối văn bản.

### 3.3. Chuẩn hóa tính năng Xuất PDF (In ấn)
- Cấu hình file `document.css` áp dụng "kỷ luật sắt" cho trình duyệt khi in:
  - Tắt hoàn toàn Header/Footer mặc định của trình duyệt (Ngày tháng, Link web).
  - Khóa layout (`position: absolute`, `min-height: 297mm`, `width: 210mm`) để tờ giấy A4 phủ kín trang, xóa bỏ lỗi "khung viền xám" thừa thãi.
  - Ẩn toàn bộ UI của hệ thống (Sidebar, Menu), chỉ giữ lại duy nhất tờ giấy trắng văn bản.

### 3.4. Chuẩn hóa tính năng Xuất File Word (.docx)
- Xây dựng file `docxExporter.js` tự động convert cấu trúc JSON thành cấu trúc của Microsoft Word.
- **Khớp 100% với phụ lục Nghị định 30:**
  - Quốc hiệu: Size 12, in hoa, đứng đậm.
  - Tiêu ngữ: Size 13, in thường, đứng đậm.
  - Cơ quan ban hành/chủ quản: Size 12, in hoa, phân chia tỉ lệ cột 45% - 55% để không rớt dòng.
  - Số ký hiệu: Size 13, chữ đứng (không in nghiêng).
  - Tự động bắt lỗi in đậm sai: Chữ "Điều 1, 2, 3" được đưa về chữ thường, nhưng từ khóa "QUYẾT ĐỊNH:" được tự động in đậm, căn giữa.
  - Xử lý thông minh mảng "Nơi nhận" để loại bỏ lỗi lặp dấu gạch đầu dòng (`--`).
  - Lọc sạch mã rác HTML (`<p>`, `<b>`, `style`) do trình chỉnh sửa sinh ra trước khi đưa vào Word.

## 5. Cấu trúc thư mục dự án
Dưới đây là sơ đồ thư mục chính của dự án và giải thích chức năng từng phần:

```text
AI Administrative Assistant - RAG System/
│
├── backend/                       # TOÀN BỘ CODE CỦA SERVER (PYTHON)
│   ├── app.py                     # File gốc khởi chạy server FastAPI/Flask
│   ├── config.py                  # Các biến cấu hình chung
│   ├── core/                      # Xử lý các thành phần cốt lõi (Exceptions, Response...)
│   ├── data/                      # Dữ liệu AI cục bộ
│   │   ├── chroma_db/             # Chứa Vector Database (kiến thức pháp lý cho RAG)
│   │   └── raw/                   # Chứa các file PDF/Docx luật gốc chưa xử lý
│   ├── infrastructure/            # Tương tác với hệ thống bên ngoài (LLM, Vector Store, File Loader)
│   ├── models/                    # Khai báo các mô hình dữ liệu (Database Models)
│   ├── modules/                   # Các chức năng của API
│   │   ├── admin/                 # Code quản lý hệ thống cho Admin (Users, RAG Docs, System Dashboard)
│   │   ├── ai/                    # Xử lý tương tác cốt lõi với AI & Prompt Builder
│   │   ├── auth/                  # Xử lý Đăng nhập, phân quyền, JWT Token
│   │   └── user/                  # Tính năng của người dùng (Drafting, Export, Workflow, Documents...)
│   └── scripts/                   # Các kịch bản tiện ích (VD: ingest_data.py để nạp file RAG thủ công)
│
├── frontend/                      # TOÀN BỘ CODE GIAO DIỆN WEB (REACT/VITE)
│   ├── src/
│   │   ├── app/                   # Chứa cấu hình Store (Redux/Zustand) và Router chính
│   │   ├── assets/                # Hình ảnh, font chữ và các CSS dùng chung (index.css)
│   │   ├── hooks/                 # Các React Custom Hooks (API calling, state management...)
│   │   ├── layouts/               # Khung sườn giao diện (MainLayout bao bọc toàn bộ trang)
│   │   ├── modules/               # Các trang và tính năng cụ thể chia theo phân hệ
│   │   │   ├── admin/             # Màn hình cho Admin (Dashboard, Upload tài liệu RAG, Quản lý User)
│   │   │   ├── login/             # Màn hình đăng nhập hệ thống
│   │   │   └── users/             # Màn hình chức năng cho Chuyên viên
│   │   │       ├── dashboard/     # Trang tổng quan thông kê của chuyên viên
│   │   │       ├── documents/     # Trang tìm kiếm và xem chi tiết văn bản mẫu
│   │   │       ├── drafting/      # Chức năng SOẠN THẢO VĂN BẢN RAG (Gồm DocumentRenderer, css in ấn)
│   │   │       ├── export/        # Trang quản lý xuất file
│   │   │       └── workflow/      # Trang trình ký, gửi luồng công việc
│   │   ├── services/              # Các file gọi API kết nối xuống Backend
│   │   └── utils/                 # Các hàm công cụ dùng chung (VD: docxExporter.js)
│   ├── package.json               # Danh sách thư viện Node.js cần cài
│   └── vite.config.js             # Cấu hình build server Vite
│
├── .env                           # Nơi giấu khóa API, mật khẩu DB (Không bao giờ push file này lên Git)
├── .env.example                   # File mẫu cấu hình biến môi trường
├── HuongDanSuDung.md              # File HDSD dành cho người dùng cuối
└── ProjectOverview.md             # Tổng quan về logic dự án và kỹ thuật
```
