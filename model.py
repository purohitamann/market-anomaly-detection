import numpy as np
import yfinance as yf
import pandas as pd
import datetime
import pickle
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

# Configure logging for easier debugging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Load your pre-trained model (ensure this file exists in your environment)
with open("random_forest_model-SMOTE.pkl", "rb") as f:
    model = pickle.load(f)

def fetch_realtime_data(symbol_map: dict, start_date: str = None, end_date: str = None) -> pd.DataFrame:
    """
    Fetches the 'Close' prices from Yahoo Finance for each available feature in the symbol_map.
    For real-time data, we can set start_date to a recent date (e.g., today minus N days).
    
    Returns a combined DataFrame indexed by date with columns for each available feature.
    """
    if end_date is None:
        end_date = datetime.datetime.now().strftime("%Y-%m-%d")
    if start_date is None:
        # For real-time, fetch e.g., last 30 days
        start_date = (datetime.datetime.now() - datetime.timedelta(days=30)).strftime("%Y-%m-%d")
    
    dfs = []
    for feature_name, yf_symbol in symbol_map.items():
        if yf_symbol is None:
            logging.info(f"[SKIP] No Yahoo Finance symbol for {feature_name}.")
            continue
        
        logging.debug(f"Fetching data for {feature_name} ({yf_symbol}) from {start_date} to {end_date}...")
        try:
            df = yf.download(yf_symbol, start=start_date, end=end_date, interval="1d")
            if df.empty:
                logging.warning(f"No data returned for {feature_name} ({yf_symbol}).")
                continue
            # For multi-index columns, flatten
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = ['_'.join(col).strip() for col in df.columns.values]
                col_name = f"Close_{yf_symbol}"
            else:
                col_name = "Close"
            
            if col_name not in df.columns:
                logging.warning(f"'Close' column not found for {feature_name} ({yf_symbol}).")
                continue
            
            # Rename and select only the close column
            df_feature = df[[col_name]].rename(columns={col_name: feature_name})
            dfs.append(df_feature)
        except Exception as e:
            logging.error(f"Failed to fetch data for {feature_name} ({yf_symbol}): {e}")
    
    if not dfs:
        raise ValueError("No data was fetched for any features.")
    
    combined_df = pd.concat(dfs, axis=1, join='outer')
    combined_df.sort_index(inplace=True)
    return combined_df

def add_day_of_week(df: pd.DataFrame) -> pd.DataFrame:
    """
    Given a DataFrame with a datetime index, add a column 'day_of_week'
    indicating the day of the week (0=Monday, 6=Sunday).
    """
    df = df.copy()
    df["day_of_week"] = df.index.dayofweek
    return df

def format_dataset_to_required(df: pd.DataFrame) -> pd.DataFrame:
    """
    Select and reorder the features to match our training set, then add day_of_week.
    
    Required Columns:
      "XAU BGNL", "BDIY", "CRY", "DXY", "JPY", "GBP", "Cl1", "VIX",
      "USGG30YR", "USGG2YR", "MXEU", "MXJP", "MXBR", "day_of_week"
    
    For columns not available (e.g., ECSURPUS, GTITL30YR, GTJPY30YR, GTJPY2YR, MXRU),
    they are omitted.
    
    :param df: Combined DataFrame with fetched features.
    :return: DataFrame with features as required for the model.
    """
    required_columns = [
        "XAU BGNL", "BDIY", "CRY", "DXY", "JPY", "GBP", "Cl1", "VIX",
        "USGG30YR", "USGG2YR", "MXEU", "MXJP", "MXBR"
    ]
    
    # Create a DataFrame with required columns, fill missing ones with NaN.
    df_formatted = pd.DataFrame(index=df.index)
    for col in required_columns:
        if col in df.columns:
            df_formatted[col] = df[col]
        else:
            logging.info(f"Column '{col}' not found; filling with NaN.")
            df_formatted[col] = pd.NA
    
    # Add day_of_week as an additional feature
    df_formatted = add_day_of_week(df_formatted)
    return df_formatted

# Define the mapping for features available via Yahoo Finance.
# For this retraining, we only include features that are available.
symbol_map = {
    "XAU BGNL":  "GC=F",        # Gold futures as proxy for Gold Spot
    "BDIY":      "^BDI",        # Baltic Dry Index
    "CRY":       "^CRB",        # CRB Commodity Index (proxy for TR/CC CRB ER Index)
    "DXY":       "DX-Y.NYB",    # U.S. Dollar Index
    "JPY":       "JPY=X",       # JPY/USD exchange rate
    "GBP":       "GBPUSD=X",    # GBP/USD exchange rate
    "Cl1":       "CL=F",        # WTI Crude Oil Futures (generic first CL future)
    "VIX":       "^VIX",        # CBOE Volatility Index
    "USGG30YR":  "^TYX",        # Proxy for U.S. Generic Govt 30 Yr yield
    "USGG2YR":   "^IRX",        # Proxy for U.S. Generic Govt 2 Yr yield (13-week T-bill)
    "MXEU":      "EZU",         # Proxy for MSCI EUROPE (ETF)
    "MXJP":      "EWJ",         # Proxy for MSCI JAPAN (ETF)
    "MXBR":      "EWZ"          # Proxy for MSCI BRAZIL (ETF)
    # Columns that are not available are removed.
}

def fetch_market_features(symbol_map: dict, start_date: str = "2022-01-01", end_date: str = None) -> pd.DataFrame:
    """
    Fetches daily 'Close' price data for each feature from Yahoo Finance based on symbol_map.
    Only fetches tickers with valid Yahoo Finance symbols.
    
    :param symbol_map: Mapping of feature names to Yahoo Finance symbols. If a value is None, that feature is skipped.
    :param start_date: Start date (YYYY-MM-DD) for data download.
    :param end_date: End date; if None, defaults to today's date.
    :return: A combined DataFrame indexed by date containing the 'Close' prices
             for each available feature, with columns named after the feature names.
    """
    if end_date is None:
        end_date = datetime.datetime.now().strftime("%Y-%m-%d")
    
    dfs = []
    for feature_name, yf_symbol in symbol_map.items():
        if yf_symbol is None:
            print(f"[SKIP] No Yahoo Finance symbol for {feature_name}.")
            continue
        
        print(f"Fetching data for {feature_name} ({yf_symbol})...")
        try:
            # Download daily data from Yahoo Finance
            df = yf.download(yf_symbol, start=start_date, end=end_date, interval="1d")
            if df.empty:
                print(f"[WARNING] No data returned for {feature_name} ({yf_symbol}).")
                continue
            
            # If columns are a MultiIndex, flatten them
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = ['_'.join(col).strip() for col in df.columns.values]
                col_name = f"Close_{yf_symbol}"
            else:
                col_name = "Close"
            
            if col_name not in df.columns:
                print(f"[WARNING] 'Close' column not found for {feature_name} ({yf_symbol}).")
                continue
            
            # Select only the 'Close' column and rename it to feature_name
            df_feature = df[[col_name]].rename(columns={col_name: feature_name})
            dfs.append(df_feature)
        except Exception as e:
            print(f"[ERROR] Failed to fetch data for {feature_name} ({yf_symbol}): {e}")
    
    if not dfs:
        raise ValueError("No data was fetched for any features.")
    
    # Combine all feature DataFrames by joining on the date index (outer join)
    combined_df = pd.concat(dfs, axis=1, join='outer')
    combined_df.sort_index(inplace=True)
    return combined_df

def add_additional_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Adds engineered features to the DataFrame:
      - MA7_VIX: 7-day moving average for VIX (if VIX is available).
      - XAU_BGNL_volatility: 7-day rolling standard deviation of daily percentage change for XAU BGNL (if available).
      - dummy_feature: A constant column as a placeholder.
    
    :param df: DataFrame with the selected features.
    :return: DataFrame with additional columns.
    """
    if "VIX" in df.columns:
        df["MA7_VIX"] = df["VIX"].rolling(window=7, min_periods=1).mean()
    else:
        print("[WARNING] 'VIX' column not found; cannot compute MA7_VIX.")
    
    if "XAU BGNL" in df.columns:
        df["XAU_BGNL_volatility"] = df["XAU BGNL"].pct_change().rolling(window=7, min_periods=1).std()
    else:
        print("[WARNING] 'XAU BGNL' column not found; cannot compute XAU_BGNL_volatility.")
    
    # Add a dummy feature as a placeholder
    df["dummy_feature"] = 1
    return df

def format_dataset_to_required(df: pd.DataFrame) -> pd.DataFrame:
    """
    Subsets and reorders the DataFrame to the required columns. For any required column that is missing,
    fills it with NaN. Then applies additional feature engineering.
    
    Required Columns:
      XAU BGNL, ECSURPUS, BDIY, CRY, DXY, JPY, GBP, Cl1, VIX,
      USGG30YR, USGG2YR, GTITL30YR, GTJPY30YR, GTJPY2YR, MXEU, MXJP, MXBR, MXRU
    
    :param df: Combined DataFrame with fetched features.
    :return: DataFrame with exactly the required columns in order (missing ones as NaN) and extra engineered features.
    """
    required_columns = [
        "XAU BGNL","BDIY","CRY"	,"DXY"	,"JPY",	"GBP",	"Cl1","VIX","USGG30YR","USGG2YR",	"MXEU",	"MXJP","MXBR"	
    ]
    
    # Create a new DataFrame with the required columns; fill missing ones with NaN.
    df_formatted = pd.DataFrame(index=df.index)
    for col in required_columns:
        if col in df.columns:
            df_formatted[col] = df[col]
        else:
            print(f"[INFO] Column '{col}' not found. Filling with NaN.")
            df_formatted[col] = pd.NA
    
    # Optionally, reset index if needed:
    # df_formatted.reset_index(drop=True, inplace=True)
    
    # Add extra engineered features
    df_complete = add_additional_features(df_formatted)
    return df_complete

@app.route('/api/forecast', methods=['GET'])
def forecast():
    """
    Forecast market condition using current market data.
    
    Steps:
      1. Fetch current/dynamic data for available features from Yahoo Finance.
      2. Format data to the required model input format.
      3. Use the pre-trained model to make a prediction (e.g., crash vs. no crash).
      4. Optionally, generate additional forecast information.
    
    Returns:
      JSON with:
        - model_prediction: 1 if crash is predicted, 0 otherwise,
        - model_probability: probability for crash (if available),
        - latest_features: a dict of the latest features used for prediction.
    """
    try:

        start_date = (datetime.datetime.now() - datetime.timedelta(days=10)).strftime("%Y-%m-%d")
        df_raw = fetch_market_features(symbol_map, start_date=start_date)
        logging.debug(f"Raw fetched data shape: {df_raw.shape}")
        
      
        df_input = format_dataset_to_required(df_raw)
        logging.debug("Formatted DataFrame head:")
        logging.debug(df_input.head())
        df_input.drop(columns=["dummy_feature"],axis=1, inplace=True)
        # df_input.drop(columns=["Date"],axis=1, inplace=True)
        df_input.drop(columns=["CRY"],axis=1, inplace=True)
        latest_data = df_input.iloc[-1:].fillna(0).infer_objects(copy=False)
        logging.debug(f"Latest data for prediction:\n{latest_data}")

        X_input = latest_data.values  # Shape: (1, number_of_features)
        
        logging.debug(f"Input for model: {X_input}")
       
        model_prediction = model.predict(X_input)
        model_proba = model.predict_proba(X_input)[:, 1][0] if hasattr(model, "predict_proba") else None
        
        return jsonify({
            "model_prediction": int(model_prediction[0]),
            "model_probability": model_proba,
            "latest_features": latest_data.to_dict(orient="records")[0]
        }), 200

    except Exception as e:
        logging.error(f"Error in forecasting endpoint: {e}")
        return jsonify({
            "error": "An unexpected error occurred during forecasting.",
            "details": str(e)
        }), 500

@app.route('/api/market-data', methods=['GET'])
def market_data():
    """
    Example usage:
    GET /api/market-data?symbol=AAPL&days=10
    Fetches 'days' most recent daily prices for 'symbol' from yfinance
    and returns a JSON response.
    """
    try:
        # Parse query parameters
        symbol = request.args.get('symbol', 'AAPL').upper()
        days = int(request.args.get('days', 10))

        logging.debug(f"Received request for symbol={symbol}, days={days}")

        # Validate symbol and days
        if not symbol.isalnum():
            return jsonify({"error": "Invalid symbol format. Please provide a valid stock ticker."}), 400
        if days < 1 or days > 365:
            return jsonify({"error": "Days must be between 1 and 365."}), 400

        # Dynamically adjust the period
        if days <= 2:
            period = '1d'
        elif days <= 30:
            period = '1mo'
        elif days <= 90:
            period = '3mo'
        else:
            period = '1y'

        logging.debug(f"Determined period={period}")

        # Fetch data from Yahoo Finance
        df = yf.download(symbol, period=period, interval='1d')
        logging.debug(f"Full DataFrame:\n{df}")
        logging.debug(f"DataFrame Columns: {list(df.columns)}")

        # Flatten MultiIndex if necessary
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = ['_'.join(col).strip() for col in df.columns]
            logging.debug(f"Flattened DataFrame Columns: {list(df.columns)}")

        # Check if DataFrame is empty or missing Close prices
        if df.empty:
            logging.error(f"No data found for symbol '{symbol}'.")
            return jsonify({"error": f"No data found for symbol '{symbol}'."}), 404
        if f"Close_{symbol}" not in df.columns:
            logging.error(f"'Close_{symbol}' column missing in DataFrame.")
            return jsonify({"error": f"No valid 'Close' prices found for symbol '{symbol}'."}), 404

        # Get only the last 'days' rows
        df = df.tail(days)
        logging.debug(f"Filtered DataFrame (last {days} days):\n{df}")

        # Convert the Close prices and dates to lists
        labels = df.index.strftime('%Y-%m-%d').tolist()
        actualPrices = df[f"Close_{symbol}"].round(2).tolist()

        logging.debug(f"Labels: {labels}")
        logging.debug(f"Actual Prices: {actualPrices}")

        # Simple "prediction": next day’s price = last close * 1.02
        if actualPrices:
            last_price = actualPrices[-1]
            predictions = [round(last_price * 1.02, 2)]  # Example prediction
        else:
            last_price = 100.0
            predictions = [round(last_price * 1.02, 2)]

        logging.debug(f"Predictions: {predictions}")

        return jsonify({
            "symbol": symbol,
            "days": days,
            "labels": labels,
            "actualPrices": actualPrices,
            "predictions": predictions
        }), 200

    except ValueError as ve:
        logging.error(f"ValueError: {ve}")
        return jsonify({"error": "Invalid request parameters.", "details": str(ve)}), 400
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return jsonify({"error": "An unexpected error occurred.", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005, debug=True)
