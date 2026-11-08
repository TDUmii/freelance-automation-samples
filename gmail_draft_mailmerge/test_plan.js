const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const code = fs.readFileSync("Code.gs", "utf8");
const context = {console};
vm.createContext(context);
vm.runInContext(code, context);
const index = context.buildAttachmentIndex([
  {name: "REF01_invoice.pdf", id: "a"},
  {name: "REF01_statement.pdf", id: "b"},
  {name: "REF02_invoice.pdf", id: "c"},
  {name: "REF02_invoice.pdf", id: "d"}
]);
const plan = context.buildPlan([
  {ref: "ref01", to: "buyer@example.com", cc: "manager@example.com", salutation: "Hi"},
  {ref: "ref02", to: "buyer2@example.com", cc: "", salutation: "Hello"},
  {ref: "ref03", to: "bad-address", cc: "", salutation: ""}
], index);
assert.equal(plan.length, 3);
assert.equal(plan[0].status, "READY");
assert.equal(plan[0].attachmentIds.length, 2);
assert.equal(plan[1].status, "SKIPPED");
assert.equal(plan[2].status, "SKIPPED");
assert.equal(vm.runInContext('SETTINGS.dryRun', context), true);
assert(!/^\s*GmailApp\.sendEmail\s*\(/m.test(code), "Must not call sendEmail()");
console.log("PASS: draft plan, attachment pair checks, conflict/invalid recipient rejection, safe dry run.");
