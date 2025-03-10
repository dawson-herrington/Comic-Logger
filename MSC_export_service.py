import json
import os
import time
import csv
from fpdf import FPDF

TO_READ_FILE = "toRead.txt"
COMPLETED_FILE = "completed.txt"
REQUEST_FILE = "export_request.txt"
DOWNLOADS_FOLDER = os.path.join(os.path.expanduser("~"), "Downloads")

def read_comic_list(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            return [json.loads(line.strip()) for line in file.readlines() if line.strip()]
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return []

def export_to_csv(comics, filename):
    if not comics:
        print("No comics to export.")
        return

    keys = comics[0].keys()
    filepath = os.path.join(DOWNLOADS_FOLDER, filename)

    with open(filepath, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=keys)
        writer.writeheader()
        writer.writerows(comics)

    print(f"CSV exported: {filepath}")

def export_to_pdf(comics, filename):
    if not comics:
        print("No comics to export.")
        return

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    pdf.cell(200, 10, txt="Comic List", ln=True, align="C")
    pdf.ln(10)

    for comic in comics:
        pdf.cell(200, 10, txt=f"{comic['comicName']} #{comic['issueNumber']} ({comic['volumeNumber']})", ln=True)
        pdf.cell(200, 10, txt=f"Author: {comic.get('author', 'N/A')} | Publisher: {comic.get('publisher', 'N/A')}", ln=True)
        pdf.ln(5)

    filepath = os.path.join(DOWNLOADS_FOLDER, filename)
    pdf.output(filepath)
    print(f"PDF exported: {filepath}")

def main():
    print("Running... Waiting for export requests...")

    while True:
        if os.path.exists(REQUEST_FILE):
            with open(REQUEST_FILE, "r", encoding="utf-8") as f:
                request_data = f.read().strip().split()

            if len(request_data) != 2:
                print("Invalid request format.")
                continue

            list_type, export_format = request_data
            list_file = TO_READ_FILE if list_type == "toRead" else COMPLETED_FILE
            comics = read_comic_list(list_file)

            if export_format == "csv":
                export_to_csv(comics, f"{list_type}_list.csv")
            elif export_format == "pdf":
                export_to_pdf(comics, f"{list_type}_list.pdf")

            os.remove(REQUEST_FILE)

        time.sleep(2)

if __name__ == "__main__":
    main()
