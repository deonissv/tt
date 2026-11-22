import { z } from 'zod';
import { urlString } from './url';

/** Custom PDF object (`ObjectState.CustomPDF`). */
export const CustomPDFStateSchema = z
  .object({
    PDFUrl: urlString(),
    PDFPassword: z.string(),
    PDFPage: z.number(), // Currently open page
    PDFPageOffset: z.number(), // Page number shown for the first PDF page
  })
  .meta({ id: 'CustomPDFState', title: 'CustomPDFState' });

export type CustomPDFState = z.infer<typeof CustomPDFStateSchema>;
