const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3500;

app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const question = req.body?.question;
  if (!question) return res.status(400).json({ error: 'Missing question' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server not configured' });

  try {

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'You are a helpful assistant that answers questions about Gerlie Daga-as based on available public info.' },
                   { role: 'user', content: question }],
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errTxt = await response.text();
      return res.status(502).json({ error: 'Upstream error', details: errTxt });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'No answer from model.';
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => console.log(`Chat proxy running on http://localhost:${port}`));
