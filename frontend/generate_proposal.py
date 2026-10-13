import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def create_proposal():
    doc = Document()
    
    # Page setup - A4 with 0.45 in margins to ensure strict 1-page fit
    section = doc.sections[0]
    section.page_width = Inches(8.27)  # A4 width
    section.page_height = Inches(11.69) # A4 height
    section.top_margin = Inches(0.4)
    section.bottom_margin = Inches(0.4)
    section.left_margin = Inches(0.45)
    section.right_margin = Inches(0.45)
    
    # Color Palette: Deep Navy & Dark Slate
    COLOR_PRIMARY = RGBColor(16, 44, 87)       # #102C57
    COLOR_SECONDARY = RGBColor(53, 95, 142)   # #355F8E
    COLOR_DARK = RGBColor(33, 37, 41)         # #212529
    COLOR_MUTED = RGBColor(108, 117, 125)     # #6C757D
    HEX_PRIMARY = "102C57"
    HEX_LIGHT_BG = "F4F6F9"
    HEX_BORDER = "CCCCCC"

    # Helper styling functions
    def set_cell_background(cell, hex_color):
        shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
        cell._tc.get_or_add_tcPr().append(shading)

    def set_cell_margins(cell, top=60, bottom=60, left=100, right=100):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
        tcPr.append(tcMar)

    def set_cell_borders(cell, top=None, bottom=None, left=None, right=None):
        tcPr = cell._tc.get_or_add_tcPr()
        borders = parse_xml(f'<w:tcBorders {nsdecls("w")}/>')
        for side, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
            if val:
                b = parse_xml(f'<w:{side} {nsdecls("w")} w:val="{val.get("val","single")}" w:sz="{val.get("sz","4")}" w:space="0" w:color="{val.get("color","CCCCCC")}"/>')
                borders.append(b)
            else:
                b = parse_xml(f'<w:{side} {nsdecls("w")} w:val="none"/>')
                borders.append(b)
        tcPr.append(borders)

    # 1. HEADER BLOCK (Title + Metadata Table)
    header_table = doc.add_table(rows=1, cols=2)
    header_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    header_table.autofit = False
    
    # Left column: Project Title
    cell_left = header_table.cell(0, 0)
    cell_left.width = Inches(4.8)
    p_sub = cell_left.paragraphs[0]
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(2)
    run_sub = p_sub.add_run("UNIVERSITY SOFTWARE ENGINEERING PROJECT PROPOSAL")
    run_sub.font.name = "Arial"
    run_sub.font.size = Pt(8.5)
    run_sub.font.bold = True
    run_sub.font.color.rgb = COLOR_SECONDARY

    p_title = cell_left.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(2)
    run_title = p_title.add_run("Legal Office Case & Diary Management Platform")
    run_title.font.name = "Arial"
    run_title.font.size = Pt(14)
    run_title.font.bold = True
    run_title.font.color.rgb = COLOR_PRIMARY

    p_tagline = cell_left.add_paragraph()
    p_tagline.paragraph_format.space_before = Pt(0)
    p_tagline.paragraph_format.space_after = Pt(0)
    run_tag = p_tagline.add_run("Secure Digital Case Administration, Diary Notes & Document Tracking System")
    run_tag.font.name = "Arial"
    run_tag.font.size = Pt(8.5)
    run_tag.font.italic = True
    run_tag.font.color.rgb = COLOR_MUTED

    # Right column: Meta Info
    cell_right = header_table.cell(0, 1)
    cell_right.width = Inches(2.57)
    p_meta = cell_right.paragraphs[0]
    p_meta.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_meta.paragraph_format.space_before = Pt(0)
    p_meta.paragraph_format.space_after = Pt(1)
    
    meta_lines = [
        ("Project Type: ", "Academic Client Project"),
        ("Target Client: ", "Law Firm / Legal Chambers"),
        ("Date: ", "Academic Year 2024/2025"),
        ("Version: ", "1.0 (Initial Scope Proposal)")
    ]
    for label, val in meta_lines:
        p_m = cell_right.add_paragraph() if p_meta.text else p_meta
        p_m.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_m.paragraph_format.space_before = Pt(0)
        p_m.paragraph_format.space_after = Pt(1.5)
        r_lbl = p_m.add_run(label)
        r_lbl.font.name = "Arial"
        r_lbl.font.size = Pt(8)
        r_lbl.font.bold = True
        r_lbl.font.color.rgb = COLOR_DARK
        r_val = p_m.add_run(val)
        r_val.font.name = "Arial"
        r_val.font.size = Pt(8)
        r_val.font.color.rgb = COLOR_MUTED

    # Divider line
    p_div = doc.add_paragraph()
    p_div.paragraph_format.space_before = Pt(4)
    p_div.paragraph_format.space_after = Pt(6)
    p_div_border = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="12" w:space="1" w:color="{HEX_PRIMARY}"/></w:pBdr>')
    p_div._p.get_or_add_pPr().append(p_div_border)

    # Section Heading helper
    def add_section_header(title):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(2)
        run = p.add_run(title.upper())
        run.font.name = "Arial"
        run.font.size = Pt(9.5)
        run.font.bold = True
        run.font.color.rgb = COLOR_PRIMARY
        return p

    # 2. EXECUTIVE SUMMARY & PURPOSE
    add_section_header("1. Executive Summary & Project Purpose")
    p_exec = doc.add_paragraph()
    p_exec.paragraph_format.space_before = Pt(0)
    p_exec.paragraph_format.space_after = Pt(4)
    p_exec.paragraph_format.line_spacing = 1.05
    run_exec = p_exec.add_run(
        "This project aims to design and implement a bespoke, highly secure, web-based Case and Diary Management Platform "
        "tailored for legal practice. The system eliminates paper-intensive fragmentation by centralizing court cases, hearings, "
        "confidential digital diary notes, and legal documentation into a unified, encrypted repository. It equips legal practitioners "
        "and authorized staff with automated court calendars, role-based document access, and strict activity audit logging "
        "to ensure seamless compliance with legal confidentiality and professional evidentiary standards."
    )
    run_exec.font.name = "Arial"
    run_exec.font.size = Pt(8.5)
    run_exec.font.color.rgb = COLOR_DARK

    # 3. CORE MODULES & FUNCTIONAL SCOPE (2-column key features table)
    add_section_header("2. Core System Modules & Functional Requirements")
    
    modules_table = doc.add_table(rows=3, cols=2)
    modules_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    modules_table.autofit = False
    
    modules = [
        ("Case Management & Records", 
         "• Centralized case registration: Case #, court jurisdiction, parties, assigned counsel, status.\n• Comprehensive 360° case dossier view consolidating files, notes, and timeline.\n• Multi-parameter search & filtering by case number, client, party, or advocate."),
        
        ("Court Diary & Scheduling", 
         "• Hearing logs capturing court, hearing time, bench/judge, and hearing objectives.\n• Interactive visual court calendar and operational dashboard for upcoming dates.\n• Automated deadline warnings and hearing reminders to eliminate missed appearances."),
        
        ("Digital Diary & Case Notes", 
         "• In-app note creation with automatic timestamps, author tagging, and case linkage.\n• Support for digital uploads (PDF, Word, image attachments) of handwritten notes.\n• Strict role-governed view/edit privileges preserving integrity of ongoing legal notes."),
        
        ("Legal Document Repository", 
         "• Structured categorization: Petitions, Affidavits, Court Orders, Evidence, Correspondence.\n• Secure multi-format upload, viewing, version verification, and controlled downloading.\n• Encrypted document storage with granular per-document authorization settings."),
        
        ("User Management & RBAC", 
         "• Strict Role-Based Access Control (Senior Advocate / Managing Lawyer, Associate, Clerk).\n• Admin console for account provisioning, credential management, and role revocation.\n• Principle of least privilege: staff access strictly restricted to designated matters."),
        
        ("Audit Trail & Compliance", 
         "• Tamper-evident activity log tracking all actions (view, download, upload, update).\n• Records exact user identity, IP/device timestamp, and target document/diary entry.\n• Administrative audit inspection dashboard for regulatory compliance and accountability.")
    ]

    col_widths = [Inches(3.68), Inches(3.68)]
    for idx, (title, desc) in enumerate(modules):
        r = idx // 2
        c = idx % 2
        cell = modules_table.cell(r, c)
        cell.width = col_widths[c]
        set_cell_background(cell, HEX_LIGHT_BG)
        set_cell_margins(cell, top=45, bottom=45, left=70, right=70)
        set_cell_borders(cell, 
                         top={"val": "single", "sz": "2", "color": "E0E0E0"},
                         bottom={"val": "single", "sz": "2", "color": "E0E0E0"},
                         left={"val": "single", "sz": "4", "color": HEX_PRIMARY},
                         right={"val": "single", "sz": "2", "color": "E0E0E0"})
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(2)
        r_t = p.add_run(title)
        r_t.font.name = "Arial"
        r_t.font.size = Pt(8.5)
        r_t.font.bold = True
        r_t.font.color.rgb = COLOR_PRIMARY
        
        p_d = cell.add_paragraph()
        p_d.paragraph_format.space_before = Pt(0)
        p_d.paragraph_format.space_after = Pt(0)
        p_d.paragraph_format.line_spacing = 1.05
        r_d = p_d.add_run(desc)
        r_d.font.name = "Arial"
        r_d.font.size = Pt(7.5)
        r_d.font.color.rgb = COLOR_DARK

    # Space after table
    p_spacer = doc.add_paragraph()
    p_spacer.paragraph_format.space_before = Pt(1)
    p_spacer.paragraph_format.space_after = Pt(2)

    # 4. SECURITY, CONFIDENTIALITY & FUTURE ROADMAP
    add_section_header("3. Security Architecture & Future Enhancements")
    
    sec_table = doc.add_table(rows=1, cols=2)
    sec_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sec_table.autofit = False

    c_sec0 = sec_table.cell(0, 0)
    c_sec0.width = Inches(3.68)
    set_cell_background(c_sec0, "FAFAFA")
    set_cell_margins(c_sec0, top=40, bottom=40, left=60, right=60)
    set_cell_borders(c_sec0, 
                     top={"val": "single", "sz": "2", "color": "DDDDDD"},
                     bottom={"val": "single", "sz": "2", "color": "DDDDDD"},
                     left={"val": "single", "sz": "2", "color": "DDDDDD"},
                     right={"val": "single", "sz": "2", "color": "DDDDDD"})
    
    p_s_head = c_sec0.paragraphs[0]
    p_s_head.paragraph_format.space_before = Pt(0)
    p_s_head.paragraph_format.space_after = Pt(1)
    r_sh = p_s_head.add_run("Security & Confidentiality Safeguards:")
    r_sh.font.name = "Arial"
    r_sh.font.size = Pt(8)
    r_sh.font.bold = True
    r_sh.font.color.rgb = COLOR_PRIMARY
    
    p_s_body = c_sec0.add_paragraph()
    p_s_body.paragraph_format.space_before = Pt(0)
    p_s_body.paragraph_format.space_after = Pt(0)
    p_s_body.paragraph_format.line_spacing = 1.05
    r_sb = p_s_body.add_run("• End-to-end HTTPS encrypted transport & hashed user credentials.\n• AES encrypted document storage preventing unauthorized disk access.\n• Automated database backup protocols ensuring business continuity.")
    r_sb.font.name = "Arial"
    r_sb.font.size = Pt(7.5)
    r_sb.font.color.rgb = COLOR_DARK

    c_sec1 = sec_table.cell(0, 1)
    c_sec1.width = Inches(3.68)
    set_cell_background(c_sec1, "FAFAFA")
    set_cell_margins(c_sec1, top=40, bottom=40, left=60, right=60)
    set_cell_borders(c_sec1, 
                     top={"val": "single", "sz": "2", "color": "DDDDDD"},
                     bottom={"val": "single", "sz": "2", "color": "DDDDDD"},
                     left={"val": "single", "sz": "2", "color": "DDDDDD"},
                     right={"val": "single", "sz": "2", "color": "DDDDDD"})
    
    p_f_head = c_sec1.paragraphs[0]
    p_f_head.paragraph_format.space_before = Pt(0)
    p_f_head.paragraph_format.space_after = Pt(1)
    r_fh = p_f_head.add_run("Planned Extensibility / Future Phases:")
    r_fh.font.name = "Arial"
    r_fh.font.size = Pt(8)
    r_fh.font.bold = True
    r_fh.font.color.rgb = COLOR_PRIMARY
    
    p_f_body = c_sec1.add_paragraph()
    p_f_body.paragraph_format.space_before = Pt(0)
    p_f_body.paragraph_format.space_after = Pt(0)
    p_f_body.paragraph_format.line_spacing = 1.05
    r_fb = p_f_body.add_run("• Client self-service inquiry portal for real-time case progression.\n• Optical Character Recognition (OCR) for full-text search across scans.\n• SMS/Email notifications, document versioning, & mobile responsive PWA.")
    r_fb.font.name = "Arial"
    r_fb.font.size = Pt(7.5)
    r_fb.font.color.rgb = COLOR_DARK

    # 5. PROJECT METHODOLOGY & CLIENT COMMITMENT
    add_section_header("4. Project Phasing & Deliverables")
    p_del = doc.add_paragraph()
    p_del.paragraph_format.space_before = Pt(0)
    p_del.paragraph_format.space_after = Pt(4)
    p_del.paragraph_format.line_spacing = 1.05
    r_del = p_del.add_run(
        "Development will execute under Agile methodology across 4 phases: (1) Requirements validation & workflow elicitation, "
        "(2) UI/UX prototyping & secure database architecture, (3) Iterative module implementation & audit trail testing, and "
        "(4) Acceptance testing, user documentation & pilot deployment. The client will participate in sprint demonstrations to "
        "fine-tune workflow rules, document taxonomies, and hosting infrastructure before production hand-off."
    )
    r_del.font.name = "Arial"
    r_del.font.size = Pt(8)
    r_del.font.color.rgb = COLOR_DARK

    # 6. SIGN-OFF / CLIENT ACCEPTANCE AGREEMENT
    add_section_header("5. Project Stakeholder Sign-Off & Approval")
    
    p_sign_intro = doc.add_paragraph()
    p_sign_intro.paragraph_format.space_before = Pt(0)
    p_sign_intro.paragraph_format.space_after = Pt(4)
    r_si = p_sign_intro.add_run(
        "By signing below, the Client and Student Developer endorse this project proposal, confirming the initial scope, "
        "operational objectives, and academic collaboration terms outlined above."
    )
    r_si.font.name = "Arial"
    r_si.font.size = Pt(8)
    r_si.font.italic = True
    r_si.font.color.rgb = COLOR_MUTED

    sig_table = doc.add_table(rows=1, cols=2)
    sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sig_table.autofit = False

    # Left: Client Signature Block
    cell_client = sig_table.cell(0, 0)
    cell_client.width = Inches(3.68)
    set_cell_background(cell_client, "FFFFFF")
    set_cell_margins(cell_client, top=45, bottom=45, left=60, right=60)
    set_cell_borders(cell_client, 
                     top={"val": "single", "sz": "4", "color": HEX_PRIMARY},
                     bottom={"val": "single", "sz": "2", "color": "CCCCCC"},
                     left={"val": "single", "sz": "2", "color": "CCCCCC"},
                     right={"val": "single", "sz": "2", "color": "CCCCCC"})

    p_c_title = cell_client.paragraphs[0]
    p_c_title.paragraph_format.space_before = Pt(0)
    p_c_title.paragraph_format.space_after = Pt(4)
    r_ct = p_c_title.add_run("CLIENT ACCEPTANCE (LAW FIRM)")
    r_ct.font.name = "Arial"
    r_ct.font.size = Pt(8)
    r_ct.font.bold = True
    r_ct.font.color.rgb = COLOR_PRIMARY

    client_fields = [
        "Authorized Representative: _______________________",
        "Designation / Title: _____________________________",
        "Law Firm / Organization: ________________________",
        "Signature: _____________________________________",
        "Date: _________________________________________"
    ]
    for line in client_fields:
        p_cf = cell_client.add_paragraph()
        p_cf.paragraph_format.space_before = Pt(1.5)
        p_cf.paragraph_format.space_after = Pt(1.5)
        r_cf = p_cf.add_run(line)
        r_cf.font.name = "Arial"
        r_cf.font.size = Pt(7.5)
        r_cf.font.color.rgb = COLOR_DARK

    # Right: Student / University Project Lead
    cell_stud = sig_table.cell(0, 1)
    cell_stud.width = Inches(3.68)
    set_cell_background(cell_stud, "FFFFFF")
    set_cell_margins(cell_stud, top=45, bottom=45, left=60, right=60)
    set_cell_borders(cell_stud, 
                     top={"val": "single", "sz": "4", "color": HEX_PRIMARY},
                     bottom={"val": "single", "sz": "2", "color": "CCCCCC"},
                     left={"val": "single", "sz": "2", "color": "CCCCCC"},
                     right={"val": "single", "sz": "2", "color": "CCCCCC"})

    p_s_title = cell_stud.paragraphs[0]
    p_s_title.paragraph_format.space_before = Pt(0)
    p_s_title.paragraph_format.space_after = Pt(4)
    r_st = p_s_title.add_run("STUDENT / PROJECT LEAD")
    r_st.font.name = "Arial"
    r_st.font.size = Pt(8)
    r_st.font.bold = True
    r_st.font.color.rgb = COLOR_PRIMARY

    stud_fields = [
        "Student Name: __________________________________",
        "Student ID / Reg No: ____________________________",
        "Degree / Program: B.Sc. (Hons) Software Engineering",
        "Signature: _____________________________________",
        "Date: _________________________________________"
    ]
    for line in stud_fields:
        p_sf = cell_stud.add_paragraph()
        p_sf.paragraph_format.space_before = Pt(1.5)
        p_sf.paragraph_format.space_after = Pt(1.5)
        r_sf = p_sf.add_run(line)
        r_sf.font.name = "Arial"
        r_sf.font.size = Pt(7.5)
        r_sf.font.color.rgb = COLOR_DARK

    # Save document
    output_path = r"c:\Users\Iresha\Downloads\smartgrow\Legal_Office_Case_and_Diary_Management_Platform_Proposal.docx"
    doc.save(output_path)
    print(f"Saved proposal to: {output_path}")

if __name__ == "__main__":
    create_proposal()
