# 🚀 Complete Guide: Test MockFlow with Local Java API

## What You'll Learn
- Create a simple Java API
- Expose it via ngrok tunnel
- Call it from MockFlow
- See the results

**Total Time:** 15 minutes

---

## Prerequisites

### 1. Install Java (if not installed)
```bash
# Check if Java is installed
java -version

# If not installed, download from:
# https://www.oracle.com/java/technologies/downloads/
```

### 2. Install ngrok
```bash
# Download from: https://ngrok.com/download
# Or using chocolatey (Windows):
choco install ngrok

# Verify installation
ngrok version
```

---

## Step 1: Create Simple Java API (5 minutes)

### Create Project Folder
```bash
mkdir java-test-api
cd java-test-api
```

### Create `UserController.java`

Create a file named `UserController.java` with this code:

```java
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

public class UserController {
    public static void main(String[] args) throws IOException {
        // Create HTTP server on port 8080
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        
        // Add CORS headers handler
        server.createContext("/api/users", new UserHandler());
        
        server.setExecutor(null); // creates a default executor
        server.start();
        
        System.out.println("✅ Java API running on http://localhost:8080");
        System.out.println("📡 Endpoint: POST http://localhost:8080/api/users");
        System.out.println("🛑 Press Ctrl+C to stop");
    }
    
    static class UserHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Add CORS headers
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
            
            // Handle OPTIONS (preflight)
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }
            
            // Handle POST request
            if (exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                // Read request body
                String requestBody = new BufferedReader(
                    new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8))
                    .lines()
                    .collect(Collectors.joining("\n"));
                
                System.out.println("📥 Received request: " + requestBody);
                
                // Create response
                String response = String.format(
                    "{\"id\": 123, \"message\": \"User created successfully!\", \"receivedData\": %s, \"timestamp\": \"%s\"}",
                    requestBody,
                    java.time.Instant.now().toString()
                );
                
                System.out.println("📤 Sending response: " + response);
                
                // Send response
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, response.getBytes().length);
                OutputStream os = exchange.getResponseBody();
                os.write(response.getBytes());
                os.close();
            } else {
                // Method not allowed
                String response = "{\"error\": \"Method not allowed\"}";
                exchange.sendResponseHeaders(405, response.getBytes().length);
                OutputStream os = exchange.getResponseBody();
                os.write(response.getBytes());
                os.close();
            }
        }
    }
}
```

### Compile and Run

```bash
# Compile
javac UserController.java

# Run
java UserController
```

**You should see:**
```
✅ Java API running on http://localhost:8080
📡 Endpoint: POST http://localhost:8080/api/users
🛑 Press Ctrl+C to stop
```

### Test It Locally (Optional)

```bash
# In a new terminal
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}'
```

**Expected Response:**
```json
{
  "id": 123,
  "message": "User created successfully!",
  "receivedData": {"name": "John", "email": "john@example.com"},
  "timestamp": "2026-01-19T16:45:00Z"
}
```

---

## Step 2: Expose API via ngrok (2 minutes)

### Start ngrok Tunnel

```bash
# In a NEW terminal (keep Java API running)
ngrok http 8080
```

**You'll see:**
```
Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        India (in)
Latency                       23ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:8080

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### Copy the HTTPS URL

**Copy this URL:** `https://abc123.ngrok-free.app`

⚠️ **Important:** Your URL will be different! Use YOUR ngrok URL.

---

## Step 3: Test from MockFlow (5 minutes)

### Open MockFlow

```bash
# Make sure MockFlow is running
cd MockFlow/frontend
npm run dev

# Open: http://localhost:3000
```

### Create Workflow

1. **Drag Request Node** from Node Library
2. **Configure Request Node:**
   - Click the Request node
   - In the right panel:
     - **Method**: `POST`
     - **URL**: `https://abc123.ngrok-free.app` (YOUR ngrok URL)
     - **Path**: `/api/users`
     - **Headers**: Leave empty
     - **Body**:
       ```json
       {
         "name": "John Doe",
         "email": "john@example.com"
       }
       ```

3. **Drag Response Node**
4. **Connect Nodes:**
   - Drag from Request node's bottom handle
   - Drop on Response node's top handle

5. **Click "Test" Button** (top toolbar)

### See the Results! 🎉

**In MockFlow Test Dialog:**
```json
{
  "id": 123,
  "message": "User created successfully!",
  "receivedData": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "timestamp": "2026-01-19T16:45:00Z"
}
```

**In Java API Terminal:**
```
📥 Received request: {"name":"John Doe","email":"john@example.com"}
📤 Sending response: {"id":123,"message":"User created successfully!",...}
```

**In ngrok Terminal:**
```
POST /api/users              200 OK
```

---

## Complete Flow Diagram

```
MockFlow (localhost:3000)
    ↓ Click "Test"
    ↓
    POST https://abc123.ngrok-free.app/api/users
    Body: {"name": "John Doe", "email": "john@example.com"}
    ↓
ngrok tunnel
    ↓
Your Java API (localhost:8080)
    ↓ Processes request
    ↓ Returns response
    ↓
{"id": 123, "message": "User created successfully!", ...}
    ↓
MockFlow shows result ✅
```

---

## Troubleshooting

### Error: "Connection refused"

**Cause:** Java API not running

**Fix:**
```bash
# Check if Java API is running
curl http://localhost:8080/api/users

# If not, start it:
java UserController
```

### Error: "ngrok not found"

**Cause:** ngrok not installed or not in PATH

**Fix:**
```bash
# Windows: Download from ngrok.com and add to PATH
# Or install via chocolatey:
choco install ngrok
```

### Error: "CORS policy"

**Cause:** CORS headers missing

**Fix:** The Java code above already includes CORS headers. Make sure you're using the complete code.

### ngrok URL changes

**Cause:** Free ngrok URLs change on restart

**Fix:** 
- Copy the new URL each time you restart ngrok
- Update the URL in MockFlow Request node
- Or get a free ngrok account for stable URLs

---

## What You Just Did! 🎉

1. ✅ Created a Java REST API
2. ✅ Exposed it via ngrok tunnel
3. ✅ Called it from MockFlow
4. ✅ Saw real-time results

**This proves MockFlow can hit your local Java API!**

---

## Next Steps

### Test Different Endpoints

**Add more endpoints to your Java API:**

```java
// Add this in main():
server.createContext("/api/products", new ProductHandler());

// Add this class:
static class ProductHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // Similar to UserHandler
        String response = "{\"products\": [{\"id\": 1, \"name\": \"Product 1\"}]}";
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(200, response.getBytes().length);
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes());
        os.close();
    }
}
```

### Chain Multiple APIs

**In MockFlow:**
```
Request Node (Java API)
    ↓
Transformation Node (process data)
    ↓
Request Node (Another API)
    ↓
Response Node
```

### Save & Deploy

**To create a persistent mock:**
1. Click "Save" in MockFlow
2. Enter name: "User API"
3. Click "Deploy"
4. Now you have: `http://localhost:3000/api/users`

---

## Summary

**What you need running:**
- ✅ Java API: `java UserController`
- ✅ ngrok: `ngrok http 8080`
- ✅ MockFlow: `npm run dev`

**To test:**
1. Create workflow in MockFlow
2. Use ngrok URL in Request node
3. Click "Test"
4. See results! 🚀

**That's it! You're now testing local Java APIs with MockFlow!**
