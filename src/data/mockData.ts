import type { DashboardResponse } from '../types'

export const CHART_COLORS = ['#2DD4BF', '#60A5FA', '#FB7185', '#FBBF24', '#A78BFA', '#86EFAC', '#94A3B8', '#FB923C']

export const mockRevenueLineData = [
  { month: 'Jan', north: 4200, south: 2800, east: 3100, west: 5200 },
  { month: 'Feb', north: 3800, south: 3200, east: 2900, west: 4800 },
  { month: 'Mar', north: 5100, south: 2600, east: 3400, west: 6100 },
  { month: 'Apr', north: 4700, south: 3100, east: 3800, west: 5700 },
  { month: 'May', north: 5300, south: 3500, east: 4200, west: 6400 },
  { month: 'Jun', north: 4900, south: 3800, east: 4500, west: 7100 },
  { month: 'Jul', north: 5600, south: 4100, east: 4800, west: 7800 },
  { month: 'Aug', north: 6200, south: 4600, east: 5100, west: 8500 },
  { month: 'Sep', north: 5800, south: 4300, east: 4900, west: 7900 },
  { month: 'Oct', north: 6500, south: 4900, east: 5400, west: 8900 },
  { month: 'Nov', north: 7200, south: 5400, east: 6100, west: 9800 },
  { month: 'Dec', north: 8100, south: 6200, east: 7200, west: 11200 },
]

export const mockCategoryBarData = [
  { category: 'Electronics', revenue: 42000, profit: 12600 },
  { category: 'Clothing', revenue: 28000, profit: 9800 },
  { category: 'Home Goods', revenue: 19500, profit: 7800 },
  { category: 'Sports', revenue: 15200, profit: 5320 },
  { category: 'Beauty', revenue: 11800, profit: 5310 },
  { category: 'Books', revenue: 6400, profit: 2560 },
  { category: 'Toys', revenue: 8900, profit: 3560 },
  { category: 'Food', revenue: 5200, profit: 1820 },
]

export const mockSegmentPieData = [
  { name: 'Enterprise', value: 38, revenue: 1840000 },
  { name: 'SMB', value: 27, revenue: 1296000 },
  { name: 'Consumer', value: 20, revenue: 960000 },
  { name: 'Startup', value: 10, revenue: 480000 },
  { name: 'Government', value: 5, revenue: 240000 },
]

export const mockMarketingAreaData = [
  { month: 'Jan', google: 12000, meta: 8500, email: 3200, influencer: 4500 },
  { month: 'Feb', google: 13200, meta: 9100, email: 3800, influencer: 4200 },
  { month: 'Mar', google: 15800, meta: 10200, email: 4100, influencer: 5800 },
  { month: 'Apr', google: 14500, meta: 9800, email: 4500, influencer: 5200 },
  { month: 'May', google: 16200, meta: 11500, email: 5100, influencer: 6400 },
  { month: 'Jun', google: 17800, meta: 12200, email: 5800, influencer: 7100 },
]

export const mockROIBarData = [
  { channel: 'Email', roi: 340, spend: 5200, conversions: 892 },
  { channel: 'SEO', roi: 280, spend: 8900, conversions: 1240 },
  { channel: 'Referral', roi: 220, spend: 4100, conversions: 580 },
  { channel: 'Social', roi: 145, spend: 15600, conversions: 1820 },
  { channel: 'Google Ads', roi: 89, spend: 28400, conversions: 2140 },
  { channel: 'Meta', roi: 72, spend: 19800, conversions: 1560 },
  { channel: 'Influencer', roi: 61, spend: 12400, conversions: 780 },
]

export const mockSampleSQL = `SELECT 
  DATE_TRUNC('month', s.sale_date) AS month,
  p.category,
  SUM(s.revenue) AS total_revenue,
  SUM(s.profit_margin * s.revenue) AS total_profit,
  COUNT(DISTINCT s.order_id) AS order_count
FROM sales s
JOIN products p ON s.product_id = p.id
WHERE s.sale_date BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY 1, 2
ORDER BY 1, 3 DESC
LIMIT 200;`

export const mockInsights: Record<string, string[]> = {
  default: [
    '📈 West region leads all regions with $67.2K in Q3, up 23% from Q2 — driven by a back-to-school electronics surge.',
    '⚡ August was the strongest month across every region simultaneously, a rare pattern suggesting a market-wide demand spike.',
    '🏆 Electronics dominates at 42% of total revenue, followed by Clothing at 28% — the gap has widened 6pp year-over-year.',
    '⚠️ South region underperforms by 31% vs. North despite similar market size, indicating untapped opportunity worth ~$18K/quarter.',
    '💡 Q3 2024 total revenue of $148.2K represents a 19% improvement over Q3 2023, ahead of the original 15% growth target.',
  ],
  revenue: [
    '📈 Total 2024 revenue reached $4.82M, exceeding the annual target by 12.4%.',
    '🏆 Electronics is the top-performing category at $2.02M (42% share), with strong Q4 seasonality.',
    '⚠️ Q2 showed a -8% dip likely tied to supply chain adjustments; Q3 fully recovered.',
    '💡 YoY growth of 19% outpaces the industry average of 11%, signaling competitive strength.',
  ],
  marketing: [
    '📈 Email marketing delivers 340% ROI vs Google Ads at 89% — a compelling case for budget reallocation.',
    '💰 Every $1 spent on SEO generates $2.80 in revenue, making it the highest-value owned channel.',
    '⚠️ Meta and Google Ads together consume 68% of budget but deliver only 44% of conversions.',
    '🎯 Referral programs are underutilized — 220% ROI with only $4.1K spend suggests scaling potential.',
  ],
}

function getMockResponse(query: string): DashboardResponse {
  const q = query.toLowerCase()
  const id = crypto.randomUUID ? crypto.randomUUID() : `conv-${Date.now()}`

  if (q.includes('market') || q.includes('roi') || q.includes('campaign') || q.includes('channel')) {
    return {
      success: true,
      sql_generated: `SELECT channel, SUM(spend_amount) as total_spend,
  SUM(conversions) as total_conversions,
  ROUND((SUM(conversions * 150.0) / NULLIF(SUM(spend_amount), 0) - 1) * 100, 1) as roi_pct
FROM marketing_spend
WHERE campaign_date BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY channel ORDER BY roi_pct DESC;`,
      charts: [
        {
          chart_id: 'chart_1',
          chart_type: 'bar',
          title: 'Marketing ROI by Channel (2024)',
          description: 'Return on investment percentage for each marketing channel',
          data: mockROIBarData,
          config: { xKey: 'channel', yKey: 'roi', colors: CHART_COLORS },
        },
        {
          chart_id: 'chart_2',
          chart_type: 'area',
          title: 'Monthly Marketing Spend & Conversions',
          description: 'Trend of spend across channels over time',
          data: mockMarketingAreaData,
          config: { xKey: 'month', yKey: ['google', 'meta', 'email', 'influencer'], colors: CHART_COLORS },
        },
      ],
      insights: mockInsights.marketing,
      follow_up_suggestions: [
        'Compare Q4 2024 vs Q4 2023 for each channel',
        'Show cost per acquisition by channel',
        'Which channel has the highest customer lifetime value?',
      ],
      conversation_id: id,
      generated_in: 2.1,
    }
  }

  if (q.includes('segment') || q.includes('customer') || q.includes('acquisition')) {
    return {
      success: true,
      sql_generated: `SELECT c.segment, c.acquisition_channel,
  COUNT(DISTINCT c.id) AS customer_count,
  AVG(c.lifetime_value) AS avg_ltv,
  SUM(s.revenue) AS total_revenue
FROM customers c
JOIN sales s ON c.id = s.customer_id
GROUP BY 1, 2 ORDER BY 5 DESC LIMIT 100;`,
      charts: [
        {
          chart_id: 'chart_1',
          chart_type: 'pie',
          title: 'Revenue by Customer Segment',
          description: 'Share of revenue contributed by each customer segment',
          data: mockSegmentPieData,
          config: { xKey: 'name', yKey: 'value', colors: CHART_COLORS },
        },
        {
          chart_id: 'chart_2',
          chart_type: 'bar',
          title: 'Customer Count by Segment',
          description: 'Distribution of customers across segments',
          data: mockSegmentPieData.map(d => ({ segment: d.name, count: Math.round(d.value * 42) })),
          config: { xKey: 'segment', yKey: 'count', colors: CHART_COLORS },
        },
      ],
      insights: [
        '🏢 Enterprise segment generates 38% of revenue despite being only 18% of customer count — highest LTV at $48K.',
        '📊 SMB customers show the fastest growth rate at +34% YoY, making them the highest-priority acquisition target.',
        '🎯 Organic acquisition channel produces customers with 2.3x higher lifetime value than paid channels.',
        '⚠️ Consumer segment churn risk score averages 0.62, the highest of all segments — retention programs needed.',
      ],
      follow_up_suggestions: [
        'Show churn risk by segment',
        'Compare acquisition costs across channels',
        'Which segment has the highest reorder rate?',
      ],
      conversation_id: id,
      generated_in: 1.8,
    }
  }

  if (q.includes('product') || q.includes('category') || q.includes('profit')) {
    return {
      success: true,
      sql_generated: mockSampleSQL,
      charts: [
        {
          chart_id: 'chart_1',
          chart_type: 'bar',
          title: 'Revenue & Profit by Product Category',
          description: 'Comparative performance of all product categories',
          data: mockCategoryBarData,
          config: { xKey: 'category', yKey: ['revenue', 'profit'], colors: CHART_COLORS },
        },
        {
          chart_id: 'chart_2',
          chart_type: 'pie',
          title: 'Revenue Share by Category',
          description: 'Proportional contribution of each category to total revenue',
          data: mockCategoryBarData.map(d => ({ name: d.category, value: d.revenue })),
          config: { xKey: 'name', yKey: 'value', colors: CHART_COLORS },
        },
      ],
      insights: mockInsights.revenue,
      follow_up_suggestions: [
        'Show month-over-month trend for Electronics',
        'Which products have the highest profit margin?',
        'Compare category performance by region',
      ],
      conversation_id: id,
      generated_in: 2.4,
    }
  }

  // Default: revenue by region
  return {
    success: true,
    sql_generated: `SELECT 
  TO_CHAR(DATE_TRUNC('month', sale_date), 'Mon') AS month,
  region,
  SUM(revenue) AS total_revenue
FROM sales
WHERE sale_date BETWEEN '2024-01-01' AND '2024-12-31'
  AND region IN ('North', 'South', 'East', 'West')
GROUP BY DATE_TRUNC('month', sale_date), region, TO_CHAR(DATE_TRUNC('month', sale_date), 'Mon')
ORDER BY DATE_TRUNC('month', sale_date);`,
    charts: [
      {
        chart_id: 'chart_1',
        chart_type: 'line',
        title: 'Monthly Revenue by Region (2024)',
        description: 'Revenue trend across all 4 regions over 12 months',
        data: mockRevenueLineData,
        config: { xKey: 'month', yKey: ['north', 'south', 'east', 'west'], colors: CHART_COLORS },
      },
      {
        chart_id: 'chart_2',
        chart_type: 'bar',
        title: 'Product Category Revenue Breakdown',
        description: 'Revenue and profit margins by category',
        data: mockCategoryBarData,
        config: { xKey: 'category', yKey: ['revenue', 'profit'], colors: CHART_COLORS },
      },
      {
        chart_id: 'chart_3',
        chart_type: 'pie',
        title: 'Revenue by Customer Segment',
        description: 'Proportional revenue contribution by segment type',
        data: mockSegmentPieData,
        config: { xKey: 'name', yKey: 'value', colors: CHART_COLORS },
      },
    ],
    insights: mockInsights.default,
    follow_up_suggestions: [
      'Break this down by product category',
      'Compare with previous year performance',
      'Show top 10 products in the West region',
    ],
    conversation_id: id,
    generated_in: 2.3,
  }
}

export { getMockResponse }
