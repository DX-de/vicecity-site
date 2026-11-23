(function () {
  "use strict";
  const S = window.SITE || {};
  const server = S.server || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasDiscord = server.discordUrl && server.discordUrl !== "#";
  const connectTarget = server.cfxCode ? `cfx.re/join/${server.cfxCode}` : server.ip || "[IP du serveur]";

  /* ---------- Global config injection ---------- */
  $$("[data-ip]").forEach((el) => (el.textContent = server.ip || "[IP du serveur]"));
  $$("[data-connect-cmd]").forEach((el) => (el.textContent = `connect ${connectTarget}`));
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  function wireDiscord(root = document) {
    $$("[data-discord]", root).forEach((el) => {
      el.href = server.discordUrl || "#";
      if (hasDiscord) { el.target = "_blank"; el.rel = "noopener"; }
      else if (!el.dataset.discordWired) {
        el.dataset.discordWired = "1";
        el.addEventListener("click", (e) => { e.preventDefault(); toast("Le lien Discord sera bientôt disponible !"); });
      }
    });
  }
  wireDiscord();
  if (server.cfxCode) $$("[data-connect]").forEach((el) => { el.href = `fivem://connect/cfx.re/join/${encodeURIComponent(server.cfxCode)}`; el.hidden = false; });

  /* ---------- Header: scrolled state + back to top ---------- */
  const headerEl = $(".site-header");
  const topBtn = $(".back-to-top");
  const onScroll = () => {
    const y = window.scrollY;
    headerEl && headerEl.classList.toggle("scrolled", y > 20);
    topBtn && topBtn.classList.toggle("show", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  topBtn && topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  /* ---------- Mobile nav ---------- */
  const toggle = $(".nav-toggle");
  const links = $(".nav-links");
  if (toggle && links) {
    const setOpen = (open) => {
      links.classList.toggle("open", open);
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      toggle.innerHTML = `<i class="fa-solid ${open ? "fa-xmark" : "fa-bars"}" aria-hidden="true"></i>`;
    };
    toggle.addEventListener("click", () => setOpen(!links.classList.contains("open")));
    document.addEventListener("keydown", (e) => e.key === "Escape" && links.classList.contains("open") && (setOpen(false), toggle.focus()));
    $$("a", links).forEach((a) => a.addEventListener("click", () => setOpen(false)));
    window.addEventListener("resize", () => window.innerWidth > 860 && setOpen(false));
  }

  /* ---------- Toast + copy ---------- */
  function toast(msg) {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2200);
  }
  async function copy(text, okMsg) {
    try { await navigator.clipboard.writeText(text); toast(okMsg); }
    catch { toast("Copie impossible — sélectionnez le texte manuellement"); }
  }
  $$("[data-copy-ip]").forEach((b) => b.addEventListener("click", () => copy(server.ip || "", "IP copiée dans le presse-papiers !")));
  $$("[data-copy-connect]").forEach((b) => b.addEventListener("click", () => copy(`connect ${connectTarget}`, "Commande copiée — collez-la dans la console F8 !")));

  /* ---------- Scroll reveal ---------- */
  function observeReveal(root = document) {
    const els = $$(".reveal:not(.visible)", root);
    if (reduceMotion || !("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("visible")); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });
  }

  /* ---------- Counters ---------- */
  function setCounter(el, value) {
    if (value === null || value === undefined || isNaN(value)) { el.textContent = "—"; return; }
    const target = Number(value);
    if (reduceMotion) { el.textContent = target.toLocaleString("fr-FR"); return; }
    const start = performance.now(), dur = 1500;
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString("fr-FR");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const statEls = $$("[data-stat]").filter((el) => el.dataset.stat !== "players");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      setCounter(e.target, (S.stats || {})[e.target.dataset.stat]);
      io.unobserve(e.target);
    }), { threshold: 0.4 });
    statEls.forEach((el) => io.observe(el));
  } else statEls.forEach((el) => setCounter(el, (S.stats || {})[el.dataset.stat]));

  /* ---------- Server status (FiveM public API, refreshed every 60s) ---------- */
  const statusEls = $$("[data-status]");
  let lastPlayers = null;
  function renderStatus(state, players, max) {
    statusEls.forEach((el) => {
      el.dataset.state = state;
      const label = $(".status-label", el);
      if (label) label.textContent = state === "online" ? "En ligne" : state === "offline" ? "Hors ligne" : "Statut indisponible";
    });
    const maxNum = max ?? server.maxPlayers;
    const maxTxt = maxNum ?? "—";
    $$("[data-players]").forEach((el) => {
      el.innerHTML = state === "online" ? `<strong>${esc(players)}</strong> / ${esc(maxTxt)} joueurs` : state === "offline" ? `0 / ${esc(maxTxt)} joueurs` : "— joueurs";
    });
    $$("[data-players-bar]").forEach((bar) => {
      const pct = state === "online" && maxNum ? Math.min(100, (players / maxNum) * 100) : 0;
      bar.style.width = pct + "%";
      bar.parentElement.hidden = !(state === "online" && maxNum);
    });
    const p = state === "online" ? players : null;
    if (p !== lastPlayers) { $$('[data-stat="players"]').forEach((el) => setCounter(el, p)); lastPlayers = p; }
  }
  async function fetchStatus() {
    if (!server.cfxCode) return renderStatus("unknown");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(`https://servers-frontend.fivem.net/api/servers/single/${encodeURIComponent(server.cfxCode)}`, { signal: ctrl.signal });
      if (res.status === 404) return renderStatus("offline");
      if (!res.ok) throw new Error(res.status);
      const d = (await res.json()).Data || {};
      renderStatus("online", d.clients ?? 0, d.sv_maxclients ?? d.svMaxclients);
    } catch { renderStatus("unknown"); }
    finally { clearTimeout(timer); }
  }
  if (statusEls.length || $('[data-stat="players"]')) {
    fetchStatus();
    if (server.cfxCode) setInterval(() => !document.hidden && fetchStatus(), 60000);
  }

  /* ---------- Generic accordion ---------- */
  function setAcc(btn, open, animate = true) {
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    if ((btn.getAttribute("aria-expanded") === "true") === open) return;
    btn.setAttribute("aria-expanded", String(open));
    if (!animate || reduceMotion) { panel.hidden = !open; panel.style.height = open ? "auto" : "0px"; return; }
    if (!open) {
      panel.style.height = panel.scrollHeight + "px";
      requestAnimationFrame(() => (panel.style.height = "0px"));
      panel.addEventListener("transitionend", () => { if (btn.getAttribute("aria-expanded") === "false") panel.hidden = true; }, { once: true });
    } else {
      panel.hidden = false;
      panel.style.height = "0px";
      requestAnimationFrame(() => (panel.style.height = panel.scrollHeight + "px"));
      panel.addEventListener("transitionend", () => { if (btn.getAttribute("aria-expanded") === "true") panel.style.height = "auto"; }, { once: true });
    }
  }
  function buildAccordion(root, items, prefix, headingLevel) {
    root.innerHTML = items.map((it, i) => `
      <div class="acc-item reveal" data-acc-index="${i}">
        <h${headingLevel} class="acc-heading">
          <button class="acc-trigger" id="${prefix}-t-${i}" aria-expanded="false" aria-controls="${prefix}-p-${i}">
            ${it.icon ? `<i class="fa-solid ${esc(it.icon)} acc-icon" aria-hidden="true"></i>` : ""}
            <span>${esc(it.title)}</span>
            ${it.badge != null ? `<span class="acc-badge">${esc(it.badge)}</span>` : ""}
            <i class="fa-solid fa-chevron-down chev" aria-hidden="true"></i>
          </button>
        </h${headingLevel}>
        <div class="acc-panel" id="${prefix}-p-${i}" role="region" aria-labelledby="${prefix}-t-${i}" hidden>
          <div class="acc-body">${it.html}</div>
        </div>
      </div>`).join("");
    $$(".acc-trigger", root).forEach((btn) => btn.addEventListener("click", () => setAcc(btn, btn.getAttribute("aria-expanded") !== "true")));
    observeReveal(root);
  }

  /* ---------- Rules (search + toggle all) ---------- */
  const rulesRoot = $("[data-rules]");
  if (rulesRoot) {
    const rules = (S.rules || []).filter((r) => r.items && r.items.length);
    const total = rules.reduce((n, r) => n + r.items.length, 0);
    $$("[data-rules-updated]").forEach((el) => (el.textContent = S.rulesUpdated || "—"));
    $$("[data-rules-count]").forEach((el) => (el.textContent = total));
    if (!rules.length) {
      rulesRoot.innerHTML = '<p class="state">Règlement en cours de rédaction.</p>';
      $(".rules-toolbar") && ($(".rules-toolbar").hidden = true);
    } else {
      let n = 0;
      buildAccordion(rulesRoot, rules.map((r) => ({
        title: r.category, icon: r.icon || "fa-book", badge: r.items.length,
        html: `<ol class="rule-list">${r.items.map((it) => `<li data-rule-num="${++n}"><span class="rule-num">${n}.</span><span class="rule-text">${it}</span></li>`).join("")}</ol>`,
      })), "rule", 2);
      $$(".rule-text", rulesRoot).forEach((el) => (el.dataset.html = el.innerHTML));
      const first = $(".acc-trigger", rulesRoot);
      first && setAcc(first, true, false);

      const toggleAll = $("[data-toggle-all]");
      const triggers = () => $$(".acc-item:not([hidden]) .acc-trigger", rulesRoot);
      const syncToggleLabel = () => { if (toggleAll) toggleAll.textContent = triggers().every((b) => b.getAttribute("aria-expanded") === "true") ? "Tout fermer" : "Tout ouvrir"; };
      rulesRoot.addEventListener("click", (e) => e.target.closest(".acc-trigger") && setTimeout(syncToggleLabel));
      toggleAll && toggleAll.addEventListener("click", () => {
        const openAll = toggleAll.textContent === "Tout ouvrir";
        triggers().forEach((b) => setAcc(b, openAll));
        syncToggleLabel();
      });

      const search = $("#rules-search");
      const empty = $("[data-rules-empty]");
      const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
      const highlight = (html, q) => {
        if (!q) return html;
        const div = document.createElement("div"); div.innerHTML = html;
        const walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT);
        const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach((node) => {
          const idx = norm(node.nodeValue).indexOf(q);
          if (idx < 0) return;
          const mark = document.createElement("mark");
          const mid = node.splitText(idx); mid.splitText(q.length);
          mark.textContent = mid.nodeValue; mid.replaceWith(mark);
        });
        return div.innerHTML;
      };
      search && search.addEventListener("input", () => {
        const q = norm(search.value.trim());
        let any = false;
        $$(".acc-item", rulesRoot).forEach((item) => {
          let match = 0;
          $$("li", item).forEach((li) => {
            const txt = $(".rule-text", li);
            const ok = !q || norm(txt.textContent).includes(q) || norm($(".acc-trigger span", item).textContent).includes(q);
            li.hidden = !ok; if (ok) match++;
            txt.innerHTML = highlight(txt.dataset.html, q);
          });
          item.hidden = match === 0;
          if (match) any = true;
          if (q && match) setAcc($(".acc-trigger", item), true, false);
        });
        empty.hidden = any;
        syncToggleLabel();
      });
    }
  }

  /* ---------- FAQ ---------- */
  const faqRoot = $("[data-faq]");
  if (faqRoot) {
    const faq = S.faq || [];
    if (!faq.length) faqRoot.innerHTML = '<p class="state">Aucune question pour le moment.</p>';
    else buildAccordion(faqRoot, faq.map((f) => ({ title: f.q, html: `<p>${esc(f.a)}</p>` })), "faq", 3);
  }

  /* ---------- Jobs ---------- */
  const jobsRoot = $("[data-jobs]");
  if (jobsRoot) {
    const jobs = S.jobs || [];
    jobsRoot.innerHTML = !jobs.length ? '<p class="state">Aucun métier pour le moment.</p>' : jobs.map((j) => `
      <article class="card job reveal">
        <div class="job-head">
          <div class="feature-icon"><i class="fa-solid ${esc(j.icon || "fa-briefcase")}" aria-hidden="true"></i></div>
          ${j.recruiting === true ? '<span class="pill pill-on">Recrute</span>' : j.recruiting === false ? '<span class="pill pill-off">Complet</span>' : ""}
        </div>
        <h3>${esc(j.name)}</h3>
        <p>${esc(j.description)}</p>
      </article>`).join("");
  }

  /* ---------- Team ---------- */
  const teamCard = (m, short) => `
      <article class="card team-card reveal ${short ? "short" : ""}">
        <h3 class="team-name" title="${esc(m.name)}">${esc(m.name)}</h3>
        <img class="avatar" src="${esc(m.image || "img/avatar-placeholder.svg")}" ${/^\d{15,22}$/.test(String(m.discordId || "")) ? `data-discord-id="${esc(m.discordId)}"` : ""} alt="Photo de profil de ${esc(m.name)}, ${esc(m.role)}" width="150" height="150" loading="lazy">
        <span class="role ${/fondateur/i.test(m.role) ? "role-lead" : ""}">${esc(m.role)}${/fondateur/i.test(m.role) ? ' <i class="fa-solid fa-crown" aria-hidden="true"></i>' : ""}</span>
        ${short ? "" : `<p>${esc(m.description)}</p>`}
        ${!short && m.discord ? `<span class="team-discord"><i class="fa-brands fa-discord" aria-hidden="true"></i> ${esc(m.discord)}</span>` : ""}
      </article>`;
  $$("[data-team]").forEach((root) => {
    const mode = root.dataset.team;
    const members = (S.team || []).filter((m) => mode !== "featured" || m.featured);
    if (!members.length) { root.innerHTML = '<p class="state">Aucun membre pour le moment.</p>'; return; }
    if (mode === "grouped") {
      const groups = [];
      members.forEach((m) => {
        const key = m.role.replace(/^co-/i, "").trim();
        let g = groups.find((x) => x.key.toLowerCase() === key.toLowerCase());
        if (!g) groups.push((g = { key, list: [] }));
        g.list.push(m);
      });
      const plural = (k, n) => (n > 1 && !/s$/i.test(k) ? k + "s" : k);
      root.innerHTML = groups.map((g, i) => `
        <section class="team-group" aria-labelledby="tg-${i}">
          <h2 class="team-group-title reveal" id="tg-${i}">${esc(plural(g.key, g.list.length))} <span>${g.list.length}</span></h2>
          <div class="grid grid-3">${g.list.map((m) => teamCard(m, false)).join("")}</div>
        </section>`).join("");
    } else root.innerHTML = members.map((m) => teamCard(m, mode === "featured")).join("");
    observeReveal(root);
    $$("img[data-discord-id]", root).forEach(loadDiscordAvatar);
  });

  /* ---------- Photos de profil Discord (à partir de l'ID) ----------
     Discord ne donne pas l'avatar d'un ID sans bot : on passe par l'API publique japi.rest,
     puis l'image est servie par le CDN officiel de Discord. Résultat mis en cache 6 h. */
  function loadDiscordAvatar(img) {
    const id = img.dataset.discordId;
    const fallback = img.getAttribute("src");
    const KEY = `vc-discord-avatar-${id}`;
    const TTL = 6 * 3600 * 1000;
    const apply = (url) => {
      if (!url) return;
      const probe = new Image();
      probe.onload = () => { img.src = url; img.classList.add("avatar-discord"); };
      probe.onerror = () => { img.src = fallback; };
      probe.src = url;
    };
    try {
      const cached = JSON.parse(localStorage.getItem(KEY) || "null");
      if (cached && Date.now() - cached.t < TTL) return apply(cached.url);
    } catch {}
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    fetch(`https://japi.rest/discord/v1/user/${encodeURIComponent(id)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(({ data }) => {
        let url;
        if (data && data.avatar) {
          const ext = data.avatar.startsWith("a_") ? "gif" : "webp";
          url = `https://cdn.discordapp.com/avatars/${id}/${data.avatar}.${ext}?size=256`;
        } else {
          // pas de photo personnalisée → avatar Discord par défaut
          url = `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(id) >> 22n) % 6n)}.png`;
        }
        try { localStorage.setItem(KEY, JSON.stringify({ url, t: Date.now() })); } catch {}
        apply(url);
      })
      .catch(() => {}) // on garde l'image de secours
      .finally(() => clearTimeout(timer));
  }

  /* ---------- Companies directory (search + category filters) ---------- */
  const compRoot = $("[data-companies]");
  if (compRoot) {
    const cats = S.companyCategories || [];
    const list = S.companies || [];
    const filtersEl = $("[data-company-filters]");
    const countEl = $("[data-company-count]");
    const emptyEl = $("[data-company-empty]");
    const search = $("#company-search");
    let activeCat = "all";
    const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const plural = (n) => `${n} entreprise${n > 1 ? "s" : ""}`;

    if (!list.length) {
      compRoot.innerHTML = '<p class="state">Aucune entreprise pour le moment.</p>';
      $(".toolbar") && ($(".toolbar").hidden = true);
    } else {
      filtersEl.innerHTML = [{ id: "all", name: "Toutes", icon: "fa-border-all" }, ...cats]
        .map((c) => `<button type="button" class="chip" data-cat="${esc(c.id)}" aria-pressed="${c.id === "all"}"><i class="fa-solid ${esc(c.icon)}" aria-hidden="true"></i> ${esc(c.name)}</button>`).join("");
      const card = (c) => `
        <article class="card company reveal" data-search="${esc(norm(c.name + " " + c.description))}">
          <div class="company-head">
            ${c.logo ? `<img class="company-logo" src="${esc(c.logo)}" alt="Logo de ${esc(c.name)}" width="52" height="52" loading="lazy">` : `<span class="company-logo" aria-hidden="true"><i class="fa-solid fa-building"></i></span>`}
            <h3>${esc(c.name)}</h3>
          </div>
          <p>${esc(c.description)}</p>
          <div class="company-meta">
            <span>Employés <strong>${c.employees == null ? "—" : esc(c.employees)}</strong></span>
            ${c.hiring ? '<span class="pill pill-on">Recrute</span>' : '<span class="pill">Complet</span>'}
          </div>
          <div class="company-actions">
            ${c.hiring ? '<a class="btn btn-sm btn-primary" href="postuler.html">Postuler</a>' : ""}
            ${c.discord ? `<a class="btn btn-sm btn-secondary" href="${esc(c.discord)}" target="_blank" rel="noopener"><i class="fa-brands fa-discord" aria-hidden="true"></i> Discord</a>` : '<span class="btn btn-sm btn-ghost" aria-disabled="true">Discord à venir</span>'}
          </div>
        </article>`;
      const known = new Set(cats.map((c) => c.id));
      const groups = [...cats, { id: "_other", name: "Autres", icon: "fa-ellipsis" }]
        .map((cat) => ({ cat, items: list.filter((c) => (cat.id === "_other" ? !known.has(c.category) : c.category === cat.id)) }))
        .filter((g) => g.items.length);
      compRoot.innerHTML = groups.map((g) => `
        <section class="company-cat" data-cat-section="${esc(g.cat.id)}" aria-labelledby="cat-${esc(g.cat.id)}">
          <h2 class="company-cat-title" id="cat-${esc(g.cat.id)}"><i class="fa-solid ${esc(g.cat.icon)}" aria-hidden="true"></i> ${esc(g.cat.name)} <span data-cat-count>${g.items.length}</span></h2>
          <div class="grid grid-3">${g.items.map(card).join("")}</div>
        </section>`).join("");
      observeReveal(compRoot);

      const apply = () => {
        const q = norm(search.value.trim());
        let total = 0;
        $$("[data-cat-section]", compRoot).forEach((sec) => {
          const catOk = activeCat === "all" || sec.dataset.catSection === activeCat;
          let n = 0;
          $$(".company", sec).forEach((el) => {
            const ok = catOk && (!q || el.dataset.search.includes(q));
            el.hidden = !ok; if (ok) { n++; el.classList.add("visible"); }
          });
          sec.hidden = n === 0;
          $("[data-cat-count]", sec).textContent = n;
          total += n;
        });
        countEl.textContent = plural(total);
        emptyEl.hidden = total > 0;
      };
      filtersEl.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-cat]");
        if (!btn) return;
        activeCat = btn.dataset.cat;
        $$("[data-cat]", filtersEl).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        apply();
      });
      search.addEventListener("input", apply);
      apply();
    }
  }

  /* ---------- Streamers ---------- */
  const streamRoot = $("[data-streamers]");
  if (streamRoot) {
    const list = S.streamers || [];
    const icons = { twitch: "fa-brands fa-twitch", youtube: "fa-brands fa-youtube", kick: "fa-solid fa-video" };
    const labels = { twitch: "Twitch", youtube: "YouTube", kick: "Kick" };
    streamRoot.innerHTML = !list.length ? '<p class="state">Aucun streamer partenaire pour le moment.</p>' : list.map((s) => {
      const p = String(s.platform || "").toLowerCase();
      return `
      <article class="card streamer reveal">
        ${s.live ? '<span class="pill pill-live">En direct</span>' : ""}
        <img class="avatar ${s.live ? "live" : ""}" src="${esc(s.image || "img/avatar-placeholder.svg")}" alt="Photo de ${esc(s.name)}" width="110" height="110" loading="lazy">
        <h3>${esc(s.name)}</h3>
        <p class="character">${esc(s.character)}</p>
        ${s.url
          ? `<a class="btn btn-sm btn-secondary" href="${esc(s.url)}" target="_blank" rel="noopener"><i class="${icons[p] || "fa-solid fa-tv"} platform-${esc(p)}" aria-hidden="true"></i> Voir sur ${esc(labels[p] || "la chaîne")}</a>`
          : `<span class="btn btn-sm btn-ghost" aria-disabled="true"><i class="${icons[p] || "fa-solid fa-tv"} platform-${esc(p)}" aria-hidden="true"></i> ${esc(labels[p] || "Chaîne")} — lien à venir</span>`}
      </article>`;
    }).join("");
    observeReveal(streamRoot);
  }

  /* ---------- Patchnotes (frise chronologique) ---------- */
  const patchRoot = $("[data-patchnotes]");
  if (patchRoot) {
    const TYPES = {
      ajout: { label: "Ajouts", one: "Ajout", icon: "fa-plus" },
      amelioration: { label: "Améliorations", one: "Amélioration", icon: "fa-arrow-trend-up" },
      correction: { label: "Corrections", one: "Correction", icon: "fa-wrench" },
      suppression: { label: "Suppressions", one: "Suppression", icon: "fa-minus" },
    };
    // Une version s'affiche si elle a des changements OU un texte (écrit comme sur Discord)
    const versions = (S.patchnotes || [])
      .filter((v) => v && ((v.changes && v.changes.length) || String(v.summary || "").trim()))
      .map((v) => ({ ...v, changes: Array.isArray(v.changes) ? v.changes : [] }));
    const slug = (v) => "v-" + String(v).replace(/[^\w.-]+/g, "").replace(/\./g, "-");
    // Texte du patchnote mis en forme comme sur Discord : une ligne = un paragraphe,
    // une ligne qui commence par un emoji = un titre, **gras** et `code` reconnus
    const EMOJI_START = /^\p{Extended_Pictographic}/u;
    const inlineMd = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>");
    const richText = (t) => {
      let first = true;
      return String(t).split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => {
        const head = EMOJI_START.test(l) && l.length <= 90;
        const cls = head ? (first ? "pd-title" : "pd-head") : "";
        first = false;
        return `<p${cls ? ` class="${cls}"` : ""}>${inlineMd(l)}</p>`;
      }).join("");
    };
    const filtersEl = $("[data-patch-filters]");
    const toggleAll = $("[data-patch-toggle]");
    const emptyEl = $("[data-patch-empty]");

    if (!versions.length) {
      patchRoot.innerHTML = '<p class="state">Aucun patchnote pour le moment.</p>';
      $(".patch-toolbar").hidden = true;
    } else {
      const total = (t) => versions.reduce((n, v) => n + v.changes.filter((c) => c.type === t).length, 0);
      filtersEl.innerHTML = `<button type="button" class="chip" data-type="all" aria-pressed="true"><i class="fa-solid fa-border-all" aria-hidden="true"></i> Tout</button>` +
        Object.entries(TYPES).filter(([t]) => total(t)).map(([t, d]) =>
          `<button type="button" class="chip chip-${t}" data-type="${t}" aria-pressed="false"><i class="fa-solid ${d.icon}" aria-hidden="true"></i> ${d.label} <span class="chip-count">${total(t)}</span></button>`).join("");

      patchRoot.innerHTML = versions.map((v, i) => {
        const id = slug(v.version);
        const counts = Object.keys(TYPES).map((t) => [t, v.changes.filter((c) => c.type === t).length]).filter(([, n]) => n);
        const groups = Object.entries(TYPES).map(([t, d]) => {
          const items = v.changes.filter((c) => c.type === t);
          return items.length ? `<div class="patch-group" data-group="${t}">
              <h3 class="patch-group-title type-${t}"><i class="fa-solid ${d.icon}" aria-hidden="true"></i> ${d.label}</h3>
              <ul>${items.map((c) => `<li class="patch-item type-${t}" data-type="${t}">${esc(c.text)}</li>`).join("")}</ul>
            </div>` : "";
        }).join("");
        const known = new Set(Object.keys(TYPES));
        const other = v.changes.filter((c) => !known.has(c.type));
        return `
        <article class="patch reveal ${i === 0 ? "patch-latest" : ""}" id="${id}" aria-labelledby="${id}-t">
          <span class="patch-dot" aria-hidden="true"></span>
          <div class="card patch-card">
            <button class="patch-head acc-trigger" id="${id}-t" aria-expanded="false" aria-controls="${id}-p">
              <span class="patch-version">${esc(v.version)}</span>
              <span class="patch-title">
                <strong>${esc(v.title)}</strong>
                <small>${esc(v.date)}${i === 0 ? ' · <em class="patch-new">Dernière version</em>' : ""}</small>
              </span>
              <span class="patch-counts" aria-hidden="true">${counts.map(([t, n]) => `<span class="type-${t}" title="${n} ${TYPES[t].label.toLowerCase()}"><i class="fa-solid ${TYPES[t].icon}"></i>${n}</span>`).join("")}</span>
              <i class="fa-solid fa-chevron-down chev" aria-hidden="true"></i>
            </button>
            <div class="acc-panel" id="${id}-p" role="region" aria-labelledby="${id}-t" hidden>
              <div class="patch-body">
                ${String(v.summary || "").trim() ? `<div class="patch-desc">${richText(v.summary)}</div>` : ""}
                ${groups}
                ${other.length ? `<div class="patch-group"><ul>${other.map((c) => `<li class="patch-item">${esc(c.text)}</li>`).join("")}</ul></div>` : ""}
                <div class="patch-actions">
                  <button type="button" class="link-btn patch-link" data-copy-link="${id}"><i class="fa-solid fa-link" aria-hidden="true"></i> Copier le lien de cette version</button>
                  <button type="button" class="btn btn-sm btn-primary patch-publish" data-publish="${i}" hidden><i class="fa-brands fa-discord" aria-hidden="true"></i> Publier sur Discord</button>
                </div>
              </div>
            </div>
          </div>
        </article>`;
      }).join("");
      observeReveal(patchRoot);

      const triggers = () => $$(".patch:not([hidden]) .patch-head", patchRoot);
      const syncToggle = () => { toggleAll.textContent = triggers().every((b) => b.getAttribute("aria-expanded") === "true") ? "Tout fermer" : "Tout ouvrir"; };
      $$(".patch-head", patchRoot).forEach((b) => b.addEventListener("click", () => { setAcc(b, b.getAttribute("aria-expanded") !== "true"); setTimeout(syncToggle); }));
      toggleAll.addEventListener("click", () => { const open = toggleAll.textContent === "Tout ouvrir"; triggers().forEach((b) => setAcc(b, open)); syncToggle(); });

      // ouverture : la version du lien (#v-1-1-0) ou la plus récente
      const target = location.hash && document.getElementById(location.hash.slice(1));
      const openEl = target && target.classList.contains("patch") ? target : $(".patch", patchRoot);
      setAcc($(".patch-head", openEl), true, false);
      if (target && openEl === target) setTimeout(() => { target.classList.add("visible", "patch-flash"); target.scrollIntoView({ block: "start", behavior: "instant" }); }, 50);
      syncToggle();
      window.addEventListener("hashchange", () => {
        const t = location.hash && document.getElementById(location.hash.slice(1));
        if (!t || !t.classList.contains("patch")) return;
        t.hidden = false; t.classList.add("visible");
        setAcc($(".patch-head", t), true, false); syncToggle();
        t.classList.remove("patch-flash"); void t.offsetWidth; t.classList.add("patch-flash");
        t.scrollIntoView({ block: "start", behavior: "instant" });
      });

      patchRoot.addEventListener("click", (e) => {
        const b = e.target.closest("[data-copy-link]");
        if (!b) return;
        const url = `${location.origin}${location.pathname}#${b.dataset.copyLink}`;
        history.replaceState(null, "", `#${b.dataset.copyLink}`);
        copy(url, "Lien de la version copié !");
      });

      filtersEl.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-type]");
        if (!btn) return;
        const type = btn.dataset.type;
        $$("[data-type]", filtersEl).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        let any = false;
        $$(".patch", patchRoot).forEach((p) => {
          let n = 0;
          $$(".patch-group[data-group]", p).forEach((g) => { const ok = type === "all" || g.dataset.group === type; g.hidden = !ok; if (ok) n += $$("li", g).length; });
          if (type === "all") n = Math.max(n, 1); // « Tout » montre aussi les versions sans liste de changements
          p.hidden = n === 0;
          if (n) { any = true; p.classList.add("visible"); if (type !== "all") setAcc($(".patch-head", p), true, false); }
        });
        emptyEl.hidden = any;
        syncToggle();
      });

      /* --- Publication sur Discord via Embed Sender (mode staff) --- */
      const STAFF_KEY = "vc-staff-mode";
      const qs = new URLSearchParams(location.search);
      try {
        if (qs.has("staff")) {
          if (qs.get("staff") === "0") localStorage.removeItem(STAFF_KEY); else localStorage.setItem(STAFF_KEY, "1");
          history.replaceState(null, "", location.pathname + location.hash);
        }
      } catch {}
      let staff = false;
      try { staff = localStorage.getItem(STAFF_KEY) === "1"; } catch {}
      if (staff) {
        $$("[data-publish]", patchRoot).forEach((b) => (b.hidden = false));
        const bar = document.createElement("div");
        bar.className = "staff-bar";
        bar.innerHTML = `<span><i class="fa-solid fa-user-shield" aria-hidden="true"></i> Mode staff activé : bouton « Publier sur Discord » visible sur chaque version.</span>
          <a class="link-btn" href="?staff=0">Désactiver</a>`;
        $(".patch-wrap").prepend(bar);
      }

      const PUB = S.discordPublish || {};
      const EMOJI = { ajout: "✅", amelioration: "⬆️", correction: "🛠️", suppression: "🗑️" };
      const hexColor = (c) => { const n = parseInt(String(c || "#3b82f6").replace("#", ""), 16); return Number.isFinite(n) ? n : 0x3b82f6; };
      const absUrl = (u) => /^https?:\/\//i.test(String(u || "").trim()) ? String(u).trim() : "";

      // Construit le message Discord (format API webhook) d'une version
      function buildPatchPayload(v) {
        const fields = [];
        Object.entries(TYPES).forEach(([t, d]) => {
          const lines = v.changes.filter((c) => c.type === t).map((c) => `• ${c.text}`);
          if (!lines.length) return;
          // une valeur de champ Discord = 1024 caractères max → découpage si besoin
          let chunk = [], part = 0;
          const flush = () => {
            if (!chunk.length) return;
            fields.push({ name: `${EMOJI[t]} ${d.label}${part ? " (suite)" : ""}`, value: chunk.join("\n").slice(0, 1024) });
            chunk = []; part++;
          };
          lines.forEach((l) => { if ((chunk.join("\n") + "\n" + l).length > 1000) flush(); chunk.push(l.slice(0, 1000)); });
          flush();
        });
        const site = absUrl(PUB.siteUrl);
        const link = site ? `${site.replace(/\/?$/, "/")}patchnotes.html#${slug(v.version)}` : "";
        const embed = {
          title: `📋 Patchnote ${v.version} — ${v.title}`.slice(0, 256),
          description: (v.summary || "").slice(0, 4000) || undefined,
          color: hexColor(PUB.color),
          fields: fields.slice(0, 25),
          footer: { text: `${server.name} RP · ${v.date}`.slice(0, 2048) },
        };
        if (link) embed.url = link;
        if (absUrl(PUB.imageUrl)) embed.image = { url: absUrl(PUB.imageUrl) };
        const payload = { embeds: [embed] };
        if (PUB.mention) payload.content = String(PUB.mention);
        if (PUB.username) payload.username = String(PUB.username).slice(0, 80);
        if (absUrl(PUB.avatarUrl)) payload.avatar_url = absUrl(PUB.avatarUrl);
        if (link) payload.components = [{ type: 1, components: [{ type: 2, style: 5, label: "Voir sur le site", url: link, emoji: { name: "🌐" } }] }];
        return payload;
      }

      // Même format que les liens de partage d'Embed Sender : #m= + JSON compressé (deflate-raw) en base64url
      const b64u = (u8) => { let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
      async function packForEmbedSender(obj) {
        const data = new TextEncoder().encode(JSON.stringify(obj));
        if ("CompressionStream" in window) {
          const st = new Blob([data]).stream().pipeThrough(new CompressionStream("deflate-raw"));
          return "z" + b64u(new Uint8Array(await new Response(st).arrayBuffer()));
        }
        return "j" + b64u(data);
      }

      // Aperçu façon Discord dans une fenêtre
      const md = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
      function previewHtml(p) {
        const e = p.embeds[0];
        const col = "#" + e.color.toString(16).padStart(6, "0");
        return `<div class="dc-msg">
          <div class="dc-avatar">${p.avatar_url ? `<img src="${esc(p.avatar_url)}" alt="">` : '<i class="fa-brands fa-discord"></i>'}</div>
          <div class="dc-main">
            <div class="dc-name">${esc(p.username || "Webhook")} <span class="dc-bot">APP</span></div>
            ${p.content ? `<div class="dc-content">${md(p.content)}</div>` : ""}
            <div class="dc-embed" style="--dc:${col}">
              <div class="dc-title">${esc(e.title)}</div>
              ${e.description ? `<div class="dc-desc">${md(e.description)}</div>` : ""}
              ${(e.fields || []).map((f) => `<div class="dc-field"><div class="dc-fname">${esc(f.name)}</div><div class="dc-fval">${md(f.value)}</div></div>`).join("")}
              ${e.image ? `<img class="dc-image" src="${esc(e.image.url)}" alt="">` : ""}
              <div class="dc-footer">${esc(e.footer.text)}</div>
            </div>
            ${p.components ? `<div class="dc-buttons">${p.components[0].components.map((b) => `<span class="dc-btn">${esc((b.emoji && b.emoji.name) || "")} ${esc(b.label)} <i class="fa-solid fa-arrow-up-right-from-square"></i></span>`).join("")}</div>` : ""}
          </div>
        </div>`;
      }

      let dlg;
      async function openPublish(v) {
        const payload = buildPatchPayload(v);
        const hash = "#m=" + (await packForEmbedSender({ messages: [{ data: payload }] }));
        const senderUrl = absUrl(PUB.embedSenderUrl);
        const shareLink = (senderUrl ? senderUrl.split("#")[0] : "embed-sender") + hash;
        if (!dlg) {
          dlg = document.createElement("dialog");
          dlg.className = "publish-dialog";
          document.body.appendChild(dlg);
          dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.closest("[data-close]")) dlg.close(); });
        }
        dlg.innerHTML = `
          <div class="publish-inner">
            <header class="publish-head">
              <h2><i class="fa-brands fa-discord" aria-hidden="true"></i> Publier le patchnote ${esc(v.version)}</h2>
              <button type="button" class="publish-x" data-close aria-label="Fermer"><i class="fa-solid fa-xmark"></i></button>
            </header>
            <p class="muted small">Aperçu du message tel qu'il apparaîtra sur Discord. L'envoi se fait dans <strong>Embed Sender</strong>, avec ton webhook.</p>
            <div class="dc-preview">${previewHtml(payload)}</div>
            <div class="publish-actions">
              ${senderUrl ? `<a class="btn btn-primary" href="${esc(shareLink)}" target="_blank" rel="noopener"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Ouvrir dans Embed Sender</a>` : ""}
              <button type="button" class="btn ${senderUrl ? "btn-secondary" : "btn-primary"}" data-copy-share><i class="fa-solid fa-copy" aria-hidden="true"></i> Copier pour Embed Sender</button>
              <button type="button" class="btn btn-ghost" data-copy-json><i class="fa-solid fa-code" aria-hidden="true"></i> Copier le JSON</button>
            </div>
            <ol class="publish-steps">
              ${senderUrl
                ? "<li>Clique sur <strong>Ouvrir dans Embed Sender</strong> et accepte de charger le message.</li>"
                : "<li>Clique sur <strong>Copier pour Embed Sender</strong>.</li><li>Dans Embed Sender, clique sur <strong>Importer</strong> et colle.</li>"}
              <li>Choisis ton webhook, vérifie l'aperçu, puis <strong>🚀 Envoyer</strong>.</li>
            </ol>
          </div>`;
        $("[data-copy-share]", dlg).addEventListener("click", () => copy(shareLink, "Copié ! Colle-le dans Embed Sender → Importer"));
        $("[data-copy-json]", dlg).addEventListener("click", () => copy(JSON.stringify(payload, null, 2), "JSON du message copié !"));
        dlg.showModal();
      }
      patchRoot.addEventListener("click", (e) => {
        const b = e.target.closest("[data-publish]");
        if (b) openPublish(versions[Number(b.dataset.publish)]);
      });
    }
  }

  /* ---------- Shop ---------- */
  const shopRoot = $("[data-shop]");
  if (shopRoot) {
    const tiers = S.shop || [];
    shopRoot.innerHTML = !tiers.length
      ? '<p class="state">Aucun avantage disponible pour le moment.</p>'
      : tiers.map((t) => `
        <article class="card tier reveal ${t.highlight ? "highlight" : ""}">
          ${t.highlight ? '<span class="badge">Populaire</span>' : ""}
          <h3>${esc(t.tier)}</h3>
          <div class="price">${esc(t.price)}</div>
          <ul>${(t.perks || []).map((p) => `<li><i class="fa-solid fa-check" aria-hidden="true"></i>${esc(p)}</li>`).join("")}</ul>
          <a class="btn ${t.highlight ? "btn-primary" : "btn-secondary"}" data-discord href="#"><i class="fa-brands fa-discord" aria-hidden="true"></i> Demander sur Discord</a>
        </article>`).join("");
    wireDiscord(shopRoot);
  }

  /* ---------- Application form ---------- */
  const form = $("#apply-form");
  if (form) {
    const DRAFT_KEY = "vicecity-apply-draft";
    const MIN = 50;
    const alertBox = $("#form-alert");
    const f = form.elements;
    const store = {
      get() { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); } catch { return null; } },
      set(v) { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(v)); } catch {} },
      clear() { try { localStorage.removeItem(DRAFT_KEY); } catch {} },
    };
    const draftFields = ["nom_rp", "age", "email", "discord", "poste", "experience", "motivation"];

    const showErr = (name, msg) => {
      const input = f[name];
      const err = $(`#err-${name}`);
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg || "";
    };
    const updateCounter = (name) => {
      const el = $(`[data-counter-for="${name}"]`);
      if (!el) return;
      const len = f[name].value.trim().length;
      el.textContent = len < MIN ? `${len} / ${MIN} caractères minimum` : `${len} / ${f[name].maxLength} caractères`;
      el.classList.toggle("ok", len >= MIN);
    };
    const updateHint = () => {
      const hint = $("[data-poste-hint]");
      const txt = (S.postes || {})[f.poste.value];
      hint.hidden = !txt;
      hint.innerHTML = txt ? `<i class="fa-solid fa-circle-info" aria-hidden="true"></i> ${esc(txt)}` : "";
    };

    // restore draft
    const draft = store.get();
    if (draft && draftFields.some((k) => draft[k])) {
      draftFields.forEach((k) => draft[k] != null && (f[k].value = draft[k]));
      $("[data-draft-note]").hidden = false;
    }
    ["experience", "motivation"].forEach(updateCounter);
    updateHint();
    $("[data-clear-draft]").addEventListener("click", () => {
      store.clear(); form.reset();
      ["experience", "motivation"].forEach(updateCounter); updateHint();
      $("[data-draft-note]").hidden = true;
      f.nom_rp.focus();
    });

    let saveT;
    form.addEventListener("input", (e) => {
      const el = e.target;
      if (el.getAttribute("aria-invalid") === "true") showErr(el.name, "");
      if (el.name === "experience" || el.name === "motivation") updateCounter(el.name);
      if (el.name === "poste") updateHint();
      clearTimeout(saveT);
      saveT = setTimeout(() => store.set(Object.fromEntries(draftFields.map((k) => [k, f[k].value]))), 400);
    });
    f.poste.addEventListener("change", updateHint);

    const RULES = {
      nom_rp: () => f.nom_rp.value.trim().length >= 2 || "Indiquez votre nom RP.",
      age: () => { const a = Number(f.age.value); return (Number.isInteger(a) && a >= 13 && a <= 99) || "Indiquez un âge valide."; },
      email: () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim()) || "Adresse email invalide.",
      discord: () => f.discord.value.trim().length >= 2 || "Indiquez votre pseudo Discord.",
      poste: () => !!f.poste.value || "Choisissez un poste.",
      experience: () => f.experience.value.trim().length >= MIN || `Décrivez votre expérience (${MIN} caractères minimum).`,
      motivation: () => f.motivation.value.trim().length >= MIN || `Expliquez votre motivation (${MIN} caractères minimum).`,
      rules_ok: () => f.rules_ok.checked || "Vous devez accepter le règlement.",
    };
    function validate(names = Object.keys(RULES)) {
      let ok = true;
      names.forEach((n) => { const r = RULES[n](); showErr(n, r === true ? "" : r); if (r !== true) ok = false; });
      return ok;
    }

    /* --- Formulaire en 3 étapes --- */
    const steps = $$(".wizard-step", form);
    const STEP_FIELDS = steps.map((s) => $$("input[name], select[name], textarea[name]", s).map((el) => el.name).filter((n) => RULES[n]));
    const prevBtn = $("[data-wizard-prev]", form);
    const nextBtn = $("[data-wizard-next]", form);
    const submitBtn = $('button[type="submit"]', form);
    let step = 0;
    const renderRecap = () => {
      const rows = [["Nom RP", f.nom_rp.value], ["Âge", f.age.value + " ans"], ["Email", f.email.value], ["Discord", f.discord.value], ["Poste", f.poste.value],
        ["Expérience", f.experience.value], ["Motivation", f.motivation.value]];
      $("[data-recap]", form).innerHTML = rows.map(([k, v]) => `<div class="recap-row"><dt>${k}</dt><dd>${esc(String(v).trim())}</dd></div>`).join("") +
        '<button type="button" class="link-btn recap-edit" data-goto="0">Modifier mes informations</button>';
    };
    function goTo(i, focus = true) {
      step = Math.max(0, Math.min(steps.length - 1, i));
      steps.forEach((s, k) => { s.hidden = k !== step; s.classList.toggle("entering", k === step); });
      $$("[data-step-label]").forEach((li, k) => { li.classList.toggle("active", k === step); li.classList.toggle("done", k < step); });
      const bar = $("[data-wizard-bar]"); if (bar) bar.style.width = `${((step + 1) / steps.length) * 100}%`;
      prevBtn.hidden = step === 0;
      nextBtn.hidden = step === steps.length - 1;
      submitBtn.hidden = step !== steps.length - 1;
      if (step === steps.length - 1) renderRecap();
      if (focus) {
        const first = $("input:not([type=hidden]):not([name=_gotcha]), select, textarea", steps[step]);
        $(".wizard-steps").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        first && setTimeout(() => first.focus({ preventScroll: true }), 300);
      }
    }
    nextBtn.addEventListener("click", () => {
      if (!validate(STEP_FIELDS[step])) { const bad = $('[aria-invalid="true"]', steps[step]); bad && bad.focus(); return; }
      goTo(step + 1);
    });
    prevBtn.addEventListener("click", () => goTo(step - 1));
    form.addEventListener("click", (e) => { const g = e.target.closest("[data-goto]"); if (g) goTo(Number(g.dataset.goto)); });
    goTo(0, false);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      alertBox.hidden = true;
      // "Entrée" dans un champ avant la dernière étape = étape suivante
      if (step < steps.length - 1) { nextBtn.click(); return; }
      if (!validate()) {
        const badStep = STEP_FIELDS.findIndex((names) => names.some((n) => RULES[n]() !== true));
        if (badStep >= 0 && badStep !== step) { goTo(badStep); validate(STEP_FIELDS[badStep]); }
        const bad = $('[aria-invalid="true"]', steps[step]); bad && bad.focus(); return;
      }
      if (f._gotcha.value) return; // honeypot anti-spam
      const data = Object.fromEntries(draftFields.map((k) => [k, f[k].value.trim()]));
      const btn = submitBtn;
      const label = btn.innerHTML;
      btn.disabled = true; btn.innerHTML = '<span class="spinner sm" aria-hidden="true"></span> Envoi en cours...';
      try {
        const cfg = S.form || {};
        let res;
        if (cfg.formspreeEndpoint) {
          res = await fetch(cfg.formspreeEndpoint, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ ...data, _subject: `Candidature ${data.poste} — ${data.nom_rp}` }) });
        } else if (cfg.discordWebhook) {
          const cut = (s) => String(s).slice(0, 1000) || "—";
          res = await fetch(cfg.discordWebhook, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: `${server.name} RP — Candidatures`, allowed_mentions: { parse: [] }, embeds: [{
              title: `Nouvelle candidature : ${cut(data.poste)}`, color: 0x3b82f6, timestamp: new Date().toISOString(),
              fields: [
                { name: "Nom RP", value: cut(data.nom_rp), inline: true },
                { name: "Âge", value: cut(data.age), inline: true },
                { name: "Discord", value: cut(data.discord), inline: true },
                { name: "Email", value: cut(data.email) },
                { name: "Expérience RP", value: cut(data.experience) },
                { name: "Motivation", value: cut(data.motivation) },
              ] }] }),
          });
        } else throw new Error("not-configured");
        if (!res.ok) throw new Error(String(res.status));
        store.clear();
        $$("[data-step-label]").forEach((li) => { li.classList.remove("active"); li.classList.add("done"); });
        $(".form-wrap .card").outerHTML = `
          <div class="card form-success" role="status" tabindex="-1">
            <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
            <h2>Merci ${esc(data.nom_rp)} !</h2>
            <p class="muted">Votre candidature pour le poste <strong>${esc(data.poste)}</strong> a bien été envoyée. L'équipe vous répondra sur Discord (<strong>${esc(data.discord)}</strong>) ou par email.</p>
            <div class="btn-group center-group">
              <a class="btn btn-primary" href="index.html"><i class="fa-solid fa-house" aria-hidden="true"></i> Retour à l'accueil</a>
              <a class="btn btn-secondary" data-discord href="#"><i class="fa-brands fa-discord" aria-hidden="true"></i> Discord</a>
            </div>
          </div>`;
        wireDiscord($(".form-wrap"));
        $(".form-success").focus();
      } catch (err) {
        alertBox.textContent = err.message === "not-configured"
          ? "Le formulaire n'est pas encore configuré (Formspree ou webhook Discord manquant dans js/data.js). Contactez-nous sur Discord."
          : "Une erreur est survenue lors de l'envoi. Votre brouillon est conservé : réessayez dans un instant ou contactez-nous sur Discord.";
        alertBox.hidden = false; alertBox.focus();
        btn.disabled = false; btn.innerHTML = label;
      }
    });
  }

  /* ---------- Discord en direct (membres, en ligne, nom, logo) ----------
     Lu depuis l'invitation publique du serveur (aucune clé nécessaire). Mis en cache 5 min. */
  const inviteCode = (String(server.discordUrl || "").match(/(?:discord\.gg|discord(?:app)?\.com\/invite)\/([\w-]+)/i) || [])[1];
  if (inviteCode && ($("[data-discord-live]") || $("[data-discord-section]") || $('[data-stat="discordMembers"]'))) {
    const CACHE_KEY = `vc-discord-${inviteCode}`;
    const applyDiscord = (d) => {
      if (!d || !d.members) return;
      const fmt = (n) => Number(n).toLocaleString("fr-FR");
      $$("[data-discord-online]").forEach((el) => (el.textContent = fmt(d.online)));
      $$("[data-discord-members]").forEach((el) => (el.textContent = fmt(d.members)));
      $$("[data-discord-name]").forEach((el) => (el.textContent = d.name));
      if (d.icon) $$("[data-discord-icon]").forEach((img) => { img.src = d.icon; img.alt = `Logo du serveur Discord ${d.name}`; });
      $$("[data-discord-live], [data-discord-section]").forEach((el) => (el.hidden = false));
      $$("[data-discord-section] .reveal").forEach((el) => el.classList.add("visible"));
      S.stats = S.stats || {};
      if (S.stats.discordMembers == null) { S.stats.discordMembers = d.members; $$('[data-stat="discordMembers"]').forEach((el) => setCounter(el, d.members)); }
    };
    let cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null"); } catch {}
    if (cached && Date.now() - cached.t < 5 * 60 * 1000) applyDiscord(cached);
    else {
      fetch(`https://discord.com/api/v10/invites/${encodeURIComponent(inviteCode)}?with_counts=true`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((j) => {
          const g = j.guild || {};
          const d = {
            t: Date.now(), name: g.name || `${server.name} RP`,
            icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.${g.icon.startsWith("a_") ? "gif" : "png"}?size=128` : "",
            members: j.approximate_member_count || 0, online: j.approximate_presence_count || 0,
          };
          try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(d)); } catch {}
          applyDiscord(d);
        })
        .catch(() => {}); // invitation expirée ou Discord indisponible : on n'affiche simplement pas les chiffres
    }
  }

  /* ---------- Dernier patchnote (bandeau de l'accueil) ---------- */
  const latest = (S.patchnotes || []).find((v) => v && v.version && !String(v.version).startsWith("["));
  $$("[data-latest-patch]").forEach((a) => {
    if (!latest) return;
    a.href = `patchnotes.html#v-${String(latest.version).replace(/[^\w.-]+/g, "").replace(/\./g, "-")}`;
    $("[data-latest-text]", a).textContent = `Mise à jour ${latest.version}${latest.title ? " — " + latest.title : ""}${latest.date ? " · " + latest.date : ""}`;
    a.hidden = false;
  });

  /* ---------- Actualités (accueil) ---------- */
  const newsRoot = $("[data-news]");
  if (newsRoot) {
    const news = (S.news || []).slice(0, 3);
    const tagIcon = (t) => (/mise/i.test(t) ? "fa-screwdriver-wrench" : /év[eé]nement/i.test(t) ? "fa-calendar-day" : /recrut/i.test(t) ? "fa-user-plus" : "fa-bullhorn");
    newsRoot.innerHTML = !news.length ? '<p class="state">Aucune actualité pour le moment.</p>' : news.map((n, i) => `
      <article class="card news reveal ${i === 0 ? "news-latest" : ""}">
        <div class="news-meta">
          <span class="pill pill-tag"><i class="fa-solid ${tagIcon(n.tag || "")}" aria-hidden="true"></i> ${esc(n.tag || "Annonce")}</span>
          <time>${esc(n.date)}</time>
        </div>
        <h3>${esc(n.title)}</h3>
        <p>${esc(n.text)}</p>
        ${i === 0 ? '<span class="news-new">Nouveau</span>' : ""}
      </article>`).join("");
    observeReveal(newsRoot);
  }

  /* ---------- Personnage de l'accueil : suit légèrement la souris ---------- */
  const heroArt = $(".hero-art");
  if (heroArt && !reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const hero = $(".hero");
    let raf = 0;
    hero.addEventListener("mousemove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        heroArt.style.transform = `translate3d(${(-x * 14).toFixed(1)}px, ${(-y * 8).toFixed(1)}px, 0)`;
      });
    });
    hero.addEventListener("mouseleave", () => { heroArt.style.transform = ""; });
  }

  /* ---------- Barre de progression de lecture ---------- */
  const progress = document.createElement("div");
  progress.className = "scroll-progress"; progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* ---------- Transitions entre les pages ---------- */
  if (!reduceMotion) {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || !/\.html$|\/$/.test(url.pathname)) return;
      e.preventDefault();
      document.documentElement.classList.add("page-leave");
      setTimeout(() => { location.href = url.href; }, 220);
    });
    // retour arrière (cache du navigateur) : on réaffiche la page
    window.addEventListener("pageshow", () => document.documentElement.classList.remove("page-leave"));
  }

  /* ---------- Hero parallax ---------- */
  const heroBg = $(".hero-bg");
  if (heroBg && !reduceMotion) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking || window.scrollY > window.innerHeight) return; ticking = true;
      requestAnimationFrame(() => { heroBg.style.transform = `translate3d(0, ${window.scrollY * 0.3}px, 0)`; ticking = false; });
    }, { passive: true });
  }

  /* ---------- Cartes 3D : inclinaison qui suit la souris ---------- */
  const TILT_SEL = ".card:not(.form):not(.form-success):not(.patch-card), .step, .cta, .hero-panel";
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (finePointer && !reduceMotion) {
    let current = null, frame = 0, last = null;
    const release = (card) => {
      card.classList.remove("tilting", "tilt-active");
      card.classList.add("tilt-reset");
      card.style.transform = "";
      setTimeout(() => card.classList.remove("tilt-reset"), 700);
    };
    const update = () => {
      frame = 0;
      if (!current || !last) return;
      const r = current.getBoundingClientRect();
      const px = Math.min(Math.max((last.clientX - r.left) / r.width, 0), 1);
      const py = Math.min(Math.max((last.clientY - r.top) / r.height, 0), 1);
      // grandes cartes = inclinaison plus douce
      const max = r.width > 700 ? 3 : r.width > 450 ? 6 : 12;
      const rx = (0.5 - py) * max * 2;
      const ry = (px - 0.5) * max * 2;
      current.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-6px) scale(1.02)`;
      current.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      current.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    };
    document.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const card = e.target.closest ? e.target.closest(TILT_SEL) : null;
      if (card !== current) {
        if (current) release(current);
        current = card;
        if (card) {
          card.classList.remove("tilt-reset");
          // relance l'animation de brillance à chaque entrée
          card.classList.remove("tilt-active"); void card.offsetWidth;
          card.classList.add("tilt-active", "tilting");
        }
      }
      last = e;
      if (current && !frame) frame = requestAnimationFrame(update);
    }, { passive: true });
    document.addEventListener("mouseout", (e) => { if (!e.relatedTarget && current) { release(current); current = null; } });
    window.addEventListener("blur", () => { if (current) { release(current); current = null; } });
  }

  observeReveal();
})();
