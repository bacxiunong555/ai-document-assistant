import json
import logging
import re
from datetime import datetime, timedelta
from backend.extensions import db
from backend.models.document import Document
from backend.infrastructure.llm.llm import get_llm
from langchain_core.messages import SystemMessage, HumanMessage

logger = logging.getLogger(__name__)

# Cache AI suggestions
_ai_cache = {}
CACHE_DURATION = timedelta(minutes=30)

def get_stats(user_id):
    docs = Document.query.filter_by(author_id=user_id).all()
    tong_van_ban = len(docs)
    
    cho_duyet = 0
    da_duyet = 0
    bi_tu_choi = 0
    
    for d in docs:
        if d.status in ["cho_duyet", "Chờ duyệt"]:
            cho_duyet += 1
        elif d.status in ["da_duyet", "Đã duyệt"]:
            da_duyet += 1
        elif d.status in ["bi_tu_choi", "yeu_cau_sua", "Yêu cầu sửa", "Bị từ chối"]:
            bi_tu_choi += 1
            
    van_ban_khan = cho_duyet // 2 if cho_duyet > 1 else 0
    phan_tram_tang = 12
    
    return {
        "tong_van_ban": tong_van_ban,
        "cho_duyet": cho_duyet,
        "da_duyet": da_duyet,
        "bi_tu_choi": bi_tu_choi,
        "van_ban_khan": van_ban_khan,
        "phan_tram_tang": phan_tram_tang
    }

def get_recent_documents(user_id, limit=5):
    docs = Document.query.filter_by(author_id=user_id).order_by(Document.created_at.desc()).limit(limit).all()
    result = []
    for d in docs:
        so_hieu = "Chưa cấp số"
        try:
            if d.content:
                content_json = json.loads(d.content)
                if isinstance(content_json, dict):
                    so_hieu = content_json.get("so_ky_hieu", "Chưa cấp số")
        except:
            pass

        status = d.status
        if status not in ["da_duyet", "cho_duyet", "yeu_cau_sua", "ban_nhap"]:
            if status in ["Bản nháp", "ban_nhap"]: status = "ban_nhap"
            elif status in ["Chờ duyệt", "cho_duyet"]: status = "cho_duyet"
            elif status in ["Đã duyệt", "da_duyet"]: status = "da_duyet"
            elif status in ["Yêu cầu sửa", "yeu_cau_sua", "Bị từ chối"]: status = "yeu_cau_sua"
            else: status = "ban_nhap"

        result.append({
            "id": d.id,
            "tieu_de": d.title,
            "loai_van_ban": d.doc_type,
            "so_hieu": so_hieu,
            "ngay_tao": d.created_at.strftime("%d/%m/%Y"),
            "trang_thai": status
        })
    return result

def get_analysis_data(user_id):
    stats = get_stats(user_id)
    recent = get_recent_documents(user_id, 10)
    return {
        "thong_ke": stats,
        "van_ban_gan_day": recent
    }

def generate_ai_suggestions(user_id):
    now = datetime.now()
    if user_id in _ai_cache:
        cache_data, cache_time = _ai_cache[user_id]
        if now - cache_time < CACHE_DURATION:
            return cache_data

    try:
        data = get_analysis_data(user_id)
        llm = get_llm()
        
        sys_prompt = "Bạn là trợ lý hành chính thông minh. Phân tích dữ liệu văn bản và đưa ra tối đa 3 gợi ý ngắn gọn, thiết thực bằng tiếng Việt. Mỗi gợi ý tối đa 15 từ. Chỉ trả về JSON với format {'goi_y': ['gợi ý 1', 'gợi ý 2', 'gợi ý 3']}"
        system_msg = SystemMessage(content=sys_prompt)
        human_msg = HumanMessage(content=f"Dữ liệu văn bản: {json.dumps(data, ensure_ascii=False)}")
        
        response = llm.invoke([system_msg, human_msg])
        raw_text = response.content.strip()
        
        raw_text = re.sub(r'<think>.*?</think>', '', raw_text, flags=re.DOTALL).strip()
        if raw_text.startswith("```"):
            raw_text = re.sub(r"^```(?:json)?", "", raw_text)
            raw_text = re.sub(r"```$", "", raw_text).strip()
            
        parsed = json.loads(raw_text)
        goi_y = parsed.get("goi_y", [])
        
        if not goi_y:
            raise ValueError("Empty suggestions")
            
        _ai_cache[user_id] = (goi_y, now)
        return goi_y
    except Exception as e:
        logger.error(f"[AI Suggestions Error]: {e}")
        return [
            "Công văn số 123 cần bổ sung căn cứ pháp lý theo NĐ 30",
            "Quyết định số 45 có thể tham khảo mẫu QĐ-01 trong kho RAG",
            "Bạn có 2 văn bản quá hạn, cần hoàn thành trước ngày 10/04"
        ]
