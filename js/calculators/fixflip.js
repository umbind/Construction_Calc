/**
 * Property Resale Profit & Capital Gains Tax (LTCG / STCG) Calculator
 * Computes:
 * - Net Resale Profit on Property Flips / Renovation & Sale
 * - Stamp Duty & Registration Charges (5% - 7% state-specific)
 * - Real Estate Brokerage (1% - 2%) & Renovation Expenditures
 * - Long Term Capital Gains (LTCG @ 12.5% per Budget 2024 revised rules for >24 months) vs Short Term (STCG slab rates for <=24 months)
 * - Net In-Hand Profit & Annualized Return on Investment (ROI %)
 */
import { formatNumber, formatPercent, formatIndianNumber, formatLakhsCrores } from '../utils/formatters.js';
import { formatCurrency } from '../data/currencies.js';

export const fixflipCalculator = {
  id: 'fixflip',
  category: 'realestate',

  presets: [
    { label: '2BHK Apartment Renovation & Resale (14 Months STCG)', values: { purchasePrice: 6000000, renovationCost: 800000, resalePrice: 8200000, holdingMonths: 14, stampDutyRate: 6, brokerageRate: 1.5, stcgTaxRate: 30 } },
    { label: 'Independent Villa Flip (28 Months LTCG @ 12.5%)', values: { purchasePrice: 9500000, renovationCost: 1400000, resalePrice: 13500000, holdingMonths: 28, stampDutyRate: 6.5, brokerageRate: 1.0, stcgTaxRate: 30 } },
    { label: 'Distressed Plot & House Remodel (8 Months Flip)', values: { purchasePrice: 4000000, renovationCost: 650000, resalePrice: 5600000, holdingMonths: 8, stampDutyRate: 5, brokerageRate: 2.0, stcgTaxRate: 30 } }
  ],

  calculate(inputs) {
    const purchasePrice = Number(inputs.purchasePrice) || 6000000;
    const renovationCost = Number(inputs.renovationCost) || 800000;
    const resalePrice = Number(inputs.resalePrice) || 8200000;
    const holdingMonths = Number(inputs.holdingMonths) || 14;
    const stampDutyRate = (Number(inputs.stampDutyRate) || 6) / 100;
    const brokerageRate = (Number(inputs.brokerageRate) || 1.5) / 100;
    const stcgTaxRate = (Number(inputs.stcgTaxRate) || 30) / 100;

    const stampDutyAndReg = purchasePrice * stampDutyRate;
    const buyBrokerage = purchasePrice * (brokerageRate / 2);
    const saleBrokerage = resalePrice * (brokerageRate / 2);
    const totalBrokerage = buyBrokerage + saleBrokerage;

    const totalCostBasis = purchasePrice + stampDutyAndReg + buyBrokerage + renovationCost + saleBrokerage;
    const grossProfit = resalePrice - totalCostBasis;

    const isLTCG = holdingMonths > 24;
    const taxRate = isLTCG ? 0.125 : stcgTaxRate;
    const taxableGain = Math.max(grossProfit, 0);
    const capitalGainsTax = taxableGain * taxRate;

    const netProfitInHand = grossProfit - capitalGainsTax;
    const totalInvested = purchasePrice + stampDutyAndReg + buyBrokerage + renovationCost;
    const totalRoi = totalInvested > 0 ? (netProfitInHand / totalInvested) * 100 : 0;
    const annualizedRoi = holdingMonths > 0 ? totalRoi * (12 / holdingMonths) : 0;

    return {
      purchasePrice,
      renovationCost,
      resalePrice,
      holdingMonths,
      stampDutyAndReg,
      totalBrokerage,
      totalCostBasis,
      grossProfit,
      isLTCG,
      taxRate,
      capitalGainsTax,
      netProfitInHand,
      totalInvested,
      totalRoi,
      annualizedRoi,
      primaryMetrics: [
        { label: 'Net In-Hand Profit', value: formatLakhsCrores(netProfitInHand), subtext: 'Post Tax & All Stamp Duty / Brokerage', highlight: 'amber' },
        { label: 'Annualized ROI', value: formatPercent(annualizedRoi, 1), subtext: `${holdingMonths} Months Holding Period`, highlight: 'emerald' },
        { label: 'Capital Gains Tax', value: formatCurrency(capitalGainsTax), subtext: isLTCG ? '12.5% LTCG (>24 mos per Budget 2024)' : `${formatPercent(taxRate * 100, 0)} STCG (<=24 mos)`, highlight: 'purple' },
        { label: 'Total Invested Capital', value: formatLakhsCrores(totalInvested), subtext: 'Purchase + Stamp Duty + Renovation', highlight: 'blue' }
      ],
      materialList: [
        { material: 'Property Acquisition Price', quantity: '1 Unit', unit: 'Purchase', estCost: formatCurrency(purchasePrice) },
        { material: 'Stamp Duty & Registration (Govt Charges)', quantity: `${formatPercent(stampDutyRate * 100, 1)}`, unit: 'Duty', estCost: formatCurrency(stampDutyAndReg) },
        { material: 'Renovation & Civil Improvement Budget', quantity: 'Turnkey', unit: 'Rehab', estCost: formatCurrency(renovationCost) },
        { material: 'Real Estate Brokerage (Buy + Sale)', quantity: `${formatPercent(brokerageRate * 100, 1)}`, unit: 'Brokerage', estCost: formatCurrency(totalBrokerage) }
      ],
      breakdown: [
        { item: 'Gross Resale Realization', value: formatLakhsCrores(resalePrice), note: formatCurrency(resalePrice) },
        { item: 'Total Acquisition & Renovation Cost', value: formatCurrency(totalCostBasis), note: 'Includes all transaction fees' },
        { item: 'Gross Profit Before Tax', value: formatCurrency(grossProfit), note: 'Pre-tax appreciation' },
        { item: 'Capital Gains Tax Liability', value: formatCurrency(capitalGainsTax), note: isLTCG ? '12.5% Flat LTCG' : 'STCG Slab' }
      ],
      csvRows: [
        ['Parameter', 'Value', 'Unit'],
        ['Purchase Price', purchasePrice, 'INR'],
        ['Renovation Cost', renovationCost, 'INR'],
        ['Resale Price', resalePrice, 'INR'],
        ['Holding Months', holdingMonths, 'Months'],
        ['Gross Profit', grossProfit.toFixed(0), 'INR'],
        ['Capital Gains Tax', capitalGainsTax.toFixed(0), 'INR'],
        ['Net Profit In Hand', netProfitInHand.toFixed(0), 'INR'],
        ['Annualized ROI', annualizedRoi.toFixed(1), '%']
      ]
    };
  }
};
