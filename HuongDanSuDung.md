# Hướng Dẫn Cài Đặt Và Sử Dụng (AI Administrative Assistant - RAG System)

Dự án này là hệ thống hỗ trợ soạn thảo văn bản hành chính tích hợp AI (RAG). Dưới đây là hướng dẫn chi tiết để thiết lập và chạy hệ thống trên máy cá nhân.

---

## 1. Yêu cầu hệ thống (Prerequisites)
- **Python:** Phiên bản 3.10 trở lên.
- **Node.js:** Phiên bản 18.x trở lên.
- **Cơ sở dữ liệu:** MySQL Server (có thể dùng XAMPP hoặc cài trực tiếp) và MySQL Workbench.
- **API Key AI:** Cần có Gemini API Key (lấy từ Google AI Studio).

---

## 2. Thiết lập Database (Cơ sở dữ liệu)

Dự án đã đính kèm sẵn file `database_backup.sql` chứa toàn bộ cấu trúc bảng và dữ liệu thực tế đang dùng (danh sách người dùng, văn bản, lịch sử). Bạn BẮT BUỘC phải import file này để giao diện hiển thị đầy đủ thông tin.

1. Mở **MySQL Workbench**.
2. Click chuột phải vào khu vực Schema, chọn **Create Schema**, đặt tên là `rag_document_db` và bấm Apply.
3. Trên thanh công cụ, chọn **Server** -> **Data Import**.
4. Chọn **Import from Self-Contained File**, bấm nút `...` và duyệt tìm tới file `database_backup.sql` có sẵn trong thư mục dự án.
5. Ở mục **Default Target Schema**, chọn `rag_document_db`.
6. Bấm **Start Import** ở góc dưới bên phải để nạp dữ liệu. Chờ đến khi báo "Import completed".

---

## 3. Cài đặt và khởi chạy Backend (Python / Flask)

1. Mở Terminal (Command Prompt / PowerShell) tại thư mục gốc của dự án.
2. Tạo môi trường ảo (Virtual Environment):
   ```
   python -m venv env
   ```
3. Kích hoạt môi trường ảo:
   - Trên Windows: `.\env\Scripts\activate`
   - Trên Mac/Linux: `source env/bin/activate`
4. Cài đặt các thư viện cần thiết:
   ```
   pip install -r requirements.txt
   ```
5. Cấu hình biến môi trường:
   - Đổi tên file `.env.example` thành `.env`
   - Mở file `.env` và điền **Gemini API Key** của bạn vào dòng `GEMINI_API_KEY=...`
   - Kiểm tra lại phần `DB_USER` và `DB_PASSWORD` cho khớp với mật khẩu MySQL trên máy bạn.
6. Chạy server Backend:
   ```
   python -m backend.app
   ```
   *Backend sẽ chạy tại: `http://localhost:5000`*

---

## 4. Cài đặt và khởi chạy Frontend (React / Vite)

1. Mở một Terminal mới và di chuyển vào thư mục `frontend`:
   ```
   cd frontend
   ```
2. Cài đặt các gói thư viện:
   ```
   npm install
   ```
3. Chạy server Frontend:
   ```
   npm run dev
   ```
   *Giao diện Web sẽ chạy tại: `http://localhost:5173` (hoặc port khác hiện trên terminal).*

---

## 5. Tài khoản đăng nhập mặc định

Nếu bạn dùng file `database_backup.sql` đi kèm, bạn có thể đăng nhập bằng các tài khoản sau:

- **Tài khoản Quản trị viên (Admin):**
  - Username: `admin@qlda.gov.vn`
  - Password: `admin123`

- **Tài khoản Chuyên viên (User):**
  - Username: `chuyenvien@qlda.gov.vn`
  - Password: `123456`

---

## 6. Khởi tạo lại Dữ liệu AI (RAG)
Để tính năng AI có thể đọc hiểu các văn bản, bạn cần nạp lại dữ liệu bằng cách:

- Đảm bảo trong thư mục `backend/data/raw` đã có sẵn các file văn bản mẫu (PDF, Docx).
- Chạy lệnh sau trong Terminal (nhớ kích hoạt môi trường ảo trước):
  ```
  python -m backend.scripts.ingest_data
  ```
Lệnh này sẽ tự động đọc toàn bộ file trong `raw`, băm nhỏ và tạo lại thư mục `chroma_db` chứa Vector Database. Sau khi chạy xong, AI sẽ sẵn sàng hoạt động! 
