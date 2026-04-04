import sys
import os

# Add your project directory to the sys.path
project_home = '/home/hemanth0127/foodlytics/backend'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Import the application factory
from app import create_app

# This is the object PythonAnywhere looks for
application = create_app()
