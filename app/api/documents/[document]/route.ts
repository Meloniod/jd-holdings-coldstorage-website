import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const documents = {
  'pitch-deck': {
    fileName: 'Jadan Holdings B2B Pitch Deck.pptx.pdf',
    downloadName: 'jadan-holdings-pitch-deck.pdf',
  },
  'business-plan': {
    fileName: 'Master B2B Business Plan (With Rent-To-Own & Local Suppliers).pdf',
    downloadName: 'jadan-holdings-business-plan.pdf',
  },
} as const;

function drawJadanWatermark(
  page: ReturnType<PDFDocument['getPages']>[number],
  font: Awaited<ReturnType<PDFDocument['embedFont']>>,
) {
  const { width, height } = page.getSize();
  const centerX = width / 2;
  const centerY = height / 2;
  const rotation = Math.PI / 6;
  const armLength = Math.min(width, height) * 0.095;
  const color = rgb(0.16, 0.48, 0.58);
  const opacity = 0.2;

  for (let arm = 0; arm < 6; arm += 1) {
    const angle = rotation + arm * Math.PI / 3;
    const endX = centerX - 125 + Math.cos(angle) * armLength;
    const endY = centerY + Math.sin(angle) * armLength;
    page.drawLine({
      start: { x: centerX - 125, y: centerY },
      end: { x: endX, y: endY },
      thickness: 2.5,
      color,
      opacity,
    });

    if (arm % 2 === 0) {
      const branchX = centerX - 125 + Math.cos(angle) * armLength * 0.62;
      const branchY = centerY + Math.sin(angle) * armLength * 0.62;
      for (const direction of [-1, 1]) {
        const branchAngle = angle + direction * Math.PI / 4;
        page.drawLine({
          start: { x: branchX, y: branchY },
          end: {
            x: branchX + Math.cos(branchAngle) * armLength * 0.3,
            y: branchY + Math.sin(branchAngle) * armLength * 0.3,
          },
          thickness: 2,
          color,
          opacity,
        });
      }
    }
  }

  page.drawText('JADAN HOLDINGS', {
    x: centerX - 92,
    y: centerY - 12,
    size: 25,
    font,
    color,
    opacity,
    rotate: degrees(30),
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { document: string } },
) {
  if (!Object.hasOwn(documents, params.document)) {
    return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
  }

  const document = documents[params.document as keyof typeof documents];
  const source = await readFile(path.join(process.cwd(), 'business_docs', document.fileName));
  const pdf = await PDFDocument.load(source);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  for (const page of pdf.getPages()) {
    drawJadanWatermark(page, font);
  }

  const watermarkedPdf = await pdf.save();
  const download = request.nextUrl.searchParams.get('download') === '1';

  return new NextResponse(Buffer.from(watermarkedPdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${document.downloadName}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
