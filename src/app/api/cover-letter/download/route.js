import { Document, Paragraph, TextRun, AlignmentType, Packer } from 'docx';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { text, jobTitle, company } = await request.json();
  if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 });

  const lines = text.split('\n');

  const children = lines.map((line) => {
    const trimmed = line.trim();
    return new Paragraph({
      children: [new TextRun({ text: trimmed, size: 22, font: 'Calibri' })],
      alignment: AlignmentType.LEFT,
      spacing: { after: trimmed === '' ? 80 : 40 },
    });
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } },
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const filename = `CoverLetter_${company || 'Company'}_${jobTitle || 'Role'}.docx`.replace(/\s+/g, '_');

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
