import sys
import os

# Add the current directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__)))

from app.workers.worker import process_job

if __name__ == "__main__":
    if len(sys.argv) > 1:
        file_id = sys.argv[1]
        print(f"Processing job for file_id: {file_id}")
        process_job(file_id)
    else:
        print("Please provide a file_id as argument")