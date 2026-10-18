import type { GrowthVM } from "@/lib/types";
import { bnDigits, formatDateBn } from "@/lib/utils";
import { t } from "@/lib/i18n";

/**
 * Accessible growth chart.
 *
 * Hand-rolled inline SVG (no chart library → tiny first paint):
 *  • Two series — height (lavender) and weight (blush).
 *  • A full data table below carries the same information for screen
 *    readers and anyone who prefers numbers.
 */
export function GrowthChart({ entries }: { entries: GrowthVM[] }) {
  const points = entries.filter((e) => e.heightCm || e.weightKg);
  if (points.length === 0) {
    return <p className="card p-6 text-ink-500">{t("growth.empty")}</p>;
  }

  const W = 720;
  const H = 320;
  const PAD = { top: 24, right: 24, bottom: 48, left: 48 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const heights = points.map((p) => p.heightCm).filter((v): v is number => !!v);
  const weights = points.map((p) => p.weightKg).filter((v): v is number => !!v);
  const maxH = Math.max(...heights, 1) * 1.1;
  const maxW = Math.max(...weights, 1) * 1.1;

  const x = (i: number) =>
    PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const yH = (v: number) => PAD.top + innerH - (v / maxH) * innerH;
  const yW = (v: number) => PAD.top + innerH - (v / maxW) * innerH;

  const line = (
    values: (number | undefined)[],
    scaleY: (v: number) => number,
  ): string =>
    values
      .map((v, i) => (v === undefined ? null : `${x(i)},${scaleY(v)}`))
      .filter(Boolean)
      .join(" ");

  const gridLines = [0.25, 0.5, 0.75, 1];

  return (
    <div className="card p-4 sm:p-6">
      {/* Visible legend */}
      <ul className="mb-3 flex flex-wrap gap-4 text-sm">
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-lavender-400" aria-hidden="true" />
          {t("growth.height")}
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-blush-400" aria-hidden="true" />
          {t("growth.weight")}
        </li>
      </ul>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`${t("growth.title")} — উচ্চতা ও ওজনের চার্ট, নিচের সারণিতে পুরো তথ্য আছে`}
      >
        {gridLines.map((g) => (
          <line
            key={g}
            x1={PAD.left}
            x2={W - PAD.right}
            y1={PAD.top + innerH - g * innerH}
            y2={PAD.top + innerH - g * innerH}
            stroke="#EDE8E6"
            strokeWidth={1}
          />
        ))}
        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={PAD.top + innerH}
          y2={PAD.top + innerH}
          stroke="#B4A7AE"
          strokeWidth={1.5}
        />

        {/* weight */}
        <polyline
          points={line(
            points.map((p) => p.weightKg),
            yW,
          )}
          fill="none"
          stroke="#DF8E89"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) =>
          p.weightKg ? (
            <circle key={`w${i}`} cx={x(i)} cy={yW(p.weightKg)} r={5} fill="#DF8E89" />
          ) : null,
        )}

        {/* height */}
        <polyline
          points={line(
            points.map((p) => p.heightCm),
            yH,
          )}
          fill="none"
          stroke="#A28ED0"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) =>
          p.heightCm ? (
            <circle key={`h${i}`} cx={x(i)} cy={yH(p.heightCm)} r={5} fill="#A28ED0" />
          ) : null,
        )}

        {/* x labels — every other label on narrow charts */}
        {points.map((p, i) =>
          points.length > 8 && i % 2 === 1 ? null : (
            <text
              key={`x${i}`}
              x={x(i)}
              y={H - 18}
              textAnchor="middle"
              fontSize={12}
              fill="#7C6C74"
            >
              {bnDigits(p.measuredOn.slice(5, 7))}/{bnDigits(p.measuredOn.slice(0, 4))}
            </text>
          ),
        )}
      </svg>

      {/* Same data as an accessible table */}
      <table className="mt-4 w-full text-sm">
        <caption className="sr-only">{t("growth.tableCaption")}</caption>
        <thead>
          <tr className="border-b border-cream-200 text-right text-ink-500">
            <th scope="col" className="py-2 text-left">
              {t("growth.date")}
            </th>
            <th scope="col" className="py-2">
              {t("growth.height")}
            </th>
            <th scope="col" className="py-2">
              {t("growth.weight")}
            </th>
            <th scope="col" className="py-2">
              {t("growth.head")}
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} className="border-b border-cream-100 text-right text-ink-700">
              <th scope="row" className="py-2 text-left font-medium">
                {formatDateBn(e.measuredOn)}
                {e.note ? <span className="block text-xs text-ink-300">{e.note}</span> : null}
              </th>
              <td className="py-2">{e.heightCm ? bnDigits(e.heightCm) : "—"}</td>
              <td className="py-2">{e.weightKg ? bnDigits(e.weightKg) : "—"}</td>
              <td className="py-2">{e.headCircumferenceCm ? bnDigits(e.headCircumferenceCm) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
