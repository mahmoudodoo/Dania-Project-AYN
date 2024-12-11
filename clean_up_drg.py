import os
import shutil

def delete_directory(directory):
    if os.path.exists(directory):
        print(f"Removing directory: {directory}")
        shutil.rmtree(directory)

def delete_file(file_path):
    if os.path.exists(file_path):
        print(f"Removing file: {file_path}")
        os.remove(file_path)

def clean_project():
    # Define criteria for deletion
    folders_to_delete = ["__pycache__", "venv", "node_modules", "migrations"]
    files_to_delete = ["db.sqlite3"]

    # Walk through the current folder recursively
    for root, dirs, files in os.walk(os.getcwd(), topdown=False):
        # Check and delete unwanted folders
        for dir_name in dirs:
            if dir_name in folders_to_delete:
                delete_directory(os.path.join(root, dir_name))

        # Check and delete unwanted files
        for file_name in files:
            if file_name in files_to_delete or file_name.endswith(".pyc"):
                delete_file(os.path.join(root, file_name))

    print("Cleanup complete.")

if __name__ == "__main__":
    clean_project()
