#include <DHT.h>

#define trigPin 9
#define echoPin 10
#define gasPin A0
#define DHTPIN 11
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);
  
void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  dht.begin();
}

void loop() { 
  // Ultrasonic for Fill Level
  long duration, distance;
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.034 / 2;
  int fillPercentage = map(distance, 2, 30, 100, 0);
  fillPercentage = constrain(fillPercentage, 0, 100);

  // MQ2 Gas Sensor
  int gasValue = analogRead(gasPin);

  // DHT11 Sensor
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  // Retry if DHT fails
  if (isnan(temperature) || isnan(humidity)) {
    delay(2000);
    temperature = dht.readTemperature();
    humidity = dht.readHumidity();
  }

  // Send CSV format to Flask backend
  Serial.print(fillPercentage);
  Serial.print(",");
  Serial.print(gasValue);
  Serial.print(",");
  Serial.print(isnan(temperature) ? 0 : temperature);
  Serial.print(",");
  Serial.println(isnan(humidity) ? 0 : humidity);

  delay(5000);
}
