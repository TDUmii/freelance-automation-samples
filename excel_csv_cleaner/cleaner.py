"""CSV/Excel cleaning portfolio sample. No external API or data collection."""
import argparse
import csv
from pathlib import Path

from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill, Alignment


def read_table(path):
    if path.suffix.lower() == ".csv":
        with path.open("r", encoding="utf-8-sig", newline="") as stream:
            return list(csv.reader(stream))
    if path.suffix.lower() == ".xlsx":
        book = load_workbook(path, read_only=True, data_only=True)
        try:
            sheet = book.active
            return list(sheet.values)
        finally:
            book.close()
    raise ValueError("Input must be .csv or .xlsx")


def value_text(value):
    return "" if value is None else str(value).strip()


def make_unique_headers(values):
    seen = {}
    output = []
    for i, value in enumerate(values, 1):
        base = value_text(value) or f"Column_{i}"
        key = base.casefold()
        count = seen.get(key, 0) + 1
        seen[key] = count
        output.append(base if count == 1 else f"{base}_{count}")
    return output


def add_sheet(book, name, rows):
    sheet = book.create_sheet(name)
    for row in rows:
        sheet.append(row)
    sheet.freeze_panes = "A2"
    if sheet.max_row > 0:
        for cell in sheet[1]:
            cell.font = Font(bold=True, color="FFFFFF")
            cell.fill = PatternFill("solid", fgColor="174A67")
            cell.alignment = Alignment(wrap_text=True)
    for column in sheet.columns:
        letter = column[0].column_letter
        width = min(52, max(14, max(len(str(c.value or "")) for c in column) + 2))
        sheet.column_dimensions[letter].width = width
    return sheet


def clean(source, target):
    rows = read_table(source)
    if not rows:
        raise ValueError("Source file is empty")
    headers = make_unique_headers(rows[0])
    clean_rows = [headers]
    duplicates = [["Source row", *headers]]
    issues = [["Source row", "Column", "Issue"]]
    seen = set()
    removed_blank = 0

    for row_number, record in enumerate(rows[1:], 2):
        cells = [value_text(record[i]) if i < len(record) else "" for i in range(len(headers))]
        if not any(cells):
            removed_blank += 1
            continue
        for col, cell in zip(headers, cells):
            if cell == "":
                issues.append([row_number, col, "Missing value"])
        identity = tuple(v.casefold() for v in cells)
        if identity in seen:
            duplicates.append([row_number, *cells])
        else:
            seen.add(identity)
            clean_rows.append(cells)

    book = Workbook()
    book.remove(book.active)
    add_sheet(book, "Cleaned", clean_rows)
    add_sheet(book, "Duplicates", duplicates)
    add_sheet(book, "Issues", issues)
    summary = [
        ["Metric", "Value"],
        ["Source file", source.name],
        ["Data rows read", max(0, len(rows) - 1)],
        ["Unique nonempty rows", len(clean_rows) - 1],
        ["Duplicates removed", len(duplicates) - 1],
        ["Blank rows removed", removed_blank],
        ["Missing cells flagged", len(issues) - 1],
    ]
    add_sheet(book, "Summary", summary)
    target.parent.mkdir(parents=True, exist_ok=True)
    book.save(target)
    return {
        "rows": len(rows) - 1,
        "unique": len(clean_rows) - 1,
        "duplicates": len(duplicates) - 1,
        "missing_cells": len(issues) - 1,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clean CSV/XLSX into an audited Excel workbook")
    parser.add_argument("source", type=Path)
    parser.add_argument("target", type=Path)
    args = parser.parse_args()
    if args.source.resolve() == args.target.resolve():
        parser.error("Input and output must be different paths")
    result = clean(args.source, args.target)
    print("Saved:", args.target)
    for key, value in result.items():
        print(f"{key}: {value}")
