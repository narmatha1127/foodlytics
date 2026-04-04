from flask import Flask
from flask_cors import CORS
from models import db
from routes.menu import menu_bp
from routes.vote import vote_bp
from routes.auth import auth_bp
from routes.feedback import feedback_bp
import os

def create_app():
    app = Flask(__name__)
    
    # Use absolute path for SQLite on PythonAnywhere, relative for local dev
    if os.environ.get("PYTHONANYWHERE_DOMAIN"):
        # Replace 'hemanth0127' with your actual username if it changes
        db_path = "/home/hemanth0127/foodlytics/backend/foodlytics.db"
    else:
        db_path = "sqlite:///foodlytics.db"

    app.config["SQLALCHEMY_DATABASE_URI"] = db_path if db_path.startswith("sqlite") else f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)

    app.register_blueprint(menu_bp, url_prefix="/api")
    app.register_blueprint(vote_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(feedback_bp, url_prefix="/api")

    with app.app_context():
        db.create_all()

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
