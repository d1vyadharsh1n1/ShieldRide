# InSURE
# ShieldRide

### Real-Time Income Stabilization Engine for Instant Delivery Gig Workers

---

## Overview

ShieldRide is a **parametric, AI-driven income protection system** designed specifically for **10-minute grocery delivery gig workers** (e.g., Zepto, Blinkit, Instamart).

Unlike traditional insurance, which relies on manual claims and verification, ShieldRide uses **real-time data signals** (weather, demand, platform stability) to **automatically detect income disruption and trigger payouts or interventions**.

The system not only compensates losses but also **predicts risk, guides worker decisions, and stabilizes earnings proactively**.

---

## Problem Statement

Gig workers in instant delivery platforms face:

* Highly **volatile income**
* No protection against:

  * sudden demand drops
  * platform outages
  * extreme weather
* No visibility into:

  * where demand exists
  * when earnings will drop

Traditional insurance models are too slow, manual, and not suited for **real-time gig economies**.

---

## Solution

ShieldRide introduces a **parametric income protection model**:

* Uses **external and platform data** to detect disruption events
* Automatically triggers **instant payouts**
* Provides **predictive movement insights**
* Ensures a **minimum income floor**
* Adapts to worker behavior and risk exposure

---

## Core Features

### 1. Income Floor Guarantee

Ensures workers do not fall below a minimum earning threshold.

```
Income Floor = ₹120/hour  
Actual Earnings = ₹70/hour  
Payout = ₹50
```

---

### 2. Income Stability Score (ISS)

A dynamic score that represents worker reliability and risk.

**Components:**

* delivery consistency
* activity levels
* zone behavior
* exposure to risk

**Use Cases:**

* premium pricing
* reward eligibility
* risk profiling

---

### 3. Predictive Move-to-Earn Insights

Recommends optimal zones based on:

* demand trends
* environmental risk
* store availability

Example:

> “High risk of demand drop in Zone A. Move to Zone B (+35% demand, low risk).”

---

### 4. Dark Store Dependency Risk (SDR)

Measures reliance on specific dark stores.

```
SDR = Orders from top stores / Total orders
```

If key stores go offline → automatic compensation triggered.

---

### 5. Fatigue-Aware Risk Adjustment

Accounts for worker fatigue:

* active hours
* continuous working streak
* break patterns

System adapts:

* triggers earlier payouts
* reduces risk burden

---

### 6. Smart Auto-Pause Protection

Detects low-demand + high-risk conditions.

Suggests:

> “Go offline — partial compensation will be provided.”

---

### 7. Cluster-Based Fairness Model

Workers are grouped based on:

* vehicle type (cycle vs bike)
* work style (part-time/full-time)
* zone density

Ensures:

* fair premium pricing
* equitable payouts

---

### 8. Streak Protection Bonus

Rewards consistent workers:

* higher income floor
* lower premiums
* priority payouts

---

### 9. Income Smoothing Wallet

Balances earnings across time:

* stores surplus earnings
* compensates during low-income periods

---

### 10. Zone Saturation Control

Prevents overcrowding from recommendations.

```
ZSI = Active Riders / Expected Demand
```

Limits movement suggestions when zones are saturated.

---

## System Architecture

### Step 1: Data Collection Layer

Sources:

* Weather API (OpenWeather)
* Traffic API (Google Maps)
* Platform Data (orders, uptime, store status)

---

### Step 2: Risk Feature Engineering

Derived indices:

* **Demand Index (DI)**
* **Platform Stability Index (PSI)**
* **Store Availability Index**
* **Environmental Risk Index (ERI)**

---

### Step 3: Risk Index Engine

```
DRI = w1(DVI) + w2(1 - PSI) + w3(ERI)
```

Outputs a unified disruption risk score.

---

### Step 4: ML Risk Prediction

Model:

* XGBoost / LightGBM

Output:

```
P(event) = probability of disruption
```

---

### Step 5: Premium Calculation

Hybrid model:

```
Expected Loss = P(event) × payout  
Premium = Expected Loss + margin
```

---

### Step 6: Real-Time Monitoring

* Event-driven architecture
* Sliding window analysis
* Continuous trigger evaluation

---

### Step 7: Parametric Trigger Engine

Example triggers:

```
if ERI > threshold → weather trigger  
if PSI < threshold → platform outage  
if DVI > threshold → demand drop  
```

---

### Step 8: Fraud Detection

* Cross-verification of APIs
* anomaly detection (Isolation Forest)
* time consistency checks

---

### Step 9: Automated Payout System

Flow:

```
Trigger detected  
→ validation  
→ fraud check  
→ instant payout (UPI/bank)
```

---

## Tech Stack

### Frontend

* React
* Tailwind CSS

### Backend

* FastAPI / Node.js

### Data & Streaming

* Apache Kafka (optional)
* REST APIs

### Machine Learning

* Python
* Scikit-learn / XGBoost

### Database

* PostgreSQL
* InfluxDB (time-series)

---

## Installation & Setup

### 1. Clone Repository

```
git clone https://github.com/your-repo/shieldride.git
cd shieldride
```

---

### 2. Backend Setup

```
cd backend
pip install -r requirements.txt
```

Run server:

```
uvicorn main:app --reload
```

---

### 3. Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

### 4. Environment Variables

Create `.env` file:

```
WEATHER_API_KEY=your_key
MAPS_API_KEY=your_key
DATABASE_URL=your_db_url
```

---

## Dependencies

### Python

* fastapi
* uvicorn
* pandas
* numpy
* scikit-learn
* xgboost
* requests

### Node (if used)

* express
* axios
* dotenv

### Frontend

* react
* tailwindcss
* axios

---

## How It Runs (Execution Flow)

1. APIs fetch real-time data (weather, traffic, platform)
2. Backend processes and computes risk indices
3. ML model predicts disruption probability
4. Trigger engine evaluates conditions
5. If triggered:

   * payout calculated
   * fraud checks applied
   * payment executed
6. Frontend displays:

   * earnings insights
   * movement recommendations
   * risk levels

---

## Future Scope

* Blockchain-based transparent payouts
* Federated learning for privacy
* Satellite weather integration
* Cross-platform gig aggregation
* Real-time earnings heatmaps

---

## Positioning

ShieldRide is not just insurance.

It is a:

> **Real-time income stabilization and decision intelligence system for gig workers**

---

## License

MIT License

---
