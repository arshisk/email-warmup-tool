let warmupEnabled = true;
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sendWarmUpEmail } = require('./emailService');
const db = require('./database');
const schedule = require('node-schedule');
const { sendToReceiversFromAccount } = require('./emailService');
const emailAccounts = [
  { email: process.env.SMTP_USER, password: process.env.SMTP_PASS },
  { email: process.env.SMTP_USER, password: process.env.SMTP_PASS }, // duplicate for testing
];
const { checkAndReply } = require('./imapService'); // Import the function
const { sendWarmUpEmailFromPool } = require('./emailService');
// Check for replies every 10 minutes
schedule.scheduleJob('*/30 * * * *', async () => {
  if (warmupEnabled) {
    try {
      console.log('⏰ Running automatic checkAndReply...');
      
      console.log('⏰ Running warm-up to receivers...');
      await sendToReceiversFromAccount();  // Your new warm-up function
      
      await checkAndReply();  // Optional reply logic, keep if you want
      
    } catch (err) {
      console.error('Scheduler error:', err);
    }
  } else {
    console.log('⏹ Warm-up scheduler is paused.');
  }
});





require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// API: Send a warm-up email
app.get('/start-warmup', async (req, res) => {
  try {
    const sender = process.env.SMTP_USER; // Change this dynamically if using multiple accounts
    const receiver = 'ashfiaara@gmail.com'; // Replace with another warm-up email

    await sendWarmUpEmail(sender, receiver);
 res.json({ message: `✅ Warm-up email from ${sender} to ${receiver} sent.` });  } catch (error) {
    res.status(500).json({ error: 'Failed to send warm-up email' });
  }
});
let dailyVolume = 2;       // Start sending 2 emails per day
const maxVolume = 20;      // Max emails per day limit

schedule.scheduleJob('0 9 * * *', async () => {  // Runs every day at 9 AM
  // Shuffle the accounts randomly
  const shuffledAccounts = emailAccounts.sort(() => 0.5 - Math.random());

  for (let i = 0; i < Math.min(dailyVolume, shuffledAccounts.length - 1); i++) {
    try {
      await sendWarmUpEmail(shuffledAccounts[i].email, shuffledAccounts[i + 1].email);
      console.log(`Scheduled: Email sent from ${shuffledAccounts[i].email} to ${shuffledAccounts[i + 1].email}`);
    } catch (error) {
      console.error(`Failed to send scheduled email: ${error.message}`);
    }
  }

  // Every 3rd day, increase the volume by 2 emails/day, up to maxVolume
  if (dailyVolume < maxVolume && new Date().getDate() % 3 === 0) {
    dailyVolume += 2;
    console.log(`Increasing daily email volume to ${dailyVolume}`);
  }
});

app.get('/check-replies', async (req, res) => {
  try {
    await checkAndReply();
    res.json({ message: '✅ Checked inbox and replied to new emails' });
  } catch (error) {
    res.status(500).json({ error: '❌ Failed to check replies' });
  }
});

app.get('/test-accounts', (req, res) => {
  db.all('SELECT * FROM accounts', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


app.get('/logs', (req, res) => {
  db.all('SELECT * FROM logs ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.get('/test-logs', (req, res) => {
  db.all('SELECT * FROM logs', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/warmup-status', (req, res) => {
  res.json({ enabled: warmupEnabled });
});

app.post('/toggle-warmup', (req, res) => {
  warmupEnabled = !warmupEnabled;
  res.json({ enabled: warmupEnabled });
});

// Get all accounts
app.get('/accounts', (req, res) => {
  db.all('SELECT * FROM accounts', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
// TEMP version to delete using browser GET (not secure for production)
app.get('/delete-account/:email', (req, res) => {
  const email = decodeURIComponent(req.params.email);
  db.run('DELETE FROM accounts WHERE email = ?', [email], function (err) {
    if (err) {
      console.error('❌ Delete error:', err.message);
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: `No account found with email: ${email}` });
    }

    res.json({ message: `✅ Deleted account: ${email}` });
  });
});





// Add new account
app.post('/accounts', (req, res) => {
  const { email, password } = req.body;
  db.run(
    'INSERT INTO accounts (email, password) VALUES (?, ?)',
    [email, password],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, email, password });
    }
  );
});

// Add receiver email
app.post('/receivers', (req, res) => {
  const { email } = req.body;
  db.run('INSERT INTO receivers (email) VALUES (?)', [email], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, email });
  });
});

// Get all receivers
app.get('/receivers', (req, res) => {
  db.all('SELECT * FROM receivers', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/test-receivers', (req, res) => {
  db.all('SELECT * FROM receivers', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
