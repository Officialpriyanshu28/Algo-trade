import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Test Broker Connection
  app.post("/api/brokers/test", async (req, res) => {
    const { exchange, apiKey, apiSecret } = req.body;

    if (!exchange || !apiKey || !apiSecret) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Mocking connection test for different exchanges
      // In a real app, you'd use libraries like ccxt
      console.log(`Testing connection for ${exchange}...`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simple validation logic (mock)
      if (apiKey.length < 10 || apiSecret.length < 10) {
        throw new Error("Invalid API Key or Secret format");
      }

      // Success response
      res.json({ 
        success: true, 
        message: `Successfully connected to ${exchange}`,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(401).json({ 
        success: false, 
        error: error.message || "Connection failed" 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
