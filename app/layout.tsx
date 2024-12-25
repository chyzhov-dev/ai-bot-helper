import '../global.css';
import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Idea AI',
  description:
    'Idea AI is an innovative application that generates mobile app concepts based on user-provided prompts. Simply input your idea, and Idea AI transforms it into a fully conceptualized mobile application, helping streamline the app creation process.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
