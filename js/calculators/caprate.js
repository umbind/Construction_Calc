/**
 * Rental Yield & Net Operating Income (NOI) Calculator (India Benchmark)
 * Computes:
 * - Gross Annual Rent & Society Maintenance Charges
 * - Municipal Property Taxes (MCGM, BBMP, MCD, GHMC) & Vacancy loss
 * - Net Operating Income (NOI) in ₹ Lakhs
 * - Gross Rental Yield % (Indian Benchmark: 2.5% - 4.5% Residential, 7.0% - 9.5% Commercial)
 * - Net Rental Yield % after society maintenance & municipal taxes
 */
import { formatNumber, formatPercent, formatIndianNumber, formatLakhsCrores } from '../utils/formatters.js';
import { formatCurrency } from '../data/currencies.js';

export const caprateCalculator = {
  id: 'caprate',
  category: 'realestate',

  presets: [
    { label: 'Bengaluru 3BHK Flat (₹1.25 Cr Buy, ₹42,000/mo Rent)', values: { purchasePrice: 12500000, monthlyRent: 42000, societyMaintenanceMonthly: 5000, municipalTaxAnnual: 18000, insuranceAnnual: 8000, repairRate: 4, vacancyRate: 4, targetCapRate: 3.5 } },
    { label: 'Mumbai 2BHK Apartment (₹1.80 Cr Buy, ₹50,000/mo Rent)', values: { purchasePrice: 18000000, monthlyRent: 50000, societyMaintenanceMonthly: 6500, municipalTaxAnnual: 24000, insuranceAnnual: 12000, repairRate: 4, vacancyRate: 3, targetCapRate: 3.2 } },
    { label: 'Delhi-NCR Builder Floor (₹85 Lakhs Buy, ₹28,000/mo Rent)', values: { purchasePrice: 8500000, monthlyRent: 28000, societyMaintenanceMonthly: 2500, municipalTaxAnnual: 12000, insuranceAnnual: 6000, repairRate: 5, vacancyRate: 5, targetCapRate: 3.8 } },
    { label: 'Commercial Office Space (₹2.50 Cr Buy, ₹1,75,000/mo Rent)', values: { purchasePrice: 25000000, monthlyRent: 175000, societyMaintenanceMonthly: 15000, municipalTaxAnnual: 45000, insuranceAnnual: 25000, repairRate: 3, vacancyRate: 5, targetCapRate: 8.0 } }
  ],

  calculate(inputs) {
    const purchasePrice = Number(inputs.purchasePrice) || 12500000;
    const monthlyRent = Number(inputs.monthlyRent) || 42000;
    const vacancyRate = (Number(inputs.vacancyRate) || 4) / 100;
    const repairRate = (Number(inputs.repairRate) || 4) / 100;

    const annualGrossRent = monthlyRent * 12;
    const vacancyLoss = annualGrossRent * vacancyRate;
    const effectiveGrossIncome = annualGrossRent - vacancyLoss;

    const societyMaintenance = (Number(inputs.societyMaintenanceMonthly) || 5000) * 12;
    const municipalTax = Number(inputs.municipalTaxAnnual) || 18000;
    const propertyInsurance = Number(inputs.insuranceAnnual) || 8000;
    const routineRepairs = effectiveGrossIncome * repairRate;

    const totalOperatingExpenses = societyMaintenance + municipalTax + propertyInsurance + routineRepairs;
    const netOperatingIncome = effectiveGrossIncome - totalOperatingExpenses;
    const monthlyNOI = netOperatingIncome / 12;

    const grossRentalYield = purchasePrice > 0 ? (annualGrossRent / purchasePrice) * 100 : 0;
    const netRentalYield = purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0;
    const grossRentMultiplier = annualGrossRent > 0 ? (purchasePrice / annualGrossRent) : 0;

    return {
      purchasePrice,
      monthlyRent,
      annualGrossRent,
      vacancyLoss,
      effectiveGrossIncome,
      societyMaintenance,
      municipalTax,
      propertyInsurance,
      routineRepairs,
      totalOperatingExpenses,
      netOperatingIncome,
      monthlyNOI,
      grossRentalYield,
      netRentalYield,
      grossRentMultiplier,
      primaryMetrics: [
        { label: 'Gross Rental Yield', value: formatPercent(grossRentalYield, 2), subtext: 'Benchmark: 2.5% - 4.5% Resi', highlight: 'amber' },
        { label: 'Net Rental Yield (NOI)', value: formatPercent(netRentalYield, 2), subtext: 'Post Society Maint & Taxes', highlight: 'emerald' },
        { label: 'Annual Net NOI', value: formatLakhsCrores(netOperatingIncome), subtext: `≈ ${formatCurrency(monthlyNOI)}/month`, highlight: 'blue' },
        { label: 'Price-to-Rent (GRM)', value: `${formatNumber(grossRentMultiplier, 1)}x`, subtext: 'Years gross rent to purchase', highlight: 'purple' }
      ],
      materialList: [
        { material: 'Gross Annual Rental Income', quantity: '12 Months', unit: 'Rent', estCost: formatCurrency(annualGrossRent) },
        { material: 'Annual Society Maintenance Charges', quantity: '12 Months', unit: 'Charges', estCost: `-${formatCurrency(societyMaintenance)}` },
        { material: 'Municipal Property Taxes (MCGM/BBMP)', quantity: '1 Year', unit: 'Tax', estCost: `-${formatCurrency(municipalTax)}` },
        { material: 'Routine Maintenance & Property Insurance', quantity: '1 Year', unit: 'Repairs', estCost: `-${formatCurrency(routineRepairs + propertyInsurance)}` }
      ],
      breakdown: [
        { item: 'Purchase / Market Value', value: formatLakhsCrores(purchasePrice), note: formatCurrency(purchasePrice) },
        { item: 'Gross Annual Rent', value: formatCurrency(annualGrossRent), note: `@ ${formatCurrency(monthlyRent)}/month` },
        { item: 'Total Operating Expenses', value: formatCurrency(totalOperatingExpenses), note: 'Maintenance + Taxes + Insurance' },
        { item: 'Net Operating Income (NOI)', value: formatLakhsCrores(netOperatingIncome), note: `Net Cash In-Hand: ${formatCurrency(netOperatingIncome)}` }
      ],
      csvRows: [
        ['Parameter', 'Value', 'Unit'],
        ['Purchase Price', purchasePrice, 'INR'],
        ['Annual Rent', annualGrossRent, 'INR'],
        ['Gross Rental Yield', grossRentalYield.toFixed(2), '%'],
        ['Net Rental Yield', netRentalYield.toFixed(2), '%'],
        ['Annual NOI', netOperatingIncome, 'INR'],
        ['GRM', grossRentMultiplier.toFixed(1), 'Years']
      ]
    };
  }
};
