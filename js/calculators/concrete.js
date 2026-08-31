/**
 * Concrete Volume, 50kg Bags & RMC Estimator (IS 456:2000 Standards)
 * Computes:
 * - Cubic Meters (m³), Brass (100 cu.ft), and Cubic Feet (CFT)
 * - 50 kg Cement Bags (IS 1489/IS 12269) for M20, M25, M15, M7.5 mix grades
 * - Sand (Coarse / M-Sand) in Brass and Metric Tonnes
 * - 20mm / 10mm Crushed Stone Aggregates in Brass and Metric Tonnes
 * - Ready-Mix Concrete (RMC) Transit Mixers (6 m³ capacity) with short-load alerts
 * - Site-Mix vs RMC material cost comparisons in ₹ INR
 */
import { formatNumber, formatPercent, formatIndianNumber, formatLakhsCrores } from '../utils/formatters.js';
import { formatCurrency } from '../data/currencies.js';

export const concreteCalculator = {
  id: 'concrete',
  category: 'materials',

  mixGrades: {
    M20: { name: 'M20 Grade (1:1.5:3 - RCC Slab, Beam, Footing)', cementBagsPerCuM: 8.0, sandBrassPerCuM: 0.15, aggBrassPerCuM: 0.30 },
    M25: { name: 'M25 Grade (1:1:2 - Heavy RCC Columns, Shear Walls)', cementBagsPerCuM: 10.5, sandBrassPerCuM: 0.13, aggBrassPerCuM: 0.27 },
    M15: { name: 'M15 Grade (1:2:4 - Plinth Beam, Levelling Bed)', cementBagsPerCuM: 6.3, sandBrassPerCuM: 0.16, aggBrassPerCuM: 0.32 },
    M7_5: { name: 'M7.5 Grade (1:4:8 - PCC Sub-Base Foundation)', cementBagsPerCuM: 3.2, sandBrassPerCuM: 0.17, aggBrassPerCuM: 0.34 }
  },

  presets: [
    { label: 'RCC Roof Slab (1,000 sq.ft, 5" thick, M20)', values: { shape: 'slab', length: 40, width: 25, thickness: 5, grade: 'M20', waste: 5, priceCementBag: 380, priceSandBrass: 4500, priceAggBrass: 4200, priceRmcCuM: 4800 } },
    { label: 'RCC Column Footings (6 nos, 4x4 ft, 12" depth, M25)', values: { shape: 'slab', length: 24, width: 4, thickness: 12, grade: 'M25', waste: 5, priceCementBag: 380, priceSandBrass: 4500, priceAggBrass: 4200, priceRmcCuM: 5200 } },
    { label: 'PCC Foundation Sub-base (600 sq.ft, 4" thick, M7.5)', values: { shape: 'slab', length: 30, width: 20, thickness: 4, grade: 'M7_5', waste: 5, priceCementBag: 380, priceSandBrass: 4500, priceAggBrass: 4200, priceRmcCuM: 3800 } },
    { label: 'Plinth Beam Casting (120 ft run, 9" width, 12" depth, M20)', values: { shape: 'slab', length: 120, width: 0.75, thickness: 12, grade: 'M20', waste: 5, priceCementBag: 380, priceSandBrass: 4500, priceAggBrass: 4200, priceRmcCuM: 4800 } }
  ],

  calculate(inputs) {
    const waste = (Number(inputs.waste) || 5) / 100;
    const gradeKey = inputs.grade || 'M20';
    const gradeInfo = this.mixGrades[gradeKey] || this.mixGrades.M20;

    const priceCementBag = Number(inputs.priceCementBag) || 380;
    const priceSandBrass = Number(inputs.priceSandBrass) || 4500;
    const priceAggBrass = Number(inputs.priceAggBrass) || 4200;
    const priceRmcCuM = Number(inputs.priceRmcCuM) || 4800;

    let baseCuFt = 0;
    if (inputs.shape === 'cylinder') {
      const diaFt = (Number(inputs.diameter) || 12) / 12;
      const depthFt = Number(inputs.depth) || 4;
      const qty = Number(inputs.quantity) || 1;
      const radius = diaFt / 2;
      baseCuFt = Math.PI * Math.pow(radius, 2) * depthFt * qty;
    } else {
      const length = Number(inputs.length) || 40;
      const width = Number(inputs.width) || 25;
      const thicknessInches = Number(inputs.thickness) || 5;
      baseCuFt = length * width * (thicknessInches / 12);
    }

    const totalCuFt = baseCuFt * (1 + waste);
    const cubicMeters = totalCuFt * 0.0283168;
    const brass = totalCuFt / 100;

    // Materials per IS 456
    const cementBags50kg = Math.ceil(cubicMeters * gradeInfo.cementBagsPerCuM);
    const sandBrass = Number((cubicMeters * gradeInfo.sandBrassPerCuM).toFixed(2));
    const sandTonnes = Number((sandBrass * 4.8).toFixed(2));
    const aggBrass = Number((cubicMeters * gradeInfo.aggBrassPerCuM).toFixed(2));
    const aggTonnes = Number((aggBrass * 4.5).toFixed(2));
    const waterLitres = Math.ceil(cementBags50kg * 28);

    // Ready-Mix Transit Mixers (6 m³ standard capacity)
    const truckLoads = Math.ceil(cubicMeters / 6);
    const isShortLoad = cubicMeters < 3.0;

    // Costs
    const costCement = cementBags50kg * priceCementBag;
    const costSand = sandBrass * priceSandBrass;
    const costAgg = aggBrass * priceAggBrass;
    const costSiteMix = costCement + costSand + costAgg;
    const costRmc = Math.max(cubicMeters * priceRmcCuM, isShortLoad ? 3 * priceRmcCuM : 0);

    return {
      cubicMeters,
      brass,
      totalCuFt,
      baseCuFt,
      gradeKey,
      cementBags50kg,
      sandBrass,
      sandTonnes,
      aggBrass,
      aggTonnes,
      waterLitres,
      truckLoads,
      isShortLoad,
      costCement,
      costSand,
      costAgg,
      costSiteMix,
      costRmc,
      primaryMetrics: [
        { label: 'Concrete Volume (m³)', value: `${formatNumber(cubicMeters, 2)} m³`, subtext: `${formatNumber(brass, 2)} Brass (${formatNumber(totalCuFt, 0)} CFT)`, highlight: 'amber' },
        { label: '50 kg Cement Bags', value: `${formatNumber(cementBags50kg)} Bags`, subtext: `${formatNumber(cementBags50kg * 50)} kg total (${gradeKey})`, highlight: 'emerald' },
        { label: 'Sand (M-Sand)', value: `${formatNumber(sandBrass, 2)} Brass`, subtext: `≈ ${formatNumber(sandTonnes, 1)} Tonnes`, highlight: 'blue' },
        { label: '20mm Aggregate', value: `${formatNumber(aggBrass, 2)} Brass`, subtext: `≈ ${formatNumber(aggTonnes, 1)} Tonnes`, highlight: 'purple' }
      ],
      materialList: [
        { material: `OPC/PPC Cement (50 kg Bags, ${gradeKey})`, quantity: formatNumber(cementBags50kg), unit: 'Bags', estCost: formatCurrency(costCement) },
        { material: 'Coarse Sand / M-Sand (Screened)', quantity: formatNumber(sandBrass, 2), unit: 'Brass', estCost: formatCurrency(costSand) },
        { material: '20mm Crushed Stone Metal', quantity: formatNumber(aggBrass, 2), unit: 'Brass', estCost: formatCurrency(costAgg) },
        { material: 'RMC Transit Mixers (6 m³ capacity)', quantity: truckLoads, unit: 'Trucks', estCost: formatCurrency(costRmc) }
      ],
      breakdown: [
        { item: 'Wet Concrete Volume', value: `${formatNumber(cubicMeters, 2)} m³`, note: 'Net volume required on site' },
        { item: 'Volume in Brass', value: `${formatNumber(brass, 2)} Brass`, note: '1 Brass = 100 cu.ft = 2.83 m³' },
        { item: 'Mixing Water Demand', value: `${formatNumber(waterLitres)} Litres`, note: 'W/C ratio ~0.55 per IS 456' },
        { item: 'Site-Mix Material Cost', value: formatCurrency(costSiteMix), note: 'Cement + Sand + Aggregates' },
        { item: 'RMC Commercial Cost', value: formatCurrency(costRmc), note: `${truckLoads} Transit Mixer(s)` }
      ],
      csvRows: [
        ['Parameter', 'Value', 'Unit'],
        ['Concrete Volume', cubicMeters.toFixed(2), 'm3'],
        ['Concrete Volume Brass', brass.toFixed(2), 'Brass'],
        ['50kg Cement Bags', cementBags50kg, 'Bags'],
        ['Sand Quantity', sandBrass.toFixed(2), 'Brass'],
        ['Aggregate Quantity', aggBrass.toFixed(2), 'Brass'],
        ['Site Mix Cost', costSiteMix, 'INR'],
        ['RMC Cost', costRmc, 'INR']
      ]
    };
  }
};
