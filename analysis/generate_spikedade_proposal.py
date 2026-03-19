#!/usr/bin/env python3
"""Generate Spiked Ade Warehousing Proposal PDF for L&M"""

from fpdf import FPDF
import os
from datetime import datetime

class SpikedAdePDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=20)
    
    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 7)
        self.set_text_color(150, 150, 150)
        self.cell(0, 4, "L&M Distribution & Logistics | Confidential", align="C", new_x="LMARGIN", new_y="NEXT")
        self.cell(0, 4, "sales@lmwarehousing.com", align="C")
        self.set_text_color(0, 0, 0)
    
    def header_bar(self, text, color=(30, 62, 99)):
        self.set_fill_color(*color)
        self.set_text_color(255, 255, 255)
        self.set_font("Helvetica", "B", 10)
        self.cell(0, 7, f"  {text}", fill=True, new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(0, 0, 0)
        self.ln(1)
    
    def add_table_header(self, cols, widths):
        self.set_fill_color(30, 62, 99)
        self.set_text_color(255, 255, 255)
        self.set_font("Helvetica", "B", 8)
        for i, col in enumerate(cols):
            align = "L" if i == 0 else "R" if i == len(cols) - 1 else "C"
            self.cell(widths[i], 6, f"  {col}", fill=True, align=align)
        self.ln()
        self.set_text_color(0, 0, 0)
    
    def add_table_row(self, values, widths, bold_col=1):
        for i, val in enumerate(values):
            if i == bold_col:
                self.set_font("Helvetica", "B", 8.5)
            elif i == 0:
                self.set_font("Helvetica", "", 8.5)
            else:
                self.set_font("Helvetica", "", 7.5)
                self.set_text_color(100, 100, 100)
            align = "R" if i == bold_col else "L"
            is_last = (i == len(values) - 1)
            self.cell(widths[i], 5.5, f"  {val}" if align == "L" else val, border="B", align=align,
                     new_x="LMARGIN" if is_last else "RIGHT",
                     new_y="NEXT" if is_last else "TOP")
            self.set_text_color(0, 0, 0)

pdf = SpikedAdePDF()
pdf.set_margins(10, 10, 10)

today = datetime.now().strftime("%B %d, %Y")

# ============================================================
# PAGE 1
# ============================================================
pdf.add_page()

# Logo
logo_path = os.path.join(os.path.dirname(__file__), "..", "client", "public", "images", "lm-logo.png")
if os.path.exists(logo_path):
    pdf.image(logo_path, x=10, y=10, w=45)

# Title block
pdf.set_xy(60, 12)
pdf.set_font("Helvetica", "B", 16)
pdf.set_text_color(30, 62, 99)
pdf.cell(0, 7, "WAREHOUSING SERVICES PROPOSAL")
pdf.set_xy(60, 20)
pdf.set_font("Helvetica", "", 10)
pdf.set_text_color(80, 80, 80)
pdf.cell(0, 6, "Prepared for Spiked Ade")
pdf.set_xy(60, 27)
pdf.set_font("Helvetica", "", 8.5)
pdf.cell(0, 5, f"{today}  |  Quote Valid for 30 Days")
pdf.set_text_color(0, 0, 0)

pdf.ln(25)

# Divider
pdf.set_draw_color(30, 62, 99)
pdf.set_line_width(0.5)
pdf.line(10, pdf.get_y(), 200, pdf.get_y())
pdf.ln(3)

# Two-column info boxes
y_start = pdf.get_y()
col_w = 88
w = pdf.w - 20

# Left: Prepared For
pdf.set_xy(10, y_start)
pdf.set_fill_color(245, 247, 250)
pdf.set_font("Helvetica", "B", 8.5)
pdf.cell(col_w, 5.5, "  PREPARED FOR", fill=True, new_x="LMARGIN", new_y="NEXT")
pdf.set_x(10)
pdf.set_font("Helvetica", "", 8.5)
info_lines = [
    "Spiked Ade (SPKED Inc)",
    "Brad Moose",
    "Fairfield, New Jersey 07004",
    "bmoose@spikedade.com",
    "",
    "Product: 12oz Sleek Can RTD (4.5% ABV)",
]
for line in info_lines:
    pdf.cell(col_w, 4.5, f"  {line}", new_x="LMARGIN", new_y="NEXT")
    pdf.set_x(10)

# Right: Prepared By
pdf.set_xy(110, y_start)
pdf.set_fill_color(245, 247, 250)
pdf.set_font("Helvetica", "B", 8.5)
pdf.cell(col_w, 5.5, "  PREPARED BY", fill=True, new_x="LMARGIN", new_y="NEXT")
pdf.set_x(110)
pdf.set_font("Helvetica", "", 8.5)
by_lines = [
    "L&M Distribution & Logistics",
    "sales@lmwarehousing.com",
    "",
    "Primary Facility:",
    "PA-1151 Bristol, PA",
    "226,000 sq ft | Climate-controlled",
]
for line in by_lines:
    pdf.cell(col_w, 4.5, f"  {line}", new_x="LMARGIN", new_y="NEXT")
    pdf.set_x(110)

pdf.set_y(max(pdf.get_y(), y_start + 36))
pdf.ln(3)

# ============================================================
# ACCOUNT OVERVIEW
# ============================================================
pdf.header_bar("ACCOUNT OVERVIEW")

pdf.set_font("Helvetica", "", 8.5)
pdf.multi_cell(0, 4.5, "Full-service warehousing and distribution for Spiked Ade's Pennsylvania market operations. L&M will provide climate-controlled storage, order fulfillment, and PLCB-compliant distribution from our Bristol, PA facility. Currently producing in Southern VT and Buffalo, NY with pallet stackability of 2-3 high.")
pdf.ln(2)

# Volume summary box
pdf.set_fill_color(245, 247, 250)
pdf.set_font("Helvetica", "B", 8.5)
box_w = w / 4

pdf.set_x(10)
pdf.cell(box_w, 5, "  Min. Pallet Commitment", fill=True)
pdf.cell(box_w, 5, "  Storage Rate", fill=True)
pdf.cell(box_w, 5, "  Handling Rate", fill=True)
pdf.cell(box_w, 5, "  Pallet Stacking", fill=True, new_x="LMARGIN", new_y="NEXT")

pdf.set_font("Helvetica", "B", 11)
pdf.set_text_color(30, 62, 99)
pdf.set_x(10)
pdf.cell(box_w, 7, "  500 pallets")
pdf.cell(box_w, 7, "  $16.00/mo")
pdf.cell(box_w, 7, "  $10.00 in/out")
pdf.cell(box_w, 7, "  2-3 high", new_x="LMARGIN", new_y="NEXT")

pdf.set_font("Helvetica", "", 7.5)
pdf.set_text_color(100, 100, 100)
pdf.set_x(10)
pdf.cell(box_w, 4, "  Minimum commitment")
pdf.cell(box_w, 4, "  Per pallet/month")
pdf.cell(box_w, 4, "  Per pallet")
pdf.cell(box_w, 4, "  Prefer 2 high", new_x="LMARGIN", new_y="NEXT")
pdf.set_text_color(0, 0, 0)

pdf.ln(4)

# ============================================================
# SECTION 1 - STORAGE RATES
# ============================================================
pdf.header_bar("1. STORAGE RATES (PA-1151 Bristol)")

cols3 = ["Service", "Rate", "Notes"]
widths3 = [w * 0.45, w * 0.25, w * 0.30]
pdf.add_table_header(cols3, widths3)

storage_items = [
    ("Pallet Storage", "$16.00", "Per pallet / month"),
    ("Monthly Storage Minimum", "$8,000.00", "500 pallet positions"),
    ("Order Processing Time", "48 hours", "From order receipt"),
]
for item in storage_items:
    pdf.add_table_row(item, widths3)

pdf.ln(1)
pdf.set_font("Helvetica", "I", 7.5)
pdf.set_text_color(100, 100, 100)
pdf.multi_cell(0, 3.5, "Storage billed monthly as a minimum commitment based on reserved pallet positions. Climate-controlled environment maintained at facility standards.")
pdf.set_text_color(0, 0, 0)

pdf.ln(3)

# ============================================================
# SECTION 2 - HANDLING RATES
# ============================================================
pdf.header_bar("2. HANDLING & LABOR RATES")

pdf.add_table_header(cols3, widths3)

handling_items = [
    ("Handling In (Receiving)", "$10.00", "Per pallet"),
    ("Handling Out (Shipping)", "$10.00", "Per pallet"),
]
for item in handling_items:
    pdf.add_table_row(item, widths3)

pdf.ln(1)
pdf.set_font("Helvetica", "B", 8.5)
pdf.cell(50, 5.5, "  Out-of-Scope Labor:")
pdf.set_font("Helvetica", "", 8.5)
pdf.cell(0, 5.5, "Standard: $50.00/hour  |  Weekend: $75.00/hour", new_x="LMARGIN", new_y="NEXT")

pdf.ln(3)

# ============================================================
# SECTION 3 - VALUE-ADDED SERVICES
# ============================================================
pdf.header_bar("3. VALUE-ADDED SERVICES")

cols2 = ["Service", "Rate"]
widths2 = [w * 0.65, w * 0.35]
pdf.add_table_header(cols2, widths2)

vas_items = [
    ("Case Pick", "$0.40/case"),
    ("Layer Pick", "$0.30/case"),
    ("Pallet Supply", "$9.00/pallet"),
    ("Shrink Wrap", "$4.00/pallet"),
    ("Labeling", "$0.50/label"),
    ("Order Processing", "$10.00/order"),
    ("Cancellation/Restock", "$25.00/order"),
]
for item in vas_items:
    pdf.set_font("Helvetica", "", 8.5)
    pdf.cell(widths2[0], 5.5, f"  {item[0]}", border="B")
    pdf.set_font("Helvetica", "B", 8.5)
    pdf.cell(widths2[1], 5.5, item[1], border="B", align="R", new_x="LMARGIN", new_y="NEXT")

pdf.ln(3)

# ============================================================
# SECTION 3B - TRANSPORTATION
# ============================================================
pdf.header_bar("4. TRANSPORTATION")

pdf.add_table_header(cols3, widths3)

transport_items = [
    ("SOJO Transfer (Truckload)", "$250.00 + FSC", "L&M to/from SOJO Bristol"),
]
for item in transport_items:
    pdf.add_table_row(item, widths3)

pdf.ln(1)
pdf.set_font("Helvetica", "I", 7.5)
pdf.set_text_color(100, 100, 100)
pdf.multi_cell(0, 3.5, "Truckload transfer rate for product movement between L&M facility and SOJO Bristol for pick-up or cartoning operations. FSC (Fuel Surcharge) applied at current DOE index rate.")
pdf.set_text_color(0, 0, 0)

pdf.ln(3)

# ============================================================
# SECTION 4 - TERMS & CONDITIONS
# ============================================================
pdf.header_bar("5. SERVICE COMMITMENT & TERMS")

terms = [
    ("Payment Terms", "Net 30 from receipt of invoice"),
    ("Quote Validity", "30 days from date of proposal"),
    ("Insurance", "Comprehensive GL: $1M | Cargo: $250K"),
    ("Minimum Commitment", "12 months"),
    ("Support", "sales@lmwarehousing.com"),
]

for term in terms:
    pdf.set_font("Helvetica", "B", 8.5)
    pdf.cell(50, 5.5, f"  {term[0]}:")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.cell(0, 5.5, term[1], new_x="LMARGIN", new_y="NEXT")

pdf.ln(2)

# Disclosures
pdf.set_font("Helvetica", "I", 7.5)
pdf.set_text_color(100, 100, 100)
pdf.multi_cell(0, 3.5, "Notes: Currently producing in Southern VT and Buffalo, NY. SOJO (Bristol) currently handles variety pack cartoning and is also their main storage facility. Pallet stackability: prefer 2 high but 3 high works.")
pdf.set_text_color(0, 0, 0)

pdf.ln(3)

# ============================================================
# SECTION 5 - AUTHORIZATION
# ============================================================
pdf.header_bar("6. AUTHORIZATION & ACCEPTANCE")

pdf.set_font("Helvetica", "", 8.5)
pdf.multi_cell(0, 4.5, "By signing below, both parties agree to the rates and terms outlined in this proposal.")
pdf.ln(6)

# Signature blocks
pdf.set_font("Helvetica", "B", 8.5)
pdf.cell(90, 5.5, "SPIKED ADE (SPKED INC)")
pdf.cell(90, 5.5, "L&M DISTRIBUTION & LOGISTICS", new_x="LMARGIN", new_y="NEXT")
pdf.ln(10)

pdf.set_draw_color(150, 150, 150)
pdf.line(10, pdf.get_y(), 95, pdf.get_y())
pdf.line(110, pdf.get_y(), 195, pdf.get_y())
pdf.ln(1.5)

pdf.set_font("Helvetica", "", 7.5)
pdf.cell(90, 4.5, "Signature")
pdf.cell(90, 4.5, "Signature", new_x="LMARGIN", new_y="NEXT")
pdf.ln(6)

pdf.line(10, pdf.get_y(), 95, pdf.get_y())
pdf.line(110, pdf.get_y(), 195, pdf.get_y())
pdf.ln(1.5)
pdf.cell(90, 4.5, "Printed Name & Title")
pdf.cell(90, 4.5, "Printed Name & Title", new_x="LMARGIN", new_y="NEXT")
pdf.ln(6)

pdf.line(10, pdf.get_y(), 95, pdf.get_y())
pdf.line(110, pdf.get_y(), 195, pdf.get_y())
pdf.ln(1.5)
pdf.cell(90, 4.5, "Date")
pdf.cell(90, 4.5, "Date", new_x="LMARGIN", new_y="NEXT")

# Save
output_path = os.path.join(os.path.dirname(__file__), "SpikedAde_Warehousing_Proposal.pdf")
pdf.output(output_path)
print(f"PDF saved to: {output_path}")
