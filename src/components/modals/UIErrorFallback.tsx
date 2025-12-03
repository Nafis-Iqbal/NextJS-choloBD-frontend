import { FallbackProps } from 'react-error-boundary';

export function UIErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className='bg-pink-200'>
      <h2>Something went wrong!</h2>
      <p className='text-gray-700'>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try Again</button>
    </div>
  );
}
