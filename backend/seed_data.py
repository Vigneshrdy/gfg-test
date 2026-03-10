#!/usr/bin/env python3
"""
NexaMart Database Seed Script
==============================
Populates the `nexamart` MySQL database with realistic e-commerce data.

Requirements (separate from main backend):
    pip install mysql-connector-python faker passlib[bcrypt]

Usage:
    python seed_data.py

Stories baked in:
  1. Electronics Q4 spike   — Nov/Dec sales ~1.8× baseline
  2. West region H1 2024    — West gets ~35% share vs normal 22%
  3. NexaPro X1 launch      — March 2024: 5× surge, stabilises at 2.5× by June
  4. NexaBook 16 cannibalisaton — 50% sales drop after NexaPro X1 launches
  5. Valentine's campaign   — Feb 2024 Meta: 2.5× normal conversions & +80% spend
"""

import calendar
import random
import sys
from datetime import date, timedelta

import hashlib

import bcrypt
import mysql.connector
from faker import Faker

fake = Faker()
random.seed(42)
Faker.seed(42)


def hash_password(plain: str) -> str:
    """SHA256-normalize then bcrypt, matching auth.py exactly."""
    normalized = hashlib.sha256(plain.encode("utf-8")).hexdigest().encode("utf-8")
    return bcrypt.hashpw(normalized, bcrypt.gensalt()).decode("utf-8")

# ─────────────────────────────────────────────────────────────────────────────
# Database connection — edit these or pass via environment
# ─────────────────────────────────────────────────────────────────────────────
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "",
    "database": "nexamart",
    "charset": "utf8mb4",
    "autocommit": False,
}


def get_conn():
    return mysql.connector.connect(**DB_CONFIG)


# ─────────────────────────────────────────────────────────────────────────────
# Schema DDL
# ─────────────────────────────────────────────────────────────────────────────
SCHEMA_SQL = """
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS marketing_spend;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    email            VARCHAR(255) UNIQUE NOT NULL,
    full_name        VARCHAR(255) NOT NULL,
    hashed_password  VARCHAR(255) NOT NULL,
    is_active        TINYINT(1)  NOT NULL DEFAULT 1,
    role             ENUM('admin','analyst','viewer') NOT NULL DEFAULT 'analyst',
    created_at       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
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

CREATE TABLE customers (
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

CREATE TABLE sales (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    order_id       VARCHAR(50)   NOT NULL,
    product_id     INT           NOT NULL,
    customer_id    INT           NOT NULL,
    region         ENUM('North','South','East','West','International') NOT NULL,
    sale_date      DATE          NOT NULL,
    quantity       INT           NOT NULL,
    unit_price     DECIMAL(10,2) NOT NULL,
    discount_pct   DECIMAL(5,2)  NOT NULL DEFAULT 0,
    revenue        DECIMAL(12,2) NOT NULL,
    profit_margin  DECIMAL(5,2),
    INDEX idx_sale_date   (sale_date),
    INDEX idx_region      (region),
    INDEX idx_product_id  (product_id),
    INDEX idx_customer_id (customer_id),
    FOREIGN KEY (product_id)  REFERENCES products(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE marketing_spend (
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

CREATE TABLE inventory (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    product_id           INT          NOT NULL,
    warehouse_location   VARCHAR(100) NOT NULL,
    stock_quantity       INT          NOT NULL DEFAULT 0,
    reorder_point        INT          NOT NULL DEFAULT 50,
    last_restocked_date  DATE,
    days_of_supply       INT          NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
"""

# ─────────────────────────────────────────────────────────────────────────────
# Static product catalogue
# ─────────────────────────────────────────────────────────────────────────────
# (name, category, subcategory, brand, cost_price, list_price, launch_date)
PRODUCTS = [
    # ── Electronics – Smartphones ────────────────────────────────────────────
    ("NexaSmart A1 Phone",     "Electronics", "Smartphones", "Nexa",  400.00,  799.00, "2022-01-15"),
    ("NexaSmart A2 Phone",     "Electronics", "Smartphones", "Nexa",  450.00,  899.00, "2022-06-20"),
    ("NexaSmart A3 Pro",       "Electronics", "Smartphones", "Nexa",  500.00, 1099.00, "2023-09-10"),
    # ── Electronics – Laptops (NexaPro X1 is the KEY product) ───────────────
    ("NexaBook 14",            "Electronics", "Laptops",     "Nexa",  600.00, 1199.00, "2022-03-01"),
    ("NexaBook 16",            "Electronics", "Laptops",     "Nexa",  750.00, 1499.00, "2022-10-01"),
    ("NexaPro X1 Laptop",      "Electronics", "Laptops",     "Nexa",  900.00, 1999.00, "2024-03-01"),
    # ── Electronics – Tablets ────────────────────────────────────────────────
    ("NexaTab 10",             "Electronics", "Tablets",     "Nexa",  250.00,  499.00, "2022-08-15"),
    ("NexaTab 12 Pro",         "Electronics", "Tablets",     "Nexa",  350.00,  699.00, "2023-04-20"),
    # ── Electronics – Audio ──────────────────────────────────────────────────
    ("NexaBuds Pro",           "Electronics", "Headphones",  "Nexa",   80.00,  199.00, "2022-05-10"),
    ("NexaBuds Air Lite",      "Electronics", "Headphones",  "Nexa",   40.00,   99.00, "2023-02-01"),
    ("SoundMax 500 Speaker",   "Electronics", "Speakers",    "SoundMax", 120.00, 299.00, "2022-11-01"),
    ("SoundMax 700 BT",        "Electronics", "Speakers",    "SoundMax", 180.00, 449.00, "2023-07-15"),
    # ── Electronics – Other ──────────────────────────────────────────────────
    ("PixelCam A1",            "Electronics", "Cameras",     "Pixel",  400.00,  799.00, "2023-01-20"),
    ("StreamBox 4K Ultra",     "Electronics", "Streaming",   "Nexa",    50.00,  129.00, "2023-06-01"),
    ("PowerHub 100W GaN",      "Electronics", "Accessories", "Nexa",    30.00,   79.00, "2023-03-15"),
    # ── Clothing ─────────────────────────────────────────────────────────────
    ("NexaWear Classic Tee",   "Clothing", "T-Shirts",  "NexaWear",  10.00,  35.00, "2022-02-01"),
    ("NexaWear Premium Tee",   "Clothing", "T-Shirts",  "NexaWear",  15.00,  55.00, "2022-09-01"),
    ("NexaWear Slim Jeans",    "Clothing", "Jeans",     "NexaWear",  25.00,  89.00, "2022-04-15"),
    ("NexaWear Cargo Pants",   "Clothing", "Pants",     "NexaWear",  20.00,  75.00, "2023-03-01"),
    ("NexaWear Winter Jacket", "Clothing", "Jackets",   "NexaWear",  60.00, 199.00, "2022-10-15"),
    ("NexaWear Rain Shell",    "Clothing", "Jackets",   "NexaWear",  50.00, 169.00, "2023-01-10"),
    ("NexaWear Running Shoes", "Clothing", "Shoes",     "NexaWear",  45.00, 149.00, "2022-07-01"),
    ("NexaWear Casual Sneakers","Clothing","Shoes",     "NexaWear",  35.00, 119.00, "2023-05-15"),
    ("NexaWear Formal Oxford", "Clothing", "Shoes",     "NexaWear",  55.00, 189.00, "2022-11-20"),
    ("NexaWear Sports Socks",  "Clothing", "Accessories","NexaWear",  5.00,  20.00, "2022-01-20"),
    ("NexaWear Comp Tights",   "Clothing", "Sports Wear","NexaWear", 20.00,  65.00, "2023-07-01"),
    ("NexaWear Yoga Shorts",   "Clothing", "Sports Wear","NexaWear", 15.00,  49.00, "2023-04-10"),
    # ── Home Goods ───────────────────────────────────────────────────────────
    ("ProChef 10pc Cookware",  "Home Goods", "Cookware",    "ProChef",  80.00, 249.00, "2022-03-15"),
    ("ProChef Cast Iron Pan",  "Home Goods", "Cookware",    "ProChef",  40.00, 129.00, "2022-08-20"),
    ("LuxBed Bamboo Sheet Set","Home Goods", "Bedding",     "LuxBed",   30.00,  99.00, "2022-06-01"),
    ("LuxBed Memory Foam Pillow","Home Goods","Bedding",    "LuxBed",   20.00,  69.00, "2023-02-15"),
    ("LuxBed Weighted Blanket","Home Goods", "Bedding",     "LuxBed",   45.00, 149.00, "2023-09-01"),
    ("HomeOrg 5-Shelf Bookcase","Home Goods","Furniture",   "HomeOrg",  60.00, 199.00, "2022-05-10"),
    ("HomeOrg Under-Bed Storage","Home Goods","Storage",    "HomeOrg",  25.00,  79.00, "2023-01-20"),
    ("BrightHome LED Strip Kit","Home Goods","Lighting",    "BrightHome",15.00, 49.00, "2023-04-01"),
    ("BrightHome Smart Bulb 4pk","Home Goods","Lighting",   "BrightHome",20.00, 59.00, "2022-12-15"),
    ("CleanAir HEPA Filter",   "Home Goods", "Air Purifier","CleanAir", 70.00, 229.00, "2023-06-15"),
    # ── Sports ───────────────────────────────────────────────────────────────
    ("FitPeak Yoga Mat Pro",   "Sports", "Yoga",        "FitPeak",  20.00,  69.00, "2022-04-01"),
    ("FitPeak Resistance Bands","Sports","Fitness",     "FitPeak",  12.00,  39.00, "2022-09-15"),
    ("AquaFlow Water Bottle",  "Sports", "Water Bottles","AquaFlow",  8.00,  29.00, "2022-03-20"),
    ("AquaFlow Insulated Mug", "Sports", "Water Bottles","AquaFlow", 12.00,  39.00, "2023-01-15"),
    ("FitPeak Smart Scale",    "Sports", "Fitness",     "FitPeak",  25.00,  79.00, "2023-03-10"),
    ("FitPeak Pull-up Bar",    "Sports", "Fitness",     "FitPeak",  30.00,  89.00, "2022-11-05"),
    ("TrailRush Hiking Poles", "Sports", "Outdoor",     "TrailRush",35.00, 119.00, "2023-05-20"),
    ("TrailRush Camping Hammock","Sports","Outdoor",    "TrailRush",25.00,  79.00, "2023-07-10"),
    # ── Beauty ───────────────────────────────────────────────────────────────
    ("GlowUp Daily Moisturizer","Beauty","Skincare",    "GlowUp",   12.00,  45.00, "2022-06-15"),
    ("GlowUp Vitamin C Serum", "Beauty", "Skincare",    "GlowUp",   15.00,  59.00, "2022-12-01"),
    ("GlowUp Retinol Night Cream","Beauty","Skincare",  "GlowUp",   18.00,  69.00, "2023-08-20"),
    ("GlowUp SPF 50 Sunscreen","Beauty", "Skincare",    "GlowUp",   10.00,  39.00, "2023-04-15"),
    ("GlowUp Eye Renewal Serum","Beauty","Skincare",    "GlowUp",   20.00,  79.00, "2024-01-10"),
]

# ─────────────────────────────────────────────────────────────────────────────
# Seeding functions
# ─────────────────────────────────────────────────────────────────────────────
def create_schema(conn):
    cursor = conn.cursor()
    for stmt in SCHEMA_SQL.strip().split(";"):
        stmt = stmt.strip()
        if stmt:
            cursor.execute(stmt)
    conn.commit()
    cursor.close()
    print("✓ Schema created")


def seed_users(conn):
    users = [
        ("admin@nexamart.com",    "Admin User",      "Admin1234!",   "admin"),
        ("analyst@nexamart.com",  "Jane Analyst",    "Analyst123!",  "analyst"),
        ("demo@nexamart.com",     "Demo Viewer",     "Demo1234!",    "viewer"),
        ("test1@nexamart.com",    "Test User One",   "Test1234!",    "analyst"),
        ("test2@nexamart.com",    "Test User Two",   "Test5678!",    "analyst"),
        ("admin2@nexamart.com",   "Admin User Two",  "Admin5678!",   "admin"),
        ("admin3@nexamart.com",   "Admin User Three","Admin9012!",   "admin"),
    ]
    cursor = conn.cursor()
    for email, name, pwd, role in users:
        hashed = hash_password(pwd)
        cursor.execute(
            "INSERT INTO users (email, full_name, hashed_password, role) VALUES (%s,%s,%s,%s)",
            (email, name, hashed, role),
        )
    conn.commit()
    cursor.close()
    print(f"✓ Seeded {len(users)} users")


def seed_products(conn):
    cursor = conn.cursor()
    cursor.executemany(
        "INSERT INTO products (name,category,subcategory,brand,cost_price,list_price,launch_date) "
        "VALUES (%s,%s,%s,%s,%s,%s,%s)",
        PRODUCTS,
    )
    conn.commit()
    cursor.close()
    print(f"✓ Seeded {len(PRODUCTS)} products")


def seed_customers(conn, n=500):
    segments = ["Consumer", "Consumer", "Consumer", "SMB", "SMB", "Enterprise"]
    channels = ["Organic", "Organic", "Paid", "Paid", "Referral", "Social"]
    us_states = [
        "CA", "TX", "NY", "FL", "WA", "IL", "PA", "OH", "GA", "NC",
        "MI", "NJ", "VA", "AZ", "MA", "CO", "TN", "IN", "MO", "MD",
    ]

    rows = []
    seen_emails = set()
    while len(rows) < n:
        name = fake.name()
        email = fake.unique.email()
        if email in seen_emails:
            continue
        seen_emails.add(email)

        segment = random.choice(segments)
        channel = random.choice(channels)
        state = random.choice(us_states)
        city = fake.city()
        churn = round(random.uniform(0.05, 0.95), 2)
        ltv_base = {"Enterprise": 8000, "SMB": 2000, "Consumer": 400}[segment]
        ltv = round(ltv_base * random.uniform(0.3, 3.0), 2)
        first_purchase = fake.date_between(start_date=date(2023, 1, 1), end_date=date(2025, 6, 30))
        rows.append((name, email, segment, channel, city, state, "USA", ltv, first_purchase, churn))

    cursor = conn.cursor()
    cursor.executemany(
        "INSERT INTO customers "
        "(full_name,email,segment,acquisition_channel,city,state,country,lifetime_value,first_purchase_date,churn_risk_score) "
        "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
        rows,
    )
    conn.commit()
    cursor.close()
    print(f"✓ Seeded {len(rows)} customers")


def seed_sales(conn):
    cursor = conn.cursor()

    # Fetch product & customer ids
    cursor.execute("SELECT id, name, category, subcategory, cost_price, list_price, launch_date FROM products")
    products = cursor.fetchall()  # tuples
    prod_map = {p[0]: p for p in products}  # id → row

    cursor.execute("SELECT id FROM customers")
    customer_ids = [r[0] for r in cursor.fetchall()]

    # Identify special product ids
    nexapro_id = next(p[0] for p in products if p[1] == "NexaPro X1 Laptop")
    nexabook16_id = next(p[0] for p in products if p[1] == "NexaBook 16")

    # Category pools
    elec_ids     = [p[0] for p in products if p[2] == "Electronics"]
    clothing_ids = [p[0] for p in products if p[2] == "Clothing"]
    home_ids     = [p[0] for p in products if p[2] == "Home Goods"]
    sports_ids   = [p[0] for p in products if p[2] == "Sports"]
    beauty_ids   = [p[0] for p in products if p[2] == "Beauty"]

    def choose_region(year, month):
        if year == 2024 and 1 <= month <= 6:
            # Story 2: West dominates H1 2024
            return random.choices(
                ["North", "South", "East", "West", "International"],
                weights=[15, 15, 15, 40, 15],
            )[0]
        return random.choices(
            ["North", "South", "East", "West", "International"],
            weights=[22, 22, 22, 22, 12],
        )[0]

    def choose_product(year, month, cat_name):
        """Return a product id from the given category, applying story multipliers."""
        if cat_name == "Electronics":
            # Filter to launched products
            launched = [pid for pid in elec_ids
                        if prod_map[pid][6].strftime("%Y-%m-%d") <= f"{year:04d}-{month:02d}-01"]
            if not launched:
                return random.choice(elec_ids)
            weights = []
            for pid in launched:
                w = 1.0
                if pid == nexapro_id:
                    if year == 2024 and month in (3, 4, 5):
                        w = 5.0
                    elif (year == 2024 and month >= 6) or year == 2025:
                        w = 2.5
                elif pid == nexabook16_id:
                    if (year == 2024 and month >= 3) or year == 2025:
                        w = 0.5
                weights.append(w)
            return random.choices(launched, weights=weights)[0]
        mapping = {
            "Clothing":   clothing_ids,
            "Home Goods": home_ids,
            "Sports":     sports_ids,
            "Beauty":     beauty_ids,
        }
        pool = mapping.get(cat_name, elec_ids)
        launched = [pid for pid in pool
                    if prod_map[pid][6].strftime("%Y-%m-%d") <= f"{year:04d}-{month:02d}-01"]
        return random.choice(launched if launched else pool)

    all_sales = []
    order_num = 100000

    for year in range(2023, 2026):
        max_month = 6 if year == 2025 else 12
        for month in range(1, max_month + 1):
            # Base sales per month
            base = random.randint(160, 200)

            # Story 1: Q4 Electronics spike
            if month in (11, 12):
                base = int(base * 1.8)
            elif month in (1, 2):
                base = int(base * 0.85)  # post-holiday dip

            # Year-over-year growth
            if year == 2024:
                base = int(base * 1.15)
            elif year == 2025:
                base = int(base * 1.25)

            # Category distribution weights
            cat_weights = [35, 25, 20, 12, 8]  # Elec, Cloth, Home, Sports, Beauty
            # Q4: Electronics even heavier
            if month in (11, 12):
                cat_weights = [55, 20, 15, 7, 3]

            for _ in range(base):
                cat = random.choices(
                    ["Electronics", "Clothing", "Home Goods", "Sports", "Beauty"],
                    weights=cat_weights,
                )[0]
                pid = choose_product(year, month, cat)
                p = prod_map[pid]
                cid = random.choice(customer_ids)
                region = choose_region(year, month)

                max_day = calendar.monthrange(year, month)[1]
                day = random.randint(1, max_day)
                sale_date = date(year, month, day)

                qty = random.randint(1, 2) if cat == "Electronics" else random.randint(1, 4)

                # Discount logic
                disc_choices = [0, 0, 0, 5, 10, 15, 20, 25]
                disc_weights = [40, 15, 15, 10, 8,  6, 4,  2]
                discount_pct = random.choices(disc_choices, weights=disc_weights)[0]
                # Q4 Black-Friday-style discounts
                if month == 11 and random.random() < 0.25:
                    discount_pct = max(discount_pct, 20)

                unit_price = float(p[5])  # list_price
                cost_price = float(p[4])
                revenue = round(qty * unit_price * (1 - discount_pct / 100), 2)
                profit_margin = round((unit_price - cost_price) / unit_price * 100, 2)

                order_num += 1
                order_id = f"ORD-{order_num}-{year}"

                all_sales.append((
                    order_id, pid, cid, region,
                    sale_date.isoformat(),
                    qty, unit_price, discount_pct, revenue, profit_margin,
                ))

    # Batch insert
    insert_sql = (
        "INSERT INTO sales "
        "(order_id,product_id,customer_id,region,sale_date,quantity,unit_price,"
        "discount_pct,revenue,profit_margin) "
        "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
    )
    batch = 500
    for i in range(0, len(all_sales), batch):
        cursor.executemany(insert_sql, all_sales[i: i + batch])
        conn.commit()

    cursor.close()
    print(f"✓ Seeded {len(all_sales)} sales records")


def seed_marketing(conn):
    cursor = conn.cursor()

    channels = ["Google Ads", "Meta", "Email", "Influencer", "SEO"]
    base_spend = {
        "Google Ads": 8000,
        "Meta":       6000,
        "Email":      1500,
        "Influencer": 5000,
        "SEO":        2000,
    }
    regions = ["North", "South", "East", "West", "International"]
    records = []

    for year in range(2023, 2026):
        max_month = 6 if year == 2025 else 12
        for month in range(1, max_month + 1):
            is_valentine = (year == 2024 and month == 2)
            is_q4 = month in (11, 12)

            for channel in channels:
                for run in range(2):  # 2 campaign entries per channel per month
                    spend = base_spend[channel] * random.uniform(0.8, 1.3)

                    if is_valentine and channel == "Meta":
                        spend *= 1.8  # Valentine's budget surge
                    if is_q4:
                        spend *= 1.4  # Q4 ad push

                    impressions = int(spend * random.uniform(60, 140))
                    ctr = random.uniform(0.01, 0.05)
                    clicks = int(impressions * ctr)

                    conv_rate = random.uniform(0.02, 0.06)
                    if is_valentine:
                        if channel == "Meta":
                            conv_rate *= 2.5  # Story 4: doubled conversions
                        elif channel == "Google Ads":
                            conv_rate *= 1.4
                    conversions = int(clicks * conv_rate)

                    max_day = calendar.monthrange(year, month)[1]
                    day = random.randint(1, max_day)
                    campaign_date = date(year, month, day).isoformat()
                    region = random.choice(regions)

                    # Build a readable campaign name
                    quarter = (month - 1) // 3 + 1
                    tag = fake.word().capitalize()
                    campaign_name = f"{channel.replace(' ', '_')}_{year}_Q{quarter}_{tag}"
                    if is_valentine and channel == "Meta":
                        campaign_name = f"Meta_Valentine2024_{tag}"

                    records.append((
                        campaign_name, channel,
                        round(spend, 2), impressions, clicks, conversions,
                        campaign_date, region,
                    ))

    insert_sql = (
        "INSERT INTO marketing_spend "
        "(campaign_name,channel,spend_amount,impressions,clicks,conversions,campaign_date,region) "
        "VALUES (%s,%s,%s,%s,%s,%s,%s,%s)"
    )
    cursor.executemany(insert_sql, records)
    conn.commit()
    cursor.close()
    print(f"✓ Seeded {len(records)} marketing_spend records")


def seed_inventory(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT id, category FROM products")
    products = cursor.fetchall()

    warehouses = ["East Warehouse", "West Warehouse", "Central Hub"]
    records = []

    for pid, category in products:
        for wh in warehouses:
            # Electronics have lower stock (higher value, smaller batches)
            if category == "Electronics":
                stock = random.randint(20, 150)
                reorder = random.randint(30, 60)
            else:
                stock = random.randint(50, 400)
                reorder = random.randint(50, 120)

            # ~20% chance item is below reorder point (creates interesting alerts)
            if random.random() < 0.20:
                stock = random.randint(0, reorder - 1)

            days_supply = random.randint(5, 90) if stock > 0 else 0
            last_restock = fake.date_between(
                start_date=date(2025, 1, 1),
                end_date=date(2025, 6, 30),
            ).isoformat()
            records.append((pid, wh, stock, reorder, last_restock, days_supply))

    cursor.executemany(
        "INSERT INTO inventory "
        "(product_id,warehouse_location,stock_quantity,reorder_point,last_restocked_date,days_of_supply) "
        "VALUES (%s,%s,%s,%s,%s,%s)",
        records,
    )
    conn.commit()
    cursor.close()
    print(f"✓ Seeded {len(records)} inventory records")


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────
def main():
    print("Connecting to MySQL …")
    try:
        conn = get_conn()
    except mysql.connector.Error as exc:
        print(f"✗ Could not connect to MySQL: {exc}")
        print(
            "\nMake sure MySQL is running and the database 'nexamart' exists:\n"
            "  CREATE DATABASE nexamart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n"
        )
        sys.exit(1)

    print("Creating schema …")
    create_schema(conn)

    print("Seeding data …")
    seed_users(conn)
    seed_products(conn)
    seed_customers(conn, n=500)
    seed_sales(conn)
    seed_marketing(conn)
    seed_inventory(conn)

    conn.close()
    print("\n✅  NexaMart database seeded successfully!")
    print(
        "\nDefault login credentials:\n"
        "  admin@nexamart.com   / Admin1234!\n"
        "  analyst@nexamart.com / Analyst123!\n"
        "  demo@nexamart.com    / Demo1234!\n"
    )


if __name__ == "__main__":
    main()
