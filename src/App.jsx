import React, { useState, useRef } from 'react';

import { formatNumberWithCommas } from './lib/formatters.js';
import { generateEmail as buildEmail } from './lib/emailGenerator.js';
import { parseExcelToSubmission, extractFieldsFromTemplate } from './lib/excelParser.js';

// Main App component for the Marine Cargo Email Submission Generator
const App = () => {
  // State variables to store input values.
  // Monetary values will store the raw number, and display will be handled by formatting.
  const [inceptionDate, setInceptionDate] = useState('');
  const [isDateTBA, setIsDateTBA] = useState(false); // To Be Advised checkbox state for Inception Date
  const [businessType, setBusinessType] = useState(''); // stock only, stock throughput, transit only
  const [businessStatus, setBusinessStatus] = useState(''); // New or Renewal
  const [insuredName, setInsuredName] = useState('');
  const [insuredWebsite, setInsuredWebsite] = useState('');
  const [insuredAddress, setInsuredAddress] = useState('');
  const [insuredNarrative, setInsuredNarrative] = useState('');
  const [interest, setInterest] = useState('');

  // Basis of Valuation states
  const [bovStock, setBovStock] = useState('');
  const [bovStockOther, setBovStockOther] = useState('');
  const [bovIncomingTransit, setBovIncomingTransit] = useState('');
  const [bovIncomingTransitOther, setBovIncomingTransitOther] = useState('');
  const [bovOutgoingTransit, setBovOutgoingTransit] = useState('');
  const [bovOutgoingTransitOther, setBovOutgoingTransitOther] = useState('');

  // Expiring Premium
  const [expiringPremium, setExpiringPremium] = useState('');

  // Stock-related fields (Proposed)
  const [maxTIV, setMaxTIV] = useState('');
  const [averageTIV, setAverageTIV] = useState('');
  const [maxAnyOneLocation, setMaxAnyOneLocation] = useState('');
  const [deductibleAOPStock, setDeductibleAOPStock] = useState('');
  const [deductibleCATStock, setDeductibleCATStock] = useState('');
  const [limitAOPStock, setLimitAOPStock] = useState('');
  const [limitCATStock, setLimitCATStock] = useState('');

  // Transit-related fields (Proposed)
  const [maxConveyance, setMaxConveyance] = useState('');
  const [averageConveyance, setAverageConveyance] = useState('');
  const [estimatedSales, setEstimatedSales] = useState('');
  const [isEstimatedSalesUnknown, setIsEstimatedSalesUnknown] = useState(false);
  const [deductibleTransit, setDeductibleTransit] = useState('');
  const [limitTransit, setLimitTransit] = useState('');

  // Transit Volume Totals (Proposed)
  const [incomingTransitVolumeTotal, setIncomingTransitVolumeTotal] = useState('');
  const [outgoingTransitVolumeTotal, setOutgoingTransitVolumeTotal] = useState('');

  // Transit Volume Splits (Proposed)
  const [incomingDomesticPct, setIncomingDomesticPct] = useState('');
  const [incomingInternationalPct, setIncomingInternationalPct] = useState('');
  const [incomingPrimaryPct, setIncomingPrimaryPct] = useState('');
  const [incomingContingentPct, setIncomingContingentPct] = useState('');
  const [outgoingDomesticPct, setOutgoingDomesticPct] = useState('');
  const [outgoingInternationalPct, setOutgoingInternationalPct] = useState('');
  const [outgoingPrimaryPct, setOutgoingPrimaryPct] = useState('');
  const [outgoingContingentPct, setOutgoingContingentPct] = useState('');

  const [lossHistory, setLossHistory] = useState(Array(5).fill('')); // Array for 5 years
  const [targetPremium, setTargetPremium] = useState('');
  const [brokerage, setBrokerage] = useState(''); // Percentage

  const [generatedEmailBody, setGeneratedEmailBody] = useState(''); // Stores HTML body
  const [generatedEmailSubject, setGeneratedEmailSubject] = useState(''); // Stores plain text subject
  const [copySuccess, setCopySuccess] = useState('');
  const [isFetchingNarrative, setIsFetchingNarrative] = useState(false);
  const [isFetchingInterest, setIsFetchingInterest] = useState(false);

  // It’s referenced in fetchInsuredAddress(), so define it (even if we don’t currently render a button)
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  // Excel upload / parse (v1)
  const [excelFile, setExcelFile] = useState(null);
  const [excelRawText, setExcelRawText] = useState('');
  const [excelWorkbook, setExcelWorkbook] = useState(null);
  const [excelMeta, setExcelMeta] = useState(null);
  const [excelError, setExcelError] = useState('');
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [autofillSummary, setAutofillSummary] = useState(null);

  // Ref for the div containing the generated email body
  const emailBodyDivRef = useRef(null);
  // Ref for the input containing the generated email subject
  const emailSubjectInputRef = useRef(null);

  // Generic handler for monetary input fields
  const handleMonetaryInputChange = (e, setter) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, ''); // Allow only numbers and a single decimal point
    setter(rawValue); // Store raw value in state
  };

  // Generic handler for percentage input fields
  const handlePercentageInputChange = (e, setter) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, ''); // Allow only numbers and a single decimal point
    setter(rawValue);
  };

  // Function to handle changes in loss history input fields
  const handleLossHistoryChange = (index, value) => {
    const newLossHistory = [...lossHistory];
    newLossHistory[index] = value;
    setLossHistory(newLossHistory);
  };

  // Function to generate the email content based on current state
  const generateEmail = () => {
    const { subject, bodyHtml } = buildEmail({
      inceptionDate,
      isDateTBA,
      businessType,
      businessStatus,
      insuredName,
      insuredWebsite,
      insuredAddress,
      insuredNarrative,
      interest,

      bovStock,
      bovStockOther,
      bovIncomingTransit,
      bovIncomingTransitOther,
      bovOutgoingTransit,
      bovOutgoingTransitOther,

      expiringPremium,

      maxTIV,
      averageTIV,
      maxAnyOneLocation,
      deductibleAOPStock,
      deductibleCATStock,
      limitAOPStock,
      limitCATStock,

      maxConveyance,
      averageConveyance,
      estimatedSales,
      isEstimatedSalesUnknown,
      deductibleTransit,
      limitTransit,

      incomingTransitVolumeTotal,
      outgoingTransitVolumeTotal,

      incomingDomesticPct,
      incomingInternationalPct,
      incomingPrimaryPct,
      incomingContingentPct,
      outgoingDomesticPct,
      outgoingInternationalPct,
      outgoingPrimaryPct,
      outgoingContingentPct,

      lossHistory,
      targetPremium,
      brokerage,
    });

    setGeneratedEmailSubject(subject);
    setGeneratedEmailBody(bodyHtml);
    setCopySuccess('');
  };

  // Function to copy the generated email body to clipboard as rich text
  const copyBodyToClipboard = () => {
    if (emailBodyDivRef.current) {
      const range = document.createRange();
      range.selectNodeContents(emailBodyDivRef.current);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      try {
        document.execCommand('copy');
        setCopySuccess('Email body copied to clipboard!');
      } catch (err) {
        setCopySuccess('Failed to copy. Please copy manually.');
        console.error('Failed to copy email body:', err);
      }
      selection.removeAllRanges();
      setTimeout(() => setCopySuccess(''), 3000);
    }
  };

  // Function to copy the generated email subject to clipboard
  const copySubjectToClipboard = () => {
    if (emailSubjectInputRef.current) {
      emailSubjectInputRef.current.select();
      try {
        document.execCommand('copy');
        setCopySuccess('Subject copied to clipboard!');
      } catch (err) {
        setCopySuccess('Failed to copy subject. Please copy manually.');
        console.error('Failed to copy subject:', err);
      }
      setTimeout(() => setCopySuccess(''), 3000);
    }
  };

  // Function to fetch insured narrative using Google Search and LLM (MOCKED)
  const fetchInsuredNarrative = async () => {
    if (!insuredName) {
      setInsuredNarrative('Please enter an Insured Name to fetch a narrative.');
      return;
    }

    setIsFetchingNarrative(true);
    setInsuredNarrative('Fetching narrative, please wait...');

    await new Promise((resolve) => setTimeout(resolve, 1500));
    const mockedNarrative = `This is a *mocked* narrative for ${insuredName}. It's a leading global logistics provider specializing in freight forwarding, warehousing, and supply chain management. This is for demonstration purposes.`;
    setInsuredNarrative(mockedNarrative);
    setIsFetchingNarrative(false);
  };

  // Function to fetch insured interest using Google Search and LLM (MOCKED)
  const fetchInterest = async () => {
    if (!insuredName && !insuredNarrative) {
      setInterest('Please enter Insured Name or Insured Narrative to fetch interest.');
      return;
    }

    setIsFetchingInterest(true);
    setInterest('Fetching interest, please wait...');

    await new Promise((resolve) => setTimeout(resolve, 1500));
    const mockedInterest = `*Mocked* Interest: Electronics, Textiles, Perishable Goods, Automotive Parts. This is for demonstration purposes.`;
    setInterest(mockedInterest);
    setIsFetchingInterest(false);
  };

  // Function to fetch insured address using Google Search and LLM (MOCKED)
  const fetchInsuredAddress = async () => {
    if (!insuredName) {
      setInsuredAddress('Please enter an Insured Name to fetch an address.');
      return;
    }

    setIsFetchingAddress(true);
    setInsuredAddress('Fetching address, please wait...');

    await new Promise((resolve) => setTimeout(resolve, 1500));
    const mockedAddresses = [
      '123 Mockingbird Lane, Anytown, CA 90210 (Mocked)',
      '456 Example St, Fakesville, FL 33101 (Mocked)',
      '789 Placeholder Ave, Test City, NY 10001 (Mocked)',
    ];
    const randomMockedAddress = mockedAddresses[Math.floor(Math.random() * mockedAddresses.length)];
    setInsuredAddress(`*Mocked* Address: ${randomMockedAddress}`);
    setIsFetchingAddress(false);
  };

  const handleExcelFile = async (file) => {
    if (!file) return;
    setExcelError('');
    setIsParsingExcel(true);
    setExcelFile(file);

    try {
      const { rawText, workbookMeta, workbook } = await parseExcelToSubmission(file);
      setExcelRawText(rawText || '');
      setExcelWorkbook(workbook || null);
      setExcelMeta(workbookMeta || null);
    } catch (err) {
      console.error('Excel parse failed:', err);
      setExcelError(err?.message || 'Failed to parse Excel file');
      setExcelRawText('');
      setExcelWorkbook(null);
      setExcelMeta(null);
    } finally {
      setIsParsingExcel(false);
    }
  };

  const attemptAutofillFromRawText = () => {
    if (!excelWorkbook) return;

    const { template, fields } = extractFieldsFromTemplate(excelWorkbook);
    if (!template) {
      setExcelError('Unrecognised Excel template (v1 expects App Form + standard labels).');
      return;
    }

    // Set what we can; user can always overwrite manually.
    if (fields.insuredName) setInsuredName(fields.insuredName);
    if (fields.insuredWebsite) setInsuredWebsite(fields.insuredWebsite);
    if (fields.insuredAddress) setInsuredAddress(fields.insuredAddress);
    if (fields.interest) setInterest(fields.interest);
    if (fields.businessType) setBusinessType(fields.businessType);

    // Inception date: supports dd/mm/yy or dd/mm/yyyy or yyyy-mm-dd or long-form dates from Excel
    const rawDate = fields.inceptionDateRaw;
    if (rawDate) {
      let iso = '';

      const mIso = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (mIso) {
        iso = rawDate;
      } else {
        const m = rawDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
        if (m) {
          const dd = m[1].padStart(2, '0');
          const mm = m[2].padStart(2, '0');
          const yyyy = m[3].length === 2 ? `20${m[3]}` : m[3];
          iso = `${yyyy}-${mm}-${dd}`;
        }
      }

      // Fallback: try Date.parse on strings like "Sunday, May 03, 2026"
      if (!iso) {
        const t = Date.parse(rawDate);
        if (!Number.isNaN(t)) {
          const d = new Date(t);
          const yyyy = String(d.getFullYear());
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          iso = `${yyyy}-${mm}-${dd}`;
        }
      }

      if (iso) {
        setInceptionDate(iso);
        setIsDateTBA(false);
      }
    }

    // Estimated sales (if present)
    let cleanedSales = '';
    if (fields.estimatedSalesRaw) {
      cleanedSales = String(fields.estimatedSalesRaw).replace(/[^0-9.]/g, '');
      if (cleanedSales) {
        setEstimatedSales(cleanedSales);
        setIsEstimatedSalesUnknown(false);
      }
    }

    // Transit (App Form)
    // Max conveyance: wire to Transit limit; also keep max conveyance aligned
    let cleanedTransitLimit = '';
    if (fields.maxValueAnyOneConveyanceRaw) {
      cleanedTransitLimit = String(fields.maxValueAnyOneConveyanceRaw).replace(/[^0-9.]/g, '');
      if (cleanedTransitLimit) {
        setLimitTransit(cleanedTransitLimit);
        setMaxConveyance(cleanedTransitLimit);
      }
    }

    // Average conveyance
    let cleanedAverageConveyance = '';
    if (fields.averageValueAnyOneConveyanceRaw) {
      cleanedAverageConveyance = String(fields.averageValueAnyOneConveyanceRaw).replace(/[^0-9.]/g, '');
      if (cleanedAverageConveyance) setAverageConveyance(cleanedAverageConveyance);
    }

    // Transit volumes + splits
    let cleanedIncomingTransit = '';
    if (fields.incomingTransitVolumeTotalRaw) {
      cleanedIncomingTransit = String(fields.incomingTransitVolumeTotalRaw).replace(/[^0-9.]/g, '');
      if (cleanedIncomingTransit) setIncomingTransitVolumeTotal(cleanedIncomingTransit);
    }

    let cleanedOutgoingTransit = '';
    if (fields.outgoingTransitVolumeTotalRaw) {
      cleanedOutgoingTransit = String(fields.outgoingTransitVolumeTotalRaw).replace(/[^0-9.]/g, '');
      if (cleanedOutgoingTransit) setOutgoingTransitVolumeTotal(cleanedOutgoingTransit);
    }

    const cleanPct = (v) => {
      const t = String(v || '').replace(/[^0-9.]/g, '');
      if (!t) return '';
      const n = Math.max(0, Math.min(100, parseFloat(t)));
      return Number.isFinite(n) ? String(n) : '';
    };

    const incomingPrimary = cleanPct(fields.incomingPrimaryPctRaw);
    const incomingContingent = cleanPct(fields.incomingContingentPctRaw);
    const outgoingPrimary = cleanPct(fields.outgoingPrimaryPctRaw) || incomingPrimary;
    const outgoingContingent = cleanPct(fields.outgoingContingentPctRaw) || incomingContingent;

    if (incomingPrimary) setIncomingPrimaryPct(incomingPrimary);
    if (incomingContingent) setIncomingContingentPct(incomingContingent);
    if (outgoingPrimary) setOutgoingPrimaryPct(outgoingPrimary);
    if (outgoingContingent) setOutgoingContingentPct(outgoingContingent);

    // Domestic / international splits
    const incomingDomestic = cleanPct(fields.incomingDomesticPctRaw);
    const incomingInternational = cleanPct(fields.incomingInternationalPctRaw);
    const outgoingDomestic = cleanPct(fields.outgoingDomesticPctRaw) || incomingDomestic;
    const outgoingInternational = cleanPct(fields.outgoingInternationalPctRaw) || incomingInternational;

    if (incomingDomestic) setIncomingDomesticPct(incomingDomestic);
    if (incomingInternational) setIncomingInternationalPct(incomingInternational);
    if (outgoingDomestic) setOutgoingDomesticPct(outgoingDomestic);
    if (outgoingInternational) setOutgoingInternationalPct(outgoingInternational);

    // From SOV: total stock + max any one location
    let cleanedMaxTiv = '';
    let cleanedAvgTiv = '';
    let cleanedMaxAny = '';

    if (fields.sovTotalMaxStock) {
      cleanedMaxTiv = String(fields.sovTotalMaxStock).replace(/[^0-9.]/g, '');
      if (cleanedMaxTiv) setMaxTIV(cleanedMaxTiv);
    }

    if (fields.sovTotalAvgStock) {
      cleanedAvgTiv = String(fields.sovTotalAvgStock).replace(/[^0-9.]/g, '');
      if (cleanedAvgTiv) setAverageTIV(cleanedAvgTiv);
    }

    if (fields.maxAnyOneLocationFromSov) {
      cleanedMaxAny = String(fields.maxAnyOneLocationFromSov).replace(/[^0-9.]/g, '');
      if (cleanedMaxAny) setMaxAnyOneLocation(cleanedMaxAny);
    }

    // Store summary (show blanks if missing)
    setAutofillSummary({
      insuredName: fields.insuredName || '',
      inceptionDate: rawDate || '',
      estimatedSales: cleanedSales || '',
      maxTIV: cleanedMaxTiv,
      averageTIV: cleanedAvgTiv,
      maxAnyOneLocation: cleanedMaxAny,
      transitLimit: cleanedTransitLimit,
      averageConveyance: cleanedAverageConveyance,
      incomingTransitVolumeTotal: cleanedIncomingTransit,
      outgoingTransitVolumeTotal: cleanedOutgoingTransit,
      primaryPct: outgoingPrimary || incomingPrimary,
      contingentPct: outgoingContingent || incomingContingent,
      incomingDomesticPct: incomingDomestic,
      incomingInternationalPct: incomingInternational,
      outgoingDomesticPct: outgoingDomestic,
      outgoingInternationalPct: outgoingInternational,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8 font-inter text-gray-800">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-6 sm:p-8">
        {/* Excel upload (v1) */}
        <div
          className="mb-6 rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/40 p-4"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer?.files?.[0];
            handleExcelFile(file);
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="font-semibold text-blue-900">Drop SOV/App Form (.xlsx) here</div>
              <div className="text-sm text-blue-800/80">or pick a file — we’ll parse it in-browser (no upload).</div>
            </div>

            <label className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium cursor-pointer hover:bg-blue-700 transition">
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={(e) => handleExcelFile(e.target.files?.[0])}
              />
              Choose Excel
            </label>
          </div>

          {isParsingExcel && <div className="mt-3 text-sm text-gray-700">Parsing…</div>}
          {excelError && <div className="mt-3 text-sm text-red-700">{excelError}</div>}

          {excelMeta && (
            <div className="mt-4 grid grid-cols-1 gap-3">
              <div className="text-sm text-gray-700">
                <span className="font-medium">File:</span> {excelMeta.fileName}
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-medium">Sheets:</span> {excelMeta.sheetNames?.join(', ') || '—'}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="px-3 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                  onClick={attemptAutofillFromRawText}
                  disabled={!excelRawText}
                >
                  Attempt autofill
                </button>
                <div className="text-xs text-gray-600 self-center">
                  v1: insured name/website/address/inception date/status only (best-effort)
                </div>
              </div>

              {autofillSummary && (
                <div className="rounded-md bg-white border border-gray-200 p-3">
                  <div className="text-sm font-semibold text-gray-800 mb-2">Autofill results</div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>
                      <span className="font-medium">Insured name:</span> {autofillSummary.insuredName || '(blank)'}
                    </li>
                    <li>
                      <span className="font-medium">Inception date:</span> {autofillSummary.inceptionDate || '(blank)'}
                    </li>
                    <li>
                      <span className="font-medium">Estimated sales:</span> {autofillSummary.estimatedSales || '(blank)'}
                    </li>
                    <li>
                      <span className="font-medium">Max TIV:</span> {autofillSummary.maxTIV || '(blank)'}
                    </li>
                    <li>
                      <span className="font-medium">Average TIV:</span> {autofillSummary.averageTIV || '(blank)'}
                    </li>
                    <li>
                      <span className="font-medium">Max any one location:</span> {autofillSummary.maxAnyOneLocation || '(blank)'}
                    </li>
                    <li>
                      <span className="font-medium">Transit limit:</span> {autofillSummary.transitLimit || '(blank)'}
                    </li>
                    <li>
                      <span className="font-medium">Average conveyance:</span> {autofillSummary.averageConveyance || '(blank)'}
                    </li>
                    <li>
                      <span className="font-medium">Incoming transit total:</span> {autofillSummary.incomingTransitVolumeTotal || '(blank)'}
                    </li>
                    <li>
                      <span className="font-medium">Outgoing transit total:</span> {autofillSummary.outgoingTransitVolumeTotal || '(blank)'}
                    </li>
                    <li>
                      <span className="font-medium">Primary %:</span> {autofillSummary.primaryPct || '(blank)'}
                    </li>
                    <li>
                      <span className="font-medium">Contingent %:</span> {autofillSummary.contingentPct || '(blank)'}
                    </li>
                    <li>
                      <span className="font-medium">Incoming domestic %:</span> {autofillSummary.incomingDomesticPct || '(blank)'}
                    </li>
                    <li>
                      <span className="font-medium">Incoming international %:</span> {autofillSummary.incomingInternationalPct || '(blank)'}
                    </li>
                    <li>
                      <span className="font-medium">Outgoing domestic %:</span> {autofillSummary.outgoingDomesticPct || '(blank)'}
                    </li>
                    <li>
                      <span className="font-medium">Outgoing international %:</span> {autofillSummary.outgoingInternationalPct || '(blank)'}
                    </li>
                  </ul>
                </div>
              )}

              <div className="rounded-md bg-white border border-gray-200 p-3">
                <div className="text-sm font-semibold text-gray-800 mb-2">Raw text preview</div>
                <pre className="text-xs text-gray-700 max-h-56 overflow-auto whitespace-pre-wrap">{excelRawText}</pre>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-900 text-center flex-grow">Submission Builder</h1>
        </div>
        <p className="text-center text-gray-600 mb-8">
          Fill in the details below to generate a formatted email submission for underwriters.
        </p>

        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Inception Date */}
          <div className="flex flex-col">
            <label htmlFor="inceptionDate" className="text-sm font-medium text-gray-700 mb-1">
              Inception Date:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                id="inceptionDate"
                className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200 flex-grow"
                value={inceptionDate}
                onChange={(e) => setInceptionDate(e.target.value)}
                disabled={isDateTBA}
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="dateTBA"
                  className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  checked={isDateTBA}
                  onChange={(e) => setIsDateTBA(e.target.checked)}
                />
                <label htmlFor="dateTBA" className="ml-2 text-sm text-gray-700">
                  To Be Advised
                </label>
              </div>
            </div>
          </div>

          {/* Business Type */}
          <div className="flex flex-col">
            <label htmlFor="businessType" className="text-sm font-medium text-gray-700 mb-1">
              Business Type:
            </label>
            <select
              id="businessType"
              className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
            >
              <option value="">Select Type</option>
              <option value="Stock Only">Stock Only</option>
              <option value="Stock Throughput">Stock Throughput</option>
              <option value="Transit Only">Transit Only</option>
            </select>
          </div>

          {/* Business Status (New/Renewal) */}
          <div className="flex flex-col">
            <label htmlFor="businessStatus" className="text-sm font-medium text-gray-700 mb-1">
              Business Status:
            </label>
            <select
              id="businessStatus"
              className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              value={businessStatus}
              onChange={(e) => setBusinessStatus(e.target.value)}
            >
              <option value="">Select Status</option>
              <option value="New">New</option>
              <option value="Renewal">Renewal</option>
            </select>
          </div>

          {/* Insured Name */}
          <div className="flex flex-col">
            <label htmlFor="insuredName" className="text-sm font-medium text-gray-700 mb-1">
              Insured Name:
            </label>
            <input
              type="text"
              id="insuredName"
              className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              value={insuredName}
              onChange={(e) => setInsuredName(e.target.value)}
              placeholder="e.g., Global Logistics Corp."
            />
          </div>

          {/* Insured Website */}
          <div className="flex flex-col">
            <label htmlFor="insuredWebsite" className="text-sm font-medium text-gray-700 mb-1">
              Insured Website:
            </label>
            <input
              type="text"
              id="insuredWebsite"
              className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              value={insuredWebsite}
              onChange={(e) => setInsuredWebsite(e.target.value)}
              placeholder="e.g., www.example.com"
            />
          </div>

          {/* Insured Address */}
          <div className="flex flex-col">
            <label htmlFor="insuredAddress" className="text-sm font-medium text-gray-700 mb-1">
              Insured Address:
            </label>
            <textarea
              id="insuredAddress"
              rows="2"
              className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-y"
              value={insuredAddress}
              onChange={(e) => setInsuredAddress(e.target.value)}
              placeholder="e.g., 123 Main St, Anytown, USA"
            ></textarea>
          </div>

          {/* Insured Narrative with Fetch Button */}
          <div className="md:col-span-2 flex flex-col">
            <label htmlFor="insuredNarrative" className="text-sm font-medium text-gray-700 mb-1">
              Insured Narrative (Description of operations, specific cargo, locations, etc.):
            </label>
            <textarea
              id="insuredNarrative"
              rows="4"
              className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-y"
              value={insuredNarrative}
              onChange={(e) => setInsuredNarrative(e.target.value)}
              placeholder="Describe the insured's business, the nature of goods, typical transit routes, and relevant operations."
            ></textarea>
            <button
              onClick={fetchInsuredNarrative}
              disabled={isFetchingNarrative || !insuredName}
              className={`mt-2 py-2 px-4 rounded-md shadow-sm text-sm font-medium transition duration-300 ease-in-out ${
                isFetchingNarrative
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isFetchingNarrative ? 'Fetching Narrative...' : 'Fetch Narrative'}
            </button>
          </div>

          {/* Interest with Fetch Button */}
          <div className="md:col-span-2 flex flex-col">
            <label htmlFor="interest" className="text-sm font-medium text-gray-700 mb-1">
              Interest (e.g., raw materials, finished goods, electronics, textiles):
            </label>
            <textarea
              id="interest"
              rows="3"
              className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-y"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="Specify the type of goods or commodities being insured."
            ></textarea>
            <button
              onClick={fetchInterest}
              disabled={isFetchingInterest || (!insuredName && !insuredNarrative)}
              className={`mt-2 py-2 px-4 rounded-md shadow-sm text-sm font-medium transition duration-300 ease-in-out ${
                isFetchingInterest
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isFetchingInterest ? 'Fetching Interest...' : 'Fetch Interest'}
            </button>
          </div>

          {/* Transit Details Section */}
          {(businessType === 'Transit Only' || businessType === 'Stock Throughput') && (
            <div className="md:col-span-2 border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">
                Transit Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Max Value Any One Conveyance */}
                <div className="flex flex-col">
                  <label htmlFor="maxConveyance" className="text-sm font-medium text-gray-700 mb-1">
                    Max Value Any One Conveyance (USD):
                  </label>
                  <input
                    type="text"
                    id="maxConveyance"
                    className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    value={formatNumberWithCommas(maxConveyance)}
                    onChange={(e) => handleMonetaryInputChange(e, setMaxConveyance)}
                    placeholder="e.g., 1,000,000"
                  />
                </div>

                {/* Average Value Any One Conveyance */}
                <div className="flex flex-col">
                  <label htmlFor="averageConveyance" className="text-sm font-medium text-gray-700 mb-1">
                    Average Value Any One Conveyance (USD):
                  </label>
                  <input
                    type="text"
                    id="averageConveyance"
                    className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    value={formatNumberWithCommas(averageConveyance)}
                    onChange={(e) => handleMonetaryInputChange(e, setAverageConveyance)}
                    placeholder="e.g., 250,000"
                  />
                </div>

                {/* Estimated Sales */}
                <div className="flex flex-col">
                  <label htmlFor="estimatedSales" className="text-sm font-medium text-gray-700 mb-1">
                    Estimated Sales (Forthcoming Policy Period, USD):
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      id="estimatedSales"
                      className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200 flex-grow"
                      value={formatNumberWithCommas(estimatedSales)}
                      onChange={(e) => handleMonetaryInputChange(e, setEstimatedSales)}
                      placeholder="e.g., 50,000,000"
                      disabled={isEstimatedSalesUnknown}
                    />
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="estimatedSalesUnknown"
                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        checked={isEstimatedSalesUnknown}
                        onChange={(e) => setIsEstimatedSalesUnknown(e.target.checked)}
                      />
                      <label htmlFor="estimatedSalesUnknown" className="ml-2 text-sm text-gray-700">
                        Unknown
                      </label>
                    </div>
                  </div>
                </div>

                {/* Incoming Transit Volume */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Incoming Transit Volume (USD & Percentages):
                  </label>
                  <div className="flex flex-col mb-4">
                    <label htmlFor="incomingTransitVolumeTotal" className="text-xs font-medium text-gray-600 mb-1">
                      Total Incoming Transit Volume (USD):
                    </label>
                    <input
                      type="text"
                      id="incomingTransitVolumeTotal"
                      className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      value={formatNumberWithCommas(incomingTransitVolumeTotal)}
                      onChange={(e) => handleMonetaryInputChange(e, setIncomingTransitVolumeTotal)}
                      placeholder="e.g., 30,000,000"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label htmlFor="incomingDomesticPct" className="text-xs font-medium text-gray-600 mb-1">
                        Domestic (%):
                      </label>
                      <input
                        type="number"
                        id="incomingDomesticPct"
                        className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        value={incomingDomesticPct}
                        onChange={(e) => handlePercentageInputChange(e, setIncomingDomesticPct)}
                        placeholder="e.g., 40"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="incomingInternationalPct" className="text-xs font-medium text-gray-600 mb-1">
                        International (%):
                      </label>
                      <input
                        type="number"
                        id="incomingInternationalPct"
                        className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        value={incomingInternationalPct}
                        onChange={(e) => handlePercentageInputChange(e, setIncomingInternationalPct)}
                        placeholder="e.g., 60"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="incomingPrimaryPct" className="text-xs font-medium text-gray-600 mb-1">
                        Primary (%):
                      </label>
                      <input
                        type="number"
                        id="incomingPrimaryPct"
                        className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        value={incomingPrimaryPct}
                        onChange={(e) => handlePercentageInputChange(e, setIncomingPrimaryPct)}
                        placeholder="e.g., 90"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="incomingContingentPct" className="text-xs font-medium text-gray-600 mb-1">
                        Contingent (%):
                      </label>
                      <input
                        type="number"
                        id="incomingContingentPct"
                        className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        value={incomingContingentPct}
                        onChange={(e) => handlePercentageInputChange(e, setIncomingContingentPct)}
                        placeholder="e.g., 10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Incoming Transit BOV */}
              <div className="flex flex-col">
                <label htmlFor="bovIncomingTransit" className="text-sm font-medium text-gray-700 mb-1">
                  Incoming Transit Basis of Valuation:
                </label>
                <select
                  id="bovIncomingTransit"
                  className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  value={bovIncomingTransit}
                  onChange={(e) => setBovIncomingTransit(e.target.value)}
                >
                  <option value="">Select BOV</option>
                  <option value="Selling price">Selling price</option>
                  <option value="Replacement Cost">Replacement Cost</option>
                  <option value="CIF + 10%">CIF + 10%</option>
                  <option value="Other">Other</option>
                </select>
                {bovIncomingTransit === 'Other' && (
                  <input
                    type="text"
                    className="mt-2 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    value={bovIncomingTransitOther}
                    onChange={(e) => setBovIncomingTransitOther(e.target.value)}
                    placeholder="Specify other BOV"
                  />
                )}
              </div>

              {/* Outgoing Transit Volume */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Outgoing Transit Volume (USD & Percentages):
                </label>
                <div className="flex flex-col mb-4">
                  <label htmlFor="outgoingTransitVolumeTotal" className="text-xs font-medium text-gray-600 mb-1">
                    Total Outgoing Transit Volume (USD):
                  </label>
                  <input
                    type="text"
                    id="outgoingTransitVolumeTotal"
                    className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    value={formatNumberWithCommas(outgoingTransitVolumeTotal)}
                    onChange={(e) => handleMonetaryInputChange(e, setOutgoingTransitVolumeTotal)}
                    placeholder="e.g., 40,000,000"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label htmlFor="outgoingDomesticPct" className="text-xs font-medium text-gray-600 mb-1">
                      Domestic (%):
                    </label>
                    <input
                      type="number"
                      id="outgoingDomesticPct"
                      className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      value={outgoingDomesticPct}
                      onChange={(e) => handlePercentageInputChange(e, setOutgoingDomesticPct)}
                      placeholder="e.g., 30"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="outgoingInternationalPct" className="text-xs font-medium text-gray-600 mb-1">
                      International (%):
                    </label>
                    <input
                      type="number"
                      id="outgoingInternationalPct"
                      className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      value={outgoingInternationalPct}
                      onChange={(e) => handlePercentageInputChange(e, setOutgoingInternationalPct)}
                      placeholder="e.g., 70"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="outgoingPrimaryPct" className="text-xs font-medium text-gray-600 mb-1">
                      Primary (%):
                    </label>
                    <input
                      type="number"
                      id="outgoingPrimaryPct"
                      className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      value={outgoingPrimaryPct}
                      onChange={(e) => handlePercentageInputChange(e, setOutgoingPrimaryPct)}
                      placeholder="e.g., 80"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="outgoingContingentPct" className="text-xs font-medium text-gray-600 mb-1">
                      Contingent (%):
                    </label>
                    <input
                      type="number"
                      id="outgoingContingentPct"
                      className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      value={outgoingContingentPct}
                      onChange={(e) => handlePercentageInputChange(e, setOutgoingContingentPct)}
                      placeholder="e.g., 20"
                    />
                  </div>
                </div>
              </div>

              {/* Outgoing Transit BOV */}
              <div className="flex flex-col">
                <label htmlFor="bovOutgoingTransit" className="text-sm font-medium text-gray-700 mb-1">
                  Outgoing Transit Basis of Valuation:
                </label>
                <select
                  id="bovOutgoingTransit"
                  className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  value={bovOutgoingTransit}
                  onChange={(e) => setBovOutgoingTransit(e.target.value)}
                >
                  <option value="">Select BOV</option>
                  <option value="Selling price">Selling price</option>
                  <option value="Replacement Cost">Replacement Cost</option>
                  <option value="CIF + 10%">CIF + 10%</option>
                  <option value="Other">Other</option>
                </select>
                {bovOutgoingTransit === 'Other' && (
                  <input
                    type="text"
                    className="mt-2 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    value={bovOutgoingTransitOther}
                    onChange={(e) => setBovOutgoingTransitOther(e.target.value)}
                    placeholder="Specify other BOV"
                  />
                )}
              </div>
            </div>
          )}

          {/* Storage Details Section */}
          {(businessType === 'Stock Only' || businessType === 'Stock Throughput') && (
            <div className="md:col-span-2 border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">
                Storage Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label htmlFor="maxTIV" className="text-sm font-medium text-gray-700 mb-1">
                    Max TIV (USD):
                  </label>
                  <input
                    type="text"
                    id="maxTIV"
                    className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    value={formatNumberWithCommas(maxTIV)}
                    onChange={(e) => handleMonetaryInputChange(e, setMaxTIV)}
                    placeholder="e.g., 20,000,000"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="averageTIV" className="text-sm font-medium text-gray-700 mb-1">
                    Average TIV (USD):
                  </label>
                  <input
                    type="text"
                    id="averageTIV"
                    className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    value={formatNumberWithCommas(averageTIV)}
                    onChange={(e) => handleMonetaryInputChange(e, setAverageTIV)}
                    placeholder="e.g., 5,000,000"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="maxAnyOneLocation" className="text-sm font-medium text-gray-700 mb-1">
                    Max Any One Location (USD):
                  </label>
                  <input
                    type="text"
                    id="maxAnyOneLocation"
                    className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    value={formatNumberWithCommas(maxAnyOneLocation)}
                    onChange={(e) => handleMonetaryInputChange(e, setMaxAnyOneLocation)}
                    placeholder="e.g., 7,500,000"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="bovStock" className="text-sm font-medium text-gray-700 mb-1">
                    Stock Basis of Valuation:
                  </label>
                  <select
                    id="bovStock"
                    className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    value={bovStock}
                    onChange={(e) => setBovStock(e.target.value)}
                  >
                    <option value="">Select BOV</option>
                    <option value="Selling price">Selling price</option>
                    <option value="Replacement Cost">Replacement Cost</option>
                    <option value="CIF + 10%">CIF + 10%</option>
                    <option value="Other">Other</option>
                  </select>
                  {bovStock === 'Other' && (
                    <input
                      type="text"
                      className="mt-2 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      value={bovStockOther}
                      onChange={(e) => setBovStockOther(e.target.value)}
                      placeholder="Specify other BOV"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loss Record (5 years) */}
          <div className="md:col-span-2 flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Loss Record (5-Year History - provide details for each year):
            </label>
            {lossHistory.map((yearEntry, index) => (
              <input
                key={index}
                type="text"
                className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200 mb-2"
                value={yearEntry}
                onChange={(e) => handleLossHistoryChange(index, e.target.value)}
                placeholder={`${new Date().getFullYear() - (4 - index)} (e.g., 1 claim, $10,000; or No losses)`}
              />
            ))}
          </div>

          {/* Expiring Premium */}
          {businessStatus === 'Renewal' && (
            <div className="flex flex-col md:col-span-2">
              <label htmlFor="expiringPremium" className="text-sm font-medium text-gray-700 mb-1">
                Expiring Premium (USD):
              </label>
              <input
                type="text"
                id="expiringPremium"
                className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                value={formatNumberWithCommas(expiringPremium)}
                onChange={(e) => handleMonetaryInputChange(e, setExpiringPremium)}
                placeholder="e.g., 45,000"
              />
            </div>
          )}

          {/* Target Deductibles */}
          {(businessType === 'Stock Only' || businessType === 'Stock Throughput' || businessType === 'Transit Only') && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Target Deductibles (USD):</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(businessType === 'Stock Only' || businessType === 'Stock Throughput') && (
                  <>
                    <div className="flex flex-col">
                      <label htmlFor="deductibleAOPStock" className="text-xs font-medium text-gray-600 mb-1">
                        AOP (Stock):
                      </label>
                      <input
                        type="text"
                        id="deductibleAOPStock"
                        className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        value={formatNumberWithCommas(deductibleAOPStock)}
                        onChange={(e) => handleMonetaryInputChange(e, setDeductibleAOPStock)}
                        placeholder="e.g., 10,000"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="deductibleCATStock" className="text-xs font-medium text-gray-600 mb-1">
                        CAT (Earthquake, Flood and Windstorm):
                      </label>
                      <input
                        type="text"
                        id="deductibleCATStock"
                        className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        value={formatNumberWithCommas(deductibleCATStock)}
                        onChange={(e) => handleMonetaryInputChange(e, setDeductibleCATStock)}
                        placeholder="e.g., 25,000"
                      />
                    </div>
                  </>
                )}
                {(businessType === 'Transit Only' || businessType === 'Stock Throughput') && (
                  <div className="flex flex-col">
                    <label htmlFor="deductibleTransit" className="text-xs font-medium text-gray-600 mb-1">
                      Transit:
                    </label>
                    <input
                      type="text"
                      id="deductibleTransit"
                      className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      value={formatNumberWithCommas(deductibleTransit)}
                      onChange={(e) => handleMonetaryInputChange(e, setDeductibleTransit)}
                      placeholder="e.g., 5,000"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Limits */}
          {(businessType === 'Stock Only' || businessType === 'Stock Throughput' || businessType === 'Transit Only') && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Limits (USD):</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(businessType === 'Stock Only' || businessType === 'Stock Throughput') && (
                  <>
                    <div className="flex flex-col">
                      <label htmlFor="limitAOPStock" className="text-xs font-medium text-gray-600 mb-1">
                        AOP (Stock):
                      </label>
                      <input
                        type="text"
                        id="limitAOPStock"
                        className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        value={formatNumberWithCommas(limitAOPStock)}
                        onChange={(e) => handleMonetaryInputChange(e, setLimitAOPStock)}
                        placeholder="e.g., 1,000,000"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="limitCATStock" className="text-xs font-medium text-gray-600 mb-1">
                        CAT (Earthquake, Flood and Windstorm):
                      </label>
                      <input
                        type="text"
                        id="limitCATStock"
                        className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        value={formatNumberWithCommas(limitCATStock)}
                        onChange={(e) => handleMonetaryInputChange(e, setLimitCATStock)}
                        placeholder="e.g., 2,000,000"
                      />
                    </div>
                  </>
                )}
                {(businessType === 'Transit Only' || businessType === 'Stock Throughput') && (
                  <div className="flex flex-col">
                    <label htmlFor="limitTransit" className="text-xs font-medium text-gray-600 mb-1">
                      Transit:
                    </label>
                    <input
                      type="text"
                      id="limitTransit"
                      className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      value={formatNumberWithCommas(limitTransit)}
                      onChange={(e) => handleMonetaryInputChange(e, setLimitTransit)}
                      placeholder="e.g., 500,000"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Target Premium */}
          <div className="flex flex-col">
            <label htmlFor="targetPremium" className="text-sm font-medium text-gray-700 mb-1">
              Target Premium (USD):
            </label>
            <input
              type="text"
              id="targetPremium"
              className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              value={formatNumberWithCommas(targetPremium)}
              onChange={(e) => handleMonetaryInputChange(e, setTargetPremium)}
              placeholder="e.g., 50,000"
            />
          </div>

          {/* Brokerage */}
          <div className="flex flex-col">
            <label htmlFor="brokerage" className="text-sm font-medium text-gray-700 mb-1">
              Brokerage (%):
            </label>
            <input
              type="number"
              id="brokerage"
              className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              value={brokerage}
              onChange={(e) => setBrokerage(e.target.value)}
              placeholder="e.g., 27.5"
            />
          </div>
        </div>

        {/* Generate Email Button */}
        <button
          onClick={generateEmail}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          Generate Email Submission
        </button>

        {/* Generated Email Output */}
        {generatedEmailBody && (
          <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Generated Email:</h2>

            <div className="flex flex-col mb-4">
              <label htmlFor="emailSubject" className="text-sm font-medium text-gray-700 mb-1">
                Subject:
              </label>
              <input
                type="text"
                id="emailSubject"
                ref={emailSubjectInputRef}
                readOnly
                className="p-3 border border-gray-300 rounded-md bg-white text-gray-900 font-mono text-sm"
                value={generatedEmailSubject}
              />
              <button
                onClick={copySubjectToClipboard}
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
              >
                Copy Subject
              </button>
            </div>

            <label className="text-sm font-medium text-gray-700 mb-1">Email Body (Rich Text Preview):</label>
            <div
              ref={emailBodyDivRef}
              className="w-full p-4 border border-gray-300 rounded-md bg-white text-gray-900 text-sm overflow-auto max-h-96"
              dangerouslySetInnerHTML={{ __html: generatedEmailBody }}
            ></div>
            <button
              onClick={copyBodyToClipboard}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
            >
              {copySuccess || 'Copy Email Body (Rich Text)'}
            </button>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Instructions for pasting into Outlook:</strong>
              <br />1. Copy the "Subject" and paste it into the subject line of your new email.
              <br />2. Click "Copy Email Body (Rich Text)".
              <br />3. Open a new email in Outlook, click into the body, and press Ctrl+V (Windows) or Cmd+V (Mac).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
