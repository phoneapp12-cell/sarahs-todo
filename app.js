/* Sarah's To-do – a to-do list that's saved on this phone and shared with Shane's My App.
   Only the to-dos in this app are shared (through the small relay below). Nothing else is sent anywhere. */
'use strict';
const { DAY, todayT, todayISO, parseD, isoT, daysLeft, addDays, fmt, fmtY, fmtW, fmtLong, status } = MH;
const APP_VERSION = '1.0.2';
const STORE_KEY = 'sarahsTodo.data.v1';
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = p => p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const plural = (n, w, ws) => n + ' ' + (n === 1 ? w : (ws || w + 's'));
const jsArg = s => esc(JSON.stringify(s));
const P = {
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
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  zap: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'
};

const I = (n, a = '') => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true" ${a}>${P[n] || ''}</svg>`;

/* ---------- data (this phone) ---------- */
let S = null;
const DEFAULT_LISTS = ['Home', 'Shopping'];
const blank = () => ({ version: 1, todos: [], lists: DEFAULT_LISTS.slice(), settings: {} });
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
  d.todos.forEach(t => { if (!d.lists.includes(t.list)) d.lists.push(t.list || 'Home'); if (!t.list) t.list = d.lists[0]; });
  d.settings = { shared: st.shared && typeof st.shared === 'object' ? st.shared : {}, errandsGone: true };
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
    <button class="tapzone" onclick="todoForm('${t.id}')"><div class="tx"><div class="t">${esc(t.title)}</div><div class="s">${esc(t.list)}${t.done ? '' : todoPriMark(t)}${t.due && !t.done ? ' · ' + fmtW(t.due) : ''}${!t.due && !t.done ? ' · no date' : ''}</div></div>
    ${t.due && !t.done ? pill(daysLeft(t.due)) : ''}</button></div>`;
  const openCount = S.todos.filter(t => !t.done).length;
  return header('To-do', openCount ? plural(openCount, 'thing') + ' to do' : 'Nothing to do', themeDots() + addBtn('Add a to-do', 'todoForm()')) +
    `<div class="chips">${['All', ...S.lists].map(l => `<button class="chip ${l === todoFilter ? 'on' : ''}" onclick="setTodoFilter(${jsArg(l)})">${esc(l)}</button>`).join('')}
      <button class="chip plus" onclick="listForm()">+ New list</button></div>
    ${todoFilter !== 'All' ? `<div style="display:flex;gap:18px;margin:-2px 4px 10px;font-size:0.875rem;font-weight:600"><button style="color:var(--brand);padding:4px 0" onclick="listForm(${jsArg(todoFilter)})">Rename list</button><button style="color:var(--red);padding:4px 0" onclick="deleteList(${jsArg(todoFilter)})">Delete list</button></div>` : ''}
    <form class="addbar" onsubmit="quickAdd(event)"><input id="newtodo" placeholder="Add a to-do${todoFilter !== 'All' ? ' to ' + esc(todoFilter) : ''}…" autocomplete="off" enterkeyhint="done" maxlength="120" aria-label="New to-do"><button aria-label="Add">${I('plus')}</button></form>
    ${open.length ? `<div class="list" id="openlist">${open.map(row).join('')}</div>` : (S.todos.length ? '<div class="card empty"><div class="t">All done. Good as gold!</div></div>' : empty('Nothing on your list', 'Type a to-do above and tap +, or add one with a due date.', 'Add a to-do', 'todoForm()'))}
    ${done.length ? `<div class="sec">Done <button onclick="clearDone()">Clear done</button></div><div class="list" id="donelist">${done.map(row).join('')}</div>` : ''}
    ${themePicker()}
    <div class="foot" id="syncline">${esc(syncLine())}<br>Your to-dos show on Shane’s list too, and he can tick them off. ${S.todos.length ? '' : ''}Sarah’s To-do ${APP_VERSION}</div>`;
}
function setTodoFilter(l) { todoFilter = l; render(); }
async function quickAdd(e) {
  e.preventDefault();
  const v = $('#newtodo').value.trim(); if (!v) return;
  S.todos.push({ id: uid('st'), title: v.slice(0, 120), list: todoFilter === 'All' ? S.lists[0] : todoFilter, due: '', notes: '', priority: 'normal', done: false, created: Date.now() });
  await save(); render(); $('#newtodo').focus(); toast('Added to your list.');
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
function todoForm(id) {
  const t = id ? S.todos.find(x => x.id === id) : { title: '', list: todoFilter === 'All' ? S.lists[0] : todoFilter, due: '', notes: '', priority: 'normal' };
  if (!t) return;
  openSheet(id ? 'Edit to-do' : 'Add a to-do',
    field('To-do', inp('title', t.title, 'placeholder="e.g. Pick up the dry cleaning" required maxlength="120"')) +
    `<div class="two">${field('List', sel('list', S.lists.map(l => [l, l]), t.list))}${field('Priority', sel('priority', [['high', 'High'], ['normal', 'Normal'], ['low', 'Low']], todoPriority(t)))}</div>` +
    field('Due date', inp('due', t.due, 'type="date"'), 'Optional') +
    field('Notes', area('notes', t.notes)) +
    (id ? `<div class="btns" style="margin-top:4px"><button type="button" class="btn" onclick="tick('${id}')">${I('check')} ${t.done ? 'Mark not done' : 'Mark complete'}</button></div>` : ''),
    async v => {
      if (!v.title) return 'Please type the to-do.';
      const priority = todoPriority({ priority: v.priority });
      const s = snap();
      if (id) Object.assign(t, { title: v.title.slice(0, 120), list: v.list, due: v.due, notes: v.notes, priority });
      else S.todos.push({ id: uid('st'), title: v.title.slice(0, 120), list: v.list, due: v.due, notes: v.notes, priority, done: false, created: Date.now() });
      await save(); render(); toast(id ? 'To-do updated.' : 'Added to your list.', 'Undo', undoTo(s));
    }, id ? 'Save' : 'Add',
    id ? `<button type="button" class="btn danger" style="flex:0 0 auto" aria-label="Delete to-do" onclick="deleteTodo('${id}')">${I('trash')}</button>` : '');
}
async function deleteTodo(id) {
  const s = snap(); S.todos = S.todos.filter(x => x.id !== id); await save(); await closeSheet(); render(); toast('To-do deleted.', 'Undo', undoTo(s));
}
function listForm(name) {
  openSheet(name ? 'Rename list' : 'New list', field('List name', inp('name', name || '', 'placeholder="e.g. Garden" required maxlength="24"')), async v => {
    if (!v.name) return 'Please type a name.';
    if (v.name === 'All') return 'Please pick a different name.';
    if (S.lists.includes(v.name) && v.name !== name) return 'You already have a list with that name.';
    if (name) { S.lists = S.lists.map(l => l === name ? v.name : l); S.todos.forEach(t => { if (t.list === name) t.list = v.name; }); }
    else S.lists.push(v.name);
    todoFilter = v.name; await save(); render();
  }, name ? 'Save' : 'Add list');
}
function deleteList(name) {
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
  items: () => S.todos,
  by: () => 'sarah',
  want: () => true,
  add: s => { s = Object.assign({}, s, { list: listIn(s.list) }); S.todos.push({ id: s.id, title: s.title, list: s.list, due: s.due, notes: s.notes, priority: s.priority, done: s.done, doneAt: s.doneAt || undefined, created: s.created }); if (!S.lists.includes(s.list)) S.lists.push(s.list); },
  update: (t, s) => { s = Object.assign({}, s, { list: listIn(s.list) }); Object.assign(t, { title: s.title, list: s.list, due: s.due, notes: s.notes, priority: s.priority, done: s.done }); if (s.done) t.doneAt = s.doneAt || Date.now(); else delete t.doneAt; if (!S.lists.includes(s.list)) S.lists.push(s.list); },
  remove: id => { S.todos = S.todos.filter(t => t.id !== id); },
  persist: async changed => {
    sharedApplying = true;
    try { await save(); } finally { sharedApplying = false; }
    if (sheetOpen) return;
    if (changed) render(); else { const el = document.getElementById('syncline'); if (el) el.innerHTML = esc(syncLine()) + '<br>Your to-dos show on Shane’s list too, and he can tick them off. Sarah’s To-do ' + APP_VERSION; }
  }
};
/* ---- Shared to-do sync (Sarah's To-do <-> My App) ----
   Each phone keeps its own copy and a note of the last version both sides agreed on. Changes made here
   (add, tick, edit, delete, undo) are spotted by comparing with that note and queued, so they work offline
   and are sent when there's signal. Each item merges on its own time stamp; nothing is duplicated. */
const SHARED_URL = 'https://due-dates-calendar-relay.phoneapp12.workers.dev/shared-todo';
const SHARED_KEY = 'sArgfZGJrHxJN9I319FJeFLhFshrHsRU2xDFnnLL'; // only opens this one shared list
const SHARED_FIELDS = ['title', 'list', 'due', 'notes', 'priority', 'done'];
const sharedHash = t => JSON.stringify(SHARED_FIELDS.map(k => k === 'done' ? !!t[k] : String(t[k] == null ? '' : t[k])));
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
    st.pend[t.id] = Object.assign({ id: t.id, created: t.created || now, by: SH.by(t), doneAt: t.done ? t.doneAt || now : 0, updated: now }, Object.fromEntries(SHARED_FIELDS.map(k => [k, k === 'done' ? !!t[k] : (t[k] || '')])));
  });
  Object.keys(st.snap).forEach(id => { if (!seen.has(id) && !(st.pend[id] && st.pend[id].deleted)) st.pend[id] = { id, deleted: true, updated: now }; });
}
function sharedSoon(ms = 1500) { clearTimeout(sharedTimer); sharedTimer = setTimeout(() => sharedSync(), ms); }
async function sharedSync() {
  if (sharedBusy || !S) return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) { sharedErr = 'offline'; return; }
  sharedBusy = true;
  try {
    sharedNote();
    const st = sharedState(), sent = Object.values(st.pend);
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 15000);
    let d;
    try {
      const r = await fetch(SHARED_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: SHARED_KEY, items: sent }), signal: ctl.signal });
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
function themePicker() {
  const c = curTheme();
  return `<div class="themepick" id="themepick" role="radiogroup" aria-label="Colour">Colour${Object.entries(THEMES).map(([k, [l, hex]]) => `<button type="button" class="swatch ${k === c ? 'on' : ''}" role="radio" aria-checked="${k === c}" data-theme-pick="${k}" onclick="setTheme('${k}')"><i style="background:${hex}"></i>${l}</button>`).join('')}</div>`;
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

/* ================= START ================= */
function render() {
  if (!S) return;
  let page = '';
  try { page = Todo(); } catch (e) { console.error(e); page = `<div class="card">Sorry, this page couldn’t load. <button class="btn small" onclick="location.reload()">Reload</button></div>`; }
  $('#view').innerHTML = installCard() + page;
}
let renderedDay = todayISO();
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && todayISO() !== renderedDay && !sheetOpen) { renderedDay = todayISO(); render(); } });
window.addEventListener('offline', () => { sharedErr = 'offline'; if (!sheetOpen) render(); });
applyTheme(curTheme());
load();
render();
sharedStart();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { });
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { }
