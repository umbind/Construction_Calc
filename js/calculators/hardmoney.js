/**
 * Builder Construction Loan & Stage Disbursement Interest Estimator
 * Computes:
 * - Project / Private Construction Finance interest (12% - 16% p.a. in India)
 * - Stage-wise Milestone Disbursement Schedule (RERA & Bank aligned):
 *   1. Booking & Agreement (10%)
 *   2. Foundation & Plinth (15%)
 *   3. Ground Floor Slab (20%)
 *   4. First Floor Slab (20%)
 *   5. Brickwork & Plastering (15%)
 *   6. Flooring & Finishing (20%)
 * - As-Drawn Milestone Interest vs Lump-Sum Dutch Interest (calculating exact ₹ Lakhs saved)
 */
import { formatNumber, formatPercent, formatIndianNumber, formatLakhsCrores } from '../utils/formatters.js';
import { formatCurrency } from '../data/currencies.js';

export const hardmoneyCalculator = {
  id: 'hardmoney',
  category: 'realestate',

  presets: [
    { label: 'G+2 Independent House Construction Loan (₹45 Lakhs, 14 Months)', values: { totalLoan: 4500000, interestRate: 12.5, tenureMonths: 14, processingFeeRate: 1.0 } },
    { label: 'Builder Villa Project Loan (₹1.20 Cr, 18 Months @ 14% p.a.)', values: { totalLoan: 12000000, interestRate: 14.0, tenureMonths: 18, processingFeeRate: 1.25 } },
    { label: 'Commercial Floor Extension (₹30 Lakhs, 10 Months @ 12% p.a.)', values: { totalLoan: 3000000, interestRate: 12.0, tenureMonths: 10, processingFeeRate: 1.0 } }
  ],

  calculate(inputs) {
    const totalLoan = Number(inputs.totalLoan) || 4500000;
    const annualRate = Number(inputs.interestRate) || 12.5;
    const tenureMonths = Number(inputs.tenureMonths) || 14;
    const processingFeeRate = (Number(inputs.processingFeeRate) || 1.0) / 100;

    const monthlyRate = (annualRate / 12) / 100;
    const processingFee = totalLoan * processingFeeRate;

    const stages = [
      { name: 'Stage 1: Agreement & Mobilization', percent: 10, month: 0 },
      { name: 'Stage 2: Foundation & Plinth Level', percent: 15, month: Math.min(2, Math.floor(tenureMonths * 0.15)) },
      { name: 'Stage 3: Ground Floor Slab Casting', percent: 20, month: Math.min(5, Math.floor(tenureMonths * 0.35)) },
      { name: 'Stage 4: Upper Slab Casting', percent: 20, month: Math.min(8, Math.floor(tenureMonths * 0.55)) },
      { name: 'Stage 5: Brickwork & Plastering', percent: 15, month: Math.min(11, Math.floor(tenureMonths * 0.75)) },
      { name: 'Stage 6: Flooring & Handover', percent: 20, month: Math.min(13, Math.floor(tenureMonths * 0.90)) }
    ];

    let asDrawnInterest = 0;
    const stageDetails = stages.map(st => {
      const amount = totalLoan * (st.percent / 100);
      const activeMonths = Math.max(tenureMonths - st.month, 1);
      const interest = amount * monthlyRate * activeMonths;
      asDrawnInterest += interest;
      return {
        ...st,
        amount,
        activeMonths,
        interest
      };
    });

    const lumpSumInterest = totalLoan * monthlyRate * tenureMonths;
    const interestSavings = lumpSumInterest - asDrawnInterest;
    const totalRepayment = totalLoan + asDrawnInterest + processingFee;

    return {
      totalLoan,
      annualRate,
      tenureMonths,
      processingFee,
      asDrawnInterest,
      lumpSumInterest,
      interestSavings,
      totalRepayment,
      stageDetails,
      primaryMetrics: [
        { label: 'Milestone Interest', value: formatLakhsCrores(asDrawnInterest), subtext: `${tenureMonths} Months @ ${annualRate}% p.a.`, highlight: 'amber' },
        { label: 'Disbursement Savings', value: formatLakhsCrores(interestSavings), subtext: 'Saved vs Lump-Sum Day 1 Draw', highlight: 'emerald' },
        { label: 'Total Repayment', value: formatLakhsCrores(totalRepayment), subtext: 'Principal + Milestone Interest + Fee', highlight: 'purple' },
        { label: 'Processing Fee', value: formatCurrency(processingFee), subtext: `${formatPercent(processingFeeRate * 100, 2)} Bank Fee`, highlight: 'blue' }
      ],
      materialList: [
        { material: 'Principal Construction Loan Facility', quantity: formatLakhsCrores(totalLoan), unit: 'Credit', estCost: formatCurrency(totalLoan) },
        { material: 'Stage-wise Interest Payable', quantity: `${tenureMonths} Months`, unit: 'Interest', estCost: formatCurrency(asDrawnInterest) },
        { material: 'Loan Processing & Technical Inspection Fee', quantity: '1-time', unit: 'Fee', estCost: formatCurrency(processingFee) }
      ],
      breakdown: [
        { item: 'Total Project Borrowing', value: formatLakhsCrores(totalLoan), note: formatCurrency(totalLoan) },
        { item: 'As-Drawn Milestone Interest', value: formatCurrency(asDrawnInterest), note: 'Calculated strictly on disbursed tranches' },
        { item: 'Interest Saved via Stage Draw', value: formatCurrency(interestSavings), note: 'Vs. immediate full lump-sum disbursement' },
        { item: 'Total Payback Outlay', value: formatLakhsCrores(totalRepayment), note: formatCurrency(totalRepayment) }
      ],
      csvRows: [
        ['Parameter', 'Value', 'Unit'],
        ['Total Loan', totalLoan, 'INR'],
        ['Annual Interest Rate', annualRate, '%'],
        ['Tenure Months', tenureMonths, 'Months'],
        ['As-Drawn Interest', asDrawnInterest.toFixed(0), 'INR'],
        ['Lump-Sum Interest', lumpSumInterest.toFixed(0), 'INR'],
        ['Interest Saved', interestSavings.toFixed(0), 'INR'],
        ['Total Repayment', totalRepayment.toFixed(0), 'INR']
      ]
    };
  }
};
