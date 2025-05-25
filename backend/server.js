import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

import { saveAuditLog, getAuditLogs } from './auditLogs.js';

// Enable __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Load prices from JSON file at startup
let prices = [];
try {
  prices = JSON.parse(fs.readFileSync(join(__dirname, 'mockPrices.json'), 'utf-8'));
} catch (e) {
  console.error('Error reading mockPrices.json:', e);
  prices = [];
}

// GET all prices (optional)
app.get('/api/prices', (req, res) => {
  res.json(prices);
});

// GET prices filtered by category
app.get('/api/prices/:category', (req, res) => {
  const category = req.params.category.toUpperCase();
  const filtered = prices.filter(p => p.id.startsWith(category));
  res.json(filtered);
});

// GET audit logs
app.get('/api/audit-logs', (req, res) => {
  res.json(getAuditLogs());
});

// Validation helper
function isValidPriceEntry(entry) {
  const requiredKeys = ['under25', 'over25', 'over50', 'over90'];
  const hasValidNumbers = requiredKeys.every(key =>
    typeof entry[key] === 'number' && entry[key] >= 0
  );

  const validStatus = !entry.status || ['open', 'close'].includes(entry.status);
  return typeof entry.id === 'string' && hasValidNumbers && validStatus;
}

// POST update prices for a category
app.post('/api/prices/:category', (req, res) => {
  const category = req.params.category.toUpperCase();
  const updatedCategoryPrices = req.body;

  if (!Array.isArray(updatedCategoryPrices) || !updatedCategoryPrices.every(isValidPriceEntry)) {
    return res.status(400).json({ error: '❌ Invalid data format sent to server.' });
  }

  // Extract old prices for this category
  const oldCategoryPrices = prices.filter(p => p.id.startsWith(category));
  prices = prices.filter(p => !p.id.startsWith(category));

  // Check changes and log them
  updatedCategoryPrices.forEach(newEntry => {
    const oldEntry = oldCategoryPrices.find(p => p.id === newEntry.id);
    if (!oldEntry) return; // new entry, no old data to compare

    ['under25', 'over25', 'over50', 'over90', 'status', 'name'].forEach(field => {
      if (oldEntry[field] !== newEntry[field]) {
        saveAuditLog({
          category,
          id: newEntry.id,
          field,
          oldValue: oldEntry[field],
          newValue: newEntry[field]
        });
      }
    });
  });

  prices.push(...updatedCategoryPrices);

  // Save to file
  fs.writeFile(join(__dirname, 'mockPrices.json'), JSON.stringify(prices, null, 2), (err) => {
    if (err) {
      console.error('❌ Error saving prices:', err);
      return res.status(500).send('Failed to save prices');
    }
    console.log(`✅ Prices saved for category ${category}`);
    io.emit('pricesUpdated', { category, prices: updatedCategoryPrices });
    res.sendStatus(200);
  });
});

// Socket.io setup
io.on('connection', (socket) => {
  console.log('🔌 User connected');
});

server.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
});
