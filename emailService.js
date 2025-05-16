const nodemailer = require('nodemailer');
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✓ loaded' : '❌ MISSING!');
const db = require('./database');



// Email Transporter using SMTP with env vars (used only in manual sendWarmUpEmail)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Function to send a warm-up email manually (you can keep this for testing)
async function sendWarmUpEmail(from, to, status = 'sent') {
  try {
    const mailOptions = {
      from,
      to,
      subject: `Warm-up: ${Math.random().toString(36).substring(7)}`,
      text: `Hi, this is a warm-up email! Random: ${Math.random()}`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent from ${from} to ${to}`);
    console.log(`📥 Logging email from ${from} to ${to} with status: ${status}`);

    db.run(
      `INSERT INTO logs (sender, receiver, status, timestamp) VALUES (?, ?, ?, ?)`,
      [from, to, status, new Date().toISOString()],
      (err) => {
        if (err) {
          console.error('DB Log Insert Error:', err.message);
        } else {
          console.log('✅ Log saved to DB');
        }
      }
    );
  } catch (err) {
    console.error('sendWarmUpEmail failed:', err.message);
    throw err;
  }
}

// (Keep for legacy if needed) Send warm-up between two random accounts (requires >=2 accounts)
async function sendWarmUpEmailFromPool() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM accounts', async (err, accounts) => {
      if (err || accounts.length < 2) {
        console.log('❌ Not enough accounts to warm up');
        return reject(err || 'Need at least 2 accounts');
      }

      // Shuffle and pick 2 different accounts
      const shuffled = accounts.sort(() => 0.5 - Math.random());
      const sender = shuffled[0];
      const receiver = shuffled[1];

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: sender.email,
          pass: sender.password
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const mailOptions = {
        from: sender.email,
        to: receiver.email,
        subject: `Warm-up: ${Math.random().toString(36).substring(7)}`,
        text: `Hello from ${sender.email} to ${receiver.email}. Warm-up email.`
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`📤 Warm-up email sent from ${sender.email} to ${receiver.email}`);

        db.run(
          `INSERT INTO logs (sender, receiver, status, timestamp) VALUES (?, ?, ?, ?)`,
          [sender.email, receiver.email, 'sent', new Date().toISOString()],
          (err) => {
            if (err) console.error('DB Log Insert Error:', err.message);
          }
        );

        resolve();
      } catch (e) {
        console.error('❌ Email sending failed:', e.message);
        reject(e);
      }
    });
  });
}

// NEW: Send warm-up emails from SINGLE sender account to all saved receivers
async function sendToReceiversFromAccount() {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM accounts LIMIT 1', (err, sender) => {
      if (!sender) return reject('No sender account found');

// ✅ Log here (now sender is defined)
    

      if (err) return reject(err);
      if (!sender) return reject('No sender account found');
      console.log('📡 Attempting to send with:');
    console.log('Email:', sender.email);
    console.log('Password:', sender.password);

      db.all('SELECT * FROM receivers', async (err, receivers) => {
        if (err) return reject(err);
        if (!receivers.length) return reject('No receivers available');

        try {
          for (const receiver of receivers) {
            const transporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST,
              port: process.env.SMTP_PORT,
              secure: false,
              auth: {
                user: sender.email,
                pass: sender.password
              },
              tls: {
                rejectUnauthorized: false
              }
            });

            const mailOptions = {
              from: sender.email,
              to: receiver.email,
              subject: `Warm-up: ${Math.random().toString(36).substring(7)}`,
              text: `Hello ${receiver.email}, this is a scheduled warm-up email.`,
            };

            await transporter.sendMail(mailOptions);

            db.run(
              `INSERT INTO logs (sender, receiver, status, timestamp) VALUES (?, ?, ?, ?)`,
              [sender.email, receiver.email, 'sent', new Date().toISOString()]
            );

            console.log(`📤 Warm-up sent to ${receiver.email}`);
          }
          resolve();
        } catch (e) {
          console.error('❌ Send failed:', e.message);
          reject(e);
        }
      });
    });
  });
}

module.exports = {
  sendToReceiversFromAccount,
  sendWarmUpEmailFromPool,
  sendWarmUpEmail
};
