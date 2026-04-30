#include <WiFi.h>
#include <HTTPClient.h>

// =========================
// WiFi Credentials
// =========================
const char* ssid = "Soil";
const char* password = "12345678";

// =========================
// FastAPI Server URL
// =========================
const char* serverName = "http://172.19.146.177:8000/esp32/update";

// =========================
// Supply Chain Stages
// =========================
const char* stages[] = {"farm", "distributor", "retail"};
int currentStageIdx = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\nConnecting to WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }

  Serial.println("\n✅ WiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {

    HTTPClient http;

    // Start connection
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    // =========================
    // Generate Sensor Data
    // =========================
    // Real milk pH is usually 6.7. Unsafe if < 6.0 or > 7.5
    float ph = random(62, 72) / 10.0;       
    
    // Turbidity (NTU). Safe if < 15
    int turbidity = random(5, 12);          
    
    // TDS (Total Dissolved Solids). Safe if < 300
    float tds = random(1800, 2500) / 10.0;  // 180 - 250 ppm
    
    // Color (Sensor intensity). Safe if > 150
    int color = random(180, 240);           

    // Current Stage
    const char* stage = stages[currentStageIdx];

    // =========================
    // Create JSON payload
    // =========================
    String jsonData = "{";
    jsonData += "\"batch_id\":\"MILK123\",";
    jsonData += "\"ph\":" + String(ph) + ",";
    jsonData += "\"turbidity\":" + String(turbidity) + ",";
    jsonData += "\"tds\":" + String(tds) + ",";
    jsonData += "\"color\":" + String(color) + ",";
    jsonData += "\"stage\":\"" + String(stage) + "\",";
    jsonData += "\"product\":\"milk\"";
    jsonData += "}";

    Serial.println("\n📤 Sending Data [" + String(stage) + "]:");
    Serial.println(jsonData);

    // =========================
    // Send POST request
    // =========================
    int httpResponseCode = http.POST(jsonData);

    Serial.print("📥 Response Code: ");
    Serial.println(httpResponseCode);

    // =========================
    // Read server response
    // =========================
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("📨 Response Received!");
      // Serial.println(response); // Commented to reduce serial clutter
    } else {
      Serial.print("❌ Error sending request: ");
      Serial.println(http.errorToString(httpResponseCode));
    }

    http.end();

    // Rotate to next stage for demo
    currentStageIdx = (currentStageIdx + 1) % 3;
  }

  Serial.println("Waiting 8 seconds for next stage...");
  delay(8000); 
}
