import json
import random
import os
import time

TO_READ_FILE = "toRead.txt"
REQUEST_FILE = "get_random.txt"
OUTPUT_FILE = "random_comic.txt"

def pick_random_comic(publisher=None):
    try:
        with open(TO_READ_FILE, "r", encoding="utf-8") as file:
            lines = file.readlines()
            comics = [json.loads(line.strip()) for line in lines if line.strip()]

        if not comics:
            return {"error": "No comics in To-Read list"}

        if publisher:
            comics = [comic for comic in comics if comic.get("publisher", "").lower() == publisher.lower()]
            if not comics:
                return {"error": f"No comics found for publisher: {publisher}"}

        return random.choice(comics)

    except Exception as e:
        return {"error": str(e)}

def main():
    print("Running... Waiting for requests...")

    while True:
        if os.path.exists(REQUEST_FILE):
            with open(REQUEST_FILE, "r", encoding="utf-8") as f:
                request_type = f.read().strip().lower()

            publisher = None
            if request_type.startswith("get random by "):
                publisher = request_type.replace("get random by ", "").strip()

            result = pick_random_comic(publisher)

            with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                f.write(json.dumps(result, indent=4))

            os.remove(REQUEST_FILE)

        time.sleep(2)

if __name__ == "__main__":
    main()