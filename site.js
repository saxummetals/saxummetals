// Header menu
(function(){
  const btn = document.getElementById('menu-btn'), menu = document.getElementById('menu');
  if (!btn || !menu) return;
  const set = open => { menu.hidden = !open; btn.setAttribute('aria-expanded', open); };
  btn.addEventListener('click', e => { e.stopPropagation(); set(menu.hidden); });
  menu.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target)) set(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
})();

// Copy a piece of text, falling back to selecting it
function saxumCopy(text, selectEl, note, done) {
  const fallback = () => {
    if (selectEl.select) { selectEl.focus(); selectEl.select(); }
    else { const r = document.createRange(); r.selectNodeContents(selectEl); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    note.textContent = 'Selected. Press Ctrl+C or ⌘C to copy.';
  };
  try { navigator.clipboard.writeText(text).then(() => { note.textContent = done; }, fallback); }
  catch (e) { fallback(); }
}

// Copy email button
(function(){
  const btn = document.getElementById('copy');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const el = document.getElementById('email');
    saxumCopy(el.textContent.trim(), el, document.getElementById('copy-note'), 'Copied');
  });
})();

// Enquiry tabs and forms
(function(){
  const box = document.querySelector('.enquiry');
  if (!box) return;
  const tabs = { buyer: document.getElementById('tab-buyer'), producer: document.getElementById('tab-producer') };
  const forms = { buyer: document.getElementById('form-buyer'), producer: document.getElementById('form-producer') };
  const sent = document.getElementById('sent');
  const email = () => (document.getElementById('email').textContent || '').trim();

  function show(which) {
    Object.keys(tabs).forEach(k => {
      tabs[k].setAttribute('aria-selected', k === which);
      forms[k].hidden = k !== which;
    });
    sent.hidden = true;
  }
  Object.keys(tabs).forEach(k => tabs[k].addEventListener('click', () => show(k)));

  // Buttons and links elsewhere on the page that pick a form
  document.querySelectorAll('[data-tab]').forEach(a => a.addEventListener('click', () => show(a.dataset.tab)));
  // Links from other pages: #producer or #buyer
  const fromHash = () => {
    const h = location.hash.replace('#', '');
    if (h === 'producer' || h === 'buyer') {
      show(h);
      document.getElementById('contact').scrollIntoView();
    }
  };
  fromHash(); addEventListener('hashchange', fromHash);

  // Every submission uses the same "Field: value" lines, so the private
  // dashboard can turn a pasted email straight into a lead.
  const endpoint = (box.dataset.endpoint || '').trim(); // e.g. a Formspree form URL once the site is on its own domain

  function showMailFallback(subject, body) {
    sent.classList.remove('ok');
    sent.querySelector('b').textContent = 'Your email is ready';
    sent.querySelector('p').hidden = false;
    document.getElementById('sent-body').hidden = false;
    sent.querySelector('.sent-actions #copy-msg').hidden = false;
    document.getElementById('sent-body').value = 'To: ' + email() + '\nSubject: ' + subject + '\n\n' + body;
    sent.querySelector('.sent-to').textContent = email();
    try { location.href = 'mailto:' + email() + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body); } catch (err) {}
  }
  function showDelivered() {
    sent.classList.add('ok');
    sent.querySelector('b').textContent = 'Thank you. Your message has reached us.';
    sent.querySelector('p').hidden = true;
    document.getElementById('sent-body').hidden = true;
    sent.querySelector('.sent-actions #copy-msg').hidden = true;
  }

  Object.values(forms).forEach(form => form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const lines = [], payload = {};
    form.querySelectorAll('input, select, textarea').forEach(f => {
      const v = f.value.trim();
      if (v) { lines.push(f.name + ': ' + v); payload[f.name] = v; }
    });
    const subject = 'Saxum Metals: ' + form.dataset.subject;
    const body = lines.join('\n');
    const btn = form.querySelector('.submit');
    form.hidden = true; sent.hidden = false;
    if (endpoint) {
      btn.disabled = true;
      try {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ _subject: subject, message: body }, payload)) });
        btn.disabled = false;
        if (res.ok) { showDelivered(); return; }
      } catch (err) { btn.disabled = false; }
    }
    showMailFallback(subject, body);
  }));

  document.getElementById('copy-msg').addEventListener('click', () => {
    const t = document.getElementById('sent-body');
    saxumCopy(t.value, t, document.getElementById('copy-msg-note'), 'Message copied');
  });
  document.getElementById('new-msg').addEventListener('click', () => {
    const active = tabs.producer.getAttribute('aria-selected') === 'true' ? 'producer' : 'buyer';
    show(active);
  });
})();

// Dossier stages: journey list and window tabs stay in sync
(function(){
  const panels = document.querySelectorAll('.d-panel');
  if (!panels.length) return;
  function show(stage) {
    panels.forEach(p => { p.hidden = p.id !== 'dp-' + stage; });
    document.querySelectorAll('.d-tabs [data-dstage]').forEach(b => b.setAttribute('aria-selected', b.dataset.dstage === stage));
    document.querySelectorAll('.journey [data-dstage]').forEach(b => b.setAttribute('aria-pressed', b.dataset.dstage === stage));
  }
  document.querySelectorAll('[data-dstage]').forEach(b => b.addEventListener('click', () => show(b.dataset.dstage)));
  // arrow keys move between tabs
  const tabs = [...document.querySelectorAll('.d-tabs [role="tab"]')];
  tabs.forEach((t, i) => t.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    n.focus(); show(n.dataset.dstage);
  }));
})();

// Periodic table: Saxum's four commodities highlighted, with a detail panel
(function(){
  const host = document.getElementById('ptable');
  if (!host) return;
  const SYM = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
  const OURS = {
    Sn: { name: 'Tin', tag: 'The solder that holds electronics together', fact: 'Around half of the world’s tin is used as solder, joining the components on almost every circuit board.', uses: ['Electronics solder', 'Tinplate packaging', 'Chemicals', 'Bronze and other alloys'], link: '#tin', label: 'tin' },
    Ba: { name: 'Barite, from barium', tag: 'The weight behind energy drilling', fact: 'Barite (barium sulphate) is dense, with a specific gravity around 4.2, so most of the world’s supply is used to weight drilling fluids and control pressure in oil and gas wells.', uses: ['Drilling fluids', 'Paints and coatings', 'Plastics and fillers', 'Radiation shielding'], link: '#barite', label: 'barite' },
    Al: { name: 'Bentonite, an aluminium-silicate clay', tag: 'The clay that swells, seals and binds', fact: 'Bentonite swells many times its dry volume in water. It seals boreholes, holds foundry sand together and binds fine iron ore into pellets for steelmaking.', uses: ['Drilling muds', 'Foundry moulding sand', 'Iron ore pelletising', 'Sealing and civil engineering'], link: '#bentonite', label: 'bentonite' },
    Mg: { name: 'Vermiculite, a magnesium silicate', tag: 'The mineral that expands with heat', fact: 'When heated, vermiculite flakes exfoliate into light, fire-resistant granules many times their original size.', uses: ['Horticulture and potting mixes', 'Insulation', 'Fire protection', 'Packaging'], link: '#vermiculite', label: 'vermiculite' }
  };
  function pos(z) {
    if (z === 1) return [1, 1];
    if (z === 2) return [1, 18];
    if (z <= 4) return [2, z - 2];
    if (z <= 10) return [2, z + 8];
    if (z <= 12) return [3, z - 10];
    if (z <= 18) return [3, z];
    if (z <= 36) return [4, z - 18];
    if (z <= 54) return [5, z - 36];
    if (z <= 56) return [6, z - 54];
    if (z <= 71) return [9, z - 54];      // lanthanides row, columns 3-17
    if (z <= 86) return [6, z - 68];
    if (z <= 88) return [7, z - 86];
    if (z <= 103) return [10, z - 86];    // actinides row
    return [7, z - 100];
  }
  const frag = document.createDocumentFragment();
  SYM.forEach((s, i) => {
    const z = i + 1, [r, c] = pos(z), info = OURS[s];
    const cell = document.createElement(info ? 'button' : 'div');
    cell.className = 'pt-cell' + (info ? ' ours' : '');
    cell.style.gridRow = r; cell.style.gridColumn = c;
    const n = document.createElement('small'); n.textContent = z;
    cell.append(n, document.createTextNode(s));
    if (info) {
      cell.type = 'button'; cell.dataset.sym = s;
      cell.setAttribute('aria-label', info.name + ', element ' + z);
      cell.setAttribute("aria-pressed", s === "Sn");
      cell.addEventListener('click', () => show(s));
    } else {
      cell.setAttribute('aria-hidden', 'true');
    }
    frag.append(cell);
  });
  [[6, '57–71'], [7, '89–103']].forEach(([r, t]) => {
    const ph = document.createElement('div'); ph.className = 'pt-cell ph'; ph.setAttribute('aria-hidden', 'true');
    ph.style.gridRow = r; ph.style.gridColumn = 3; ph.textContent = t; frag.append(ph);
  });
  host.append(frag);

  function show(s) {
    const info = OURS[s], z = SYM.indexOf(s) + 1;
    document.getElementById('pd-num').textContent = z;
    document.getElementById('pd-sym').textContent = s;
    document.getElementById('pd-name').textContent = info.name;
    document.getElementById('pd-tag').textContent = info.tag;
    document.getElementById('pd-fact').textContent = info.fact;
    const ul = document.getElementById('pd-uses'); ul.replaceChildren();
    info.uses.forEach(u => { const li = document.createElement('li'); li.textContent = u; ul.append(li); });
    const a = document.getElementById('pd-link'); a.href = info.link; a.textContent = 'See how we source ' + info.label + ' →';
    host.querySelectorAll('.ours').forEach(b => b.setAttribute('aria-pressed', b.dataset.sym === s));
  }
  show("Sn");
})();
