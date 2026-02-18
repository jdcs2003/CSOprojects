#!/usr/bin/env python3
"""Generate Cornerstone Systems Transportation & Services Proposal PDF for L&M"""

from fpdf import FPDF
import os

class CornerstonePDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=20)
    
    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 7)
        self.set_text_color(150, 150, 150)
        self.cell(0, 4, "L&M Distribution & Logistics | Confidential", align="C", new_x="LMARGIN", new_y="NEXT")
        self.cell(0, 4, "cornerstonesupport@lmwarehousing.com", align="C")
        self.set_text_color(0, 0, 0)
    
    def header_bar(self, text, color=(30, 62, 99)):
        """Dark blue header bar"""
        self.set_fill_color(*color)
        self.set_text_color(255, 255, 255)
        self.set_font("Helvetica", "B", 10)
        self.cell(0, 7, f"  {text}", fill=True, new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(0, 0, 0)
        self.ln(1)
    
    def add_rate_row(self, service, rate, note=""):
        self.set_font("Helvetica", "", 8.5)
        w = self.w - 20
        self.cell(w * 0.50, 5.5, f"  {service}", border="B")
        self.set_font("Helvetica", "B", 8.5)
        self.cell(w * 0.20, 5.5, rate, border="B", align="R")
        self.set_font("Helvetica", "", 7.5)
        self.set_text_color(100, 100, 100)
        self.cell(w * 0.30, 5.5, f"  {note}", border="B", new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(0, 0, 0)
    
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

pdf = CornerstonePDF()
pdf.set_margins(10, 10, 10)

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
pdf.cell(0, 7, "TRANSPORTATION & SERVICES PROPOSAL")
pdf.set_xy(60, 20)
pdf.set_font("Helvetica", "", 10)
pdf.set_text_color(80, 80, 80)
pdf.cell(0, 6, "Prepared for Cornerstone Systems Inc.")
pdf.set_xy(60, 27)
pdf.set_font("Helvetica", "", 8.5)
pdf.cell(0, 5, "February 17, 2026  |  Quote Valid for 90 Days")
pdf.set_text_color(0, 0, 0)

pdf.ln(25)

# Divider
pdf.set_draw_color(30, 62, 99)
pdf.set_line_width(0.5)
pdf.line(10, pdf.get_y(), 200, pdf.get_y())
pdf.ln(4)

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
    "Cornerstone Systems Inc.",
    "Attn: Marc Purnell, Risk Manager",
    "3250 Players Club Parkway",
    "Memphis, TN 38125",
    "Phone: (901) 842-0660",
    "Email: invoices@cornerstone-systems.com"
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
    "cornerstonesupport@lmwarehousing.com",
    "",
    "Facilities:",
    "PA-1151: 1151 Beaver St, Bristol PA 19007",
    "PA-510: 510 Station Ave, Bensalem PA 19020",
    "SC-577: 577 Celriver Rd, Rock Hill SC 29730"
]
for line in by_lines:
    pdf.cell(col_w, 4.5, f"  {line}", new_x="LMARGIN", new_y="NEXT")
    pdf.set_x(110)

pdf.set_y(max(pdf.get_y(), y_start + 42))
pdf.ln(5)

# ============================================================
# SECTION 1 - TRANSPORTATION SERVICES
# ============================================================
pdf.header_bar("1. TRANSPORTATION SERVICES")

pdf.set_font("Helvetica", "", 8.5)
pdf.multi_cell(0, 4.5, "Dedicated truckload service from Edison NJ rail ramp to KLS DC5, NE Philadelphia PA. All rates are inclusive of fuel at current market conditions.")
pdf.ln(2)

w = pdf.w - 20
cols = ["Lane", "Rate", "Notes"]
widths = [w * 0.45, w * 0.20, w * 0.35]
pdf.add_table_header(cols, widths)

rows = [
    ("Edison NJ Rail Ramp to KLS DC5, NE Phila PA", "$769.65", "Per load, all-in"),
]
for row in rows:
    pdf.add_table_row(row, widths)

pdf.ln(2)
pdf.set_font("Helvetica", "", 7.5)
pdf.set_text_color(80, 80, 80)
pdf.multi_cell(0, 3.5, "Fuel Clause: Rates above are all-inclusive at current fuel prices. In the event that the DOE National Average Diesel Price increases by 15% or more above the current baseline, L&M reserves the right to initiate a rate review discussion with the customer. Any rate adjustment would be mutually agreed upon in writing. Pickup within 1-4 business days. Up to 2 trailers may be dropped at destination.")
pdf.set_text_color(0, 0, 0)
pdf.ln(2)

# Volume commitment
pdf.set_fill_color(245, 247, 250)
pdf.set_font("Helvetica", "B", 8.5)
pdf.cell(0, 5.5, "  Volume Commitment: 68 boxcars (272 loads) | Nov 2024 - Oct 2025", fill=True, new_x="LMARGIN", new_y="NEXT")
pdf.ln(4)

# ============================================================
# SECTION 2 - CROSS-DOCK SERVICES
# ============================================================
pdf.header_bar("2. CROSS-DOCK SERVICES")

pdf.set_font("Helvetica", "", 8.5)
pdf.multi_cell(0, 4.5, "Cross-dock services at L&M facilities for MGX Edison NJ inbound product. Rate applies as an exception for specific circumstances outlined below.")
pdf.ln(2)

pdf.add_rate_row("Cross-Dock Per Pallet", "$16.00", "Exception rate")
pdf.ln(2)

pdf.set_font("Helvetica", "", 7.5)
pdf.set_text_color(80, 80, 80)
pdf.multi_cell(0, 3.5, "PLCB Refusals & Weather: For PLCB refusals and weather-related events, Cornerstone agrees to the $16.00/pallet cross-dock fee to protect goods. L&M will notify Cornerstone when cross-docking is triggered under these circumstances.")
pdf.ln(1)
pdf.multi_cell(0, 3.5, "Other Exceptions: Where L&M needs to unload trailers for operational reasons outside of PLCB refusals or weather, L&M may do so at its discretion but shall not invoice Cornerstone for these services. Any product damage that occurs as a result of L&M-initiated unloading must be promptly reported to Cornerstone and is the sole responsibility of L&M.")
pdf.ln(1)
pdf.multi_cell(0, 3.5, "Volume Cap: During non-weather-related periods, L&M will keep cross-docked shipments below 10% of total volume. L&M will obtain approval from and/or notify Cornerstone when an MGX load is cross-docked at our facility.")
pdf.set_text_color(0, 0, 0)
pdf.ln(4)

# ============================================================
# SECTION 3 - PLCB REWORK SERVICES
# ============================================================
pdf.header_bar("3. PLCB REWORK SERVICES (PA-510 Bensalem)")

pdf.set_font("Helvetica", "", 8.5)
pdf.multi_cell(0, 4.5, "Pennsylvania Liquor Control Board (PLCB) compliance rework services performed at our PA-510 Bensalem facility. Includes relabeling, repacking, and case preparation per PLCB specifications.")
pdf.ln(2)

plcb_items = [
    ("Repack (includes case, new labels, case seal)", "$20.00", "Per case"),
    ("Shrink Wrap", "$4.00", "Per pallet"),
    ("Unload Per Case (refused shipments)", "$0.60", "Per case"),
    ("Case Destruction (with owner approval)", "$3.50", "Per case"),
]
cols2 = ["Service", "Rate", "Unit"]
widths2 = [w * 0.50, w * 0.25, w * 0.25]
pdf.add_table_header(cols2, widths2)
for item in plcb_items:
    pdf.add_table_row(item, widths2)

pdf.ln(4)

# ============================================================
# SECTION 4 - AD-HOC SERVICES
# ============================================================
pdf.header_bar("4. AD-HOC & WAREHOUSING SERVICES")

pdf.set_font("Helvetica", "", 8.5)
pdf.multi_cell(0, 4.5, "Additional services available on an as-needed basis. Ad-hoc services may include weekend and short-notice premiums where applicable.")
pdf.ln(2)

adhoc_items = [
    ("PLCB Re-delivery", "$650.00", "All-in"),
    ("Southern Delaware Delivery", "$750.00", "Per load, all-in"),
    ("LTL Redelivery", "$400.00", "Per shipment"),
    ("Slipsheet Unload", "$0.20", "Per case"),
    ("Pallet / Supply Fee", "Market Rate", "As consumed"),
    ("Handling In", "$8.00", "Per pallet"),
    ("Handling Out", "$8.00", "Per pallet"),
]

pdf.add_table_header(cols2, widths2)
for item in adhoc_items:
    pdf.add_table_row(item, widths2)

pdf.ln(2)
pdf.set_font("Helvetica", "B", 8.5)
pdf.cell(50, 5.5, "  Out-of-Scope Labor:")
pdf.set_font("Helvetica", "", 8.5)
pdf.cell(0, 5.5, "Standard: $50.00/hour  |  Weekend: $75.00/hour", new_x="LMARGIN", new_y="NEXT")
pdf.set_font("Helvetica", "I", 7.5)
pdf.set_text_color(100, 100, 100)
pdf.cell(0, 4.5, "Note: Ad-hoc rates may include premiums for weekend unloads and short notice dispatch.", new_x="LMARGIN", new_y="NEXT")
pdf.set_text_color(0, 0, 0)

pdf.ln(4)

# ============================================================
# SECTION 5 - FACILITY LOCATIONS
# ============================================================
pdf.header_bar("5. L&M FACILITY NETWORK")

facilities = [
    ("PA-1151 (Bristol)", "1151 Beaver St, Bristol PA 19007", "Primary cross-dock & distribution"),
    ("PA-510 (Bensalem)", "510 Station Ave, Bensalem PA 19020", "PLCB rework & compliance"),
    ("SC-577 (Rock Hill)", "577 Celriver Rd, Rock Hill SC 29730", "Southeast distribution hub"),
]

fac_cols = ["Facility", "Address", "Capability"]
fac_widths = [w * 0.22, w * 0.42, w * 0.36]
pdf.add_table_header(fac_cols, fac_widths)
for fac in facilities:
    pdf.set_font("Helvetica", "B", 8)
    pdf.cell(fac_widths[0], 5.5, f"  {fac[0]}", border="B")
    pdf.set_font("Helvetica", "", 8)
    pdf.cell(fac_widths[1], 5.5, f"  {fac[1]}", border="B")
    pdf.set_text_color(100, 100, 100)
    pdf.cell(fac_widths[2], 5.5, f"  {fac[2]}", border="B", new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(0, 0, 0)

pdf.ln(4)

# ============================================================
# SECTION 6 - SERVICE COMMITMENT & TERMS
# ============================================================
pdf.header_bar("6. SERVICE COMMITMENT & TERMS")

terms = [
    ("On-Time Delivery", "98.5% or greater"),
    ("Payment Terms", "Net 30 from receipt of invoice"),
    ("Quote Validity", "90 days from date of proposal"),
    ("Insurance", "Comprehensive GL: $1M | Cargo: $100K (per contract minimum)"),
    ("Support", "cornerstonesupport@lmwarehousing.com"),
]

for term in terms:
    pdf.set_font("Helvetica", "B", 8.5)
    pdf.cell(50, 5.5, f"  {term[0]}:")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.cell(0, 5.5, term[1], new_x="LMARGIN", new_y="NEXT")

pdf.ln(4)

# ============================================================
# SECTION 7 - AUTHORIZATION
# ============================================================
pdf.header_bar("7. AUTHORIZATION & ACCEPTANCE")

pdf.set_font("Helvetica", "", 8.5)
pdf.multi_cell(0, 4.5, "By signing below, both parties agree to the rates and terms outlined in this proposal. This proposal, together with the Master Warehouse Services Agreement, constitutes the complete agreement between the parties.")
pdf.ln(6)

# Signature blocks
pdf.set_font("Helvetica", "B", 8.5)
pdf.cell(90, 5.5, "CORNERSTONE SYSTEMS INC.")
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
output_path = os.path.join(os.path.dirname(__file__), "Cornerstone_Transportation_Proposal.pdf")
pdf.output(output_path)
print(f"PDF saved to: {output_path}")
