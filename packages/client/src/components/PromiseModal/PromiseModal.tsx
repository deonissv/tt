import { useRef, useState } from 'react';

interface PromiseModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
}

export const PromiseModal = ({ title, message, confirmLabel, cancelLabel }: PromiseModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const resolvePromise = useRef<(value: unknown) => void>();

  const openModal = () => {
    setIsOpen(true);
    return new Promise(resolve => {
      resolvePromise.current = resolve;
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    resolvePromise.current!(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolvePromise.current!(false);
  };

  return {
    openModal,
    Modal: () => (
      <>
        {isOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h2 className="text-black text-xl font-semibold mb-4">{title}</h2>
              <p className="mb-6 text-black">{message}</p>
              <div className="flex justify-end space-x-4">
                <button
                  className="bg-[#B23B3B] text-white font-semibold py-2 px-4 rounded hover:bg-[#a12a2a]"
                  onClick={handleConfirm}
                >
                  {confirmLabel}
                </button>
                <button
                  className="bg-gray-500 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700"
                  onClick={handleCancel}
                >
                  {cancelLabel}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    ),
  };
};
