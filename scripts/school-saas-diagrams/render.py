"""Render all School SaaS structure diagrams to PNG."""
import os
import sys
from playwright.sync_api import sync_playwright

SCRIPTS_DIR = "/home/z/my-project/scripts/school-saas-diagrams"
OUT_DIR = "/home/z/my-project/download/school-saas-structure"
os.makedirs(OUT_DIR, exist_ok=True)

# (html_file, output_png, viewport_width, viewport_height)
DIAGRAMS = [
    ("01_architecture.html", "01_system_architecture.png", 1480, 1180),
    ("02_erd.html", "02_database_erd.png", 1560, 1620),
    ("03_roles.html", "03_roles_hierarchy.png", 1440, 1180),
    ("04_modules.html", "04_modules_by_phase.png", 1560, 1080),
    ("05_pricing.html", "05_pricing_tiers.png", 1560, 1180),
    ("06_ui_mockup.html", "06_ui_mockup.png", 1760, 1180),
    ("07_roadmap.html", "07_build_roadmap.png", 1600, 1620),
]


def render(html_file, png_file, vw, vh):
    html_path = os.path.join(SCRIPTS_DIR, html_file)
    png_path = os.path.join(OUT_DIR, png_file)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": vw, "height": vh}, device_scale_factor=2)
        page = ctx.new_page()
        page.goto(f"file://{html_path}")
        page.wait_for_load_state("networkidle")
        # Get actual content size
        box = page.evaluate("""() => {
            const el = document.querySelector('.canvas') || document.body;
            const r = el.getBoundingClientRect();
            return {w: Math.ceil(r.width), h: Math.ceil(r.height)};
        }""")
        # Resize viewport to fit content with padding
        new_w = max(vw, box["w"] + 80)
        new_h = max(vh, box["h"] + 80)
        page.set_viewport_size({"width": new_w, "height": new_h})
        page.wait_for_timeout(200)
        page.screenshot(path=png_path, full_page=True, omit_background=False)
        browser.close()
        size = os.path.getsize(png_path)
        print(f"OK  {png_file}  ({new_w}x{new_h}, {size//1024} KB)")
        return png_path


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else None
    for html_file, png_file, vw, vh in DIAGRAMS:
        if target and target not in html_file:
            continue
        render(html_file, png_file, vw, vh)
    print("Done.")
