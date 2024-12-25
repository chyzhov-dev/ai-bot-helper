import Button from '@/components/ui/button';
import { ReactNode } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
};

export default function Modal({
  isOpen,
  onClose,
  title = '',
  children,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-2">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl w-full font-semibold text-gray-800 text-center">
            {title}
          </h2>
        </div>
        <div>{children}</div>
        <Button
          onClick={onClose}
          variant="secondary"
          className="flex mx-auto mt-4"
        >
          Close
        </Button>
      </div>
    </div>
  );
}

Modal.defaultProps = {
  children: null,
};
