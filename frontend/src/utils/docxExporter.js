import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, HeadingLevel,
  convertMillimetersToTwip, PageOrientation, Header,
} from 'docx';

const PT = (pt) => pt * 2; // docx uses half-points
const MM = (mm) => convertMillimetersToTwip(mm);

const FONT = 'Times New Roman';

const noBorder = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
  insideHorizontal: { style: BorderStyle.NONE, size: 0 },
  insideVertical: { style: BorderStyle.NONE, size: 0 },
};

const thinBorder = {
  bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  top: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

function centeredRun(text, { size = 13, bold = false, italic = false, allCaps = false } = {}) {
  return new TextRun({
    text: allCaps ? (text || '').toUpperCase() : (text || ''),
    font: FONT,
    size: PT(size),
    bold,
    italics: italic,
  });
}

function centeredPara(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [centeredRun(text, opts)],
    spacing: { after: 40 },
  });
}

function separatorPara(length = 15) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({ text: '_'.repeat(length), font: FONT, size: PT(10) })],
  });
}

function buildHeaderTable(data) {
  const leftCells = [];
  if (data.ten_co_quan?.cap_tren) {
    const capTren = data.ten_co_quan.cap_tren;
    leftCells.push(centeredPara(capTren, { size: capTren.length > 25 ? 10.5 : 11, allCaps: true }));
  }
  const coQuanChinh = data.ten_co_quan?.chinh || '';
  leftCells.push(centeredPara(coQuanChinh, { size: coQuanChinh.length > 25 ? 10.5 : 11.5, bold: true, allCaps: true }));
  leftCells.push(separatorPara(12));
  leftCells.push(centeredPara(data.so_ky_hieu || '', { size: 13, italic: true }));

  const rightCells = [];
  rightCells.push(centeredPara(data.quoc_hieu?.dong1 || 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', { size: 11.5, bold: true, allCaps: true }));
  rightCells.push(centeredPara(data.quoc_hieu?.dong2 || 'Độc lập - Tự do - Hạnh phúc', { size: 12.5, bold: true }));
  rightCells.push(separatorPara(20));
  rightCells.push(centeredPara(data.dia_danh_thoi_gian || '', { size: 13, italic: true }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            children: leftCells,
          }),
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            borders: noBorder,
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            children: rightCells,
          }),
        ],
      }),
    ],
  });
}

function buildTitleSection(data) {
  const isCongVan = (data.ten_loai || '').toUpperCase() === 'CÔNG VĂN';
  const paragraphs = [];

  paragraphs.push(new Paragraph({ spacing: { before: 200 } })); // blank

  if (!isCongVan) {
    paragraphs.push(centeredPara(data.ten_loai || '', { size: 14, bold: true, allCaps: true }));
    paragraphs.push(centeredPara(data.trich_yeu || '', { size: 13, bold: true }));
    paragraphs.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: '_______', font: FONT, size: PT(10) })],
      spacing: { after: 200 },
    }));
  }

  return paragraphs;
}

function isHeadingLine(line) {
  const trimmed = line.trim();
  if (/^(Điều\s+\d|QUYẾT ĐỊNH|NGHỊ QUYẾT|CHỈ THỊ)/i.test(trimmed)) return true;
  if (/^\*\*.*\*\*$/.test(trimmed)) return true;
  if (/^[IVX]+\.\s/.test(trimmed)) return true;
  if (/^\d+\.\s+[A-ZÀÁẢÃẠ]/.test(trimmed)) return true;
  return false;
}

function isCancuLine(line) {
  return line.trim().startsWith('Căn cứ');
}

function buildContentParagraphs(noiDung) {
  if (!noiDung) return [];
  const lines = noiDung.split('\n');
  return lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      return new Paragraph({ spacing: { after: 100 } });
    }

    // Remove markdown bold markers
    const cleanLine = trimmed.replace(/\*\*/g, '');

    if (isHeadingLine(trimmed)) {
      return new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: MM(12.7) },
        children: [new TextRun({ text: cleanLine, font: FONT, size: PT(13), bold: true })],
        spacing: { after: 60 },
      });
    }

    if (isCancuLine(trimmed)) {
      return new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: MM(12.7) },
        children: [new TextRun({ text: cleanLine, font: FONT, size: PT(13), italics: true })],
        spacing: { after: 60 },
      });
    }

    return new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      indent: { firstLine: MM(12.7) },
      children: [new TextRun({ text: cleanLine, font: FONT, size: PT(13) })],
      spacing: { after: 60 },
    });
  });
}

function buildFooterTable(data, options = {}) {
  const noiNhanChildren = [];
  noiNhanChildren.push(new Paragraph({
    children: [new TextRun({ text: 'Nơi nhận:', font: FONT, size: PT(12), bold: true, italics: true })],
    spacing: { after: 40 },
  }));
  if (data.noi_nhan) {
    data.noi_nhan.forEach(line => {
      noiNhanChildren.push(new Paragraph({
        children: [new TextRun({ text: `- ${line}`, font: FONT, size: PT(11) })],
        spacing: { after: 20 },
      }));
    });
  }

  const signChildren = [];
  signChildren.push(centeredPara(data.ky_ten?.chuc_vu || '', { size: 13, bold: true, allCaps: true }));
  // 3 blank lines for signature space
  signChildren.push(new Paragraph({ spacing: { after: 200 } }));
  signChildren.push(new Paragraph({ spacing: { after: 200 } }));
  signChildren.push(new Paragraph({ spacing: { after: 200 } }));
  signChildren.push(centeredPara(data.ky_ten?.ho_ten || '', { size: 13, bold: true }));

  if (options.includeSignature) {
    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    signChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: `Ký bởi: ${data.ky_ten?.ho_ten || ''} - ${dateStr}`,
        font: FONT, size: PT(9), italics: true, color: '666666',
      })],
    }));
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: noiNhanChildren,
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: signChildren,
          }),
        ],
      }),
    ],
  });
}

/**
 * Generate a .docx Blob from document_data
 * @param {Object} docData - document_data object
 * @param {Object} options - { includeWatermark, includeSignature }
 * @returns {Promise<Blob>}
 */
export async function generateDocx(docData, options = {}) {
  const sectionChildren = [];

  // Header table
  sectionChildren.push(buildHeaderTable(docData));

  // Title section
  sectionChildren.push(...buildTitleSection(docData));

  // Content
  sectionChildren.push(...buildContentParagraphs(docData.noi_dung));

  // Spacing before footer
  sectionChildren.push(new Paragraph({ spacing: { before: 300 } }));

  // Footer
  sectionChildren.push(buildFooterTable(docData, options));

  const sections = [{
    properties: {
      page: {
        size: { width: MM(210), height: MM(297), orientation: PageOrientation.PORTRAIT },
        margin: { top: MM(20), right: MM(15), bottom: MM(20), left: MM(30) },
      },
    },
    children: sectionChildren,
  }];

  // Watermark via header
  if (options.includeWatermark) {
    sections[0].headers = {
      default: new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({
              text: 'BẢN NHÁP',
              font: FONT,
              size: PT(60),
              color: 'D0D0D0',
              bold: true,
            })],
          }),
        ],
      }),
    };
  }

  const doc = new Document({
    sections,
  });

  return await Packer.toBlob(doc);
}

/**
 * Sanitize filename from so_hieu and trich_yeu
 */
export function sanitizeFilename(soHieu, trichYeu) {
  const cleanSoHieu = (soHieu || 'van_ban')
    .replace(/[/\\?%*:|"<>\s]/g, '_')
    .replace(/_+/g, '_');

  const cleanTrichYeu = (trichYeu || '')
    .substring(0, 50)
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  if (!cleanTrichYeu) return cleanSoHieu;
  return `${cleanSoHieu}_${cleanTrichYeu}`;
}
