import * as XLSX from 'xlsx';

// v1: parse an Excel file into a flat text representation
// Returns:
//  - rawText: string (sheet name + TSV rows)
//  - workbookMeta: { sheetNames, fileName, fileSize, fileType }
export async function parseExcelToSubmission(file) {
  if (!file) throw new Error('No file provided');

  const arrayBuffer = await file.arrayBuffer();

  const wb = XLSX.read(arrayBuffer, {
    type: 'array',
    cellDates: true,
  });

  const sheetNames = wb.SheetNames || [];

  const parts = [];
  for (const name of sheetNames) {
    const ws = wb.Sheets[name];
    if (!ws) continue;

    // TSV keeps things readable + regex-friendly.
    const tsv = XLSX.utils.sheet_to_csv(ws, {
      FS: '\t',
      RS: '\n',
      blankrows: false,
    });

    parts.push(`=== SHEET: ${name} ===`);
    parts.push(tsv);
    parts.push('');
  }

  return {
    rawText: parts.join('\n'),
    workbookMeta: {
      sheetNames,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    },
  };
}
