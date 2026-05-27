SYSTEM_PROMPT = """Bạn là chuyên gia soạn thảo văn bản hành chính Việt Nam với 20 năm kinh nghiệm.
Nhiệm vụ: Soạn thảo văn bản hành chính đúng thể thức Nghị định 30/2020/NĐ-CP.

QUY TẮC BẮT BUỘC:
1. Chỉ xuất JSON hợp lệ. KHÔNG thêm bất kỳ text, giải thích, hay markdown (``` ```) nào.
2. Ngôn ngữ văn bản: trang trọng, chính xác, đúng văn phong hành chính.
3. Trường noi_dung phải đầy đủ, hoàn chỉnh, sẵn sàng ký ban hành.
4. Trường ten_loai phải IN HOA toàn bộ.
5. Trả về đúng 9 trường theo schema được yêu cầu, không thêm không bớt.
6. Viết hoa: họ tên người hoa tất cả âm tiết. Chức vụ phần ký IN HOA. Họ tên phần ký hoa đầu âm tiết, KHÔNG in hoa toàn bộ.
7. Văn bản PHẢI kết thúc trường noi_dung bằng "./."
8. Căn cứ pháp lý: mỗi dòng kết thúc ";", dòng cuối kết thúc ","

Bạn là người SOẠN THẢO, không phải người điền form.
Hãy TỰ VIẾT văn bản hoàn chỉnh như một chuyên gia thực thụ.
Nếu không có căn cứ pháp lý từ ngữ cảnh RAG → tự suy luận căn cứ phù hợp dựa trên loại văn bản và nội dung.
TUYỆT ĐỐI không để lại placeholder như [...] hay [Cần bổ sung...] trong output."""

HUONG_DAN_NOI_DUNG = {
    "Quyết định": "CẢNH BÁO: Trường noi_dung PHẢI theo đúng cấu trúc: Căn cứ... → QUYẾT ĐỊNH: → Điều 1, Điều 2, Điều 3, Điều 4. TUYỆT ĐỐI KHÔNG viết theo dạng thông báo, công văn, hay văn xuôi tự do. Gồm: Căn cứ pháp lý (mỗi căn cứ 1 dòng, kết thúc ;), QUYẾT ĐỊNH:, Điều 1 (nội dung chính), Điều 2... (các điều liên quan), Điều cuối-1 (hiệu lực thi hành), Điều cuối (trách nhiệm thi hành).",
    "Công văn": "KHÔNG có tên loại giữa trang. Trích yếu dạng 'V/v ...' nằm ở cột trái dưới số hiệu. Bắt đầu nội dung bằng 'Kính gửi: ...' Gồm: Đoạn mở đầu (lý do, căn cứ), Nội dung chính (các ý rõ ràng), Đề nghị/Yêu cầu cụ thể.",
    "Tờ trình": "Tờ trình BẮT BUỘC có đúng 3 phần với tiêu đề IN HOA, đánh số La Mã, KHÔNG dùng số thứ tự 1, 2, 3:\\n\\nI. SỰ CẦN THIẾT\\n(Trình bày lý do, thực trạng, sự cần thiết phải thực hiện)\\n\\nII. NỘI DUNG ĐỀ XUẤT\\n(Trình bày cụ thể nội dung xin phê duyệt: phạm vi, kinh phí, nguồn vốn, tiến độ...)\\n\\nIII. KIẾN NGHỊ\\n(Kính trình [tên cơ quan nhận] xem xét, chấp thuận...\\nKết thúc bằng ./)",
    "Báo cáo": "Gồm: I. Tình hình chung, II. Kết quả thực hiện, III. Tồn tại hạn chế, IV. Phương hướng nhiệm vụ.",
    "Kế hoạch": "Gồm: I. Mục đích yêu cầu, II. Nội dung kế hoạch (phân theo mục/giai đoạn), III. Tổ chức thực hiện.",
    "Thông báo": "Gồm: Lý do thông báo, Nội dung thông báo, Yêu cầu thực hiện (nếu có).",
    "Biên bản": "Gồm: Thời gian địa điểm, Thành phần tham dự, Nội dung làm việc, Kết luận, Chữ ký các bên.",
    "Hướng dẫn": "Gồm: Phạm vi áp dụng, Nội dung hướng dẫn (phân theo điều/mục), Tổ chức thực hiện.",
    "Chỉ thị": "Gồm: Nhận định tình hình, Các yêu cầu/nhiệm vụ cụ thể (đánh số), Tổ chức thực hiện.",
    "Giấy mời": "Gồm: Lý do mời, Thời gian địa điểm, Thành phần được mời, Yêu cầu chuẩn bị (nếu có).",
    "Giấy giới thiệu": "Gồm: Giới thiệu ông/bà... đến liên hệ công tác tại..., Đề nghị... tạo điều kiện giúp đỡ.",
    "Phương án": "Gồm: I. Căn cứ xây dựng, II. Mục tiêu, III. Nội dung phương án, IV. Tiến độ thực hiện, V. Nguồn lực.",
    "Đề án": "Gồm: I. Sự cần thiết, II. Mục tiêu nhiệm vụ, III. Nội dung đề án, IV. Giải pháp, V. Kinh phí, VI. Tổ chức thực hiện.",
    "Chương trình": "Gồm: I. Mục đích yêu cầu, II. Nội dung chương trình (phân theo hạng mục/giai đoạn), III. Tiến độ, IV. Kinh phí.",
    "Hợp đồng": "Gồm: Thông tin các bên, Điều 1 Đối tượng HĐ, Điều 2 Giá trị & thanh toán, Điều 3 Quyền và nghĩa vụ các bên, Điều 4 Điều khoản khác, Điều 5 Hiệu lực.",
    "default": "Soạn thảo đầy đủ theo đúng thể thức văn bản hành chính Việt Nam."
}

class PromptBuilder:
    def build_messages(self, metadata: dict, context_chunks: list[str], template_content: str) -> list[dict]:
        doc_type_display = metadata.get("doc_type", "Công văn")
        huong_dan = HUONG_DAN_NOI_DUNG.get(doc_type_display, HUONG_DAN_NOI_DUNG["default"])

        cap_tren_val = metadata.get("cap_tren", "").strip()
        if cap_tren_val:
            cap_tren_prompt = f"- Cơ quan chủ quản cấp trên: {cap_tren_val}"
        else:
            cap_tren_prompt = "- Cơ quan chủ quản cấp trên: KHÔNG CÓ, chỉ render 1 dòng tên cơ quan"
            
        ten_co_quan = metadata.get("co_quan_ban_hanh", "...")
        so_hieu = metadata.get("so_hieu", ".../...-...")
        dia_danh = metadata.get("dia_danh", "...")
        
        ngay_thang = metadata.get("ngay_thang", "")
        if ngay_thang:
            try:
                from datetime import datetime
                dt = datetime.strptime(ngay_thang, "%Y-%m-%d")
                ngay_thang = f"ngày {dt.day:02d} tháng {dt.month:02d} năm {dt.year}"
            except Exception:
                pass
        
        ho_ten_nguoi_ky = metadata.get("nguoi_ky", "...")
        chuc_vu_nguoi_ky = metadata.get("chuc_vu_nguoi_ky", "...")
        
        noi_nhan = metadata.get("noi_nhan", [])
        if isinstance(noi_nhan, list):
            noi_nhan_str = ", ".join(noi_nhan)
        else:
            noi_nhan_str = str(noi_nhan)
            
        trich_yeu = metadata.get("trich_yeu", "...")
        yeu_cau_them = metadata.get("yeu_cau_them", "")

        context_str = "\n---\n".join(context_chunks) if context_chunks else "Không có ngữ cảnh pháp lý."

        template_section = ""
        if template_content and template_content.strip() != "":
            template_section = f"""## CẤU TRÚC THAM KHẢO (chỉ xem cấu trúc, KHÔNG điền vào)
{template_content}

LƯU Ý QUAN TRỌNG: Đây CHỈ là cấu trúc tham khảo.
Bạn phải TỰ VIẾT toàn bộ nội dung dựa trên thông tin được cung cấp.
KHÔNG copy, KHÔNG điền vào chỗ trống, KHÔNG giữ lại placeholder."""

        user_prompt = f"""## NHIỆM VỤ
Soạn thảo văn bản hành chính theo thông tin sau.

## LOẠI VĂN BẢN
{doc_type_display} — {huong_dan}

## THÔNG TIN VĂN BẢN
{cap_tren_prompt}
- Tên cơ quan ban hành: {ten_co_quan}
- Số hiệu dự kiến: {so_hieu}
- Địa danh: {dia_danh}
- Ngày tháng: {ngay_thang}
- Người ký: {ho_ten_nguoi_ky}
- Chức vụ người ký: {chuc_vu_nguoi_ky}
- Nơi nhận: {noi_nhan_str}
- Trích yếu: {trich_yeu}
- Yêu cầu nội dung: {yeu_cau_them}

## NGỮ CẢNH PHÁP LÝ (Từ kho tri thức — dùng làm căn cứ)
{context_str}

{template_section}

## YÊU CẦU OUTPUT
Trả về JSON hợp lệ theo đúng schema sau, KHÔNG thêm bất kỳ text nào khác:

{{
  "ten_co_quan": {{
    "cap_tren": "hoặc chuỗi hoặc null",
    "chinh": "..."
  }},
  "quoc_hieu": {{
    "dong1": "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
    "dong2": "Độc lập - Tự do - Hạnh phúc"
  }},
  "so_ky_hieu": "Số: .../...-...",
  "dia_danh_thoi_gian": "..., ngày ... tháng ... năm ...",
  "ten_loai": "TÊN LOẠI VĂN BẢN IN HOA",
  "trich_yeu": "Về việc ...",
  "noi_dung": "[VIẾT TOÀN BỘ NỘI DUNG VĂN BẢN VÀO ĐÂY, TUYỆT ĐỐI KHÔNG GIỮ LẠI DÒNG HƯỚNG DẪN NÀY]",
  "ky_ten": {{
    "chuc_vu": "CHỨC VỤ IN HOA",
    "ho_ten": "Họ và tên"
  }},
  "noi_nhan": [
    "- Nơi nhận 1;",
    "- Lưu VT, ..."
  ]
}}"""

        return [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]
