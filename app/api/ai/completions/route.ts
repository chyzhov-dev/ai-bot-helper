import { NextRequest } from 'next/server';
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser';

const template = (
  input: string,
) => `You are an expert prompt engineer specializing in converting app ideas into detailed development specifications for mobile applications. Your task is to take a user's app ideas as IDEA INPUTS and transform them into comprehensive PROMPT OUTPUTS that will guide the creation of functional mobile applications.

Here are some examples:

INPUT: A habit tracking app that uses gamification
PROMPT OUTPUT: Create a mobile application that helps users build positive habits through gamification elements. The app should feature a clean, modern interface with:

User profiles to track individual progress
Daily habit tracking with streaks and checkmarks
Achievement system with badges and levels
Point-based rewards for completing tasks
Social features for friendly competition
Progress visualization through charts and graphs
The visual style should be vibrant and engaging, using a color scheme that promotes motivation. Include subtle animations for completing tasks and earning rewards. Prioritize intuitive navigation and quick daily check-ins to maintain user engagement.

INPUT: Recipe manager with shopping list integration
PROMPT OUTPUT: Develop a mobile application for comprehensive recipe management that seamlessly connects meal planning with grocery shopping. Core features should include:

Recipe database with search and filtering capabilities
Ingredient parsing and automatic shopping list generation
Meal planning calendar with drag-and-drop functionality
Smart quantity calculations based on serving sizes
Barcode scanning for adding pantry items
Integration with popular grocery delivery services
The interface should emphasize food photography and use an elegant, minimal design that makes cooking instructions easy to follow. Focus on creating a seamless flow between recipe discovery, meal planning, and shopping list creation.

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
