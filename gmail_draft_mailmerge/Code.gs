/**
 * Gmail draft-only mail merge proof of concept.
 * Safety: DRY_RUN is true by default; never calls GmailApp.sendEmail().
 * Synthetic sample convention: REF123_invoice.pdf and REF123_statement.pdf
 * Needs owner-authorized Google Sheets/Drive access before first real run.
 */
const SETTINGS = {
  spreadsheetId: "REPLACE_WITH_APPROVED_SPREADSHEET_ID",
  folderId: "REPLACE_WITH_APPROVED_DRIVE_FOLDER_ID",
  tabName: "Recipients",
  subject: "Your documents",
  dryRun: true
};

function normalizeReference(value) {
  return String(value == null ? "" : value).trim().toUpperCase();
}

function buildAttachmentIndex(entries) {
  const index = {};
  for (const file of entries) {
    const match = String(file.name || "").match(/^(.+?)_(invoice|statement)\.(pdf|docx|xlsx)$/i);
    if (!match) continue;
    const ref = normalizeReference(match[1]);
    const type = match[2].toLowerCase();
    if (!index[ref]) index[ref] = {};
    if (index[ref][type]) {
      index[ref].conflict = true;
    } else {
      index[ref][type] = file.id;
    }
  }
  return index;
}

function buildPlan(rows, index) {
  const plan = [];
  for (const [offset, row] of rows.entries()) {
    const ref = normalizeReference(row.ref);
    const files = index[ref];
    const to = String(row.to || "").trim();
    const cc = String(row.cc || "").trim();
    const salutation = String(row.salutation || "").trim();
    let error = "";
    if (!ref || !to || !to.includes("@")) error = "Missing reference or invalid recipient";
    else if (!files || !files.invoice || !files.statement) error = "Two required files not found";
    else if (files.conflict) error = "Duplicate attachment file names";
    else if (cc && !cc.split(/[;,]/).every(x => x.trim().includes("@"))) error = "Invalid CC";
    plan.push({
      line: offset + 2, ref, to, cc, salutation,
      attachmentIds: error ? [] : [files.invoice, files.statement],
      status: error ? "SKIPPED" : "READY",
      reason: error
    });
  }
  return plan;
}

/** Authorized owner runs this inside Apps Script after replacing placeholders. */
function prepareDrafts() {
  if (SETTINGS.spreadsheetId.includes("REPLACE") || SETTINGS.folderId.includes("REPLACE")) {
    throw new Error("Replace IDs with approved client spreadsheet/folder IDs first.");
  }
  const book = SpreadsheetApp.openById(SETTINGS.spreadsheetId);
  const sheet = book.getSheetByName(SETTINGS.tabName);
  if (!sheet) throw new Error("Recipients tab is missing");
  const data = sheet.getDataRange().getDisplayValues();
  const columns = data[0].map(v => String(v).trim().toLowerCase());
  const position = key => {
    const i = columns.indexOf(key);
    if (i < 0) throw new Error("Required column missing: " + key);
    return i;
  };
  const col = {ref: position("ref"), to: position("to"), cc: position("cc"), salutation: position("salutation")};
  const rows = data.slice(1).map(v => Object.fromEntries(Object.entries(col).map(([key, i]) => [key, v[i]])));

  const folder = DriveApp.getFolderById(SETTINGS.folderId);
  const items = [];
  const iterator = folder.getFiles();
  while (iterator.hasNext()) {
    const file = iterator.next();
    items.push({name: file.getName(), id: file.getId()});
  }
  const plan = buildPlan(rows, buildAttachmentIndex(items));
  // Note: this log shows address and file reference; owner must treat it as private.
  plan.forEach(p => {
    if (p.status !== "READY") {
      console.log("SKIP row " + p.line + ": " + p.reason);
      return;
    }
    if (SETTINGS.dryRun) {
      console.log("DRY RUN row " + p.line + " is ready with 2 files.");
      return;
    }
    const greeting = p.salutation ? p.salutation + "," : "Hello,";
    const body = greeting + "\n\nPlease find your two attached documents.\n\nKind regards";
    const attachments = p.attachmentIds.map(id => DriveApp.getFileById(id).getBlob());
    GmailApp.createDraft(p.to, SETTINGS.subject, body, {
      cc: p.cc.replace(/;/g, ","),
      attachments
    });
    console.log("DRAFT CREATED row " + p.line);
  });
  return plan.map(p => ({line: p.line, reference: p.ref, status: p.status, error: p.reason}));
}
