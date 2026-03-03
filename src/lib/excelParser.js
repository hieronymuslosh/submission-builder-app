import * as XLSX from 'xlsx';

const norm = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();

export const detectTemplate = (wb) => {
  const appSheet = wb?.Sheets?.['App Form'];
  if (!appSheet) return null;

  const rows = XLSX.utils.sheet_to_json(appSheet, { header: 1, raw: false, blankrows: false });

  const has = (label) => rows.some((r) => (r || []).some((c) => norm(c).toLowerCase() === label.toLowerCase()));

  // Minimal key labels for the “standard-v1” template
  const required = ['Insured Name', 'Mailing Address', 'Inception Date (dd/mm/yy)', 'Website', 'Business Type'];
  if (required.every(has)) return 'standard-v1';

  return null;
};

export const getValueRightOfLabel = (rows, label, { maxOffset = 3 } = {}) => {
  const target = label.toLowerCase();
  for (const r of rows || []) {
    if (!r) continue;
    for (let c = 0; c < r.length; c++) {
      if (norm(r[c]).toLowerCase() === target) {
        const end = Math.min(r.length, c + 1 + maxOffset);
        for (let k = c + 1; k < end; k++) {
          const v = norm(r[k]);
          if (v) return v;
        }
      }
    }
  }
  return '';
};

export const getValueBelowLabel = (rows, label, { maxDepth = 3 } = {}) => {
  const target = label.toLowerCase();
  for (let r = 0; r < (rows || []).length; r++) {
    const row = rows[r] || [];
    for (let c = 0; c < row.length; c++) {
      if (norm(row[c]).toLowerCase() === target) {
        const end = Math.min(rows.length, r + 1 + maxDepth);
        for (let k = r + 1; k < end; k++) {
          const v = norm((rows[k] || [])[c]);
          if (v) return v;
        }
      }
    }
  }
  return '';
};

export const extractFieldsFromTemplate = (wb) => {
  const template = detectTemplate(wb);
  if (!template) return { template: null, fields: {} };

  const fields = {};

  // App Form mappings
  const app = wb.Sheets['App Form'];
  const appRows = XLSX.utils.sheet_to_json(app, { header: 1, raw: false, blankrows: false });

  const labels = [
    'Insured Name',
    'Mailing Address',
    'Country of Origin',
    'Inception Date (dd/mm/yy)',
    'Interest',
    'Business Type',
    'Business Decription',
    'Website',
    'Estimated Sales per annum',
  ];
  const labelSet = new Set(labels.map((l) => l.toLowerCase()));

  const pickValue = (label) => {
    const right = getValueRightOfLabel(appRows, label, { maxOffset: 2 });
    if (right && !labelSet.has(right.toLowerCase())) return right;

    const below = getValueBelowLabel(appRows, label, { maxDepth: 2 });
    if (below && !labelSet.has(below.toLowerCase())) return below;

    return '';
  };

  fields.insuredName = pickValue('Insured Name');
  fields.insuredAddress = pickValue('Mailing Address');
  fields.insuredWebsite = pickValue('Website');
  fields.inceptionDateRaw = pickValue('Inception Date (dd/mm/yy)');
  fields.interest = pickValue('Interest');
  fields.businessType = pickValue('Business Type');
  fields.estimatedSalesRaw = pickValue('Estimated Sales per annum');

  // SOV mappings (best-effort)
  const sov = wb.Sheets['SOV'];
  if (sov) {
    const sovRows = XLSX.utils.sheet_to_json(sov, { header: 1, raw: false, blankrows: false });

    // Try to locate TOTAL row, then pick last two columns in that row as max/avg stock.
    const totalRow = sovRows.find((r) => norm(r?.[0]).toLowerCase() === 'total');
    if (totalRow) {
      const cleaned = totalRow.map((v) => norm(v));
      // heuristic: last two numeric-ish entries
      const nums = cleaned.filter((v) => v && /[0-9]/.test(v));
      if (nums.length >= 2) {
        fields.sovTotalMaxStock = nums[nums.length - 2];
        fields.sovTotalAvgStock = nums[nums.length - 1];
      }
    }
  }

  return { template, fields };
};

// v1: parse an Excel file into a flat text representation
// Returns:
//  - rawText: string (sheet name + TSV rows)
//  - workbookMeta: { sheetNames, fileName, fileSize, fileType, template }
//  - workbook: the parsed workbook (used for deterministic template extraction)
export async function parseExcelToSubmission(file) {
  if (!file) throw new Error('No file provided');

  const arrayBuffer = await file.arrayBuffer();

  const workbook = XLSX.read(arrayBuffer, {
    type: 'array',
    cellDates: true,
  });

  const sheetNames = workbook.SheetNames || [];

  const parts = [];
  for (const name of sheetNames) {
    const ws = workbook.Sheets[name];
    if (!ws) continue;

    const tsv = XLSX.utils.sheet_to_csv(ws, {
      FS: '\t',
      RS: '\n',
      blankrows: false,
    });

    parts.push(`=== SHEET: ${name} ===`);
    parts.push(tsv);
    parts.push('');
  }

  const template = detectTemplate(workbook);

  return {
    rawText: parts.join('\n'),
    workbook,
    workbookMeta: {
      sheetNames,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      template,
    },
  };
}
