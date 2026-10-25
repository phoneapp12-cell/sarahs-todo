/* Sarah's To-do – a to-do list that's saved on this phone and shared with Shane's My App.
   Only the to-dos in this app are shared (through the small relay below). Nothing else is sent anywhere. */
'use strict';
const { DAY, todayT, todayISO, parseD, isoT, daysLeft, addDays, addMonths, fmt, fmtY, fmtW, fmtLong, PET_CARE, careDue, careNextAfter, careEvery, petDueItems, status } = MH;
const APP_VERSION = '1.15.1';
const STORE_KEY = 'sarahsTodo.data.v1';
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = p => p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const plural = (n, w, ws) => n + ' ' + (n === 1 ? w : (ws || w + 's'));
const jsArg = s => esc(JSON.stringify(s));
const P = {
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/>',
  doc: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3"/>',
  car: '<path d="M3 13l2.2-5.3A2.5 2.5 0 0 1 7.5 6h9a2.5 2.5 0 0 1 2.3 1.7L21 13v4a1 1 0 0 1-1 1h-1.2M3 13v4a1 1 0 0 0 1 1h1.2M3 13h18M9.8 18h4.4"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="16.5" cy="17.5" r="2"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  tooth: '<path d="M7.5 3.5c-2.5 0-4 2-4 4.5 0 2 .8 3.3 1.3 5 .6 2.2.8 7.5 2.7 7.5 1.7 0 1.6-4.5 2.5-5.8.5-.8 1.5-.8 2 0 .9 1.3.8 5.8 2.5 5.8 1.9 0 2.1-5.3 2.7-7.5.5-1.7 1.3-3 1.3-5 0-2.5-1.5-4.5-4-4.5-1.9 0-2.7 1-4.5 1s-2.6-1-4.5-1z"/>',
  stetho: '<path d="M5 3H4v5a4 4 0 0 0 8 0V3h-1M8 12v2a5 5 0 0 0 10 0v-2"/><circle cx="18" cy="10" r="2"/>',
  bill: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  cash: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  coins: '<ellipse cx="9" cy="6.5" rx="6" ry="2.5"/><path d="M3 6.5v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4"/><path d="M15 10.5c3.3 0 6 1.1 6 2.5s-2.7 2.5-6 2.5-6-1.1-6-2.5"/><path d="M9 13v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
  drop: '<path d="M12 2.7l5.7 5.7a8 8 0 1 1-11.3 0z"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  house: '<path d="M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-5h4v5"/>',
  left: '<path d="M15 18l-6-6 6-6"/>',
  pen: '<path d="M12 20h8"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18h2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  repeat: '<path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  right: '<path d="M9 18l6-6-6-6"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
  trash: '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>',
  tv: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 21h8M9 2l3 4 3-4"/>',
  umbrella: '<path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9zM12 12v7a2 2 0 0 0 4 0"/>',
  wifi: '<path d="M5 12.55a11 11 0 0 1 14 0M8.5 16a6 6 0 0 1 7 0M2 8.8a16 16 0 0 1 20 0M12 20h.01"/>',
  school: '<path d="M2.5 9.5L12 5l9.5 4.5L12 14z"/><path d="M6.5 11.5v4.5c1.5 1.5 3.5 2.2 5.5 2.2s4-.7 5.5-2.2v-4.5M21.5 9.5v5"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  zap: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  paw: '<circle cx="6.5" cy="9" r="1.8"/><circle cx="10.2" cy="6.2" r="1.8"/><circle cx="13.8" cy="6.2" r="1.8"/><circle cx="17.5" cy="9" r="1.8"/><path d="M12 11c-2.8 0-5 2.4-5 5.1 0 1.6 1.3 2.7 2.8 2.4.7-.1 1.4-.5 2.2-.5s1.5.4 2.2.5c1.5.3 2.8-.8 2.8-2.4C17 13.4 14.8 11 12 11z"/>',
  pill: '<path d="M10.5 3.5a5 5 0 0 1 7.1 7.1l-7 7a5 5 0 0 1-7.1-7.1l7-7zM8.5 8.5l7 7"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/>',
  syringe: '<path d="M18 2l4 4M17 7l3-3M19 9L8.7 19.3a1 1 0 0 1-1.4 0L4.7 16.7a1 1 0 0 1 0-1.4L15 5zM9 11l4 4M5 19l-3 3M14 4l6 6"/>',
  idcard: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="8.5" cy="11" r="2"/><path d="M6 16a3 3 0 0 1 5 0M13 10h5M13 14h4"/>',
  call: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9z"/>',
  board: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="9.5" y="4" width="5" height="12" rx="1.5"/><rect x="16" y="4" width="5" height="14" rx="1.5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  cart: '<circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/><path d="M3 4h2l2.2 10.5a2 2 0 0 0 2 1.5h7.8a2 2 0 0 0 2-1.6L21 7H6.2"/>'
};

const I = (n, a = '') => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true" ${a}>${P[n] || ''}</svg>`;

/* ---------- data (this phone) ---------- */
let S = null;
const DEFAULT_LISTS = ['Home', 'Shopping'];
// 1.0.4: Home and Shopping are fixed: they can't be renamed or deleted (Shopping goes onto Shane's shopping list).
const isFixedList = l => DEFAULT_LISTS.includes(l);
// 1.1.1: to-dos Shane shares from his app have a blue S
const shaneBadge = t => t && t.by === 'shane' ? '<span class="bbadge" title="From Shane" aria-label="From Shane">S</span>' : '';
const blank = () => ({ version: 1, todos: [], lists: DEFAULT_LISTS.slice(), settings: {} });
function starterCare(kind) {
  const keys = kind === 'dog' ? ['flea', 'worm', 'vacc', 'reg', 'groom', 'check'] : ['flea', 'worm', 'vacc', 'groom', 'check'];
  return keys.map(k => ({ id: 'pc-' + k, kind: k, name: PET_CARE[k].name, every: PET_CARE[k].every, unit: PET_CARE[k].unit, last: '', due: '' }));
}
const DEFAULT_PETS = [
  { id: 'pet-zeus', name: 'Zeus', kind: 'dog', breed: '' },
  { id: 'pet-mindy', name: 'Mindy', kind: 'cat', breed: '' },
  { id: 'pet-silken', name: 'Silken', kind: 'cat', breed: '' }
];
function normPets(arr, st) {
  const units = ['weeks', 'months', 'years', 'none'];
  const out = (Array.isArray(arr) ? arr : []).filter(p => p && typeof p === 'object' && p.name).map(p => ({
    id: String(p.id || uid('pet')),
    name: String(p.name).trim(),
    kind: p.kind === 'cat' ? 'cat' : p.kind === 'other' ? 'other' : 'dog',
    breed: String(p.breed || ''),
    bday: p.bday && parseD(p.bday) != null ? p.bday : '',
    chip: String(p.chip || ''),
    regNo: String(p.regNo || ''),
    council: String(p.council || ''),
    vet: String(p.vet || ''),
    vetPhone: String(p.vetPhone || ''),
    notes: String(p.notes || ''),
    updated: Number(p.updated) || 0,
    care: (Array.isArray(p.care) ? p.care : []).filter(c => c && typeof c === 'object' && c.name).map(c => ({
      id: String(c.id || uid('pc')),
      kind: PET_CARE[c.kind] ? c.kind : 'custom',
      name: String(c.name).trim(),
      every: Math.max(0, Math.round(+c.every || 0)),
      unit: units.includes(c.unit) ? c.unit : 'months',
      last: c.last && parseD(c.last) != null ? c.last : '',
      due: c.due && parseD(c.due) != null ? c.due : '',
      notes: String(c.notes || '')
    })),
    history: (Array.isArray(p.history) ? p.history : []).filter(h => h && typeof h === 'object' && parseD(h.date) != null).map(h => ({
      id: String(h.id || uid('ph')),
      date: h.date,
      what: String(h.what || 'Care'),
      notes: String(h.notes || '')
    })).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  }));
  const del = st && st.petsDel && typeof st.petsDel === 'object' ? st.petsDel : {};
  DEFAULT_PETS.forEach(dp => {
    if (del[dp.id]) return;
    const ex = out.find(p => p.id === dp.id || p.name.toLowerCase() === dp.name.toLowerCase());
    if (!ex) out.push({ id: dp.id, name: dp.name, kind: dp.kind, breed: dp.breed, bday: '', chip: '', regNo: '', council: '', vet: '', vetPhone: '', notes: '', updated: 1, care: starterCare(dp.kind), history: [] });
  });
  return out;
}
function normalise(d) {
  d = d && typeof d === 'object' ? d : {};
  d.todos = (Array.isArray(d.todos) ? d.todos : []).filter(t => t && typeof t === 'object' && t.id && t.title);
  d.lists = (Array.isArray(d.lists) ? d.lists : []).map(String).filter((l, i, a) => l && a.indexOf(l) === i);
  if (!d.lists.length) d.lists = DEFAULT_LISTS.slice();
  const st = d.settings && typeof d.settings === 'object' ? d.settings : {};
  // 1.0.2: the built-in Errands list is gone. Once only: anything on it moves to Home (nothing is deleted).
  if (!st.errandsGone) {
    if (d.todos.some(t => t.list === 'Errands')) { if (!d.lists.includes('Home')) d.lists.unshift('Home'); d.todos.forEach(t => { if (t.list === 'Errands') t.list = 'Home'; }); }
    d.lists = d.lists.filter(l => l !== 'Errands');
    if (!d.lists.length) d.lists = DEFAULT_LISTS.slice();
    st.errandsGone = true;
  }
  d.lists = [...DEFAULT_LISTS, ...d.lists.filter(l => !isFixedList(l))]; // put back Home or Shopping if missing
  d.todos.forEach(t => { if (!t.list) t.list = 'Home'; if (!d.lists.includes(t.list)) d.lists.push(t.list); });
  d.settings = { shared: st.shared && typeof st.shared === 'object' ? st.shared : {}, errandsGone: true, seenRem: Array.isArray(st.seenRem) ? st.seenRem.slice(-200) : [], petsDel: st.petsDel && typeof st.petsDel === 'object' ? st.petsDel : {} };
  d.pets = normPets(d.pets, d.settings);
  // 1.4.0: appointments (doctor, dentist, other) and the car dates Shane's app sends
  d.appts = (Array.isArray(d.appts) ? d.appts : []).filter(a => a && typeof a === 'object' && a.id && a.title && /^\d{4}-\d{2}-\d{2}$/.test(a.date || '')).map(a => ({
    id: String(a.id), type: APPT_TYPES[a.type] ? a.type : 'other', title: String(a.title).slice(0, 80), date: a.date, time: /^\d{2}:\d{2}$/.test(a.time || '') ? a.time : '',
    place: String(a.place || '').slice(0, 160), notes: String(a.notes || '').slice(0, 1000), remind: APPT_REMIND.some(x => x[0] === String(a.remind == null ? '' : a.remind)) ? String(a.remind == null ? '' : a.remind) : '',
    private: a.by === 'shane' ? false : !!a.private, created: Number(a.created) || Date.now(), claim: claimNorm(a.claim), ...(a.by === 'shane' ? { by: 'shane' } : {}) }));
  d.car = d.car && typeof d.car === 'object' && d.car.plate ? d.car : null;
  // 1.9.0: Video ideas, her own list (kept on this phone, never shared)
  d.vids = (Array.isArray(d.vids) ? d.vids : []).filter(v => v && v.id && v.title).map(v => ({ id: String(v.id), title: String(v.title).slice(0, 160), done: !!v.done, created: Number(v.created) || Date.now(), ...(v.sug ? { sug: true } : {}) }));
  d.vidSug = d.vidSug && typeof d.vidSug === 'object' ? { week: Number(d.vidSug.week) || 0, n: Number(d.vidSug.n) || 0 } : { week: 0, n: 0 };
  d.version = 1;
  return d;
}
function load() {
  try { S = normalise(JSON.parse(localStorage.getItem(STORE_KEY) || 'null') || blank()); } catch (e) { S = blank(); }
}
let sharedApplying = false;
async function save() {
  S.updatedAt = new Date().toISOString();
  try { sharedNote(); } catch (e) { }
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { toast('Sorry, that couldn’t be saved on this phone.'); throw e; }
  if (!sharedApplying) sharedSoon();
}
const snap = () => JSON.stringify(S);
const undoTo = s => async () => { const keep = S.settings.shared; S = normalise(JSON.parse(s)); S.settings.shared = keep; await save(); render(); };
/* ---------- small UI helpers ---------- */
function dueTone(d) { return d <= 2 ? 'hot' : d <= 5 ? 'warm' : 'cool'; }
function duePill(d, prefix = '') {
  const w = d < 0 ? (-d) + (d === -1 ? ' day' : ' days') + ' overdue' : d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : d + ' days';
  return `<span class="pill duepill ${dueTone(d)}">${prefix}${w}</span>`;
}
function moneyBadge(amount, label) {
  const under = label ? `<small>${esc(label)}</small>` : '';
  return `<span class="moneybadge"><b>${money(amount)}</b>${under}</span>`;
}
function header(title, sub, extra = '') {
  return `<div class="top"><div style="min-width:0"><h1>${title}</h1>${sub ? `<div class="sub">${sub}</div>` : ''}</div>
  <div class="iconrow">${extra}</div></div>`;
}
const addBtn = (label, fn) => `<button class="iconbtn add" aria-label="${label}" onclick="${fn}">${I('plus')}</button>`;
const empty = (t, s, btnLabel, fn) => `<div class="card empty"><div class="t">${t}</div><div class="s">${s}</div>${btnLabel ? `<button class="btn primary" style="flex:none;padding:12px 22px" onclick="${fn}">${I('plus')} ${btnLabel}</button>` : ''}</div>`;
function go(h) { if (location.hash === h) render(); else location.hash = h; }
let toastTimer;
function toast(msg, btn, fn) {
  const t = $('#toast'); $('#toastmsg').textContent = msg;
  const b = $('#toastbtn'); b.textContent = btn || ''; b.style.display = btn ? '' : 'none';
  b.onclick = () => { t.classList.remove('show'); fn && fn(); };
  t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), btn ? 6000 : 3500);
}
/* ---------- pop-up sheet (forms), closes with Android back ---------- */
let sheetOpen = false, sheetResolve = null, reloadPending = false, sheetSubmit = null;
function openSheet(title, inner, onSubmit, submitLabel = 'Save', extraBtns = '') {
  const el = $('#sheet');
  sheetSubmit = onSubmit;
  el.innerHTML = `<div class="scrim" onclick="closeSheet()"></div><div class="panel" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="grab"></div><h3>${title}</h3>
    <form id="sf" novalidate autocomplete="off">${inner}<div class="formerr" id="ferr"></div>
    <div class="btns">${extraBtns}<button type="button" class="btn" onclick="closeSheet()">${onSubmit ? 'Cancel' : 'Close'}</button>${onSubmit ? `<button type="submit" class="btn primary">${submitLabel}</button>` : ''}</div></form></div>`;
  el.classList.add('show');
  // Show the chosen date in words, whatever date format the phone uses
  el.querySelectorAll('input[type=date]').forEach(i => {
    const h = document.createElement('small'); h.className = 'datehint'; i.after(h);
    const upd = () => { h.textContent = parseD(i.value) ? fmtLong(i.value) : ''; };
    i.addEventListener('input', upd); i.addEventListener('change', upd); upd();
  });
  $('#sf').addEventListener('submit', async e => {
    e.preventDefault();
    if (!sheetSubmit) return;
    const f = e.target, v = {};
    new FormData(f).forEach((val, k) => { v[k] = typeof val === 'string' ? val.trim() : val; });
    const err = await sheetSubmit(v, f);
    if (typeof err === 'string') { const x = $('#ferr'); x.textContent = err; x.style.display = 'block'; return; }
    await closeSheet();
    if (typeof err === 'function') err();
  });
  if (!sheetOpen) { history.pushState({ sheet: true }, '', location.href); sheetOpen = true; }
}
function hideSheet() { const el = $('#sheet'); el.classList.remove('show'); el.innerHTML = ''; sheetOpen = false; sheetSubmit = null; }
function closeSheet() {
  return new Promise(res => {
    if (!sheetOpen) return res();
    hideSheet();
    if (history.state && history.state.sheet) { sheetResolve = res; history.back(); } else res();
  });
}
document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheetOpen) closeSheet(); });
window.addEventListener('popstate', () => {
  if (sheetResolve) { const r = sheetResolve; sheetResolve = null; r(); return; }
  if (sheetOpen) hideSheet();
});
function confirmSheet(title, text, okLabel, fn) {
  openSheet(title, `<p class="muted" style="font-size:0.9375rem;margin:0 0 6px">${text}</p>`, async () => fn(), okLabel);
  const b = $('#sf button[type=submit]'); b.classList.remove('primary'); b.classList.add('danger');
}
const field = (label, input, hint = '') => `<label class="field"><span>${label}</span>${input}${hint ? `<small>${hint}</small>` : ''}</label>`;
const inp = (name, val, attrs = '') => `<input name="${name}" value="${esc(val)}" ${attrs}>`;
const sel = (name, opts, val) => `<select name="${name}">${opts.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
const area = (name, val, ph = '') => `<textarea name="${name}" placeholder="${esc(ph)}">${esc(val)}</textarea>`;


function segHtml(name, opts, val) {
  return `<div class="seg" data-seg="${name}">${opts.map(([v, l]) => `<button type="button" class="${String(v) === String(val) ? 'on' : ''}" data-v="${v}">${l}</button>`).join('')}</div><input type="hidden" name="${name}" value="${val}">`;
}
function wireSeg(name, onPick) {
  const box = document.querySelector(`[data-seg="${name}"]`), hid = document.querySelector(`input[name="${name}"]`);
  box.querySelectorAll('button').forEach(b => b.onclick = () => {
    box.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); hid.value = b.dataset.v;
    if (onPick) onPick(b.dataset.v);
  });
}

/* ================= BRANDS (1.3.0) =================
   When something goes on the Shopping list, the app asks “Which brand?” with real options from New World Onerahi's
   own product search (brand, product, size, shelf price, Clubcard price, gluten-free tag), looked up by the relay,
   plus Any brand, Other… (typed) and Skip. The choice is kept on the item and goes to Shane's list with it.
   Prices are the store's website prices on the day looked up, and may change. Offline: skip, choose later. */
const BRANDS_URL = 'https://due-dates-calendar-relay.phoneapp12.workers.dev/brands';
const brandKey = b => JSON.stringify([b.brand || '', b.product || '', b.size || '', b.price == null ? '' : b.price, b.per || '', b.promo == null ? '' : b.promo, !!b.club, !!b.gf, b.store || '', b.at || '', !!b.any, !!b.other]);
const isShop = t => t && String(t.list || '').toLowerCase() === 'shopping';
const dollars = n => '$' + Number(n).toFixed(2);
function brandPrice(b) {
  if (!b || b.price == null) return '';
  return dollars(b.price) + (b.per ? '/' + b.per : '') + (b.promo != null ? ` (${b.club ? 'Clubcard' : 'special'} ${dollars(b.promo)})` : '');
}
function brandLine(b) {
  if (!b) return '';
  if (b.any) return 'Any brand';
  const what = [b.product, b.size].filter(Boolean).join(' ');
  const pr = brandPrice(b);
  return [b.brand ? 'Brand: ' + b.brand : '', what, pr ? pr + (b.store ? ' at ' + b.store.replace(/ Onerahi$/, '') : '') : ''].filter(Boolean).join(' · ') + (b.gf ? ' · GF' : '');
}
let brandCache = {};
async function brandFetch(q) {
  const k = q.toLowerCase().trim();
  if (brandCache[k] && Date.now() - brandCache[k].at < 6 * 3600e3) return brandCache[k].d;
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 12000);
  try {
    const r = await fetch(BRANDS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: sharedKey(), q: k }), signal: ctl.signal });
    if (!r.ok) throw new Error('http ' + r.status);
    const d = await r.json();
    if (!d || !Array.isArray(d.options)) throw new Error('bad');
    brandCache[k] = { at: Date.now(), d };
    return d;
  } finally { clearTimeout(to); }
}
let brandOpts = [];
function brandSheetHtml(t, d, err) {
  const opts = d && d.options || [];
  brandOpts = opts;
  const cur = t.brand;
  const curIdx = cur && !cur.any && !cur.other ? opts.findIndex(o => o.brand === cur.brand && o.product === cur.product && o.size === cur.size) : -1;
  const radio = (v, on, main, sub, gf) => `<label class="bopt"><input type="radio" name="pick" value="${v}" ${on ? 'checked' : ''}><span><b>${main}${gf ? ' <i class="gf">GF</i>' : ''}</b>${sub ? `<small>${sub}</small>` : ''}</span></label>`;
  return `<p class="muted" style="margin:-4px 2px 10px">For <b>${esc(t.title)}</b>${d && d.store ? ` · from ${esc(d.store)}` : ''}</p>
    <div class="bopts" id="bopts">${err ? `<p class="muted" id="brandsnone" style="margin:0 2px 10px">${esc(err)}</p>` : ''}
    ${opts.map((o, i) => radio(i, i === curIdx, esc(o.brand || o.product), esc([o.brand ? o.product : '', o.size].filter(Boolean).join(' ')) + (brandPrice(o) ? ' · ' + esc(brandPrice(o)) : ''), o.gf)).join('')}
    ${radio('any', cur && cur.any, 'Any brand', 'Whatever’s good or on special')}
    ${radio('other', cur && cur.other, 'Other…', 'Type a brand')}
    <input name="other" id="brandother" placeholder="e.g. Pams, Anchor" maxlength="60" value="${cur && cur.other ? esc(cur.brand) : ''}" style="${cur && cur.other ? '' : 'display:none'}"></div>
    ${opts.length ? `<p class="muted" style="margin:8px 2px 0;font-size:0.78125rem">Prices from New World’s website today. They can change in store.</p>` : ''}`;
}
async function brandAsk(id) {
  const t = S.todos.find(x => x.id === id); if (!t) return;
  if (navigator.onLine === false) { if (sheetOpen) await closeSheet(); toast('No signal. Choose a brand later from the item.'); return; }
  if (sheetOpen) await closeSheet();
  const submit = async v => {
    const p = v.pick;
    if (!p) return 'Please pick one, or tap Skip.';
    const at = todayISO(), s0 = snap();
    if (p === 'any') t.brand = { any: true, at };
    else if (p === 'other') { if (!v.other) return 'Please type the brand.'; t.brand = { brand: v.other.slice(0, 60), other: true, at }; }
    else { const o = brandOpts[+p]; if (!o) return 'Please pick one.'; t.brand = { brand: o.brand, product: o.product, size: o.size, price: o.price, per: o.per, promo: o.promo, club: o.club, gf: o.gf, store: o.store || 'New World Onerahi', at }; }
    await save(); render(); toast('Brand saved' + (t.private ? '.' : '. Shane will see it too.'), 'Undo', undoTo(s0));
  };
  openSheet('Which brand?', `<p class="muted" id="brandload" style="margin:6px 2px 14px">Looking at New World Onerahi…</p>`, submit, 'Save');
  const skip = document.querySelector('#sf .btns .btn:not(.primary)'); if (skip) skip.textContent = 'Skip';
  let d = null, err = '';
  try { d = await brandFetch(t.title); if (!d.options.length) err = 'No matches at New World for that. Pick Any brand or type one.'; }
  catch (e) { err = 'Couldn’t look up brands just now. Pick Any brand or type one.'; }
  const box = document.getElementById('brandload'); if (!box || !sheetOpen) return;
  box.outerHTML = brandSheetHtml(t, d ? Object.assign({}, d, { options: d.options.map(o => Object.assign({ store: d.store }, o)) }) : null, err);
  document.querySelectorAll('#bopts input[name=pick]').forEach(r => r.addEventListener('change', () => { const o = $('#brandother'); o.style.display = r.value === 'other' && r.checked ? '' : 'none'; if (r.value === 'other') o.focus(); }));
}
async function brandClear(id) { const t = S.todos.find(x => x.id === id); if (!t) return; const s0 = snap(); delete t.brand; await save(); await closeSheet(); render(); toast('Brand removed.', 'Undo', undoTo(s0)); }
/* ================= TO-DO (same as My App's To-do tab) ================= */
let todoFilter = 'All';
function pill(d, prefix = '') {
  const w = d < 0 ? (-d) + (d === -1 ? ' day' : ' days') + ' overdue' : d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : d + ' days';
  return `<span class="pill ${status(d)}">${prefix}${w}</span>`;
}
function todoPriority(t) { const p = t && t.priority; return p === 'high' || p === 'low' ? p : 'normal'; }
function todoPriRank(t) { return todoPriority(t) === 'high' ? 0 : todoPriority(t) === 'low' ? 2 : 1; }
function cmpOpenTodo(a, b) {
  return todoPriRank(a) - todoPriRank(b) || (a.due ? parseD(a.due) : 9e15) - (b.due ? parseD(b.due) : 9e15) || (b.created || 0) - (a.created || 0);
}
function todoPriMark(t) { const p = todoPriority(t); return p === 'high' ? ' · High' : p === 'low' ? ' · Low' : ''; }
function syncLine() {
  const n = Object.keys(sharedState().pend).length;
  if (sharedErr === 'offline' && n) return `${plural(n, 'change')} waiting to send. They’ll go when you have signal.`;
  if (n) return 'Sending to Shane…';
  if (sharedLastOk) return 'Shared with Shane · up to date';
  return 'Shared with Shane';
}
function Todo() {
  if (todoFilter !== 'All' && !S.lists.includes(todoFilter)) todoFilter = 'All';
  const vis = S.todos.filter(t => todoFilter === 'All' || t.list === todoFilter);
  const open = vis.filter(t => !t.done).sort(cmpOpenTodo);
  const done = vis.filter(t => t.done).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
  const row = t => `<div class="row ${t.done ? 'done' : ''}" data-id="${esc(t.id)}"><button type="button" class="tick" aria-label="${t.done ? 'Mark not done' : 'Mark complete'}: ${esc(t.title)}" onclick="tick('${t.id}')"><span>${I('check')}</span></button>
    <button class="tapzone" onclick="todoForm('${t.id}')"><div class="tx"><div class="t">${shaneBadge(t)}${esc(t.title)}</div><div class="s">${esc(t.list)}${t.private ? ' · just me' : ''}${t.done ? '' : todoPriMark(t)}${t.due && !t.done ? ' · ' + fmtW(t.due) : ''}${!t.due && !t.done ? ' · no date' : ''}</div>${t.brand ? `<div class="s brandline">${esc(brandLine(t.brand))}</div>` : ''}</div>
    ${t.due && !t.done ? pill(daysLeft(t.due)) : ''}</button>${isShop(t) && !t.done && !t.brand ? `<button type="button" class="brandbtn" onclick="brandAsk('${t.id}')">Brand?</button>` : ''}</div>`;
  const openCount = S.todos.filter(t => !t.done).length;
  const top = header('To-do', openCount ? plural(openCount, 'thing') + ' to do' : 'Nothing to do', layoutBtn() + themeDots() + addBtn('Add a to-do', 'todoForm()'));
  const foot = `${themePicker()}
    ${growOn() ? '' : '<div class="foot"><button type="button" style="color:var(--brand);font-weight:600" onclick="growToggle(true)">Show daily channel tips</button></div>'}
    <div class="foot" id="syncline">${esc(syncLine())}<br>Shared to-dos show on Shane’s list too, and he can tick them off. When you tick a shared one off, Shane gets a little note (just the title). Sarah’s To-do ${APP_VERSION}</div><div class="foot" id="notifyline" style="margin-top:-6px">${notifyLine()}</div>`;
  if (isTrello()) {
    try { if (vidWeekly()) save(); } catch (e) { }
    const vRow = v => `<div class="row ${v.done ? 'done' : ''}">${v.sug ? '' : `<button type="button" class="tick" aria-label="${v.done ? 'Mark not done' : 'Mark done'}: ${esc(v.title)}" onclick="vidTick('${v.id}')"><span>${I('check')}</span></button>`}
      <button class="tapzone" onclick="${v.sug ? '' : `vidForm('${v.id}')`}"><div class="tx"><div class="t">${v.sug ? '<span class="sugtag">Suggestion</span> ' : ''}${esc(v.title)}</div>${v.sug ? `<div class="s" style="display:flex;gap:14px;margin-top:6px"><span role="button" tabindex="0" class="sugbtn" onclick="event.stopPropagation();vidKeep('${v.id}')">Keep</span><span role="button" tabindex="0" class="sugbtn off" onclick="event.stopPropagation();vidDismiss('${v.id}')">Dismiss</span></div>` : ''}</div></button></div>`;
    const listCols = S.lists.map(l => {
      const items = S.todos.filter(t => !t.done && t.list === l).sort(cmpOpenTodo);
      const headExtra = !isFixedList(l) ? `<button type="button" class="linkbtn" style="font-size:0.75rem" onclick="listForm(${jsArg(l)})">Rename</button>` : '';
      return tbCol((l === 'Shopping' ? '🛒 ' : l === 'Home' ? '🏠 ' : '📋 ') + l, items.length,
        (items.length ? items.map(row).join('') : `<div class="card empty" style="padding:14px"><div class="s">Nothing on ${esc(l)} yet.</div></div>`),
        (l === "Shopping" ? `<div style="display:flex;gap:6px;margin-top:8px"><button type="button" class="tbadd" style="margin:0;flex:1" onclick="todoForm(null,'Shopping')">${I("plus")} Add 1 item</button><button type="button" class="tbadd" style="margin:0;flex:1;background:var(--brand);color:#fff" onclick="shopMultiSheet()">${I("plus")} Add multiple</button></div>` : `<button type="button" class="tbadd" onclick="todoForm(null,${jsArg(l)})">${I("plus")} Add to ${esc(l)}</button>`), headExtra);
    });
    const vidsAll = [...S.vids.filter(v => !v.done), ...S.vids.filter(v => v.done)];
    listCols.push(tbCol('🎬 Video ideas', S.vids.filter(v => !v.done).length,
      vidsAll.length ? vidsAll.map(vRow).join('') : '<div class="card empty" style="padding:14px"><div class="s">No video ideas yet.</div></div>',
      `<button type="button" class="tbadd" onclick="vidForm()">${I('plus')} Add video idea</button>`));
    const allDone = S.todos.filter(t => t.done).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
    if (allDone.length) {
      listCols.push(tbCol('✓ Done', allDone.length, allDone.map(row).join(''),
        `<button type="button" class="tbadd" onclick="clearDone()">Clear done</button>`));
    }
    listCols.push(tbCol('+ Lists', S.lists.length, `<div class="card" style="padding:12px"><div class="s">Swipe sideways across your lists, or add a new list column.</div></div>`,
      `<button type="button" class="tbadd" onclick="listForm()">${I('plus')} New list</button>`));
    return top + growCard() + `<form class="addbar" onsubmit="quickAdd(event)"><input id="newtodo" placeholder="Quick add a to-do…" autocomplete="off" enterkeyhint="done" maxlength="120" aria-label="New to-do"><button aria-label="Add">${I('plus')}</button></form><label class="sharechk"><input type="checkbox" id="shareshane" checked> Share with Shane</label>` + tbBoard(listCols) + foot;
  }
  return top +
    `${growCard()}${vidCard()}<div class="chips">${['All', ...S.lists].map(l => `<button class="chip ${l === todoFilter ? 'on' : ''}" onclick="setTodoFilter(${jsArg(l)})">${esc(l)}</button>`).join('')}
      <button class="chip plus" onclick="listForm()">+ New list</button></div>
    ${todoFilter === "Shopping" ? `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin:-2px 4px 10px"><span class="muted" id="shopnote" style="font-size:0.84375rem">These also go on Shane’s shopping list. Separate multiple items with commas!</span><button type="button" class="btn primary small" onclick="shopMultiSheet()">+ Add multiple</button></div>` : shopHomeSummaryCard()}
    ${todoFilter !== 'All' && !isFixedList(todoFilter) ? `<div style="display:flex;gap:18px;margin:-2px 4px 10px;font-size:0.875rem;font-weight:600"><button style="color:var(--brand);padding:4px 0" onclick="listForm(${jsArg(todoFilter)})">Rename list</button><button style="color:var(--red);padding:4px 0" onclick="deleteList(${jsArg(todoFilter)})">Delete list</button></div>` : ''}
    <form class="addbar" onsubmit="quickAdd(event)"><input id="newtodo" placeholder="Add a to-do${todoFilter !== 'All' ? ' to ' + esc(todoFilter) : ''}…" autocomplete="off" enterkeyhint="done" maxlength="120" aria-label="New to-do"><button aria-label="Add">${I('plus')}</button></form>
    <label class="sharechk"><input type="checkbox" id="shareshane" checked> Share with Shane</label>
    ${open.length ? `<div class="list" id="openlist">${open.map(row).join('')}</div>` : (S.todos.length ? '<div class="card empty"><div class="t">All done. Good as gold!</div></div>' : empty('Nothing on your list', 'Type a to-do above and tap +, or add one with a due date.', 'Add a to-do', 'todoForm()'))}
    ${done.length ? `<div class="sec">Done <button onclick="clearDone()">Clear done</button></div><div class="list" id="donelist">${done.map(row).join('')}</div>` : ''}` + foot;
}
function setTodoFilter(l) { todoFilter = l; render(); }
function parseMultiShopItems(raw) {
  return String(raw || "")
    .split(/(?:[\r\n,;•]+|\s+\band\b\s+(?!(?:cheese|pepper|chips|sour|silken)\b))/i)
    .map(s => s.replace(/^\s*[-*•\d.)]+\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 60);
}
let _inlineStaplesOpen = false;
let _inlineShopSelected = new Set();
function toggleInlineStaple(item, btn) {
  if (_inlineShopSelected.has(item)) _inlineShopSelected.delete(item);
  else _inlineShopSelected.add(item);
  if (btn) btn.classList.toggle("on", _inlineShopSelected.has(item));
  const bar = document.getElementById("inline-staple-bar");
  const cnt = _inlineShopSelected.size;
  if (bar) {
    bar.style.display = cnt ? "flex" : "none";
    const b = bar.querySelector(".btn.primary");
    if (b) b.textContent = "+ Add Selected (" + cnt + ") to Shopping";
  }
}
async function addInlineSelectedStaples() {
  const arr = [..._inlineShopSelected];
  if (!arr.length) return;
  const shareEl = document.getElementById("shareshane");
  const share = !shareEl || shareEl.checked;
  _inlineShopSelected = new Set();
  await addShopBatch(arr, share);
}
function updateQuickShopPreview(inp) {
  const box = document.getElementById("qshop-preview");
  if (!box || !inp) return;
  const parts = parseMultiShopItems(inp.value);
  if (parts.length <= 1) {
    box.style.display = "none";
    box.innerHTML = "";
    return;
  }
  box.style.display = "flex";
  box.innerHTML = "<span style=\"font-size:0.76rem;font-weight:800;color:var(--brand)\">Adding " + parts.length + " items:</span>" +
    parts.map(p => "<span class=\"pill fine\" style=\"font-size:0.74rem;padding:2px 8px\">" + esc(p) + "</span>").join("");
}
async function addShopBatch(items, share = true) {
  const clean = (Array.isArray(items) ? items : parseMultiShopItems(items)).map(x => String(x || "").trim()).filter(Boolean);
  if (!clean.length) return [];
  if (!S.lists.includes("Shopping")) S.lists.push("Shopping");
  const s0 = snap();
  const now = Date.now();
  const addedIds = [];
  clean.forEach((title, idx) => {
    const nid = uid("st");
    addedIds.push(nid);
    S.todos.push(Object.assign({
      id: nid,
      title: title.slice(0, 120),
      list: "Shopping",
      due: "",
      notes: "",
      priority: "normal",
      done: false,
      created: now + idx
    }, share ? {} : { private: true }));
  });
  await save();
  render();
  if (addedIds.length === 1) {
    if (navigator.onLine === false) toast("Added to Shopping. Choose a brand later, when you have signal.", "Undo", undoTo(s0));
    else brandAsk(addedIds[0]);
  } else {
    toast(`Added ${addedIds.length} items to Shopping${share ? " (shared with Shane)." : "."}`, "Undo", undoTo(s0));
  }
  return addedIds;
}
async function quickAdd(e, forceList) {
  e.preventDefault();
  const inpEl = e.target && e.target.querySelector ? (e.target.querySelector("input,textarea") || $("#newtodo")) : $("#newtodo");
  const v = inpEl ? inpEl.value.trim() : ""; if (!v) return;
  const shareEl = (e.target && e.target.parentElement && e.target.parentElement.querySelector("#shareshane")) || $("#shareshane");
  const share = !shareEl || shareEl.checked;
  const nlist = forceList || (curPage() === "shopping" ? "Shopping" : (todoFilter === "All" ? S.lists[0] : todoFilter));
  const parts = parseMultiShopItems(v);
  if (parts.length > 1) {
    if (isShop({ list: nlist })) {
      await addShopBatch(parts, share);
      return;
    }
    const s0 = snap(), now = Date.now();
    parts.forEach((item, idx) => {
      S.todos.push(Object.assign({ id: uid("st"), title: item.slice(0, 120), list: nlist, due: "", notes: "", priority: "normal", done: false, created: now + idx }, share ? {} : { private: true }));
    });
    await save(); render();
    toast(`Added ${parts.length} items to ${nlist}${share ? " (Shane can see them too)." : "."}`, "Undo", undoTo(s0));
    return;
  }
  const nid = uid("st");
  S.todos.push(Object.assign({ id: nid, title: v.slice(0, 120), list: nlist, due: "", notes: "", priority: "normal", done: false, created: Date.now() }, share ? {} : { private: true }));
  await save(); render();
  if (isShop({ list: nlist })) { if (navigator.onLine === false) toast("Added. Choose a brand later, when you have signal."); else brandAsk(nid); return; }
  if ($("#newtodo")) $("#newtodo").focus();
  toast(share ? "Added. Shane can see it too." : "Added, just for you.");
}
const SHOP_STAPLES = [
  ["🥛 Dairy & Fridge", ["Milk", "Butter", "Free-range Eggs", "Cheese", "Yoghurt", "Cream", "Sour Cream"]],
  ["🍞 Bakery & GF", ["GF Bread", "Bread", "GF Wraps", "GF Pasta", "GF Crackers", "Rice", "Oats"]],
  ["🍎 Fruit & Veg", ["Bananas", "Apples", "Avocados", "Tomatoes", "Potatoes", "Onions", "Lettuce", "Carrots", "Broccoli"]],
  ["🥩 Meat & Dinner", ["Chicken Breast", "Beef Mince", "Bacon", "GF Sausages", "Salmon", "Ham"]],
  ["🥫 Pantry & Drinks", ["Coffee", "Tea Bags", "Sugar", "Olive Oil", "Tinned Tomatoes", "Peanut Butter", "Sparkling Water"]],
  ["🧻 Home & Pets", ["Toilet Paper", "Paper Towels", "Dish Liquid", "Laundry Powder", "Rubbish Bags", "Zeus Dog Food", "Cat Food (Mindy & Silken)"]]
];
let _shopMultiSelected = new Set();
function shopMultiToggleChip(item, btn) {
  if (_shopMultiSelected.has(item)) _shopMultiSelected.delete(item);
  else _shopMultiSelected.add(item);
  if (btn) btn.classList.toggle("on", _shopMultiSelected.has(item));
  shopMultiUpdateCount();
}
function shopMultiUpdateCount() {
  const ta = document.getElementById("shopmulti-ta");
  const typed = ta ? parseMultiShopItems(ta.value) : [];
  const all = new Set([...typed.map(x => x.toLowerCase()), ...[..._shopMultiSelected].map(x => x.toLowerCase())]);
  const n = all.size;
  const cntEl = document.getElementById("shopmulti-cnt");
  if (cntEl) cntEl.textContent = n ? `Ready to add ${plural(n, "item")}` : "Type items or tap staples below";
  const subBtn = document.querySelector("#sf .btns .btn.primary");
  if (subBtn) subBtn.textContent = n > 0 ? `Add ${n} ${n === 1 ? "item" : "items"}` : "Add items";
}
function shopMultiSheet() {
  _shopMultiSelected = new Set();
  const existingOpen = new Set(S.todos.filter(t => isShop(t) && !t.done).map(t => t.title.toLowerCase().trim()));
  const staplesHtml = SHOP_STAPLES.map(([cat, arr]) => `
    <div style="margin-top:10px">
      <div style="font-size:0.78rem;font-weight:800;color:var(--ink2);margin-bottom:6px">${esc(cat)}</div>
      <div class="shop-chip-grid">
        ${arr.map(item => {
          const already = existingOpen.has(item.toLowerCase());
          return `<button type="button" class="shop-pick-chip${already ? " already" : ""}" onclick="shopMultiToggleChip(${jsArg(item)}, this)"><span>${esc(item)}</span>${already ? "<small>on list</small>" : ""}</button>`;
        }).join("")}
      </div>
    </div>`).join("");
  openSheet(
    "Add Multiple Shopping Items",
    `<p class="muted" style="margin:-4px 2px 8px">Type or paste as many items as you like (separated by commas or new lines), or tap quick staples below. All items go straight onto your &amp; Shane’s shopping list.</p>
    <div class="field">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span class="lbl" style="margin:0">Items to add</span>
        <span id="shopmulti-cnt" class="pill fine" style="font-size:0.75rem">Type items or tap staples below</span>
      </div>
      <textarea name="items" id="shopmulti-ta" rows="4" placeholder="e.g. Milk, GF bread, eggs, apples&#10;or one item per line…" oninput="shopMultiUpdateCount()" style="width:100%;border-radius:12px;border:1px solid var(--fieldline);background:var(--field);color:var(--ink);padding:10px 12px;font:inherit;font-size:0.95rem;resize:vertical"></textarea>
    </div>
    <div style="margin:6px 0 10px">
      <div style="font-size:0.84rem;font-weight:800;color:var(--brand)">Tap to select multiple staples at once:</div>
      ${staplesHtml}
    </div>
    <label class="sharebox"><input type="checkbox" name="share" checked><span><b>Share with Shane</b><small>Shows on Shane’s shopping list too so either of you can pick them up.</small></span></label>`,
    async v => {
      const typed = parseMultiShopItems(v.items || "");
      const combined = [...typed];
      _shopMultiSelected.forEach(st => {
        if (!combined.some(x => x.toLowerCase() === st.toLowerCase())) combined.push(st);
      });
      if (!combined.length) return "Please type at least one item or tap items above.";
      const share = v.share === "on";
      setTimeout(() => { addShopBatch(combined, share); }, 30);
    },
    "Add items"
  );
}
function shopHomeSummaryCard() {
  const open = S.todos.filter(t => isShop(t) && !t.done).sort(cmpOpenTodo);
  const done = S.todos.filter(t => isShop(t) && t.done);
  const preview = open.slice(0, 6).map(t => {
    const b = t.brand && !t.brand.any ? t.brand.brand : "";
    return `<span class="shop-mini-pill" onclick="event.stopPropagation();tick('${t.id}')" title="Tap to tick off">${shaneBadge(t)}🛒 ${esc(t.title)}${b ? ` <small>(${esc(b)})</small>` : ""}</span>`;
  }).join("");
  return `<div class="card shop-hero-card" id="shop-hero-card">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
      <div style="display:flex;align-items:center;gap:8px; cursor:pointer" onclick="go('#shopping')">
        <span class="aic" style="width:36px;height:36px;border-radius:10px;font-size:1.1rem">🛒</span>
        <div>
          <div style="font-weight:800;font-size:1.02rem;color:var(--ink)">Shopping List ${open.length ? `<span class="pill fine" style="margin-left:4px">${open.length} to get</span>` : `<span class="pill none" style="margin-left:4px">Empty</span>`}</div>
          <div class="muted" style="font-size:0.78rem">Shared with Shane · add 1 or multiple items at once</div>
        </div>
      </div>
      <div style="display:flex;gap:6px">
        <button type="button" class="btn primary small" onclick="shopMultiSheet()">+ Add multiple</button>
        <button type="button" class="btn small" onclick="go('#shopping')">Open ›</button>
      </div>
    </div>
    <form class="addbar" style="margin:10px 0 6px" onsubmit="quickAdd(event, 'Shopping')">
      <input placeholder="Add 1 or multiple items (e.g. Milk, bread, eggs)…" autocomplete="off" enterkeyhint="done" maxlength="240" aria-label="Add shopping items">
      <button aria-label="Add to Shopping">${I("plus")}</button>
    </form>
    ${open.length ? `<div class="shop-mini-list">${preview}${open.length > 6 ? `<button type="button" class="shop-mini-more" onclick="go('#shopping')">+${open.length - 6} more ›</button>` : ""}</div>` : `<div class="muted" style="font-size:0.8125rem;margin-top:2px">Nothing on the shopping list yet — type items above separated by commas or tap <b>+ Add multiple</b>.</div>`}
  </div>`;
}
function Shopping() {
  if (!S.lists.includes("Shopping")) S.lists.push("Shopping");
  const open = S.todos.filter(t => isShop(t) && !t.done).sort(cmpOpenTodo);
  const done = S.todos.filter(t => isShop(t) && t.done).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
  const row = t => `<div class="row ${t.done ? "done" : ""}" data-id="${esc(t.id)}"><button type="button" class="tick" aria-label="${t.done ? "Mark not done" : "Mark complete"}: ${esc(t.title)}" onclick="tick('${t.id}')"><span>${I("check")}</span></button>
    <button class="tapzone" onclick="todoForm('${t.id}')"><div class="tx"><div class="t">${shaneBadge(t)}${esc(t.title)}</div><div class="s">Shopping${t.private ? " · just me" : " · shared with Shane"}${t.done ? "" : todoPriMark(t)}${t.due && !t.done ? " · " + fmtW(t.due) : ""}</div>${t.brand ? `<div class="s brandline">${esc(brandLine(t.brand))}</div>` : ""}</div>
    ${t.due && !t.done ? pill(daysLeft(t.due)) : ""}</button>${!t.done ? `<button type="button" class="brandbtn" onclick="brandAsk('${t.id}')">${t.brand ? "Brand ✓" : "Brand?"}</button>` : ""}</div>`;
  const top = header("Shopping List", open.length ? plural(open.length, "item") + " to get · shared with Shane" : "Shopping list is clear", themeDots() + addBtn("Add multiple items", "shopMultiSheet()"));
  const foot = `${themePicker()}
    <div class="foot" id="syncline">${esc(syncLine())}<br>Items on Shopping automatically show on Shane’s shopping list too, with any brand you pick. Sarah’s To-do ${APP_VERSION}</div>`;
  return top +
    shaneShopCard() +
    `<div class="card" style="margin-bottom:12px;border:1.5px solid var(--brand)">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;flex-wrap:wrap">
        <div>
          <b style="font-size:0.98rem">🛒 Quick Add (1 or Multiple Items)</b>
          <div class="muted" style="font-size:0.8rem">Separate multiple items with commas (e.g. <i>Milk, bread, eggs, apples</i>) or tap <b>+ Add Multiple &amp; Staples</b>.</div>
        </div>
        <button type="button" class="btn primary small" onclick="shopMultiSheet()">+ Add Multiple &amp; Staples</button>
      </div>
      <form class="addbar" style="margin:0 0 8px" onsubmit="quickAdd(event, 'Shopping')">
        <input id="newtodo" placeholder="e.g. Milk, GF bread, eggs, butter…" autocomplete="off" enterkeyhint="done" maxlength="300" aria-label="Add shopping items" oninput="updateQuickShopPreview(this)">
        <button aria-label="Add">${I("plus")}</button>
      </form>
      <div id="qshop-preview" style="display:none;flex-wrap:wrap;gap:5px;align-items:center;margin:0 0 8px"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
        <label class="sharechk" style="margin:0"><input type="checkbox" id="shareshane" checked> Share with Shane</label>
        <button type="button" class="linkbtn" style="font-size:0.82rem" onclick="_inlineStaplesOpen=!_inlineStaplesOpen;render()">${_inlineStaplesOpen ? "Hide quick staples ▴" : "✨ Quick-tap staples (select multiple) ▾"}</button>
      </div>
      ${_inlineStaplesOpen ? `<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--line)">
        <div class="muted" style="font-size:0.78rem;margin-bottom:6px">Tap as many items as you need, then tap <b>+ Add Selected</b>:</div>
        ${SHOP_STAPLES.map(([cat, arr]) => `<div style="margin-bottom:8px"><div style="font-size:0.75rem;font-weight:800;color:var(--ink2);margin-bottom:4px">${esc(cat)}</div><div class="shop-chip-grid">${arr.map(item => {
          const already = open.some(t => t.title.toLowerCase().trim() === item.toLowerCase());
          const selOn = _inlineShopSelected.has(item);
          return `<button type="button" class="shop-pick-chip${selOn ? " on" : ""}${already ? " already" : ""}" onclick="toggleInlineStaple(${jsArg(item)}, this)"><span>${esc(item)}</span>${already ? "<small>on list</small>" : ""}</button>`;
        }).join("")}</div></div>`).join("")}
        <div id="inline-staple-bar" style="display:${_inlineShopSelected.size ? "flex" : "none"};gap:8px;margin-top:10px">
          <button type="button" class="btn primary" onclick="addInlineSelectedStaples()">+ Add Selected (${_inlineShopSelected.size}) to Shopping</button>
          <button type="button" class="btn small" onclick="_inlineShopSelected.clear();render()">Clear</button>
        </div>
      </div>` : ""}
    </div>` +
    (open.length
      ? `<div class="sec" style="margin-top:8px">To get (${open.length}) <button onclick="shopMultiSheet()">+ Add more</button></div><div class="list" id="openlist">${open.map(row).join("")}</div>`
      : `<div class="card empty"><div class="t">Shopping list is empty</div><div class="s">Type multiple items above separated by commas, or tap below to pick from common staples.</div><button class="btn primary" onclick="shopMultiSheet()">+ Add Multiple Items</button></div>`) +
    (done.length ? `<div class="sec">In the trolley / Done (${done.length}) <button onclick="clearShopDone()">Clear ticked</button></div><div class="list" id="donelist">${done.map(row).join("")}</div>` : "") +
    foot;
}
function clearShopDone() {
  const vis = S.todos.filter(t => t.done && isShop(t));
  if (!vis.length) return;
  confirmSheet("Clear ticked shopping items?", `${plural(vis.length, "ticked-off shopping item")} will be removed (from Shane’s list too).`, "Clear", async () => {
    const s = snap(), ids = new Set(vis.map(t => t.id)); S.todos = S.todos.filter(t => !ids.has(t.id)); await save(); render(); toast("Cleared.", "Undo", undoTo(s));
  });
}
async function tick(id) {
  const t = S.todos.find(x => x.id === id); if (!t) return;
  const s = snap();
  t.done = !t.done;
  if (t.done) t.doneAt = Date.now(); else delete t.doneAt;
  await save();
  if (sheetOpen) await closeSheet();
  render();
  toast(t.done ? `Marked done: ${t.title}` : `${t.title} marked not done.`, 'Undo', undoTo(s));
}
function clearDone() {
  const vis = S.todos.filter(t => t.done && (todoFilter === 'All' || t.list === todoFilter));
  confirmSheet('Clear done to-dos?', `${plural(vis.length, 'ticked-off to-do')} will be removed (from Shane’s list too).`, 'Clear', async () => {
    const s = snap(), ids = new Set(vis.map(t => t.id)); S.todos = S.todos.filter(t => !ids.has(t.id)); await save(); render(); toast('Cleared.', 'Undo', undoTo(s));
  });
}
function todoForm(id, defList) {
  const t = id ? S.todos.find(x => x.id === id) : { title: '', list: defList && S.lists.includes(defList) ? defList : (todoFilter === 'All' ? S.lists[0] : todoFilter), due: '', notes: '', priority: 'normal' };
  if (!t) return;
  openSheet(id ? 'Edit to-do' : 'Add a to-do',
    field('To-do', inp('title', t.title, 'placeholder="e.g. Pick up the dry cleaning" required maxlength="120"')) +
    `<div class="two">${field('List', sel('list', S.lists.map(l => [l, l]), t.list))}${field('Priority', sel('priority', [['high', 'High'], ['normal', 'Normal'], ['low', 'Low']], todoPriority(t)))}</div>` +
    (id && S.lists.length > 1 ? `<div class="btns" style="margin:-2px 0 8px"><button type="button" class="btn small" id="smove" onclick="moveSheet('${id}')">⋯ Move to another list</button></div>` : '') +
    field('Due date', inp('due', t.due, 'type="date"'), 'Optional') +
    field('Notes', area('notes', t.notes)) +
    (id && (isShop(t) || t.brand) ? `<div class="brandbox" id="brandbox"><div><b>Brand</b><small>${t.brand ? esc(brandLine(t.brand)) + (t.brand.at ? ' · looked up ' + esc(fmt(t.brand.at)) : '') : 'Not chosen yet'}</small></div>
      <div class="bbtns"><button type="button" class="btn small" onclick="brandAsk('${id}')">${t.brand ? 'Change brand' : 'Choose brand'}</button>${t.brand ? `<button type="button" class="btn small" onclick="brandClear('${id}')">Remove</button>` : ''}</div></div>` : '') +
    (t.by === 'shane' ? `<p class="muted" id="shanenote" style="margin:4px 2px 0">${shaneBadge(t)} Shane added this from his list. Ticks and changes go back to him.</p>` :
      `<label class="sharebox"><input type="checkbox" name="share" ${t.private ? '' : 'checked'}><span><b>Share with Shane</b><small>${id ? (t.private ? 'Just on your list at the moment. Tick to put it on Shane’s list too.' : 'On Shane’s list too. Untick to keep it just on yours.') : 'Untick to keep it just on your list.'}</small></span></label>`) +
    (id ? `<div class="btns" style="margin-top:4px"><button type="button" class="btn" onclick="tick('${id}')">${I('check')} ${t.done ? 'Mark not done' : 'Mark complete'}</button></div>` : ''),
    async v => {
      if (!v.title) return 'Please type the to-do.';
      const priority = todoPriority({ priority: v.priority });
      const s = snap();
      const share = t.by === 'shane' || v.share === 'on';
      if (id) { Object.assign(t, { title: v.title.slice(0, 120), list: v.list, due: v.due, notes: v.notes, priority }); if (share) delete t.private; else t.private = true; }
      let nid = '';
      if (!id) { nid = uid('st'); S.todos.push(Object.assign({ id: nid, title: v.title.slice(0, 120), list: v.list, due: v.due, notes: v.notes, priority, done: false, created: Date.now() }, share ? {} : { private: true })); }
      await save(); render(); toast(id ? 'To-do updated.' : share ? 'Added. Shane can see it too.' : 'Added, just for you.', 'Undo', undoTo(s));
      if (nid && isShop({ list: v.list }) && navigator.onLine !== false) return () => brandAsk(nid);
    }, id ? 'Save' : 'Add',
    id ? `<button type="button" class="btn danger" style="flex:0 0 auto" aria-label="Delete to-do" onclick="deleteTodo('${id}')">${I('trash')}</button>` : '');
}
async function deleteTodo(id) {
  const s = snap(); S.todos = S.todos.filter(x => x.id !== id); await save(); await closeSheet(); render(); toast('To-do deleted.', 'Undo', undoTo(s));
}
function listForm(name) {
  if (name && isFixedList(name)) { toast('The ' + name + ' list can’t be renamed.'); return; }
  openSheet(name ? 'Rename list' : 'New list', field('List name', inp('name', name || '', 'placeholder="e.g. Garden" required maxlength="24"')), async v => {
    if (!v.name) return 'Please type a name.';
    if (v.name === 'All') return 'Please pick a different name.';
    if (S.lists.some(l => l.toLowerCase() === v.name.toLowerCase() && l !== name)) return 'You already have a list with that name.';
    if (name) { S.lists = S.lists.map(l => l === name ? v.name : l); S.todos.forEach(t => { if (t.list === name) t.list = v.name; }); }
    else S.lists.push(v.name);
    todoFilter = v.name; await save(); render();
  }, name ? 'Save' : 'Add list');
}
function deleteList(name) {
  if (isFixedList(name)) { toast('The ' + name + ' list can’t be deleted.'); return; }
  if (S.lists.length <= 1) { toast('You need at least one list.'); return; }
  const n = S.todos.filter(t => t.list === name).length;
  const dest = S.lists.find(l => l !== name);
  confirmSheet(`Delete the ${esc(name)} list?`, n ? `Its ${plural(n, 'to-do')} will move to ${esc(dest)}.` : 'The list is empty.', 'Delete list', async () => {
    const s = snap(); S.lists = S.lists.filter(l => l !== name); S.todos.forEach(t => { if (t.list === name) t.list = dest; });
    todoFilter = 'All'; await save(); render(); toast('List deleted.', 'Undo', undoTo(s));
  });
}
// Hooks for the shared sync: every to-do in this app is shared.
// Errands was removed in 1.0.2: an old Errands item coming back from the shared list lands on Home (unless she made her own Errands list)
const listIn = l => l === 'Errands' && !S.lists.includes('Errands') ? (S.lists.includes('Home') ? 'Home' : S.lists[0]) : l;
const SH = {
  state: () => S.settings.shared,
  items: () => [...S.todos.filter(t => !t.private), ...S.appts.filter(a => !a.private).map(apptView)], // 1.1.2: private ones never leave this phone
  by: t => t && t.by === 'shane' ? 'shane' : 'sarah',
  want: () => true,
  add: s => { if (s.list === 'Appointments') { if (!S.appts.some(a => a.id === s.id) && !s.done) S.appts.push(apptFromShared(s)); return; } if (S.todos.some(t => t.id === s.id)) return; /* a private one: stays private (the next sync takes it off the shared list) */ s = Object.assign({}, s, { list: listIn(s.list) }); S.todos.push(Object.assign({ id: s.id, title: s.title, list: s.list, due: s.due, notes: s.notes, priority: s.priority, done: s.done, doneAt: s.doneAt || undefined, created: s.created }, s.by === 'shane' ? { by: 'shane' } : {}, s.brand ? { brand: s.brand } : {})); if (!S.lists.includes(s.list)) S.lists.push(s.list); },
  update: (t, s) => { if (t._appt) { const a = apptFromShared(s); ['type', 'title', 'date', 'time', 'place', 'notes'].forEach(k => { t._appt[k] = a[k]; }); if (a.claim) t._appt.claim = a.claim; return; } s = Object.assign({}, s, { list: listIn(s.list) }); Object.assign(t, { title: s.title, list: s.list, due: s.due, notes: s.notes, priority: s.priority, done: s.done }); if (s.brand) t.brand = s.brand; else delete t.brand; if (s.done) t.doneAt = s.doneAt || Date.now(); else delete t.doneAt; if (!S.lists.includes(s.list)) S.lists.push(s.list); },
  remove: id => { S.todos = S.todos.filter(t => t.id !== id); S.appts = S.appts.filter(a => !(a.id === id && !a.private)); },
  persist: async changed => {
    sharedApplying = true;
    try { await save(); } finally { sharedApplying = false; }
    if (sheetOpen) return;
    if (changed) render(); else { const el = document.getElementById('syncline'); if (el) el.innerHTML = esc(syncLine()) + '<br>Shared to-dos show on Shane’s list too, and he can tick them off. When you tick a shared one off, Shane gets a little note (just the title). Sarah’s To-do ' + APP_VERSION; }
  }
};
/* ---- Shared to-do sync (Sarah's To-do <-> My App) ----
   Each phone keeps its own copy and a note of the last version both sides agreed on. Changes made here
   (add, tick, edit, delete, undo) are spotted by comparing with that note and queued, so they work offline
   and are sent when there's signal. Each item merges on its own time stamp; nothing is duplicated. */
const SHARED_URL = 'https://due-dates-calendar-relay.phoneapp12.workers.dev/shared-todo';
// 1.13.0: each phone has its own shared-list key, kept only on this phone (localStorage 'stKey' and a copy for the
// notification worker). The old shared key below is accepted by the relay only until this phone links with Shane's
// My App, or until 5 Nov 2026, whichever comes first. After that it does nothing.
const LEGACY_KEY = 'sArgfZGJrHxJN9I319FJeFLhFshrHsRU2xDFnnLL';
const PAIR_CUTOFF = Date.parse('2026-11-05T23:59:59+13:00');
function sharedKey() { try { return localStorage.getItem('stKey') || LEGACY_KEY; } catch (e) { return LEGACY_KEY; } }
const stPaired = () => { try { return !!localStorage.getItem('stKey'); } catch (e) { return false; } };
async function stKeyToWorker(k) { try { const c = await caches.open('st-pair-key'); await c.put('key', new Response(k)); } catch (e) { } }
const SHARED_FIELDS = ['title', 'list', 'due', 'notes', 'priority', 'done'];
const sharedHash = t => JSON.stringify(SHARED_FIELDS.map(k => k === 'done' ? !!t[k] : String(t[k] == null ? '' : t[k])).concat(t.brand ? [brandKey(t.brand)] : []).concat(t.appt ? [apptKey(t.appt)] : []).concat(t.claim ? [claimKey(claimNorm(t.claim))] : []));
const apptKey = a => JSON.stringify([a.type || '', a.time || '', a.place || '']);
let sharedBusy = false, sharedTimer = null, sharedLastOk = 0, sharedErr = '';
function sharedState() { const s = SH.state(); if (!s.snap || typeof s.snap !== 'object') s.snap = {}; if (!s.pend || typeof s.pend !== 'object') s.pend = {}; return s; }
// Spot local changes since the last agreed version and queue them (called on every save)
function sharedNote() {
  const st = sharedState(), now = Date.now(), seen = new Set();
  SH.items().forEach(t => {
    seen.add(t.id);
    const h = sharedHash(t);
    if (st.snap[t.id] === h) { delete st.pend[t.id]; return; }
    const p = st.pend[t.id];
    if (p && !p.deleted && sharedHash(p) === h) return; // already queued
    st.pend[t.id] = Object.assign({ id: t.id, created: t.created || now, by: SH.by(t), doneAt: t.done ? t.doneAt || now : 0, updated: now }, Object.fromEntries(SHARED_FIELDS.map(k => [k, k === 'done' ? !!t[k] : (t[k] || '')])), t.brand ? { brand: t.brand } : {}, t.appt ? { appt: t.appt } : {}, t.claim ? { claim: t.claim } : {});
  });
  Object.keys(st.snap).forEach(id => { if (!seen.has(id) && !(st.pend[id] && st.pend[id].deleted)) st.pend[id] = { id, deleted: true, updated: now }; });
}
function sharedSoon(ms = 1500) { clearTimeout(sharedTimer); sharedTimer = setTimeout(() => sharedSync(), ms); }
let clRetryAt = 0;
async function claimRetryUploads() { // photos that couldn't go up when saved (offline): try again, at most every 5 minutes
  if (Date.now() - clRetryAt < 300000) return; clRetryAt = Date.now();
  let ch = false;
  for (const a of (S.appts || [])) { if (a && a.claim && !a.private && a.claim.photos.some(p => !p.up)) { if (await claimUploadPhotos(a.claim)) ch = true; } }
  if (ch) { await save(); }
}
async function sharedSync() {
  try { if (S) claimRetryUploads(); } catch (e) { }
  if (sharedBusy || !S) return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) { sharedErr = 'offline'; return; }
  sharedBusy = true;
  try {
    sharedNote();
    const st = sharedState(), sent = Object.values(st.pend);
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 15000);
    let d;
    try {
      const r = await fetch(SHARED_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: sharedKey(), items: sent, from: 'sarah' }), signal: ctl.signal });
      if (!r.ok) throw new Error('http ' + r.status);
      d = await r.json();
    } finally { clearTimeout(to); }
    if (!d || !Array.isArray(d.items)) throw new Error('bad reply');
    sharedNote(); // anything changed while we were waiting stays queued
    let changed = false;
    d.items.forEach(s => {
      const p = st.pend[s.id];
      if (p && p.updated > s.updated) return; // newer change here, send it next time
      if (p) delete st.pend[s.id];
      const local = SH.items().find(t => t.id === s.id);
      if (s.deleted) { if (local) { SH.remove(s.id); changed = true; } delete st.snap[s.id]; return; }
      if (!SH.want(s)) return;
      if (!local) { SH.add(s); changed = true; }
      else if (sharedHash(local) !== sharedHash(s)) { SH.update(local, s); changed = true; }
      st.snap[s.id] = sharedHash(s);
    });
    // queued deletes the list no longer holds: done
    Object.keys(st.pend).forEach(id => { if (st.pend[id].deleted && !d.items.some(s => s.id === id)) { delete st.pend[id]; delete st.snap[id]; } });
    // Self-heal: an item both phones had agreed on that the relay no longer holds (no tombstone either) was lost when
    // two phones wrote at nearly the same moment (the store is eventually consistent). Queue it again.
    const have = new Set(d.items.map(s => s.id)); let lost = 0;
    SH.items().forEach(t => { if (st.snap[t.id] && !st.pend[t.id] && !have.has(t.id)) { delete st.snap[t.id]; lost++; } });
    if (lost) { sharedNote(); sharedSoon(4000); }
    sharedLastOk = Date.now(); sharedErr = '';
    await SH.persist(changed);
  } catch (e) { sharedErr = 'offline'; }
  finally { sharedBusy = false; }
}
function sharedStart() {
  sharedSync();
  setInterval(() => { if (document.visibilityState === 'visible') sharedSync(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sharedSync(); });
  window.addEventListener('online', () => sharedSync());
}

/* ================= INSTALL AS AN APP ================= */
// Install help is always shown until the app is opened from the home screen.
// Android Chrome/Edge: real Install button when the browser offers it, otherwise menu steps.
// In-app browsers (Messenger, Facebook, Instagram, WhatsApp, Gmail etc.) can't install apps, so offer Open in Chrome + Copy link.
let installEvt = null, justInstalled = false;
const UA = navigator.userAgent || '';
const isStandalone = () => (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: minimal-ui)').matches)) || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isAndroid = () => /android/i.test(UA);
function browserKind() {
  if (/FBAN|FBAV|FB_IAB|FBIOS|Instagram|Messenger|MessengerLite|WhatsApp|Snapchat|TikTok|musical_ly|BytedanceWebview|Line\/|Twitter|LinkedInApp|Pinterest|GSA\/|KAKAOTALK|Viber/i.test(UA)) return 'inapp';
  if (isAndroid() && /; wv\)|\bwv\b|Version\/[\d.]+ Chrome\/[\d.]+ Mobile/i.test(UA)) return 'inapp';
  if (isIOS()) return /CriOS|FxiOS|EdgiOS/i.test(UA) ? 'iosother' : 'ios';
  if (/SamsungBrowser/i.test(UA)) return 'samsung';
  if (/Firefox|FxiOS/i.test(UA)) return 'firefox';
  if (/EdgA|Edg\//i.test(UA)) return 'edge';
  if (/OPR\/|Opera/i.test(UA)) return 'opera';
  if (/Chrome\//i.test(UA)) return 'chrome';
  return 'other';
}
const appUrl = () => location.origin + location.pathname;
const chromeIntent = () => 'intent://' + location.host + location.pathname + '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent(appUrl()) + ';end';
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; render(); });
window.addEventListener('appinstalled', () => { installEvt = null; justInstalled = true; render(); toast('Sarah’s To-do is on your home screen. Open it from there.'); });
function installSteps(k) {
  const menu = '<b>⋮</b>';
  switch (k) {
    case 'chrome': return `Tap the ${menu} menu (top right), then <b>Install app</b> or <b>Add to Home screen</b>, then <b>Install</b>.`;
    case 'samsung': return `Tap the <b>≡</b> menu (bottom right), then <b>Add page to</b> › <b>Home screen</b>. (Or open this link in Chrome and tap Install app.)`;
    case 'firefox': return `Tap the ${menu} menu, then <b>Install</b> or <b>Add to Home screen</b>.`;
    case 'edge': return `Tap the <b>…</b> menu (bottom), then <b>Add to phone</b> or <b>Install app</b>.`;
    case 'opera': return `Tap the ${menu} menu, then <b>Add to</b> › <b>Home screen</b>.`;
    case 'ios': return `Tap the Share button ${I('share')} at the bottom, then <b>Add to Home Screen</b>, then <b>Add</b>.`;
    case 'iosother': return `Tap the Share button ${I('share')}, then <b>Add to Home Screen</b>. If you can’t see it, open this link in Safari.`;
    default: return isAndroid() ? `Open this link in <b>Chrome</b>, then tap the ${menu} menu › <b>Install app</b>.` : `Open this link on your phone in Chrome (Android) or Safari (iPhone), then add it to your home screen.`;
  }
}
function installCard() {
  if (isStandalone()) return '';
  if (justInstalled) return `<div class="card installcard" id="installcard"><div><b>Installed ✓</b><div class="muted">Open Sarah’s To-do from your home screen.</div></div></div>`;
  const k = browserKind();
  if (k === 'inapp') {
    return `<div class="card installcard inapp" id="installcard"><div><b>To install, open this in Chrome</b>
      <div class="muted">This page is open inside another app (like Messenger, Facebook or Gmail), which can’t install apps.${isIOS() ? ' Tap the ⋯ menu and choose <b>Open in Safari</b>, then Share › Add to Home Screen.' : ''}</div>
      <div class="btns" style="margin-top:10px">${isAndroid() ? `<a class="btn primary" id="openchrome" href="${esc(chromeIntent())}">Open in Chrome</a>` : ''}
      <button class="btn" id="copylink" onclick="copyAppLink()">Copy link</button></div>
      <div class="muted" style="margin-top:6px;font-size:0.8125rem">Or tap the app’s ⋮ menu and choose <b>Open in browser</b> / <b>Open in Chrome</b>.</div></div></div>`;
  }
  if (installEvt) return `<div class="card installcard" id="installcard"><div><b>Install Sarah’s To-do</b><div class="muted">Put it on your home screen so it opens like a normal app, even offline.</div></div><button class="btn primary" id="installbtn" style="flex:none" onclick="installApp()">${I('download')} Install app</button></div>`;
  return `<div class="card installcard" id="installcard"><div><b>Install Sarah’s To-do</b><div class="muted" id="installsteps">${installSteps(k)}</div>
    <div class="muted" style="margin-top:6px;font-size:0.8125rem">Already installed? Open it from your home screen.</div></div></div>`;
}
async function copyAppLink() {
  const u = appUrl();
  let ok = false;
  try { await navigator.clipboard.writeText(u); ok = true; } catch (e) { }
  if (!ok) { try { const t = document.createElement('textarea'); t.value = u; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); ok = document.execCommand('copy'); t.remove(); } catch (e) { } }
  toast(ok ? 'Link copied. Open Chrome and paste it in the address bar.' : 'Copy this link: ' + u);
}
async function installApp() {
  if (!installEvt) { toast('Use the browser menu, then Install app.'); return; }
  const e = installEvt; installEvt = null;
  try { e.prompt(); const c = await e.userChoice; if (c && c.outcome === 'accepted') justInstalled = true; } catch (x) { }
  render();
}

/* ================= COLOUR (1.0.1) ================= */
// Pink or purple, saved on this phone only (not shared with Shane's app).
const THEMES = { pink: ['Pink', '#DB2777'], purple: ['Purple', '#6D3FC4'] };
const THEME_KEY = 'sarahsTodo.theme';
function curTheme() { try { return localStorage.getItem(THEME_KEY) === 'purple' ? 'purple' : 'pink'; } catch (e) { return 'pink'; } }
function applyTheme(k) {
  document.documentElement.setAttribute('data-theme', k);
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', THEMES[k][1]);
}

/* ===== Grow your channel (1.8.0): one real YouTube tip a day, picked by date. Optional. ===== */
const GROW_TIPS = [
  'Make your thumbnail readable at phone size: one face or object, big contrast, three words or fewer.',
  'Try a close-up of your face showing real emotion in the thumbnail. Faces tend to get more clicks.',
  'Keep titles under about 60 characters so they don’t get cut off on phones.',
  'Put the most interesting words at the start of your title.',
  'Make the title and thumbnail tell one story together, without repeating the same words.',
  'Hook people in the first 15 seconds: show the best moment or say what they’ll get, then start.',
  'Skip long intros. Start with the action and introduce yourself later, if at all.',
  'Cut out pauses and slow bits. Tighter edits keep people watching longer.',
  'Make a Short from your latest video: pick its best 30–50 seconds and film or crop it upright.',
  'Pin a Short to your channel that links to the full video using the related video link.',
  'Pick one or two upload days and stick to them, so viewers know when to expect you.',
  'Add an end screen pointing to your best video or a playlist, so people keep watching.',
  'Ask one simple question near the end of your video so people answer in the comments.',
  'Reply to comments in the first hour after you upload. It builds a loyal crowd.',
  'Heart and pin a good comment to get conversation going.',
  'Post in the Community tab between uploads: a poll, a photo or a sneak peek.',
  'Run a poll in the Community tab asking what video people want next.',
  'Group your videos into playlists by topic, so one view turns into several.',
  'Order your playlists so the strongest video comes first.',
  'Write the first two lines of your description like a mini hook, because that’s what shows.',
  'Use the words people would actually search for in your title and description.',
  'Type your topic into YouTube search and check the suggestions for title ideas.',
  'Add chapters (timestamps) to longer videos so people can jump to what they want.',
  'Add a few relevant tags, including common misspellings of your topic.',
  'Collaborate with a creator about your size. You both reach new viewers.',
  'Feature or shout out a viewer’s comment in a video. People love being seen.',
  'Check audience retention in YouTube Studio and look for where people drop off.',
  'Look at the first 30 seconds on your retention graph. A big drop means the hook needs work.',
  'Compare click-through rate between videos to learn which thumbnails work best for you.',
  'Look at “When your viewers are on YouTube” in Analytics and upload a couple of hours before.',
  'Check “Traffic sources” to see if people find you through search, Shorts or suggestions.',
  'Make more of whatever your best video was about. Your viewers have already told you what they like.',
  'Upload a custom thumbnail for every video. The auto pick is rarely your best frame.',
  'Use A/B testing for thumbnails in YouTube Studio when it’s available to you.',
  'Add captions or check the automatic ones. More people watch with the sound off than you’d think.',
  'Say your call to subscribe once, after you’ve given something good, not at the very start.',
  'Make a channel trailer for people who haven’t subscribed yet.',
  'Make a clear channel banner that says what your channel is about and when you post.',
  'Fill in the About section with what you make and who it’s for.',
  'Share your new video in places your viewers already are, like a group chat or social page.',
  'Batch film two or three videos on one day, so upload days don’t get stressful.',
  'Keep a list of video ideas on your phone and add to it whenever one pops up.',
  'Watch your own video back on your phone before posting. Check sound, brightness and the hook.',
  'Good sound matters more than a fancy camera. Film somewhere quiet or use a cheap clip-on mic.',
  'Film near a window for soft, flattering light.',
  'Try a series, like a weekly diary or update, so people come back for the next one.',
  'Use the Premiere option sometimes, so viewers can chat while it first plays.',
  'Go live now and then. Live chats help people feel they know you.',
  'Re-check old videos: a better title or thumbnail can give them a second life.',
  'Celebrate small wins. Every new subscriber is a real person who liked what you made.'
];
const growOn = () => localStorage.getItem('growTips') !== 'off';
async function growToggle(on) { localStorage.setItem('growTips', on ? 'on' : 'off'); render(); toast(on ? 'Channel tips are on.' : 'Channel tips are off. Turn them back on at the bottom of the page.'); }
let GROW_V = null; try { GROW_V = JSON.parse(localStorage.getItem('growV') || 'null'); } catch (e) { GROW_V = null; }
async function growLoad() {
  if (!growOn() || (GROW_V && Date.now() - GROW_V.at < 3 * 3600e3)) return;
  try { const r = await fetch(SHARED_URL.replace(/\/shared-todo$/, '/sarah')); if (!r.ok) return; const d = await r.json(); const v = Array.isArray(d.videos) ? d.videos[0] : null;
    GROW_V = { at: Date.now(), title: v && v.title ? String(v.title).slice(0, 100) : '' }; localStorage.setItem('growV', JSON.stringify(GROW_V)); render(); } catch (e) { }
}
function growTip() {
  const day = Math.floor((Date.now() + 13 * 3600e3) / 864e5), t = GROW_TIPS[day % GROW_TIPS.length], v = GROW_V && GROW_V.title;
  if (v && /^Make a Short from your latest video/.test(t)) return `Make a Short from “${v}”: pick its best 30–50 seconds and film or crop it upright.`;
  if (v && /thumbnail|title|description|chapters|captions|end screen|Short/i.test(t) && !/old videos/.test(t)) return t + ` Try it on your latest, “${v}”.`;
  return t;
}
function growCard() {
  if (!growOn()) return '';
  setTimeout(growLoad, 50);
  return `<div class="card growcard" id="growcard"><div class="t" style="font-weight:800;margin-bottom:4px">🌱 Grow your channel</div><div class="s">${esc(growTip())}</div><div style="margin-top:8px;font-size:0.8125rem"><button type="button" style="color:var(--brand);font-weight:600;padding:2px 0" onclick="growToggle(false)">Hide channel tips</button> · <span class="muted">A new tip each day. You’re doing great!</span></div></div>`;
}

/* ===== Video ideas (1.9.0): her own list, plus one sunset suggestion a week ===== */
const SUNSET_IDEAS = [
  'Time-lapse from a new Onerahi spot you haven’t filmed before',
  'Golden hour reflections on the harbour, filmed low near the water',
  'The same spot across the seasons: film it now and add a clip each month',
  'Sunset with the tide coming in: line up the camera on the waterline',
  'Birds heading home at sunset: wait for the flocks over the estuary',
  'A week of sunsets: one clip a night, stitched together',
  'A Short of the best 30 seconds from your latest sunset',
  'Behind the scenes of your setup: phone, tripod and where you stand',
  'Tips for filming sunsets without a drone',
  'Sunset from Mount Parihaka looking over Whangārei',
  'Sunset at the Town Basin with the boats and lights coming on',
  'Before and after: the sky 20 minutes before sunset and 20 minutes after',
  'The afterglow: keep filming once the sun has gone down',
  'Clouds versus clear sky: the same spot on two different nights',
  'A sunrise for a change, and compare it with your sunsets',
  'Silhouettes at sunset: people, trees or a jetty against the sky',
  'A slow pan across the sky instead of a still shot',
  'A rainy-day sunset: when the sky breaks after a shower',
  'Sunset with calm music and no talking, for a relaxing watch',
  'Talk to camera for 15 seconds about why you love this spot, then the sunset',
  'Sunset through the trees or a pōhutukawa in flower',
  'Your top 5 sunsets so far, counted down',
  'Sunset with the moon rising on the other side',
  'Film the colours changing on the water, not just the sky',
  'A beach sunset with footprints or waves in the foreground',
  'How you check sunset times and weather before heading out',
  'Sunset from a lookout on the drive home: a quick roadside stop',
  'A windy-day sunset with moving clouds sped up',
  'A winter versus summer sunset at the same place',
  'Viewers’ choice: ask in the comments where to film next',
  'Sunset at Ocean Beach or Whangārei Heads',
  'A whole sunset in one long take, from bright to dark',
  'A slow-motion clip of waves glowing in the last light'
];
const vidWeek = () => Math.floor((Date.now() + 13 * 3600e3 - 4 * 864e5) / (7 * 864e5)); // weeks start Monday NZ
function vidWeekly() {
  const w = vidWeek(); if (S.vidSug.week === w) return false;
  S.vids = S.vids.filter(v => !v.sug); // last week's suggestion goes if it wasn't kept
  const n = S.vidSug.n % SUNSET_IDEAS.length;
  S.vids.unshift({ id: uid('vid'), title: SUNSET_IDEAS[n], done: false, created: Date.now(), sug: true });
  S.vidSug = { week: w, n: n + 1 }; return true;
}
function vidCard() {
  try { if (vidWeekly()) save(); } catch (e) { }
  const open = S.vids.filter(v => !v.done), done = S.vids.filter(v => v.done);
  const row = v => `<div class="row ${v.done ? 'done' : ''}">${v.sug ? '' : `<button type="button" class="tick" aria-label="${v.done ? 'Mark not done' : 'Mark done'}: ${esc(v.title)}" onclick="vidTick('${v.id}')"><span>${I('check')}</span></button>`}
    <button class="tapzone" onclick="${v.sug ? '' : `vidForm('${v.id}')`}"><div class="tx"><div class="t">${v.sug ? '<span class="sugtag">Suggestion</span> ' : ''}${esc(v.title)}</div>${v.sug ? `<div class="s" style="display:flex;gap:14px;margin-top:6px"><span role="button" tabindex="0" class="sugbtn" onclick="event.stopPropagation();vidKeep('${v.id}')">Keep</span><span role="button" tabindex="0" class="sugbtn off" onclick="event.stopPropagation();vidDismiss('${v.id}')">Dismiss</span></div>` : ''}</div></button></div>`;
  return `<div class="sec" style="margin-top:4px">🎬 Video ideas <button onclick="vidForm()">+ Add</button></div>
    <div class="list" id="vidlist">${open.length ? open.map(row).join('') : '<div class="row"><div class="tx" style="padding:6px 4px"><div class="s">No video ideas yet. Tap + Add.</div></div></div>'}${done.map(row).join('')}</div>`;
}
function vidForm(id) {
  const v = id ? S.vids.find(x => x.id === id) : null;
  openSheet(v ? 'Edit video idea' : 'New video idea', field('Idea', inp('title', v ? v.title : '', 'placeholder="e.g. Sunset at the Town Basin" required maxlength="160"')), async f => {
    if (!f.title) return 'Please type an idea.';
    if (v) v.title = f.title; else S.vids.unshift({ id: uid('vid'), title: f.title, done: false, created: Date.now() });
    await save(); render();
  }, v ? 'Save' : 'Add', v ? `<button type="button" class="btn" style="color:#c0264b" onclick="vidDelete('${v.id}')">Delete</button>` : '');
}
async function vidTick(id) { const v = S.vids.find(x => x.id === id); if (!v) return; v.done = !v.done; await save(); render(); }
async function vidKeep(id) { const v = S.vids.find(x => x.id === id); if (!v) return; delete v.sug; await save(); render(); toast('Added to your video ideas.'); }
async function vidDismiss(id) { S.vids = S.vids.filter(x => x.id !== id); await save(); render(); toast('Dismissed. A new idea comes next week.'); }
async function vidDelete(id) { const s = snap(); S.vids = S.vids.filter(x => x.id !== id); await save(); await closeSheet(); render(); toast('Video idea deleted.', 'Undo', undoTo(s)); }
const LAYOUT_KEY = 'sarahsTodo.layout';
function isTrello() { try { return localStorage.getItem(LAYOUT_KEY) === 'trello'; } catch (e) { return false; } }
function applyLayout(m) { document.documentElement.setAttribute('data-layout', m === 'trello' ? 'trello' : 'list'); }
function setLayout(m) {
  const mode = m === 'trello' ? 'trello' : 'list';
  try { localStorage.setItem(LAYOUT_KEY, mode); } catch (e) { }
  applyLayout(mode); render();
  toast(mode === 'trello' ? 'Trello board view is on. Swipe sideways across lists.' : 'List view is on.');
}
function toggleLayout() { setLayout(isTrello() ? 'list' : 'trello'); }
function layoutBtn() {
  const tr = isTrello();
  return `<button type="button" class="layoutbtn ${tr ? 'on' : ''}" id="layoutbtn" aria-pressed="${tr}" title="${tr ? 'Switch to list view' : 'Switch to Trello board view'}" onclick="toggleLayout()">${I(tr ? 'board' : 'list')}<span>${tr ? 'Trello' : 'Board'}</span></button>`;
}
function tbCol(title, count, bodyHtml, footHtml = '', headExtra = '') {
  return `<section class="tblist"><div class="tblist-h"><b>${esc(title)}</b>${headExtra}${count != null ? `<span class="tblist-c">${count}</span>` : ''}</div><div class="tblist-b">${bodyHtml}</div>${footHtml}</section>`;
}
function tbBoard(cols) { return `<div class="tbboard"><div class="tblists">${cols.join('')}</div></div>`; }
function themePicker() {
  const c = curTheme(), tr = isTrello();
  return `<div class="themepick" id="themepick" role="radiogroup" aria-label="Colour" style="flex-wrap:wrap">Colour${Object.entries(THEMES).map(([k, [l, hex]]) => `<button type="button" class="swatch ${k === c ? 'on' : ''}" role="radio" aria-checked="${k === c}" data-theme-pick="${k}" onclick="setTheme('${k}')"><i style="background:${hex}"></i>${l}</button>`).join('')}
    <span style="margin-left:6px">View</span>
    <button type="button" class="swatch ${!tr ? 'on' : ''}" onclick="setLayout('list')">${I('list', 'style="width:16px;height:16px"')}List</button>
    <button type="button" class="swatch ${tr ? 'on' : ''}" onclick="setLayout('trello')">${I('board', 'style="width:16px;height:16px"')}Trello</button></div>`;
}
function themeDots() { // small pink/purple dots at the top, next to +
  const c = curTheme();
  return `<div class="themedots" role="radiogroup" aria-label="Colour">${Object.entries(THEMES).map(([k, [l, hex]]) => `<button type="button" class="tdot ${k === c ? 'on' : ''}" role="radio" aria-checked="${k === c}" aria-label="${l} colour" title="${l}" data-theme-dot="${k}" onclick="setTheme('${k}')" style="background:${hex}"></button>`).join('')}</div>`;
}
function setTheme(k) {
  if (!THEMES[k]) return;
  try { localStorage.setItem(THEME_KEY, k); } catch (e) { }
  applyTheme(k); render();
}

/* ================= NOTIFICATIONS (1.1.0) =================
   Optional. If she turns them on, the phone's push address goes to the relay (with the shared list key) and
   the app can show the odd short note, now and then, during the day. Turning them off removes the address. */
const SUN_BASE = 'https://due-dates-calendar-relay.phoneapp12.workers.dev/sunshine/';
const VAPID_PUBLIC = 'BEsNn0TcOiNQqSE7AbDFgYGL_v45EEm-mma2_6DtecoG5c7ZvwZ7lKpAXOQry7cqfvWM0JTjtPPdK93arc0VXMU';
const NOTE_KEY = 'sarahsTodo.notify';
const pushOk = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && (!isIOS() || isStandalone());
function noteSt() { try { return JSON.parse(localStorage.getItem(NOTE_KEY) || '{}') || {}; } catch (e) { return {}; } }
(() => { try { const o = JSON.parse(localStorage.getItem('sarahsTodo.notify') || '{}') || {}; if (!o.on && o.hide && !o.shop110) { delete o.hide; o.shop110 = 1; localStorage.setItem('sarahsTodo.notify', JSON.stringify(o)); } } catch (e) { } })();
function noteSave(o) { try { localStorage.setItem(NOTE_KEY, JSON.stringify(o)); } catch (e) { } }
const notifyIsOn = () => pushOk() && Notification.permission === 'granted' && !!noteSt().on;
let noteBusy = false;
function notifyCard() {
  if (!pushOk() || notifyIsOn() || Notification.permission === 'denied' || noteSt().hide) return '';
  return `<div class="card installcard" id="notifycard"><div><div class="t" style="font-weight:700">Turn on notifications?</div>
    <div class="muted">Get a notification with the full details when Shane adds to your lists or appointments, and when your reminders are due (plus the odd little note during the day).</div></div>
    <div style="display:flex;flex-direction:column;gap:6px;flex:none"><button class="btn primary small" id="notifyon" onclick="notifyOn()">Turn on</button><button class="btn small" onclick="notifyLater()">Not now</button></div></div>`;
}
/* 1.10.0: when Shane adds to the shared Shopping list, the relay sends one notification per batch
   ('Shane added to shopping: Milk, Bread'), using the notifications above. In the app, a 'From Shane' card shows them too. */
const SEEN_SHANE = 'sarahsTodo.shopSeen';
function shopSeen() { try { return JSON.parse(localStorage.getItem(SEEN_SHANE) || '[]') || []; } catch (e) { return []; } }
function shaneShopNew() { const seen = new Set(shopSeen()), since = Date.now() - 864e5; return S.todos.filter(t => t && t.by === 'shane' && isShop(t) && !t.done && +t.created >= since && !seen.has(t.id)).sort((a, b) => b.created - a.created); }
function shaneShopCard() {
  const L = shaneShopNew(); if (!L.length) return '';
  const nm = t => { const b = t.brand, br = b && !b.any && !b.other ? String(b.brand || '').trim() : ''; return br && !t.title.toLowerCase().includes(br.toLowerCase()) ? `${t.title} (${br})` : t.title; };
  const names = L.slice(0, 6).map(nm).join(', ') + (L.length > 6 ? ` and ${L.length - 6} more` : '');
  return `<div class="card installcard" id="shaneshop"><div style="flex:1;min-width:0"><div class="t" style="font-weight:700">🛒 Shane added to shopping</div><div class="muted">${esc(names)}</div></div>
    <div style="display:flex;flex-direction:column;gap:6px;flex:none"><button class="btn primary small" onclick="shaneShopSee()">See list</button><button class="btn small" onclick="shaneShopOk()">Got it</button></div></div>`;
}
function shaneShopOk() { const ids = shopSeen().concat(shaneShopNew().map(t => t.id)).slice(-300); try { localStorage.setItem(SEEN_SHANE, JSON.stringify(ids)); } catch (e) { } render(); }
function shaneShopSee() { shaneShopOk(); try { go("#shopping"); } catch (e) { } }
function notifyLater() { const o = noteSt(); o.hide = true; noteSave(o); render(); }
function notifyLine() {
  if (!pushOk()) return '';
  if (notifyIsOn()) return `Notifications on · <button class="linkbtn" onclick="notifyOff()">Turn off</button>`;
  if (Notification.permission === 'denied') return 'Notifications are blocked in your phone settings for this app.';
  return `<button class="linkbtn" onclick="notifyOn()">Turn on notifications</button>`;
}
const keyBytes = k => Uint8Array.from(atob(k.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - k.length % 4) % 4)), c => c.charCodeAt(0));
async function sunPost(path, body) {
  const r = await fetch(SUN_BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ key: sharedKey() }, body)) });
  if (!r.ok) throw new Error('http ' + r.status); return r.json();
}
async function pushSub() {
  const reg = await navigator.serviceWorker.ready;
  return (await reg.pushManager.getSubscription()) || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID_PUBLIC) });
}
async function notifyOn() {
  if (noteBusy || !pushOk()) return; noteBusy = true;
  try {
    const p = await Notification.requestPermission();
    if (p !== 'granted') { toast(p === 'denied' ? 'Notifications are blocked. You can allow them in your phone settings.' : 'Notifications stay off.'); return; }
    const sub = await pushSub();
    await sunPost('subscribe', { subscription: sub.toJSON() });
    noteSave({ on: true, at: Date.now() }); toast('Notifications are on.'); remSig = ''; remSync();
  } catch (e) { toast(navigator.onLine === false ? 'You’re offline. Try again when you have signal.' : 'Sorry, notifications couldn’t be turned on. Try again later.'); }
  finally { noteBusy = false; render(); }
}
async function notifyOff() {
  try { const reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription(); if (sub) { try { await sunPost('unsubscribe', { endpoint: sub.endpoint }); } catch (e) { } await sub.unsubscribe(); } } catch (e) { }
  noteSave({ on: false, hide: true }); render(); toast('Notifications are off.');
}
// Once a day while on: make sure the relay still has this phone's current push address (it can change)
async function notifyRefresh() {
  try {
    if (!notifyIsOn() || navigator.onLine === false) return;
    const o = noteSt(); if (o.checked === todayISO()) return;
    const sub = await pushSub();
    await sunPost('subscribe', { subscription: sub.toJSON(), quiet: true });
    o.checked = todayISO(); noteSave(o);
  } catch (e) { }
}


/* ================= SCHOOL (1.2.0) =================
   Raurimu Avenue School term dates. 2026 is from the school's own website (Term Dates page), checked 11 Oct 2026.
   2027 is the Ministry of Education's set dates (the school hasn't published 2027 yet), checked 11 Oct 2026, with
   public holidays from govt.nz. No events: the school's event calendar and 2026 newsletters were empty when checked. */
const SCHOOL_NAME = 'Raurimu Avenue School';
const SRC_SCHOOL = 'raurimu.school.nz', SRC_MOE = 'education.govt.nz', SRC_GOVT = 'govt.nz';
const SCHOOL_CHECKED = '11 Oct 2026';
const SCHOOL_TERMS = [ // start, end; startFrom = earliest possible start when the school hasn't set it yet; endBy = latest possible end
  { y: 2026, n: 1, start: '2026-01-29', end: '2026-04-02', src: SRC_SCHOOL },
  { y: 2026, n: 2, start: '2026-04-20', end: '2026-07-03', src: SRC_SCHOOL },
  { y: 2026, n: 3, start: '2026-07-20', end: '2026-09-25', src: SRC_SCHOOL },
  { y: 2026, n: 4, start: '2026-10-12', end: '2026-12-10', src: SRC_SCHOOL },
  { y: 2027, n: 1, startFrom: '2027-01-28', startBy: '2027-02-03', end: '2027-04-09', src: SRC_MOE },
  { y: 2027, n: 2, start: '2027-04-27', end: '2027-07-02', src: SRC_MOE },
  { y: 2027, n: 3, start: '2027-07-19', end: '2027-09-24', src: SRC_MOE },
  { y: 2027, n: 4, start: '2027-10-11', endBy: '2027-12-17', src: SRC_MOE }
];
const SCHOOL_HOLS = [ // public holidays and other no-school days
  ['2026-01-26', 'Northland Anniversary Day', SRC_SCHOOL], ['2026-02-06', 'Waitangi Day', SRC_SCHOOL], ['2026-04-03', 'Good Friday', SRC_SCHOOL],
  ['2026-04-06', 'Easter Monday', SRC_SCHOOL], ['2026-04-07', 'Easter Tuesday (school holiday)', SRC_SCHOOL], ['2026-04-27', 'Anzac Day (observed)', SRC_SCHOOL],
  ['2026-06-01', 'King’s Birthday', SRC_SCHOOL], ['2026-07-10', 'Matariki', SRC_SCHOOL], ['2026-10-26', 'Labour Day', SRC_SCHOOL],
  ['2027-02-01', 'Northland Anniversary Day', SRC_GOVT], ['2027-02-08', 'Waitangi Day (observed)', SRC_MOE], ['2027-03-26', 'Good Friday', SRC_MOE],
  ['2027-03-29', 'Easter Monday', SRC_MOE], ['2027-03-30', 'Easter Tuesday (school holiday)', SRC_MOE], ['2027-04-26', 'Anzac Day (observed)', SRC_MOE],
  ['2027-06-07', 'King’s Birthday', SRC_MOE], ['2027-06-25', 'Matariki', SRC_MOE], ['2027-10-25', 'Labour Day', SRC_MOE]
];
const holName = iso => { const h = SCHOOL_HOLS.find(x => x[0] === iso); return h ? h[1] : ''; };
const isWknd = iso => { const d = new Date(parseD(iso)).getUTCDay(); return d === 0 || d === 6; };
const tStart = t => t.start || t.startFrom, tEnd = t => t.end || t.endBy;
function termOf(iso) { return SCHOOL_TERMS.find(t => iso >= (t.start || t.startBy) && iso <= tEnd(t)) || null; } // unset first day: counts from the latest possible start
function isSchoolDay(iso) { return !!termOf(iso) && !isWknd(iso) && !holName(iso); }
const termLabel = t => 'Term ' + t.n + (t.y !== new Date().getFullYear() ? ' ' + t.y : '');
function inWords(days) {
  if (days <= 0) return 'today'; if (days === 1) return 'tomorrow';
  if (days < 14) return 'in ' + plural(days, 'day');
  const w = Math.round(days / 7); return 'in ' + plural(w, 'week');
}
// The term (or holiday gap) we're in now, and what's next
function schoolNow(now = new Date()) {
  const iso = todayISO(now);
  const cur = termOf(iso);
  if (cur) return { iso, term: cur, endsIn: daysLeft(tEnd(cur), now) };
  const next = SCHOOL_TERMS.find(t => tStart(t) > iso);
  return { iso, next, startsIn: next ? daysLeft(tStart(next), now) : null };
}
function schoolChip(now = new Date()) {
  const n = schoolNow(now);
  if (n.term) {
    const t = n.term;
    if (n.endsIn === 0) return 'Last day of Term ' + t.n + ' today';
    return 'Term ' + t.n + ' ends ' + inWords(n.endsIn) + (t.end ? '' : ' (at the latest)');
  }
  if (n.next) return 'Term ' + n.next.n + ' starts ' + (n.next.start ? inWords(n.startsIn) : 'between ' + fmt(n.next.startFrom) + ' and ' + fmt(n.next.startBy));
  return '';
}
// One short line for the main screen
function schoolLine(now = new Date()) {
  const n = schoolNow(now), iso = n.iso;
  if (!n.term) {
    if (!n.next) return '';
    if (!n.next.start) return 'School holidays. Term ' + n.next.n + ' starts between ' + fmtW(n.next.startFrom) + ' and ' + fmtW(n.next.startBy) + ' (check with school).';
    if (n.startsIn > 21) return ''; // long way off, keep the screen quiet
    return n.startsIn === 1 ? 'Term ' + n.next.n + ' starts tomorrow, ' + fmtW(n.next.start) + '.' : 'School holidays. Term ' + n.next.n + ' starts ' + fmtW(n.next.start) + ' (' + inWords(n.startsIn) + ').';
  }
  if (isSchoolDay(iso) && now.getHours() < 15) return 'School today, 9am to 3pm.' + (iso === tEnd(n.term) && n.term.end ? ' Last day of Term ' + n.term.n + '.' : '');
  // next school day after today
  let d = addDays(iso, 1), skipped = '';
  for (let i = 0; i < 40; i++, d = addDays(d, 1)) {
    if (isSchoolDay(d)) break;
    if (!termOf(d)) { const nx = SCHOOL_TERMS.find(t => tStart(t) > iso && t !== n.term); return 'School holidays from ' + (daysLeft(d) === 1 ? 'tomorrow' : fmtW(d)) + '.' + (nx ? ' Term ' + nx.n + ' starts ' + (nx.start ? fmtW(nx.start) : 'between ' + fmt(nx.startFrom) + ' and ' + fmt(nx.startBy)) + '.' : ''); }
    if (!isWknd(d) && holName(d)) skipped = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(parseD(d)).getUTCDay()] + ' is ' + holName(d).replace(/ \(.*\)$/, '');
  }
  const today = holName(iso) ? 'No school today, ' + holName(iso).replace(/ \(.*\)$/, '') + '. ' : '';
  return today + 'Next school day: ' + (daysLeft(d) === 1 ? 'tomorrow, ' + fmtW(d) : fmtW(d)) + (skipped && !today ? ' (' + skipped + ')' : '') + '.';
}
function schoolLineCard() {
  let l = ''; try { l = schoolLine(); } catch (e) { l = ''; }
  return l ? `<button class="schoolline" onclick="go('#school')">${I('school')}<span>${esc(l)}</span>${I('right')}</button>` : '';
}
// All rows, grouped: each term with its days, then the holidays after it
function schoolGroups() {
  const out = [];
  SCHOOL_TERMS.forEach((t, i) => {
    const rows = [];
    const startIso = tStart(t), endIso = tEnd(t);
    rows.push(t.start ? { d: t.start, what: 'Term ' + t.n + ' starts', kind: 'start' } : { d: t.startFrom, d2: t.startBy, what: 'Term ' + t.n + ' starts (school picks a day in this range)', kind: 'start' });
    SCHOOL_HOLS.filter(h => h[0] >= startIso && h[0] <= endIso).forEach(h => rows.push({ d: h[0], what: h[1] + (!t.start && h[0] < t.startBy ? ' (if term has started)' : ''), kind: 'hol', src: h[2] }));
    rows.push(t.end ? { d: t.end, what: 'Last day of Term ' + t.n, kind: 'end' } : { d: t.endBy, what: 'Term ' + t.n + ' ends (no later than this)', kind: 'end' });
    out.push({ key: t.y + '-' + t.n, title: 'Term ' + t.n + ' ' + t.y, range: (t.start ? fmtW(t.start) : fmt(t.startFrom) + '–' + fmt(t.startBy)) + ' to ' + (t.end ? fmtW(t.end) : 'by ' + fmtW(t.endBy)), from: startIso, to: endIso, rows, src: t.src });
    const nx = SCHOOL_TERMS[i + 1];
    const hFrom = addDays(endIso, 1);
    if (nx) {
      const hTo = addDays(tStart(nx), -1);
      const hrows = SCHOOL_HOLS.filter(h => h[0] >= hFrom && h[0] <= hTo).map(h => ({ d: h[0], what: h[1], kind: 'hol', src: h[2] }));
      const summer = nx.y !== t.y;
      out.push({ key: t.y + '-' + t.n + 'h', hol: true, title: summer ? 'Summer holidays' : 'Holidays after Term ' + t.n, range: fmtW(hFrom) + ' to ' + (nx.start ? fmtW(hTo) : 'late Jan / early Feb'), from: hFrom, to: hTo, rows: hrows, src: t.src });
    } else out.push({ key: t.y + '-' + t.n + 'h', hol: true, title: 'Summer holidays', range: 'From ' + (t.end ? fmtW(hFrom) : 'mid December'), from: hFrom, to: addDays(hFrom, 40), rows: [], src: t.src });
  });
  return out;
}
function srcText(src) {
  return src === SRC_SCHOOL ? 'From the school’s website (' + SRC_SCHOOL + '), checked ' + SCHOOL_CHECKED
    : src === SRC_MOE ? 'Ministry term dates (' + SRC_MOE + '), checked ' + SCHOOL_CHECKED + '. Check with school for teacher-only days.'
      : 'Public holiday dates from ' + SRC_GOVT + ', checked ' + SCHOOL_CHECKED;
}
function schoolRow(r) {
  const tag = r.kind === 'hol' ? (isWknd(r.d) ? '<span class="stag wk">Weekend</span>' : '<span class="stag hol">No school</span>') : r.kind === 'start' ? '<span class="stag st">Start</span>' : '<span class="stag en">End</span>';
  const dl = daysLeft(r.d), when = r.d2 ? fmtW(r.d) + ' – ' + fmtW(r.d2) : fmtW(r.d);
  const soon = !r.d2 && dl >= 0 && dl <= 60 ? `<span class="muted"> · ${dl === 0 ? 'today' : dl === 1 ? 'tomorrow' : 'in ' + plural(dl, 'day')}</span>` : '';
  const cal = r.d2 ? '' : `<button class="calbtn" aria-label="Add to phone calendar: ${esc(r.what)}" onclick="schoolIcs(${jsArg(r.d)},${jsArg(r.what)})">${I('cal')}</button>`;
  return `<div class="srow ${r.kind}"><div class="tx"><div class="t">${esc(r.what)}</div><div class="s">${esc(when)}${soon}</div></div>${tag}${cal}</div>`;
}
function School() {
  const today = todayISO(), gs = schoolGroups();
  const up = gs.filter(g => g.to >= today), past = gs.filter(g => g.to < today);
  const grp = g => `<div class="card sgrp${g.hol ? ' holgrp' : ''}${g.from <= today && g.to >= today ? ' now' : ''}"><div class="sgh"><div class="sgt">${esc(g.title)}${g.from <= today && g.to >= today ? ' <span class="nowtag">Now</span>' : ''}</div><div class="sgr">${esc(g.range)}</div></div>
    ${g.rows.length ? g.rows.map(schoolRow).join('') : ''}${g.hol ? '' : `<div class="ssrc">${esc(srcText(g.src))}</div>`}</div>`;
  const chip = schoolChip();
  const body = isTrello()
    ? tbBoard(up.map(g => tbCol(g.title + (g.from <= today && g.to >= today ? ' · Now' : ''), g.rows.length, grp(g))))
    : up.map(grp).join('');
  return header('School', SCHOOL_NAME + ', Onerahi', layoutBtn() + themeDots()) +
    (chip ? `<div class="schip">${esc(chip)}</div>` : '') +
    `<div class="muted shours">School day 9am to 3pm. Closed on weekends and public holidays.</div>` +
    body +
    (past.length ? `<details class="spast"><summary>Earlier this year (${past.filter(g => !g.hol).length} ${past.filter(g => !g.hol).length === 1 ? 'term' : 'terms'})</summary>${past.map(grp).join('')}</details>` : '') +
    themePicker() +
    `<div class="foot">2026 dates are from the school’s website (${SRC_SCHOOL}). 2027 dates are the Ministry of Education’s term dates; the school may add teacher-only days or set its own first and last day, so check with the school. Holiday dates from ${SRC_MOE} and ${SRC_GOVT}. All checked ${SCHOOL_CHECKED}.<br>Tap ${I('cal')} to add a date to your phone’s calendar.</div>`;
}
function schoolIcs(iso, what) {
  const d = iso.replace(/-/g, ''), d2 = addDays(iso, 1).replace(/-/g, '');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sarahs To-do//School//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', 'UID:school-' + d + '-' + what.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 30) + '@sarahs-todo',
    'DTSTAMP:' + stamp, 'DTSTART;VALUE=DATE:' + d, 'DTEND;VALUE=DATE:' + d2, 'SUMMARY:' + (what + ' (' + SCHOOL_NAME + ')').replace(/[,;]/g, m => '\\' + m), 'TRANSP:TRANSPARENT', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const a = document.createElement('a'); a.href = url; a.download = 'school-' + iso + '.ics'; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 2000);
  toast('Opening it in your calendar…');
}
const curPage = () => { const h = (location.hash || "").replace("#", ""); return h === "shopping" || h === "shop" ? "shopping" : h === "school" ? "school" : h === "appts" || h === "pets" ? "appts" : "todo"; };
const pageTabs = () => { const sc = S && S.todos ? S.todos.filter(t => isShop(t) && !t.done).length : 0; return `<div class="ptabs" role="tablist"><button role="tab" class="${curPage() === "todo" ? "on" : ""}" onclick="go('#todo')">${I("check")} To-do</button><button role="tab" class="${curPage() === "shopping" ? "on" : ""}" onclick="go('#shopping')">${I("cart")} Shopping${sc ? ` (${sc})` : ""}</button><button role="tab" class="${curPage() === "appts" ? "on" : ""}" onclick="go('#appts')">${I("paw")} Car &amp; pets</button><button role="tab" class="${curPage() === "school" ? "on" : ""}" onclick="go('#school')">${I("school")} School</button></div>`; };


/* ================= CAR & APPOINTMENTS (1.4.0) =================
   My car: the Haval's WOF, rego and service dates, sent by Shane's app (only this car). Read-only here.
   Appointments: doctor, dentist and other. Shared with Shane by default (his calendar shows them with a pink S);
   untick "Share with Shane" to keep one just on this phone. Reminders show in the app, and the .ics file has an alarm
   so the phone's own calendar can remind too. */
const APPT_TYPES = { doctor: ['Doctor', 'stetho'], dentist: ['Dentist', 'tooth'], other: ['Other', 'cal'] };
const APPT_REMIND = [['', 'No reminder'], ['0', 'At the time'], ['30', '30 minutes before'], ['60', '1 hour before'], ['120', '2 hours before'], ['1440', '1 day before']];
const CAR_URL = 'https://due-dates-calendar-relay.phoneapp12.workers.dev/shared-car';
const apptView = a => Object.assign({ id: a.id, title: a.title, list: 'Appointments', due: a.date, notes: a.notes || '', priority: 'normal', done: false, created: a.created, by: a.by === 'shane' ? 'shane' : 'sarah', appt: { type: a.type, time: a.time || '', place: a.place || '' }, _appt: a }, a.claim ? { claim: a.claim } : {});
function apptFromShared(s) { const x = s.appt || {}; return { id: s.id, type: APPT_TYPES[x.type] ? x.type : 'other', title: String(s.title || '').slice(0, 80), date: s.due || todayISO(), time: x.time || '', place: x.place || '', notes: s.notes || '', remind: s.by === 'shane' ? '60' : '', private: false, created: s.created || Date.now(), claim: claimNorm(s.claim), ...(s.by === 'shane' ? { by: 'shane' } : {}) }; }
let carBusy = false, carErr = false;
function mergeSharedPets(remote) {
  if (!Array.isArray(remote)) return false;
  const del = (S.settings.petsDel && typeof S.settings.petsDel === 'object') ? S.settings.petsDel : (S.settings.petsDel = {});
  const cur = Array.isArray(S.pets) ? S.pets : (S.pets = []);
  const byId = new Map(cur.map(p => [p.id, p]));
  let changed = false;
  remote.forEach(rp => {
    if (!rp || typeof rp !== 'object' || !rp.id) return;
    const ru = Number(rp.updated) || 0;
    if (rp.deleted) {
      const ex = byId.get(rp.id);
      if (ex && (Number(ex.updated) || 0) <= ru) { byId.delete(rp.id); del[rp.id] = ru || Date.now(); changed = true; }
      else if (!ex && !del[rp.id]) { del[rp.id] = ru || Date.now(); }
      return;
    }
    if (del[rp.id] && del[rp.id] > ru) return;
    const ex = byId.get(rp.id) || [...byId.values()].find(x => x.name.toLowerCase() === String(rp.name || '').trim().toLowerCase());
    if (!ex) {
      const np = normPets([rp], S.settings)[0];
      if (np) { delete del[np.id]; byId.set(np.id, np); changed = true; }
      return;
    }
    const lu = Number(ex.updated) || 0;
    if (ru > lu) {
      const np = normPets([Object.assign({}, rp, { id: ex.id })], S.settings)[0];
      if (np && JSON.stringify(np) !== JSON.stringify(ex)) { byId.set(ex.id, np); changed = true; }
    }
  });
  if (changed) S.pets = [...byId.values()];
  return changed;
}
async function carRefresh() {
  if (carBusy || navigator.onLine === false || !S) return;
  carBusy = true;
  try {
    const del = (S.settings && S.settings.petsDel) || {};
    const petsPayload = (S.pets || []).concat(Object.entries(del).map(([id, updated]) => ({ id, deleted: true, updated: Number(updated) || 1 })));
    const r = await fetch(CAR_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: sharedKey(), pets: petsPayload }) });
    if (!r.ok) throw new Error('http ' + r.status);
    const d = await r.json(); carErr = false;
    const hadCar = JSON.stringify(S.car || null), nowCar = d && d.car && d.car.plate ? d.car : null;
    let changed = false;
    if (nowCar && JSON.stringify(nowCar) !== hadCar) { S.car = nowCar; changed = true; }
    if (d && Array.isArray(d.pets) && mergeSharedPets(d.pets)) changed = true;
    if (changed) { sharedApplying = true; try { await save(); } finally { sharedApplying = false; } if (!sheetOpen && curPage() !== 'school') render(); }
  } catch (e) { carErr = true; } finally { carBusy = false; }
}
const chipFor = d => d < 0 ? `<span class="cchip over">${-d} day${d === -1 ? '' : 's'} overdue</span>` : d === 0 ? '<span class="cchip soon">Today</span>' : d < 14 ? `<span class="cchip soon">${d === 1 ? 'Tomorrow' : d + ' days'}</span>` : `<span class="cchip ok">${d < 60 ? d + ' days' : Math.round(d / 30.4) + ' months'}</span>`;
const CAR_PARTS = [['wof', 'Warrant of fitness (WOF)', 'WOF'], ['rego', 'Registration', 'Rego'], ['svc', 'Service', 'Service']];
function carCard() {
  const c = S.car;
  const name = 'My car — Haval H6' + (c && c.plate ? ' (' + c.plate + ')' : ' (PNU312)');
  if (!c) return `<div class="card carcard" id="carcard"><div class="cch">${I('car')}<b>${esc(name)}</b></div><p class="muted" style="margin:6px 0 0">Waiting for dates from Shane’s app. They’ll show here once his app has been opened with your car’s dates in it.</p></div>`;
  const rows = CAR_PARTS.map(([k, long, short]) => { const v = c[k]; if (k === 'wof' && v && wofSt(c).st !== 'due') return wofRow(c);
    if (!v) return `<div class="crow"><div class="tx"><div class="t">${long}</div><div class="s">Not set yet</div></div></div>`;
    const d = daysLeft(v); return `<div class="crow ${d < 0 ? 'over' : d < 14 ? 'soon' : ''}"><div class="tx"><div class="t">${long}</div><div class="s">Due ${esc(fmtLong(v))}${k === 'svc' && c.svcKm ? ' or at ' + Number(c.svcKm).toLocaleString('en-NZ') + ' km' : ''}</div></div>${chipFor(d)}<button type="button" class="iconbtn sm" aria-label="Add ${short} to my phone’s calendar" onclick="carIcs('${k}')">${I('cal')}</button></div>`; }).join('');
  return `<div class="card carcard" id="carcard"><div class="cch">${I('car')}<b>${esc(name)}</b></div>${rows}
    <p class="muted" style="margin:8px 0 0;font-size:0.8125rem">Shane keeps these up to date in his app.${c.odo ? ' Odometer about ' + Number(c.odo).toLocaleString('en-NZ') + ' km.' : ''}</p></div>`;
}
/* 1.11.0: WOF status from Shane's app (read-only here): due, in progress (recheck date, fixes) or passed */
function wofSt(c) { const w = c && c.wofSt; return w && ['due', 'doing', 'done'].includes(w.st) ? w : { st: 'due' }; }
function wofRow(c) {
  const w = wofSt(c);
  if (w.st === 'done') return `<div class="crow wofdone" id="wofrow"><div class="tx"><div class="t">Warrant of fitness (WOF)</div><div class="s">WOF passed${w.passed ? ' ' + esc(fmtW(w.passed)) : ''} · next due ${esc(fmtLong(c.wof))}</div></div><span class="cchip ok">Passed ✓</span><button type="button" class="iconbtn sm" aria-label="Add WOF to my phone’s calendar" onclick="carIcs('wof')">${I('cal')}</button></div>`;
  const rd = w.recheck ? daysLeft(w.recheck) : null, F = Array.isArray(w.fixes) ? w.fixes : [], dn = F.filter(f => f.d).length;
  const when = rd == null ? 'Shane is sorting it' : `recheck by ${esc(fmtW(w.recheck))} (${rd > 1 ? rd + ' days' : rd === 1 ? 'tomorrow' : rd === 0 ? 'today' : -rd + ' day' + (rd === -1 ? '' : 's') + ' overdue'})`;
  const fx = F.length ? `<div class="woffix"><div class="wofbar"><i style="width:${Math.round(dn / F.length * 100)}%"></i></div><div class="s" style="margin:4px 0 2px">Fixes needed · ${dn} of ${F.length} done</div>${F.map(f => `<div class="wofck ${f.d ? 'on' : ''}"><span>${f.d ? '✓' : ''}</span>${esc(f.t)}</div>`).join('')}</div>` : '';
  return `<div class="crow wofdoing${rd != null && rd < 0 ? ' over' : ''}" id="wofrow" style="flex-wrap:wrap"><div class="tx"><div class="t">Warrant of fitness (WOF)</div><div class="s">In progress · ${when}</div></div><span class="cchip prog">In progress</span>${fx}</div>`;
}
function carSoonLine() {
  const c = S.car; if (!c) return '';
  const ws = wofSt(c);
  if (ws.st === 'doing') { const rd = ws.recheck ? daysLeft(ws.recheck) : null; return `<button class="schoolline carline prog${rd != null && rd < 0 ? ' over' : ''}" onclick="go('#appts')">${I('car')}<span>Car WOF in progress${ws.recheck ? ' · recheck by ' + esc(fmtW(ws.recheck)) + (rd >= 0 ? ` (${rd === 0 ? 'today' : rd === 1 ? 'tomorrow' : rd + ' days'})` : ' (overdue)') : ''}.</span>${I('right')}</button>`; }
  const due = CAR_PARTS.filter(([k]) => !(k === 'wof' && ws.st === 'done')).map(([k, , short]) => c[k] ? { short, d: daysLeft(c[k]) } : null).filter(x => x && x.d < 14).sort((a, b) => a.d - b.d)[0];
  if (!due) return '';
  const w = due.d < 0 ? 'is overdue' : due.d === 0 ? 'is due today' : due.d === 1 ? 'is due tomorrow' : 'is due in ' + due.d + ' days';
  return `<button class="schoolline carline${due.d < 0 ? ' over' : ''}" onclick="go('#appts')">${I('car')}<span>Car ${due.short} ${w}.</span>${I('right')}</button>`;
}
function apptSoonLine() {
  const t = todayISO(), a = S.appts.filter(x => x.date >= t && daysLeft(x.date) <= 1).sort(apptCmp)[0];
  if (!a) return '';
  return `<button class="schoolline" onclick="go('#appts')">${I(APPT_TYPES[a.type][1])}<span>${esc(a.title)} ${daysLeft(a.date) === 0 ? 'today' : 'tomorrow'}${a.time ? ' at ' + esc(fmtTm(a.time)) : ''}.</span>${I('right')}</button>`;
}
const fmtTm = hm => { const h = +hm.slice(0, 2), m = hm.slice(3); return (h % 12 || 12) + (m === '00' ? '' : ':' + m) + (h < 12 ? 'am' : 'pm'); };
const apptCmp = (a, b) => a.date.localeCompare(b.date) || (a.time || '99').localeCompare(b.time || '99');
function icsFold(line) { const out = []; let s = line; while (s.length > 74) { out.push(s.slice(0, 74)); s = ' ' + s.slice(74); } out.push(s); return out.join('\r\n'); }
const icsEsc = s => String(s || '').replace(/[\\,;]/g, m => '\\' + m).replace(/\n/g, '\\n');
function icsSave(name, lines) {
  const blob = new Blob([lines.map(icsFold).join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
  const el = document.createElement('a'); el.href = URL.createObjectURL(blob); el.download = name.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') + '.ics';
  document.body.appendChild(el); el.click(); setTimeout(() => { URL.revokeObjectURL(el.href); el.remove(); }, 1500);
  toast('Calendar file saved. Open it to add it to your phone’s calendar.');
}
const icsStamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
function carIcs(k) {
  const c = S.car; if (!c || !c[k]) return; const p = CAR_PARTS.find(x => x[0] === k), d = c[k].replace(/-/g, '');
  icsSave('car-' + p[2] + '-' + c[k], ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sarahs To-do//Car//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', 'UID:car-' + k + '-' + d + '@sarahs-todo', 'DTSTAMP:' + icsStamp(),
    'DTSTART;VALUE=DATE:' + d, 'DTEND;VALUE=DATE:' + addDays(c[k], 1).replace(/-/g, ''), 'SUMMARY:' + icsEsc('Haval ' + p[2] + ' due (' + (c.plate || 'PNU312') + ')'), 'TRANSP:TRANSPARENT',
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc('Haval ' + p[2] + ' due'), 'TRIGGER:-P7D', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR']);
}
function apptIcs(id) {
  const a = S.appts.find(x => x.id === id); if (!a) return; const d = a.date.replace(/-/g, '');
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sarahs To-do//Appointments//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT', 'UID:' + a.id + '@sarahs-todo', 'DTSTAMP:' + icsStamp()];
  if (a.time) { L.push('DTSTART:' + d + 'T' + a.time.replace(':', '') + '00', 'DURATION:PT1H'); } else L.push('DTSTART;VALUE=DATE:' + d, 'DTEND;VALUE=DATE:' + addDays(a.date, 1).replace(/-/g, ''));
  L.push('SUMMARY:' + icsEsc(a.title)); if (a.place) L.push('LOCATION:' + icsEsc(a.place)); if (a.notes) L.push('DESCRIPTION:' + icsEsc(a.notes));
  if (a.remind !== '') L.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc(a.title), 'TRIGGER:-PT' + (+a.remind) + 'M', 'END:VALARM');
  L.push('END:VEVENT', 'END:VCALENDAR'); icsSave(a.title || 'appointment', L);
}
const apptStart = a => { const [y, m, d] = a.date.split('-').map(Number); const [h, mi] = (a.time || '09:00').split(':').map(Number); return new Date(y, m - 1, d, h, mi); };
function dueReminders(now = new Date()) {
  return S.appts.filter(a => a.remind !== '' && !S.settings.seenRem.includes(a.id + '|' + a.date)).filter(a => {
    const st = apptStart(a), from = new Date(st.getTime() - (+a.remind) * 60000), end = a.time ? new Date(st.getTime() + 3600e3) : new Date(st.getFullYear(), st.getMonth(), st.getDate(), 23, 59);
    return now >= from && now <= end;
  });
}
function remindBanner() {
  return dueReminders().map(a => `<div class="callout remind" data-k="${esc(a.id)}">${I('bell')}<div style="flex:1"><b>Reminder: ${esc(a.title)}</b><br>${daysLeft(a.date) === 0 ? 'Today' : fmtW(a.date)}${a.time ? ' · ' + esc(fmtTm(a.time)) : ''}${a.place ? ' · ' + esc(a.place) : ''}</div><button class="btn small" onclick="dismissRem('${a.id}|${a.date}')">OK</button></div>`).join('');
}
async function dismissRem(k) { S.settings.seenRem = S.settings.seenRem.concat(k).slice(-200); await save(); render(); }
/* 1.13.0: her upcoming reminders go to the relay so her phone gets them (full details) even when the app is closed.
   Appointments with a reminder set, and shared to-dos due (8am on the day). Private items: no notes; private to-dos stay on the phone. */
let remSig = '';
function remPayload(now = Date.now()) {
  const out = [], lim = now + 30 * 864e5;
  for (const a of S.appts) { if (a.remind === '' || !a.date) continue; const st = apptStart(a).getTime(), at = st - (+a.remind) * 60000; if (at < now - 6e5 || at > lim) continue;
    out.push({ id: 'ap|' + String(a.id).replace(/[^\w.-]/g, '') + '|' + a.date, at, url: './#appts', title: '\u{1F4C5} Reminder: ' + a.title, body: [fmtW(a.date), a.time ? fmtTm(a.time) : '', a.place, a.private ? '' : a.notes].filter(Boolean).join(' · ').slice(0, 300) }); }
  for (const t of S.todos) { if (t.done || t.private || !t.due) continue; const [y, m, d] = t.due.split('-').map(Number), at = new Date(y, m - 1, d, 8, 0).getTime(); if (at < now - 6e5 || at > lim) continue;
    out.push({ id: 'td|' + String(t.id).replace(/[^\w.-]/g, '') + '|' + t.due, at, url: './', title: '\u{1F4CB} Due today: ' + t.title, body: [t.list, t.priority === 'high' ? 'High priority' : '', t.notes].filter(Boolean).join(' · ').slice(0, 300) }); }
  return out.sort((a, b) => a.at - b.at).slice(0, 60);
}
async function remSync() {
  try { if (!notifyIsOn() || navigator.onLine === false) return; const r = remPayload(), sig = JSON.stringify(r); if (sig === remSig) return;
    await sunPost('reminders', { reminders: r }); remSig = sig; } catch (e) { }
}
setInterval(remSync, 60000); setTimeout(remSync, 5000);
setInterval(() => { try { const k = dueReminders().map(a => a.id).join(); if (k !== (window.__remK || '')) { window.__remK = k; if (!sheetOpen) render(); } } catch (e) { } }, 30000);
function apptRow(a) {
  const d = daysLeft(a.date), [tn, ic] = APPT_TYPES[a.type];
  return `<button class="row apptrow" data-id="${esc(a.id)}" onclick="apptForm('${a.id}')"><div class="aic ${a.type}">${I(ic)}</div><div class="tx"><div class="t">${shaneBadge(a)}${esc(a.title)}</div>
    <div class="s">${esc(fmtW(a.date))}${a.time ? ' · ' + esc(fmtTm(a.time)) : ''}${a.place ? ' · ' + esc(a.place) : ''}${a.private ? ' · just me' : ''}${a.claim && a.claim.status !== 'none' ? ' · claim ' + CLAIM_ST[a.claim.status].toLowerCase() : ''}${a.remind !== '' ? ' · ' + I('bell', 'style="width:12px;height:12px;vertical-align:-1px"') : ''}</div></div>${d >= 0 ? chipFor(d).replace('cchip ok', 'cchip ok') : ''}</button>`;
}
/* ================= PETS (1.14.0): Zeus, Mindy & Silken + duplicate pet appointments ================= */
const PET_KIND = { dog: ['Dog', '🐶'], cat: ['Cat', '🐱'], other: ['Pet', '🐾'] };
const CARE_IC = { flea: 'drop', worm: 'pill', vacc: 'syringe', groom: 'scissors', check: 'stetho', reg: 'idcard', custom: 'paw' };
const PET_NAME_RE = /\b(zeus|mindy|silken)\b/i;
function petNameHit(text, petName) {
  const s = String(text || '');
  if (!s) return false;
  if (petName) {
    const escRe = String(petName).trim().replace(/[.*+?^$()|[\]\\{}]/g, m => '\\' + m);
    return escRe ? new RegExp('\\b' + escRe + '\\b', 'i').test(s) : false;
  }
  if (PET_NAME_RE.test(s)) return true;
  return (S.pets || []).some(p => p && p.name && petNameHit(s, p.name));
}
// Any appointment (or dated to-do) with Zeus, Mindy, or Silken in the name is shown in Pets as a duplicate
function petDupAppts(petName) {
  const out = [], seen = new Set();
  const push = x => {
    if (!x.date || parseD(x.date) == null) return;
    const k = x.title.toLowerCase().trim() + '|' + x.date + '|' + (x.time || '');
    if (seen.has(k)) return;
    seen.add(k);
    x.days = daysLeft(x.date);
    out.push(x);
  };
  (S.appts || []).forEach(a => {
    if (!a || !a.title || !a.date) return;
    if (!petNameHit(a.title, petName)) return;
    push({ id: 'ap:' + a.id, apptId: a.id, title: a.title, date: a.date, time: a.time || '', place: a.place || '', src: 'Appointments', by: a.by });
  });
  (S.todos || []).forEach(t => {
    if (!t || t.done || !t.title || !t.due) return;
    if (!petNameHit(t.title, petName)) return;
    push({ id: 'td:' + t.id, todoId: t.id, title: t.title, date: t.due, time: '', place: '', src: t.list || 'To-do', by: t.by });
  });
  return out.sort((a, b) => a.days - b.days || (a.time || '99').localeCompare(b.time || '99') || a.title.localeCompare(b.title));
}
function petDupRow(a) {
  const act = a.apptId ? `apptForm('${a.apptId}')` : `todoForm('${a.todoId}')`;
  return `<button type="button" class="row apptrow" onclick="${act}"><div class="aic">${I('cal')}</div><div class="tx"><div class="t">${shaneBadge(a)}${esc(a.title)}<span class="petdup-tag">Duplicate · ${esc(a.src)}</span></div>
    <div class="s">${esc(fmtW(a.date))}${a.time ? ' · ' + esc(fmtTm(a.time)) : ''}${a.place ? ' · ' + esc(a.place) : ''}</div></div>${chipFor(a.days)}</button>`;
}
function petSoonLine() {
  const due = petDueItems(S.pets || []).filter(x => x.days <= 7)[0];
  if (!due) return '';
  const w = due.days < 0 ? 'is overdue' : due.days === 0 ? 'is due today' : due.days === 1 ? 'is due tomorrow' : 'is due in ' + due.days + ' days';
  return `<button class="schoolline carline${due.days < 0 ? ' over' : ''}" onclick="go('#pets')">${I('paw')}<span>${esc(due.title)} ${w}.</span>${I('right')}</button>`;
}
function petsCard() {
  const pets = S.pets || [];
  const allDups = petDupAppts();
  const petRow = p => {
    const [kname, emo] = PET_KIND[p.kind] || PET_KIND.dog;
    const sub = [p.breed || kname, p.vet ? 'Vet: ' + p.vet : ''].filter(Boolean).join(' · ');
    const items = (p.care || []).map(it => { const d = careDue(it); return { it, d, days: d ? daysLeft(d) : 99999 }; }).sort((a, b) => a.days - b.days);
    const withDates = items.filter(x => x.d);
    const pDups = petDupAppts(p.name);
    return `<div class="petsub" role="button" tabindex="0" onclick="petSheet('${p.id}')">
      <div class="petav" aria-hidden="true">${emo}</div>
      <div class="tx">
        <div class="t">${esc(p.name)}</div>
        <div class="s">${esc(sub)}</div>
        ${withDates.length || pDups.length ? `<div class="petmini">
          ${withDates.slice(0, 3).map(({ it, d, days }) => `<div class="petmline"><span class="n">${esc(it.name)} · ${esc(fmt(d))}</span>${chipFor(days)}</div>`).join('')}
          ${pDups.map(a => `<div class="petmline"><span class="n">📅 ${esc(a.title)} · ${esc(fmtW(a.date))}${a.time ? ' ' + esc(fmtTm(a.time)) : ''}</span>${chipFor(a.days)}</div>`).join('')}
        </div>` : `<div class="s" style="margin-top:4px;color:var(--brand);font-weight:650">Tap to set flea, worming, vaccine or vet dates</div>`}
      </div>
      ${I('right')}
    </div>`;
  };
  return `<div class="card carcard" id="petscard">
    <div class="cch">${I('paw')}<b>Pets — Zeus, Mindy &amp; Silken</b><button type="button" class="linkbtn" style="margin-left:auto;font-size:0.8125rem" onclick="petEditSheet()">+ Add pet</button></div>
    <p class="muted" style="margin:4px 0 8px;font-size:0.8125rem">Shared with Shane’s app. Any appointment with <b>Zeus</b>, <b>Mindy</b>, or <b>Silken</b> in the name also shows here automatically as a duplicate.</p>
    ${allDups.length ? `<div class="subhead" style="margin:8px 2px 6px">Pet appointments (Zeus, Mindy &amp; Silken)</div><div class="list" style="margin-bottom:8px">${allDups.map(petDupRow).join('')}</div>` : ''}
    ${pets.map(petRow).join('')}
    <div class="btns" style="margin-top:10px">
      <button type="button" class="btn small" onclick="petApptPick()">${I('cal')} + Pet appointment</button>
      <button type="button" class="btn small" onclick="petEditSheet()">${I('plus')} Add a pet</button>
    </div>
  </div>`;
}
function petApptPick(petName) {
  if (petName) { apptForm(null, 'other', petName + ' — Vet'); return; }
  const names = (S.pets || []).map(p => p.name);
  const def = (names[0] || 'Zeus') + ' — Vet';
  apptForm(null, 'other', def);
}
function petSheet(id) {
  const p = (S.pets || []).find(x => x.id === id); if (!p) return;
  const [kname, emo] = PET_KIND[p.kind] || PET_KIND.dog;
  const items = (p.care || []).map(it => { const d = careDue(it); return { it, d, days: d ? daysLeft(d) : 99999 }; }).sort((a, b) => a.days - b.days);
  const pDups = petDupAppts(p.name);
  const cRow = ({ it, d, days }) => {
    const sub = [careEvery(it), it.last ? 'Last done ' + fmt(it.last) : 'Not done yet', d ? 'Due ' + fmtW(d) : '', it.notes].filter(Boolean).join(' · ');
    return `<div class="crow ${d && days < 0 ? 'over' : ''}" style="flex-wrap:wrap">
      <div class="tx" style="cursor:pointer" onclick="careSheet('${p.id}','${it.id}')"><div class="t">${esc(it.name)}</div><div class="s">${esc(sub)}</div></div>
      ${d ? chipFor(days) : ''}
      <button type="button" class="btn small primary" style="flex:none;padding:7px 11px;min-height:36px" onclick="careDone('${p.id}','${it.id}')">✓ Done</button>
      ${d ? `<button type="button" class="iconbtn sm" aria-label="Add to phone calendar" onclick="petCareIcs('${p.id}','${it.id}')">${I('cal')}</button>` : ''}
    </div>`;
  };
  const info = [
    p.bday ? `<div><b>Birthday:</b> ${esc(fmtY(p.bday))}</div>` : '',
    p.chip ? `<div><b>Microchip:</b> ${esc(p.chip)}</div>` : '',
    p.regNo ? `<div><b>Dog registration:</b> ${esc(p.regNo)}${p.council ? ' (' + esc(p.council) + ')' : ''}</div>` : '',
    p.vet ? `<div><b>Vet:</b> ${esc(p.vet)}${p.vetPhone ? ` · <a href="tel:${esc(p.vetPhone.replace(/\s+/g, ''))}" style="color:var(--brand);font-weight:700">${esc(p.vetPhone)}</a>` : ''}</div>` : '',
    p.notes ? `<div><b>Notes:</b> ${esc(p.notes)}</div>` : ''
  ].filter(Boolean).join('');
  openSheet(`${emo} ${p.name}`,
    `<p class="muted" style="margin:-6px 2px 10px">${esc(p.breed || kname)} · Shared with Shane’s app</p>` +
    `<div class="btns" style="margin:0 0 10px">
      <button type="button" class="btn small" onclick="petEditSheet('${p.id}')">${I('edit')} Edit ${esc(p.name)}</button>
      <button type="button" class="btn small" onclick="careSheet('${p.id}')">${I('plus')} Add care item</button>
      <button type="button" class="btn small" onclick="petApptPick(${jsArg(p.name)})">${I('cal')} + Appointment</button>
      ${p.vetPhone ? `<a class="btn small primary" href="tel:${esc(p.vetPhone.replace(/\s+/g, ''))}">${I('call')} Call vet</a>` : ''}
    </div>` +
    (pDups.length ? `<div class="subhead">Appointments with ${esc(p.name)} (duplicate)</div><div class="list" style="margin-bottom:10px">${pDups.map(petDupRow).join('')}</div>` : '') +
    `<div class="subhead">Care &amp; treatments</div>` +
    (items.length ? `<div>${items.map(cRow).join('')}</div>` : `<p class="muted">No care items yet.</p>`) +
    (info ? `<div class="subhead" style="margin-top:12px">Details</div><div class="card" style="padding:10px 12px;font-size:0.875rem;line-height:1.55">${info}</div>` : '') +
    `<div class="subhead" style="margin-top:12px;display:flex;align-items:center;justify-content:space-between"><span>History</span><button type="button" class="linkbtn" onclick="histSheet('${p.id}')">+ Log entry</button></div>` +
    ((p.history || []).length ? `<div class="list">${p.history.slice(0, 12).map(h => `<button type="button" class="row" onclick="histSheet('${p.id}','${h.id}')"><div class="tx"><div class="t">${esc(h.what)}</div><div class="s">${esc(fmtY(h.date))}${h.notes ? ' · ' + esc(h.notes) : ''}</div></div></button>`).join('')}</div>` : `<p class="muted" style="font-size:0.8125rem">Each time you tap ✓ Done, it’s logged here.</p>`),
    null);
}
function careDone(petId, careId) {
  const p = (S.pets || []).find(x => x.id === petId), it = p && (p.care || []).find(c => c.id === careId);
  if (!it) return;
  const today = todayISO(), next = careNextAfter(it, today);
  openSheet(`${p.name} — ${it.name} done`,
    field('Date done', inp('date', today, 'type="date" required')) +
    field('Next due date', inp('due', next, 'type="date"'), it.unit === 'none' ? 'Leave blank if it doesn’t repeat' : `Worked out as ${careEvery(it).toLowerCase()} from the date done`) +
    field('Notes (brand, weight, vet, etc.)', inp('notes', it.notes || '', 'placeholder="e.g. Bravecto chew"')),
    async v => {
      if (!parseD(v.date)) return 'Please pick the date it was done.';
      const s0 = snap();
      it.last = v.date;
      const auto = careNextAfter(it, v.date);
      it.due = v.due && parseD(v.due) != null && v.due !== auto ? v.due : '';
      it.notes = v.notes || it.notes;
      p.history = p.history || [];
      p.history.unshift({ id: uid('ph'), date: v.date, what: it.name, notes: v.notes });
      p.updated = Date.now();
      await save(); render(); carRefresh();
      const nx = careDue(it);
      toast(nx ? `${it.name} done · next due ${fmt(nx)}` : `${it.name} recorded`, 'Undo', undoTo(s0));
      return () => petSheet(petId);
    }, 'Save');
  const dIn = document.querySelector('#sf input[name="date"]'), uIn = document.querySelector('#sf input[name="due"]');
  if (dIn && uIn) dIn.addEventListener('change', () => { if (parseD(dIn.value) != null) uIn.value = careNextAfter(it, dIn.value); });
}
function careSheet(petId, careId) {
  const p = (S.pets || []).find(x => x.id === petId); if (!p) return;
  const it = careId ? (p.care || []).find(c => c.id === careId) : { kind: 'custom', name: '', every: 1, unit: 'months', last: '', due: '', notes: '' };
  if (!it) return;
  const isReg = it.kind === 'reg';
  const unitOpts = [['weeks', 'Weeks'], ['months', 'Months'], ['years', 'Years'], ['none', 'Doesn’t repeat']];
  openSheet(careId ? `Edit ${it.name}` : `Add care item for ${p.name}`,
    field('What is it?', inp('name', it.name, 'placeholder="e.g. Flea treatment, Teeth check" required')) +
    (isReg ? `<p class="muted" style="margin:-4px 2px 12px">NZ dog registration is due every 1 July.</p>` :
      `<div class="two">${field('Every', inp('every', it.every || 1, 'type="number" min="1" max="60" inputmode="numeric"'))}${field('Period', sel('unit', unitOpts, it.unit))}</div>`) +
    field('Last done', inp('last', it.last, 'type="date"'), 'Leave blank if you only know the next due date') +
    field('Next due date', inp('due', it.due || careDue(it), 'type="date"'), 'Leave blank to work it out from Last done') +
    field('Notes (brand, dose, etc.)', inp('notes', it.notes, 'placeholder="e.g. NexGard Spectra"')),
    async v => {
      if (!v.name) return 'Please give this item a name.';
      const s0 = snap();
      const every = isReg ? 1 : v.unit === 'none' ? 0 : Math.max(1, Math.round(+v.every || 1));
      const unit = isReg ? 'years' : v.unit;
      const Probe = { kind: it.kind, last: v.last, every, unit, due: '' };
      const auto = careDue(Probe);
      const due = v.due && v.due !== auto ? v.due : '';
      const rec = { name: v.name, every, unit, last: v.last, due, notes: v.notes };
      if (careId) Object.assign(it, rec);
      else { p.care = p.care || []; p.care.push(Object.assign({ id: uid('pc'), kind: 'custom' }, rec)); }
      p.updated = Date.now();
      await save(); render(); carRefresh();
      toast(careId ? 'Saved.' : 'Care item added.', 'Undo', undoTo(s0));
      return () => petSheet(petId);
    }, 'Save',
    careId ? `<button type="button" class="btn danger" style="flex:0 0 auto" aria-label="Remove item" onclick="delCare('${p.id}','${it.id}')">${I('trash')}</button>` : '');
}
async function delCare(petId, careId) {
  const p = (S.pets || []).find(x => x.id === petId); if (!p) return;
  const s0 = snap(); p.care = (p.care || []).filter(c => c.id !== careId); p.updated = Date.now();
  await save(); await closeSheet(); render(); carRefresh(); toast('Removed.', 'Undo', undoTo(s0));
  petSheet(petId);
}
function petEditSheet(id) {
  const p = id ? (S.pets || []).find(x => x.id === id) : { name: '', kind: 'dog', breed: '', bday: '', chip: '', regNo: '', council: '', vet: '', vetPhone: '', notes: '' };
  if (!p) return;
  openSheet(id ? `Edit ${p.name}` : 'Add a pet',
    field('Pet’s name', inp('name', p.name, 'placeholder="e.g. Zeus" required')) +
    `<div class="field"><span>Dog or cat</span>${segHtml('kind', [['dog', '🐶 Dog'], ['cat', '🐱 Cat'], ['other', '🐾 Other']], p.kind)}</div>` +
    `<div class="two">${field('Breed', inp('breed', p.breed, 'placeholder="Optional"'))}${field('Birthday', inp('bday', p.bday, 'type="date"'))}</div>` +
    field('Microchip number', inp('chip', p.chip, 'placeholder="Optional" inputmode="numeric"')) +
    `<div id="dogfields" style="${p.kind === 'dog' ? '' : 'display:none'}">` +
      `<div class="two">${field('Registration / tag no.', inp('regNo', p.regNo, 'placeholder="Optional"'))}${field('Council', inp('council', p.council, 'placeholder="e.g. Whangārei"'))}</div>` +
    `</div>` +
    `<div class="two">${field('Vet clinic', inp('vet', p.vet, 'placeholder="Optional"'))}${field('Vet phone', inp('vetPhone', p.vetPhone, 'type="tel" placeholder="Optional"'))}</div>` +
    field('Notes (food, allergies, medication, etc.)', area('notes', p.notes)),
    async v => {
      if (!v.name) return 'Please enter your pet’s name.';
      const s0 = snap();
      const rec = { name: v.name, kind: v.kind, breed: v.breed, bday: v.bday, chip: v.chip, regNo: v.regNo, council: v.council, vet: v.vet, vetPhone: v.vetPhone, notes: v.notes, updated: Date.now() };
      let targetId = id;
      if (id) {
        const hadReg = (p.care || []).some(c => c.kind === 'reg');
        if (v.kind === 'dog' && !hadReg) p.care.push({ id: uid('pc'), kind: 'reg', name: PET_CARE.reg.name, every: 1, unit: 'years', last: '', due: '' });
        Object.assign(p, rec);
      } else {
        targetId = uid('pet');
        S.pets = S.pets || [];
        S.pets.push(Object.assign({ id: targetId, care: starterCare(v.kind), history: [] }, rec));
      }
      await save(); render(); carRefresh();
      toast(id ? 'Saved.' : `${v.name} added.`, 'Undo', undoTo(s0));
      return () => petSheet(targetId);
    }, id ? 'Save' : 'Add pet',
    id ? `<button type="button" class="btn danger" style="flex:0 0 auto" aria-label="Delete pet" onclick="delPet('${p.id}')">${I('trash')}</button>` : '');
  wireSeg('kind', k => { const d = $('#dogfields'); if (d) d.style.display = k === 'dog' ? '' : 'none'; });
}
async function delPet(id) {
  const p = (S.pets || []).find(x => x.id === id); if (!p) return;
  const s0 = snap();
  if (!S.settings.petsDel || typeof S.settings.petsDel !== 'object') S.settings.petsDel = {};
  S.settings.petsDel[id] = Date.now();
  S.pets = (S.pets || []).filter(x => x.id !== id);
  await save(); await closeSheet(); render(); carRefresh();
  toast(`${p.name} removed.`, 'Undo', undoTo(s0));
}
function histSheet(petId, histId) {
  const p = (S.pets || []).find(x => x.id === petId); if (!p) return;
  const h = histId ? (p.history || []).find(x => x.id === histId) : { date: todayISO(), what: '', notes: '' };
  if (!h) return;
  openSheet(histId ? 'Edit entry' : `Log for ${p.name}`,
    `<div class="two">${field('Date', inp('date', h.date, 'type="date" required'))}${field('What was done', inp('what', h.what, 'placeholder="e.g. Flea treatment, Vet visit" required'))}</div>` +
    field('Notes', area('notes', h.notes, 'Brand, weight, what the vet said…')),
    async v => {
      if (!parseD(v.date)) return 'Please pick a date.';
      if (!v.what) return 'Please enter what was done.';
      const s0 = snap();
      if (histId) Object.assign(h, v);
      else { p.history = p.history || []; p.history.push(Object.assign({ id: uid('ph') }, v)); }
      p.history.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
      p.updated = Date.now();
      await save(); render(); carRefresh(); toast('Saved.', 'Undo', undoTo(s0));
      return () => petSheet(petId);
    }, 'Save',
    histId ? `<button type="button" class="btn danger" style="flex:0 0 auto" aria-label="Delete entry" onclick="delHist('${p.id}','${h.id}')">${I('trash')}</button>` : '');
}
async function delHist(petId, histId) {
  const p = (S.pets || []).find(x => x.id === petId); if (!p) return;
  const s0 = snap(); p.history = (p.history || []).filter(h => h.id !== histId); p.updated = Date.now();
  await save(); await closeSheet(); render(); carRefresh(); toast('Entry deleted.', 'Undo', undoTo(s0));
  petSheet(petId);
}
function petCareIcs(petId, careId) {
  const p = (S.pets || []).find(x => x.id === petId), it = p && (p.care || []).find(c => c.id === careId);
  const due = it ? careDue(it) : ''; if (!due) return;
  const d = due.replace(/-/g, ''), title = p.name + ' — ' + it.name + ' due';
  icsSave(p.name + '-' + it.name + '-' + due, ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sarahs To-do//Pets//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', 'UID:pet-' + petId + '-' + careId + '-' + d + '@sarahs-todo', 'DTSTAMP:' + icsStamp(),
    'DTSTART;VALUE=DATE:' + d, 'DTEND;VALUE=DATE:' + addDays(due, 1).replace(/-/g, ''), 'SUMMARY:' + icsEsc(title), 'TRANSP:TRANSPARENT',
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc(title), 'TRIGGER:-P1D', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR']);
}

function Appts() {
  const t = todayISO(), up = S.appts.filter(a => a.date >= t).sort(apptCmp), past = S.appts.filter(a => a.date < t).sort((a, b) => -apptCmp(a, b));
  const top = header('Car, pets & appointments', up.length ? up.length + (up.length === 1 ? ' appointment' : ' appointments') + ' coming up' : 'Car, pets & appointments', layoutBtn() + themeDots() + addBtn('Add an appointment', 'apptForm()'));
  const quickBtns = `<div class="btns apptadd">${Object.keys(APPT_TYPES).map(k => `<button class="btn small" onclick="apptForm(null,'${k}')">${I(APPT_TYPES[k][1])} ${k === 'other' ? 'Other' : APPT_TYPES[k][0]}</button>`).join('')}<button class="btn small" onclick="petApptPick()">${I('paw')} Pet</button></div>`;
  const apptBody = quickBtns +
    (up.length ? `<div class="list" id="apptlist">${up.map(apptRow).join('')}</div>` : `<div class="card empty"><div class="t">No appointments yet</div><div class="s">Add a doctor, dentist, pet or other appointment. It goes in Shane’s calendar too, unless you untick “Share with Shane”.</div></div>`) +
    (past.length ? `<details class="spast"><summary>Past appointments (${past.length})</summary><div class="list">${past.map(apptRow).join('')}</div></details>` : '');
  if (isTrello()) {
    const cols = [
      tbCol('🐾 Pets (Zeus, Mindy & Silken)', (S.pets || []).length, petsCard()),
      tbCol('📅 Appointments', up.length, apptBody, `<button type="button" class="tbadd" onclick="apptForm()">${I('plus')} Add appointment</button>`),
      tbCol('🚗 My car (Haval H6)', 3, carCard()),
      tbCol('🧾 UniMed claims', null, claimsCard()),
      tbCol('📧 My Outlook', null, mxCard())
    ];
    return top + tbBoard(cols) + themePicker() + `<div class="foot">Appointments you share show in Shane’s calendar with your pink S. Any appointment with Zeus, Mindy, or Silken in the name also shows in Pets as a duplicate.</div>`;
  }
  return top + petsCard() + carCard() +
    mxCard() + claimsCard() + `<div class="sec">Appointments</div>` + apptBody +
    themePicker() +
    `<div class="foot">Appointments you share show in Shane’s calendar with your pink S. Any appointment with Zeus, Mindy, or Silken in the name also shows in Pets as a duplicate.</div>`;
}
function apptForm(id, type, defTitle) {
  const a = id ? S.appts.find(x => x.id === id) : { type: type || 'doctor', title: defTitle || '', date: todayISO(), time: '', place: '', notes: '', remind: '60', private: false };
  if (!a) return;
  const maps = a.place ? `<a class="btn small" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.place)}" target="_blank" rel="noopener">${I('pin')} Maps</a>` : '';
  openSheet(id ? 'Appointment' : 'Add an appointment',
    `<div class="field"><span>Type</span>${segHtml('type', Object.keys(APPT_TYPES).map(k => [k, APPT_TYPES[k][0]]), a.type)}</div>` +
    field('What for', inp('title', a.title, `placeholder="${a.type === 'dentist' ? 'e.g. Dentist check-up' : a.type === 'doctor' ? 'e.g. Doctor' : 'e.g. Physio'}" maxlength="80"`), 'Leave blank to just say Doctor or Dentist') +
    `<div class="two">${field('Date', inp('date', a.date, 'type="date" required'))}${field('Time', inp('time', a.time, 'type="time"'), 'Optional')}</div>` +
    field('Place', inp('place', a.place, 'placeholder="e.g. Onerahi Medical Centre" maxlength="160"')) +
    field('Notes', area('notes', a.notes, 'Optional')) +
    field('Reminder', sel('remind', APPT_REMIND, a.remind)) +
    (a.by === 'shane' ? `<p class="muted" id="shanenote" style="margin:4px 2px 10px">${shaneBadge(a)} Shane added this in his app. Changes go back to him.</p>` : `<label class="sharebox"><input type="checkbox" name="share" ${a.private ? '' : 'checked'}><span><b>Share with Shane</b><small>It shows in his calendar with your pink S. Untick to keep it just on your phone.</small></span></label>`) +
    (id ? `<div class="btns" style="margin-top:4px"><button type="button" class="btn small" onclick="apptIcs('${id}')">${I('cal')} Add to phone calendar</button>${maps}<button type="button" class="btn small" onclick="claimSheet('a:${id}')">${I('receipt')} UniMed claim${a.claim && a.claim.status !== 'none' ? ' · ' + CLAIM_ST[a.claim.status] : ''}</button></div>` : ''),
    async v => {
      if (!parseD(v.date)) return 'Please choose the date.';
      const tp = APPT_TYPES[v.type] ? v.type : 'other';
      const title = (v.title || (tp === 'other' ? '' : APPT_TYPES[tp][0])).slice(0, 80);
      if (!title) return 'Please say what the appointment is for.';
      const s0 = snap(), upd = { type: tp, title, date: v.date, time: v.time || '', place: v.place || '', notes: v.notes || '', remind: v.remind || '', private: a.by === 'shane' ? false : v.share !== 'on' };
      let nid = id;
      if (id) Object.assign(a, upd); else { nid = uid('ap'); S.appts.push(Object.assign({ id: nid, created: Date.now() }, upd)); }
      await save(); render();
      const msg = (id ? 'Saved' : 'Added') + (upd.private ? ', just on your phone.' : '. It’s in Shane’s calendar too.');
      if (!id && upd.remind !== '') toast(msg + ' Add it to your phone’s calendar for an alarm?', 'Add', () => apptIcs(nid)); else toast(msg, 'Undo', undoTo(s0));
    }, id ? 'Save' : 'Add',
    id ? `<button type="button" class="btn danger" style="flex:0 0 auto" aria-label="Delete appointment" onclick="apptDelete('${id}')">${I('trash')}</button>` : '');
  wireSeg('type');
}
/* ================= UNIMED SMART CLAIM HELPER (1.5.0) =================
   UniMed has no public API: claims are made by the member in the Smart Claim portal. This helper keeps the details
   ready to copy, holds the itemised invoice photo(s) on this phone (shown full screen so they can be saved or shared
   into the portal's upload), and tracks the claim: Not claimed → Draft saved → Submitted → Paid. No logins, nothing
   automated on UniMed's site. */
const UNIMED_URL = 'https://unimed.co.nz/claims';
const CLAIM_ST = { none: 'Not claimed', draft: 'Draft saved', submitted: 'Submitted', paid: 'Paid', skip: 'Not claiming' };
const CLAIM_PATIENTS = ['Sarah', 'Shane'];
const CLAIM_MIN = 10;
const CL_PHOTO_MAX = 440000; // characters of a JPEG data URL (about 320 KB): the most the relay will hold for one photo
const CL_PHOTO_URL = () => SHARED_URL.replace(/\/shared-todo$/, '/shared-photo');
const clIso = v => /^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? String(v) : '';
const claimAmtStr = v => { const n = Number(String(v == null ? '' : v).replace(/[^\d.]/g, '')); return isFinite(n) && n > 0 && n < 1e6 ? n.toFixed(2) : ''; };
const claimMoney = v => v ? '$' + Number(v).toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
function claimNorm(c) {
  if (!c || typeof c !== 'object') return null;
  const s = (v, n) => String(v == null ? '' : v).slice(0, n).trim();
  return { status: CLAIM_ST[c.status] ? c.status : 'none', patient: s(c.patient, 60), provider: s(c.provider, 120), reason: s(c.reason, 160), date: clIso(c.date),
    amount: claimAmtStr(c.amount), notes: s(c.notes, 1000), photos: (Array.isArray(c.photos) ? c.photos : []).filter(p => p && /^[\w-]{6,40}$/.test(String(p.id || ''))).slice(0, 6).map(p => Object.assign({ id: String(p.id), up: !!p.up }, p.pdf ? { pdf: true, name: String(p.name || 'invoice.pdf').slice(0, 160) } : {})),
    submittedAt: clIso(c.submittedAt), paidAt: clIso(c.paidAt), paidAmt: claimAmtStr(c.paidAmt), updated: Number(c.updated) || 0 };
}
const claimKey = c => c ? JSON.stringify([c.status, c.patient, c.provider, c.reason, c.date, c.amount, c.notes, (c.photos || []).map(p => p.id + (p.up ? '+' : '')).join(), c.submittedAt, c.paidAt, c.paidAmt]) : '';
const claimOpen = c => !c || c.status === 'none' || c.status === 'draft';
const claimChip = c => c && c.status !== 'none' ? `<span class="clchip ${c.status}">${CLAIM_ST[c.status]}${c.status === 'paid' && c.paidAmt ? ' ' + claimMoney(c.paidAmt) : ''}</span>` : '';
// Invoice photos live in their own small IndexedDB on this phone (kept out of the main save and its sync)
let clPhDbP = null;
function clPhDb() { return clPhDbP || (clPhDbP = new Promise((res, rej) => { const r = indexedDB.open('claim-photos', 1); r.onupgradeneeded = () => r.result.createObjectStore('p'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); })); }
async function clPhTx(mode, fn) { const db = await clPhDb(); return new Promise((res, rej) => { const t = db.transaction('p', mode), st = t.objectStore('p'); let out; const q = fn(st); if (q) q.onsuccess = () => { out = q.result; }; t.oncomplete = () => res(out); t.onerror = () => rej(t.error); }); }
const clPhPut = (id, data) => clPhTx('readwrite', st => st.put(data, id));
const clPhGet = id => clPhTx('readonly', st => st.get(id)).catch(() => null);
const clPhDel = id => clPhTx('readwrite', st => st.delete(id)).catch(() => null);
async function clPhCompress(file) {
  let img;
  try { img = await createImageBitmap(file); } catch (e) { img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); }); }
  let max = 1600, q = 0.72, out = '';
  for (let k = 0; k < 7; k++) {
    const w0 = img.width, h0 = img.height, sc = Math.min(1, max / Math.max(w0, h0)), c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w0 * sc)); c.height = Math.max(1, Math.round(h0 * sc));
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
    out = c.toDataURL('image/jpeg', q);
    if (out.length <= CL_PHOTO_MAX) break;
    max = Math.round(max * 0.82); q = Math.max(0.45, q - 0.07);
  }
  return out;
}
async function clPhRemote(id) {
  try {
    const r = await fetch(CL_PHOTO_URL(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: sharedKey(), id }) });
    if (!r.ok) return null; const d = await r.json();
    if (d && typeof d.data === 'string' && d.data.startsWith('data:image/')) { await clPhPut(id, d.data).catch(() => { }); return d.data; }
  } catch (e) { }
  return null;
}
async function clPhUpload(id) {
  const data = await clPhGet(id); if (!data || data.length > CL_PHOTO_MAX) return false;
  try { const r = await fetch(CL_PHOTO_URL(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: sharedKey(), id, data }) }); return r.ok; } catch (e) { return false; }
}
async function clPhLoad(p) { let d = await clPhGet(p.id); if (!d && p.up) d = await clPhRemote(p.id); return d || null; }
// Sends any photos not yet on the relay (shared claims only). Returns true if any changed.
async function claimUploadPhotos(c) {
  let changed = false;
  for (const p of (c && c.photos) || []) { if (!p.up && !p.pdf && await clPhUpload(p.id)) { p.up = true; changed = true; } }
  if (changed) c.updated = Date.now();
  return changed;
}
let clEdit = null;
function claimPhotosHtml() {
  const ph = (clEdit && clEdit.photos) || [];
  return ph.map((p, i) => p.pdf ? `<div class="clthumb clpdf" data-i="${i}"><button type="button" class="climg" onclick="clPhotoView(${i})" aria-label="Show invoice PDF"><span class="pdfic">PDF</span><small>${esc(p.name || '')}</small></button><button type="button" class="clx" aria-label="Remove PDF" onclick="claimPhotoDrop(${i})">×</button></div>` : `<div class="clthumb" data-i="${i}"><button type="button" class="climg" onclick="clPhotoView(${i})" aria-label="Show invoice photo ${i + 1}"><img alt="" data-ph="${esc(p.id)}"></button><button type="button" class="clx" aria-label="Remove photo" onclick="claimPhotoDrop(${i})">×</button></div>`).join('') ||
    '<p class="muted" style="margin:0;font-size:0.8125rem">No invoice photo yet.</p>';
}
async function claimPhotosPaint() {
  const box = document.getElementById('clph'); if (!box) return;
  box.innerHTML = claimPhotosHtml();
  for (const im of box.querySelectorAll('img[data-ph]')) {
    const p = clEdit.photos.find(x => x.id === im.dataset.ph); const d = p ? await clPhLoad(p) : null;
    if (d) im.src = d; else im.closest('.clthumb').classList.add('away');
  }
  const vb = document.getElementById('clview'); if (vb) vb.hidden = !clEdit.photos.length;
}
async function claimAddFiles(files) {
  for (const f of [...files].slice(0, 6 - clEdit.photos.length)) {
    try { const d = await clPhCompress(f), id = uid('ph'); await clPhPut(id, d); clEdit.photos.push({ id, up: false }); } catch (e) { toast('That photo could not be read.'); }
  }
  claimPhotosPaint();
}
function claimPhotoDrop(i) { const p = clEdit.photos.splice(i, 1)[0]; if (p) clEdit.dropped.push(p.id); claimPhotosPaint(); }
async function clPhotoView(i) {
  const p = clEdit && clEdit.photos[i]; if (!p) return;
  const d = await clPhLoad(p);
  if (d && p.pdf) { pdfView(d, p.name || 'invoice.pdf'); return; }
  if (!d && p.pdf) { toast('That PDF is on the phone it was added on.'); return; }
  if (!d) { toast(clEdit.awayNote || 'That photo is on the other phone.'); return; }
  const el = document.createElement('div'); el.className = 'phview'; el.id = 'phview';
  el.innerHTML = `<img src="${d}" alt="Invoice photo"><div class="pvbar">${navigator.share ? `<button type="button" class="btn" id="pvshare">${I('share')} Share invoice</button>` : ''}<a class="btn" href="${d}" download="invoice-${i + 1}.jpg">${I('download')} Save</a><button type="button" class="btn primary" id="pvclose">Close</button></div>`;
  document.body.appendChild(el);
  el.querySelector('#pvclose').onclick = () => el.remove();
  const sb = el.querySelector('#pvshare');
  if (sb) sb.onclick = async () => {
    try { const b = await (await fetch(d)).blob(), file = new File([b], `invoice-${i + 1}.jpg`, { type: 'image/jpeg' });
      if (navigator.canShare && !navigator.canShare({ files: [file] })) { toast('This phone can’t share photos from here. Use Save instead.'); return; }
      await navigator.share({ files: [file], title: 'Invoice' }); } catch (e) { }
  };
}
const clDmy = iso => iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(0, 4) : '';
function claimFormVals() { const v = {}; new FormData($('#sf')).forEach((x, k) => { if (typeof x === 'string') v[k] = x.trim(); }); return v; }
const claimPatient = v => v.pt === 'other' ? (v.ptother || '') : v.pt || '';
function claimText(v) {
  const n = clEdit.photos.length;
  return ['UniMed Smart Claim', 'Policy: ' + (v.policy || '(policy number)'), 'Patient name: ' + (claimPatient(v) || '—'), 'Service provider: ' + (v.provider || '—'), 'Reason for visit: ' + (v.reason || '—'),
    'Date of visit: ' + (clDmy(v.date) || '—'), 'Amount paid: ' + (claimMoney(claimAmtStr(v.amount)) || '—'), 'Itemised invoice: ' + (n ? (clEdit && clEdit.photos.some(p => p.pdf) ? n + (n === 1 ? ' file (PDF)' : ' files') : n + (n === 1 ? ' photo' : ' photos')) : 'not added yet')].concat(v.notes ? ['Notes: ' + v.notes] : []).join('\n');
}
async function claimCopy() {
  const t = claimText(claimFormVals());
  try { await navigator.clipboard.writeText(t); toast('Claim details copied. Paste them into Smart Claim.'); }
  catch (e) { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); toast('Claim details copied.'); } catch (x) { toast('Could not copy on this phone.'); } a.remove(); }
}
function claimWarn() {
  const f = $('#sf'); if (!f) return; const a = claimAmtStr(f.amount.value), w = document.getElementById('clwarn');
  if (w) w.textContent = a && Number(a) < CLAIM_MIN ? `Under $${CLAIM_MIN}: UniMed’s smallest claim is $${CLAIM_MIN}.` : '';
  const st = f.status.value; f.querySelectorAll('[data-st]').forEach(el => { el.style.display = el.dataset.st.split(' ').includes(st) ? '' : 'none'; });
  const o = f.querySelector('[name=ptother]'); if (o) o.closest('label').style.display = (f.pt && f.pt.value) !== 'other' ? 'none' : '';
}
function claimSheet(ref) {
  const cx = claimCtx(ref); if (!cx) return;
  const c = Object.assign(claimNorm({}), cx.defaults, cx.claim ? claimNorm(cx.claim) : {});
  clEdit = { ref, photos: (c.photos || []).map(p => Object.assign({}, p)), dropped: [], awayNote: cx.awayNote };
  const pv = CLAIM_PATIENTS.includes(c.patient) ? c.patient : (c.patient ? 'other' : CLAIM_PATIENTS[0]);
  openSheet('UniMed claim',
    `<div class="cltip">${I('info')}<div>UniMed needs the provider’s <b>itemised invoice</b>, not an EFTPOS receipt. Claims must be at least $${CLAIM_MIN}. GP, dental and optical: pay first, then claim it back.</div></div>` +
    (cx.title ? `<div class="clfor">For: <b>${cx.titleHtml || esc(cx.title)}</b></div>` : '') +
    field('Policy number', inp('policy', claimPolicy(), 'inputmode="numeric" maxlength="30" placeholder="From your UniMed card"'), 'Saved on this phone for next time') +
    `<div class="field"><span>Patient</span>${segHtml('pt', CLAIM_PATIENTS.map(p => [p, p]).concat([['other', 'Someone else']]), pv)}</div>` +
    field('Patient’s name', inp('ptother', pv === 'other' ? c.patient : '', 'maxlength="60"')) +
    field('Service provider', inp('provider', c.provider, 'maxlength="120" placeholder="e.g. Onerahi Medical Centre"')) +
    field('Reason for visit', inp('reason', c.reason, 'maxlength="160" placeholder="e.g. GP consultation"')) +
    `<div class="two">${field('Date of visit', inp('date', c.date, 'type="date"'))}${field('Amount paid', inp('amount', c.amount, 'inputmode="decimal" placeholder="$0.00"'))}</div><div class="clwarn" id="clwarn"></div>` +
    `<div class="field"><span>Itemised invoice</span><div class="clph" id="clph"></div>
      <div class="btns" style="margin-top:6px"><label class="btn small">${I('camera')} Add photo<input type="file" accept="image/*" multiple hidden id="clfile"></label><button type="button" class="btn small" id="clview" onclick="clPhotoView(0)">${I('image')} Show full screen</button></div>
      <small>${cx.shared ? 'Photos sync with ' + esc(cx.other) + ' when they’re small enough.' : 'Photos stay on this phone.'}</small></div>` +
    field('Notes', area('notes', c.notes, 'Optional')) +
    field('Status', sel('status', Object.entries(CLAIM_ST), c.status), 'Smart Claim keeps drafts for 30 days') +
    `<div data-st="submitted paid">${field('Submitted on', inp('submittedAt', c.submittedAt || todayISO(), 'type="date"'))}</div>` +
    `<div class="two" data-st="paid">${field('Paid on', inp('paidAt', c.paidAt || todayISO(), 'type="date"'))}${field('Reimbursed', inp('paidAmt', c.paidAmt, 'inputmode="decimal" placeholder="$0.00"'))}</div>` +
    `<div class="btns clbtns"><button type="button" class="btn small" onclick="claimCopy()">${I('copy')} Copy details</button><a class="btn small primary" href="${UNIMED_URL}" target="_blank" rel="noopener">${I('share')} Open Smart Claim</a></div>
     <p class="muted clhelp">Help: <a href="tel:0800600666">0800 600 666</a> · <a href="mailto:claims@unimed.co.nz">claims@unimed.co.nz</a>${cx.shared ? '' : cx.privNote ? ' · ' + cx.privNote : ''}</p>`,
    async v => {
      const out = claimNorm({ status: v.status, patient: claimPatient(v), provider: v.provider, reason: v.reason, date: v.date, amount: v.amount, notes: v.notes, photos: clEdit.photos,
        submittedAt: v.status === 'submitted' || v.status === 'paid' ? v.submittedAt || todayISO() : '', paidAt: v.status === 'paid' ? v.paidAt || todayISO() : '', paidAmt: v.status === 'paid' ? v.paidAmt : '', updated: Date.now() });
      claimPolicySet(v.policy || '');
      clEdit.dropped.forEach(id => clPhDel(id));
      await cx.save(out);
      const low = out.amount && Number(out.amount) < CLAIM_MIN;
      toast(low ? `Saved. Note: under $${CLAIM_MIN} is below UniMed’s minimum.` : 'Claim saved.');
      if (cx.shared && out.photos.some(p => !p.up)) claimUploadPhotos(out).then(ch => { if (ch) cx.save(out, true); });
    }, 'Save');
  wireSeg('pt', () => claimWarn());
  const f = $('#sf'); f.amount.addEventListener('input', claimWarn); f.status.addEventListener('change', claimWarn);
  $('#clfile').addEventListener('change', e => { claimAddFiles(e.target.files); e.target.value = ''; });
  claimWarn(); claimPhotosPaint();
}

// Sarah's side: a claim belongs to one of her appointments
const CLAIM_TYPES = ['doctor', 'dentist'];
function claimPolicy() { try { return localStorage.getItem('unimedPolicy') || ''; } catch (e) { return ''; } }
function claimPolicySet(v) { try { localStorage.setItem('unimedPolicy', String(v).slice(0, 30)); } catch (e) { } }
function claimCtx(ref) {
  const a = S.appts.find(x => x.id === String(ref).replace(/^a:/, '')); if (!a) return null;
  return { title: a.title + ' · ' + fmtW(a.date), claim: a.claim, shared: !a.private, other: 'Shane', awayNote: 'That photo is on Shane’s phone.', privNote: 'Private appointment: this claim stays on your phone.',
    defaults: { patient: 'Sarah', provider: a.place ? a.place.split(',')[0].trim() : '', reason: a.title, date: a.date },
    save: async (c, quiet) => { a.claim = c; await save(); if (!quiet || !sheetOpen) render(); if (!a.private) sharedSync(); } };
}
// Past doctor/dentist visits in the last 60 days with no claim yet, and every claim still in progress
function claimsDue() {
  const t = todayISO();
  return S.appts.filter(a => a.claim ? a.claim.status === 'draft' || a.claim.status === 'submitted' || (a.claim.status === 'none' && a.date < t) : (CLAIM_TYPES.includes(a.type) && a.date < t && daysLeft(a.date) >= -60))
    .sort((a, b) => b.date.localeCompare(a.date));
}
function claimsCard() {
  const list = claimsDue(); if (!list.length) return '';
  return `<div class="sec">UniMed claims</div><div class="list" id="claimlist">${list.map(a => `<button class="row" onclick="claimSheet('a:${a.id}')"><div class="aic">${I('receipt')}</div><div class="tx"><div class="t">${esc(a.title)}</div><div class="s">Visit ${esc(fmtW(a.date))}${a.claim && a.claim.amount ? ' · ' + claimMoney(a.claim.amount) : ''}${a.private ? ' · just me' : ''}</div></div>${a.claim && a.claim.status !== 'none' ? claimChip(a.claim) : '<span class="clchip none">Claim?</span>'}</button>`).join('')}</div>
    <div class="foot" style="margin-top:6px"><a href="${UNIMED_URL}" target="_blank" rel="noopener">Open UniMed Smart Claim</a> · claims for shared appointments show in Shane’s app too.</div>`;
}
/* ================= MY OUTLOOK (1.7.0) =================
   Optional. Sarah signs in to her own Outlook on this phone (Microsoft sign-in, Mail.Read, PKCE; the same app
   registration as Shane's app; any client secret stays on the relay). Mail is read straight from Microsoft on this
   phone and is never sent anywhere or saved: only the message ids she dismisses are kept, so they don't come back.
   It offers doctor, dentist and chiro bookings as suggestions (nothing is added until she taps Add), and lists
   medical invoice PDFs from the last 3 months for UniMed claims. UniMed logins and one-time codes are skipped:
   those emails are never opened. */
const MX_KEY = 'sarahsTodo.outlook', MX_SEEN = 'sarahsTodo.outlookSeen', MX_HINT = 'sarah.jenkins@outlook.co.nz';
const MX_REDIRECT = 'https://phoneapp12-cell.github.io/sarahs-todo/';
const MX_RELAY = SHARED_URL.replace(/\/shared-todo$/, '');
const MX_AUTH = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize', MX_SCOPE = 'offline_access Mail.Read User.Read';
const mxGet = () => { try { return JSON.parse(localStorage.getItem(MX_KEY) || 'null'); } catch (e) { return null; } };
const mxSet = v => { try { if (v) localStorage.setItem(MX_KEY, JSON.stringify(v)); else localStorage.removeItem(MX_KEY); } catch (e) { } };
const mxOn = () => { const b = mxGet(); return !!(b && b.refreshToken); };
const mxSeen = () => { try { return JSON.parse(localStorage.getItem(MX_SEEN) || '[]'); } catch (e) { return []; } };
const mxSeenAdd = id => { try { localStorage.setItem(MX_SEEN, JSON.stringify(mxSeen().concat(id).slice(-300))); } catch (e) { } };
const b64u = bytes => { let s = ''; const a = new Uint8Array(bytes); for (let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''); };
async function mxClientId() {
  const r = await fetch(MX_RELAY + '/mail/config', { cache: 'no-store' }); const c = await r.json();
  return (c && c.microsoft && c.microsoft.clientId) || '';
}
async function mxSignIn() {
  let id = ''; try { id = await mxClientId(); } catch (e) { }
  if (!id) { toast('Outlook sign-in isn’t available just now. Try again later.'); return; }
  const raw = crypto.getRandomValues(new Uint8Array(32)), verifier = b64u(raw), challenge = b64u(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  const state = b64u(crypto.getRandomValues(new Uint8Array(16))) + '.mx';
  try { localStorage.setItem('sarahsTodo.outlookPkce', JSON.stringify({ verifier, state, at: Date.now() })); } catch (e) { toast('This browser won’t keep the sign-in step. Try Chrome or Safari.'); return; }
  const u = new URL(MX_AUTH);
  Object.entries({ client_id: id, redirect_uri: MX_REDIRECT, response_type: 'code', response_mode: 'query', scope: MX_SCOPE, state, code_challenge: challenge, code_challenge_method: 'S256', prompt: 'select_account', login_hint: MX_HINT }).forEach(([k, v]) => u.searchParams.set(k, v));
  location.href = u.toString();
}
async function mxToken(body) {
  const r = await fetch(MX_RELAY + '/mail/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ provider: 'microsoft', redirectUri: MX_REDIRECT }, body)) });
  const d = await r.json().catch(() => ({})); if (!r.ok || !d.accessToken) throw Object.assign(new Error('mail'), { data: d }); return d;
}
async function mxFinish() {
  let q; try { q = new URLSearchParams(location.search); } catch (e) { return; }
  const code = q.get('code'), err = q.get('error'), state = q.get('state') || '';
  if ((!code && !err) || !state.endsWith('.mx')) return;
  try { history.replaceState(null, '', location.pathname + '#appts'); } catch (e) { }
  let saved = null; try { saved = JSON.parse(localStorage.getItem('sarahsTodo.outlookPkce') || 'null'); localStorage.removeItem('sarahsTodo.outlookPkce'); } catch (e) { }
  if (err) { toast(/consent|access_denied/i.test(q.get('error_description') || err) ? 'Outlook wasn’t connected.' : 'Microsoft said: ' + (q.get('error_description') || err).slice(0, 140)); return; }
  if (!saved || saved.state !== state || Date.now() - saved.at > 15 * 60000) { toast('That sign-in step expired. Try Connect again.'); return; }
  try {
    const t = await mxToken({ code, codeVerifier: saved.verifier });
    if (!t.refreshToken) { toast('Sign-in didn’t allow staying connected. Try again.'); return; }
    const box = { refreshToken: t.refreshToken, accessToken: t.accessToken, expiresAt: Date.now() + (Number(t.expiresIn) || 3600) * 1000 - 60000, email: '' };
    try { const me = await mxJSON('https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName', box.accessToken); box.email = me.mail || me.userPrincipalName || ''; } catch (e) { }
    mxSet(box); toast('Outlook connected' + (box.email ? ': ' + box.email : '') + '.'); mxScan(true);
  } catch (e) { toast('Couldn’t finish the Outlook sign-in. ' + (e.data && e.data.providerError ? '(' + e.data.providerError + ')' : '')); }
  render();
}
async function mxAccess() {
  const b = mxGet(); if (!b || !b.refreshToken) return '';
  if (b.accessToken && b.expiresAt > Date.now() + 30000) return b.accessToken;
  const t = await mxToken({ refreshToken: b.refreshToken });
  b.accessToken = t.accessToken; if (t.refreshToken) b.refreshToken = t.refreshToken; b.expiresAt = Date.now() + (Number(t.expiresIn) || 3600) * 1000 - 60000; mxSet(b); return b.accessToken;
}
async function mxJSON(url, token, text) {
  const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 15000);
  try { const h = { Authorization: 'Bearer ' + token, Accept: 'application/json' }; if (text) h.Prefer = 'outlook.body-content-type="text"';
    const r = await fetch(url, { headers: h, signal: ctl.signal, cache: 'no-store' }); if (r.status === 401) throw Object.assign(new Error('auth'), { status: 401 }); if (!r.ok) throw new Error('http ' + r.status); return await r.json(); }
  finally { clearTimeout(tm); }
}
function mxDisconnect() {
  confirmSheet('Disconnect Outlook?', 'This phone forgets your Outlook sign-in and stops reading your mail. Appointments you already added stay.', 'Disconnect', async () => {
    mxSet(null); try { localStorage.removeItem(MX_SEEN); } catch (e) { } mxSug = []; mxInv = null; mxAt = 0; render();
    toast('Outlook disconnected on this phone.');
  });
}
// What counts as medical mail
const MX_SOURCES = [
  { k: 'cfh', type: 'doctor', provider: 'Central Family Health Care', reason: 'GP / doctor visit', test: m => /@centralfamily\.co\.nz$/i.test(m.addr) || /central\s*family|\bcfhc?\b/i.test(m.name + ' ' + m.subject) },
  { k: 'tui', type: 'other', provider: 'Tui Chiropractic', reason: 'Chiropractic treatment', test: m => /@tuichiropractic\.co\.nz$/i.test(m.addr) || /\btui\s*chiro/i.test(m.name + ' ' + m.subject) },
  { k: 'dent', type: 'dentist', provider: '', reason: 'Dental treatment', test: m => /dental|dentist|orthodont/i.test(m.name + ' ' + m.addr + ' ' + m.subject) },
  { k: 'doc', type: 'doctor', provider: '', reason: 'Doctor visit', test: m => /medical\s*cent|health\s*cent|\bclinic\b|\bsurgery\b|physio|chiropract|optometr|manage\s*my\s*health|healthpoint/i.test(m.name + ' ' + m.addr + ' ' + m.subject) }
];
// Never opened: UniMed itself, sign-in codes, passwords
const mxBlocked = m => /unimed/i.test(m.addr + ' ' + m.name) || /\b(code|passcode|one[- ]time|otp|verif|password|sign[- ]?in|log[- ]?in|security)\b/i.test(m.subject);
function mxProvider(src, m) {
  if (src.provider) return src.provider;
  let n = String(m.name || '').replace(/\s*\(via [^)]*\)/i, '').trim();
  if (!n || /@/.test(n)) { // only an address: make a name from its domain, e.g. tikipungadentalcentre.nz → Tikipunga Dental Centre
    const d = String((n || m.addr).split('@')[1] || n).split('.')[0];
    n = d.replace(/(dental|dentist|medical|health|family|centre|center|clinic|surgery|care|physio|chiro)/gi, ' $1 ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, c => c.toUpperCase());
  }
  return n || m.addr;
}
const MX_MON = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const p2 = n => String(n).padStart(2, '0');
// Finds the appointment date and time in a booking email. Returns null if no clear future date.
function mxApptParse(text, receivedAt) {
  const t = String(text || '').replace(/\s+/g, ' ');
  const rx = new Date(receivedAt || Date.now()), yr0 = rx.getFullYear();
  let m, date = '', idx = -1;
  const M = '(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\.?';
  if ((m = t.match(new RegExp('\\b(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+of)?\\s+' + M + ',?(?:\\s+(20\\d{2}))?', 'i')))) { date = `${m[3] || yr0}-${p2(MX_MON[m[2].toLowerCase().slice(0, 3)])}-${p2(+m[1])}`; idx = m.index; }
  else if ((m = t.match(new RegExp('\\b' + M + '\\s+(\\d{1,2})(?:st|nd|rd|th)?,?(?:\\s+(20\\d{2}))?', 'i')))) { date = `${m[3] || yr0}-${p2(MX_MON[m[1].toLowerCase().slice(0, 3)])}-${p2(+m[2])}`; idx = m.index; }
  else if ((m = t.match(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2}|\d{2})\b/))) { date = `${m[3].length === 2 ? '20' + m[3] : m[3]}-${p2(+m[2])}-${p2(+m[1])}`; idx = m.index; }
  if (!date || !parseD(date) || +date.slice(5, 7) > 12) return null;
  if (!m[3] && parseD(date) < todayT(rx) - DAY) date = (yr0 + 1) + date.slice(4); // "14 Jan" in a December email
  if (date < todayISO()) return null;
  const near = t.slice(Math.max(0, idx - 60), idx + 120);
  let time = '', tm = near.match(/\b(\d{1,2})(?:[:.](\d{2}))?\s*([ap])\.?m\.?\b/i);
  if (tm) { let h = +tm[1] % 12; if (/p/i.test(tm[3])) h += 12; if (h < 24) time = p2(h) + ':' + (tm[2] || '00'); }
  else if ((tm = near.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/))) time = p2(+tm[1]) + ':' + tm[2];
  return { date, time };
}
const mxIsBooking = m => /appointment|booking|booked|reminder|confirm|scheduled|recall|see you/i.test(m.subject + ' ' + m.text) && !/invoice|receipt|statement|newsletter|cancel/i.test(m.subject);
const mxIsPdf = a => /\.pdf$/i.test(String(a.name || '')) || /pdf/i.test(String(a.contentType || ''));
const mxSince = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth() - 3, 1); };
let mxSug = [], mxInv = null, mxAt = 0, mxBusy = false, mxErr = '';
async function mxScan(force) {
  if (!mxOn() || mxBusy || navigator.onLine === false) return;
  if (!force && Date.now() - mxAt < 20 * 60000) return;
  mxBusy = true; mxErr = '';
  try {
    let token = await mxAccess();
    const since = mxSince().toISOString();
    let url = 'https://graph.microsoft.com/v1.0/me/messages?$filter=' + encodeURIComponent(`receivedDateTime ge ${since}`) + '&$orderby=receivedDateTime%20desc&$top=100&$select=id,subject,from,receivedDateTime,bodyPreview,hasAttachments';
    const found = [];
    for (let page = 0; url && page < 6; page++) {
      let d; try { d = await mxJSON(url, token); } catch (e) { if (e.status === 401) { const b = mxGet(); b.expiresAt = 0; mxSet(b); token = await mxAccess(); d = await mxJSON(url, token); } else throw e; }
      (d.value || []).forEach(x => { const m = { id: x.id, subject: x.subject || '', name: (x.from && x.from.emailAddress && x.from.emailAddress.name) || '', addr: (x.from && x.from.emailAddress && x.from.emailAddress.address) || '', at: x.receivedDateTime, text: x.bodyPreview || '', att: !!x.hasAttachments };
        if (mxBlocked(m)) return; const src = MX_SOURCES.find(s => s.test(m)); if (src) found.push(Object.assign(m, { src })); });
      url = d['@odata.nextLink'] || '';
    }
    const seen = mxSeen(), sug = [];
    for (const m of found.filter(m => mxIsBooking(m) && !seen.includes(m.id)).slice(0, 15)) {
      let body = m.text; try { const b = await mxJSON('https://graph.microsoft.com/v1.0/me/messages/' + encodeURIComponent(m.id) + '?$select=body', token, true); body = (b.body && b.body.content) || body; } catch (e) { }
      const p = mxApptParse(m.subject + ' \n ' + body, m.at); body = '';
      if (!p) continue;
      const place = mxProvider(m.src, m), tp = m.src.type;
      if (S.appts.some(a => a.date === p.date && (!p.time || !a.time || a.time === p.time))) continue; // already in her list
      if (sug.some(s => s.date === p.date && s.place === place)) continue;
      sug.push({ mid: m.id, type: tp, title: tp === 'dentist' ? 'Dentist' : m.src.k === 'tui' ? 'Chiropractor' : 'Doctor', place, date: p.date, time: p.time, subject: m.subject.slice(0, 120), at: m.at });
    }
    mxSug = sug.sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));
    const inv = [];
    for (const m of found.filter(m => m.att && !mxIsBooking(m)).slice(0, 20)) {
      try { const a = await mxJSON('https://graph.microsoft.com/v1.0/me/messages/' + encodeURIComponent(m.id) + '/attachments?$select=id,name,contentType,size', token);
        const pdfs = (a.value || []).filter(mxIsPdf).map(x => ({ id: x.id, name: x.name, size: x.size })); if (pdfs.length) inv.push(Object.assign({}, m, { text: m.text.slice(0, 255), pdfs })); } catch (e) { }
    }
    mxInv = inv; mxAt = Date.now();
  } catch (e) { mxErr = 'Couldn’t read Outlook just now.'; }
  finally { mxBusy = false; }
  if (!sheetOpen && curPage() === 'appts') render();
}
function mxCard() {
  const on = mxOn(), b = mxGet() || {};
  const priv = '<p class="muted mxpriv">Private: your mail is read on this phone only. Nothing from it is sent or saved, and nothing is shared unless you tap Add. UniMed logins and codes are never read.</p>';
  if (!on) return `<div class="card mxcard" id="mxcard"><div class="cch">${I('mail')}<b>My Outlook</b></div><p class="muted" style="margin:6px 0 8px">Optional. Connect your Outlook and this app suggests your doctor, dentist and chiro bookings, and finds invoice PDFs for UniMed claims.</p>
    <button class="btn primary small" id="mxconnect" onclick="mxSignIn()">${I('mail')} Connect my Outlook</button>${priv}</div>`;
  const sug = mxSug.map((s, i) => `<div class="row mxsug" data-mid="${esc(s.mid)}"><div class="aic ${s.type}">${I(APPT_TYPES[s.type][1])}</div><div class="tx"><div class="t">${esc(s.title)} · ${esc(s.place)}</div><div class="s">${esc(fmtW(s.date))}${s.time ? ' · ' + esc(fmtTm(s.time)) : ''}</div><div class="s mxsubj">From: ${esc(s.subject)}</div></div>
    <div class="ecbtns"><button class="btn small primary" onclick="mxAdd(${i})">${I('plus')} Add</button><button class="btn small" onclick="mxSkip(${i})">Not now</button></div></div>`).join('');
  return `<div class="card mxcard" id="mxcard"><div class="cch">${I('mail')}<b>My Outlook</b><span class="muted" style="margin-left:auto;font-size:0.8125rem">${esc(b.email || 'Connected')}</span></div>
    ${mxBusy && !mxAt ? '<p class="muted" style="margin:6px 0">Looking for bookings…</p>' : sug ? `<p class="muted" style="margin:6px 0 4px">Bookings found in your email. Tap Add to keep one.</p><div class="list" id="mxsug">${sug}</div>` : `<p class="muted" style="margin:6px 0" id="mxnone">${mxErr ? esc(mxErr) : 'No new doctor, dentist or chiro bookings in your email.'}</p>`}
    <div class="btns" style="margin-top:8px"><button class="btn small" onclick="mxScan(true).then(render)">Check again</button><button class="btn small" onclick="mxInvoices()">${I('receipt')} Invoice PDFs</button><button class="btn small danger" id="mxoff" onclick="mxDisconnect()">Disconnect</button></div>${priv}</div>`;
}
async function mxAdd(i) {
  const s = mxSug[i]; if (!s) return;
  const s0 = snap(), id = uid('ap');
  S.appts.push({ id, created: Date.now(), type: s.type, title: s.title, date: s.date, time: s.time, place: s.place, notes: '', remind: '60', private: false, claim: null });
  mxSeenAdd(s.mid); mxSug.splice(i, 1);
  await save(); render();
  toast('Added. It’s in Shane’s calendar too.', 'Edit', () => apptForm(id));
  void s0;
}
function mxSkip(i) { const s = mxSug[i]; if (!s) return; mxSeenAdd(s.mid); mxSug.splice(i, 1); render(); }
// Invoice PDFs → UniMed claim
function mxInvHtml() {
  if (mxBusy || !mxInv) return '<p class="muted">Looking through the last 3 months of email…</p>';
  if (!mxInv.length) return '<p class="muted" id="mxinvnone">No invoice PDFs from Central Family Health, Tui Chiropractic, a dentist or a clinic in the last 3 months.</p>';
  return `<div class="list" id="mxinv">${mxInv.flatMap((m, i) => m.pdfs.map((a, j) => `<div class="row ecrow"><div class="aic">${I('doc')}</div><div class="tx" style="flex:1;min-width:0"><div class="t">${esc(mxProvider(m.src, m))}</div>
    <div class="s">${esc(fmtW(String(m.at).slice(0, 10)))} · ${esc(m.subject)}</div><div class="s ecpdf">${esc(a.name)}</div></div>
    <div class="ecbtns"><button type="button" class="btn small" onclick="mxPreview(${i},${j})">${I('eye')} View</button><button type="button" class="btn small primary" onclick="mxPick(${i},${j})">Use</button></div></div>`)).join('')}</div>
    <p class="muted" style="font-size:0.8125rem;margin:8px 2px 0">Read from your Outlook on this phone. Nothing is sent. You submit the claim yourself in Smart Claim.</p>`;
}
async function mxInvoices() {
  openSheet('Invoice PDFs from your email', `<div id="mxinvbox">${mxInvHtml()}</div>`, null);
  if (!mxInv) { await mxScan(true); const b = document.getElementById('mxinvbox'); if (b) b.innerHTML = mxInvHtml(); }
}
async function mxBytes(m, a) {
  const token = await mxAccess();
  const r = await fetch('https://graph.microsoft.com/v1.0/me/messages/' + encodeURIComponent(m.id) + '/attachments/' + encodeURIComponent(a.id) + '/$value', { headers: { Authorization: 'Bearer ' + token } });
  if (!r.ok) throw new Error('http ' + r.status); return new Uint8Array(await r.arrayBuffer());
}
const u8ToDataUrl = u => new Promise(res => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).replace(/^data:[^;]*;/, 'data:application/pdf;')); fr.readAsDataURL(new Blob([u], { type: 'application/pdf' })); });
async function mxFetch(i, j) { const m = mxInv[i], a = m && m.pdfs[j]; if (!a) return null; if (!a.data) { toast('Opening the PDF…'); a.bytes = await mxBytes(m, a); a.data = await u8ToDataUrl(a.bytes); } return { m, a }; }
async function mxPreview(i, j) { try { const x = await mxFetch(i, j); if (x) pdfView(x.a.data, x.a.name); } catch (e) { toast('That PDF could not be opened.'); } }
let pdfjsP = null;
function pdfjs() { return pdfjsP || (pdfjsP = import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs').then(m => { m.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs'; return m; }).catch(e => { pdfjsP = null; throw e; })); }
async function pdfText(u) {
  try { const lib = await pdfjs(), doc = await lib.getDocument({ data: u.slice(0) }).promise; let t = '';
    for (let i = 1; i <= Math.min(doc.numPages, 3); i++) { const pg = await doc.getPage(i), c = await pg.getTextContent(); let lastY = null; c.items.forEach(x => { const y = x.transform && x.transform[5]; t += (lastY != null && Math.abs(y - lastY) > 2 ? '\n' : ' ') + x.str; lastY = y; }); t += '\n'; }
    return t; } catch (e) { return ''; }
}
function invParse(text) {
  const t = String(text || ''), out = {};
  const amt = t.match(/\b(?:total(?:\s+(?:paid|due|amount|incl\.?\s*gst))?|amount\s+(?:paid|due)|balance(?:\s+due)?|invoice\s+total)\b[^\d$\n]{0,30}\$?\s*(\d{1,5}(?:,\d{3})*\.\d{2})/i) || t.match(/\$\s*(\d{1,5}(?:,\d{3})*\.\d{2})/);
  if (amt) out.amount = claimAmtStr(amt[1].replace(/,/g, ''));
  const d = t.match(/\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(20\d{2})\b/i);
  if (d) out.date = `${d[3]}-${p2(MX_MON[d[2].toLowerCase().slice(0, 3)])}-${p2(+d[1])}`;
  else { const n = t.match(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/); if (n) out.date = `${n[3]}-${p2(+n[2])}-${p2(+n[1])}`; }
  return out;
}
async function mxPick(i, j) {
  let x; try { x = await mxFetch(i, j); } catch (e) { toast('That PDF could not be read.'); return; }
  if (!x) return;
  const { m, a } = x, got = Object.assign(invParse(m.text), invParse(await pdfText(a.bytes)));
  const date = got.date || String(m.at).slice(0, 10), prov = mxProvider(m.src, m), tp = m.src.type;
  const pid = uid('ph'); await clPhPut(pid, a.data);
  // Attach to her appointment that day if there is one, otherwise add the visit (shared with Shane like any appointment)
  let ap = S.appts.find(z => z.date === date && (z.type === tp || (z.place || '').toLowerCase().includes(prov.toLowerCase().split(' ')[0])));
  if (!ap) { ap = { id: uid('ap'), created: Date.now(), type: tp, title: tp === 'dentist' ? 'Dentist' : m.src.k === 'tui' ? 'Chiropractor' : 'Doctor', date, time: '', place: prov, notes: '', remind: '', private: false, claim: null }; S.appts.push(ap); }
  const base = ap.claim || claimNorm({});
  ap.claim = claimNorm(Object.assign({}, base, { patient: base.patient || 'Sarah', provider: base.provider || prov, reason: base.reason || m.src.reason, date: base.date || date, amount: got.amount || base.amount,
    notes: [base.notes, 'From email: ' + m.subject + ' (' + fmtW(String(m.at).slice(0, 10)) + ')'].filter(Boolean).join('\n'), photos: (base.photos || []).concat([{ id: pid, up: false, pdf: true, name: a.name }]), updated: Date.now() }));
  await save(); render(); sharedSync();
  claimSheet('a:' + ap.id);
  toast(got.amount ? `Filled in from the email: ${claimMoney(ap.claim.amount)} on ${fmtW(ap.claim.date)}.` : 'Filled in from the email. Please check the amount.');
}
async function pdfView(data, name) {
  const el = document.createElement('div'); el.className = 'phview'; el.id = 'phview';
  el.innerHTML = `<div class="pdfpv" id="pdfpv"><p style="color:#fff">Loading preview…</p></div><div class="pvbar"><button type="button" class="btn" id="pvopen">${I('doc')} Open PDF</button>${navigator.share ? `<button type="button" class="btn" id="pvshare">${I('share')} Share</button>` : ''}<a class="btn" href="${data}" download="${esc(name)}">${I('download')} Save</a><button type="button" class="btn primary" id="pvclose">Close</button></div>`;
  document.body.appendChild(el);
  const blob = await (await fetch(data)).blob(), file = new File([blob], name, { type: 'application/pdf' });
  el.querySelector('#pvclose').onclick = () => el.remove();
  el.querySelector('#pvopen').onclick = () => { const u = URL.createObjectURL(blob); window.open(u, '_blank'); setTimeout(() => URL.revokeObjectURL(u), 60000); };
  const sb = el.querySelector('#pvshare');
  if (sb) sb.onclick = async () => { try { if (navigator.canShare && !navigator.canShare({ files: [file] })) { toast('This phone can’t share files from here. Use Save instead.'); return; } await navigator.share({ files: [file], title: name }); } catch (e) { } };
  try { const lib = await pdfjs(), doc = await lib.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise, pg = await doc.getPage(1);
    const vp = pg.getViewport({ scale: 1 }), sc = Math.min(2.5, (Math.min(innerWidth, 900) * (devicePixelRatio || 1)) / vp.width), v2 = pg.getViewport({ scale: sc });
    const cv = document.createElement('canvas'); cv.width = v2.width; cv.height = v2.height; await pg.render({ canvasContext: cv.getContext('2d'), viewport: v2 }).promise;
    const box = el.querySelector('#pdfpv'); if (box) { box.innerHTML = ''; box.appendChild(cv); } }
  catch (e) { const box = el.querySelector('#pdfpv'); if (box) box.innerHTML = '<p style="color:#fff">No preview on this phone. Use Open PDF.</p>'; }
}
async function apptDelete(id) { const s0 = snap(); S.appts = S.appts.filter(a => a.id !== id); await save(); await closeSheet(); render(); toast('Appointment deleted.', 'Undo', undoTo(s0)); }
/* ================= START ================= */
/* Greeting at the top, by the phone's own clock (1.0.3) */
function greetWord(now = new Date()) { const h = now.getHours(); return h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 17 ? 'afternoon' : 'evening'; }
const greetText = () => 'Good ' + greetWord() + ', Sarah';
const greetCard = () => `<div class="greet" id="greethi">${esc(greetText())}</div>`;
let greetBand = greetWord();
function greetTick() { const b = greetWord(); if (b === greetBand) return; greetBand = b; const el = document.getElementById('greethi'); if (el) el.textContent = greetText(); }
setInterval(greetTick, 30000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') greetTick(); });

function render() {
  if (!S) return;
  let page = '';
  try { page = curPage() === "shopping" ? Shopping() : curPage() === "school" ? School() : curPage() === "appts" ? Appts() : Todo(); } catch (e) { console.error(e); page = `<div class="card">Sorry, this page couldn’t load. <button class="btn small" onclick="location.reload()">Reload</button></div>`; }
  $('#view').innerHTML = pairCard() + greetCard() + remindBanner() + (curPage() === 'todo' ? schoolLineCard() + apptSoonLine() + carSoonLine() + petSoonLine() : '') + pageTabs() + installCard() + notifyCard() + (curPage() === 'todo' ? shaneShopCard() : '') + page;
}
window.addEventListener('hashchange', () => { if (!sheetOpen) { render(); window.scrollTo(0, 0); } });
let schoolLineLast = '';
setInterval(() => { try { const l = schoolLine(); if (l !== schoolLineLast) { const had = schoolLineLast; schoolLineLast = l; if (had && !sheetOpen) render(); } } catch (e) { } }, 60000);
let renderedDay = todayISO();
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && todayISO() !== renderedDay && !sheetOpen) { renderedDay = todayISO(); render(); } });
window.addEventListener('offline', () => { sharedErr = 'offline'; if (!sheetOpen) render(); });
applyTheme(curTheme());
applyLayout(isTrello() ? 'trello' : 'list');
load();
pairFromLink();
render();
mxFinish();
sharedStart();
mxScan();
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') mxScan(); });
carRefresh();
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') carRefresh(); });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').then(() => notifyRefresh()).catch(() => { });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') notifyRefresh(); });
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { }

// 1.12.0: move a to-do to another list in one tap (a shared one moves on Shane's phone too; it isn't a tick)
async function moveSheet(id) { const t = S.todos.find(x => x.id === id); if (!t) return; if (sheetOpen) await closeSheet();
  openSheet('Move to…', `<p class="muted" style="margin:-4px 2px 10px">“${esc(t.title)}” is on <b>${esc(t.list)}</b>.</p><div class="list">${S.lists.filter(l => l !== t.list).map(l => `<button type="button" class="row" onclick="moveTo('${id}',${jsArg(l)})"><div class="tx"><div class="t">${esc(l)}</div></div></button>`).join('')}</div>`); }
async function moveTo(id, l) { const t = S.todos.find(x => x.id === id); if (!t || !S.lists.includes(l)) return; const s = snap(); t.list = l; await save(); await closeSheet(); render(); try { sharedSoon(500); } catch (e) { }
  toast(`Moved to ${l}.` + (t.private ? '' : ' Shane’s list is updated too.'), 'Undo', undoTo(s)); }

/* 1.13.0: link with Shane's My App once. Shane makes a link (or code) in My App › Settings › Sarah's To-do; it works
   once, within 24 hours. Opening the link links this phone; or tap "Enter code" and type it. */
var pairBusy = false;
async function pairRedeem(code) {
  const r = await fetch(SHARED_URL.replace(/\/shared-todo$/, '/pair/redeem'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
  let j = null; try { j = await r.json(); } catch (e) { }
  if (r.ok && j && typeof j.key === 'string' && /^st_[A-Za-z0-9_-]{40,}$/.test(j.key)) { localStorage.setItem('stKey', j.key); await stKeyToWorker(j.key); return ''; }
  if (r.status === 410) return 'That code has already been used or has run out. Ask Shane for a new one.';
  if (r.status === 429) return 'Too many tries. Wait an hour and try again.';
  return 'That code didn’t match. Check it with Shane and try again.';
}
async function pairDone() { render(); toast('Linked with Shane’s My App. Your shared list carries on as before.'); try { sharedSync && sharedSync(); } catch (e) { } try { notifyRefresh && notifyRefresh(); } catch (e) { } }
async function pairFromLink() {
  const m = /^#pair=([A-Za-z0-9-]{10,12})$/.exec(location.hash || ''); if (!m) { if (stPaired()) stKeyToWorker(sharedKey()); return; }
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { }
  if (pairBusy) return; pairBusy = true;
  try { const err = await pairRedeem(m[1]); if (err) toast(err); else await pairDone(); } catch (e) { toast('No signal just now. Open Shane’s link again when you’re back online.'); }
  finally { pairBusy = false; }
}
function pairCard() {
  if (stPaired()) return '';
  const late = Date.now() > PAIR_CUTOFF;
  return `<div class="card" style="border:2px solid var(--accent,#0F766E)"><b>Link with Shane’s My App</b>
    <p class="muted" style="margin:6px 0 10px">${late ? 'Your shared list with Shane is paused until you link. Nothing is lost.' : 'One quick step so your shared list keeps working with Shane after 5 November.'} Open the link Shane sends you, or tap Enter code.</p>
    <button type="button" class="btn primary" onclick="pairSheet()">Enter code</button></div>`;
}
function pairSheet() {
  openSheet('Link with Shane', field('Code from Shane', inp('code', '', 'autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABCDE-FGHJK"'), 'Shane makes it in My App. It works once, for 24 hours.'),
    async v => { const c = String(v.code || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); if (c.length !== 10) return 'The code has 10 letters and numbers.';
      try { const err = await pairRedeem(c); if (err) return err; } catch (e) { return 'No signal just now. Try again when you’re online.'; }
      setTimeout(pairDone, 50); }, 'Link');
}
