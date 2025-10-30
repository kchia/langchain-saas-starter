import hashlib
from datetime import datetime, timedelta
import sys
from pathlib import Path

# Add src to Python path
backend_dir = Path(__file__).parent.parent.parent
src_dir = backend_dir / "src"
sys.path.insert(0, str(src_dir))

from core.models import User
from scripts.base_seeder import BaseSeeder


class UserSeeder(BaseSeeder):
    """Seeder for creating development users."""

    def seed(self) -> None:
        """Create development users."""

        # Helper function to hash passwords (simplified for development)
        def hash_password(password: str) -> str:
            return hashlib.sha256(password.encode()).hexdigest()

        users_data = [
            {
                "email": "admin@example.com",
                "username": "admin",
                "full_name": "System Administrator",
                "hashed_password": hash_password("admin123"),
                "is_active": True,
                "is_admin": True,
                "bio": "System administrator account for testing",
                "preferences": {
                    "theme": "dark",
                    "language": "en",
                    "notifications": True
                },
                "login_count": 5,
                "last_login_at": datetime.utcnow() - timedelta(hours=2)
            },
            {
                "email": "user@example.com",
                "username": "testuser",
                "full_name": "Test User",
                "hashed_password": hash_password("user123"),
                "is_active": True,
                "is_admin": False,
                "bio": "Regular user account for testing AI features",
                "preferences": {
                    "theme": "light",
                    "language": "en",
                    "notifications": False
                },
                "login_count": 12,
                "last_login_at": datetime.utcnow() - timedelta(minutes=30)
            },
            {
                "email": "researcher@example.com",
                "username": "researcher",
                "full_name": "AI Researcher",
                "hashed_password": hash_password("research123"),
                "is_active": True,
                "is_admin": False,
                "bio": "AI researcher testing advanced features",
                "preferences": {
                    "theme": "dark",
                    "language": "en",
                    "notifications": True,
                    "advanced_mode": True
                },
                "login_count": 23,
                "last_login_at": datetime.utcnow() - timedelta(hours=1)
            },
            {
                "email": "demo@example.com",
                "username": "demo",
                "full_name": "Demo Account",
                "hashed_password": hash_password("demo123"),
                "is_active": True,
                "is_admin": False,
                "bio": "Demo account for public demonstrations",
                "preferences": {
                    "theme": "light",
                    "language": "en"
                },
                "login_count": 1,
                "last_login_at": datetime.utcnow() - timedelta(days=1)
            }
        ]

        for user_data in users_data:
            user, created = self.get_or_create(
                User,
                email=user_data["email"],
                defaults=user_data
            )

            if created:
                self.logger.info(f"Created user: {user.username} ({user.email})")
            else:
                self.logger.info(f"User already exists: {user.username} ({user.email})")


if __name__ == "__main__":
    # Run this seeder directly
    seeder = UserSeeder()
    seeder.run()