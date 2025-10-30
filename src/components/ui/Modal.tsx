import { ReactNode, useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

const Modal = ({ isOpen, onClose, title, children, footer }: ModalProps) => {
  const [animateIn, setAnimateIn] = useState(false);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => setAnimateIn(true));
    } else {
      document.body.style.overflow = 'unset';
      setAnimateIn(false);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className={`fixed inset-0 bg-neutral-100/40 backdrop-blur-sm transition-opacity duration-200 ${animateIn ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
        />

        <div className={`relative glass-panel max-w-2xl w-full max-h-[90vh] flex flex-col transform transition-all duration-200 ease-out ${animateIn ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}`}>
          <div className="sticky top-0 glass-header px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto nice-scroll">
            {children}
          </div>

          {footer && (
            <div className="sticky bottom-0 glass-header px-6 py-4 border-t border-white/30 rounded-b-xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
