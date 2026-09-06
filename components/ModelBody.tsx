import type { ModelBlock, ModelCard, ModelItem } from "@/lib/models-data";
import { shown } from "@/lib/models-data";

// Тело карточки модели заработка. Данные типизированы, поэтому рендер идёт
// компонентами, а не строкой html: так текст индексируется и живёт в теме сайта.
//
// Узлы с меткой pending пропускаются молча: это тезисы с цифрой, которая ещё не
// сверена по первичке. Читателю про внутреннюю кухню знать незачем, а показывать
// число без источника нельзя — раздел обещает обратное.

function Paragraph({ text, lead }: { text?: string; lead?: string }) {
  if (!text && !lead) return null;
  return (
    <p className="max-w-[70ch] text-[15px] leading-relaxed text-body">
      {lead && <b className="font-medium text-ink">{lead} </b>}
      {text}
    </p>
  );
}

function Item({ item }: { item: ModelItem }) {
  if (!shown(item)) return null;

  switch (item.kind) {
    case "paragraph":
      return <Paragraph text={item.text} lead={item.lead} />;

    case "heading":
      return <h3 className="text-[16px] text-ink">{item.text}</h3>;

    case "split":
      return (
        <div className="grid gap-6 lg:grid-cols-2">
          {(item.panels ?? []).filter(shown).map((p, i) => (
            <Item key={i} item={p} />
          ))}
        </div>
      );

    case "panel":
      return (
        <div className="panel grid content-start gap-3 p-5">
          {item.h && <h4 className="text-[15px] text-ink">{item.h}</h4>}
          {(item.items ?? []).map((x, i) =>
            typeof x === "string" ? <Paragraph key={i} text={x} /> : <Item key={i} item={x} />
          )}
        </div>
      );

    // Метрики стоят и в широкой колонке, и внутри узкой панели «Экономика»,
    // поэтому колонки не фиксируем: определение идёт под термином.
    case "metrics":
      return (
        <dl className="grid gap-0">
          {(item.pairs ?? []).map(([t, d], i) => (
            <div key={i} className="grid gap-0.5 border-t border-line py-3">
              <dt className="text-[15px] font-medium text-ink">{t}</dt>
              <dd className="text-[14px] leading-relaxed text-text-2">{d}</dd>
            </div>
          ))}
          <div className="border-t border-line" />
        </dl>
      );

    case "steps":
      return (
        <ol className="grid gap-0">
          {(item.items ?? []).filter((x) => typeof x !== "string" && shown(x)).map((x, i) => {
            const s = x as ModelItem;
            return (
              <li key={i} className="grid gap-2 border-t border-line py-4 sm:grid-cols-[40px_minmax(0,1fr)] sm:gap-4">
                <span className="num text-[13px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                <Paragraph text={s.text} lead={s.lead} />
              </li>
            );
          })}
          <div className="border-t border-line" />
        </ol>
      );

    case "notes":
    case "list":
      return (
        <ul className="grid gap-0">
          {(item.items ?? []).filter((x) => typeof x === "string" || shown(x)).map((x, i) => (
            <li key={i} className="border-t border-line py-3">
              {typeof x === "string" ? (
                <Paragraph text={x} />
              ) : (
                <Paragraph text={(x as ModelItem).text} lead={(x as ModelItem).lead} />
              )}
            </li>
          ))}
          <div className="border-t border-line" />
        </ul>
      );

    case "table":
      return (
        <div className="sm:overflow-x-auto">
          {/* На телефоне таблицу не листают вбок: строка распадается на подпись
              сверху и значение под ней. С sm возвращается обычная таблица. */}
          <table className="w-full border-collapse text-[15px] sm:min-w-[520px]">
            <tbody>
              {(item.rows ?? [])
                .filter((row) => row.every((c) => shown(c)))
                .map((row, i) => (
                  <tr key={i} className="block border-t border-line sm:table-row sm:align-baseline">
                    {row.map((c, j) => (
                      <td
                        key={j}
                        className={
                          j === 0
                            ? "block pb-1 pt-3 font-medium text-ink sm:table-cell sm:py-3 sm:pr-6"
                            : "block pb-3 leading-relaxed text-text-2 sm:table-cell sm:py-3"
                        }
                      >
                        {c.text}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      );

    case "minigrid":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {(item.items ?? []).filter((x) => typeof x !== "string" && shown(x)).map((x, i) => {
            const c = x as ModelItem;
            return (
              <div key={i} className="panel grid content-start gap-2 p-5">
                <h4 className="text-[15px] text-ink">{c.name}</h4>
                {(c.lead || c.formula) && (
                  <p className="text-[15px] leading-relaxed text-body">
                    {[c.lead, c.formula].filter(Boolean).join(" ")}
                  </p>
                )}
                {c.example && <p className="text-[14px] leading-relaxed text-text-2">{c.example}</p>}
                {c.kapkan && (
                  <p className="text-[14px] leading-relaxed text-text-2">
                    <span className="text-orange">Капкан: </span>
                    {c.kapkan}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      );

    case "callout":
      return (
        <div className={`panel grid content-start gap-2 p-5 ${item.warn ? "border-orange-100" : ""}`}>
          {(item.paragraphs ?? []).map((p, i) => (
            <Paragraph key={i} text={p} />
          ))}
        </div>
      );

    // «Крючки для выпусков» — заготовки тем для роликов, внутренняя кухня редакции.
    case "hooks":
      return null;

    default:
      return item.text ? <Paragraph text={item.text} lead={item.lead} /> : null;
  }
}

function Block({ block }: { block: ModelBlock }) {
  const items = block.items.filter(shown);
  if (items.length === 0) return null;
  return (
    <section className="grid gap-5">
      <h2 className="text-[20px] sm:text-[24px]">{block.label}</h2>
      <div className="grid gap-5">
        {items.map((it, i) => (
          <Item key={i} item={it} />
        ))}
      </div>
    </section>
  );
}

export function ModelFlow({ model }: { model: ModelCard }) {
  const flow = model.flow;
  if (!shown(flow)) return null;
  const nodes = flow!.nodes.filter(shown);
  if (nodes.length === 0) return null;
  const arrows = flow!.arrows ?? [];

  return (
    <section className="grid gap-5">
      <h2 className="text-[20px] sm:text-[24px]">{flow!.label || "Поток денег"}</h2>
      {/* узлы и подписи — соседи в одном потоке: вложенные обёртки переносились
          строкой целиком и оставляли дыру справа */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {nodes.flatMap((n, i) => {
          const cells = [
            <div key={`n${i}`} className={`panel grid gap-1 p-4 ${n.hero ? "border-line-2" : ""}`}>
              <span className="text-[15px] font-medium text-ink">{n.who}</span>
              <span className="text-[14px] text-text-2">{n.what}</span>
            </div>,
          ];
          if (i < nodes.length - 1) {
            cells.push(
              <span key={`a${i}`} className="text-[13px] text-faint">
                {shown(arrows[i]) ? `${arrows[i].text} ` : ""}→
              </span>
            );
          }
          return cells;
        })}
      </div>
      {shown(flow!.note) && (
        <p className="max-w-[70ch] text-[14px] leading-relaxed text-text-2">{flow!.note!.text}</p>
      )}
    </section>
  );
}

export function ModelKapkan({ model }: { model: ModelCard }) {
  if (!shown(model.kapkan)) return null;
  const paragraphs = model.kapkan!.paragraphs ?? [];
  if (paragraphs.length === 0) return null;
  return (
    <section className="panel grid gap-3 p-6">
      <span className="eyebrow !text-orange">{model.kapkan!.stamp || "Капкан"}</span>
      {paragraphs.map((p, i) => (
        <Paragraph key={i} text={p} />
      ))}
    </section>
  );
}

export function ModelBody({ model }: { model: ModelCard }) {
  return (
    <div className="grid gap-12">
      <ModelFlow model={model} />
      {model.blocks.map((b, i) => (
        <Block key={i} block={b} />
      ))}
      <ModelKapkan model={model} />
    </div>
  );
}
