// imapService.js
const imapSimple = require('imap-simple');
const { sendWarmUpEmail } = require('./emailService');

const imapConfig = {
  imap: {
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASS,
    host: 'imap.gmail.com', // Replace with your IMAP host
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }, 
    authTimeout: 3000,
  },
};

async function checkAndReply() {
    console.log('📩 checkAndReply() function triggered');
  try {
    const connection = await imapSimple.connect(imapConfig);
    await connection.openBox('INBOX');

    const searchCriteria = ['UNSEEN'];
    const fetchOptions = { bodies: ['HEADER'], markSeen: true };

    const messages = await connection.search(searchCriteria, fetchOptions);

    for (const msg of messages) {
      const all = msg.parts.find(part => part.which === 'HEADER');
      const fromHeader = all.body.from[0];
      const fromEmailMatch = fromHeader.match(/<(.+)>/);
      const fromEmail = fromEmailMatch ? fromEmailMatch[1] : fromHeader;

await sendWarmUpEmail(process.env.SMTP_USER, fromEmail, 'replied');
      console.log(`Replied to ${fromEmail}`);
    }

    connection.end();
  } catch (err) {
    console.error('IMAP check error:', err);
  }
}

module.exports = { checkAndReply };
