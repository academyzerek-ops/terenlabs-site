import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    // Правила React-компилятора (next 16) слишком строги для наших
    // легитимных клиентских паттернов: Date.now() в обработчиках событий
    // и одноразовое чтение localStorage в useEffect на маунте. Оставляем
    // как предупреждения — видны, но не валят сборку.
    rules: {
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "public/**", "scripts/**"],
  },
];

export default eslintConfig;
