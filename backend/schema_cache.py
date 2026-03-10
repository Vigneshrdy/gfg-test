"""
Hard-coded LLM context string for the NexaMart database.
Kept as a constant so the schema is always accurate and instant to retrieve.
Dynamic schema (for CSV uploads) is generated at upload time.
"""

NEXAMART_SCHEMA_FOR_LLM = """
## NexaMart E-Commerce Database (MySQL 8.0)
Company: NexaMart — sells Electronics, Clothing, Home Goods, Sports, Beauty products.
Data range: January 2023 – June 2025.

---
### Table: `products`  (50 rows)
| Column       | Type          | Notes |
|---|---|---|
| id           | INT           | Primary key |
| name         | VARCHAR(255)  | Full product name |
| category     | ENUM          | 'Electronics', 'Clothing', 'Home Goods', 'Sports', 'Beauty' |
| subcategory  | VARCHAR(100)  | e.g. 'Laptops', 'Smartphones', 'Yoga', 'Skincare' |
| brand        | VARCHAR(100)  | e.g. 'Nexa', 'GlowUp', 'FitPeak', 'NexaWear', 'ProChef' |
| cost_price   | DECIMAL(10,2) | Company wholesale cost |
| list_price   | DECIMAL(10,2) | Retail selling price |
| launch_date  | DATE          | Date product first available |
| is_active    | TINYINT(1)    | 1=active, 0=discontinued |

Notable product: 'NexaPro X1 Laptop' (category='Electronics', subcategory='Laptops', launched 2024-03-01, list_price=1999.00)

---
### Table: `customers`  (~500 rows)
| Column                | Type          | Notes |
|---|---|---|
| id                    | INT           | Primary key |
| full_name             | VARCHAR(255)  | |
| email                 | VARCHAR(255)  | Unique |
| segment               | ENUM          | 'Enterprise', 'SMB', 'Consumer' |
| acquisition_channel   | ENUM          | 'Organic', 'Paid', 'Referral', 'Social' |
| city                  | VARCHAR(100)  | |
| state                 | VARCHAR(100)  | US state |
| country               | VARCHAR(100)  | Default 'USA' |
| lifetime_value        | DECIMAL(12,2) | Total historical revenue |
| first_purchase_date   | DATE          | |
| churn_risk_score      | DECIMAL(3,2)  | 0.00 (loyal) – 1.00 (high churn risk) |

---
### Table: `sales`  (~5,500 rows)
| Column        | Type          | Notes |
|---|---|---|
| id            | INT           | Primary key |
| order_id      | VARCHAR(50)   | e.g. 'ORD-12345-2024' |
| product_id    | INT           | FK → products.id |
| customer_id   | INT           | FK → customers.id |
| region        | ENUM          | 'North', 'South', 'East', 'West', 'International' |
| sale_date     | DATE          | Transaction date |
| quantity      | INT           | Units sold |
| unit_price    | DECIMAL(10,2) | Price per unit at sale time |
| discount_pct  | DECIMAL(5,2)  | Discount applied 0–30% |
| revenue       | DECIMAL(12,2) | quantity × unit_price × (1 − discount_pct/100) |
| profit_margin | DECIMAL(5,2)  | Profit margin % |

Patterns: West region over-performs in H1 2024. Q4 (Nov–Dec) shows ~1.8× Electronics spike.

---
### Table: `marketing_spend`  (~300 rows)
| Column        | Type          | Notes |
|---|---|---|
| id            | INT           | Primary key |
| campaign_name | VARCHAR(255)  | Descriptive campaign name |
| channel       | ENUM          | 'Google Ads', 'Meta', 'Email', 'Influencer', 'SEO' |
| spend_amount  | DECIMAL(12,2) | USD spend |
| impressions   | INT           | Ad impressions |
| clicks        | INT           | Clicks |
| conversions   | INT           | Attributable sales conversions |
| campaign_date | DATE          | |
| region        | ENUM          | 'North', 'South', 'East', 'West', 'International' |

Pattern: Feb 2024 Meta campaign had 2.5× normal conversions (Valentine's Day campaign).

---
### Table: `inventory`  (~150 rows)
| Column               | Type          | Notes |
|---|---|---|
| id                   | INT           | Primary key |
| product_id           | INT           | FK → products.id |
| warehouse_location   | VARCHAR(100)  | 'East Warehouse', 'West Warehouse', 'Central Hub' |
| stock_quantity       | INT           | Current units on hand |
| reorder_point        | INT           | Trigger reorder when stock_quantity < reorder_point |
| last_restocked_date  | DATE          | |
| days_of_supply       | INT           | Estimated days until stockout |

---
## EXAMPLE MYSQL QUERIES:

```sql
-- Monthly revenue trend
SELECT DATE_FORMAT(sale_date, '%Y-%m') AS month, SUM(revenue) AS total_revenue
FROM sales GROUP BY month ORDER BY month;

-- Top products
SELECT p.name, p.category, SUM(s.revenue) AS total_revenue
FROM sales s JOIN products p ON s.product_id = p.id
GROUP BY p.id, p.name, p.category ORDER BY total_revenue DESC LIMIT 10;

-- Marketing ROI
SELECT channel,
       SUM(spend_amount)                                        AS total_spend,
       SUM(conversions)                                         AS total_conversions,
       ROUND(SUM(spend_amount)/NULLIF(SUM(conversions),0), 2)  AS cost_per_conversion
FROM marketing_spend GROUP BY channel;

-- Inventory alerts
SELECT p.name, i.warehouse_location, i.stock_quantity, i.reorder_point
FROM inventory i JOIN products p ON i.product_id = p.id
WHERE i.stock_quantity < i.reorder_point;
```
""".strip()
