(function () {
  "use strict";
  var A = window.ASTRAIA, D = window.I18N;
  var $ = function (s) { return document.querySelector(s); };
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";

  // ---------- state ----------
  var EDGE_BUS = 2764; // bisected so the Mars delta-v margin is about +6 m/s with the three edge instruments
  var DEFAULT = { launcher: "atlas5", target: "mars", propellant: "bipro", bus: EDGE_BUS, load: 6000, inst: ["mastcamz", "meda", "supercam"] };
  var S = { lang: "en", predict: true, right: 0, total: 0 };
  var st = JSON.parse(JSON.stringify(DEFAULT));
  try { var sl0 = localStorage.getItem("astraia.closure.lang"); if (sl0 === "bn" || sl0 === "en") S.lang = sl0; } catch (e) {}

  // ---------- helpers ----------
  function t(k, p) {
    var s = (D[S.lang] && D[S.lang][k]) || D.en[k] || k;
    if (p) for (var n in p) s = s.split("{" + n + "}").join(p[n]);
    return s;
  }
  function nf(n, d) { return Number(n).toLocaleString(S.lang === "bn" ? "bn-BD" : "en-US", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function sgn(n, d) { return (n >= 0 ? "+" : "−") + nf(Math.abs(n), d); }
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    for (var k in (attrs || {})) { if (k === "text") e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); }
    (kids || []).forEach(function (c) { e.appendChild(c); });
    return e;
  }
  function sv(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in (attrs || {})) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function find(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
  function design(over) {
    var o = over || {};
    return { launcher: st.launcher, target: st.target, propellant: st.propellant, busDryKg: st.bus, propellantKg: st.load, instruments: o.inst || st.inst };
  }
  function kindBadge(prov, id) {
    var b = el("button", { "class": "k k-" + prov.kind, type: "button", title: t("k_" + prov.kind + "_d"), text: t("k_" + prov.kind) });
    b.addEventListener("click", function (ev) { ev.stopPropagation(); openDrawer(id); });
    return b;
  }
  function applyI18n() {
    document.documentElement.lang = S.lang;
    document.title = t("doc_title");
    document.querySelectorAll("[data-i18n]").forEach(function (n) { n.textContent = t(n.getAttribute("data-i18n")); });
    document.querySelectorAll(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === S.lang)); });
  }

  // ---------- controls ----------
  function chips(host, list, key) {
    host.innerHTML = "";
    list.forEach(function (it) {
      var b = el("button", { "class": "chip", type: "button", "aria-pressed": String(st[key] === it.id), text: it.name });
      b.addEventListener("click", function () { st[key] = it.id; render(); });
      host.appendChild(b);
    });
  }
  function renderControls() {
    chips($("#f-launcher"), A.LAUNCHERS, "launcher");
    chips($("#f-target"), A.TARGETS, "target");
    chips($("#f-prop"), A.PROPELLANTS, "propellant");
    $("#r-bus").value = st.bus; $("#r-load").value = st.load;
    $("#o-bus").textContent = nf(st.bus) + " " + t("kg"); $("#o-load").textContent = nf(st.load) + " " + t("kg");
    var host = $("#f-inst"); host.innerHTML = "";
    A.INSTRUMENTS.forEach(function (it) {
      var on = st.inst.indexOf(it.id) >= 0;
      var r = el("button", { "class": "irow", type: "button", "aria-pressed": String(on) });
      r.appendChild(el("span", { text: it.name }));
      r.appendChild(el("span", { "class": "m", text: nf(it.massKg, 1) + " " + t("kg") }));
      r.appendChild(kindBadge(it.prov, it.id));
      r.addEventListener("click", function () { toggleInstrument(it.id); });
      host.appendChild(r);
    });
    $("#pred-state").textContent = S.predict ? t("predict_on") : t("predict_off");
    $("#btn-predict").setAttribute("aria-pressed", String(S.predict));
  }

  // ---------- predict-then-reveal ----------
  var pending = false;
  function toggleInstrument(id) {
    if (pending) return;
    if (st.inst.indexOf(id) >= 0) { st.inst = st.inst.filter(function (x) { return x !== id; }); render(); return; }
    var after = st.inst.concat([id]);
    if (!S.predict) { st.inst = after; render(); return; }
    var inst = find(A.INSTRUMENTS, id), res = A.evaluate(design({ inst: after }));
    pending = true;
    var b = $("#banner"); b.className = "banner"; b.hidden = false; b.innerHTML = "";
    b.appendChild(el("p", { text: t("predict_q", { name: inst.name, kg: nf(inst.massKg, 1) }) }));
    [["yes", true], ["no", false]].forEach(function (p) {
      var bt = el("button", { type: "button", "class": p[1] ? "" : "no", text: t(p[0]) });
      bt.addEventListener("click", function () {
        var right = p[1] === res.closes; S.total++; if (right) S.right++;
        st.inst = after; pending = false; render();
        var msg;
        if (res.closes) msg = t("p_after_ok", { m: nf(res.dvAvailMs - res.dvRequiredMs, 1) });
        else if (res.wetKg > res.capacityKg) msg = t("p_after_mass", { m: nf(res.wetKg - res.capacityKg) });
        else msg = t("p_after_bad", { m: nf(res.dvRequiredMs - res.dvAvailMs, 1) });
        b.className = "banner " + (right ? "good" : "bad"); b.hidden = false; b.innerHTML = "";
        b.appendChild(el("p", { text: (right ? t("p_right") : t("p_wrong")) + " " + msg }));
        clearTimeout(toggleInstrument.t); toggleInstrument.t = setTimeout(function () { b.hidden = true; }, 5000);
      });
      b.appendChild(bt);
    });
    renderScore();
  }
  function renderScore() { $("#score").textContent = S.total ? nf(S.right) + " / " + nf(S.total) : "—"; }

  // ---------- hologram ----------
  var SLOTS = A.INSTRUMENTS.map(function (_, i) { return 215 + i * 44; });
  var lastShown = {};
  function renderHolo(res) {
    var gi = $("#g-inst"), gl = $("#g-labels"); gi.innerHTML = ""; gl.innerHTML = "";
    var present = [];
    A.INSTRUMENTS.forEach(function (it, i) { if (st.inst.indexOf(it.id) >= 0) present.push({ it: it, i: i }); });
    present.forEach(function (p, n) {
      var cx = SLOTS[p.i], h = Math.min(52, 14 + p.it.massKg * 1.6), top = 210 - h, ly = 150 - (present.length - 1 - n) * 22;
      var fresh = !lastShown[p.it.id];
      var box = sv("rect", { "class": "ibox", x: cx - 15, y: top, width: 30, height: h });
      if (!fresh) box.style.animation = "none";
      gi.appendChild(box);
      if (fresh && !RM) { var sp = sv("path", { "class": "spark", d: "M" + (cx - 10) + " 210 l-6 -5 M" + (cx + 10) + " 210 l6 -5 M" + cx + " 210 v-9", style: "transform-origin:" + cx + "px 210px" }); gi.appendChild(sp); }
      var ld = sv("path", { "class": "lead", pathLength: "1", d: "M" + cx + " " + top + " V" + ly + " H584" });
      if (!fresh) ld.style.animation = "none", ld.style.strokeDashoffset = "0";
      gl.appendChild(ld);
      var g = sv("g", { "class": "lbl", tabindex: "0", role: "button", transform: "translate(590 " + (ly + 4) + ")", "aria-label": p.it.name });
      if (!fresh) g.style.animation = "none";
      var tt = sv("text", {}, p.it.name.toUpperCase() + "  " + nf(p.it.massKg, 1) + " " + t("kg") + "  ");
      var kk = sv("tspan", { "class": "kk", style: "fill:#9A755E" }, "[" + t("k_" + p.it.prov.kind) + "]"); tt.appendChild(kk); g.appendChild(tt);
      g.addEventListener("click", function () { openDrawer(p.it.id); });
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") openDrawer(p.it.id); });
      gl.appendChild(g);
    });
    lastShown = {}; st.inst.forEach(function (id) { lastShown[id] = 1; });
    // propellant fill
    var lvl = Math.max(0, Math.min(1, st.load / 15000)), r = 36, hh = 2 * r * lvl;
    [["#fill1", 282], ["#fill2", 282]].forEach(function (f) { var e = $(f[0]); e.setAttribute("y", f[1] + r - hh); e.setAttribute("height", hh); });
    $("#t-fill").textContent = A.PROPELLANTS.filter(function (x) { return x.id === st.propellant; })[0].name.toUpperCase() + " · " + nf(st.load) + " " + t("kg") + " · " + nf(Math.round(lvl * 100)) + "% " + t("fill");
  }

  // ---------- dials ----------
  function buildDial(svg, ticks, redFrom) {
    svg.innerHTML = "";
    svg.appendChild(sv("path", { d: "M20 90 A60 60 0 0 1 140 90", fill: "none", stroke: "#4B2515", "stroke-width": 10 }));
    svg.appendChild(sv("path", { d: "M20 90 A60 60 0 0 1 " + pt(redFrom).x + " " + pt(redFrom).y, fill: "none", stroke: "#FD4E54", "stroke-width": 10, opacity: .8 }));
    svg.appendChild(sv("path", { d: "M" + pt(redFrom).x + " " + pt(redFrom).y + " A60 60 0 0 1 140 90", fill: "none", stroke: "#53CBB8", "stroke-width": 10, opacity: .75 }));
    ticks.forEach(function (f) { var a = pt(f.f, 52), b = pt(f.f, 68); svg.appendChild(sv("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: "#DBA671", "stroke-width": 1 })); var c = pt(f.f, 78); svg.appendChild(sv("text", { x: c.x, y: c.y + 3, "text-anchor": "middle", "font-size": 8, fill: "#9A755E", "font-family": "IBM Plex Mono,monospace" }, f.l)); });
    var n = sv("g", { "class": "needle" }); n.appendChild(sv("line", { x1: 80, y1: 90, x2: 80, y2: 40, stroke: "#e9dcc4", "stroke-width": 2, "stroke-linecap": "round" }));
    svg.appendChild(n); svg.appendChild(sv("circle", { cx: 80, cy: 90, r: 5, fill: "#DBA671" }));
    svg._needle = n;
  }
  function pt(f, r) { var a = Math.PI * (1 - f), R = r || 60; return { x: +(80 + R * Math.cos(a)).toFixed(1), y: +(90 - R * Math.sin(a)).toFixed(1) }; }
  function setNeedle(svg, f) { var c = Math.max(0, Math.min(1, f)); svg._needle.style.transform = "rotate(" + (-90 + c * 180) + "deg)"; }

  // ---------- verdict, tag, ledger, report ----------
  function fixSuggestion(res) {
    var base = design();
    // 1) lightest single instrument whose removal closes the design
    var cands = st.inst.map(function (id) { return find(A.INSTRUMENTS, id); })
      .filter(function (it) { return A.evaluate(design({ inst: st.inst.filter(function (x) { return x !== it.id; }) })).closes; })
      .sort(function (a, b) { return a.massKg - b.massKg; });
    if (cands.length) return t("tag_fix_remove", { name: cands[0].name, kg: nf(cands[0].massKg, 1) });
    // 2) a bigger launcher, if the failure is capacity
    if (res.wetKg > res.capacityKg) {
      var bigger = A.LAUNCHERS.filter(function (l) { return l.leoKg >= res.wetKg; }).sort(function (a, b) { return a.leoKg - b.leoKg; })[0];
      if (bigger && A.evaluate({ launcher: bigger.id, target: base.target, propellant: base.propellant, busDryKg: base.busDryKg, propellantKg: base.propellantKg, instruments: base.instruments }).closes)
        return t("tag_fix_launcher", { name: bigger.name, kg: nf(bigger.leoKg) });
    }
    // 3) cut bus mass by bisection
    var lo = 0, hi = st.bus;
    for (var i = 0; i < 50; i++) { var mid = (lo + hi) / 2; var c = A.evaluate(design()); var d2 = A.evaluate({ launcher: base.launcher, target: base.target, propellant: base.propellant, busDryKg: st.bus - mid, propellantKg: base.propellantKg, instruments: base.instruments }); if (d2.closes) hi = mid; else lo = mid; }
    return t("tag_fix_bus", { kg: nf(Math.ceil(hi / 10) * 10) });
  }
  var lastVerdict = null;
  function renderVerdict(res) {
    var dvM = res.dvAvailMs - res.dvRequiredMs;
    setNeedle($("#dial-dv"), 0.5 + Math.max(-1, Math.min(1, res.dvMarginPct / 10)) * 0.5);
    setNeedle($("#dial-mass"), res.massMarginPct < 0 ? 0 : res.massMarginPct / 100);
    $("#v-dv").textContent = sgn(dvM, 1) + " " + t("ms") + " (" + sgn(res.dvMarginPct, 2) + "%)";
    $("#v-mass").textContent = sgn(res.massMarginPct, 1) + "%";
    var key = res.closes ? "closes" : "fails";
    if (lastVerdict !== key) { $("#stamp").innerHTML = ""; $("#stamp").appendChild(el("span", { "class": res.closes ? "ok" : "bad", text: t(key) })); lastVerdict = key; }
    else $("#stamp span").textContent = t(key);
    $("#tag-text").textContent = res.closes ? t("tag_ok", { kg: nf(A.spareInstrumentKg(design()), 1) }) : fixSuggestion(res);
    var none = st.inst.length === 0; var sw = $("#sw-remove"); sw.disabled = none; sw.classList.toggle("on", false);
    $("#sw-label").textContent = none ? t("remove_none") : t("remove");
  }
  function row(label, val, cls, badge) { var tr = el("tr"); tr.appendChild(el("td", { text: label })); var td = el("td", { "class": cls || "", text: val }); if (badge) td.appendChild(badge); tr.appendChild(td); return tr; }
  function renderLedger(res) {
    var L = find(A.LAUNCHERS, st.launcher), T = find(A.TARGETS, st.target), P = find(A.PROPELLANTS, st.propellant);
    var tb = $("#tbl-ledger"); tb.innerHTML = "";
    tb.appendChild(row(t("row_wet"), nf(res.wetKg, 0) + " " + t("kg"), res.wetKg > res.capacityKg ? "bad" : ""));
    tb.appendChild(row(t("row_cap") + " · " + L.name, nf(res.capacityKg) + " " + t("kg"), "", kindBadge(L.prov, L.id)));
    tb.appendChild(row(t("row_dv") + " · Isp " + P.isp + " s", nf(res.dvAvailMs, 0) + " " + t("ms"), res.dvAvailMs < res.dvRequiredMs ? "bad" : "good", kindBadge(P.prov, P.id)));
    tb.appendChild(row(t("row_req") + " · " + T.name, nf(res.dvRequiredMs) + " " + t("ms"), "", kindBadge(T.prov, T.id)));
    var cost = A.costM(design());
    tb.appendChild(row(t("row_cost"), nf(cost) + " " + t("unit_musd"), cost > A.budgetM ? "bad" : "", kindBadge(A.SIM_PROV, "sim")));
    tb.appendChild(row(t("row_budget"), nf(A.budgetM) + " " + t("unit_musd")));
    $("#budget-note").textContent = cost > A.budgetM ? t("over_budget") : t("in_budget");
  }
  function renderReport() {
    var tb = $("#tbl-report"); tb.innerHTML = "";
    var h = el("tr"); ["", "rep_you", "rep_real"].forEach(function (k) { h.appendChild(el("th", { text: k ? t(k) : "" })); }); tb.appendChild(h);
    var mine = st.inst.reduce(function (s, id) { return s + find(A.INSTRUMENTS, id).massKg; }, 0), P = A.PERSEVERANCE, res = A.evaluate(design());
    function r3(a, b, bb) { var tr = el("tr"); tr.appendChild(el("td", { text: a })); tr.appendChild(el("td", { text: b })); var td = el("td", { text: bb[0] }); if (bb[1]) td.appendChild(kindBadge(bb[1], "perseverance")); tr.appendChild(td); tb.appendChild(tr); }
    r3(t("rep_launcher"), find(A.LAUNCHERS, st.launcher).name, [P.launcher, P.roverKg.prov]);
    r3(t("rep_instr"), nf(mine, 1) + " " + t("kg"), ["59 " + t("kg") + " (JPL) / 51.8 " + t("kg") + " (Σ)", P.instrumentsKg.prov]);
    r3(t("rep_count"), nf(st.inst.length), ["7", null]);
    r3(t("rep_wet"), nf(res.wetKg, 0) + " " + t("kg"), [t("rep_na"), null]);
    r3(t("rep_power"), t("rep_nm"), ["MMRTG " + P.mmrtgW.v + " W", P.mmrtgW.prov]);
  }

  // ---------- receipts drawer ----------
  function openDrawer(focusId) {
    var body = $("#dr-body"); body.innerHTML = "";
    var all = [].concat(A.LAUNCHERS, A.INSTRUMENTS, A.PROPELLANTS, A.TARGETS)
      .map(function (x) { return { id: x.id, name: x.name, prov: x.prov, val: x.leoKg != null ? nf(x.leoKg) + " kg to LEO" : x.massKg != null ? nf(x.massKg, 3) + " kg" : x.isp != null ? "Isp " + x.isp + " s" : nf(x.dvMs) + " m/s" }; });
    all.push({ id: "sim", name: "Cost and budget", prov: A.SIM_PROV, val: "game balance" });
    all.push({ id: "perseverance", name: "Perseverance reference", prov: A.PERSEVERANCE.roverKg.prov, val: "1,025 kg rover · 59 kg instruments · MMRTG 110 W" });
    all.forEach(function (x) {
      var c = el("div", { "class": "rcp" + (x.id === focusId ? " hl" : "") });
      var h = el("h4"); h.appendChild(el("span", { text: x.name + " · " + x.val })); h.appendChild(el("span", { "class": "k k-" + x.prov.kind, text: t("k_" + x.prov.kind) })); c.appendChild(h);
      c.appendChild(el("p", { text: t("dataset") + ": " + x.prov.dataset }));
      if (x.prov.retrieved) c.appendChild(el("p", { text: t("retrieved") + ": " + x.prov.retrieved }));
      if (x.prov.note) c.appendChild(el("p", { text: t("note") + ": " + x.prov.note }));
      if (x.prov.url) { var a = el("a", { href: x.prov.url, target: "_blank", rel: "noopener", text: t("open_src") }); var p = el("p"); p.appendChild(a); c.appendChild(p); }
      body.appendChild(c);
      if (x.id === focusId) setTimeout(function () { c.scrollIntoView({ block: "center" }); }, 460);
    });
    var lg = $("#dr-legend"); lg.innerHTML = "";
    ["nasa", "derived", "textbook", "unverified", "sim"].forEach(function (k) { lg.appendChild(el("div", { text: t("k_" + k) + " — " + t("k_" + k + "_d") })); });
    var d = $("#drawer"); d.classList.add("open"); d.setAttribute("aria-hidden", "false"); $("#dr-close").focus();
  }
  function closeDrawer() { var d = $("#drawer"); d.classList.remove("open"); d.setAttribute("aria-hidden", "true"); }

  // ---------- fly overlay ----------
  var raf = 0;
  function fly() {
    var res = A.evaluate(design()), ov = $("#fly"), cv = $("#fly-cv"), tx = $("#fly-text");
    var capOver = res.wetKg > res.capacityKg;
    var msg = res.closes ? t("fly_ok", { m: nf(res.dvAvailMs - res.dvRequiredMs, 1) }) : capOver ? t("fly_mass", { m: nf(res.wetKg - res.capacityKg) }) : t("fly_dv", { m: nf(res.dvRequiredMs - res.dvAvailMs, 1) });
    ov.hidden = false; tx.textContent = msg; tx.style.color = res.closes ? "#53CBB8" : "#FD4E54";
    $("#fly-close").focus();
    if (RM) { var x0 = cv.getContext("2d"); cv.width = innerWidth; cv.height = innerHeight; x0.fillStyle = "#0b0604"; x0.fillRect(0, 0, cv.width, cv.height); tx.textContent = msg + " · " + t("fly_skip"); return; }
    var dpr = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    var c = cv.getContext("2d"); c.scale(dpr, dpr); var W = innerWidth, H = innerHeight, t0 = performance.now();
    var parts = [], pieces = null, broke = false, lastP = 0;
    var groundY = H * 0.78, padX = W * 0.5;
    var targetName = find(A.TARGETS, st.target).name;
    function spawn(x, y, n, kind) { for (var i = 0; i < n; i++) parts.push({ x: x + (Math.random() - .5) * 10, y: y, vx: (Math.random() - .5) * (kind === "steam" ? 90 : 30), vy: (kind === "steam" ? -20 : 90) + Math.random() * 120, life: 1, k: kind }); }
    function rocket(x, y, shake, a) { c.save(); c.translate(x + shake, y); c.rotate(a || 0); c.fillStyle = "#e9dcc4"; c.fillRect(-9, -90, 18, 90); c.fillStyle = "#944921"; c.fillRect(-9, -90, 18, 12); c.beginPath(); c.moveTo(-9, -90); c.lineTo(0, -112); c.lineTo(9, -90); c.fill(); c.fillStyle = "#4B2515"; c.fillRect(-12, -14, 24, 14); c.restore(); }
    function bg(top) {
      var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top ? "#0d1117" : "#15212c"); g.addColorStop(.7, top ? "#1a1410" : "#6a3a22"); g.addColorStop(1, "#25130B"); c.fillStyle = g; c.fillRect(0, 0, W, H);
    }
    function frame(now) {
      var s = (now - t0) / 1000; c.clearRect(0, 0, W, H);
      var failing = !res.closes && !capOver, slow = failing ? 0.35 : 1, ss = s * slow;
      if (res.closes && s > 5) { return transfer(s - 5); }
      bg(false);
      c.fillStyle = "#25130B"; c.fillRect(0, groundY, W, H - groundY); c.fillStyle = "#4B2515"; c.fillRect(padX - 50, groundY - 4, 100, 6);
      var y, shake = 0, ang = 0;
      if (capOver) { y = groundY - 4; shake = s > 1 ? Math.sin(s * 60) * Math.min(3, (s - 1) * 2) : 0; if (s > 1) { spawn(padX, groundY, 3, "steam"); spawn(padX, groundY - 2, 3, "flame"); } }
      else { var lift = Math.max(0, ss - 1); y = groundY - 4 - 0.5 * 90 * lift * lift; if (ss > 0.8) { spawn(padX, Math.min(groundY - 2, y), 4, "flame"); if (y > groundY - 120) spawn(padX, groundY, 3, "steam"); } }
      if (failing && !broke && ss > 2.1) { broke = true; var bx = padX, by = y - 40; pieces = [0, 1, 2, 3].map(function (i) { return { x: bx, y: by + (i - 1.5) * 18, vx: (i - 1.5) * 26, vy: -20 + Math.random() * 20, a: 0, va: (Math.random() - .5) * 2, w: 18, h: 22, col: i === 0 ? "#DBA671" : "#e9dcc4" }; }); for (var i = 0; i < 40; i++) parts.push({ x: bx, y: by, vx: (Math.random() - .5) * 160, vy: (Math.random() - .5) * 160, life: 1, k: "foil" }); }
      var dt = Math.min(.05, (now - lastP) / 1000 || .016); lastP = now; var sdt = dt * slow;
      parts = parts.filter(function (p) { return p.life > 0; });
      parts.forEach(function (p) {
        p.x += p.vx * sdt; p.y += p.vy * sdt; p.life -= sdt * (p.k === "foil" ? .25 : p.k === "steam" ? .5 : 1.4);
        var al = Math.max(0, p.life);
        c.fillStyle = p.k === "flame" ? "rgba(255," + (150 + 80 * al | 0) + ",60," + al + ")" : p.k === "steam" ? "rgba(233,220,196," + al * .35 + ")" : "rgba(219,166,113," + al + ")";
        var r = p.k === "steam" ? 10 + (1 - al) * 18 : p.k === "foil" ? 2.5 : 4 + al * 5; c.beginPath(); c.arc(p.x, p.y, r, 0, 7); c.fill();
      });
      if (pieces) {
        pieces.forEach(function (p) { p.x += p.vx * sdt; p.y += p.vy * sdt; p.vy += 10 * sdt; p.a += p.va * sdt; c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.fillStyle = p.col; c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); c.restore(); });
        var bp = pieces[0], lx = bp.x + 70, ly = bp.y - 80; c.strokeStyle = "#DBA671"; c.lineWidth = 1; c.beginPath(); c.moveTo(bp.x + 8, bp.y - 6); c.lineTo(lx, ly); c.lineTo(lx + 230, ly); c.stroke();
        c.fillStyle = "#e9dcc4"; c.font = "500 14px 'IBM Plex Mono',monospace"; c.fillText(msg, lx + 6, ly - 6);
      } else rocket(padX, y, shake, ang);
      if (!res.closes && s > 12) return; // hold final frame; loop stops
      raf = requestAnimationFrame(frame);
    }
    function transfer(u) {
      bg(true); var ex = W * .2, ey = H * .6, tx2 = W * .8, ty = H * .35;
      c.fillStyle = "#2b5b78"; c.beginPath(); c.arc(ex, ey, 34, 0, 7); c.fill(); c.fillStyle = "#53CBB8"; c.globalAlpha = .35; c.beginPath(); c.arc(ex - 8, ey - 6, 14, 0, 7); c.fill(); c.globalAlpha = 1;
      c.fillStyle = st.target === "mars" ? "#944921" : "#9a9a9a"; c.beginPath(); c.arc(tx2, ty, 20, 0, 7); c.fill();
      var cx1 = W * .45, cy1 = H * .12; c.setLineDash([6, 8]); c.strokeStyle = "#7FD6E8"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(ex, ey); c.quadraticCurveTo(cx1, cy1, tx2, ty); c.stroke(); c.setLineDash([]);
      var k = Math.min(1, u / 5), px = (1 - k) * (1 - k) * ex + 2 * (1 - k) * k * cx1 + k * k * tx2, py = (1 - k) * (1 - k) * ey + 2 * (1 - k) * k * cy1 + k * k * ty;
      c.fillStyle = "#DBA671"; c.beginPath(); c.arc(px, py, 5, 0, 7); c.fill();
      c.fillStyle = "#9A755E"; c.font = "500 12px 'IBM Plex Mono',monospace"; c.fillText(t("transfer") + " · " + targetName + " · Δv " + nf(res.dvAvailMs) + " " + t("ms"), W * .2, H * .12);
      if (u < 6) raf = requestAnimationFrame(function (n) { transfer((n - t0) / 1000 - 5); });
    }
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }
  function closeFly() { cancelAnimationFrame(raf); $("#fly").hidden = true; $("#btn-fly").focus(); }

  // ---------- dust motes ----------
  function motes() {
    var cv = $("#dust"), c = cv.getContext("2d"), W, H, P = [];
    function size() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
    size(); addEventListener("resize", size);
    for (var i = 0; i < 70; i++) P.push({ x: Math.random(), y: Math.random(), r: .6 + Math.random() * 1.6, s: .02 + Math.random() * .05, a: .15 + Math.random() * .35 });
    (function loop() {
      c.clearRect(0, 0, W, H);
      P.forEach(function (p) { p.x += p.s * .004; p.y -= p.s * .002; if (p.x > 1) p.x = 0; if (p.y < 0) p.y = 1; c.fillStyle = "rgba(219,166,113," + p.a + ")"; c.beginPath(); c.arc(p.x * W, p.y * H, p.r, 0, 7); c.fill(); });
      requestAnimationFrame(loop);
    })();
  }

  // ---------- render ----------
  function render() {
    var res = A.evaluate(design());
    applyI18n(); renderControls(); renderHolo(res); renderVerdict(res); renderLedger(res); renderReport(); renderScore();
    window.__closure = { state: st, result: res };
  }
  function init() {
    buildDial($("#dial-dv"), [{ f: 0, l: "−10" }, { f: .5, l: "0" }, { f: 1, l: "+10" }], .5);
    buildDial($("#dial-mass"), [{ f: 0, l: "0" }, { f: .5, l: "50" }, { f: 1, l: "100" }], .02);
    document.querySelectorAll(".lang button").forEach(function (b) { b.addEventListener("click", function () { S.lang = b.dataset.lang; try { localStorage.setItem("astraia.closure.lang", S.lang); } catch (e) {} render(); }); });
    $("#r-bus").addEventListener("input", function (e) { st.bus = +e.target.value; render(); });
    $("#r-load").addEventListener("input", function (e) { st.load = +e.target.value; render(); });
    $("#btn-predict").addEventListener("click", function () { S.predict = !S.predict; render(); });
    $("#btn-reset").addEventListener("click", function () { st = JSON.parse(JSON.stringify(DEFAULT)); st.inst = []; st.bus = 3000; st.load = 6000; S.right = S.total = 0; lastShown = {}; render(); });
    $("#btn-demo").addEventListener("click", function () { st = JSON.parse(JSON.stringify(DEFAULT)); lastShown = {}; render(); var b = $("#banner"); b.className = "banner"; b.hidden = false; b.innerHTML = ""; b.appendChild(el("p", { text: t("edge_note") })); clearTimeout(toggleInstrument.t); toggleInstrument.t = setTimeout(function () { b.hidden = true; }, 7000); });
    $("#sw-remove").addEventListener("click", function () { if (!st.inst.length) return; var sw = $("#sw-remove"); sw.classList.add("on"); setTimeout(function () { st.inst = st.inst.slice(0, -1); render(); }, 260); });
    $("#btn-fly").addEventListener("click", fly); $("#fly-close").addEventListener("click", closeFly);
    $("#btn-receipts").addEventListener("click", function () { openDrawer(); });
    $("#dr-close").addEventListener("click", closeDrawer);
    addEventListener("keydown", function (e) { if (e.key === "Escape") { closeDrawer(); if (!$("#fly").hidden) closeFly(); } });
    render(); if (!RM) motes();
  }
  init();
})();
