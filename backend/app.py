import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import serial
import os
import threading
import serial.tools.list_ports
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Initialize Flask App
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

# Data Storage
users = {}  # Tracks citizen scores
priority_bins = []
citizen_reports = 0
historical_data = []  # Stores historical sensor readings

# Environmental Metrics
MILEAGE_PER_PRIORITY_BIN = 1.5  # km saved per priority bin
CO2_PER_KM = 0.27  # kg CO2 saved per km

# Email Configuration (Use App Passwords)
EMAIL_SENDER = "pinankbhayani0@gmail.com"
EMAIL_PASSWORD = "lhmi gygl hivg ykkf"  # Use environment variables in production
EMAIL_RECEIVER = "manthankathiriya808@gmail.com"


def send_email(alert_type, value):
    """ Sends an email alert when bin level, gas, temperature, or humidity exceeds limits. """
    try:
        msg = MIMEMultipart()
        msg["From"] = EMAIL_SENDER
        msg["To"] = EMAIL_RECEIVER
        msg["Subject"] = f"🚨 Smart Waste Alert: {alert_type} Exceeded!"

        body = f"Warning: {alert_type} has exceeded safe limits!\nCurrent Value: {value}\nLocation: GMIT Bhavnagar"
        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL_SENDER, EMAIL_PASSWORD)
        server.sendmail(EMAIL_SENDER, EMAIL_RECEIVER, msg.as_string())
        server.quit()
        print(f"📧 Email Sent for {alert_type} Alert!")
    except Exception as e:
        print(f"❌ Email Sending Failed: {e}")


# Arduino Serial Setup
arduino_port = "COM8"
try:
    ser = serial.Serial(arduino_port, 9600)
    print(f"✅ Arduino found on {arduino_port}")
except serial.SerialException as e:
    print(f"❌ Serial connection error: {e}")
    ser = None


def read_serial():
    """ Reads data from Arduino and emits updates via SocketIO. """
    if ser is None:
        return
    while True:
        if ser.in_waiting > 0:
            data = ser.readline().decode("utf-8").strip()
            print(f"📡 Arduino: {data}")

            try:
                parts = data.split(",")
                if len(parts) == 4:
                    fill, gas, temp, humidity = map(
                        lambda x: 0 if x == "nan" else float(x), parts
                    )

                    lat = "21.7187739"
                    lng = "72.1219380"

                    bin_data = {
                        "fill_level": fill,
                        "gas": gas,
                        "temperature": temp,
                        "humidity": humidity,
                        "location": f"{lat}, {lng}",
                        "place": "GMIT Bhavnagar",
                        "timestamp": datetime.now().strftime("%H:%M:%S"),
                    }

                    # Store historical data
                    historical_data.append(bin_data)

                    # Emit real-time data
                    socketio.emit("historical_data", bin_data)

                    # Check & send email alerts
                    if fill >= 80:
                        send_email("Bin Full", f"{fill}%")
                    if gas >= 600:
                        send_email("High Gas Level", f"{gas} ppm")
                    if temp >= 35:
                        send_email("High Temperature", f"{temp}°C")
                    if humidity >= 70:
                        send_email("High Humidity", f"{humidity}%")

                    # Add to priority queue if necessary
                    if fill >= 80 or gas >= 600 or temp >= 35 or humidity >= 70:
                        priority_bins.append(bin_data)

                    socketio.emit("bin_data", bin_data)
            except Exception as e:
                print("⚠️ Parsing error:", e)


# Start Arduino Serial Reading
serial_thread = threading.Thread(target=read_serial)
serial_thread.daemon = True
serial_thread.start()


# ----------------------------------
# 🚀 Citizen Reporting & Leaderboard
# ----------------------------------

@app.route('/citizen-report', methods=['POST'])
def report_bin():
    """ Citizens report full bins & earn points """
    data = request.json
    username = data.get("username")

    if not username:
        return jsonify({"error": "Username required"}), 400

    users[username] = users.get(username, 0) + 10  # Award 10 points

    # Simulated Bin Report
    bin_data = {
        "fill_level": 95,
        "gas": 500,
        "temperature": 30,
        "humidity": 65,
        "location": "21.7187739, 72.1219380",
        "place": "Reported Location",
        "timestamp": datetime.now().strftime("%H:%M:%S"),
    }
    priority_bins.append(bin_data)

    return jsonify({"username": username, "points": users[username]})


@app.route('/user-score', methods=['GET'])
def get_score():
    """ Get user's current score """
    username = request.args.get("username")
    return jsonify({"username": username, "points": users.get(username, 0)})


@app.route('/leaderboard', methods=['GET'])
def leaderboard():
    """ Returns sorted leaderboard of top users """
    sorted_users = sorted(users.items(), key=lambda x: x[1], reverse=True)
    return jsonify([{"username": u, "points": p} for u, p in sorted_users])


# ----------------------------------
# 📊 Dashboard Routes
# ----------------------------------

@app.route("/")
def home():
    return jsonify(
        {
            "status": "Smart Waste Backend Running 🚀",
            "routes": [
                "/priority-bins",
                "/clear-priority",
                "/citizen-report",
                "/stats",
                "/historical-data",
                "/leaderboard",
            ],
        }
    )


@app.route("/priority-bins")
def get_priority_bins():
    """ Get all bins in priority queue """
    return jsonify(priority_bins)


@app.route("/clear-priority", methods=["POST"])
def clear_priority():
    """ Clear all priority bins """
    priority_bins.clear()
    return jsonify({"status": "Priority queue cleared!"})


@app.route("/stats")
def stats():
    """ Returns real-time environmental impact metrics """
    mileage_saved = len(priority_bins) * MILEAGE_PER_PRIORITY_BIN
    co2_saved = mileage_saved * CO2_PER_KM
    return jsonify(
        {
            "mileage_saved_km": round(mileage_saved, 2),
            "co2_saved_kg": round(co2_saved, 2),
            "citizen_reports": citizen_reports,
        }
    )


@app.route("/historical-data")
def get_historical_data():
    """ Get all historical bin data """
    return jsonify(historical_data)


# ----------------------------------
# 🚀 Run Flask App
# ----------------------------------
if __name__ == "__main__":
    socketio.run(
        app,
        host="0.0.0.0",
        port=5000,
        debug=True,
        use_reloader=False,
        allow_unsafe_werkzeug=True,  # ✅ Fix: Allows Werkzeug in development
    )

