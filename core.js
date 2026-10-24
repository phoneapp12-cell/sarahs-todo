/* Sarah's To-do – date helpers. */
(function (g) {
  'use strict';
  const DAY = 864e5;
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const MONL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const WDL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const pad = n => String(n).padStart(2, '0');

  /* ---------- dates: stored as 'YYYY-MM-DD' strings, maths done on UTC midnights ---------- */
  const todayT = (now = new Date()) => Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const parseD = s => { if (!s || typeof s !== 'string') return null; const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null; };
  const isoT = t => { const d = new Date(t); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); };
  const todayISO = (now) => isoT(todayT(now));
  const daysLeft = (s, now) => Math.round((parseD(s) - todayT(now)) / DAY);
  const addDays = (s, n) => isoT(parseD(s) + n * DAY);
  function addMonths(s, n, anchorDay) {
    const d = new Date(parseD(s));
    const y = d.getUTCFullYear(), m = d.getUTCMonth() + n;
    const want = anchorDay || d.getUTCDate();
    const dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    return isoT(Date.UTC(y, m, Math.min(want, dim)));
  }
  const dObj = s => new Date(parseD(s));
  const fmt0 = s => { const d = dObj(s); return d.getUTCDate() + ' ' + MON[d.getUTCMonth()]; };
  const fmt = (s, now = new Date()) => fmt0(s) + (dObj(s).getUTCFullYear() !== now.getFullYear() ? ' ' + dObj(s).getUTCFullYear() : '');
  const fmtY = s => fmt0(s) + ' ' + dObj(s).getUTCFullYear();
  const fmtW = (s, now) => WD[dObj(s).getUTCDay()] + ' ' + fmt(s, now);
  const fmtLong = s => WDL[dObj(s).getUTCDay()] + ' ' + fmtY(s);
  const money = n => '$' + (Number(n) || 0).toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ---------- bills ---------- */
  const REPEATS = { none: 'One-off', weekly: 'Weekly', fortnightly: 'Fortnightly', monthly: 'Monthly', quarterly: 'Every 3 months', yearly: 'Yearly' };
  function nextDue(bill, from) {
    const s = from || bill.due;
    switch (bill.repeat) {
      case 'weekly': return addDays(s, 7);
      case 'fortnightly': return addDays(s, 14);
      case 'monthly': return addMonths(s, 1, bill.anchor);
      case 'quarterly': return addMonths(s, 3, bill.anchor);
      case 'yearly': return addMonths(s, 12, bill.anchor);
      default: return null;
    }
  }
  // Dates on which an unpaid bill falls due between two UTC-midnight times (inclusive).
  function billDates(bill, fromT, toT) {
    const out = [];
    if (!bill.due || bill.paid) return out;
    let s = bill.due, n = 0;
    while (s && parseD(s) <= toT && n < 500) {
      if (parseD(s) >= fromT) out.push(s);
      s = nextDue(bill, s); n++;
    }
    return out;
  }

  const REPEAT_STEP = { weekly: 7, fortnightly: 14, '4weekly': 28 };
  const dim = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); // days in month m (0-11)
  // The k-th date of the series (k = 0 is the start), before skips and moves
  function repeatNth(ev, k) {
    const t0 = parseD(ev.start); if (t0 == null) return null;
    if (!ev.repeat || ev.repeat === 'none') return k ? null : ev.start;
    if (!k && ev.repeat !== 'lastday') return ev.start;
    if (REPEAT_STEP[ev.repeat]) return isoT(t0 + k * REPEAT_STEP[ev.repeat] * DAY);
    const d = new Date(t0), y = d.getUTCFullYear(), m = d.getUTCMonth(), day = d.getUTCDate();
    if (ev.repeat === 'monthly' || ev.repeat === 'lastday') {
      const yy = y + Math.floor((m + k) / 12), mm = (m + k) % 12;
      return isoT(Date.UTC(yy, mm, ev.repeat === 'lastday' ? dim(yy, mm) : Math.min(day, dim(yy, mm))));
    }
    if (ev.repeat === 'yearly') return isoT(Date.UTC(y + k, m, Math.min(day, dim(y + k, m))));
    return null;
  }
  // Is `iso` one of the series' own dates (before skips/moves)?
  function isSeriesDate(ev, iso) {
    const t = parseD(iso), t0 = parseD(ev.start); if (t == null || t0 == null || t < t0) return false;
    if (ev.until && iso > ev.until) return false;
    if (REPEAT_STEP[ev.repeat]) return Math.round((t - t0) / DAY) % REPEAT_STEP[ev.repeat] === 0;
    const a = new Date(t0), b = new Date(t);
    const k = ev.repeat === 'yearly' ? b.getUTCFullYear() - a.getUTCFullYear() : ev.repeat === 'monthly' || ev.repeat === 'lastday' ? (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth() : 0;
    return repeatNth(ev, k) === iso;
  }
  // Dates of a series between two UTC-midnight times (inclusive): [{ date, orig, moved }], sorted
  function repeatDates(ev, fromT, toT) {
    const out = [], t0 = parseD(ev.start); if (t0 == null || toT < fromT) return out;
    const skips = new Set(ev.skips || []), moves = ev.moves || {};
    const endT = ev.until && parseD(ev.until) != null ? Math.min(toT, parseD(ev.until)) : toT;
    let k = 0;
    const step = REPEAT_STEP[ev.repeat];
    if (step && fromT > t0) k = Math.max(0, Math.floor((fromT - t0) / (step * DAY)));
    else if ((ev.repeat === 'monthly' || ev.repeat === 'lastday') && fromT > t0) { const a = new Date(t0), b = new Date(fromT); k = Math.max(0, (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth() - 1); }
    else if (ev.repeat === 'yearly' && fromT > t0) k = Math.max(0, new Date(fromT).getUTCFullYear() - new Date(t0).getUTCFullYear() - 1);
    for (let n = 0; n < 2000; n++, k++) {
      const iso = repeatNth(ev, k); if (!iso) break;
      const t = parseD(iso); if (t > endT) break;
      if (t >= fromT && !skips.has(iso) && !moves[iso]) out.push({ date: iso, orig: iso, moved: false });
    }
    // moved dates: shown on their new day, as long as the original date is part of the series and not skipped
    Object.keys(moves).forEach(o => { const nt = parseD(moves[o]); if (nt != null && nt >= fromT && nt <= toT && !skips.has(o) && isSeriesDate(ev, o)) out.push({ date: moves[o], orig: o, moved: true }); });
    return out.sort((a, b) => a.date.localeCompare(b.date) || a.orig.localeCompare(b.orig));
  }
  const centsMoney = c => (c < 0 ? '−' : '') + money(Math.abs(c) / 100);
  function parseCents(v) { // "120", "120.5", "$1,200.50" -> 12050; null if not a plain positive amount with up to 2 decimals
    const t = String(v == null ? '' : v).replace(/[\s,$]/g, '');
    if (!/^\d+(\.\d{1,2})?$|^\.\d{1,2}$/.test(t)) return null;
    return Math.round(parseFloat(t) * 100);
  }

  const PET_CARE = {
    flea: { name: 'Flea treatment', every: 1, unit: 'months' },
    worm: { name: 'Worming', every: 3, unit: 'months' },
    vacc: { name: 'Vaccinations', every: 1, unit: 'years' },
    groom: { name: 'Grooming', every: 6, unit: 'weeks' },
    check: { name: 'Vet check-up', every: 1, unit: 'years' },
    reg: { name: 'Dog registration', every: 1, unit: 'years' }
  };
  function addInterval(s, n, unit) {
    n = Math.max(1, Math.round(+n || 1));
    return unit === 'weeks' ? addDays(s, 7 * n) : unit === 'years' ? addMonths(s, 12 * n) : addMonths(s, n);
  }
  function regDueAfter(done) { const d = dObj(done); return (d.getUTCFullYear() + (d.getUTCMonth() >= 4 ? 1 : 0)) + '-07-01'; }
  function nextJuly1(now) { const T = todayISO(now), y = +T.slice(0, 4); return T <= y + '-07-01' ? y + '-07-01' : (y + 1) + '-07-01'; }
  function careDue(it, now) {
    if (!it) return '';
    if (it.due && parseD(it.due) != null) return it.due;
    if (it.kind === 'reg') return it.last ? regDueAfter(it.last) : nextJuly1(now);
    if (!it.last || parseD(it.last) == null || it.unit === 'none' || !(+it.every > 0)) return '';
    return addInterval(it.last, it.every, it.unit);
  }
  function careNextAfter(it, date) {
    if (it.kind === 'reg') return regDueAfter(date);
    return it.unit === 'none' || !(+it.every > 0) ? '' : addInterval(date, it.every, it.unit);
  }
  function careEvery(it) {
    if (it.kind === 'reg') return 'Every 1 July';
    if (it.unit === 'none' || !(+it.every > 0)) return 'Doesn’t repeat';
    const n = +it.every, u = it.unit === 'weeks' ? 'week' : it.unit === 'years' ? 'year' : 'month';
    return n === 1 ? (u === 'week' ? 'Every week' : u === 'month' ? 'Monthly' : 'Yearly') : `Every ${n} ${u}s`;
  }
  function petDueItems(pets, now) {
    const out = [];
    (pets || []).forEach(p => (p.care || []).forEach(it => {
      const date = careDue(it, now);
      if (date) out.push({ kind: 'pet', part: 'care', id: p.id + ':' + it.id, pet: p, care: it, title: p.name + ': ' + it.name, date, days: daysLeft(date, now) });
    }));
    return out.sort((a, b) => a.days - b.days || a.title.localeCompare(b.title));
  }
  const status = d => d < 0 ? 'over' : d <= 30 ? 'soon' : 'fine';

  g.MH = { DAY, todayT, parseD, isoT, todayISO, daysLeft, addDays, addMonths, fmt, fmtY, fmtW, fmtLong, money, REPEATS, nextDue, billDates, repeatDates, centsMoney, parseCents, PET_CARE, addInterval, regDueAfter, careDue, careNextAfter, careEvery, petDueItems, status };
})(typeof self !== 'undefined' ? self : this);
