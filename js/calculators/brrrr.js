/**
 * Indian Home Loan EMI, Tax Benefits (Sec 24b/80C) & Property Finance Calculator
 * Computes:
 * - Monthly Home Loan EMI (P & I Amortization)
 * - Loan-to-Value (LTV 75%-80% per RBI Guidelines)
 * - Total Interest Payable over Tenure
 * - Annual Tax Deductions: Section 24(b) (Interest up to ₹2,00,000) & Section 80C (Principal up to ₹1,50,000)
 * - Net Monthly Cash Flow after EMI vs Rent
 */
import { formatNumber, formatPercent, formatIndianNumber, formatLakhsCrores } from '../utils/formatters.js';
import { formatCurrency } from '../data/currencies.js';

export const brrrrCalculator = {
  id: 'brrrr',
  category: 'realestate',

  presets: [
    { label: '₹60 Lakhs Home Loan (8.5% Interest, 20 Years Tenure)', values: { propertyValue: 7500000, loanAmount: 6000000, interestRate: 8.5, tenureYears: 20, monthlyRent: 32000, maintenanceMonthly: 4000, taxBracket: 30 } },
    { label: '₹1.20 Cr Luxury Flat Loan (8.4% Interest, 25 Years)', values: { propertyValue: 15000000, loanAmount: 12000000, interestRate: 8.4, tenureYears: 25, monthlyRent: 55000, maintenanceMonthly: 6500, taxBracket: 30 } },
    { label: '₹35 Lakhs Affordable Home Loan (8.6% Interest, 15 Years)', values: { propertyValue: 4500000, loanAmount: 3500000, interestRate: 8.6, tenureYears: 15, monthlyRent: 18000, maintenanceMonthly: 2000, taxBracket: 20 } }
  ],

  calculate(inputs) {
    const propertyValue = Number(inputs.propertyValue) || 7500000;
    const loanAmount = Number(inputs.loanAmount) || 6000000;
    const annualRate = Number(inputs.interestRate) || 8.5;
    const tenureYears = Number(inputs.tenureYears) || 20;
    const monthlyRent = Number(inputs.monthlyRent) || 32000;
    const maintenanceMonthly = Number(inputs.maintenanceMonthly) || 4000;
    const taxBracket = (Number(inputs.taxBracket) || 30) / 100;

    const monthlyRate = (annualRate / 12) / 100;
    const totalMonths = tenureYears * 12;

    const emi = loanAmount > 0 && monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : 0;

    const totalRepayment = emi * totalMonths;
    const totalInterestPayable = totalRepayment - loanAmount;
    const ltvPercent = propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0;

    const firstYearInterest = loanAmount * (annualRate / 100);
    const firstYearPrincipal = (emi * 12) - firstYearInterest;

    const sec24bEligible = Math.min(firstYearInterest, 200000);
    const sec80cEligible = Math.min(firstYearPrincipal, 150000);
    const totalTaxDeduction = sec24bEligible + sec80cEligible;
    const annualTaxSavings = totalTaxDeduction * taxBracket;
    const netMonthlyCashflow = monthlyRent - emi - maintenanceMonthly;

    return {
      propertyValue,
      loanAmount,
      annualRate,
      tenureYears,
      totalMonths,
      emi,
      totalRepayment,
      totalInterestPayable,
      ltvPercent,
      firstYearInterest,
      firstYearPrincipal,
      sec24bEligible,
      sec80cEligible,
      totalTaxDeduction,
      annualTaxSavings,
      monthlyRent,
      maintenanceMonthly,
      netMonthlyCashflow,
      primaryMetrics: [
        { label: 'Monthly Home Loan EMI', value: formatCurrency(emi), subtext: `${tenureYears} Yrs @ ${annualRate}% Interest`, highlight: 'amber' },
        { label: 'Annual Tax Saved', value: formatCurrency(annualTaxSavings), subtext: 'Sec 24(b) + Sec 80C Tax Benefit', highlight: 'emerald' },
        { label: 'Total Interest Payable', value: formatLakhsCrores(totalInterestPayable), subtext: `Total Loan: ${formatLakhsCrores(loanAmount)}`, highlight: 'purple' },
        { label: 'Loan-to-Value (LTV)', value: formatPercent(ltvPercent, 1), subtext: 'RBI Guideline: 75% - 80% Max', highlight: 'blue' }
      ],
      materialList: [
        { material: 'Principal Loan Amount', quantity: formatLakhsCrores(loanAmount), unit: 'Borrowing', estCost: formatCurrency(loanAmount) },
        { material: 'Total Interest over Tenure', quantity: `${tenureYears} Years`, unit: 'Interest', estCost: formatCurrency(totalInterestPayable) },
        { material: 'Total Repayment (P + I)', quantity: `${totalMonths} Months`, unit: 'Total', estCost: formatCurrency(totalRepayment) }
      ],
      breakdown: [
        { item: 'Section 24(b) Interest Tax Deduction', value: formatCurrency(sec24bEligible), note: 'Max ₹2,00,000 per financial year' },
        { item: 'Section 80C Principal Tax Deduction', value: formatCurrency(sec80cEligible), note: 'Max ₹1,50,000 per financial year' },
        { item: 'Annual Tax Saved (30% Bracket)', value: formatCurrency(annualTaxSavings), note: `Total Deduction: ${formatCurrency(totalTaxDeduction)}` },
        { item: 'Net Monthly Cashflow', value: formatCurrency(netMonthlyCashflow), note: `Rent: ${formatCurrency(monthlyRent)} - EMI - Maint` }
      ],
      csvRows: [
        ['Parameter', 'Value', 'Unit'],
        ['Loan Amount', loanAmount, 'INR'],
        ['Tenure', tenureYears, 'Years'],
        ['Interest Rate', annualRate, '%'],
        ['Monthly EMI', emi.toFixed(0), 'INR'],
        ['Total Interest', totalInterestPayable.toFixed(0), 'INR'],
        ['Annual Tax Saved', annualTaxSavings.toFixed(0), 'INR']
      ]
    };
  }
};
