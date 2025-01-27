import DefaultLayout from '../../../layout/DefaultLayout.tsx';
import { useState } from 'react';
// import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import icd_raw_file from './Referral_POC_icd10_raw.pdf';
import icd_res_file from './Referral_POC_icd10_res.pdf';
import meds_raw_file from './Referral_POC_meds_raw.pdf';
import meds_res_file from './Referral_POC_meds_res.pdf';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import Card from '../../../components/Cards/Card.tsx';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { Dropdown } from 'primereact/dropdown';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
};

const Fileoptions = [
  { name: 'ICD10 File', file: icd_raw_file },
  { name: 'Meds File', file: meds_raw_file },
];

export default function FileReader() {
  const [numPages, setNumPages] = useState<number>();
  const [file, setFile] = useState({
    name: 'ICD10 File',
    file: icd_raw_file,
  });
  const [processedFile, setProcessedFile] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
  }
  return (
    <DefaultLayout title="Referral File Reader">
      <div className="flex flex-col gap-5 my-3 sm:my-5 max-w-screen-3xl sm:px-5 mx-auto ">
        <Card className="flex justify-evenly items-center flex-wrap gap-5">
          <div className="sticky top-50 self-start flex flex-col gap-5 justify-center items-center">
            <Dropdown
              value={file}
              onChange={(e) => {
                setFile(e.value);
                setProcessedFile(false);
              }}
              options={Fileoptions}
              optionLabel="name"
              placeholder="Select a File"
              className="w-60"
            />
            <Button
              onClick={() => {
                setFile((prev) => ({
                  name: 'ICD10 File',
                  file:
                    prev.file === icd_raw_file ? icd_res_file : meds_res_file,
                }));

                setProcessedFile(true);
                setLoading(true);
                setTimeout(() => {
                  setLoading(false);
                }, 3000);
              }}
              loading={loading}
              iconPos="right"
              disabled={loading || processedFile}
              label={
                loading ? 'Processing' : processedFile ? 'Processed' : 'Process'
              }
            />
          </div>
          {!loading ? (
            <Document
              file={file.file}
              onLoadSuccess={onDocumentLoadSuccess}
              options={options}
              loading={<Skeleton width="800px" height="1200px"></Skeleton>}
            >
              {Array.from(new Array(numPages), (_el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={800}
                />
              ))}
            </Document>
          ) : (
            <Skeleton width="800px" height="1200px"></Skeleton>
          )}
        </Card>
      </div>
    </DefaultLayout>
  );
}
