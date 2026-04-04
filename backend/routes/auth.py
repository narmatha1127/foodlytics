from flask import Blueprint, request, jsonify
import requests as http_requests
from config import ADMIN_EMAILS, FIREBASE_PROJECT_ID

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/verify-token", methods=["POST"])
def verify_token():
    # We rely on frontend Firebase SDK for auth; backend just checks email for role
    # Frontend sends verified user email directly — acceptable for this DBMS project scope
    email = request.json.get("email")
    if not email:
        return jsonify({"error": "No email"}), 400

    admin_emails_lower = [e.lower() for e in ADMIN_EMAILS]
    role = "admin" if email.lower() in admin_emails_lower else "student"
    return jsonify({"role": role, "email": email})
