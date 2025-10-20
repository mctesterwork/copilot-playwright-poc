export const serializeParams = (params: Record<string, any>): Record<string, string> => {
  const out: Record<string, string> = {};
  if (!params) return out;
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) {
      // join arrays with comma (API may accept repeated keys differently)
      out[k] = v.map(String).join(',');
    } else if (typeof v === 'object') {
      // JSON-stringify objects
      out[k] = JSON.stringify(v);
    } else {
      out[k] = String(v);
    }
  });
  return out;
};
