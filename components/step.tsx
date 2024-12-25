import Image from 'next/image';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  title: string;
  subtitle: string;
};

export default function Step({ children, title, subtitle }: Props) {
  return (
    <div className="flex flex-col gap-4 items-start w-full justify-start">
      <div className="flex gap-2">
        <Image width={24} height={24} src="/icons/zap.svg" alt="zap-icon" />
        <h3 className="font-bold text-2xl">{title}</h3>
      </div>
      <h3>{subtitle}</h3>
      {children}
    </div>
  );
}
