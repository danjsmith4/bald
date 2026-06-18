export function formatNumber(value) {
  if (value === -1 || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

export function formatRank(value) {
  if (value === -1 || value === undefined || Number.isNaN(value)) {
    return "Unranked";
  }

  return `#${formatNumber(value)}`;
}
