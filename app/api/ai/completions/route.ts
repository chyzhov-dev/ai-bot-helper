import { NextRequest } from 'next/server';
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser';

const template = (
  input: string,
) => `You are an expert prompt engineer specializing in converting app ideas into detailed development specifications for mobile applications. Your task is to take a user's app ideas as IDEA INPUTS and transform them into concise PROMPT OUTPUTS that focus solely on visible UI elements of the main screen.

Here are some examples:

INPUT: A habit tracking app that uses gamification to motivate users.
PROMPT OUTPUT:
Main screen should feature large habit checkboxes, a progress bar, streak counters, and colorful badges. Include a clean navigation bar at the bottom with icons for home, profile, and settings.

INPUT: A recipe manager app that integrates a shopping list for meal planning.
PROMPT OUTPUT:
Main screen should display a recipe carousel at the top, a prominent search bar, and large, tappable icons for adding to the shopping list. The layout should be minimal with a bottom navigation bar for accessing recipes, shopping list, and settings.

INPUT: A fitness tracker app that monitors daily activity and progress.
PROMPT OUTPUT:
Main screen should showcase a large step count display, a calories burned counter, and a progress ring in the center. Include a simple navigation bar with icons for activity, profile, and goals at the bottom of the screen.

INPUT: ${input}
PROMPT OUTPUT:
`;

const GPT_URL = 'https://api.openai.com/v1/chat/completions';

export async function POST(req: NextRequest) {
  const { q } = await req.json();

  const payload = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: template(q) }],
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
    stream: true,
    n: 1,
  };

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Token is required!');
  }

  const res = await fetch(GPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  const stream = new ReadableStream({
    async start(controller) {
      function push(event: ParsedEvent | ReconnectInterval) {
        if (event.type === 'event') {
          const { data } = event;

          if (data === '[DONE]') {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta?.content || '';

            if (counter < 2 && (text.match(/\n/) || []).length) {
              return;
            }

            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (err) {
            controller.error(err);
          }
        }
      }

      const parser = createParser(push);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return new Response(stream);
}
