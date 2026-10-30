"""E2E check for public/closure. Usage: python3 scripts/closure-page.e2e.py http://localhost:8765/closure/index.html [outdir]"""
import sys, os
from playwright.sync_api import sync_playwright
url = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else "."
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1440, "height": 900})
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" and "fonts" not in m.text and "ERR_" not in m.text else None)
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(url); pg.wait_for_timeout(2500)
    ok = lambda: pg.evaluate("window.__closure.result.closes")
    assert ok(), "edge demo should close"
    pg.screenshot(path=os.path.join(out, "desktop_closed.png"))
    pg.click("#btn-predict")  # predict off for the quick flip
    pg.click("text=MOXIE oxygen experiment"); pg.wait_for_timeout(1500)
    assert not ok(), "adding MOXIE must break closure"
    assert "DOES NOT CLOSE" in pg.inner_text("#stamp")
    pg.screenshot(path=os.path.join(out, "desktop_broken.png"))
    pg.click("#sw-remove"); pg.wait_for_timeout(900)
    assert ok(), "removing last instrument must close again"
    # predict flow
    pg.click("#btn-predict"); pg.click("text=MOXIE oxygen experiment")
    assert pg.is_visible("#banner button.no"); pg.click("#banner button.no"); pg.wait_for_timeout(300)
    assert pg.inner_text("#score").strip().startswith("1 / 1"), pg.inner_text("#score")
    # language
    pg.click("[data-lang=bn]"); pg.wait_for_timeout(300)
    assert "মিশন" in pg.inner_text("#stamp"), pg.inner_text("#stamp")
    pg.screenshot(path=os.path.join(out, "desktop_bn.png"))
    pg.click("[data-lang=en]")
    # receipts
    pg.click("#btn-receipts"); pg.wait_for_timeout(700)
    assert pg.is_visible("#drawer.open"), "drawer should open"
    pg.screenshot(path=os.path.join(out, "desktop_receipts.png")); pg.click("#dr-close")
    # fly (failing design is currently broken by MOXIE)
    pg.click("#btn-fly"); pg.wait_for_timeout(8500)
    pg.screenshot(path=os.path.join(out, "fly_fail.png")); pg.click("#fly-close")
    pg.click("#sw-remove"); pg.wait_for_timeout(700); pg.click("#btn-fly"); pg.wait_for_timeout(6500)
    pg.screenshot(path=os.path.join(out, "fly_ok.png")); pg.click("#fly-close")
    m = b.new_page(viewport={"width": 390, "height": 844}); m.goto(url); m.wait_for_timeout(2500)
    assert m.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), "mobile horizontal scroll"
    m.screenshot(path=os.path.join(out, "mobile.png"), full_page=True)
    b.close()
assert not errs, errs
print("E2E OK")
