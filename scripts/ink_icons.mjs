// Эмодзи в главах и обзорах меняем на рисованные иконки в стиле обитателей Океана:
// тонкий штрих, скруглённые концы, цвет наследуется от блока. Эмодзи в слотах
// .ins-ico / .fc-ico / .vs-ico и два инлайновых маркера (🚩 ✅) — остальной текст не трогаем.
//
// Скрипт идемпотентный: файл, где иконки уже вставлены, пропускается.
// Запуск: node scripts/ink_icons.mjs [--dry]

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DRY = process.argv.includes("--dry");

// Версия таблицы стилей глав и обзоров: иконки и блок источников описаны в
// lessons.css, и без подъёма версии браузер отдаёт закешированный файл без них.
const CSS_V = 11;

// ---- набор иконок: 16×16, штрих, без заливки ----
const ICONS = {
  idea: '<path d="M8 2.4a3.7 3.7 0 0 0-2.2 6.7c.5.4.9 1 .9 1.6h2.6c0-.6.4-1.2.9-1.6A3.7 3.7 0 0 0 8 2.4M6.7 12.2h2.6M7.2 13.6h1.6"/>',
  up: '<path d="M2 12.4 6 8l2.6 2.4L13.6 4.6M13.9 7.9V4.4H10.4"/>',
  down: '<path d="M2 4.2 6 8.6l2.6-2.4 5 5.7M13.9 8.5V12H10.4"/>',
  chart: '<path d="M2.4 13.3h11.2M4.6 11.2V7.4M7.5 11.2V4.2M10.4 11.2V8.8M13.2 11.2V5.8"/>',
  warn: '<path d="M8 2.7 14 12.9H2zM8 6.6v3M8 11.3v.5"/>',
  money: '<path d="M2.3 4.4h11.4v7.2H2.3zM8 6.3a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4M4.4 6.1v.1M11.6 9.9v.1"/>',
  coin: '<path d="M8 2.6c3 0 5.4 1.2 5.4 2.7S11 8 8 8 2.6 6.8 2.6 5.3 5 2.6 8 2.6M2.6 5.3v5.4C2.6 12.2 5 13.4 8 13.4s5.4-1.2 5.4-2.7V5.3M2.6 8c0 1.5 2.4 2.7 5.4 2.7s5.4-1.2 5.4-2.7"/>',
  time: '<path d="M4.2 2.4h7.6M4.2 13.6h7.6M4.9 2.4c0 2.6 3.1 3.7 3.1 5.6S4.9 11 4.9 13.6M11.1 2.4c0 2.6-3.1 3.7-3.1 5.6s3.1 3.4 3.1 5.6"/>',
  clock: '<path d="M8 2.4a5.6 5.6 0 1 0 0 11.2 5.6 5.6 0 0 0 0-11.2M8 5v3.2l2.2 1.3"/>',
  people: '<path d="M6 8.2a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2M2.4 13.2c0-2 1.6-3.3 3.6-3.3s3.6 1.3 3.6 3.3M10.7 4.3a2 2 0 0 1 0 3.9M11.6 10.2c1.3.4 2 1.4 2 3"/>',
  person: '<path d="M8 8.1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5M3.4 13.4c0-2.4 2-4 4.6-4s4.6 1.6 4.6 4"/>',
  deal: '<path d="M6.1 4.7a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6M9.9 4.7a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6"/>',
  target: '<path d="M8 2.6a5.4 5.4 0 1 0 0 10.8A5.4 5.4 0 0 0 8 2.6M8 5.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8M8 7.6v.1"/>',
  box: '<path d="M2.6 5.2 8 2.7l5.4 2.5v5.6L8 13.3l-5.4-2.5zM2.6 5.2 8 7.7l5.4-2.5M8 7.7v5.6"/>',
  cart: '<path d="M1.9 2.9h1.7l1.8 6.9h6.2l1.5-4.8H4.3M6.4 12.6v.1M11 12.6v.1"/>',
  doc: '<path d="M4 2.5h5l3 3v8H4zM9 2.5v3h3M5.9 8.3h4.2M5.9 10.4h4.2"/>',
  list: '<path d="M5.4 2.9h5.2v1.6H5.4zM3.7 3.7h1.7M10.6 3.7h1.7v9.4H3.7V3.7M6 7.6h4.2M6 10.1h2.8"/>',
  scales: '<path d="M8 2.7v10.6M4.4 13.3h7.2M3.2 4.3h9.6M3.2 4.3 1.4 8.6h3.6zM12.8 4.3 11 8.6h3.6zM1.4 8.6a1.8 1.8 0 0 0 3.6 0M11 8.6a1.8 1.8 0 0 0 3.6 0"/>',
  tools: '<path d="M9.6 2.9a2.7 2.7 0 0 0 3.4 3.6l-6 6a1.7 1.7 0 0 1-2.4-2.4zM3.1 12.4v.1"/>',
  gear: '<path d="M8 5.9a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2M8 1.8l.6 1.7 1.8-.5.3 1.8 1.8.4-.6 1.7 1.4 1.2-1.4 1.1.6 1.7-1.8.4-.3 1.8-1.8-.5-.6 1.7-.6-1.7-1.8.5-.3-1.8-1.8-.4.6-1.7L2.1 8.1l1.4-1.2-.6-1.7 1.8-.4.3-1.8 1.8.5z"/>',
  eye: '<path d="M1.6 8S4.1 4.2 8 4.2 14.4 8 14.4 8 11.9 11.8 8 11.8 1.6 8 1.6 8M8 6.3a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4"/>',
  search: '<path d="M7.1 2.8a4.3 4.3 0 1 0 0 8.6 4.3 4.3 0 0 0 0-8.6M10.3 10.3l3 3"/>',
  speak: '<path d="M2.3 6.4 10.6 3v10L2.3 9.6zM2.3 6.4H1.4v3.2h.9M4.6 10.3l.9 3.1h1.8l-.9-3.4M12.4 6.1h1.9M12.4 8.6h1.9"/>',
  chat: '<path d="M2.6 3.4h10.8v7H8.4L5 13.2v-2.8H2.6z"/>',
  shield: '<path d="M8 2.4 3.2 4.3v3.6c0 2.7 2 4.6 4.8 5.7 2.8-1.1 4.8-3 4.8-5.7V4.3z"/>',
  lock: '<path d="M4.2 7h7.6v6.2H4.2zM5.9 7V5.1a2.1 2.1 0 0 1 4.2 0V7"/>',
  globe: '<path d="M8 2.4a5.6 5.6 0 1 0 0 11.2 5.6 5.6 0 0 0 0-11.2M2.4 8h11.2M8 2.4c1.5 1.6 2.3 3.5 2.3 5.6S9.5 12 8 13.6C6.5 12 5.7 10.1 5.7 8S6.5 4 8 2.4"/>',
  screen: '<path d="M2.2 3.2h11.6v7H2.2zM5.5 13h5M8 10.2V13"/>',
  phone: '<path d="M5 1.9h6v12.2H5zM6.9 3.4h2.2M8 12.3v.1"/>',
  building: '<path d="M3.2 13.4V3.1L9.9 1.8v11.6M9.9 5.6h2.9v7.8M1.9 13.4h12.2M5.3 4.6v.1M7.4 4.4v.1M5.3 7v.1M7.4 6.9v.1M5.3 9.4v.1M7.4 9.3v.1"/>',
  home: '<path d="M2.4 7.4 8 2.6l5.6 4.8M3.9 8.6v4.8h8.2V8.6M6.6 13.4V9.9h2.8v3.5"/>',
  factory: '<path d="M2.3 13.2V6.4l3.3 2.2V6.4l3.3 2.2V3.2h4.8v10zM1.9 13.2h12.2M11.1 6.2v.1M11.1 9.4v.1"/>',
  fire: '<path d="M8.3 1.8c.2 2.2 2.6 3 3.3 5.2a3.8 3.8 0 0 1-7.4 1.7c0-1 .4-1.9 1-2.5.1 1 .6 1.6 1.3 1.8-.5-2.6.9-4.3 1.8-6.2M8 13.5a1.9 1.9 0 0 1-1-3.4c.2 1 .6 1.4 1.3 1.7"/>',
  spark: '<path d="M8 2.2 9.3 6l3.8 1.3-3.8 1.3L8 12.4 6.7 8.6 2.9 7.3 6.7 6z"/>',
  star: '<path d="m8 2.3 1.8 3.6 4 .6-2.9 2.8.7 4L8 11.4l-3.6 1.9.7-4-2.9-2.8 4-.6z"/>',
  cup: '<path d="M4.4 2.6h7.2v3.1a3.6 3.6 0 0 1-7.2 0zM4.4 3.4H2.7v1.2c0 1 .7 1.7 1.7 1.7M11.6 3.4h1.7v1.2c0 1-.7 1.7-1.7 1.7M8 9.3v2.4M5.6 13.4h4.8"/>',
  key: '<path d="M6 5.4a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6M8.2 7.2h6M12.4 7.2v2.3M10.4 7.2v1.7"/>',
  route: '<path d="M4.1 2.6a2 2 0 0 0 0 4 2 2 0 0 0 0-4M11.9 9.4a2 2 0 0 0 0 4 2 2 0 0 0 0-4M4.1 6.6v1.9c0 1.6 1.3 2.9 2.9 2.9h3"/>',
  loop: '<path d="M3 6.8a5 5 0 0 1 8.7-2.4M13 9.2a5 5 0 0 1-8.7 2.4M3 3.9v2.9h2.9M13 12.1V9.2h-2.9"/>',
  check: '<path d="m3 8.4 3.2 3.2L13 4.6"/>',
  cross: '<path d="M4 4l8 8M12 4l-8 8"/>',
  ban: '<path d="M8 2.4a5.6 5.6 0 1 0 0 11.2 5.6 5.6 0 0 0 0-11.2M4 4l8 8"/>',
  flag: '<path d="M4 14V2.4M4 3.2h7.8L10 6l1.8 2.8H4"/>',
  bolt: '<path d="M9.2 1.8 4.2 8.9h3.2l-.6 5.3 5-7.1H8.6z"/>',
  drop: '<path d="M8 2.2c2 2.6 3.6 4.4 3.6 6.4a3.6 3.6 0 0 1-7.2 0c0-2 1.6-3.8 3.6-6.4"/>',
  brain: '<path d="M8 2.4a5.6 5.6 0 1 0 0 11.2 5.6 5.6 0 0 0 0-11.2M8 5.1a2.9 2.9 0 0 1 0 5.8 1.5 1.5 0 0 1 0-3"/>',
  hole: '<path d="M1.9 5.2c1.9 3.6 3.9 6.7 6.1 6.7s4.2-3.1 6.1-6.7M1.9 5.2h3.2M10.9 5.2h3.2"/>',
  book: '<path d="M2.4 3h4.2A1.4 1.4 0 0 1 8 4.4v8.2a1.4 1.4 0 0 0-1.4-1.4H2.4zM13.6 3H9.4A1.4 1.4 0 0 0 8 4.4v8.2a1.4 1.4 0 0 1 1.4-1.4h4.2z"/>',
  truck: '<path d="M1.9 3.9h7.2v6.9H1.9zM9.1 6.4h2.6l2.4 2.3v2.1H9.1zM4.6 10.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8M11.4 10.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8"/>',
  brick: '<path d="M1.9 4h12.2v3.4H1.9zM1.9 8.6h12.2V12H1.9M5.5 4v3.4M10.5 4v3.4M3.7 8.6V12M8.3 8.6V12M12.5 8.6V12"/>',
  door: '<path d="M4.2 2.4h7.6v11.2H4.2zM9.4 8.2v.1"/>',
  card: '<path d="M1.9 3.9h12.2v8.2H1.9zM1.9 6.6h12.2M4 9.6h2.4"/>',
  bank: '<path d="M8 2.2 14 5.4H2zM3.6 6.6v4.8M6.5 6.6v4.8M9.5 6.6v4.8M12.4 6.6v4.8M2 13.4h12"/>',
  bill: '<path d="M3.8 2.4h8.4v11.2l-1.4-1-1.4 1-1.4-1-1.4 1-1.4-1-1.4 1zM5.9 5.6h4.2M5.9 8h4.2M5.9 10.3h2.4"/>',
  snow: '<path d="M8 1.9v12.2M2.7 4.9l10.6 6.2M13.3 4.9 2.7 11.1M8 4.3 6.4 3M8 4.3 9.6 3M8 11.7l-1.6 1.3M8 11.7l1.6 1.3"/>',
  seed: '<path d="M8 13.6V6.9M8 6.9C8 4.4 6.2 2.6 3.6 2.6c0 2.6 1.8 4.3 4.4 4.3M8 8.6c0-2.1 1.6-3.6 3.9-3.6 0 2.1-1.6 3.6-3.9 3.6"/>',
  crown: '<path d="M2.7 12.4h10.6M3.2 12.4 2.3 4.9l3.3 2.5L8 3.3l2.4 4.1 3.3-2.5-.9 7.5M5.4 9.8h5.2"/>',
  tag: '<path d="M2.6 2.6h5.1l5.7 5.7-5.1 5.1-5.7-5.7zM5.2 5.2v.1"/>',
  mark: '<path d="M8 2.9 13.1 8 8 13.1 2.9 8z"/>',
};

// ---- эмодзи → иконка ----
const MAP = {
  idea: "💡✨🧩🔦",
  up: "📈🚀💪🌱⬆📊",
  down: "📉🥀📵",
  chart: "📊🧮📐📏",
  warn: "⚠🚧😰😤💥☠💀🪤🩸",
  money: "💵💶💲💰🪙💸",
  coin: "🛢🫘",
  time: "⏳",
  clock: "⏱⏰🕐🕒🕓🕔📅🗓⌚🐢",
  people: "👥🤝🫂🙋👔🧑👨👴",
  person: "👤🧍🚶🏃🧘😌😎🤔🤷🙅🤫😴💇",
  deal: "🤝",
  target: "🎯🧭📍🏁",
  box: "📦🎁🧳",
  cart: "🛒🛍",
  doc: "📄📜📝✍📃📰📩📨✉📧",
  list: "📋📑🗂📇🔢",
  scales: "⚖🏛🗳",
  tools: "🛠🔧🔨🪚🪓⛏",
  gear: "⚙🎛🔌🤖",
  eye: "👀👁🕵",
  search: "🔍🔬🔭",
  speak: "📣📢🗣📻",
  chat: "💬📞📲🎧",
  shield: "🛡🛟⚓🕊",
  lock: "🔒⛓",
  globe: "🌍🌐🗺✈🚢🛥⛵🛩",
  screen: "💻🖥📺🎥🎬🎞📹📷📸💾💿",
  phone: "📱",
  building: "🏢🏬🏭🏫🏥🏰🕌🏙",
  home: "🏠🏘🏚🏪🛏🛋🪑🚪🚿🛌",
  factory: "🏗🏭",
  fire: "🔥🌡🥊⚔",
  spark: "⭐🌟💎🎈🎨🎭🎹🎸🎵🎮🎢",
  star: "🏆🥇🥈🏅👑",
  cup: "☕🥤🥛🍽🍕🍔🍫🍎🍏🍊🍅🥩🍖🐟🧀🧈🍳🍿🎂🥪",
  key: "🔑🪪💍",
  route: "🛤🚸🚆🚌🚖🚗🚙🚜🚑🚓🏎🚚",
  loop: "🔁🔄↩⏭⏮⏸🔀",
  check: "✅🟢👍",
  cross: "❌🔇",
  ban: "🚫⛔🗑",
  flag: "🚩🪧🎟🔖",
  bolt: "⚡🔋🪫⛽",
  drop: "💧💦🌊🩺💉🧴🧪🧫🦠🩹",
  brain: "🧠🐝🐵🐅🐇🐌🐢🐾🦅🦢",
  hole: "🕳🌫☁🌀💨",
  book: "📚📕📖🎒",
  truck: "🚚",
  brick: "🧱🪨🏔",
  door: "🚪",
  card: "💳💱",
  bank: "🏦",
  tag: "🏷🔖🪧",
  bill: "🧾🪞🖼",
  snow: "❄🧊🌙☀🌅",
  seed: "🌱🌾🌿",
  crown: "👑",
};

const byEmoji = new Map();
for (const [icon, chars] of Object.entries(MAP)) {
  for (const ch of [...chars]) if (!byEmoji.has(ch)) byEmoji.set(ch, icon);
}

const svg = (icon, extra = "") =>
  `<svg class="ic${extra}" data-ic="${icon}" viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[icon] ?? ICONS.mark}</svg>`;

const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{25A0}-\u{25FF}]\u{FE0F}?/gu;
const KEEP = new Set(["→", "←", "➔", "↔", "➖", "➕", "↑", "↓"]);

function pick(ch) {
  const bare = ch.replace(/️/g, "");
  return byEmoji.get(bare) ?? null;
}

let files = 0, slots = 0, inline = 0, redrawn = 0;

function processFile(file) {
  const src = fs.readFileSync(file, "utf8");
  let out = src;

  // 0. перерисовка: если иконки уже стоят, обновляем их контур по имени
  out = out.replace(/<svg class="ic([^"]*)" data-ic="([a-z]+)"[\s\S]*?<\/svg>/g, (m, extra, name) => {
    redrawn++;
    return svg(name, extra);
  });

  // 1. иконочные слоты: .ins-ico / .fc-ico / .vs-ico и любые *-ico
  out = out.replace(/(<span\s+class="([^"]*-ico[^"]*)"[^>]*>)([\s\S]{0,12}?)(<\/span>)/g, (m, open, cls, body, close) => {
    if (body.includes("<svg")) return m;
    const chars = [...body.matchAll(EMOJI_RE)].map((x) => x[0]).filter((c) => !KEEP.has(c.replace(/️/g, "")));
    if (!chars.length) return m;
    slots++;
    return `${open}${svg(pick(chars[0]) ?? "mark")}${close}`;
  });

  // 2. версия таблицы стилей: иначе новые классы приедут без оформления
  out = out.replace(/lessons\.css\?v=\d+/g, `lessons.css?v=${CSS_V}`);

  // 3. инлайновые маркеры в тексте: флаг и галочка
  out = out.replace(/([🚩✅❌⚠])️?/gu, (m, ch) => {
    inline++;
    const icon = ch === "🚩" ? "flag" : ch === "✅" ? "check" : ch === "❌" ? "cross" : "warn";
    return svg(icon, ` ic-${icon}`);
  });

  if (out !== src) {
    files++;
    if (!DRY) fs.writeFileSync(file, out);
  }
}

const targets = [
  ...listHtml(path.join(ROOT, "public/academy")),
  ...listHtml(path.join(ROOT, "public/reviews-html")),
];

function listHtml(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listHtml(p));
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

targets.forEach(processFile);
console.log(`ink-icons: ${files} файлов, ${slots} в слотах, ${inline} инлайновых, ${redrawn} перерисовано${DRY ? " (проба)" : ""}`);
