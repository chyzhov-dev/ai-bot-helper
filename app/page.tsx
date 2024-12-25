'use client';

import { ChangeEventHandler, useState } from 'react';
import Image from 'next/image';
import Modal from '@/components/ui/modal';
import Button from '@/components/ui/button';
import Step from '@/components/step';

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [step, setStep] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const onUserPromptChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setUserPrompt(e.target.value);
  };

  const onPromptChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setPrompt(e.target.value);
  };

  const onBackClick = () => {
    setStep(0);
  };

  const onCloseModal = () => {
    setModalOpen(false);
  };

  const onUserPromptClick = () => {
    setIsLoading(true);
    setPrompt('');
    fetch('/api/ai/completions', {
      method: 'POST',
      body: JSON.stringify({ q: userPrompt }),
    })
      .then(async (res) => {
        const data = res.body;

        if (!data) return;

        const reader = data.getReader();
        const decoder = new TextDecoder();

        setStep(1);

        const interval = setInterval(async () => {
          const chunk = await reader.read();
          setPrompt((prev) => prev + decoder.decode(chunk.value));

          if (chunk.done) {
            clearInterval(interval);
          }
        }, 10);

        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  const onBuildChatClick = () => {
    setModalOpen(true);
  };

  return (
    <div className="h-screen w-screen flex bg-cream md:bg-transparent p-2 md:p-0">
      <div className="w-6/12 h-full bg-cream flex-col items-center gap-4 justify-center p-8 lg:p-16 hidden md:flex">
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
      <div className="w-full md:w-6/12 md:border-l-2 h-full border-black flex flex-col gap-6 justify-center items-center md:p-8 lg:p-16">
        <div className="h-full flex flex-col gap-4 justify-center items-center w-full">
          {step === 0 && (
            <Step subtitle="Turn your idea into a prompt" title="Step 1">
              <textarea
                placeholder="In a phrase or two, describe what you want your bot to be good at."
                className="w-full min-h-20 border border-black p-2 placeholder-half-black focus:border-black resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                value={userPrompt}
                disabled={isLoading}
                onChange={onUserPromptChange}
              />
              <Button
                onClick={onUserPromptClick}
                variant="primary"
                disabled={!userPrompt.trim()}
                isLoading={isLoading}
              >
                Get your prompt
              </Button>
            </Step>
          )}
          {step === 1 && (
            <Step
              title="Step 2"
              subtitle="Look over your prompt, polish it, and get the preview"
            >
              <textarea
                className="w-full min-h-60 border border-black p-2 focus:border-black resize-none"
                value={prompt}
                onChange={onPromptChange}
              />
              <div className="flex gap-2">
                <Button variant="primary" onClick={onBuildChatClick}>
                  Get app preview
                </Button>
                <Button
                  variant="secondary"
                  disabled={!prompt.trim().length}
                  onClick={onBackClick}
                >
                  Back
                </Button>
              </div>
            </Step>
          )}
        </div>
      </div>
      <Modal
        isOpen={modalOpen}
        title="In demo version application build is not available"
        onClose={onCloseModal}
      />
    </div>
  );
}
