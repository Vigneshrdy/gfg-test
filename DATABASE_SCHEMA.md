# NexaMart — Database Schema Reference

> **Engine:** MySQL 8.0  
> **Database:** `nexamart`  
> **Company:** NexaMart — mid-sized e-commerce selling Electronics, Clothing, Home Goods, Sports, and Beauty products  
> **Data range:** January 2023 – June 2025  

---

## Entity Relationship Overview

```
products ──┐
           ├──< sales >── customers
inventory ─┘

marketing_spend (standalone campaign tracking)
users (auth, separate from customers)
```

---

## Table: `products`

Stores the full product catalogue. 50 active products across 5 categories.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `INT AUTO_INCREMENT` | NO | — | Primary key |
| `name` | `VARCHAR(255)` | NO | — | Full product name (e.g., `NexaPro X1 Laptop`) |
| `category` | `ENUM` | NO | — | `Electronics`, `Clothing`, `Home Goods`, `Sports`, `Beauty` |
| `subcategory` | `VARCHAR(100)` | YES | NULL | Finer classification (e.g., `Laptops`, `Smartphones`, `Yoga`) |
| `brand` | `VARCHAR(100)` | YES | NULL | Brand name (e.g., `Nexa`, `GlowUp`, `FitPeak`) |
| `cost_price` | `DECIMAL(10,2)` | YES | NULL | Wholesale/manufacturing cost to NexaMart |
| `list_price` | `DECIMAL(10,2)` | YES | NULL | Retail selling price |
| `launch_date` | `DATE` | YES | NULL | Date product first became available for sale |
| `is_active` | `TINYINT(1)` | NO | `1` | `1` = active, `0` = discontinued |

### Notable Products
| Product Name | Category | Subcategory | List Price | Launch Date | Notes |
|---|---|---|---|---|---|
| NexaPro X1 Laptop | Electronics | Laptops | $1,999 | 2024-03-01 | Key product: disrupts Laptop category on launch |
| NexaBook 16 | Electronics | Laptops | $1,499 | 2022-10-01 | Sees 30% sales drop after NexaPro X1 launch |
| NexaSmart A3 Pro | Electronics | Smartphones | $1,099 | 2023-09-10 | Top-selling phone |

### Sample Brands
- **Nexa** — House brand (phones, laptops, tablets, accessories)
- **GlowUp** — Beauty/skincare
- **FitPeak** — Sports & fitness
- **NexaWear** — Clothing
- **ProChef** — Cookware
- **LuxBed** — Bedroom / home textiles
- **AquaFlow** — Water bottles
- **TrailRush** — Outdoor / camping
- **BrightHome** — Smart lighting

---

## Table: `customers`

500 customer records across segments and acquisition channels.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `INT AUTO_INCREMENT` | NO | — | Primary key |
| `full_name` | `VARCHAR(255)` | YES | NULL | Customer full name |
| `email` | `VARCHAR(255)` | NO | — | Unique email address |
| `segment` | `ENUM` | NO | — | `Enterprise`, `SMB`, `Consumer` |
| `acquisition_channel` | `ENUM` | NO | — | `Organic`, `Paid`, `Referral`, `Social` |
| `city` | `VARCHAR(100)` | YES | NULL | Customer city |
| `state` | `VARCHAR(100)` | YES | NULL | US state abbreviation |
| `country` | `VARCHAR(100)` | NO | `USA` | Country of residence |
| `lifetime_value` | `DECIMAL(12,2)` | NO | `0` | Total historical revenue from this customer |
| `first_purchase_date` | `DATE` | YES | NULL | Date of first transaction |
| `churn_risk_score` | `DECIMAL(3,2)` | NO | `0.50` | ML-derived score: `0.00` (loyal) to `1.00` (about to churn) |

### Segment Distribution (approximate)
| Segment | % | Typical LTV |
|---|---|---|
| Consumer | 60% | $150 – $800 |
| SMB | 30% | $500 – $5,000 |
| Enterprise | 10% | $2,000 – $50,000 |

### Acquisition Channel Distribution (approximate)
| Channel | % |
|---|---|
| Organic | 35% |
| Paid | 30% |
| Referral | 20% |
| Social | 15% |

---

## Table: `sales`

~5,000 transaction records from January 2023 to June 2025.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `INT AUTO_INCREMENT` | NO | — | Primary key |
| `order_id` | `VARCHAR(50)` | NO | — | Order reference (e.g., `ORD-12345-2024`) |
| `product_id` | `INT` | NO | — | FK → `products.id` |
| `customer_id` | `INT` | NO | — | FK → `customers.id` |
| `region` | `ENUM` | NO | — | `North`, `South`, `East`, `West`, `International` |
| `sale_date` | `DATE` | NO | — | Date of transaction |
| `quantity` | `INT` | NO | — | Units sold in this order line |
| `unit_price` | `DECIMAL(10,2)` | NO | — | Actual price charged per unit at time of sale |
| `discount_pct` | `DECIMAL(5,2)` | NO | `0` | Discount applied (0–30%) |
| `revenue` | `DECIMAL(12,2)` | NO | — | `quantity × unit_price × (1 − discount_pct/100)` |
| `profit_margin` | `DECIMAL(5,2)` | YES | NULL | `(list_price − cost_price) / list_price × 100` |

### Indexes
```sql
INDEX idx_sale_date (sale_date)
INDEX idx_region    (region)
INDEX idx_product   (product_id)
INDEX idx_customer  (customer_id)
```

### Embedded Business Stories
| Story | What to Look For |
|---|---|
| **Q4 Electronics Spike** | `category = 'Electronics'` AND `MONTH(sale_date) IN (11, 12)` — ~1.8× normal volume |
| **West Region H1 2024** | `region = 'West'` AND `sale_date BETWEEN '2024-01-01' AND '2024-06-30'` — ~35% share vs normal 22% |
| **NexaPro X1 Launch** | `product_id = (SELECT id FROM products WHERE name = 'NexaPro X1 Laptop')` — Mar–May 2024: 5× launch surge |
| **NexaBook 16 Cannibalization** | NexaBook 16 sales drop ~50% post March 2024 |
| **Post-Holiday Jan Dip** | January shows ~15% below average across all categories |

---

## Table: `marketing_spend`

~300 campaign records covering all channels, Jan 2023 – Jun 2025.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `INT AUTO_INCREMENT` | NO | — | Primary key |
| `campaign_name` | `VARCHAR(255)` | NO | — | Descriptive name (e.g., `Meta_2024_Q1_Campaign_spring`) |
| `channel` | `ENUM` | NO | — | `Google Ads`, `Meta`, `Email`, `Influencer`, `SEO` |
| `spend_amount` | `DECIMAL(12,2)` | NO | — | Total spend in USD for this record |
| `impressions` | `INT` | NO | `0` | Ad impressions delivered |
| `clicks` | `INT` | NO | `0` | Clicks received |
| `conversions` | `INT` | NO | `0` | Sales conversions attributed to campaign |
| `campaign_date` | `DATE` | NO | — | Date of this campaign entry |
| `region` | `ENUM` | YES | NULL | Region targeted |

### Channel Baseline Spend / Month
| Channel | Monthly Budget (approx.) |
|---|---|
| Google Ads | $14,000 – $18,000 |
| Meta | $10,000 – $14,000 |
| Email | $2,500 – $4,000 |
| Influencer | $8,000 – $12,000 |
| SEO | $3,000 – $5,000 |

### Embedded Story: Valentine's Day Campaign (Feb 2024)
- `channel = 'Meta'` AND `YEAR(campaign_date) = 2024` AND `MONTH(campaign_date) = 2`
- Spend: +80% above Meta baseline
- Conversions: **2.5× the monthly average** — the campaign of record

### ROI Derived Metrics
```sql
-- Cost per conversion
spend_amount / NULLIF(conversions, 0) AS cost_per_conversion

-- Click-through rate
clicks / NULLIF(impressions, 0) AS ctr

-- Conversion rate
conversions / NULLIF(clicks, 0) AS conversion_rate
```

---

## Table: `inventory`

~150 records: 50 products × 3 warehouse locations.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `INT AUTO_INCREMENT` | NO | — | Primary key |
| `product_id` | `INT` | NO | — | FK → `products.id` |
| `warehouse_location` | `VARCHAR(100)` | NO | — | `East Warehouse`, `West Warehouse`, `Central Hub` |
| `stock_quantity` | `INT` | NO | `0` | Current units in stock |
| `reorder_point` | `INT` | NO | `50` | Minimum stock level before reorder is triggered |
| `last_restocked_date` | `DATE` | YES | NULL | Date of most recent stock replenishment |
| `days_of_supply` | `INT` | NO | `0` | Estimated days until stockout (based on avg daily sales) |

### Warehouse Locations
| Location | Primary Region Served |
|---|---|
| East Warehouse | North + East regions |
| West Warehouse | West + International |
| Central Hub | South + overflow |

---

## Table: `users`

Authentication users (BI system access only — **not** customer records).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `INT AUTO_INCREMENT` | NO | — | Primary key |
| `email` | `VARCHAR(255)` | NO | — | Unique login email |
| `full_name` | `VARCHAR(255)` | NO | — | Display name |
| `hashed_password` | `VARCHAR(255)` | NO | — | bcrypt hash |
| `is_active` | `TINYINT(1)` | NO | `1` | `1` = active, `0` = suspended |
| `role` | `ENUM` | NO | `analyst` | `admin`, `analyst`, `viewer` |
| `created_at` | `DATETIME` | NO | `CURRENT_TIMESTAMP` | Account creation timestamp |

### Default Seeded Users
| Email | Password | Role |
|---|---|---|
| `admin@nexamart.com` | `Admin1234!` | admin |
| `analyst@nexamart.com` | `Analyst123!` | analyst |
| `demo@nexamart.com` | `Demo1234!` | viewer |

---

## Full CREATE TABLE Statements

```sql
-- ────────────────────────────────────────────
-- Run in order (FK dependencies)
-- ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    email            VARCHAR(255) UNIQUE NOT NULL,
    full_name        VARCHAR(255) NOT NULL,
    hashed_password  VARCHAR(255) NOT NULL,
    is_active        TINYINT(1)  NOT NULL DEFAULT 1,
    role             ENUM('admin','analyst','viewer') NOT NULL DEFAULT 'analyst',
    created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    category     ENUM('Electronics','Clothing','Home Goods','Sports','Beauty') NOT NULL,
    subcategory  VARCHAR(100),
    brand        VARCHAR(100),
    cost_price   DECIMAL(10,2),
    list_price   DECIMAL(10,2),
    launch_date  DATE,
    is_active    TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS customers (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    full_name           VARCHAR(255),
    email               VARCHAR(255) UNIQUE NOT NULL,
    segment             ENUM('Enterprise','SMB','Consumer') NOT NULL,
    acquisition_channel ENUM('Organic','Paid','Referral','Social') NOT NULL,
    city                VARCHAR(100),
    state               VARCHAR(100),
    country             VARCHAR(100) NOT NULL DEFAULT 'USA',
    lifetime_value      DECIMAL(12,2) NOT NULL DEFAULT 0,
    first_purchase_date DATE,
    churn_risk_score    DECIMAL(3,2) NOT NULL DEFAULT 0.50
);

CREATE TABLE IF NOT EXISTS sales (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    order_id       VARCHAR(50)  NOT NULL,
    product_id     INT          NOT NULL,
    customer_id    INT          NOT NULL,
    region         ENUM('North','South','East','West','International') NOT NULL,
    sale_date      DATE         NOT NULL,
    quantity       INT          NOT NULL,
    unit_price     DECIMAL(10,2) NOT NULL,
    discount_pct   DECIMAL(5,2)  NOT NULL DEFAULT 0,
    revenue        DECIMAL(12,2) NOT NULL,
    profit_margin  DECIMAL(5,2),
    INDEX idx_sale_date  (sale_date),
    INDEX idx_region     (region),
    INDEX idx_product_id (product_id),
    INDEX idx_customer_id(customer_id),
    FOREIGN KEY (product_id)  REFERENCES products(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS marketing_spend (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    campaign_name  VARCHAR(255) NOT NULL,
    channel        ENUM('Google Ads','Meta','Email','Influencer','SEO') NOT NULL,
    spend_amount   DECIMAL(12,2) NOT NULL,
    impressions    INT          NOT NULL DEFAULT 0,
    clicks         INT          NOT NULL DEFAULT 0,
    conversions    INT          NOT NULL DEFAULT 0,
    campaign_date  DATE         NOT NULL,
    region         ENUM('North','South','East','West','International'),
    INDEX idx_campaign_date (campaign_date),
    INDEX idx_channel       (channel)
);

CREATE TABLE IF NOT EXISTS inventory (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    product_id           INT          NOT NULL,
    warehouse_location   VARCHAR(100) NOT NULL,
    stock_quantity       INT          NOT NULL DEFAULT 0,
    reorder_point        INT          NOT NULL DEFAULT 50,
    last_restocked_date  DATE,
    days_of_supply       INT          NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## Commonly Useful Query Patterns (MySQL Syntax)

```sql
-- 1. Monthly revenue trend
SELECT DATE_FORMAT(sale_date, '%Y-%m') AS month,
       SUM(revenue)                    AS total_revenue,
       COUNT(DISTINCT order_id)        AS orders
FROM sales
GROUP BY month
ORDER BY month;

-- 2. Revenue by region, year over year
SELECT region,
       YEAR(sale_date)    AS year,
       SUM(revenue)       AS total_revenue
FROM sales
GROUP BY region, year
ORDER BY year, total_revenue DESC;

-- 3. Top 10 products by revenue
SELECT p.name          AS product_name,
       p.category,
       SUM(s.revenue)  AS total_revenue,
       SUM(s.quantity) AS units_sold
FROM sales s
JOIN products p ON s.product_id = p.id
GROUP BY p.id, p.name, p.category
ORDER BY total_revenue DESC
LIMIT 10;

-- 4. Marketing ROI by channel
SELECT channel,
       SUM(spend_amount)                                     AS total_spend,
       SUM(conversions)                                      AS total_conversions,
       ROUND(SUM(spend_amount) / NULLIF(SUM(conversions),0), 2) AS cost_per_conversion,
       ROUND(SUM(clicks) / NULLIF(SUM(impressions),0) * 100, 2) AS ctr_pct
FROM marketing_spend
GROUP BY channel
ORDER BY total_spend DESC;

-- 5. Category breakdown (pie chart ready)
SELECT p.category,
       SUM(s.revenue)                               AS total_revenue,
       ROUND(SUM(s.revenue) /
         (SELECT SUM(revenue) FROM sales) * 100, 1) AS revenue_share_pct
FROM sales s
JOIN products p ON s.product_id = p.id
GROUP BY p.category
ORDER BY total_revenue DESC;

-- 6. Inventory below reorder point (urgent items)
SELECT p.name              AS product_name,
       p.category,
       i.warehouse_location,
       i.stock_quantity,
       i.reorder_point,
       i.days_of_supply
FROM inventory i
JOIN products p ON i.product_id = p.id
WHERE i.stock_quantity < i.reorder_point
ORDER BY i.days_of_supply ASC;

-- 7. Customer segment revenue analysis
SELECT c.segment,
       c.acquisition_channel,
       COUNT(DISTINCT c.id)  AS customer_count,
       SUM(s.revenue)        AS total_revenue,
       AVG(c.churn_risk_score) AS avg_churn_risk
FROM customers c
JOIN sales s ON s.customer_id = c.id
GROUP BY c.segment, c.acquisition_channel
ORDER BY total_revenue DESC;

-- 8. NexaPro X1 post-launch impact
SELECT DATE_FORMAT(s.sale_date, '%Y-%m') AS month,
       p.name                             AS product,
       SUM(s.quantity)                   AS units_sold,
       SUM(s.revenue)                    AS revenue
FROM sales s
JOIN products p ON s.product_id = p.id
WHERE p.subcategory = 'Laptops'
  AND s.sale_date >= '2024-01-01'
GROUP BY month, p.id, p.name
ORDER BY month, revenue DESC;

-- 9. Q4 Electronics spike
SELECT YEAR(sale_date)  AS year,
       MONTH(sale_date) AS month,
       SUM(revenue)     AS electronics_revenue
FROM sales s
JOIN products p ON s.product_id = p.id
WHERE p.category = 'Electronics'
GROUP BY year, month
ORDER BY year, month;

-- 10. West region H1 2024 analysis
SELECT region,
       SUM(revenue)              AS revenue,
       COUNT(DISTINCT order_id)  AS orders,
       ROUND(AVG(discount_pct),1) AS avg_discount
FROM sales
WHERE sale_date BETWEEN '2024-01-01' AND '2024-06-30'
GROUP BY region
ORDER BY revenue DESC;
```

---

## Data Freshness

| Table | Row Count (seeded) | Date Range |
|---|---|---|
| `products` | 50 | — (static catalogue) |
| `customers` | 500 | first_purchase: Jan 2023 – Jun 2025 |
| `sales` | ~5,500 | Jan 2023 – Jun 2025 |
| `marketing_spend` | ~300 | Jan 2023 – Jun 2025 |
| `inventory` | ~150 | Snapshot as of seed date |
| `users` | 3 | — (system accounts) |
