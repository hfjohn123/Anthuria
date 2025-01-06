import MDSDetail from './MDSDetail.tsx';
import { Row } from '@tanstack/react-table';
import { PDPMPatient } from '../../../types/MDSFinal.ts';

export default function MDSDetailLoading({ row }: { row: Row<PDPMPatient> }) {
  return <MDSDetail row={row} />;
}
