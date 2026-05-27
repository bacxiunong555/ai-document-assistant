# backend/core/response.py
from flask import jsonify

def success(data=None, message="OK"):
    response = {"success": True, "message": message}
    if data is not None:
        response["data"] = data
    return jsonify(response), 200

def error(message="Error", status=400):
    return jsonify({"success": False, "error": message}), status
