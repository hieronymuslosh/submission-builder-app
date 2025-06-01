import React, { useState, useRef } from 'react';

// Main App component for the Marine Cargo Email Submission Generator
const App = () => {
    // State variables to store input values.
    // Monetary values will store the raw number, and display will be handled by formatting.
    const [inceptionDate, setInceptionDate] = useState('');
    const [isDateTBA, setIsDateTBA] = useState(false); // New: To Be Advised checkbox state for Inception Date
    const [businessType, setBusinessType] = useState(''); // stock only, stock throughput, transit only
    const [businessStatus, setBusinessStatus] = useState(''); // New or Renewal
    const [insuredName, setInsuredName] = useState('');
    const [insuredWebsite, setInsuredWebsite] = useState(''); // New: Insured Website field
    const [insuredAddress, setInsuredAddress] = useState(''); // New: Insured Address field
    const [insuredNarrative, setInsuredNarrative] = useState('');
    const [interest, setInterest] = useState(''); // Updated: Interest field
    
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
    const [isEstimatedSalesUnknown, setIsEstimatedSalesUnknown] = useState(false); // New: Unknown checkbox for Estimated Sales
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
    const [isRandomizeEnabled, setIsRandomizeEnabled] = useState(false); // State for randomize checkbox
    const [isFetchingNarrative, setIsFetchingNarrative] = useState(false); // State for loading indicator for narrative
    const [isFetchingInterest, setIsFetchingInterest] = useState(false); // New: State for loading indicator for interest
    // isFetchingAddress state removed as per request

    // Ref for the div containing the generated email body
    const emailBodyDivRef = useRef(null);
    // Ref for the input containing the generated email subject
    const emailSubjectInputRef = useRef(null);

    // Helper function to format a number with commas for display in input fields
    const formatNumberWithCommas = (value) => {
        if (!value) return '';
        // Remove existing commas and then format
        const num = parseFloat(value.toString().replace(/,/g, ''));
        return isNaN(num) ? '' : num.toLocaleString('en-US');
    };

    // Generic handler for monetary input fields
    const handleMonetaryInputChange = (e, setter) => {
        const rawValue = e.target.value.replace(/[^0-9.]/g, ''); // Allow only numbers and a single decimal point
        setter(rawValue); // Store raw value in state
    };

    // Generic handler for percentage input fields
    const handlePercentageInputChange = (e, setter) => {
        const rawValue = e.target.value.replace(/[^0-9.]/g, ''); // Allow only numbers and a single decimal point
        // Optional: Add validation to ensure it's between 0 and 100
        setter(rawValue);
    };

    // Function to handle changes in loss history input fields
    const handleLossHistoryChange = (index, value) => {
        const newLossHistory = [...lossHistory];
        newLossHistory[index] = value;
        setLossHistory(newLossHistory);
    };

    // Function to format currency with commas for the email output
    const formatCurrencyForEmail = (value) => {
        if (!value) return 'N/A';
        const num = parseFloat(value);
        return isNaN(num) ? 'N/A' : `USD ${num.toLocaleString('en-US')}`;
    };

    // Function to format percentage for email output
    const formatPercentageForEmail = (value) => {
        if (!value) return 'N/A';
        const num = parseFloat(value);
        return isNaN(num) ? 'N/A' : `${num}%`;
    };

    // Function to generate random data for fields
    const randomizeFields = () => {
        const randomDate = new Date(Date.now() - Math.floor(Math.random() * 365 * 5 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
        setInceptionDate(randomDate);
        setIsDateTBA(Math.random() < 0.2); // 20% chance of TBA

        const businessTypes = ['Stock Only', 'Stock Throughput', 'Transit Only'];
        setBusinessType(businessTypes[Math.floor(Math.random() * businessTypes.length)]);

        const businessStatuses = ['New', 'Renewal'];
        const randomBusinessStatus = businessStatuses[Math.floor(Math.random() * businessStatuses.length)];
        setBusinessStatus(randomBusinessStatus);

        const insuredNames = ['Global Logistics Corp.', 'Oceanic Importers Ltd.', 'Trans-Continental Freight', 'Coastal Supply Co.', 'Apex Distributors Inc.'];
        const randomInsuredName = insuredNames[Math.floor(Math.random() * insuredNames.length)];
        setInsuredName(randomInsuredName);

        const randomWebsites = [
            'www.globallogistics.com', 'www.oceanicimports.net', 'www.transcontinentalfreight.org',
            'www.coastalsupply.co', 'www.apexdistributors.biz', 'www.example-company.com'
        ];
        setInsuredWebsite(randomWebsites[Math.floor(Math.random() * randomWebsites.length)]);

        const randomAddresses = [
            '123 Main St, Anytown, CA 90210, USA',
            '456 Ocean Ave, Seaville, FL 33101, USA',
            '789 Industrial Rd, Metro City, TX 75001, USA',
            '101 Commerce Blvd, Portsville, WA 98001, USA',
            '222 Business Park Dr, Techville, NY 10001, USA'
        ];
        // Insured address randomization removed as per request - but re-added here for initial state if fetch is mocked
        setInsuredAddress(randomAddresses[Math.floor(Math.random() * randomAddresses.length)]);

        setInsuredNarrative(`This is a randomly generated narrative for ${randomInsuredName}. The insured specializes in global distribution of various goods, utilizing diverse transport modes and storage facilities across key international international hubs.`);
        
        const interests = ['Electronics', 'Textiles', 'Perishable Goods', 'Automotive Parts', 'Industrial Machinery', 'Pharmaceuticals', 'Luxury Goods'];
        setInterest(interests[Math.floor(Math.random() * interests.length)]);

        const bovOptions = ['Selling price', 'Replacement Cost', 'CIF + 10%', 'Other'];
        const randomBov = () => bovOptions[Math.floor(Math.random() * bovOptions.length)];
        
        const setRandomBovAndOther = (setter, otherSetter) => {
            const selectedBov = randomBov();
            setter(selectedBov);
            if (selectedBov === 'Other') {
                otherSetter(`Custom BOV ${Math.floor(Math.random() * 100)}`);
            } else {
                otherSetter('');
            }
        };

        setRandomBovAndOther(setBovStock, setBovStockOther);
        setRandomBovAndOther(setBovIncomingTransit, setBovIncomingTransitOther);
        setRandomBovAndOther(setBovOutgoingTransit, setBovOutgoingTransitOther);


        // Random monetary values (Proposed)
        setMaxTIV(String(Math.floor(Math.random() * (50000000 - 1000000) + 1000000)));
        setAverageTIV(String(Math.floor(Math.random() * (10000000 - 100000) + 100000)));
        setMaxAnyOneLocation(String(Math.floor(Math.random() * (15000000 - 500000) + 500000)));
        setMaxConveyance(String(Math.floor(Math.random() * (2000000 - 100000) + 100000)));
        setAverageConveyance(String(Math.floor(Math.random() * (500000 - 50000) + 50000)));
        setEstimatedSales(String(Math.floor(Math.random() * (100000000 - 10000000) + 10000000)));
        setIsEstimatedSalesUnknown(Math.random() < 0.1); // 10% chance of unknown sales

        // Random deductibles
        setDeductibleAOPStock(String(Math.floor(Math.random() * (25000 - 5000) + 5000)));
        setDeductibleCATStock(String(Math.random() * (50000 - 10000) + 10000)));
        setDeductibleTransit(String(Math.floor(Math.random() * (10000 - 1000) + 1000)));

        // Random limits
        setLimitAOPStock(String(Math.floor(Math.random() * (5000000 - 500000) + 500000)));
        setLimitCATStock(String(Math.floor(Math.random() * (10000000 - 1000000) + 1000000)));
        setLimitTransit(String(Math.floor(Math.random() * (2000000 - 200000) + 200000)));

        // Random transit volume totals
        setIncomingTransitVolumeTotal(String(Math.floor(Math.random() * (50000000 - 5000000) + 5000000)));
        setOutgoingTransitVolumeTotal(String(Math.floor(Math.random() * (70000000 - 7000000) + 7000000)));

        // Random percentages for splits (ensuring they sum to 100 for each pair)
        const randIntPct = Math.floor(Math.random() * 100); // 0-100
        setIncomingInternationalPct(String(randIntPct));
        setIncomingDomesticPct(String(100 - randIntPct));

        const randPrimPct = Math.floor(Math.random() * 100); // 0-100
        setIncomingPrimaryPct(String(randPrimPct));
        setIncomingContingentPct(String(100 - randPrimPct));

        const randOutIntPct = Math.floor(Math.random() * 100); // 0-100
        setOutgoingInternationalPct(String(randOutIntPct));
        setOutgoingDomesticPct(String(100 - randOutIntPct));

        const randOutPrimPct = Math.floor(Math.random() * 100); // 0-100
        setOutgoingPrimaryPct(String(randOutPrimPct));
        setOutgoingContingentPct(String(100 - randOutPrimPct));

        // Random loss history
        const randomLosses = Array(5).fill('').map((_, i) => {
            const r = Math.random();
            if (r < 0.4) return 'No losses';
            if (r < 0.7) return `1 claim, USD ${Math.floor(Math.random() * (50000 - 1000) + 1000).toLocaleString('en-US')}`;
            return `Multiple claims, total USD ${Math.floor(Math.random() * (200000 - 10000) + 10000).toLocaleString('en-US')}`;
        });
        setLossHistory(randomLosses);

        setTargetPremium(String(Math.floor(Math.random() * (100000 - 10000) + 10000)));
        setBrokerage(String((Math.random() * (30 - 15) + 15).toFixed(1))); // Random brokerage between 15% and 30%

        // Random Expiring Premium if businessStatus is Renewal
        if (randomBusinessStatus === 'Renewal') {
            setExpiringPremium(String(Math.floor(Math.random() * (90000 - 8000) + 8000))); // Slightly lower than proposed
        } else {
            setExpiringPremium('');
        }

        setGeneratedEmailBody(''); // Clear generated email when randomizing
        setGeneratedEmailSubject('');
    };

    // Function to get BOV display value
    const getBovDisplay = (bovValue, bovOtherValue) => {
        return bovValue === 'Other' ? bovOtherValue || 'Other (N/A)' : bovValue || 'N/A';
    };

    // Function to generate the email content based on current state
    const generateEmail = () => {
        const lossHistoryDetails = lossHistory.map((entry, index) =>
            `<p style="margin-bottom: 0.5em; line-height: 1.5;">${new Date().getFullYear() - (4 - index)}: ${entry || 'No losses reported'}</p>`
        ).join('');

        // Determine the date part for the subject line
        let subjectDatePart = 'TBA';
        if (!isDateTBA && inceptionDate) {
            const [year, month, day] = inceptionDate.split('-'); //YYYY-MM-DD
            subjectDatePart = `${day}/${month}/${year.slice(2)}`; // DD/MM/YY
        }

        // Determine the business status part for the subject line
        const subjectStatusPart = businessStatus || 'N/A';

        // Construct the email subject line
        const emailSubject = `${insuredName || 'New Risk'} - ${subjectStatusPart} - eff. ${subjectDatePart}`;

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
        // Only render deductibles section if any relevant deductible is present
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
        // Only render limits section if any relevant limit is present
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


        const emailBodyHtml = `
<p style="margin-bottom: 1em; line-height: 1.5;">Dear Underwriters,</p>

<p style="margin-bottom: 1em; line-height: 1.5;">Please find below the details for a new Marine Cargo / Stock Throughput submission for your consideration.</p>

<hr style="border: none; border-top: 1px solid #ccc; margin: 1em 0;">
<p style="margin-bottom: 1em; line-height: 1.5;"><strong><u>SUBMISSION DETAILS</u></strong></p>
<hr style="border: none; border-top: 1px solid #ccc; margin: 1em 0;">

<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Insured Name:</strong> ${insuredName || 'N/A'}</p>
<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Insured Website:</strong> ${insuredWebsite || 'N/A'}</p>
<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Insured Address:</strong> ${insuredAddress || 'N/A'}</p>
<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Business Type:</strong> ${businessType || 'N/A'}</p>
<p style="margin-bottom: 0.5em; line-height: 1.5;"><strong>Inception Date:</strong> ${isDateTBA ? 'To Be Advised' : (inceptionDate || 'N/A')}</p>
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

<hr style="border: none; border-top: 1.px solid #ccc; margin: 1em 0;">

<p style="margin-bottom: 1em; line-height: 1.5;">We look forward to your terms. Please let us know if you require any further information or clarification to provide a quotation.</p>

<p style="margin-bottom: 1em; line-height: 1.5;">Kind regards,</p>

<p style="margin-bottom: 0.5em; line-height: 1.5;">[Your Name/Your Company Name]<br>[Your Contact Information]</p>
`;

        setGeneratedEmailSubject(emailSubject);
        setGeneratedEmailBody(emailBodyHtml);
        setCopySuccess(''); // Reset copy success message
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
            selection.removeAllRanges(); // Deselect
            setTimeout(() => setCopySuccess(''), 3000); // Clear message after 3 seconds
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
            setTimeout(() => setCopySuccess(''), 3000); // Clear message after 3 seconds
        }
    };

    const handleRandomizeToggle = (e) => {
        const checked = e.target.checked;
        setIsRandomizeEnabled(checked);
        if (checked) {
            randomizeFields();
        } else {
            // Clear fields if randomize is unchecked
            setInceptionDate('');
            setIsDateTBA(false);
            setBusinessType('');
            setBusinessStatus('');
            setInsuredName('');
            setInsuredWebsite(''); // Clear website field
            setInsuredAddress(''); // Clear address field
            setInsuredNarrative('');
            setInterest('');
            setBovStock('');
            setBovStockOther('');
            setBovIncomingTransit('');
            setBovIncomingTransitOther('');
            setBovOutgoingTransit('');
            setBovOutgoingTransitOther('');
            setMaxTIV('');
            setAverageTIV('');
            setMaxAnyOneLocation('');
            setDeductibleAOPStock('');
            setDeductibleCATStock('');
            setLimitAOPStock('');
            setLimitCATStock('');
            setMaxConveyance('');
            setAverageConveyance('');
            setEstimatedSales('');
            setIsEstimatedSalesUnknown(false);
            setDeductibleTransit('');
            setLimitTransit('');
            setIncomingTransitVolumeTotal('');
            setOutgoingTransitVolumeTotal('');
            setIncomingDomesticPct('');
            setIncomingInternationalPct('');
            setIncomingPrimaryPct('');
            setIncomingContingentPct('');
            setOutgoingDomesticPct('');
            setOutgoingInternationalPct('');
            setOutgoingPrimaryPct('');
            setOutgoingContingentPct('');
            setLossHistory(Array(5).fill(''));
            setTargetPremium('');
            setBrokerage('');
            setGeneratedEmailBody('');
            setGeneratedEmailSubject('');
            setExpiringPremium(''); // Clear expiring premium
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

        // MOCKED RESPONSE FOR NARRATIVE FETCH
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
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

        // MOCKED RESPONSE FOR INTEREST FETCH
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
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

        // MOCKED RESPONSE FOR ADDRESS FETCH
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        const mockedAddresses = [
            '123 Mockingbird Lane, Anytown, CA 90210 (Mocked)',
            '456 Example St, Fakesville, FL 33101 (Mocked)',
            '789 Placeholder Ave, Test City, NY 10001 (Mocked)'
        ];
        const randomMockedAddress = mockedAddresses[Math.floor(Math.random() * mockedAddresses.length)];
        setInsuredAddress(`*Mocked* Address: ${randomMockedAddress}`);
        setIsFetchingAddress(false);
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8 font-inter text-gray-800">
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-900 text-center flex-grow">
                        Submission Builder
                    </h1>
                    <div className="flex items-center ml-4">
                        <input
                            type="checkbox"
                            id="randomizeToggle"
                            className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                            checked={isRandomizeEnabled}
                            onChange={handleRandomizeToggle}
                        />
                        <label htmlFor="randomizeToggle" className="ml-2 text-sm font-medium text-blue-700">Randomize Fields</label>
                    </div>
                </div>
                <p className="text-center text-gray-600 mb-8">
                    Fill in the details below to generate a formatted email submission for underwriters.
                </p>

                {/* Input Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Inception Date */}
                    <div className="flex flex-col">
                        <label htmlFor="inceptionDate" className="text-sm font-medium text-gray-700 mb-1">Inception Date:</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="date"
                                id="inceptionDate"
                                className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200 flex-grow"
                                value={inceptionDate}
                                onChange={(e) => setInceptionDate(e.target.value)}
                                disabled={isDateTBA} // Disable if TBA is checked
                            />
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="dateTBA"
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                    checked={isDateTBA}
                                    onChange={(e) => setIsDateTBA(e.target.checked)}
                                />
                                <label htmlFor="dateTBA" className="ml-2 text-sm text-gray-700">To Be Advised</label>
                            </div>
                        </div>
                    </div>

                    {/* Business Type */}
                    <div className="flex flex-col">
                        <label htmlFor="businessType" className="text-sm font-medium text-gray-700 mb-1">Business Type:</label>
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
                        <label htmlFor="businessStatus" className="text-sm font-medium text-gray-700 mb-1">Business Status:</label>
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
                        <label htmlFor="insuredName" className="text-sm font-medium text-gray-700 mb-1">Insured Name:</label>
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
                        <label htmlFor="insuredWebsite" className="text-sm font-medium text-gray-700 mb-1">Insured Website:</label>
                        <input
                            type="text"
                            id="insuredWebsite"
                            className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            value={insuredWebsite}
                            onChange={(e) => setInsuredWebsite(e.target.value)}
                            placeholder="e.g., www.example.com"
                        />
                    </div>

                    {/* Insured Address (no fetch button now, manual entry) */}
                    <div className="flex flex-col">
                        <label htmlFor="insuredAddress" className="text-sm font-medium text-gray-700 mb-1">Insured Address:</label>
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
                        <label htmlFor="insuredNarrative" className="text-sm font-medium text-gray-700 mb-1">Insured Narrative (Description of operations, specific cargo, locations, etc.):</label>
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
                        <label htmlFor="interest" className="text-sm font-medium text-gray-700 mb-1">Interest (e.g., raw materials, finished goods, electronics, textiles):</label>
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
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">Transit Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Max Value Any One Conveyance */}
                                <div className="flex flex-col">
                                    <label htmlFor="maxConveyance" className="text-sm font-medium text-gray-700 mb-1">Max Value Any One Conveyance (USD):</label>
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
                                    <label htmlFor="averageConveyance" className="text-sm font-medium text-gray-700 mb-1">Average Value Any One Conveyance (USD):</label>
                                    <input
                                        type="text"
                                        id="averageConveyance"
                                        className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                        value={formatNumberWithCommas(averageConveyance)}
                                        onChange={(e) => handleMonetaryInputChange(e, setAverageConveyance)}
                                        placeholder="e.g., 250,000"
                                    />
                                </div>

                                {/* Estimated Sales for Forthcoming Policy Period */}
                                <div className="flex flex-col">
                                    <label htmlFor="estimatedSales" className="text-sm font-medium text-gray-700 mb-1">Estimated Sales (Forthcoming Policy Period, USD):</label>
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
                                            <label htmlFor="estimatedSalesUnknown" className="ml-2 text-sm text-gray-700">Unknown</label>
                                        </div>
                                    </div>
                                </div>

                                {/* Incoming Transit Volume */}
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Incoming Transit Volume (USD & Percentages):</label>
                                    <div className="flex flex-col mb-4">
                                        <label htmlFor="incomingTransitVolumeTotal" className="text-xs font-medium text-gray-600 mb-1">Total Incoming Transit Volume (USD):</label>
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
                                            <label htmlFor="incomingDomesticPct" className="text-xs font-medium text-gray-600 mb-1">Domestic (%):</label>
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
                                            <label htmlFor="incomingInternationalPct" className="text-xs font-medium text-gray-600 mb-1">International (%):</label>
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
                                            <label htmlFor="incomingPrimaryPct" className="text-xs font-medium text-gray-600 mb-1">Primary (%):</label>
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
                                            <label htmlFor="incomingContingentPct" className="text-xs font-medium text-gray-600 mb-1">Contingent (%):</label>
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
                                <label htmlFor="bovIncomingTransit" className="text-sm font-medium text-gray-700 mb-1">Incoming Transit Basis of Valuation:</label>
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
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Outgoing Transit Volume (USD & Percentages):</label>
                                <div className="flex flex-col mb-4">
                                    <label htmlFor="outgoingTransitVolumeTotal" className="text-xs font-medium text-gray-600 mb-1">Total Outgoing Transit Volume (USD):</label>
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
                                        <label htmlFor="outgoingDomesticPct" className="text-xs font-medium text-gray-600 mb-1">Domestic (%):</label>
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
                                        <label htmlFor="outgoingInternationalPct" className="text-xs font-medium text-gray-600 mb-1">International (%):</label>
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
                                        <label htmlFor="outgoingPrimaryPct" className="text-xs font-medium text-gray-600 mb-1">Primary (%):</label>
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
                                        <label htmlFor="outgoingContingentPct" className="text-xs font-medium text-gray-600 mb-1">Contingent (%):</label>
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
                                <label htmlFor="bovOutgoingTransit" className="text-sm font-medium text-gray-700 mb-1">Outgoing Transit Basis of Valuation:</label>
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
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">Storage Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Max TIV */}
                                <div className="flex flex-col">
                                    <label htmlFor="maxTIV" className="text-sm font-medium text-gray-700 mb-1">Max TIV (USD):</label>
                                    <input
                                        type="text"
                                        id="maxTIV"
                                        className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                        value={formatNumberWithCommas(maxTIV)}
                                        onChange={(e) => handleMonetaryInputChange(e, setMaxTIV)}
                                        placeholder="e.g., 20,000,000"
                                    />
                                </div>

                                {/* Average TIV */}
                                <div className="flex flex-col">
                                    <label htmlFor="averageTIV" className="text-sm font-medium text-gray-700 mb-1">Average TIV (USD):</label>
                                    <input
                                        type="text"
                                        id="averageTIV"
                                        className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                        value={formatNumberWithCommas(averageTIV)}
                                        onChange={(e) => handleMonetaryInputChange(e, setAverageTIV)}
                                        placeholder="e.g., 5,000,000"
                                    />
                                </div>

                                {/* Max Any One Location */}
                                <div className="flex flex-col">
                                    <label htmlFor="maxAnyOneLocation" className="text-sm font-medium text-gray-700 mb-1">Max Any One Location (USD):</label>
                                    <input
                                        type="text"
                                        id="maxAnyOneLocation"
                                        className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                        value={formatNumberWithCommas(maxAnyOneLocation)}
                                        onChange={(e) => handleMonetaryInputChange(e, setMaxAnyOneLocation)}
                                        placeholder="e.g., 7,500,000"
                                    />
                                </div>

                                {/* Stock Basis of Valuation */}
                                <div className="flex flex-col">
                                    <label htmlFor="bovStock" className="text-sm font-medium text-gray-700 mb-1">Stock Basis of Valuation:</label>
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
                        <label className="text-sm font-medium text-gray-700 mb-2">Loss Record (5-Year History - provide details for each year):</label>
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
                            <label htmlFor="expiringPremium" className="text-sm font-medium text-gray-700 mb-1">Expiring Premium (USD):</label>
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
                                            <label htmlFor="deductibleAOPStock" className="text-xs font-medium text-gray-600 mb-1">AOP (Stock):</label>
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
                                            <label htmlFor="deductibleCATStock" className="text-xs font-medium text-gray-600 mb-1">CAT (Earthquake, Flood and Windstorm):</label>
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
                                        <label htmlFor="deductibleTransit" className="text-xs font-medium text-gray-600 mb-1">Transit:</label>
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
                                            <label htmlFor="limitAOPStock" className="text-xs font-medium text-gray-600 mb-1">AOP (Stock):</label>
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
                                            <label htmlFor="limitCATStock" className="text-xs font-medium text-gray-600 mb-1">CAT (Earthquake, Flood and Windstorm):</label>
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
                                        <label htmlFor="limitTransit" className="text-xs font-medium text-gray-600 mb-1">Transit:</label>
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
                        <label htmlFor="targetPremium" className="text-sm font-medium text-gray-700 mb-1">Target Premium (USD):</label>
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
                        <label htmlFor="brokerage" className="text-sm font-medium text-gray-700 mb-1">Brokerage (%):</label>
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
                            <label htmlFor="emailSubject" className="text-sm font-medium text-gray-700 mb-1">Subject:</label>
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
                            **Instructions for pasting into Outlook:**
                            <br />1. Copy the "Subject" and paste it into the subject line of your new email.
                            <br />2. Click "Copy Email Body (Rich Text)".
                            <br />3. Open a new email in Outlook, click into the body, and press `Ctrl+V` (Windows) or `Cmd+V` (Mac). The formatting should be preserved.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
