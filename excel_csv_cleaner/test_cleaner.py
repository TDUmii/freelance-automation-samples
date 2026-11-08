import tempfile
import unittest
from pathlib import Path
from openpyxl import load_workbook
from cleaner import clean


class CleanerTests(unittest.TestCase):
    def test_deduplicate_and_audit(self):
        here = Path(__file__).parent
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "result.xlsx"
            report = clean(here / "sample" / "contacts.csv", target)
            self.assertEqual(report["rows"], 4)
            self.assertEqual(report["unique"], 3)
            self.assertEqual(report["duplicates"], 1)
            self.assertEqual(report["missing_cells"], 1)
            book = load_workbook(target)
            self.assertEqual(book.sheetnames, ["Cleaned", "Duplicates", "Issues", "Summary"])
            self.assertEqual(book["Cleaned"]["A2"].value, "Alice")
            self.assertEqual(book["Duplicates"]["A2"].value, 4)
            self.assertEqual(book["Issues"]["B2"].value, "Score")


if __name__ == "__main__":
    unittest.main()
