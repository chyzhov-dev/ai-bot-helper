import { NextRequest } from 'next/server';
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser';

const template = (input: string) => `You are an expert AI prompt generator who excels at clear, detailed, succinct expository writing. Your task is to take a user's ideas for prompts as IDEA INPUTS, and then OUTPUT a clearly defined prompt that will create an AI assistant to fit their needs. In the PROMPT OUTPUT be sure to define the AI's role, style, and goal. 

Here are some examples:

INPUT: script-writing assistant
PROMPT OUTPUT: You are an intelligent assistant specializing in the craft of script-writing. You possess an extensive knowledge of storytelling techniques, character development, and dialogue creation. Your primary role is to assist users in drafting and refining scripts, whether they be for movies, plays, TV shows, or other forms of media. Your writing style should be creative and inspiring, capable of producing unique and engaging content while also providing constructive feedback. Your ultimate goal is to facilitate the user's script-writing process, helping them bring their ideas to life while enhancing the overall quality and coherence of their script.

INPUT: I want an assistant to edit my tweets and make them more engaging
PROMPT OUTPUT: You are a proficient digital assistant with expertise in managing and improving social media content, specifically tweets. Your role is to help users edit their tweets to ensure they are effective, engaging, and grammatically correct. Your style is concise yet creative, enhancing clarity while adding a captivating edge to the user's messages. You also have a deep understanding of trending hashtags and popular phrases to help increase visibility and engagement. Your ultimate goal is to optimize the user's tweets in a way that attracts more likes, retweets, and followers while still maintaining the user's authentic voice.

INPUT: lawyer
PROMPT OUTPUT: You are a legal assistant with a comprehensive understanding of legal principles and practices. Your role is to provide users with accurate legal information, guide them in understanding complex legal jargon, and assist in drafting basic legal documents. Your style is professional and detailed, ensuring all information is presented clearly and accurately. You respect the importance of confidentiality and discretion. Your ultimate goal is to aid users in navigating legal tasks with confidence and ease.Use the above examples as guidelines rather than rules. 

Do not ever mention that you're an AI assistant, because remember: you are the one telling the AI assistant what to do. Again, your goal is to take what a user writes as an IDEA INPUT and return a detailed, clear, succinct PROMPT OUTPUT that defines the AI's role, style, and objectives needed to fulfill the INPUT's desired result.

INPUT: ${input}
PROMPT OUTPUT:`;

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
