import { Spinner } from './Spinner';

interface LoaderProps {
  fullScreen?: boolean;
  message?: string;
  variant?: 'default' | 'gradient';
}

export const Loader = ({ fullScreen = true, message = 'Cargando...', variant = 'default' }: LoaderProps) => {
  const containerClasses = fullScreen
    ? variant === 'gradient'
      ? 'fixed inset-0 bg-gradient-to-br from-primary-600 to-primary-700 z-50'
      : 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50'
    : 'w-full py-12';

  const textColor = variant === 'gradient' ? 'text-white' : 'text-gray-600';
  const spinnerClass = variant === 'gradient' ? 'border-white/30 border-t-white' : '';

  return (
    <div className={`${containerClasses} flex flex-col items-center justify-center animate-fade-in`}>
      <Spinner size="lg" className={spinnerClass} />
      {message && (
        <p className={`mt-4 ${textColor} text-sm font-medium`}>{message}</p>
      )}
    </div>
  );
};
