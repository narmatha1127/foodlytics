from flask import Blueprint, request, jsonify
from models import db, Feedback

feedback_bp = Blueprint("feedback", __name__)

@feedback_bp.route("/feedback", methods=["POST"])
def submit_feedback():
    data = request.json
    email = data.get("student_email")
    name = data.get("student_name")
    reg_number = data.get("reg_number")
    f_type = data.get("feedback_type")
    msg = data.get("message")

    if not all([email, name, reg_number, f_type, msg]):
        return jsonify({"error": "Missing fields"}), 400

    new_fb = Feedback(
        student_email=email,
        student_name=name,
        reg_number=reg_number,
        feedback_type=f_type,
        message=msg
    )
    db.session.add(new_fb)
    db.session.commit()
    return jsonify({"message": "Feedback submitted"})

@feedback_bp.route("/feedback", methods=["GET"])
def get_feedback():
    # Admin only (not enforced at route level for simplicity, UI protects it)
    items = Feedback.query.order_by(Feedback.timestamp.desc()).all()
    return jsonify([f.to_dict() for f in items])
@feedback_bp.route("/feedback/<int:feedback_id>", methods=["DELETE"])
def delete_feedback(feedback_id):
    item = Feedback.query.get_or_404(feedback_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Feedback deleted"})
