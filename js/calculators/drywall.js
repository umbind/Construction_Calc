/**
 * Gypsum False Ceiling, POP & Wall Plastering Estimator
 * Computes:
 * - Gyproc / USG Boral Gypsum Board Sheets (6x4 ft / 1830x1220 mm)
 * - Perimeter Channels & Ceiling Section Channels (12 ft lengths)
 * - Drywall Fasteners, 25kg Jointing Compound Bags, and 90m Fiberglass Tape
 * - Wall Plastering Mode: 12mm/20mm Cement Plaster (50kg cement bags + Sand in Brass)
 * - Costing in ₹ INR
 */
import { formatNumber, formatPercent } from '../utils/formatters.js';
import { formatCurrency } from '../data/currencies.js';

export const drywallCalculator = {
  id: 'drywall',
  category: 'materials',

  presets: [
    { label: 'Living Room Gypsum Ceiling (20x15 ft, Gyproc 6x4)', values: { mode: 'ceiling', length: 20, width: 15, waste: 10, priceSheet: 340, priceChannelPerimeter: 110, priceChannelSection: 140, priceCompoundBag: 420 } },
    { label: 'Master Bedroom False Ceiling (14x12 ft, 6x4 ft Sheets)', values: { mode: 'ceiling', length: 14, width: 12, waste: 10, priceSheet: 340, priceChannelPerimeter: 110, priceChannelSection: 140, priceCompoundBag: 420 } },
    { label: 'Internal Wall Plastering 12mm (800 sq.ft, 1:4 Mix)', values: { mode: 'plaster', length: 40, width: 20, waste: 10, plasterThickness: 12, mixRatio: '1:4', priceCementBag: 380, priceSandBrass: 4500 } },
    { label: 'External Wall Plastering 20mm (1,200 sq.ft, 1:4 Mix)', values: { mode: 'plaster', length: 60, width: 20, waste: 10, plasterThickness: 20, mixRatio: '1:4', priceCementBag: 380, priceSandBrass: 4500 } }
  ],

  calculate(inputs) {
    const mode = inputs.mode || 'ceiling';
    const waste = (Number(inputs.waste) || 10) / 100;
    const length = Number(inputs.length) || 20;
    const width = Number(inputs.width) || 15;
    const netAreaSqFt = length * width;
    const grossAreaSqFt = netAreaSqFt * (1 + waste);

    if (mode === 'plaster') {
      const thicknessMm = Number(inputs.plasterThickness) || 12;
      const thicknessFt = (thicknessMm / 25.4) / 12;
      const wetVolCuFt = grossAreaSqFt * thicknessFt;
      const dryVolCuFt = wetVolCuFt * 1.33;
      const is1to4 = (inputs.mixRatio || '1:4') === '1:4';
      const sumRatio = is1to4 ? 5 : 7;

      const cementCuFt = dryVolCuFt * (1 / sumRatio);
      const cementBags50kg = Math.ceil(cementCuFt / 1.226);
      const sandCuFt = dryVolCuFt * ((is1to4 ? 4 : 6) / sumRatio);
      const sandBrass = Number((sandCuFt / 100).toFixed(2));

      const priceCementBag = Number(inputs.priceCementBag) || 380;
      const priceSandBrass = Number(inputs.priceSandBrass) || 4500;
      const costCement = cementBags50kg * priceCementBag;
      const costSand = sandBrass * priceSandBrass;
      const totalCost = costCement + costSand;

      return {
        mode: 'plaster',
        netAreaSqFt,
        grossAreaSqFt,
        thicknessMm,
        cementBags50kg,
        sandBrass,
        totalCost,
        primaryMetrics: [
          { label: 'Plaster Surface Area', value: `${formatNumber(grossAreaSqFt, 0)} sq.ft`, subtext: `${thicknessMm}mm Plaster Thickness`, highlight: 'amber' },
          { label: '50 kg Cement Bags', value: `${formatNumber(cementBags50kg)} Bags`, subtext: `@ ₹${priceCementBag}/bag`, highlight: 'emerald' },
          { label: 'Plaster Sand', value: `${formatNumber(sandBrass, 2)} Brass`, subtext: `@ ₹${priceSandBrass}/Brass`, highlight: 'blue' },
          { label: 'Total Plastering Cost', value: formatCurrency(totalCost), subtext: 'Cement + Screened Sand', highlight: 'purple' }
        ],
        materialList: [
          { material: `PPC/OPC Cement (${thicknessMm}mm plaster)`, quantity: cementBags50kg, unit: 'Bags', estCost: formatCurrency(costCement) },
          { material: 'Screened Plaster Sand', quantity: formatNumber(sandBrass, 2), unit: 'Brass', estCost: formatCurrency(costSand) }
        ],
        breakdown: [
          { item: 'Net Wall Surface Area', value: `${formatNumber(netAreaSqFt, 0)} sq.ft`, note: 'Without waste' },
          { item: 'Dry Mortar Volume', value: `${formatNumber(dryVolCuFt, 1)} CFT`, note: 'Includes 33% dry bulking factor' },
          { item: 'Mortar Mix Ratio', value: is1to4 ? '1:4 (Cement : Sand)' : '1:6 (Cement : Sand)', note: 'IS 1661 standard' },
          { item: 'Total Material Cost', value: formatCurrency(totalCost), note: 'Excludes scaffolding & labour' }
        ],
        csvRows: [
          ['Item', 'Value', 'Unit'],
          ['Plaster Area', grossAreaSqFt.toFixed(0), 'sq.ft'],
          ['Plaster Thickness', thicknessMm, 'mm'],
          ['Cement Bags', cementBags50kg, 'Bags'],
          ['Sand Brass', sandBrass.toFixed(2), 'Brass'],
          ['Total Cost', totalCost, 'INR']
        ]
      };
    }

    // Gypsum False Ceiling (6x4 ft / 24 sq.ft Gyproc sheets)
    const sheetArea = 24;
    const sheetsCount = Math.ceil(grossAreaSqFt / sheetArea);
    const perimeterFt = 2 * (length + width);
    const perimeterChannels12ft = Math.ceil(perimeterFt / 12);
    const ceilingSections12ft = Math.ceil((grossAreaSqFt / 12) * 1.2);
    const screwsCount = sheetsCount * 28;
    const screwsBoxes = Math.ceil(screwsCount / 1000);
    const jointCompoundBags25kg = Math.ceil(grossAreaSqFt / 350);
    const tapeRolls = Math.ceil(grossAreaSqFt / 600);

    const priceSheet = Number(inputs.priceSheet) || 340;
    const pricePerimeter = Number(inputs.priceChannelPerimeter) || 110;
    const priceSection = Number(inputs.priceChannelSection) || 140;
    const priceCompound = Number(inputs.priceCompoundBag) || 420;

    const costSheets = sheetsCount * priceSheet;
    const costChannels = (perimeterChannels12ft * pricePerimeter) + (ceilingSections12ft * priceSection);
    const costCompound = jointCompoundBags25kg * priceCompound;
    const totalCost = costSheets + costChannels + costCompound;

    return {
      mode: 'ceiling',
      netAreaSqFt,
      grossAreaSqFt,
      sheetsCount,
      perimeterChannels12ft,
      ceilingSections12ft,
      screwsCount,
      screwsBoxes,
      jointCompoundBags25kg,
      tapeRolls,
      costSheets,
      costChannels,
      costCompound,
      totalCost,
      primaryMetrics: [
        { label: 'Gyproc 6x4\' Sheets', value: `${formatNumber(sheetsCount)} Sheets`, subtext: `${formatNumber(grossAreaSqFt, 0)} sq.ft covered`, highlight: 'amber' },
        { label: 'Ceiling Sections (12\')', value: `${formatNumber(ceilingSections12ft)} Lengths`, subtext: `+ ${perimeterChannels12ft} Perimeter Channels`, highlight: 'emerald' },
        { label: 'Joint Compound (25kg)', value: `${formatNumber(jointCompoundBags25kg)} Bags`, subtext: `+ ${tapeRolls} Joint Tape Roll(s)`, highlight: 'blue' },
        { label: 'Total Material Cost', value: formatCurrency(totalCost), subtext: 'Sheets + Channels + Compound', highlight: 'purple' }
      ],
      materialList: [
        { material: 'Gyproc 6x4 ft (12.5mm) Gypsum Boards', quantity: sheetsCount, unit: 'Sheets', estCost: formatCurrency(costSheets) },
        { material: 'GI Grid Channels (Perimeter + Sections)', quantity: perimeterChannels12ft + ceilingSections12ft, unit: 'Lengths', estCost: formatCurrency(costChannels) },
        { material: 'Gyproc One Coat Jointing Compound (25kg)', quantity: jointCompoundBags25kg, unit: 'Bags', estCost: formatCurrency(costCompound) },
        { material: 'Drywall Screws (25mm)', quantity: formatNumber(screwsCount), unit: 'Nos', estCost: '₹350' }
      ],
      breakdown: [
        { item: 'Ceiling Surface Area', value: `${formatNumber(grossAreaSqFt, 0)} sq.ft`, note: `${length} ft x ${width} ft (+10% waste)` },
        { item: 'Perimeter Channels (12 ft)', value: `${perimeterChannels12ft} Lengths`, note: 'Along room boundary' },
        { item: 'Ceiling Sections (12 ft)', value: `${ceilingSections12ft} Lengths`, note: 'Main grid @ 2 ft spacing' },
        { item: 'Total Material Cost', value: formatCurrency(totalCost), note: 'Gyproc boards + GI channels + Compound' }
      ],
      csvRows: [
        ['Item', 'Value', 'Unit'],
        ['Ceiling Area', grossAreaSqFt.toFixed(0), 'sq.ft'],
        ['Gypsum Sheets 6x4', sheetsCount, 'Sheets'],
        ['Perimeter Channels 12ft', perimeterChannels12ft, 'Lengths'],
        ['Ceiling Sections 12ft', ceilingSections12ft, 'Lengths'],
        ['Joint Compound 25kg', jointCompoundBags25kg, 'Bags'],
        ['Total Cost', totalCost, 'INR']
      ]
    };
  }
};
