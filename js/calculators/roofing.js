/**
 * RCC Roof Slab Casting, Waterproofing & Profile Sheet Estimator
 * Computes:
 * - RCC Roof Slab Casting (5" M20 concrete volume in m³, 50kg cement bags, sand brass, 20mm aggregate, and Fe 500D steel rebar)
 * - Liquid Waterproofing Membrane (Dr. Fixit Roofseal / Raincoat in Litres for 2 coats)
 * - Industrial Profile Metal Roofing Sheets (JSW Colouron+ / Tata Shaktee in sq.ft / running ft)
 * - Costing in ₹ INR
 */
import { formatNumber, formatPercent } from '../utils/formatters.js';
import { formatCurrency } from '../data/currencies.js';

export const roofingCalculator = {
  id: 'roofing',
  category: 'materials',

  presets: [
    { label: 'Residential RCC Roof Slab (1,200 sq.ft, 5" thick, M20)', values: { mode: 'rcc_slab', slabAreaSqFt: 1200, slabThicknessInches: 5, waste: 5, priceCementBag: 380, priceSandBrass: 4500, priceAggBrass: 4200, priceSteelKg: 68 } },
    { label: 'Terrace Waterproofing (1,200 sq.ft, Dr. Fixit 2 Coats)', values: { mode: 'waterproofing', terraceAreaSqFt: 1200, coats: 2, waste: 5, priceWaterproofLitre: 320 } },
    { label: 'Industrial Shed Profile Roofing (2,400 sq.ft, JSW Sheets)', values: { mode: 'profile_sheets', shedAreaSqFt: 2400, sheetLengthFt: 12, waste: 8, priceSheetSqFt: 52, priceSelfDrillingScrew: 3.5 } }
  ],

  calculate(inputs) {
    const mode = inputs.mode || 'rcc_slab';
    const waste = (Number(inputs.waste) || 5) / 100;

    if (mode === 'waterproofing') {
      const terraceAreaSqFt = Number(inputs.terraceAreaSqFt) || 1200;
      const grossArea = terraceAreaSqFt * (1 + waste);
      const litresRequired = Math.ceil(grossArea / 28);
      const priceWaterproofLitre = Number(inputs.priceWaterproofLitre) || 320;
      const totalCost = litresRequired * priceWaterproofLitre;

      return {
        mode: 'waterproofing',
        terraceAreaSqFt,
        grossArea,
        litresRequired,
        totalCost,
        primaryMetrics: [
          { label: 'Waterproofing Membrane', value: `${formatNumber(litresRequired)} Litres`, subtext: '2 Coats Dr. Fixit / Asian Paints Roofseal', highlight: 'amber' },
          { label: 'Terrace Coverage', value: `${formatNumber(grossArea, 0)} sq.ft`, subtext: `${terraceAreaSqFt} sq.ft net area (+5% waste)`, highlight: 'emerald' },
          { label: 'Total Waterproofing Cost', value: formatCurrency(totalCost), subtext: `@ ₹${priceWaterproofLitre}/Litre`, highlight: 'purple' },
          { label: 'Application Coats', value: '2 Coats', subtext: 'Seamless elastomeric membrane', highlight: 'blue' }
        ],
        materialList: [
          { material: 'Dr. Fixit / SmartCare Liquid Membrane', quantity: litresRequired, unit: 'Litres', estCost: formatCurrency(totalCost) }
        ],
        breakdown: [
          { item: 'Terrace Surface Area', value: `${formatNumber(terraceAreaSqFt)} sq.ft`, note: 'Net terrace roof area' },
          { item: 'Coverage Standard', value: '28 sq.ft/L (2 coats)', note: 'Includes parapet wall flashing' },
          { item: 'Total Material Cost', value: formatCurrency(totalCost), note: 'Liquid polymer membrane' }
        ],
        csvRows: [
          ['Item', 'Value', 'Unit'],
          ['Terrace Area', grossArea.toFixed(0), 'sq.ft'],
          ['Waterproofing Volume', litresRequired, 'Litres'],
          ['Total Cost', totalCost, 'INR']
        ]
      };
    }

    if (mode === 'profile_sheets') {
      const shedAreaSqFt = Number(inputs.shedAreaSqFt) || 2400;
      const grossArea = shedAreaSqFt * (1 + waste);
      const sheetLengthFt = Number(inputs.sheetLengthFt) || 12;
      const sqFtPerSheet = sheetLengthFt * 3.25;
      const totalSheets = Math.ceil(grossArea / sqFtPerSheet);
      const screwsCount = totalSheets * 6;
      const priceSheetSqFt = Number(inputs.priceSheetSqFt) || 52;
      const priceScrew = Number(inputs.priceSelfDrillingScrew) || 3.5;

      const costSheets = grossArea * priceSheetSqFt;
      const costScrews = screwsCount * priceScrew;
      const totalCost = costSheets + costScrews;

      return {
        mode: 'profile_sheets',
        shedAreaSqFt,
        grossArea,
        totalSheets,
        screwsCount,
        costSheets,
        costScrews,
        totalCost,
        primaryMetrics: [
          { label: 'Profile Metal Sheets', value: `${formatNumber(totalSheets)} Sheets`, subtext: `${sheetLengthFt} ft lengths (JSW / Tata Colouron+)`, highlight: 'amber' },
          { label: 'Self-Drilling Screws', value: `${formatNumber(screwsCount)} Nos`, subtext: 'EPDM washer hex fasteners', highlight: 'emerald' },
          { label: 'Total Roofing Cost', value: formatCurrency(totalCost), subtext: `${formatNumber(grossArea, 0)} sq.ft shed roofing`, highlight: 'purple' },
          { label: 'Roofing Sheet Width', value: '3.25 ft Effective', subtext: 'PPGI Color-Coated Trapezoidal', highlight: 'blue' }
        ],
        materialList: [
          { material: `JSW Colouron+ PPGI Sheets (${sheetLengthFt} ft)`, quantity: totalSheets, unit: 'Sheets', estCost: formatCurrency(costSheets) },
          { material: 'Self-Drilling Screws with EPDM Washer', quantity: screwsCount, unit: 'Nos', estCost: formatCurrency(costScrews) }
        ],
        breakdown: [
          { item: 'Shed Roofing Area', value: `${formatNumber(grossArea, 0)} sq.ft`, note: `${shedAreaSqFt} sq.ft net area` },
          { item: 'Sheet Length', value: `${sheetLengthFt} Feet`, note: 'Trapezoidal profile' },
          { item: 'Total Material Cost', value: formatCurrency(totalCost), note: 'Profile sheets + Screws' }
        ],
        csvRows: [
          ['Item', 'Value', 'Unit'],
          ['Roofing Area', grossArea.toFixed(0), 'sq.ft'],
          ['Profile Sheets', totalSheets, 'Sheets'],
          ['Fasteners', screwsCount, 'Nos'],
          ['Total Cost', totalCost, 'INR']
        ]
      };
    }

    // RCC Roof Slab Casting (IS 456 M20 Concrete + Steel)
    const slabAreaSqFt = Number(inputs.slabAreaSqFt) || 1200;
    const thicknessInches = Number(inputs.slabThicknessInches) || 5;
    const volCuFt = slabAreaSqFt * (thicknessInches / 12);
    const grossCuFt = volCuFt * (1 + waste);
    const volCuM = grossCuFt * 0.0283168;
    const brass = grossCuFt / 100;

    const cementBags50kg = Math.ceil(volCuM * 8.0);
    const sandBrass = Number((volCuM * 0.15).toFixed(2));
    const aggBrass = Number((volCuM * 0.30).toFixed(2));
    const steelKg = Math.ceil(volCuM * 80);
    const steelQuintals = steelKg / 100;

    const priceCementBag = Number(inputs.priceCementBag) || 380;
    const priceSandBrass = Number(inputs.priceSandBrass) || 4500;
    const priceAggBrass = Number(inputs.priceAggBrass) || 4200;
    const priceSteelKg = Number(inputs.priceSteelKg) || 68;

    const costCement = cementBags50kg * priceCementBag;
    const costSand = sandBrass * priceSandBrass;
    const costAgg = aggBrass * priceAggBrass;
    const costSteel = steelKg * priceSteelKg;
    const totalCost = costCement + costSand + costAgg + costSteel;

    return {
      mode: 'rcc_slab',
      slabAreaSqFt,
      thicknessInches,
      volCuM,
      grossCuFt,
      brass,
      cementBags50kg,
      sandBrass,
      aggBrass,
      steelKg,
      steelQuintals,
      costCement,
      costSand,
      costAgg,
      costSteel,
      totalCost,
      primaryMetrics: [
        { label: '50 kg Cement Bags', value: `${formatNumber(cementBags50kg)} Bags`, subtext: `M20 Grade (${formatNumber(volCuM, 2)} m³)`, highlight: 'amber' },
        { label: 'Fe 500D TMT Steel', value: `${formatNumber(steelKg)} kg`, subtext: `≈ ${formatNumber(steelQuintals, 1)} Quintals rebar`, highlight: 'emerald' },
        { label: 'Sand (M-Sand)', value: `${formatNumber(sandBrass, 2)} Brass`, subtext: 'Screened concrete sand', highlight: 'blue' },
        { label: 'Total Slab Material Cost', value: formatCurrency(totalCost), subtext: 'Cement + Steel + Sand + Aggregate', highlight: 'purple' }
      ],
      materialList: [
        { material: 'PPC/OPC Cement (50kg Bags, M20)', quantity: cementBags50kg, unit: 'Bags', estCost: formatCurrency(costCement) },
        { material: 'Fe 500D TMT Steel Rebar (IS 1786)', quantity: `${formatNumber(steelKg)} kg`, unit: 'Rebar', estCost: formatCurrency(costSteel) },
        { material: 'Coarse Sand / M-Sand', quantity: formatNumber(sandBrass, 2), unit: 'Brass', estCost: formatCurrency(costSand) },
        { material: '20mm Crushed Stone Metal', quantity: formatNumber(aggBrass, 2), unit: 'Brass', estCost: formatCurrency(costAgg) }
      ],
      breakdown: [
        { item: 'RCC Slab Wet Volume', value: `${formatNumber(volCuM, 2)} m³`, note: `${slabAreaSqFt} sq.ft @ ${thicknessInches}" depth` },
        { item: 'Volume in Brass', value: `${formatNumber(brass, 2)} Brass`, note: `${formatNumber(grossCuFt, 0)} CFT` },
        { item: 'Total Steel Reinforcement', value: `${formatNumber(steelQuintals, 1)} Quintals`, note: '80 kg/m³ standard slab ratio' },
        { item: 'Total Material Cost', value: formatCurrency(totalCost), note: 'IS 456 M20 compliant mix' }
      ],
      csvRows: [
        ['Item', 'Value', 'Unit'],
        ['Concrete Volume', volCuM.toFixed(2), 'm3'],
        ['50kg Cement Bags', cementBags50kg, 'Bags'],
        ['TMT Steel Weight', steelKg, 'kg'],
        ['Sand Brass', sandBrass.toFixed(2), 'Brass'],
        ['Aggregate Brass', aggBrass.toFixed(2), 'Brass'],
        ['Total Cost', totalCost, 'INR']
      ]
    };
  }
};
