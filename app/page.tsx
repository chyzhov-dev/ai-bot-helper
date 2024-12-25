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
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onUserPromptChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setUserPrompt(e.target.value);
  };

  const onPromptChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setPrompt(e.target.value);
  };

  const onBackClick = () => {
    setStep((prev) => prev - 1);
    setPreviewUrl(null);
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
      })
      .finally(() => setIsLoading(false));
  };

  const onBuildChatClick = () => {
    setModalOpen(true);
  };

  const onGetAppPreviewClick = async () => {
    setPreviewLoading(true);

    fetch('/api/ai/images', {
      method: 'POST',
      body: JSON.stringify({ q: prompt }),
    })
      .then((res) => res.json())
      .then(({ url }) => {
        setPreviewUrl(url);
        setStep(2);
      })
      .catch(() => setPreviewLoading(false));
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
                <Button
                  variant="primary"
                  onClick={onGetAppPreviewClick}
                  isLoading={previewLoading}
                  disabled={previewLoading}
                >
                  Get app preview
                </Button>
                <Button
                  variant="secondary"
                  disabled={previewLoading}
                  onClick={onBackClick}
                >
                  Back
                </Button>
              </div>
            </Step>
          )}
          {step === 2 && (
            <Step
              title="Step 3"
              subtitle="Look over the preview and build the app"
            >
              {previewUrl && (
                <div
                  className={`relative max-w-full md:max-w-[80%] w-full aspect-square ${
                    previewLoading
                      ? 'animate-pulse bg-gray-300 flex items-center justify-center'
                      : ''
                  }`}
                >
                  <Image
                    alt="Application preview"
                    fill
                    src={previewUrl}
                    style={{ height: '100%', width: '100%' }}
                    onLoadingComplete={() => setPreviewLoading(false)}
                  />
                  {previewLoading && (
                    <svg
                      className="w-8 h-8 stroke-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20.5499 15.15L19.8781 14.7863C17.4132 13.4517 16.1808 12.7844 14.9244 13.0211C13.6681 13.2578 12.763 14.3279 10.9528 16.4679L7.49988 20.55M3.89988 17.85L5.53708 16.2384C6.57495 15.2167 7.09388 14.7059 7.73433 14.5134C7.98012 14.4396 8.2352 14.4011 8.49185 14.3993C9.16057 14.3944 9.80701 14.7296 11.0999 15.4M11.9999 21C12.3154 21 12.6509 21 12.9999 21C16.7711 21 18.6567 21 19.8283 19.8284C20.9999 18.6569 20.9999 16.7728 20.9999 13.0046C20.9999 12.6828 20.9999 12.3482 20.9999 12C20.9999 11.6845 20.9999 11.3491 20.9999 11.0002C20.9999 7.22883 20.9999 5.34316 19.8283 4.17158C18.6568 3 16.7711 3 12.9998 3H10.9999C7.22865 3 5.34303 3 4.17145 4.17157C2.99988 5.34315 2.99988 7.22877 2.99988 11C2.99988 11.349 2.99988 11.6845 2.99988 12C2.99988 12.3155 2.99988 12.651 2.99988 13C2.99988 16.7712 2.99988 18.6569 4.17145 19.8284C5.34303 21 7.22921 21 11.0016 21C11.3654 21 11.7021 21 11.9999 21ZM7.01353 8.85C7.01353 9.84411 7.81942 10.65 8.81354 10.65C9.80765 10.65 10.6135 9.84411 10.6135 8.85C10.6135 7.85589 9.80765 7.05 8.81354 7.05C7.81942 7.05 7.01353 7.85589 7.01353 8.85Z"
                        stroke="stroke-current"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>
              )}

              {!previewUrl && (
                <span className="bg-red-400">Something went wrong</span>
              )}
              <div className="flex gap-2">
                <Button variant="primary" onClick={onBuildChatClick}>
                  Build application
                </Button>
                <Button variant="secondary" onClick={onBackClick}>
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
