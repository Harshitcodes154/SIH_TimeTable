const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const path = require('path');
const fs = require('fs');

// Supabase is a managed service, so the custom file-based database logic is no longer needed.
// This is a minimal example. You will need to build your own API endpoints
// that interact with Supabase database tables (e.g., using a different Supabase client library for Node.js).
// Here, we focus on removing the unauthenticated login/register endpoints.

app.use(cors());
app.use(express.json());

// For demonstration, we'll keep the `db.json` and a single endpoint.
// In a real application, you would connect to Supabase database here.
const dbFilePath = path.join(__dirname, 'db.json');
function readDb() {
  try {
    if (fs.existsSync(dbFilePath)) {
      const data = fs.readFileSync(dbFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading database:', error);
  }
  return { users: [], timetables: [], activeTimetableId: null };
}

// === Timetable select endpoint ===
// This endpoint is an example of what needs to be protected with a JWT from Supabase.
// You would use a Supabase Node.js client or a library like 'express-jwt' to verify the token.
app.post('/api/timetables/select', (req, res) => {
  const { id } = req.body;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send('Authentication required');
  }

  // NOTE: This JWT verification is just for demonstration. You would use a Supabase client library
  // or middleware to properly verify the token against your Supabase instance.
  try {
    const decoded = jwt.decode(token); // Or use jwt.verify with your Supabase JWT secret
    console.log("Token decoded:", decoded);
    const db = readDb();
    db.activeTimetableId = id;
    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
    res.status(200).json({ message: 'Timetable selected successfully.' });
  } catch (err) {
    res.status(401).send('Invalid or expired token');
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});