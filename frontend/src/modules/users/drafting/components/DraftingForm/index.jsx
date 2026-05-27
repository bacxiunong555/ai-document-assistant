import React, { useState, useEffect } from 'react';
import { getDocTypes, getTemplates } from '../../../../../services/drafting.service';
import { Wand2, X } from 'lucide-react';
import './DraftingForm.css';

const DEFAULT_FORM = {
  doc_type: '',
  template_id: '',
  so_hieu: '',
  cap_tren: '',
  co_quan_ban_hanh: '',
  nguoi_ky: '',
  chuc_vu_nguoi_ky: '',
  ngay_thang: new Date().toISOString().slice(0, 10),
  noi_nhan: '',
  trich_yeu: '',
  yeu_cau_them: '',
};

export default function DraftingForm({ status, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [docTypes, setDocTypes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getDocTypes().then(res => setDocTypes(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (formData.doc_type) {
      getTemplates(formData.doc_type).then(res => setTemplates(res.data || [])).catch(() => {});
    } else {
      setTemplates([]);
    }
  }, [formData.doc_type]);

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!formData.doc_type) e.doc_type = 'Vui lòng chọn loại văn bản';
    if (!formData.trich_yeu || formData.trich_yeu.trim().length < 10) e.trich_yeu = 'Trích yếu tối thiểu 10 ký tự';
    if (!formData.co_quan_ban_hanh.trim()) e.co_quan_ban_hanh = 'Bắt buộc';
    if (!formData.nguoi_ky.trim()) e.nguoi_ky = 'Bắt buộc';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      doc_type: formData.doc_type,
      template_id: formData.template_id ? parseInt(formData.template_id) : undefined,
      metadata: {
        so_hieu: formData.so_hieu,
        cap_tren: formData.cap_tren,
        co_quan_ban_hanh: formData.co_quan_ban_hanh,
        nguoi_ky: formData.nguoi_ky,
        chuc_vu_nguoi_ky: formData.chuc_vu_nguoi_ky,
        ngay_thang: formData.ngay_thang,
        noi_nhan: formData.noi_nhan.split('\n').map(s => s.trim()).filter(Boolean),
        trich_yeu: formData.trich_yeu,
        yeu_cau_them: formData.yeu_cau_them || undefined,
      },
    });
  };

  const isDisabled = status === 'loading' || status === 'streaming';

  return (
    <form className="drafting-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label>Loại văn bản <span className="req">*</span></label>
        <select value={formData.doc_type} onChange={set('doc_type')} disabled={isDisabled}>
          <option value="">-- Chọn loại --</option>
          {docTypes.map(dt => (
            <option key={dt.value} value={dt.value}>{dt.label}</option>
          ))}
        </select>
        {errors.doc_type && <span className="err-msg">{errors.doc_type}</span>}
      </div>

      {templates.length > 0 && (
        <div className="form-group">
          <label>Mẫu văn bản</label>
          <select value={formData.template_id} onChange={set('template_id')} disabled={isDisabled}>
            <option value="">-- Không dùng mẫu --</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label>Số hiệu</label>
        <input type="text" placeholder="VD: 123/CV-UBND" value={formData.so_hieu} onChange={set('so_hieu')} disabled={isDisabled} />
      </div>

      <div className="form-group">
        <label>Cơ quan chủ quản</label>
        <input type="text" placeholder="VD: UBND tỉnh Quảng Bình (để trống nếu không có)" value={formData.cap_tren} onChange={set('cap_tren')} disabled={isDisabled} />
      </div>

      <div className="form-group">
        <label>Cơ quan ban hành <span className="req">*</span></label>
        <input type="text" placeholder="VD: Ủy ban nhân dân tỉnh X" value={formData.co_quan_ban_hanh} onChange={set('co_quan_ban_hanh')} disabled={isDisabled} />
        {errors.co_quan_ban_hanh && <span className="err-msg">{errors.co_quan_ban_hanh}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Người ký <span className="req">*</span></label>
          <input type="text" placeholder="Họ và tên" value={formData.nguoi_ky} onChange={set('nguoi_ky')} disabled={isDisabled} />
          {errors.nguoi_ky && <span className="err-msg">{errors.nguoi_ky}</span>}
        </div>
        <div className="form-group">
          <label>Chức vụ</label>
          <input type="text" placeholder="VD: Chủ tịch" value={formData.chuc_vu_nguoi_ky} onChange={set('chuc_vu_nguoi_ky')} disabled={isDisabled} />
        </div>
      </div>

      <div className="form-group">
        <label>Ngày ban hành</label>
        <input type="date" value={formData.ngay_thang} onChange={set('ngay_thang')} disabled={isDisabled} />
      </div>

      <div className="form-group">
        <label>Nơi nhận</label>
        <textarea rows="3" placeholder="Mỗi nơi nhận 1 dòng" value={formData.noi_nhan} onChange={set('noi_nhan')} disabled={isDisabled} />
      </div>

      <div className="form-group">
        <label>Trích yếu <span className="req">*</span></label>
        <textarea rows="2" placeholder="Về việc..." value={formData.trich_yeu} onChange={set('trich_yeu')} disabled={isDisabled} />
        {errors.trich_yeu && <span className="err-msg">{errors.trich_yeu}</span>}
      </div>

      <div className="form-group">
        <label>Yêu cầu thêm</label>
        <textarea rows="2" placeholder="Mô tả thêm yêu cầu nội dung cụ thể..." value={formData.yeu_cau_them} onChange={set('yeu_cau_them')} disabled={isDisabled} />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={isDisabled} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
          {isDisabled ? 'Đang soạn...' : <><Wand2 size={16} color="white" /> <span>Soạn thảo bằng AI</span></>}
        </button>
        {status === 'streaming' && (
          <button type="button" className="btn-danger" onClick={onCancel} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}>
            <X size={16} color="white" /> Hủy
          </button>
        )}
      </div>
    </form>
  );
}
