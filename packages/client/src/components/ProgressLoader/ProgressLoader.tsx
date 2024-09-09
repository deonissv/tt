import { useMemo } from 'react';

export interface ProgressLoaderProps {
  loaded: number;
  total: number;
  title?: string;
}

export const ProgressLoader = ({ loaded, total, title = 'Progress' }: ProgressLoaderProps) => {
  const clampedPercent = useMemo(() => Math.min(loaded / total, 1) * 100, [loaded, total]);

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-accent">
              {title}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-accent">
              {loaded} / {total}{' '}
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-white">
          <div
            style={{ width: `${clampedPercent}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-accent"
          ></div>
        </div>
      </div>
    </div>
  );
};
