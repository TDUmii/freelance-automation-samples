# Gmail draft-only mail merge - prototype

## Status
Locally syntax checked and pure matching logic tested with Node.js.
NOT yet tested inside Google Apps Script against actual client files, permissions, Gmail draft quotas, or attachment sizes. NOT delivered to a client.

## Requirements
Google Apps Script (runs in client's Google account), Google Sheet tab called "Recipients" with columns Ref, To, CC, Salutation.
Google Drive folder files named e.g. REF01_invoice.pdf and REF01_statement.pdf (exact naming must be agreed with client).

## Behavior
- Ingest spreadsheet rows.
- Require exactly one invoice and one statement attachment per reference.
- Validate recipient/CC in basic form; stronger email verification on request.
- Flag conflicts/missing attachments.
- Dry run defaults ON.
- When approved owner changes SETTINGS.dryRun=false, generates Gmail DRAFTS only.
- Client personally reviews, adjusts and sends in Gmail.

## Important limitations
No live Gmail access was requested or used. Filename convention is an assumption until the client provides examples. Gmail/Drive authorization stays inside the client's Google account. Logs may contain sensitive recipient data and should not be shared externally. The content template is only a placeholder. A full paid project needs authenticated end-to-end testing and a client-approved preview.
