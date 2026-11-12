/* Runco Growth site script. No dependencies. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     CONTACT SETTINGS: fill these in and every button on the site updates.
     whatsapp:  full number with country code, digits only, e.g. "919876543210"
     instagram: handle without @, e.g. "runcogrowth"
     x:         handle without @, e.g. "runcogrowth"
     Leave a value empty to hide that channel. With all three empty,
     buttons open an email to the address below.
     ------------------------------------------------------------------ */
  var CONTACT = {
    whatsapp: "917023812488",
    instagram: "advertabhay",
    x: "advertabhay",
    email: "abhay@runcogrowth.com"
  };

  /* ------------------------------------------------------------------
     PLACES THIS MONTH: update "taken" as founders sign, and "month" on the 1st.
     month is YEAR-MONTH, e.g. "2026-11". If it doesn't match today's month,
     the site shows only "I take on 4 founders a month" so a stale count is
     never displayed.
     ------------------------------------------------------------------ */
  var SPOTS = { month: "2026-11", total: 4, taken: 2 };

  var DEFAULT_MSG = "Hi Abhay, I'd like my 3 free videos. My business is: ";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else if (k === "class") node.className = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { node.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return node;
  }

  /* ---------- Contact links ---------- */
  function contactLink(message, subject) {
    var msg = message || DEFAULT_MSG;
    if (CONTACT.whatsapp) return "https://wa.me/" + CONTACT.whatsapp.replace(/\D/g, "") + "?text=" + encodeURIComponent(msg);
    if (CONTACT.instagram) return "https://ig.me/m/" + CONTACT.instagram.replace(/^@/, "");
    if (CONTACT.x) return "https://x.com/" + CONTACT.x.replace(/^@/, "");
    return "mailto:" + CONTACT.email + "?subject=" + encodeURIComponent(subject || "3 free videos") + "&body=" + encodeURIComponent(msg);
  }
  function isWeb(url) { return url.indexOf("http") === 0; }
  function wireContact() {
    $all('[data-cta="primary"]').forEach(function (a) {
      var url = contactLink(a.getAttribute("data-msg"));
      a.href = url;
      if (isWeb(url)) { a.target = "_blank"; a.rel = "noopener"; }
    });
    var map = {
      whatsapp: CONTACT.whatsapp && "https://wa.me/" + CONTACT.whatsapp.replace(/\D/g, "") + "?text=" + encodeURIComponent(DEFAULT_MSG),
      instagram: CONTACT.instagram && "https://ig.me/m/" + CONTACT.instagram.replace(/^@/, ""),
      x: CONTACT.x && "https://x.com/" + CONTACT.x.replace(/^@/, "")
    };
    Object.keys(map).forEach(function (key) {
      $all('[data-channel="' + key + '"]').forEach(function (a) {
        if (!map[key]) return;
        a.href = map[key]; a.target = "_blank"; a.hidden = false;
        var h = $("[data-handle]", a);
        if (h) h.textContent = "@" + CONTACT[key].replace(/^@/, "");
      });
    });
  }

  /* ---------- Places this month ---------- */
  function spotsState(now) {
    var ym = now.getFullYear() + "-" + ("0" + (now.getMonth() + 1)).slice(-2);
    if (SPOTS.month !== ym) return null;
    var left = Math.max(0, SPOTS.total - SPOTS.taken);
    var name = now.toLocaleString("en", { month: "long" });
    var next = new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleString("en", { month: "long" });
    return { left: left, taken: Math.min(SPOTS.taken, SPOTS.total), name: name, next: next };
  }
  window.RuncoSpots = spotsState; /* exposed for testing */
  function initSpots() {
    var st = spotsState(new Date()); if (!st) return;
    var short = st.left > 0
      ? st.left + " of " + SPOTS.total + " " + st.name + " places left"
      : st.name + " is full. Ask about " + st.next + ".";
    var long = st.left > 0
      ? "I take on " + SPOTS.total + " founders a month, because I edit every video myself. " + st.left + " of " + st.name + "'s places " + (st.left === 1 ? "is" : "are") + " left."
      : "I take on " + SPOTS.total + " founders a month, because I edit every video myself. " + st.name + " is full, so message me for a " + st.next + " place.";
    $all("[data-spots]").forEach(function (n) { n.textContent = n.getAttribute("data-spots") === "long" ? long : short; });
    $all("[data-spots-dots] i").forEach(function (dot, n) { dot.classList.toggle("taken", n < st.taken); });
  }

  /* ---------- Fixed action bar on phones ---------- */
  function initDock() {
    var dock = $("#dock"); if (!dock) return;
    var first = $("#hero-cta"), last = $("#contact"), quiz = $("#quiz") || $("#plan-send");
    if (!("IntersectionObserver" in window)) { dock.classList.add("show"); return; }
    var seen = { first: !!first, last: false, quiz: false };
    function update() { dock.classList.toggle("show", !seen.first && !seen.last && !seen.quiz); }
    if (first) new IntersectionObserver(function (en) { seen.first = en[0].isIntersecting; update(); }).observe(first);
    if (last) new IntersectionObserver(function (en) { seen.last = en[0].isIntersecting; update(); }, { threshold: 0.2 }).observe(last);
    if (quiz) new IntersectionObserver(function (en) { seen.quiz = en[0].isIntersecting; update(); }, { threshold: 0.2 }).observe(quiz);
    update();
  }

  /* ---------- The work: silent loops that open a player with sound ---------- */
  function initReels() {
    var reels = $all(".reel"); if (!reels.length) return;
    var saveData = navigator.connection && navigator.connection.saveData;
    if (!reduceMotion && !saveData && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var v = $("video", en.target); if (!v) return;
          if (en.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
          else v.pause();
        });
      }, { threshold: 0.3 });
      reels.forEach(function (r) { io.observe(r); });
    }
    var dlg = $("#player"), pv = $("#player-video"), closeBtn = $("#player-close");
    if (!dlg || !pv) return;
    function close() { pv.pause(); pv.removeAttribute("src"); pv.load(); if (dlg.open) dlg.close(); }
    reels.forEach(function (r) {
      r.addEventListener("click", function () {
        pv.src = r.getAttribute("data-full");
        pv.setAttribute("aria-label", r.getAttribute("data-title") + " video");
        if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
        var p = pv.play(); if (p && p.catch) p.catch(function () {});
      });
    });
    closeBtn.addEventListener("click", close);
    dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });
    dlg.addEventListener("close", function () { pv.pause(); });
    dlg.addEventListener("cancel", function () { pv.pause(); pv.removeAttribute("src"); });
  }

  /* ---------- Small motion: counting numbers, light that follows the pointer ---------- */
  function initMotion() {
    if (reduceMotion) return;
    var counts = $all("[data-count]");
    if (counts.length && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          io.unobserve(en.target);
          var node = en.target, to = parseInt(node.getAttribute("data-count"), 10), t0 = null, dur = 900;
          if (to < 2) return;
          function step(ts) {
            if (!t0) t0 = ts;
            var k = Math.min(1, (ts - t0) / dur), eased = 1 - Math.pow(1 - k, 3);
            node.textContent = String(Math.round(to * eased));
            if (k < 1) requestAnimationFrame(step); else node.textContent = String(to);
          }
          node.textContent = "0"; requestAnimationFrame(step);
        });
      }, { threshold: 0.6 });
      counts.forEach(function (c) { io.observe(c); });
    }
    var hero = $(".hero");
    if (hero && window.matchMedia("(pointer: fine)").matches) {
      var raf = null;
      hero.addEventListener("pointermove", function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var r = hero.getBoundingClientRect();
          hero.style.setProperty("--mx", (e.clientX - r.left) + "px");
          hero.style.setProperty("--my", (e.clientY - r.top + 68) + "px");
          hero.classList.add("lit"); raf = null;
        });
      });
      hero.addEventListener("pointerleave", function () { hero.classList.remove("lit"); });
    }
  }

  /* ---------- Authority Score ---------- */
  var QUESTIONS = [
    { key: "Consistency", q: "How often do you post video content?",
      a: ["Rarely or never", "A few times a month", "Every week", "Several times a week"],
      fix: "Pick a pace you can hold for 90 days. Batching your scripts into one weekly session is how busy founders keep it up." },
    { key: "Clarity", q: "Could a stranger tell who you help and how within five seconds of opening your profile?",
      a: ["No", "Only if they read carefully", "Yes, my bio makes it clear", "Yes, my bio and pinned posts both do"],
      fix: "Rewrite your bio as who you help, the result, and your proof. Pin three videos that back it up." },
    { key: "On camera", q: "How often do you appear on camera in your own content?",
      a: ["Never", "Occasionally", "In most posts", "In nearly every post"],
      fix: "People trust people. Get on camera, even if you're reading a script from your phone." },
    { key: "Hooks", q: "How do your videos usually open?",
      a: ["With an intro about me or my company", "I start talking and get to the point eventually", "With the main point", "With a first line I wrote several versions of"],
      fix: "Write the first line last, and write five versions. The first three seconds decide whether the rest gets watched." },
    { key: "Production quality", q: "How does your editing compare with the best-known people in your space?",
      a: ["I don't post video", "Clearly rougher", "About the same", "Better"],
      fix: "Viewers judge your business by your edit. Tight cuts, clean captions and clear sound tell them you run a professional operation." },
    { key: "Proof", q: "How often do you share client results, testimonials or case studies?",
      a: ["Never", "Once or twice a year", "Every month", "Every week"],
      fix: "Turn every client win into a short video. Proof sells harder than any pitch." },
    { key: "Next step", q: "When someone likes your content, is there a clear next step to work with you?",
      a: ["No", "A link that goes to my homepage", "A clear offer or booking link", "A clear offer, and my posts point to it"],
      fix: "Give every viewer one next step. One offer, one link, repeated in your bio and your videos." },
    { key: "Inbound", q: "In the last 90 days, how many enquiries came from people who found you through your content?",
      a: ["None", "One or two", "A few each month", "Some every week"],
      fix: "Enquiries follow trust. Close the gaps above, and ask every new lead where they first saw you." }
  ];
  var TIERS = [
    { min: 80, name: "Authority", line: "People already trust you before the call. The job now is to keep the pace and widen the audience." },
    { min: 55, name: "Credible, not yet known", line: "What you post is solid. Too few of the right people see it often enough to remember you." },
    { min: 30, name: "Inconsistent", line: "There are good signs, but a prospect checking you out today would find gaps where trust should be." },
    { min: 0, name: "Invisible", line: "You may be the best at what you do, but a stranger looking you up can't tell yet." }
  ];
  function scoreQuiz(answers) {
    var sum = answers.reduce(function (t, v) { return t + v; }, 0);
    var score = Math.round(sum / (QUESTIONS.length * 3) * 100);
    var tier = TIERS.filter(function (t) { return score >= t.min; })[0];
    var gaps = answers.map(function (v, n) { return { v: v, n: n }; })
      .filter(function (g) { return g.v < 3; })
      .sort(function (a, b) { return a.v - b.v || a.n - b.n; })
      .slice(0, 3).map(function (g) { return QUESTIONS[g.n]; });
    return { score: score, tier: tier, gaps: gaps };
  }
  window.RuncoScore = scoreQuiz; /* exposed for testing */

  function initQuiz() {
    var root = $("#quiz"); if (!root) return;
    var answers = [], step = 0;

    function renderQuestion() {
      var item = QUESTIONS[step];
      root.textContent = "";
      var prog = el("i"); prog.style.width = (step / QUESTIONS.length * 100) + "%";
      root.appendChild(el("div", { class: "quiz-meta" }, [
        el("span", { text: "Question " + (step + 1) + " of " + QUESTIONS.length }),
        el("span", { class: "quiz-progress" }, [prog])
      ]));
      root.appendChild(el("p", { class: "quiz-q", id: "quiz-q", text: item.q }));
      var opts = el("div", { class: "quiz-opts", role: "group", "aria-labelledby": "quiz-q" });
      item.a.forEach(function (label, v) {
        var b = el("button", { class: "quiz-opt", type: "button", id: "quiz-opt-" + v, "aria-pressed": answers[step] === v ? "true" : "false", text: label });
        b.addEventListener("click", function () {
          answers[step] = v;
          b.setAttribute("aria-pressed", "true");
          setTimeout(function () {
            if (step < QUESTIONS.length - 1) { step++; renderQuestion(); focusFirst(); }
            else { renderResult(); }
          }, reduceMotion ? 0 : 140);
        });
        opts.appendChild(b);
      });
      root.appendChild(opts);
      var back = el("button", { class: "quiz-back", type: "button", id: "quiz-back", text: "Back" });
      back.hidden = step === 0;
      back.addEventListener("click", function () { step--; renderQuestion(); focusFirst(); });
      root.appendChild(back);
    }
    function focusFirst() { var f = $(".quiz-opt", root); if (f) f.focus({ preventScroll: true }); }

    function renderResult() {
      var r = scoreQuiz(answers);
      var gapNames = r.gaps.map(function (g) { return g.key.toLowerCase(); });
      var summary = "My Authority Score is " + r.score + "/100 (" + r.tier.name + ")." +
        (gapNames.length ? " Biggest gaps: " + gapNames.join(", ") + "." : "");
      var msg = "Hi Abhay, " + summary.charAt(0).toLowerCase() + summary.slice(1) + " I'd like my 3 free videos. My business is: ";

      root.textContent = "";
      var num = el("p", { class: "result-num" }, [String(r.score), el("small", { text: " /100" })]);
      root.appendChild(el("div", { class: "result-top" }, [
        num,
        el("div", {}, [el("p", { class: "small muted", text: "Your Authority Score" }), el("p", { class: "result-tier", text: r.tier.name })])
      ]));
      var fill = el("i"); fill.style.width = r.score + "%";
      root.appendChild(el("div", { class: "result-meter", role: "img", "aria-label": "Score " + r.score + " out of 100" }, [fill]));
      root.appendChild(el("p", { text: r.tier.line }));

      if (r.gaps.length) {
        root.appendChild(el("h3", { text: r.gaps.length === 1 ? "Your biggest gap" : "Your " + r.gaps.length + " biggest gaps" }));
        var list = el("ol", { class: "gaps" });
        r.gaps.forEach(function (g) { list.appendChild(el("li", {}, [el("strong", { text: g.key }), el("span", { text: g.fix })])); });
        root.appendChild(list);
      }

      var url = contactLink(msg, "My Authority Score: " + r.score + "/100");
      var send = el("a", { class: "btn", id: "quiz-send", href: url, text: "Send my score and get 3 free videos" });
      if (isWeb(url)) { send.target = "_blank"; send.rel = "noopener"; }
      var copy = el("button", { class: "btn btn-quiet", type: "button", id: "quiz-copy", text: "Copy my result" });
      copy.addEventListener("click", function () { copyText(summary, copy, "Copy my result"); });
      root.appendChild(el("div", { class: "cta-row" }, [send, copy]));
      root.appendChild(el("p", { class: "small muted", text: "I'll plan your three free videos around these gaps. You can also reach me at " + CONTACT.email + "." }));
      var again = el("button", { class: "quiz-back", type: "button", id: "quiz-again", text: "Take it again" });
      again.addEventListener("click", function () { answers = []; step = 0; renderQuestion(); focusFirst(); });
      root.appendChild(again);
      num.tabIndex = -1; num.focus({ preventScroll: true });
      if (root.getBoundingClientRect().top < 0) root.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
    }
    renderQuestion();
  }

  function copyText(text, button, label) {
    function done(ok) {
      button.textContent = ok ? "Copied" : "Select and copy";
      button.classList.toggle("done", ok);
      setTimeout(function () { button.textContent = label; button.classList.remove("done"); }, 1600);
    }
    try { navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); }); }
    catch (e) { done(false); }
  }

  /* ---------- 30-day video plan ---------- */
  function initPlan() {
    var root = $("#plan"); if (!root) return;
    var ids = ["topic", "audience", "result", "q1", "q2", "q3"], inputs = {};
    ids.forEach(function (k) { inputs[k] = $("#plan-" + k); });
    var defaults = { topic: "commercial property", audience: "first-time investors", result: "a first profitable deal" };
    var rows = $all("[data-template]", root), err = $("#plan-error"), go = $("#plan-go"), copy = $("#plan-copy");
    function val(k) { return (inputs[k].value || "").trim(); }
    function values() { var v = {}; Object.keys(defaults).forEach(function (k) { v[k] = val(k) || defaults[k]; }); return v; }
    function render() {
      var v = values();
      rows.forEach(function (p) {
        var q = p.getAttribute("data-q"), question = q ? val("q" + q) : "";
        p.textContent = "";
        if (question) {
          p.appendChild(el("span", { class: "blank", text: "\u201C" + question.replace(/[\u201C\u201D"]/g, "") + "\u201D" }));
          p.appendChild(document.createTextNode(" Here's my honest answer."));
          return;
        }
        p.getAttribute("data-template").split(/(\{\w+\})/).forEach(function (part) {
          var m = part.match(/^\{(\w+)\}$/);
          if (m) p.appendChild(el("span", { class: "blank", text: v[m[1]] }));
          else if (part) p.appendChild(document.createTextNode(part));
        });
      });
      if (err && !err.hidden && val("topic") && val("audience")) err.hidden = true;
      if (go) go.href = contactLink(message(), "My 30-day video plan");
    }
    function planText() { return rows.map(function (p, n) { return (n + 1) + ". " + p.textContent; }).join("\n"); }
    function message() {
      var lines = ["Hi Abhay, here's my 30-day video plan from your site.", "Field: " + (val("topic") || "-"), "I help: " + (val("audience") || "-"), "They want: " + (val("result") || "-")];
      var qs = ["q1", "q2", "q3"].map(val).filter(Boolean);
      if (qs.length) lines.push("Questions they ask: " + qs.join(" / "));
      lines.push("", "Please script and edit my first three for free.");
      return lines.join("\n");
    }
    window.RuncoPlan = { message: message, text: planText }; /* exposed for testing */
    function ready() {
      if (val("topic") && val("audience")) return true;
      err.textContent = "Add your field and who you help first, so the plan is about your business.";
      err.hidden = false; (val("topic") ? inputs.audience : inputs.topic).focus();
      return false;
    }
    if (go) { go.target = "_blank"; go.rel = "noopener"; go.addEventListener("click", function (e) { if (!ready()) e.preventDefault(); }); }
    if (copy) copy.addEventListener("click", function () { if (ready()) copyText(planText(), copy, "Copy my plan"); });
    ids.forEach(function (k) { inputs[k].addEventListener("input", render); });
    render();
  }

  function start() { wireContact(); initSpots(); initDock(); initReels(); initMotion(); initQuiz(); initPlan(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
