import { formatCurrencyForEmail, formatPercentageForEmail } from './formatters.js';

const PARAGRAPH_STYLE = 'margin: 0 0 12px 0; line-height: 1.5; mso-line-height-rule: exactly;';
const PARAGRAPH_TIGHT_STYLE = 'margin: 0 0 8px 0; line-height: 1.5; mso-line-height-rule: exactly;';
const SECTION_STYLE = 'margin: 0 0 20px 0;';
const LIST_STYLE = 'margin: 0 0 12px 0; padding-left: 20px;';
const LIST_ITEM_STYLE = 'margin: 0 0 6px 0; line-height: 1.5; mso-line-height-rule: exactly;';
const RULE_STYLE = 'border: none; border-top: 1px solid #ccc; margin: 12px 0;';

const paragraph = (content, style = PARAGRAPH_STYLE) => `<p style="${style}">${content}</p>`;
const sectionHeading = (title) => paragraph(`<strong><u>${title}</u></strong>`, PARAGRAPH_STYLE);
const formatInceptionDate = (inceptionDate) => {
  if (!inceptionDate) return '';
  const [year, month, day] = inceptionDate.split('-');
  if (!year || !month || !day) return inceptionDate;
  return `${day}/${month}/${year}`;
};

// Email generation (extracted from App.jsx)
// Input: an object containing all state fields
// Output: { subject, bodyHtml }
export const generateEmail = ({
  inceptionDate,
  isDateTBA,
  businessType,
  businessStatus,
  insuredName,
  insuredWebsite,
  insuredAddress,
  insuredNarrative,
  interest,

  // Basis of valuation
  bovStock,
  bovStockOther,
  bovIncomingTransit,
  bovIncomingTransitOther,
  bovOutgoingTransit,
  bovOutgoingTransitOther,

  // Proposed (stock)
  maxTIV,
  averageTIV,
  maxAnyOneLocation,
  deductibleAOPStock,
  deductibleCATStock,
  limitAOPStock,
  limitCATStock,

  // Proposed (transit)
  maxConveyance,
  averageConveyance,
  estimatedSales,
  isEstimatedSalesUnknown,
  deductibleTransit,
  limitTransit,

  // Transit volumes
  incomingTransitVolumeTotal,
  outgoingTransitVolumeTotal,

  // Transit splits
  incomingDomesticPct,
  incomingInternationalPct,
  incomingPrimaryPct,
  incomingContingentPct,
  outgoingDomesticPct,
  outgoingInternationalPct,
  outgoingPrimaryPct,
  outgoingContingentPct,

  // Losses + premium
  lossHistory,
  expiringPremium,
  targetPremium,
  brokerage,
}) => {
  const getBovDisplay = (bovValue, bovOtherValue) => {
    return bovValue === 'Other' ? bovOtherValue || 'Other (N/A)' : bovValue || 'N/A';
  };

  const formattedInceptionDate = isDateTBA ? 'To Be Advised' : formatInceptionDate(inceptionDate) || 'N/A';

  const lossHistoryDetails = (lossHistory || [])
    .map(
      (entry, index) =>
        paragraph(`${new Date().getFullYear() - (4 - index)}: ${entry || 'No losses reported'}`, PARAGRAPH_TIGHT_STYLE),
    )
    .join('');

  // Determine the date part for the subject line
  let subjectDatePart = 'TBA';
  if (!isDateTBA && inceptionDate) {
    subjectDatePart = formatInceptionDate(inceptionDate) || inceptionDate;
  }

  const subjectStatusPart = businessStatus || 'N/A';
  const subject = `${insuredName || 'New Risk'} - ${subjectStatusPart} - eff. ${subjectDatePart}`;

  // Conditional rendering for email content sections
  const includeStockInfo = businessType === 'Stock Only' || businessType === 'Stock Throughput';
  const includeTransitInfo = businessType === 'Transit Only' || businessType === 'Stock Throughput';
  const isRenewal = businessStatus === 'Renewal';

  let transitSectionHtml = '';
  if (includeTransitInfo) {
    transitSectionHtml = `
<div style="${SECTION_STYLE}">
${sectionHeading('Transits:')}
${paragraph(`<strong>Max Value Any One Conveyance:</strong> ${formatCurrencyForEmail(maxConveyance)}`, PARAGRAPH_TIGHT_STYLE)}
${paragraph(`<strong>Average Value Any One Conveyance:</strong> ${formatCurrencyForEmail(averageConveyance)}`, PARAGRAPH_TIGHT_STYLE)}
${paragraph(`<strong>Estimated Sales for Forthcoming Policy Period:</strong> ${isEstimatedSalesUnknown ? 'To Be Advised' : formatCurrencyForEmail(estimatedSales)}`, PARAGRAPH_TIGHT_STYLE)}
${paragraph(`<strong>Incoming Transit Volume:</strong> ${formatCurrencyForEmail(incomingTransitVolumeTotal)}`, PARAGRAPH_TIGHT_STYLE)}
<ul style="${LIST_STYLE}">
  <li style="${LIST_ITEM_STYLE}">Domestic: ${formatPercentageForEmail(incomingDomesticPct)}</li>
  <li style="${LIST_ITEM_STYLE}">International: ${formatPercentageForEmail(incomingInternationalPct)}</li>
  <li style="${LIST_ITEM_STYLE}">Primary: ${formatPercentageForEmail(incomingPrimaryPct)}</li>
  <li style="${LIST_ITEM_STYLE}">Contingent: ${formatPercentageForEmail(incomingContingentPct)}</li>
</ul>
${paragraph(`<strong>Incoming Transit Basis of Valuation:</strong> ${getBovDisplay(bovIncomingTransit, bovIncomingTransitOther)}`, PARAGRAPH_TIGHT_STYLE)}
${paragraph(`<strong>Outgoing Transit Volume:</strong> ${formatCurrencyForEmail(outgoingTransitVolumeTotal)}`, PARAGRAPH_TIGHT_STYLE)}
<ul style="${LIST_STYLE}">
  <li style="${LIST_ITEM_STYLE}">Domestic: ${formatPercentageForEmail(outgoingDomesticPct)}</li>
  <li style="${LIST_ITEM_STYLE}">International: ${formatPercentageForEmail(outgoingInternationalPct)}</li>
  <li style="${LIST_ITEM_STYLE}">Primary: ${formatPercentageForEmail(outgoingPrimaryPct)}</li>
  <li style="${LIST_ITEM_STYLE}">Contingent: ${formatPercentageForEmail(outgoingContingentPct)}</li>
</ul>
${paragraph(`<strong>Outgoing Transit Basis of Valuation:</strong> ${getBovDisplay(bovOutgoingTransit, bovOutgoingTransitOther)}`, PARAGRAPH_TIGHT_STYLE)}
</div>
`;
  }

  let storageSectionHtml = '';
  if (includeStockInfo) {
    storageSectionHtml = `
<div style="${SECTION_STYLE}">
${sectionHeading('Storage:')}
${paragraph(`<strong>Max TIV:</strong> ${formatCurrencyForEmail(maxTIV)}`, PARAGRAPH_TIGHT_STYLE)}
${paragraph(`<strong>Average TIV:</strong> ${formatCurrencyForEmail(averageTIV)}`, PARAGRAPH_TIGHT_STYLE)}
${paragraph(`<strong>Max Any One Location:</strong> ${formatCurrencyForEmail(maxAnyOneLocation)}`, PARAGRAPH_TIGHT_STYLE)}
${paragraph(`<strong>Stock Basis of Valuation:</strong> ${getBovDisplay(bovStock, bovStockOther)}`, PARAGRAPH_TIGHT_STYLE)}
</div>
`;
  }

  let deductiblesSection = '';
  if ((includeStockInfo && (deductibleAOPStock || deductibleCATStock)) || (includeTransitInfo && deductibleTransit)) {
    let deductibleItems = '';

    if (includeStockInfo) {
      deductibleItems += `<li style="${LIST_ITEM_STYLE}">AOP (Stock): ${formatCurrencyForEmail(deductibleAOPStock)}</li>`;
      deductibleItems += `<li style="${LIST_ITEM_STYLE}">CAT (Earthquake, Flood and Windstorm): ${formatCurrencyForEmail(deductibleCATStock)}</li>`;
    }

    if (includeTransitInfo) {
      deductibleItems += `<li style="${LIST_ITEM_STYLE}">Transit: ${formatCurrencyForEmail(deductibleTransit)}</li>`;
    }

    deductiblesSection = `
<div style="${SECTION_STYLE}">
${sectionHeading('Target Deductibles:')}
<ul style="${LIST_STYLE}">${deductibleItems}</ul>
</div>`;
  }

  let limitsSection = '';
  if ((includeStockInfo && (limitAOPStock || limitCATStock)) || (includeTransitInfo && limitTransit)) {
    let limitItems = '';

    if (includeStockInfo) {
      limitItems += `<li style="${LIST_ITEM_STYLE}">AOP (Stock): ${formatCurrencyForEmail(limitAOPStock)}</li>`;
      limitItems += `<li style="${LIST_ITEM_STYLE}">CAT (Earthquake, Flood and Windstorm): ${formatCurrencyForEmail(limitCATStock)} (annually aggregated)</li>`;
    }

    if (includeTransitInfo) {
      limitItems += `<li style="${LIST_ITEM_STYLE}">Transit: ${formatCurrencyForEmail(limitTransit)}</li>`;
    }

    limitsSection = `
<div style="${SECTION_STYLE}">
${sectionHeading('Limits:')}
<ul style="${LIST_STYLE}">${limitItems}</ul>
</div>`;
  }

  const bodyHtml = `
<div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #000;">
${paragraph('Dear Underwriters,')}
${paragraph('Please find below the details for a new Marine Cargo / Stock Throughput submission for your consideration.')}
<hr style="${RULE_STYLE}">
${sectionHeading('SUBMISSION DETAILS')}
<hr style="${RULE_STYLE}">
${paragraph(`<strong>Insured Name:</strong> ${insuredName || 'N/A'}`, PARAGRAPH_TIGHT_STYLE)}
${paragraph(`<strong>Insured Website:</strong> ${insuredWebsite || 'N/A'}`, PARAGRAPH_TIGHT_STYLE)}
${paragraph(`<strong>Insured Address:</strong> ${insuredAddress || 'N/A'}`, PARAGRAPH_TIGHT_STYLE)}
${paragraph(`<strong>Business Type:</strong> ${businessType || 'N/A'}`, PARAGRAPH_TIGHT_STYLE)}
${paragraph(`<strong>Inception Date:</strong> ${formattedInceptionDate}`, PARAGRAPH_TIGHT_STYLE)}
${paragraph(`<strong>Business Status:</strong> ${businessStatus || 'N/A'}`, PARAGRAPH_TIGHT_STYLE)}
${paragraph(`<strong>Insured Narrative:</strong>`, PARAGRAPH_TIGHT_STYLE)}
${paragraph(insuredNarrative || 'N/A')}
${paragraph(`<strong>Interest:</strong>`, PARAGRAPH_TIGHT_STYLE)}
${paragraph(interest || 'N/A')}
${transitSectionHtml}
${storageSectionHtml}
<div style="${SECTION_STYLE}">
${sectionHeading('Loss Record (5-Year History):')}
${lossHistoryDetails}
</div>
${isRenewal ? paragraph(`<strong>Expiring Premium:</strong> ${formatCurrencyForEmail(expiringPremium)}`, PARAGRAPH_TIGHT_STYLE) : ''}
${deductiblesSection}
${limitsSection}
${paragraph(`<strong>Target Premium:</strong> ${formatCurrencyForEmail(targetPremium)}`, PARAGRAPH_TIGHT_STYLE)}
${paragraph(`<strong>Brokerage:</strong> ${formatPercentageForEmail(brokerage)}`, PARAGRAPH_TIGHT_STYLE)}
<hr style="${RULE_STYLE}">
${paragraph('We look forward to your terms. Please let us know if you require any further information or clarification to provide a quotation.')}
${paragraph('Kind regards,')}
${paragraph('[Your Name/Your Company Name]<br>[Your Contact Information]', PARAGRAPH_TIGHT_STYLE)}
</div>
`;

  return { subject, bodyHtml };
};
