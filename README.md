## 🛡️ InSURE: Real-Time Income Stabilization Engine
**Protecting the Backbone of the Instant-Delivery Economy**

### 📌 Project Overview
InSURE is a **parametric, AI-driven income protection system** tailored for instant-delivery gig workers (Zepto, Blinkit, Instamart). 

While traditional insurance is reactive and manual, InSURE is **proactive and automated**. We use real-time data signals—weather, platform uptime, and demand density—to detect disruptions and trigger instant payouts *before* the worker even feels the loss.

---

### ⚠️ The Problem
The "10-minute delivery" model creates extreme volatility for workers:
1. **Unprotected Downtime:** Platform outages or extreme weather lead to zero earnings with no safety net.
2. **The "Black Box" Effect:** Workers have no visibility into where demand is shifting or when a store is failing.
3. **Manual Claims:** Traditional insurance is too slow for a worker who needs ₹500 *today* for fuel.

---

### 💡 The Solution: Parametric Protection
InSURE eliminates "claims" entirely. By monitoring a **Risk Index Engine**, the system identifies when conditions (like a flash storm or a dark store going offline) make earning impossible and compensates the worker automatically.

#### **Proprietary Risk Indices**
* **SDR (Dark Store Dependency Risk):** Automatically triggers compensation if the stores contributing to >60% of a worker's volume go offline.
* **ZSI (Zone Saturation Index):** Prevents "Rider Overcrowding" by balancing movement recommendations.
* **ERI (Environmental Risk Index):** Real-time weather API integration to adjust premiums and payouts during monsoon/heatwaves.

---

### 🧠 Core Innovation: The AI Engine
We don't just react; we predict.

1. Income Floor Guarantee
If the actual earnings E_a fall below the guaranteed floor F_i due to external disruption:

Payout = max(0, F_i - E_a)

2. Disruption Risk Index (DRI)
Our model calculates a unified risk score using:

DRI = w1(DVI) + w2(1 - PSI) + w3(ERI)

Where:

DVI = Demand Volatility Index

PSI = Platform Stability Index

ERI = Environmental Risk Index

**3. Fraud & Fairness**
* **Isolation Forest:** Used for real-time anomaly detection to prevent "GPS spoofing" for payouts.
* **Cluster-Based Fairness:** Groups riders by vehicle type and zone density to ensure equitable premium pricing.

---

### 🛠️ Tech Stack & Architecture
* **Backend:** FastAPI (High-performance async processing)
* **Real-time Data:** Apache Kafka for streaming platform signals
* **ML Pipeline:** XGBoost for disruption probability; Scikit-learn for rider clustering.
* **Database:** InfluxDB (Time-series data for earnings) & PostgreSQL.
* **Frontend:** React + Tailwind (Real-time "Heatmap" for workers).

---

### 📈 Impact & Scalability
* **For the Worker:** Guaranteed minimum wage + "Move-to-Earn" guidance.
* **For the Platform:** Reduced rider churn and better distribution of fleet during peak hours.
* **Future Vision:** Blockchain-based "Trustless Payouts" and satellite-integrated weather tracking.



## Installation & Setup

### Clone Repository

```bash
git clone https://github.com/dharumaran/insure.git
cd insure
```

---

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

### Environment Variables

Create a `.env` file:

```
WEATHER_API_KEY=your_key(will be updated)
MAPS_API_KEY=your_key(will be updated)
DATABASE_URL=your_db_url(will be updated)
```

---

## Execution Flow

1. APIs fetch real-time data
2. Backend computes risk indices
3. ML model predicts disruption probability
4. Trigger engine evaluates conditions
5. If triggered:

   * payout calculation
   * fraud validation
   * payment execution
6. Frontend displays insights, recommendations, and risk levels

---

## Future Scope

* Blockchain-based payout transparency
* Federated learning for privacy
* Satellite-based weather integration
* Cross-platform gig aggregation
* Real-time earnings heatmaps

---

## Positioning

InSURE is a **real-time income stabilization and decision intelligence system** for gig workers.

