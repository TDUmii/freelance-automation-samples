# Freelance Automation Samples

Practical, zero-cost automation prototypes designed for scoped freelance engagements. Both use **synthetic inputs** and do not contain customer data.

## 1. Python CSV / Excel Cleaner

[Source, instructions and tests](./excel_csv_cleaner/README.md)

Accepts CSV/XLSX, trims whitespace, detects case-insensitive exact duplicates, reports empty cells, and exports an audit workbook with Cleaned / Duplicates / Issues / Summary tabs.

```bash
python -m pip install -r requirements.txt
cd excel_csv_cleaner
python -m unittest test_cleaner.py -v
python cleaner.py sample/contacts.csv sample/output.xlsx
```

**Testing:** one deterministic unit test checks spreadsheet output and audit counts.

## 2. Gmail Draft-only Mail Merge

[Source, instructions and tests](./gmail_draft_mailmerge/README.md)

Google Apps Script prototype for matching rows from Sheets to two Drive attachments each, checking missing/duplicate files, generating an explicit plan, and **creating only Gmail drafts** after manual opt-in. `SETTINGS.dryRun` defaults to `true`; the program never sends email automatically.

```bash
cd gmail_draft_mailmerge
node test_plan.js
```

**Testing:** static syntax/logic smoke test in Node; not yet validated with a production Google account. Customer credentials and OAuth setup are never included.

## Scope and services

These are demos, not client deliverables. Potential paid adaptations include source-schema mapping, CSV/XLSX audits, repeatable reports, Google Sheets automation, Gmail draft workflows, and Python utilities. Work begins only after a written statement of scope, permissions, and acceptance criteria.

Made available as portfolio samples with clear constraints and reproducible tests. Contact through [GitHub](https://github.com/TDUmii) or [Freelancer profile](https://www.freelancer.com/u/TDUmiiDev).

License: MIT.
