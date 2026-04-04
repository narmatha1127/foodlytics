from flask import Blueprint, request, jsonify
from models import db, Menu

menu_bp = Blueprint("menu", __name__)

@menu_bp.route("/menu", methods=["GET"])
def get_menu():
    date = request.args.get("date")
    if not date:
        return jsonify({"error": "date required"}), 400

    items = Menu.query.filter_by(date=date).all()
    result = {"breakfast": {}, "lunch": {}, "dinner": {}}
    for item in items:
        result[item.meal_type][str(item.option_number)] = item.name
    return jsonify(result)


@menu_bp.route("/menu", methods=["POST"])
def save_menu():
    data = request.json  # {date, breakfast: {1:.., 2:.., 3:..}, lunch:{...}, dinner:{...}}
    date = data.get("date")
    if not date:
        return jsonify({"error": "date required"}), 400

    for meal_type in ["breakfast", "lunch", "dinner"]:
        options = data.get(meal_type, {})
        for opt_num, name in options.items():
            existing = Menu.query.filter_by(
                date=date, meal_type=meal_type, option_number=int(opt_num)
            ).first()
            if existing:
                existing.name = name
            else:
                db.session.add(Menu(
                    date=date,
                    meal_type=meal_type,
                    option_number=int(opt_num),
                    name=name,
                ))
    db.session.commit()
    return jsonify({"message": "Menu saved successfully"})
