// Formatting helpers (extracted from App.jsx)

export const formatNumberWithCommas = (value) => {
  if (!value) return '';
  const num = parseFloat(value.toString().replace(/,/g, ''));
  return Number.isNaN(num) ? '' : num.toLocaleString('en-US');
};

export const formatCurrencyForEmail = (value) => {
  if (!value) return 'N/A';
  const num = parseFloat(value);
  return Number.isNaN(num) ? 'N/A' : `USD ${num.toLocaleString('en-US')}`;
};

export const formatPercentageForEmail = (value) => {
  if (!value) return 'N/A';
  const num = parseFloat(value);
  return Number.isNaN(num) ? 'N/A' : `${num}%`;
};
