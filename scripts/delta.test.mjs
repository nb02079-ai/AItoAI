// 고정 검사 10개 — computeDelta() 재현 테스트.
// 실행: node scripts/delta.test.mjs
import { computeDelta } from "./delta.mjs";

const cases = [
  {
    id: "D-01",
    input: { value: 3200000, unit: "KRW/ozt", prevValue: 3150000, prevUnit: "KRW/ozt" },
    expect: (r) => r.cls === "up" && r.pct === 1.59 && r.text.startsWith("+50,000원 (+1.59%)"),
  },
  {
    id: "D-02",
    input: { value: 3100000, unit: "KRW/ozt", prevValue: 3150000, prevUnit: "KRW/ozt" },
    expect: (r) => r.cls === "down" && r.pct === -1.59 && r.text.startsWith("-50,000원 (-1.59%)"),
  },
  {
    id: "D-03",
    input: { value: 3150000, unit: "KRW/ozt", prevValue: 3150000, prevUnit: "KRW/ozt" },
    expect: (r) => r.cls === "flat" && r.pct === 0 && r.text === "±0원 (±0.00%)",
  },
  {
    id: "D-04",
    input: { value: 3150000, unit: "KRW/ozt", prevValue: null, prevUnit: null },
    expect: (r) => r.state === "no_prev" && r.text === "비교할 이전 정상 기록 없음" && r.cls === "flat",
  },
  {
    id: "D-05",
    input: { value: 3150000, unit: "KRW/ozt", prevValue: 2300, prevUnit: "USD/ozt" },
    expect: (r) => r.state === "unit_mismatch" && r.text === "단위가 달라 비교할 수 없음",
  },
  {
    id: "D-06 (경계값: diff/prev = 정확히 0.005%)",
    input: { value: 3150157.5, unit: "KRW/ozt", prevValue: 3150000, prevUnit: "KRW/ozt" },
    expect: (r) => r.pct === 0.01 && r.cls === "up",
  },
  {
    id: "D-07 (반올림하면 0%가 되는 아주 작은 음수 변화)",
    input: { value: 3149999.9, unit: "KRW/ozt", prevValue: 3150000, prevUnit: "KRW/ozt" },
    expect: (r) => r.pct === 0 && r.cls === "flat" && r.text.startsWith("±"),
  },
  {
    id: "D-08 (이전 값이 0 — 0으로 나누기 방지)",
    input: { value: 100, unit: "KRW/ozt", prevValue: 0, prevUnit: "KRW/ozt" },
    expect: (r) => r.state === "no_percent_base_zero" && r.pct === null && r.text.includes("퍼센트 계산 불가"),
  },
  {
    id: "D-09 (매우 큰 값 — 포맷 안 깨짐)",
    input: { value: 99999999, unit: "KRW/ozt", prevValue: 1, prevUnit: "KRW/ozt" },
    expect: (r) => typeof r.pct === "number" && Number.isFinite(r.pct) && /^\+/.test(r.text),
  },
  {
    id: "D-10 (동일 입력 3회 반복 — 순수 함수 일관성)",
    input: { value: 3200000, unit: "KRW/ozt", prevValue: 3150000, prevUnit: "KRW/ozt" },
    expect: (r0) => {
      const r1 = computeDelta({ value: 3200000, unit: "KRW/ozt", prevValue: 3150000, prevUnit: "KRW/ozt" });
      const r2 = computeDelta({ value: 3200000, unit: "KRW/ozt", prevValue: 3150000, prevUnit: "KRW/ozt" });
      return r0.text === r1.text && r1.text === r2.text && r0.cls === r1.cls && r1.cls === r2.cls;
    },
  },
];

let pass = 0, fail = 0;
for (const c of cases) {
  const result = computeDelta(c.input);
  let ok = false;
  try { ok = !!c.expect(result); } catch { ok = false; }
  console.log(`[${ok ? "PASS" : "FAIL"}] ${c.id} -> ${JSON.stringify(result)}`);
  ok ? pass++ : fail++;
}
console.log(`\n총 ${cases.length}개 중 통과 ${pass}개, 실패 ${fail}개`);
process.exit(fail === 0 ? 0 : 1);
