import * as XLSX from 'xlsx';

const norm = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();

const moneyToNumber = (val) => {
  const s = norm(val).replace(/[$,]/g, '');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NaN;
};

const getMergedDisplayValue = (ws, r, c) => {
  // If cell is part of a merge, Excel displays top-left's value.
  const merges = ws?.['!merges'] || [];
  for (const m of merges) {
    if (r >= m.s.r && r <= m.e.r && c >= m.s.c && c <= m.e.c) {
      const addr = XLSX.utils.encode_cell({ r: m.s.r, c: m.s.c });
      const cell = ws[addr];
      return norm(cell?.w ?? cell?.v ?? '');
    }
  }

  const addr = XLSX.utils.encode_cell({ r, c });
  const cell = ws[addr];
  return norm(cell?.w ?? cell?.v ?? '');
};

const findLabelCell = (ws, label, { maxR = 120, maxC = 30 } = {}) => {
  const target = label.toLowerCase();
  for (let r = 0; r < maxR; r++) {
    for (let c = 0; c < maxC; c++) {
      if (getMergedDisplayValue(ws, r, c).toLowerCase() === target) {
        return { r, c };
      }
    }
  }
  return null;
};

const getValueNearLabel = (ws, label, { right = 10, down = 3 } = {}) => {
  const pos = findLabelCell(ws, label);
  if (!pos) return '';

  // Prefer value on same row to the right.
  for (let cc = pos.c + 1; cc <= pos.c + right; cc++) {
    const v = getMergedDisplayValue(ws, pos.r, cc);
    if (v) return v;
  }

  // Fallback: below in same column.
  for (let rr = pos.r + 1; rr <= pos.r + down; rr++) {
    const v = getMergedDisplayValue(ws, rr, pos.c);
    if (v) return v;
  }

  return '';
};

const getFirstValueNearLabel = (ws, labels, opts) => {
  for (const l of labels) {
    const v = getValueNearLabel(ws, l, opts);
    if (v) return v;
  }
  return '';
};

export const detectTemplate = (wb) => {
  const ws = wb?.Sheets?.['App Form'];
  if (!ws) return null;

  // Minimal key labels for the “standard-v1” template
  const required = ['Insured Name', 'Mailing Address', 'Inception Date (dd/mm/yy)', 'Website', 'Business Type'];
  const ok = required.every((l) => findLabelCell(ws, l));

  return ok ? 'standard-v1' : null;
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

  // App Form mappings (merged-cell aware, bounded search)
  const app = wb.Sheets['App Form'];

  fields.insuredName = getValueNearLabel(app, 'Insured Name', { right: 10, down: 3 });
  fields.insuredAddress = getValueNearLabel(app, 'Mailing Address', { right: 10, down: 3 });
  fields.insuredWebsite = getValueNearLabel(app, 'Website', { right: 10, down: 3 });
  fields.inceptionDateRaw = getValueNearLabel(app, 'Inception Date (dd/mm/yy)', { right: 10, down: 3 });
  fields.interest = getValueNearLabel(app, 'Interest', { right: 10, down: 3 });
  fields.businessType = getValueNearLabel(app, 'Business Type', { right: 10, down: 3 });
  fields.estimatedSalesRaw = getValueNearLabel(app, 'Estimated Sales per annum', { right: 10, down: 3 });

  // Deductibles + limits (template-based)
  // NOTE: dummy.xlsx may not include these yet; values will be blank if labels are absent.
  fields.deductibleAOPStockRaw = getFirstValueNearLabel(app, [
    'AOP (Stock) Deductible',
    'AOP (Stock) deductible',
    'AOP Deductible',
    'AOP (Stock)',
  ]);
  fields.deductibleCATStockRaw = getFirstValueNearLabel(app, [
    'CAT (EQ/Flood/Wind) Deductible',
    'CAT Deductible',
    'CAT (Earthquake, Flood and Windstorm) Deductible',
    'CAT (EQ/Flood/Wind)',
  ]);
  fields.deductibleTransitRaw = getFirstValueNearLabel(app, [
    'Transit Deductible',
    'Deductible (Transit)',
    'Transit',
  ]);

  fields.limitAOPStockRaw = getFirstValueNearLabel(app, [
    'AOP (Stock) Limit',
    'AOP Limit',
    'Limit AOP (Stock)',
  ]);
  fields.limitCATStockRaw = getFirstValueNearLabel(app, [
    'CAT (EQ/Flood/Wind) Limit',
    'CAT Limit',
    'Limit CAT (EQ/Flood/Wind)',
  ]);
  fields.limitTransitRaw = getFirstValueNearLabel(app, [
    'Transit Limit',
    'Limit (Transit)',
    'Limit Transit',
  ]);

  // Transit (App Form)
  // In this template it appears as "Maximum value per sending:" (merged value cell)
  fields.maxValueAnyOneConveyanceRaw = getValueNearLabel(app, 'Maximum value per sending:', { right: 10, down: 3 });
  fields.averageValueAnyOneConveyanceRaw = getValueNearLabel(app, 'Average value per sending:', { right: 10, down: 3 });

  // Transit volumes + splits
  fields.incomingTransitVolumeTotalRaw = getValueNearLabel(app, 'Total annual values received:', { right: 12, down: 3 });
  fields.outgoingTransitVolumeTotalRaw = getValueNearLabel(app, 'Total annual values dispatched:', { right: 12, down: 3 });

  // These labels appear multiple times (incoming + outgoing). We capture by scanning positions + reading right.
  const insuredRespPositions = [];
  const supplierRespPositions = [];
  const customerRespPositions = [];

  // Domestic/international split labels
  const domesticOriginPositions = [];
  const intlOriginPositions = [];
  const domesticDestPositions = [];
  const intlDestPositions = [];

  {
    const maxR = 160;
    const maxC = 30;
    const getMerged = (r, c) => getMergedDisplayValue(app, r, c);

    for (let r = 0; r < maxR; r++) {
      for (let c = 0; c < maxC; c++) {
        const t = getMerged(r, c).toLowerCase();
        if (!t) continue;

        if (t === '% insured responsible for insurance') insuredRespPositions.push({ r, c });
        if (t === '% supplier responsible for insurance') supplierRespPositions.push({ r, c });
        if (t === '% customer responsible for insurance') customerRespPositions.push({ r, c });

        if (t === 'domestic points of origin') domesticOriginPositions.push({ r, c });
        if (t === 'international points of origin') intlOriginPositions.push({ r, c });
        if (t === 'domestic destinations') domesticDestPositions.push({ r, c });
        if (t === 'international destinations') intlDestPositions.push({ r, c });
      }
    }

    const readRight = (pos) => {
      for (let cc = pos.c + 1; cc <= pos.c + 10; cc++) {
        const v = getMerged(pos.r, cc);
        if (v) return v;
      }
      return '';
    };

    // Incoming (first occurrence)
    fields.incomingPrimaryPctRaw = insuredRespPositions[0] ? readRight(insuredRespPositions[0]) : '';
    fields.incomingContingentPctRaw = supplierRespPositions[0] ? readRight(supplierRespPositions[0]) : '';

    // Outgoing (second occurrence)
    fields.outgoingPrimaryPctRaw = insuredRespPositions[1] ? readRight(insuredRespPositions[1]) : '';
    fields.outgoingContingentPctRaw = customerRespPositions[0] ? readRight(customerRespPositions[0]) : '';

    // Incoming domestic/international
    fields.incomingDomesticPctRaw = domesticOriginPositions[0] ? readRight(domesticOriginPositions[0]) : '';
    fields.incomingInternationalPctRaw = intlOriginPositions[0] ? readRight(intlOriginPositions[0]) : '';

    // Outgoing domestic/international
    fields.outgoingDomesticPctRaw = domesticDestPositions[0] ? readRight(domesticDestPositions[0]) : '';
    fields.outgoingInternationalPctRaw = intlDestPositions[0] ? readRight(intlDestPositions[0]) : '';
  }

  // SOV mappings (v1)
  const sov = wb.Sheets['SOV'];
  if (sov) {
    const sovRows = XLSX.utils.sheet_to_json(sov, { header: 1, raw: false, blankrows: false });

    // Total stock (TOTAL row)
    const totalRow = sovRows.find((r) => norm(r?.[0]).toLowerCase() === 'total');
    if (totalRow) {
      // In the provided template, MAX stock is col 6 and AVG is col 7.
      fields.sovTotalMaxStock = norm(totalRow?.[6]);
      fields.sovTotalAvgStock = norm(totalRow?.[7]);
    }

    // Max any one location = max STOCK maximum (col 6) among numbered rows.
    let maxAnyOneLoc = NaN;
    for (const r of sovRows) {
      const loc = norm(r?.[0]);
      if (!loc) continue;
      if (loc.toLowerCase() === 'loc #' || loc.toLowerCase() === 'total') continue;
      const n = moneyToNumber(r?.[6]);
      if (Number.isFinite(n) && (!Number.isFinite(maxAnyOneLoc) || n > maxAnyOneLoc)) {
        maxAnyOneLoc = n;
      }
    }
    if (Number.isFinite(maxAnyOneLoc)) {
      fields.maxAnyOneLocationFromSov = String(Math.round(maxAnyOneLoc));
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
