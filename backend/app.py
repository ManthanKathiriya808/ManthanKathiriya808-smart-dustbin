from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
import serial
import threading
import serial.tools.list_ports
from datetime import datetime

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

priority_bins = []
citizen_reports = 0

# Environmental factors
MILEAGE_PER_PRIORITY_BIN = 1.5  # km saved per bin optimization
CO2_PER_KM = 0.27  # kg CO2 per km saved

arduino_port = 'COM8'
try:
    ser = serial.Serial(arduino_port, 9600)
    print(f"✅ Arduino found on {arduino_port}")
except serial.SerialException as e:
    print(f"❌ Serial connection error: {e}")
    ser = None


def read_serial():
    if ser is None:
        return
    while True:
        if ser.in_waiting > 0:
            data = ser.readline().decode('utf-8').strip()
            print(f"📡 Arduino: {data}")

            try:
                parts = data.split(",")
                if len(parts) == 4:
                    fill, gas, temp, humidity = map(lambda x: 0 if x == "nan" else float(x), parts)

                    lat = "21.7187739"
                    lng = "72.1219380"

                    bin_data = {
                        'fill_level': fill,
                        'gas': gas,
                        'temperature': temp,
                        'humidity': humidity,
                        'location': f"{lat}, {lng}",
                        'place': "GMIT Bhavnagar",
                        'timestamp': datetime.now().strftime("%H:%M:%S")
                    }

                    # Check and add to priority queue
                    if fill >= 80 or gas >= 600 or temp >= 35 or humidity >= 70:
                        priority_bins.append(bin_data)

                    socketio.emit('bin_data', bin_data)
            except Exception as e:
                print("⚠️ Parsing error:", e)


serial_thread = threading.Thread(target=read_serial)
serial_thread.daemon = True
serial_thread.start()

@app.route('/')
def home():
    return jsonify({"status": "Smart Waste Backend Running 🚀", "routes": ["/priority-bins", "/clear-priority", "/citizen-report", "/stats"]})

@app.route('/priority-bins')
def get_priority_bins():
    return jsonify(priority_bins)


@app.route('/clear-priority', methods=['POST'])
def clear_priority():
    priority_bins.clear()
    return jsonify({"status": "Priority queue cleared!"})


@app.route('/citizen-report', methods=['POST'])
def report():
    global citizen_reports, mileage_saved_km, co2_saved_kg
    citizen_reports += 1

    # Fake bin for citizen report
    bin_data = {
        'fill_level': 95,
        'gas': 500,
        'temperature': 30,
        'humidity': 65,
        'location': "21.7187739, 72.1219380",  # Static/fake for now
        'place': "Reported Location",
        'timestamp': datetime.now().strftime("%H:%M:%S")
    }
    priority_bins.append(bin_data)
    mileage_saved_km += 1
    co2_saved_kg += 0.5
    return jsonify({"status": "Citizen report received & added to priority bins!"})


@app.route('/stats')
def stats():
    mileage_saved = len(priority_bins) * MILEAGE_PER_PRIORITY_BIN
    co2_saved = mileage_saved * CO2_PER_KM
    return jsonify({
        "mileage_saved_km": round(mileage_saved, 2),
        "co2_saved_kg": round(co2_saved, 2),
        "citizen_reports": citizen_reports
    })


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, use_reloader=False, allow_unsafe_werkzeug=True)
