from flask import Blueprint, request, jsonify
from models import db, Vote, Winner, Menu
import csv
import io

vote_bp = Blueprint("vote", __name__)

@vote_bp.route("/vote", methods=["POST"])
def cast_vote():
    data = request.json
    email = data.get("student_email")
    reg_number = data.get("reg_number")
    date = data.get("date")
    meal_type = data.get("meal_type")
    chosen_option = data.get("chosen_option")

    if not all([email, reg_number, date, meal_type, chosen_option]):
        return jsonify({"error": "Missing fields"}), 400

    existing = Vote.query.filter_by(student_email=email, date=date, meal_type=meal_type).first()
    if existing:
        existing.chosen_option = chosen_option
        existing.reg_number = reg_number
    else:
        db.session.add(Vote(
            student_email=email,
            reg_number=reg_number,
            date=date,
            meal_type=meal_type,
            chosen_option=chosen_option,
        ))
    db.session.commit()
    return jsonify({"message": "Vote recorded"})


@vote_bp.route("/votes", methods=["GET"])
def get_votes():
    date = request.args.get("date")
    if not date:
        return jsonify({"error": "date required"}), 400

    result = {}
    for meal_type in ["breakfast", "lunch", "dinner"]:
        counts = {1: 0, 2: 0, 3: 0}
        votes = Vote.query.filter_by(date=date, meal_type=meal_type).all()
        for v in votes:
            counts[v.chosen_option] = counts.get(v.chosen_option, 0) + 1
        result[meal_type] = counts
    return jsonify(result)


@vote_bp.route("/student-vote", methods=["GET"])
def get_student_vote():
    email = request.args.get("email")
    date = request.args.get("date")
    if not all([email, date]):
        return jsonify({"error": "Missing params"}), 400

    result = {}
    for meal_type in ["breakfast", "lunch", "dinner"]:
        vote = Vote.query.filter_by(student_email=email, date=date, meal_type=meal_type).first()
        result[meal_type] = vote.chosen_option if vote else None
    return jsonify(result)


@vote_bp.route("/finalize", methods=["POST"])
def finalize_winners():
    date = request.json.get("date")
    if not date:
        return jsonify({"error": "date required"}), 400

    for meal_type in ["breakfast", "lunch", "dinner"]:
        counts = {1: 0, 2: 0, 3: 0}
        votes = Vote.query.filter_by(date=date, meal_type=meal_type).all()
        for v in votes:
            counts[v.chosen_option] = counts.get(v.chosen_option, 0) + 1

        if not any(counts.values()):
            continue

        winning_opt = max(counts, key=lambda k: counts[k])
        menu_item = Menu.query.filter_by(
            date=date, meal_type=meal_type, option_number=winning_opt
        ).first()
        winning_name = menu_item.name if menu_item else "Unknown"

        existing = Winner.query.filter_by(date=date, meal_type=meal_type).first()
        if existing:
            existing.winning_option = winning_opt
            existing.winning_name = winning_name
            existing.vote_count = counts[winning_opt]
        else:
            db.session.add(Winner(
                date=date,
                meal_type=meal_type,
                winning_option=winning_opt,
                winning_name=winning_name,
                vote_count=counts[winning_opt],
            ))
    db.session.commit()
    return jsonify({"message": "Winners finalized"})


@vote_bp.route("/winners", methods=["GET"])
def get_winners():
    date = request.args.get("date")
    if not date:
        return jsonify({"error": "date required"}), 400

    winners = Winner.query.filter_by(date=date).all()
    return jsonify([w.to_dict() for w in winners])


@vote_bp.route("/export", methods=["GET"])
def export_csv():
    date = request.args.get("date")
    if not date:
        return jsonify({"error": "date required"}), 400

    votes = Vote.query.filter_by(date=date).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["student_email", "reg_number", "date", "meal_type", "chosen_option", "menu_item"])

    for v in votes:
        menu_item = Menu.query.filter_by(
            date=v.date, meal_type=v.meal_type, option_number=v.chosen_option
        ).first()
        writer.writerow([
            v.student_email,
            v.reg_number,
            v.date,
            v.meal_type,
            v.chosen_option,
            menu_item.name if menu_item else "N/A",
        ])

    from flask import Response
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename=votes_{date}.csv"},
    )
