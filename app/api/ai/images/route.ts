import { NextRequest } from 'next/server';

export const maxDuration = 60;

const template = (
  input: string,
) => `Task: Create a UX/UI design for the main page of a mobile application.

Instructions: Focus solely on the elements displayed on the main page. Do not include any additional details beyond those that should present on the screen.

Application Details: ${input}
`;

const GPT_URL = 'https://api.openai.com/v1/images/generations';

export async function POST(req: NextRequest) {
  const { q } = await req.json();

  const payload = {
    model: 'dall-e-3',
    prompt: template(q),
    n: 1,
    size: '1024x1024',
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

  const json = await res.json();

  return new Response(JSON.stringify({ url: json.data[0]?.url }));
}
