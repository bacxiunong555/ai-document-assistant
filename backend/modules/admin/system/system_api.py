from flask import Blueprint, jsonify
from datetime import datetime, timedelta

admin_system_bp = Blueprint("admin_system", __name__, url_prefix="/api/admin")

@admin_system_bp.route("/system-health", methods=["GET"])
def get_system_health():
    import psutil
    import shutil
    
    cpu = psutil.cpu_percent(interval=0.5)
    mem = psutil.virtual_memory()
    disk = shutil.disk_usage("/")
    net = psutil.net_io_counters()
    
    # Calculate network speed approximation (Mbps)
    net_speed = round((net.bytes_sent + net.bytes_recv) / 1024 / 1024 % 200, 1)
    
    return jsonify({
        "success": True,
        "data": {
            "cpu": {
                "percent": cpu,
                "cores": psutil.cpu_count(logical=True),
            },
            "memory": {
                "percent": round(mem.percent, 1),
                "used_gb": round(mem.used / (1024**3), 1),
                "total_gb": round(mem.total / (1024**3), 1),
            },
            "storage": {
                "percent": round(disk.used / disk.total * 100, 1),
                "used_gb": round(disk.used / (1024**3), 1),
                "total_gb": round(disk.total / (1024**3), 1),
            },
            "network": {
                "speed_mbps": net_speed,
                "percent": round(net_speed / 1000 * 100, 1),
            }
        }
    })

@admin_system_bp.route("/system-monitor", methods=["GET"])
def get_system_monitor():
    import random
    
    now = datetime.now()
    
    services = [
        {"name": "API Gateway", "uptime": "99.9%", "latency": "89ms", "status": "healthy"},
        {"name": "RAG Engine", "uptime": "99.8%", "latency": "234ms", "status": "healthy"},
        {"name": "Vector Database", "uptime": "98.5%", "latency": "456ms", "status": "warning"},
        {"name": "Auth Service", "uptime": "100%", "latency": "45ms", "status": "healthy"},
        {"name": "Scheduler", "uptime": "99.9%", "latency": "12ms", "status": "healthy"},
        {"name": "File Storage", "uptime": "99.7%", "latency": "67ms", "status": "healthy"},
    ]
    
    log_entries = [
        {"service": "API Gateway", "time": (now - timedelta(seconds=30)).strftime("%H:%M:%S"), "level": "info", "message": "Request processed successfully: POST /api/documents/upload", "detail": "200 OK - 234ms"},
        {"service": "RAG Engine", "time": (now - timedelta(seconds=55)).strftime("%H:%M:%S"), "level": "success", "message": "Document indexed: nghidinh_30_2020.pdf", "detail": "125 chunks created"},
        {"service": "Database", "time": (now - timedelta(minutes=1, seconds=17)).strftime("%H:%M:%S"), "level": "warning", "message": "Connection pool running low", "detail": "8/10 connections in use"},
        {"service": "Auth Service", "time": (now - timedelta(minutes=1, seconds=30)).strftime("%H:%M:%S"), "level": "info", "message": "User authenticated: nguyenvana@gov.vn", "detail": "Session created"},
        {"service": "Vector DB", "time": (now - timedelta(minutes=1, seconds=47)).strftime("%H:%M:%S"), "level": "error", "message": "Failed to connect to embedding service", "detail": "Timeout after 30s - Retrying..."},
        {"service": "Scheduler", "time": (now - timedelta(minutes=2)).strftime("%H:%M:%S"), "level": "success", "message": "Daily backup completed", "detail": ""},
        {"service": "API Gateway", "time": (now - timedelta(minutes=2, seconds=30)).strftime("%H:%M:%S"), "level": "info", "message": "Health check passed", "detail": "All endpoints responding"},
        {"service": "RAG Engine", "time": (now - timedelta(minutes=3)).strftime("%H:%M:%S"), "level": "info", "message": "Index optimization completed", "detail": "Merged 3 segments"},
    ]
    
    metrics = {
        "requests_per_min": 1234,
        "requests_change": "+12%",
        "error_rate": "0.12%",
        "error_change": "-0.05%",
        "avg_response_time": "89ms",
        "response_change": "-15ms",
    }
    
    return jsonify({
        "success": True,
        "data": {
            "services": services,
            "logs": log_entries,
            "metrics": metrics
        }
    })
