'use client';

import { ChangeEventHandler, useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');

  const onUserPromptChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setUserPrompt(e.target.value);
  };

  const onPromptChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setPrompt(e.target.value);
  };

  const onUserPromptClick = () => {
    setIsLoading(true);
    setPrompt('');
    fetch('/api/ai', {
      method: 'POST',
      body: JSON.stringify({ q: userPrompt }),
    }).then(async (res) => {
      const data = res.body;

      if (!data) return;

      const reader = data.getReader();
      const decoder = new TextDecoder();

      const interval = setInterval(async () => {
        const chunk = await reader.read();
        setPrompt((prev) => prev + decoder.decode(chunk.value));

        if (chunk.done) {
          clearInterval(interval);
        }
      }, 10);

      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  };

  return (
    <div className="h-screen w-screen flex">
      <div className="w-6/12 h-full bg-cream flex flex-col items-center gap-4 justify-center p-16">
        <Image
          src="/images/robot-girl.svg"
          alt="robot-girl"
          width={1000}
          height={1000}
        />
        <h2 className="text-center text-3xl font-bold">
          Create your own AI app with our wizard
        </h2>
      </div>
      <div className="w-6/12 border-l-2 h-full border-black flex flex-col gap-6 justify-center items-center p-16">
        <div className="h-full flex flex-col gap-4 justify-center items-center w-full">
          <div className="flex flex-col gap-4 items-start w-full justify-start">
            <div className="flex gap-2 w-full">
              <Image width={24} height={24} src="/icons/zap.svg" alt="zap-icon" />
              <h3 className="font-bold text-2xl">Step 1</h3>
            </div>
            <h3>Turn your idea into a prompt</h3>
            <textarea
              placeholder="In a phrase or two, describe what you want your bot to be good at."
              className="w-full min-h-20 border border-black p-2 placeholder-half-black focus:border-black resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              value={userPrompt}
              disabled={isLoading}
              onChange={onUserPromptChange}
            />
            <button
              type="button"
              className="w-fit px-10 py-4 border-r-2 text-base bg-black text-white flex items-center gap-2 relative"
              onClick={onUserPromptClick}
            >
              {isLoading && (
                <div className="w-4 h-4 flex items-center justify-center absolute left-4">
                  <div className="loader w-4 h-4 border-t-4 border-b-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin" />
                </div>
              )}
              Get your prompt
            </button>
          </div>
          {prompt && (
            <div className="flex flex-col gap-4 items-start w-full justify-start">
              <div className="flex gap-2 w-full">
                <Image width={24} height={24} src="/icons/edit.svg" alt="zap-icon" />
                <h3 className="font-bold text-2xl">Step 2</h3>
              </div>
              <h3 className="w-full">
                Look over your prompt, polish it, and turn it into an app
              </h3>
              <textarea
                className="w-full min-h-60 border border-black p-2 focus:border-black resize-none"
                value={prompt}
                onChange={onPromptChange}
              />
              <button
                type="button"
                className="w-fit px-10 py-4 border-r-2 text-base bg-black text-white"
                onClick={onUserPromptClick}
              >
                Build your app
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
