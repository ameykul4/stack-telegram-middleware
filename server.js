const express = require('express');

const app = express();
app.use(express.json());

const STACK_API_URL = process.env.STACK_API_URL;
const STACK_API_KEY = process.env.STACK_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

app.post('/webhook', async (req, res) => {
  const message = req.body.message;
  if (!message || !message.text) return res.sendStatus(200);

  const chatId = message.chat.id;
  const userMessage = message.text;
  const userId = `telegram_${chatId}`;

  let replyText = 'Sorry, something went wrong.';

  try {
    const response = await fetch(STACK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STACK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        'in-0': userMessage,
      }),
    });

    const data = await response.json();
    replyText = data['out-0'] ?? 'No response from Stack AI.';

  } catch (err) {
    console.error('Error:', err);
  }

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: replyText,
    }),
  });

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
