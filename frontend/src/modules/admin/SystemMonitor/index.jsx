import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/admin.service';
import {
  Cpu, MemoryStick, HardDrive, Wifi,
  Activity, RefreshCw, ChevronDown,
  TrendingUp, AlertTriangle, Zap,
  Info, CheckCircle2, AlertCircle, XCircle
} from 'lucide-react';
import './SystemMonitor.css';

const LogLevelIcon = ({ level }) => {
  const map = {
    info: <Info size={14} />,
    success: <CheckCircle2 size={14} />,
    warning: <AlertTriangle size={14} />,
    error: <XCircle size={14} />,
  };
  return (
    <div className={`log-level-icon ${level}`}>
      {map[level] || map.info}
    </div>
  );
};

export default function SystemMonitor() {
  const [health, setHealth] = useState(null);
  const [monitor, setMonitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logFilter, setLogFilter] = useState('all');

  const fetchData = async () => {
    try {
      const [healthRes, monitorRes] = await Promise.all([
        adminService.getSystemHealth(),
        adminService.getSystemMonitor(),
      ]);
      if (healthRes.data?.success) setHealth(healthRes.data.data);
      if (monitorRes.data?.success) setMonitor(monitorRes.data.data);
    } catch (err) {
      console.error('Error fetching system data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = monitor?.logs?.filter(log => {
    if (logFilter === 'all') return true;
    return log.service === logFilter;
  }) || [];

  const uniqueServices = [...new Set(monitor?.logs?.map(l => l.service) || [])];

  if (loading) {
    return (
      <div className="sysmon-container">
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          Đang tải dữ liệu hệ thống...
        </div>
      </div>
    );
  }

  return (
    <div className="sysmon-container">
      {/* Header */}
      <div className="sysmon-header">
        <div>
          <h2>Giám sát hệ thống</h2>
          <p>Theo dõi tình trạng và hiệu suất hệ thống real-time</p>
        </div>
        <div className="sysmon-header-actions">
          <select defaultValue="1h">
            <option value="1h">1 giờ</option>
            <option value="6h">6 giờ</option>
            <option value="24h">24 giờ</option>
            <option value="7d">7 ngày</option>
          </select>
          <button className="sysmon-refresh-btn" onClick={fetchData}>
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Resource Cards */}
      {health && (
        <div className="resource-cards">
          {/* CPU */}
          <div className="resource-card">
            <div className="resource-card-header">
              <span className="resource-card-label">
                <Cpu size={18} color="#3b82f6" /> CPU
              </span>
              <span className="resource-card-value">{health.cpu.percent}%</span>
            </div>
            <div className="resource-bar">
              <div className="resource-bar-fill blue" style={{ width: `${health.cpu.percent}%` }} />
            </div>
            <div className="resource-card-detail">{health.cpu.cores} cores available</div>
          </div>

          {/* Memory */}
          <div className="resource-card">
            <div className="resource-card-header">
              <span className="resource-card-label">
                <MemoryStick size={18} color="#8b5cf6" /> Memory
              </span>
              <span className="resource-card-value">{health.memory.percent}%</span>
            </div>
            <div className="resource-bar">
              <div className="resource-bar-fill purple" style={{ width: `${health.memory.percent}%` }} />
            </div>
            <div className="resource-card-detail">{health.memory.used_gb}GB / {health.memory.total_gb}GB</div>
          </div>

          {/* Storage */}
          <div className="resource-card">
            <div className="resource-card-header">
              <span className="resource-card-label">
                <HardDrive size={18} color="#f59e0b" /> Storage
              </span>
              <span className="resource-card-value">{health.storage.percent}%</span>
            </div>
            <div className="resource-bar">
              <div className="resource-bar-fill amber" style={{ width: `${health.storage.percent}%` }} />
            </div>
            <div className="resource-card-detail">{health.storage.used_gb}GB / {health.storage.total_gb}GB</div>
          </div>

          {/* Network */}
          <div className="resource-card">
            <div className="resource-card-header">
              <span className="resource-card-label">
                <Wifi size={18} color="#06b6d4" /> Network
              </span>
              <span className="resource-card-value">{health.network.percent}%</span>
            </div>
            <div className="resource-bar">
              <div className="resource-bar-fill cyan" style={{ width: `${Math.min(health.network.percent, 100)}%` }} />
            </div>
            <div className="resource-card-detail">{health.network.speed_mbps} Mbps</div>
          </div>
        </div>
      )}

      {/* Services + Logs */}
      {monitor && (
        <div className="sysmon-middle">
          {/* Services */}
          <div className="services-card">
            <div className="services-card-header">
              <span className="services-card-title">
                <Activity size={18} color="#0f172a" /> Trạng thái dịch vụ
              </span>
            </div>
            <div className="service-list">
              {monitor.services.map((svc, i) => (
                <div className="service-item" key={i}>
                  <div className="service-item-left">
                    <span className={`service-status-dot ${svc.status}`} />
                    <div className="service-info">
                      <div className="service-name">{svc.name}</div>
                      <div className="service-uptime">Uptime: {svc.uptime}</div>
                    </div>
                  </div>
                  <div className="service-item-right">
                    <div className="service-latency">{svc.latency}</div>
                    <div className="service-latency-label">latency</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logs */}
          <div className="logs-card">
            <div className="logs-card-header">
              <span className="logs-card-title">System Logs</span>
              <div className="logs-filter">
                <select value={logFilter} onChange={(e) => setLogFilter(e.target.value)}>
                  <option value="all">Tất cả</option>
                  {uniqueServices.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="log-list">
              {filteredLogs.map((log, i) => (
                <div className="log-item" key={i}>
                  <LogLevelIcon level={log.level} />
                  <div className="log-content">
                    <div className="log-content-header">
                      <span className="log-service-tag">{log.service}</span>
                      <span className="log-time">{log.time}</span>
                    </div>
                    <div className="log-message">{log.message}</div>
                    {log.detail && <div className="log-detail">{log.detail}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Metrics */}
      {monitor?.metrics && (
        <div className="sysmon-metrics">
          <div className="metric-card">
            <div>
              <div className="metric-label">Requests / phút</div>
              <div className="metric-value">{monitor.metrics.requests_per_min.toLocaleString()}</div>
              <div className="metric-change positive">↗ {monitor.metrics.requests_change} so với hôm qua</div>
            </div>
            <div className="metric-icon blue">
              <TrendingUp size={24} />
            </div>
          </div>

          <div className="metric-card">
            <div>
              <div className="metric-label">Error Rate</div>
              <div className="metric-value">{monitor.metrics.error_rate}</div>
              <div className="metric-change negative">↘ {monitor.metrics.error_change} so với hôm qua</div>
            </div>
            <div className="metric-icon red">
              <AlertTriangle size={24} />
            </div>
          </div>

          <div className="metric-card">
            <div>
              <div className="metric-label">Avg Response Time</div>
              <div className="metric-value">{monitor.metrics.avg_response_time}</div>
              <div className="metric-change negative">↗ {monitor.metrics.response_change} so với hôm qua</div>
            </div>
            <div className="metric-icon green">
              <Zap size={24} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
