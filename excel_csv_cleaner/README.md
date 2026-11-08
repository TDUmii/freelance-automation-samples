# CSV & Excel Cleaner - Demo Portfolio

A small, reproducible, **locally tested** Python tool for CSV / Excel cleanup. Built with Python 3.11 and openpyxl; no external service calls.

## What it does
- Accepts a CSV or XLSX file.
- Trims leading and trailing whitespace.
- Detects duplicate rows (case insensitive) and removes them from the cleaned output.
- Records missing cells with original source row and column.
- Generates an XLSX workbook containing Cleaned, Duplicates, Issues and Summary tabs.
- Adds readable column widths and header formatting.

## Try it
```powershell
python cleaner.py sample/contacts.csv sample/contacts_cleaned.xlsx
python -m unittest test_cleaner.py -v
```

## Boundaries
This is a synthetic-data portfolio sample, not client work. It does not perform fuzzy deduplication, preserve original formulas, or infer business rules. Those require an agreed scope and a separate quote. No personal data was used.

## Custom services
Possible adaptations: CSV/XLSX conversion, report templates, data quality checks, Python scripts, and Google Sheets integrations. Delivery estimate depends on actual data.
