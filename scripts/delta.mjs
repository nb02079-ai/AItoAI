// 등락(전일 대비 변화) 계산을 순수 함수로 분리.
// index.html의 renderValue()에서 인라인으로 계산하던 로직을 뽑아내
// 반올림 규칙을 한 곳에서 명시하고, 브라우저 없이도(Node) 테스트 가능하게 함.
//
// 반올림 규칙: 퍼센트는 소수 둘째 자리, "0에서 먼 방향(half away from zero)"으로 반올림한다.
// 반올림 결과가 정확히 0.00%이면 부호와 색상 모두 "flat(±)"로 취급한다.

export function roundHalfAwayFromZero(n, digits) {
  const factor = 10 ** digits;
  const sign = n < 0 ? -1 : 1;
  return (sign * Math.round(Math.abs(n) * factor)) / factor;
}

/**
 * @param {object} p
 * @param {number} p.value        오늘 값
 * @param {string} p.unit         오늘 단위
 * @param {number|null} p.prevValue  이전 정상 값 (없으면 null)
 * @param {string|null} p.prevUnit   이전 단위 (없으면 null)
 * @returns {{state: string, text: string, cls: string, pct: number|null}}
 */
export function computeDelta({ value, unit, prevValue, prevUnit }) {
  if (prevValue === null || prevValue === undefined) {
    return { state: "no_prev", text: "비교할 이전 정상 기록 없음", cls: "flat", pct: null };
  }
  if (prevUnit !== undefined && prevUnit !== null && unit !== prevUnit) {
    return { state: "unit_mismatch", text: "단위가 달라 비교할 수 없음", cls: "flat", pct: null };
  }

  const diff = value - prevValue;

  // 0으로 나누기 방지: 퍼센트는 계산하지 않고 원화 변화만 표시
  if (prevValue === 0) {
    const sign = diff > 0 ? "+" : diff < 0 ? "-" : "±";
    return {
      state: "no_percent_base_zero",
      text: `${sign}${Math.round(Math.abs(diff)).toLocaleString("ko-KR")}원 (퍼센트 계산 불가)`,
      cls: diff > 0 ? "up" : diff < 0 ? "down" : "flat",
      pct: null,
    };
  }

  const rawPct = (diff / prevValue) * 100;
  const pct = roundHalfAwayFromZero(rawPct, 2);

  // 반올림 결과가 0.00이면 실제 diff 부호와 무관하게 flat으로 취급
  const cls = pct > 0 ? "up" : pct < 0 ? "down" : "flat";
  const sign = pct > 0 ? "+" : pct < 0 ? "-" : "±";
  const wonAmount = Math.round(Math.abs(diff)).toLocaleString("ko-KR");
  const pctText = Math.abs(pct).toFixed(2);

  return {
    state: "comparable",
    text: `${sign}${wonAmount}원 (${sign}${pctText}%)`,
    cls,
    pct,
  };
}
