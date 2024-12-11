import os
import shutil
import json
from pathlib import Path


def setup_django():
    """Set up Django environment dynamically."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings")  # Replace with your project settings
    try:
        import django
        django.setup()
        print("Django environment set up successfully.")
    except ImportError as e:
        print(f"ImportError setting up Django: {e}")
        print("Ensure Django is properly installed in your virtual environment.")
        exit(1)
    except Exception as e:
        print(f"General error setting up Django: {e}")
        exit(1)


def clean_folders(base_dir):
    """Delete all __pycache__, migrations folders, and SQLite DB."""
    for root, dirs, files in os.walk(base_dir):
        # Skip virtual environment folders
        if "venv" in root or "env" in root:
            continue

        for dir_name in dirs:
            # Remove migrations folders
            if dir_name == "migrations":
                full_path = os.path.join(root, dir_name)
                print(f"Deleting folder: {full_path}")
                shutil.rmtree(full_path)

        for file_name in files:
            # Remove __pycache__ files and db.sqlite3
            if file_name.endswith(".pyc") or file_name == "db.sqlite3":
                full_path = os.path.join(root, file_name)
                print(f"Deleting file: {full_path}")
                os.remove(full_path)


def run_management_command(command):
    """Run Django management commands using os.system."""
    try:
        print(f"Running command: {command}")
        result = os.system(f"python manage.py {command}")
        if result != 0:
            print(f"Error running command: {command}")
            exit(1)
    except Exception as e:
        print(f"Error executing management command '{command}': {e}")
        exit(1)


def create_demo_data():
    """Create demo data dynamically."""
    try:
        from django.contrib.auth.models import User
        from api.models import CrimeData, News, Profile
        from reco.models import FaceRegistration

        # Create an admin user
        admin_user, created = User.objects.get_or_create(
            username="modeh",
            email="mahmoudqudah2123@gmail.com",
            first_name="Mahmoud",
            last_name="Alqudah"
        )
        if created:
            admin_user.set_password("admin")
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.save()
            print("Admin user created.")

        # Ensure Profile exists for admin user
        profile, created = Profile.objects.get_or_create(user=admin_user)

        # Create News entries
        news1 = News.objects.create(title="Breaking News", body="This is a breaking news story.")
        news2 = News.objects.create(title="Daily Update", body="This is your daily update.")

        # Add News to Profile
        profile.saved_news.add(news1, news2)
        profile.save()
        print("Demo profile created.")

        # Load crime data from JSON file (line-by-line JSON objects)
        json_file = Path("api/management/data/merged_data.json")
        if not json_file.exists():
            print(f"JSON file not found at {json_file}")
            return

        with open(json_file, "r") as file:
            for line in file:
                try:
                    entry = json.loads(line.strip())  # Parse each line as a JSON object
                    community_area = entry.get("Community Area")
                    total_crimes = entry.get("Total number of Crimes", 0)
                    total_crime_rate = entry.get("Total Crime Rate", 0.0)
                    crimes_info = entry.get("Crime Insights for Community Area", [])
                    latitude = entry.get("Latitude", 0.0)
                    longitude = entry.get("Longitude", 0.0)

                    if not community_area:
                        print("Skipping entry due to missing Community Area.")
                        continue

                    # Calculate aggregate crime_count and crime_rate
                    crime_count = sum(crime.get("Crime Count", 0) for crime in crimes_info)
                    crime_rate = round(sum(crime.get("Crime Rate", 0.0) for crime in crimes_info), 6)

                    # Create CrimeData object
                    CrimeData.objects.create(
                        community_area=community_area,
                        Total_number_of_Crimes=total_crimes,
                        Total_crime_rate=total_crime_rate,
                        crime_count=crime_count,
                        crime_rate=crime_rate,
                        crimes_info=crimes_info,
                        latitude=latitude,
                        longitude=longitude,
                    )
                    print(f"Crime data for {community_area} added with crime_count={crime_count} and crime_rate={crime_rate}.")
                except json.JSONDecodeError as e:
                    print(f"Error parsing line as JSON: {e}")
                except Exception as e:
                    print(f"Error adding crime data for {line.strip()}: {e}")

        # Create Face Registration demo data
        FaceRegistration.objects.create(
            face_embedding={"key": "value"}
        )
        print("Face registration created.")

    except Exception as e:
        print(f"Error creating demo data: {e}")
        exit(1)


def main():
    """Main function to execute cleanup, migrations, and demo data creation."""
    current_dir = Path.cwd()
    print(f"Starting clean-up in directory: {current_dir}")
    clean_folders(current_dir)
    setup_django()  # Set up Django after cleaning up

    # Explicitly make migrations for each app
    run_management_command("makemigrations api")
    run_management_command("makemigrations reco")
    run_management_command("makemigrations")

    # Apply migrations
    run_management_command("migrate")

    # Create demo data
    create_demo_data()
    print("Clean-up, migrations, and data creation complete.")


if __name__ == "__main__":
    main()
