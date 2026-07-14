// Вставка структурированных данных (schema.org JSON-LD) в <head>/<body>.
// Серверный компонент. data — наши собственные объекты (НЕ пользовательский ввод),
// поэтому dangerouslySetInnerHTML здесь безопасен.
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
