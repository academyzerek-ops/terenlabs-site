// Области РК для онбординга и среза рейтинга (ISO 3166-2:KZ).
// 17 областей + 3 города республиканского значения = 20 регионов.
export const KZ_REGIONS: { code: string; name: string }[] = [
  { code: "KZ-71", name: "Астана" },
  { code: "KZ-75", name: "Алматы" },
  { code: "KZ-79", name: "Шымкент" },
  { code: "KZ-10", name: "Абайская область" },
  { code: "KZ-11", name: "Акмолинская область" },
  { code: "KZ-15", name: "Актюбинская область" },
  { code: "KZ-19", name: "Алматинская область" },
  { code: "KZ-23", name: "Атырауская область" },
  { code: "KZ-27", name: "Западно-Казахстанская область" },
  { code: "KZ-31", name: "Жамбылская область" },
  { code: "KZ-33", name: "Жетысуская область" },
  { code: "KZ-35", name: "Карагандинская область" },
  { code: "KZ-39", name: "Костанайская область" },
  { code: "KZ-43", name: "Кызылординская область" },
  { code: "KZ-47", name: "Мангистауская область" },
  { code: "KZ-55", name: "Павлодарская область" },
  { code: "KZ-59", name: "Северо-Казахстанская область" },
  { code: "KZ-61", name: "Туркестанская область" },
  { code: "KZ-62", name: "Улытауская область" },
  { code: "KZ-63", name: "Восточно-Казахстанская область" },
];

export function regionName(code: string | null | undefined): string | null {
  return KZ_REGIONS.find((r) => r.code === code)?.name ?? null;
}
