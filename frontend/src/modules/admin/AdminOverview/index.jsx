import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/admin.service';
import { 
  Database, Users, FileText, Zap, Monitor, Activity, MemoryStick, HardDrive, 
  CircleCheck, CircleX, Clock 
} from 'lucide-react';
import './AdminOverview.css';

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [ragCategories, setRagCategories] = useState(null);
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const [statsRes, healthRes, catRes, actRes] = await Promise.all([
          adminService.getStats(),
          adminService.getSystemHealth(),
          adminService.getRagCategories(),
          adminService.getRecentActivities()
        ]);
        
        setStats(statsRes.data.data);
        setSystemHealth(healthRes.data.data);
        setRagCategories(catRes.data.data);
        setActivities(actRes.data.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu tổng quan:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOverviewData();
  }, []);

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;

  const getMetricIcon = (label) => {
    if (label.includes('CPU')) return <Activity size={16} color="#6b7280" />;
    if (label.includes('Memory')) return <MemoryStick size={16} color="#6b7280" />;
    if (label.includes('Storage')) return <HardDrive size={16} color="#6b7280" />;
    if (label.includes('API')) return <Zap size={16} color="#6b7280" />;
    return null;
  };

  return (
    <div className="admin-overview">
      <div className="overview-header">
        <h2>Tổng quan hệ thống</h2>
      </div>

      {/* Top Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon emerald"><Database size={32} color="#3b82f6" /></div>
          <div className="stat-info">
            <span className="stat-label">Tài liệu RAG</span>
            <span className="stat-value">{stats?.ragDocs?.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Users size={32} color="#8b5cf6" /></div>
          <div className="stat-info">
            <span className="stat-label">Người dùng</span>
            <span className="stat-value">{stats?.users?.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon violet"><FileText size={32} color="#6b7280" /></div>
          <div className="stat-info">
            <span className="stat-label">Văn bản đã xử lý</span>
            <span className="stat-value">{stats?.processedDocs?.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><Zap size={32} color="#f59e0b" /></div>
          <div className="stat-info">
            <span className="stat-label">Truy vấn AI hôm nay</span>
            <span className="stat-value">{stats?.aiQueries?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* System Health */}
        <div className="dashboard-card">
          <div className="card-header" style={{gap: '8px'}}>
            <Monitor size={18} color="#3b82f6" />
            <h3 style={{margin: 0}}>Tình trạng hệ thống</h3>
            <span className="status-badge healthy" style={{marginLeft: 'auto'}}>Healthy</span>
          </div>
          <div className="card-body">
            {systemHealth && (() => {
              const metrics = [
                {label: "CPU Usage", value: systemHealth.cpu.percent, max: 100, unit: "%", status: systemHealth.cpu.percent > 80 ? "warning" : "good"},
                {label: "Memory", value: systemHealth.memory.used_gb, max: systemHealth.memory.total_gb, unit: "GB", status: systemHealth.memory.percent > 80 ? "warning" : "normal"},
                {label: "Storage", value: systemHealth.storage.used_gb, max: systemHealth.storage.total_gb, unit: "GB", status: systemHealth.storage.percent > 80 ? "warning" : "normal"},
                {label: "Network", value: systemHealth.network.speed_mbps, max: 1000, unit: "Mbps", status: "good"},
              ];
              return metrics.map((metric, idx) => (
                <div className="metric-row" key={idx}>
                  <div className="metric-label" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    {getMetricIcon(metric.label)}
                    <span>{metric.label}</span>
                  </div>
                  <div style={{fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px'}}>
                    {metric.value} / {metric.max} {metric.unit}
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className={`progress-bar-fill ${metric.status}`} 
                      style={{width: `${(metric.value / metric.max) * 100}%`}}
                    ></div>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* RAG Stats */}
        <div className="dashboard-card">
          <div className="card-header" style={{gap: '8px'}}>
            <Database size={18} color="#3b82f6" />
            <h3 style={{margin: 0}}>Phân loại tài liệu RAG</h3>
          </div>
          <div className="card-body">
            {ragCategories?.map((item, idx) => (
              <div className="rag-stat-row" key={idx}>
                <span className="rag-label">{item.label}</span>
                <div className="progress-bar-bg flex-1">
                  <div 
                    className="progress-bar-fill gradient" 
                    style={{width: `${item.percentage}%`}}
                  ></div>
                </div>
                <span className="rag-count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="dashboard-card full-width">
        <div className="card-header" style={{gap: '8px'}}>
          <Activity size={18} color="#3b82f6" />
          <h3 style={{margin: 0}}>Hoạt động gần đây</h3>
        </div>
        <div className="card-body">
          <div className="activities-list">
            {activities?.map(act => (
              <div className="activity-item" key={act.id}>
                <div className={`activity-icon ${act.status}`} style={{background: 'transparent', padding: 0}}>
                  {act.status === 'success' ? <CircleCheck size={18} color="#10b981" /> : act.status === 'error' ? <CircleX size={18} color="#ef4444" /> : <Activity size={18} color="#f59e0b" />}
                </div>
                <div className="activity-details">
                  <div className="activity-action">{act.action}</div>
                  <div className="activity-meta">{act.user} - {act.target}</div>
                </div>
                <div className="activity-time" style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <Clock size={14} color="#9ca3af" />
                  {act.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
