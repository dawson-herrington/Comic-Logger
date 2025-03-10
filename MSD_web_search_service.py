import os
import time
import json
import webbrowser
import urllib.parse

SEARCH_REQUEST_FILE = "google_search_request.json"


def perform_google_search(data):
    search_type = data.get("type")
    comic = data.get("comic", {})

    if search_type == "author":
        query = f"Comic book author {comic.get('author', '').strip()}"
        if not query.strip():
            print("No author found to search for.")
            return
    else:
        query = f"{comic.get('comicName', '')} Issue {comic.get('issueNumber', '')} Volume {comic.get('volumeNumber', '')}"
        query = query.strip()

    encoded_query = urllib.parse.quote(query)
    google_url = f"https://www.google.com/search?q={encoded_query}"

    webbrowser.open(google_url)
    print(f"Opened Google search: {google_url}")


def main():
    print("Running... Waiting for Google search requests...")

    while True:
        if os.path.exists(SEARCH_REQUEST_FILE):
            try:
                with open(SEARCH_REQUEST_FILE, "r", encoding="utf-8") as f:
                    search_request = json.load(f)

                perform_google_search(search_request)
                os.remove(SEARCH_REQUEST_FILE)
            except Exception as e:
                print(f"Error processing search request: {e}")

        time.sleep(2)


if __name__ == "__main__":
    main()
