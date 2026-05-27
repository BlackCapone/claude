export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
 
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'No API key' });
 
  try {
    const upstream = await fetch('https://api.claude-ai.shop/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
 
    const raw = await upstream.text();
    console.log('status:', upstream.status, 'body:', raw);
 
    let data;
    try { data = JSON.parse(raw); }
    catch { return res.status(502).json({ error: { message: 'Bad JSON from upstream: ' + raw.slice(0,200) } }); }
 
    // extract text from either Anthropic or OpenAI format
    const text =
      data?.content?.[0]?.text ||
      data?.choices?.[0]?.message?.content ||
      null;
 
    if (text !== null) {
      data._text = text;
    }
 
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(502).json({ error: { message: e.message } });
  }
}
