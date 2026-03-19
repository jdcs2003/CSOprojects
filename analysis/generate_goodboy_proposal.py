#!/usr/bin/env python3
"""Generate Good Boy Vodka Warehousing & Distribution Proposal PDF for L&M"""

from fpdf import FPDF
import os
from datetime import datetime

class GoodBoyPDF(FPDF):
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

pdf = GoodBoyPDF()
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
pdf.cell(0, 7, "WAREHOUSING & DISTRIBUTION PROPOSAL")
pdf.set_xy(60, 20)
pdf.set_font("Helvetica", "", 10)
pdf.set_text_color(80, 80, 80)
pdf.cell(0, 6, "Prepared for Good Boy Vodka")
pdf.set_xy(60, 27)
pdf.set_font("Helvetica", "", 8.5)
pdf.cell(0, 5, f"{today}  |  Quote Valid for 90 Days")
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

# Left: Prepared For
pdf.set_xy(10, y_start)
pdf.set_fill_color(245, 247, 250)
pdf.set_font("Helvetica", "B", 8.5)
pdf.cell(col_w, 5.5, "  PREPARED FOR", fill=True, new_x="LMARGIN", new_y="NEXT")
pdf.set_x(10)
pdf.set_font("Helvetica", "", 8.5)
info_lines = [
    "Good Boy Vodka",
    "Pennsylvania Market",
    "",
    "Product: Good Boy Vodka & RTD Cocktails",
    "SKUs: 16-18 (including seasonal)",
    "Case Config: 104 cases per pallet",
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
    "PA-510: 510 Station Ave, Bensalem PA 19020",
    "Climate-controlled, PLCB-compliant",
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
pdf.multi_cell(0, 4.5, "Quick-turn warehousing and PLCB distribution under L&M's Local Goods model. L&M will receive, store, label, and deliver Good Boy Vodka products to PLCB stores and distribution points across Pennsylvania with guaranteed compliance.")
pdf.ln(2)

# Volume summary box
pdf.set_fill_color(245, 247, 250)
pdf.set_font("Helvetica", "B", 8.5)
w = pdf.w - 20
box_w = w / 4

pdf.set_x(10)
pdf.cell(box_w, 5, "  Annual Volume", fill=True)
pdf.cell(box_w, 5, "  Monthly Throughput", fill=True)
pdf.cell(box_w, 5, "  On-Hand Inventory", fill=True)
pdf.cell(box_w, 5, "  Avg. Dwell Time", fill=True, new_x="LMARGIN", new_y="NEXT")

pdf.set_font("Helvetica", "B", 11)
pdf.set_text_color(30, 62, 99)
pdf.set_x(10)
pdf.cell(box_w, 7, "  50,000 cases")
pdf.cell(box_w, 7, "  ~4,000 cases")
pdf.cell(box_w, 7, "  ~8,000 cases")
pdf.cell(box_w, 7, "  45-60 days", new_x="LMARGIN", new_y="NEXT")

pdf.set_font("Helvetica", "", 7.5)
pdf.set_text_color(100, 100, 100)
pdf.set_x(10)
pdf.cell(box_w, 4, "  Pass-through target")
pdf.cell(box_w, 4, "  ~38 pallets/mo")
pdf.cell(box_w, 4, "  ~77 pallets")
pdf.cell(box_w, 4, "  Quick-turn model", new_x="LMARGIN", new_y="NEXT")
pdf.set_text_color(0, 0, 0)

pdf.ln(4)

# ============================================================
# SECTION 1 - STORAGE RATES
# ============================================================
pdf.header_bar("1. STORAGE RATES (PA-510 Bensalem)")

pdf.set_font("Helvetica", "", 8.5)
pdf.multi_cell(0, 4.5, "Climate-controlled pallet storage at our PA-510 Bensalem facility. Introductory rate applies for the first 60 days to support the quick-turn distribution model.")
pdf.ln(2)

cols3 = ["Service", "Rate", "Notes"]
widths3 = [w * 0.45, w * 0.25, w * 0.30]
pdf.add_table_header(cols3, widths3)

storage_items = [
    ("Pallet Storage (First 60 Days)", "$12.00", "Per pallet / month"),
    ("Pallet Storage (Beyond 60 Days)", "$17.00", "Per pallet / month"),
]
for item in storage_items:
    pdf.add_table_row(item, widths3)

pdf.ln(1)
pdf.set_font("Helvetica", "I", 7.5)
pdf.set_text_color(100, 100, 100)
pdf.multi_cell(0, 3.5, "Storage billed monthly based on pallet positions occupied. Pallets remaining beyond 60 days billed at the standard rate.")
pdf.set_text_color(0, 0, 0)

pdf.ln(3)

# ============================================================
# SECTION 2 - HANDLING RATES
# ============================================================
pdf.header_bar("2. HANDLING & LABOR RATES")

pdf.set_font("Helvetica", "", 8.5)
pdf.multi_cell(0, 4.5, "Standard handling rates for inbound receiving and outbound shipping at PA-510. L&M guarantees full PLCB label compliance -- no refused loads due to labeling issues. Any fines resulting from label errors are covered by L&M.")
pdf.ln(2)

pdf.add_table_header(cols3, widths3)

handling_items = [
    ("Handling In (Receiving)", "$7.00", "Per pallet"),
    ("Handling Out (Shipping)", "$7.00", "Per pallet"),
    ("PLCB Labeling", "$0.60", "Per case (PLCB compliant)"),
    ("Shrink Wrap", "$4.00", "Per pallet"),
    ("Pallet / Supply Fee", "Market Rate", "As consumed"),
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
# SECTION 3 - PLCB DELIVERY RATES
# ============================================================
pdf.header_bar("3. PLCB DELIVERY SERVICES")

pdf.set_font("Helvetica", "", 8.5)
pdf.multi_cell(0, 4.5, "Last-mile delivery to PLCB stores and distribution points across Pennsylvania. Rates are per case and include fuel surcharge where noted.")
pdf.ln(2)

pdf.add_table_header(cols3, widths3)

delivery_items = [
    ("PLCB Delivery (base rate)", "$1.25", "Per case"),
    ("Fuel Surcharge (FSC)", "$0.25", "Per case"),
    ("PLCB Delivery All-In", "$1.50", "Per case, delivered"),
    ("PLCB Delivered + Labeled", "$2.10", "Per case, all-in"),
]
for item in delivery_items:
    pdf.add_table_row(item, widths3)

pdf.ln(1)
pdf.set_font("Helvetica", "I", 7.5)
pdf.set_text_color(100, 100, 100)
pdf.multi_cell(0, 3.5, "The $2.10/case all-in rate includes delivery ($1.25), fuel surcharge ($0.25), and PLCB-compliant labeling ($0.60/case). 10-case minimum order applies per delivery.")
pdf.set_text_color(0, 0, 0)

pdf.ln(3)

# ============================================================
# SECTION 4 - TERMS & CONDITIONS
# ============================================================
pdf.header_bar("4. SERVICE COMMITMENT & TERMS")

terms = [
    ("Payment Terms", "Net 30 from receipt of invoice"),
    ("Quote Validity", "90 days from date of proposal"),
    ("Insurance", "Comprehensive GL: $1M | Cargo: $250K"),
    ("Minimum Order", "10 cases per PLCB delivery"),
    ("Support", "sales@lmwarehousing.com"),
]

for term in terms:
    pdf.set_font("Helvetica", "B", 8.5)
    pdf.cell(50, 5.5, f"  {term[0]}:")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.cell(0, 5.5, term[1], new_x="LMARGIN", new_y="NEXT")

pdf.ln(3)

# ============================================================
# SECTION 5 - AUTHORIZATION
# ============================================================
pdf.header_bar("5. AUTHORIZATION & ACCEPTANCE")

pdf.set_font("Helvetica", "", 8.5)
pdf.multi_cell(0, 4.5, "By signing below, both parties agree to the rates and terms outlined in this proposal. This proposal, together with any applicable Master Warehouse Services Agreement, constitutes the complete agreement between the parties.")
pdf.ln(6)

# Signature blocks
pdf.set_font("Helvetica", "B", 8.5)
pdf.cell(90, 5.5, "GOOD BOY VODKA")
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
output_path = os.path.join(os.path.dirname(__file__), "GoodBoy_Vodka_Warehousing_Proposal.pdf")
pdf.output(output_path)
print(f"PDF saved to: {output_path}")
