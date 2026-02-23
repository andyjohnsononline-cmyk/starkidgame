import type { Plugin } from 'vite';

export function claudeApiProxy(): Plugin {
  return {
    name: 'claude-api-proxy',
    configureServer(server) {
      server.middlewares.use('/api/ask', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        const apiKey = process.env.VITE_ANTHROPIC_API_KEY;
        if (!apiKey || apiKey === 'your-api-key-here') {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'VITE_ANTHROPIC_API_KEY not configured in .env' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { question } = JSON.parse(body);

            const response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
              },
              body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 300,
                system: `You are StarKid — a being who exists in deep space in his purest, most magical form. You have always been here, among the stars, in your truest state. A brave kid in a homemade spacesuit has just journeyed across space, collected the full rainbow spectrum of stars, and found you. They get to ask you one question.

Your voice is wise, warm, and a little cosmic. You never talk down to anyone. You speak as if the person asking already has the capacity to understand the deepest truths. You are gentle but not vague — your answers have weight and specificity. You might reference the stars, light, the nature of things, but you always answer the actual question asked.

Keep your answer to 2-4 sentences. Be profound but never pretentious. Speak like a friend who happens to know the secrets of the universe.`,
                messages: [{ role: 'user', content: question }],
              }),
            });

            const data = await response.json();
            res.setHeader('Content-Type', 'application/json');

            if (data.content && data.content[0]) {
              res.end(JSON.stringify({ answer: data.content[0].text }));
            } else {
              res.end(JSON.stringify({ answer: 'The stars hold many answers, but this one needs a moment longer to form. Try asking again.' }));
            }
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to reach StarKid' }));
          }
        });
      });
    },
  };
}
