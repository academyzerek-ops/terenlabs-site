/**
 * TerenLabs · Analytics tracker — версия для сайта.
 * Адаптация frontend/_assets/tracker.js основного репо (источник правды — там):
 *   - API всегда абсолютный (сайт живёт на другом origin, /api/ здесь нет)
 *   - auth: веб-токен localStorage tl_ocean_token → «web <token>» (не initData)
 *   - platform: «site»
 *   - SPA-навигация Next: window.tlPageChange(path) шлёт page_unload(+duration)
 *     старой страницы и page_view новой (вызывает AnalyticsTracker.tsx)
 *
 * События летят в тот же /api/ocean/event, что и Mini App: анонимные сессии
 * разрешены бэком, залогиненные привязываются к user_id.
 */
(function () {
  'use strict';

  var API = 'https://terenlabs-production.up.railway.app/api/ocean/event';
  var SESSION_KEY = 'tl-session';
  var SESSION_STARTED_KEY = 'tl-session-started';
  var BUFFER_KEY = 'tl-event-buffer';
  var TOKEN_KEY = 'tl_ocean_token'; // кладёт lib/ocean.ts после входа

  function uuid4() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  var sessionId = null;
  var sessionIsNew = false;
  try {
    sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = uuid4();
      sessionStorage.setItem(SESSION_KEY, sessionId);
      sessionStorage.setItem(SESSION_STARTED_KEY, new Date().toISOString());
      sessionIsNew = true;
    }
  } catch (e) {
    sessionId = uuid4();
    sessionIsNew = true;
  }

  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; }
  }

  function getStartedAt() {
    try { return sessionStorage.getItem(SESSION_STARTED_KEY) || new Date().toISOString(); }
    catch (e) { return new Date().toISOString(); }
  }

  function send(events, useBeacon) {
    if (!events || !events.length) return;
    events.forEach(function (e) { if (!e.id) e.id = uuid4(); });
    var body = JSON.stringify({
      session_id: sessionId,
      started_at: getStartedAt(),
      platform: 'site',
      user_agent: navigator.userAgent.substring(0, 500),
      events: events,
    });
    var token = getToken();
    if (useBeacon && navigator.sendBeacon) {
      // sendBeacon без заголовков: токен переживает переход query-параметром
      // не передаём — page_unload анонимен, сессия уже привязана предыдущими батчами
      try {
        navigator.sendBeacon(API, new Blob([body], { type: 'application/json' }));
      } catch (e) {}
      return;
    }
    var headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'web ' + token;
    fetch(API, { method: 'POST', headers: headers, body: body, keepalive: true })
      .catch(function () {
        try {
          var buf = JSON.parse(localStorage.getItem(BUFFER_KEY) || '[]');
          events.forEach(function (e) { buf.push(e); });
          if (buf.length > 200) buf = buf.slice(-200);
          localStorage.setItem(BUFFER_KEY, JSON.stringify(buf));
        } catch (e) {}
      });
  }

  function flushBuffer() {
    try {
      var buf = JSON.parse(localStorage.getItem(BUFFER_KEY) || '[]');
      if (buf.length) {
        send(buf, false);
        localStorage.removeItem(BUFFER_KEY);
      }
    } catch (e) {}
  }

  // ─── Public API ───────────────────────────────────────────
  window.tlTrack = function (type, payload) {
    send([{ type: type, page: location.pathname, payload: payload || null, ts: new Date().toISOString() }]);
  };

  var pageStart = Date.now();
  var currentPath = location.pathname;

  // SPA-навигация Next App Router: AnalyticsTracker.tsx зовёт на смене pathname
  window.tlPageChange = function (path) {
    if (path === currentPath) return;
    var dur = (Date.now() - pageStart) / 1000;
    send([
      { type: 'page_unload', page: currentPath, duration_sec: dur, payload: null, ts: new Date().toISOString() },
      { type: 'page_view', page: path, payload: null, ts: new Date().toISOString() },
    ]);
    currentPath = path;
    pageStart = Date.now();
  };

  var initEvents = [{
    type: 'page_view',
    page: location.pathname,
    payload: null,
    ts: new Date().toISOString(),
  }];
  if (sessionIsNew) {
    initEvents.unshift({
      type: 'session_start',
      page: location.pathname,
      payload: {
        referrer: document.referrer || null,
        p: new URLSearchParams(location.search).get('p') || null,
        utm_source: new URLSearchParams(location.search).get('utm_source') || null,
      },
      ts: new Date().toISOString(),
    });
  }
  send(initEvents, false);
  flushBuffer();

  function onUnload() {
    var dur = (Date.now() - pageStart) / 1000;
    send([{
      type: 'page_unload',
      page: currentPath,
      duration_sec: dur,
      payload: null,
      ts: new Date().toISOString(),
    }], true);
  }
  window.addEventListener('beforeunload', onUnload);
  window.addEventListener('pagehide', onUnload);
})();
