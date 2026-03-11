export const CHART_COLORS = [
  '#2DD4BF', // Series 1 — Verdigris Teal (brand)
  '#60A5FA', // Series 2 — Sapphire Blue
  '#FB7185', // Series 3 — Coral Rose
  '#FBBF24', // Series 4 — Marigold Amber
  '#A78BFA', // Series 5 — Soft Lavender
  '#86EFAC', // Series 6 — Sage Green
  '#94A3B8', // Series 7 — Cool Slate
  '#FB923C', // Series 8 — Rust Orange
]

export const CHART_THEME = {
  backgroundColor: 'transparent',
  gridColor: '#1C2730',
  axisColor: '#4F6478',
  tooltipBg: '#1A232D',
  tooltipBorder: '#344558',
  tooltipText: '#E8EDF2',
  tooltipLabelColor: '#8FA3B8',
  legendColor: '#8FA3B8',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 12,
}

export const AREA_GRADIENT = {
  startColor: '#2DD4BF',
  startOpacity: 0.13,
  endColor: '#2DD4BF',
  endOpacity: 0,
}

/** Dynamic chart theme — reads CSS variables at runtime, respects dark/light mode */
export function getChartTheme() {
  if (typeof window === 'undefined') return CHART_THEME
  const style = getComputedStyle(document.documentElement)
  const get = (v: string) => style.getPropertyValue(v).trim()

  return {
    colors: [
      get('--accent-base') || CHART_COLORS[0],
      '#60A5FA',
      '#FB7185',
      '#FBBF24',
      '#A78BFA',
      '#86EFAC',
      '#94A3B8',
      '#FB923C',
    ],
    gridColor:     get('--border-faint')   || '#1C2730',
    axisColor:     get('--text-muted')     || '#4F6478',
    tooltipBg:     get('--bg-overlay')     || '#1A232D',
    tooltipBorder: get('--border-strong')  || '#344558',
    tooltipText:   get('--text-primary')   || '#E8EDF2',
    labelColor:    get('--text-secondary') || '#8FA3B8',
    fontFamily:    "'JetBrains Mono', monospace",
    fontSize:      12,
  }
}
