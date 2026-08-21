/* 저장된 기록을 사람이 읽는 한 줄로 바꿔줍니다.
   어떤 날은 문자열을, 어떤 날은 객체를 저장해 두었기 때문입니다. */

window.JourneyText = {

  value: function (key, fallback) {
    const raw = SaveSystem.get(key, null);
    const s = JourneyText.toLine(raw);
    return s || (fallback || null);
  },

  toLine: function (raw) {
    if (raw === null || raw === undefined) return null;
    if (typeof raw === 'string') return raw.trim() || null;
    if (typeof raw === 'number') return String(raw);
    if (Array.isArray(raw)) {
      const parts = raw.map(JourneyText.toLine).filter(Boolean);
      return parts.length ? parts.join(', ') : null;
    }
    if (typeof raw === 'object') {
      /* DAY 6 파견 · DAY 7 나눔은 이미 문장으로 만들어 두었습니다 */
      if (raw.sentence) return String(raw.sentence);
      if (raw.how) return String(raw.how);
      if (raw.gift && raw.who) return raw.who + ' · ' + raw.gift;
      if (raw.label) return String(raw.label);
      if (raw.gift) return String(raw.gift);
      if (raw.message) return String(raw.message);
      return null;
    }
    return null;
  }
};
