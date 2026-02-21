import numpy as np
import pandas as pd
import xgboost as xgb
import lightgbm as lgb
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import torch
import torch.nn as nn
import torch.optim as optim

# =================================================================
# 1. MOCK DATA GENERATION (Simulating Indian MSME Data)
# =================================================================
def generate_msme_data(samples=1000):
    np.random.seed(42)
    data = {
        'gst_compliance_score': np.random.uniform(0, 100, samples),
        'cash_flow_stability': np.random.uniform(0, 100, samples),
        'upi_txn_volume': np.random.uniform(1000, 1000000, samples),
        'supplier_network_strength': np.random.uniform(0, 100, samples),
        'current_ratio': np.random.uniform(0.5, 3.0, samples),
        'debt_service_coverage': np.random.uniform(1.0, 5.0, samples),
    }
    df = pd.DataFrame(data)
    # Target: Normalized Credit Risk (0 to 1)
    target = (
        0.4 * (df['gst_compliance_score'] / 100) +
        0.3 * (df['cash_flow_stability'] / 100) +
        0.2 * (np.log(df['upi_txn_volume']) / np.log(1000000)) +
        0.1 * (df['debt_service_coverage'] / 5.0)
    )
    return df, target

# =================================================================
# 2. ENSEMBLE MODEL CORE
# =================================================================
class NovaScoreEnsemble:
    def __init__(self):
        # Weights as per 2025-2026 Indian MSME study standards
        self.w_xgb = 0.70  # Tabular GST/Cash-flow
        self.w_lgb = 0.20  # High-volume UPI transactions
        self.w_rf  = 0.10  # Bias reduction & Robustness
        
        self.xgb_model = xgb.XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=5)
        self.lgb_model = lgb.LGBMRegressor(n_estimators=100, learning_rate=0.1, num_leaves=31)
        self.rf_model  = RandomForestRegressor(n_estimators=100, max_depth=10)

    def train(self, X, y):
        print("[NovaScore] Training Ensemble Models...")
        self.xgb_model.fit(X, y)
        self.lgb_model.fit(X, y)
        self.rf_model.fit(X, y)
        print("[NovaScore] Training Complete.")

    def predict(self, X):
        p_xgb = self.xgb_model.predict(X)
        p_lgb = self.lgb_model.predict(X)
        p_rf  = self.rf_model.predict(X)
        
        # Weighted Average
        final_prediction = (self.w_xgb * p_xgb) + (self.w_lgb * p_lgb) + (self.w_rf * p_rf)
        return final_prediction

    def calculate_novascore(self, X):
        # Predictions are 0-1 (Risk/Score normalized)
        norm_scores = self.predict(X)
        
        # Map 0-1 to 300-900 (RBI Scale)
        # NovaScore = 300 + (NormalizedScore * 600)
        nova_scores = 300 + (norm_scores * 600)
        return np.round(nova_scores).astype(int)

    def get_rbi_band(self, score):
        if score >= 750: return "PRIME (Excellent)"
        elif 650 <= score < 750: return "GOOD (Reliable)"
        elif 550 <= score < 650: return "FAIR (Moderate Risk)"
        else: return "SUBPRIME (High Risk)"

# =================================================================
# 3. PYTORCH NEURAL NETWORK MODULE (Alternative / Feature Extractor)
# =================================================================
class MSME_DNN(nn.Module):
    def __init__(self, input_dim):
        super(MSME_DNN, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 1),
            nn.Sigmoid()
        )
    
    def forward(self, x):
        return self.net(x)

# =================================================================
# 4. EXECUTION FLOW
# =================================================================
if __name__ == "__main__":
    # 1. Data Prep
    X, y = generate_msme_data()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 2. Ensemble Initialization & Training
    ensemble = NovaScoreEnsemble()
    ensemble.train(X_train, y_train)

    # 3. Inference
    scores = ensemble.calculate_novascore(X_test)
    
    # 4. Results Display
    print("\n" + "="*40)
    print("      INDIAN MSME NOVASCORE AUDIT")
    print("="*40)
    for i in range(5):
        score = scores[i]
        band = ensemble.get_rbi_band(score)
        print(f"MSME Entity {i+1}: NovaScore = {score} | Band: {band}")
    print("="*40)
