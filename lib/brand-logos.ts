// Логотипы разбираемых компаний. Файлы скачаны с Викисклада (Public domain / CC0),
// у Roland-Garros свободной копии нет — взят файл французской Википедии как
// зарегистрированный знак. Логотип стоит рядом с названием компании, о которой
// идёт разбор: это опознавательный знак материала, а не наш бренд.
const HAVE = new Set([
  "netflix", "ufc", "amazon", "bayern", "bmw", "louis-vuitton", "nike",
  "pepsi", "roland-garros", "telegram", "tiktok", "uefa", "whatsapp",
]);

export function brandLogo(slug: string): string | null {
  const key = slug.replace(/^bm-/, "");
  return HAVE.has(key) ? `/brand-logos/${key}.svg` : null;
}
