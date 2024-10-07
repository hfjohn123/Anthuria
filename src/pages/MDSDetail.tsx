import { Row } from '@tanstack/react-table';
import { MDSFinal } from '../types/MDSFinal.ts';

export default function MDSDetail({ row }: { row: Row<MDSFinal> }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 px-3 text-sm py-4 flex flex-col gap-5"></div>
  );
}
