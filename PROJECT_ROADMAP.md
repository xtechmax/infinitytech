# 🚀 Infinity Tech — Project Architecture & Scalability Roadmap
**Brand Name:** Infinity Tech  
**Owner & Founder:** Sania Khatun  
**Repository:** `xtechmax2024-byte/infinitytech`  
**Database:** Supabase (`https://cudlrjwbuwgfrspkaapm.supabase.co`)

---

## 🏛️ System Design & Directory Blueprint

To keep the application highly organized, scalable, and easy to maintain as it grows with multiple products, checkout flows, and an admin management suite, we follow this structured architecture:

```
infinitytech/
├── index.html                   # Main Agency / Showcase Landing Page
├── style.css                    # Unified Apple-style Design Tokens & Shared CSS
├── app.js                       # Global scripts & shared logic
│
├── products/                    # 📦 Dedicated Product Pages
│   ├── brand-strategy.html      # Individual product/service presentation
│   ├── web-development.html
│   ├── seo-growth.html
│   └── social-marketing.html
│
├── checkout/                    # 💳 Payment & Checkout Pages
│   ├── index.html               # Payment gateway & order summary interface
│   ├── success.html             # Order confirmation & receipt
│   └── checkout.js              # Payment processing & Supabase order logging
│
├── admin/                       # 🛡️ Admin Management Panel
│   ├── index.html               # Admin Dashboard (Protected Route)
│   ├── login.html               # Supabase Auth Login
│   ├── orders.html              # Customer Orders & Payment Status
│   ├── inquiries.html           # Quote / Consultation Form Submissions
│   ├── products-manage.html     # Add / Edit / Remove Products & Pricing
│   └── admin.js                 # Admin Auth & Database Query Logic
│
├── assets/                      # Static resources (logos, product visuals, icons)
└── docs/                        # Specifications and DB schemas
```

---

## 🔒 Security & Backend Guidelines (Supabase)
1. **Public Tables:** `quote_requests`, `products` (Read-only for public).
2. **Protected Tables (Admin only):** `orders`, `transactions`, `customer_profiles`, `admin_settings`.
3. **RLS (Row Level Security):** All sensitive operations strictly guarded via Supabase Auth policies.

---

## 🎨 Apple-Style UI Principles to Maintain
- **Minimalist luxury:** High contrast, subtle glassmorphism (`backdrop-filter: blur(20px)`), generous whitespace.
- **Micro-interactions:** Smooth scroll reveals, responsive hover states, clean card lifts.
- **Consistent branding:** `∞ Infinity Tech` mark, SF Pro / Inter typography, and clear ownership attribution to **Sania Khatun**.

### Vastu Product Integration
- **Route:** `/vastu` -> `vastu/index.html`
- **Product:** The Complete 4-in-1 Vastu Shastra Mastery System
- **Books Included:**
  1. `Practical Vastu Shastra Guide`
  2. `Simple Vastu Remedies`
  3. `50 Quick Vastu Tips`
  4. `The 30-Day Vastu Transformation Workbook`
- **Pricing:** Digital @ ₹390 | Hard Copy Collector's Set @ ₹1,990
- **Contact:** 8282910470 | support.infinitytech@gmail.com
- **Owner:** Sania Khatun
