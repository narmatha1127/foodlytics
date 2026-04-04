from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Menu(db.Model):
    __tablename__ = "menu"
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(10), nullable=False)          # YYYY-MM-DD
    meal_type = db.Column(db.String(10), nullable=False)     # breakfast/lunch/dinner
    option_number = db.Column(db.Integer, nullable=False)    # 1, 2, 3
    name = db.Column(db.String(200), nullable=False)

    __table_args__ = (
        db.UniqueConstraint("date", "meal_type", "option_number", name="unique_menu_slot"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "date": self.date,
            "meal_type": self.meal_type,
            "option_number": self.option_number,
            "name": self.name,
        }


class Vote(db.Model):
    __tablename__ = "vote"
    id = db.Column(db.Integer, primary_key=True)
    student_email = db.Column(db.String(200), nullable=False)
    reg_number = db.Column(db.String(50), nullable=True)      # New field
    date = db.Column(db.String(10), nullable=False)
    meal_type = db.Column(db.String(10), nullable=False)
    chosen_option = db.Column(db.Integer, nullable=False)     # 1, 2, or 3

    __table_args__ = (
        db.UniqueConstraint("student_email", "date", "meal_type", name="unique_vote"),
    )

    def to_dict(self):
        return {
            "student_email": self.student_email,
            "reg_number": self.reg_number,
            "date": self.date,
            "meal_type": self.meal_type,
            "chosen_option": self.chosen_option,
        }


class Winner(db.Model):
    __tablename__ = "winner"
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(10), nullable=False)
    meal_type = db.Column(db.String(10), nullable=False)
    winning_option = db.Column(db.Integer, nullable=False)
    winning_name = db.Column(db.String(200), nullable=False)
    vote_count = db.Column(db.Integer, nullable=False, default=0)

    __table_args__ = (
        db.UniqueConstraint("date", "meal_type", name="unique_winner"),
    )

    def to_dict(self):
        return {
            "date": self.date,
            "meal_type": self.meal_type,
            "winning_option": self.winning_option,
            "winning_name": self.winning_name,
            "vote_count": self.vote_count,
        }

class Feedback(db.Model):
    __tablename__ = "feedback"
    id = db.Column(db.Integer, primary_key=True)
    student_email = db.Column(db.String(200), nullable=False)
    student_name = db.Column(db.String(200), nullable=False)
    reg_number = db.Column(db.String(50), nullable=False)
    feedback_type = db.Column(db.String(20), nullable=False)  # 'feedback' or 'complaint'
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "student_email": self.student_email,
            "student_name": self.student_name,
            "reg_number": self.reg_number,
            "feedback_type": self.feedback_type,
            "message": self.message,
            "timestamp": self.timestamp.isoformat() + "Z"
        }
