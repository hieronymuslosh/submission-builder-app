import { formatCurrencyForEmail, formatPercentageForEmail } from './formatters.js';

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

  const lossHistoryDetails = (lossHistory || [])
    .map(
      (entry, index) =>
        `<p style="margin-bottom: 0.5em; line-height: 1.5;">${new Date().getFullYear() - (4 - index)}: ${entry || 'No losses reported'}</p>`,
    )
    .join('');

  // Determine the date part for the subject line
  let subjectDatePart = 'TBA';
  if (!isDateTBA && inceptionDate) {
    const [year, month, day] = inceptionDate.split('-'); // YYYY-MM-DD
    subjectDatePart = `${day}/${month}/${year.slice(2)}`; // DD/MM/YY
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
<div style="margin-bottom: 1.5em;">
<p style="margin-top: 1.5em; margin-bottom: 0.8em; line-height: 1.5;"><strong><u>Transits:</u></strong></p>
<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Max Value Any One Conveyance:</strong> ${formatCurrencyForEmail(maxConveyance)}</p>
<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Average Value Any One Conveyance:</strong> ${formatCurrencyForEmail(averageConveyance)}</p>
<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Estimated Sales for Forthcoming Policy Period:</strong> ${isEstimatedSalesUnknown ? 'To Be Advised' : formatCurrencyForEmail(estimatedSales)}</p>

<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Incoming Transit Volume:</strong> ${formatCurrencyForEmail(incomingTransitVolumeTotal)}</p>
<ul style="margin-top: 0; margin-bottom: 0.5em; padding-left: 20px;">
  <li style="margin-bottom: 0.2em; line-height: 1.5;">Domestic: ${formatPercentageForEmail(incomingDomesticPct)}</li>
  <li style="margin-bottom: 0.2em; line-height: 1.5;">International: ${formatPercentageForEmail(incomingInternationalPct)}</li>
  <li style="margin-bottom: 0.2em; line-height: 1.5;">Primary: ${formatPercentageForEmail(incomingPrimaryPct)}</li>
  <li style="margin-bottom: 0.2em; line-height: 1.5;">Contingent: ${formatPercentageForEmail(incomingContingentPct)}</li>
</ul>
<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Incoming Transit Basis of Valuation:</strong> ${getBovDisplay(bovIncomingTransit, bovIncomingTransitOther)}</p>

<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Outgoing Transit Volume:</strong> ${formatCurrencyForEmail(outgoingTransitVolumeTotal)}</p>
<ul style="margin-top: 0; margin-bottom: 0.5em; padding-left: 20px;">
  <li style="margin-bottom: 0.2em; line-height: 1.5;">Domestic: ${formatPercentageForEmail(outgoingDomesticPct)}</li>
  <li style="margin-bottom: 0.2em; line-height: 1.5;">International: ${formatPercentageForEmail(outgoingInternationalPct)}</li>
  <li style="margin-bottom: 0.2em; line-height: 1.5;">Primary: ${formatPercentageForEmail(outgoingPrimaryPct)}</li>
  <li style="margin-bottom: 0.2em; line-height: 1.5;">Contingent: ${formatPercentageForEmail(outgoingContingentPct)}</li>
</ul>
<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Outgoing Transit Basis of Valuation:</strong> ${getBovDisplay(bovOutgoingTransit, bovOutgoingTransitOther)}</p>
</div>
`;
  }

  let storageSectionHtml = '';
  if (includeStockInfo) {
    storageSectionHtml = `
<div style="margin-bottom: 1.5em;">
<p style="margin-top: 1.5em; margin-bottom: 0.8em; line-height: 1.5;"><strong><u>Storage:</u></strong></p>
<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Max TIV:</strong> ${formatCurrencyForEmail(maxTIV)}</p>
<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Average TIV:</strong> ${formatCurrencyForEmail(averageTIV)}</p>
<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Max Any One Location:</strong> ${formatCurrencyForEmail(maxAnyOneLocation)}</p>
<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Stock Basis of Valuation:</strong> ${getBovDisplay(bovStock, bovStockOther)}</p>
</div>
`;
  }

  let deductiblesSection = '';
  if ((includeStockInfo && (deductibleAOPStock || deductibleCATStock)) || (includeTransitInfo && deductibleTransit)) {
    deductiblesSection = `
<div style="margin-bottom: 1.5em;">
<p style="margin-top: 1.5em; margin-bottom: 0.8em; line-height: 1.5;"><strong><u>Target Deductibles:</u></strong></p>
<ul style="margin-top: 0; margin-bottom: 0.5em; padding-left: 20px;">`;

    if (includeStockInfo) {
      deductiblesSection += `<li style="margin-bottom: 0.2em; line-height: 1.5;">AOP (Stock): ${formatCurrencyForEmail(deductibleAOPStock)}</li>`;
      deductiblesSection += `<li style="margin-bottom: 0.2em; line-height: 1.5;">CAT (Earthquake, Flood and Windstorm): ${formatCurrencyForEmail(deductibleCATStock)}</li>`;
    }

    if (includeTransitInfo) {
      deductiblesSection += `<li style="margin-bottom: 0.2em; line-height: 1.5;">Transit: ${formatCurrencyForEmail(deductibleTransit)}</li>`;
    }

    deductiblesSection += `</ul></div>`;
  }

  let limitsSection = '';
  if ((includeStockInfo && (limitAOPStock || limitCATStock)) || (includeTransitInfo && limitTransit)) {
    limitsSection = `
<div style="margin-bottom: 1.5em;">
<p style="margin-top: 1.5em; margin-bottom: 0.8em; line-height: 1.5;"><strong><u>Limits:</u></strong></p>
<ul style="margin-top: 0; margin-bottom: 0.5em; padding-left: 20px;">`;

    if (includeStockInfo) {
      limitsSection += `<li style="margin-bottom: 0.2em; line-height: 1.5;">AOP (Stock): ${formatCurrencyForEmail(limitAOPStock)}</li>`;
      limitsSection += `<li style="margin-bottom: 0.2em; line-height: 1.5;">CAT (Earthquake, Flood and Windstorm): ${formatCurrencyForEmail(limitCATStock)} (annually aggregated)</li>`;
    }

    if (includeTransitInfo) {
      limitsSection += `<li style="margin-bottom: 0.2em; line-height: 1.5;">Transit: ${formatCurrencyForEmail(limitTransit)}</li>`;
    }

    limitsSection += `</ul></div>`;
  }

  const bodyHtml = `
<p style="margin-bottom: 1em; line-height: 1.5;">Dear Underwriters,</p>

<p style="margin-bottom: 1em; line-height: 1.5;">Please find below the details for a new Marine Cargo / Stock Throughput submission for your consideration.</p>

<hr style="border: none; border-top: 1px solid #ccc; margin: 1em 0;">
<p style="margin-bottom: 1em; line-height: 1.5;"><strong><u>SUBMISSION DETAILS</u></strong></p>
<hr style="border: none; border-top: 1px solid #ccc; margin: 1em 0;">

<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Insured Name:</strong> ${insuredName || 'N/A'}</p>
<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Insured Website:</strong> ${insuredWebsite || 'N/A'}</p>
<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Insured Address:</strong> ${insuredAddress || 'N/A'}</p>
<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Business Type:</strong> ${businessType || 'N/A'}</p>
<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Inception Date:</strong> ${isDateTBA ? 'To Be Advised' : inceptionDate || 'N/A'}</p>
<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Business Status:</strong> ${businessStatus || 'N/A'}</p>

<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Insured Narrative:</strong><br>${insuredNarrative || 'N/A'}</p>

<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Interest:</strong><br>${interest || 'N/A'}</p>
${transitSectionHtml}
${storageSectionHtml}
<div style="margin-bottom: 1.5em;">
<p style="margin-top: 1.5em; margin-bottom: 0.8em; line-height: 1.5;"><strong><u>Loss Record (5-Year History):</u></strong></p>
${lossHistoryDetails}
</div>
${isRenewal ? `<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Expiring Premium:</strong> ${formatCurrencyForEmail(expiringPremium)}</p>` : ''}
${deductiblesSection}
${limitsSection}
<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Target Premium:</strong> ${formatCurrencyForEmail(targetPremium)}</p>
<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Brokerage:</strong> ${formatPercentageForEmail(brokerage)}</p>

<hr style="border: none; border-top: 1px solid #ccc; margin: 1em 0;">

<p style="margin-bottom: 1em; line-height: 1.5;">We look forward to your terms. Please let us know if you require any further information or clarification to provide a quotation.</p>

<p style="margin-bottom: 1em; line-height: 1.5;">Kind regards,</p>

<p style="margin-bottom: 0.5em; line-height: 1.5;">[Your Name/Your Company Name]<br>[Your Contact Information]</p>
`;

  return { subject, bodyHtml };
};
