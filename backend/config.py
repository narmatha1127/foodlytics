import os

# List of admin emails (add your admin email here)
ADMIN_EMAILS = [
    "narmatha02711@gmail.com",
    "hk1100411004@gmail.com"
    # Add more admin emails here
]

# Firebase project config for server-side token verification
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "your-project-id")
