import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { UploadedFile, CoverSheetData } from '../types';

export const mergePDFs = async (files: UploadedFile[], coverSheet?: CoverSheetData): Promise<Uint8Array> => {
  try {
    const mergedPdf = await PDFDocument.create();
    
    // Embed font for text
    const font = await mergedPdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

    // 1. Generate Cover Sheet if requested
    if (coverSheet) {
      const page = mergedPdf.addPage();
      const { width, height } = page.getSize();
      
      const titleSize = 24;
      const textSize = 12;
      const margin = 50;

      // Draw Title
      page.drawText(coverSheet.title, {
        x: margin,
        y: height - margin - titleSize,
        size: titleSize,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.2),
      });

      // Draw Summary
      const summaryLines = coverSheet.summary.split('\n');
      let currentY = height - margin - titleSize - 40;

      for (const line of summaryLines) {
        // Simple wrapping logic could go here, but for now we trust the summary is reasonably formatted or we truncate
        // This is a basic implementation.
        page.drawText(line, {
            x: margin,
            y: currentY,
            size: textSize,
            font: font,
            color: rgb(0.2, 0.2, 0.2),
            maxWidth: width - (margin * 2),
            lineHeight: 18,
        });
        currentY -= 20;
      }

      // Draw File List
      currentY -= 40;
      page.drawText("Documents in this package:", {
        x: margin,
        y: currentY,
        size: 14,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      currentY -= 25;

      files.forEach((f, index) => {
          if (currentY < 50) {
              // Basic pagination for cover sheet could go here, simply stopping for this demo
              return;
          }
          page.drawText(`${index + 1}. ${f.file.name} (${(f.file.size / 1024).toFixed(1)} KB)`, {
            x: margin + 10,
            y: currentY,
            size: 10,
            font: font,
            color: rgb(0.3, 0.3, 0.3),
          });
          currentY -= 15;
      });
    }

    // 2. Merge Uploaded Files
    for (const uploadedFile of files) {
      const fileBytes = await uploadedFile.file.arrayBuffer();
      // Load the source PDF
      // We wrap this in try/catch in case a file is corrupt
      try {
        const pdf = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      } catch (err) {
        console.error(`Error loading PDF ${uploadedFile.file.name}:`, err);
        // We could add an error page here to the PDF indicating failure for this specific file
        const errorPage = mergedPdf.addPage();
        errorPage.drawText(`Failed to load file: ${uploadedFile.file.name}`, {
            x: 50,
            y: 500,
            size: 12,
            font: font,
            color: rgb(1, 0, 0)
        });
      }
    }

    const pdfBytes = await mergedPdf.save();
    return pdfBytes;
  } catch (error) {
    console.error("Merge failed", error);
    throw new Error("Failed to merge PDFs. Please check if the files are valid PDFs.");
  }
};