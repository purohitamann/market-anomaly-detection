from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import pandas as pd
import logging
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})


# Configure logging
logging.basicConfig(level=logging.DEBUG)

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
