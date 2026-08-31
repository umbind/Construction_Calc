/**
 * Brickwork Masonry, AAC Blocks & RCC Structural Steel Estimator
 * Computes:
 * - Red Clay Bricks (9"x4.25"x3" standard) or AAC Lightweight Blocks (600x200x150 mm)
 * - 50 kg Cement Bags & Sand in Brass for Masonry Mortar (1:4 or 1:6 mix)
 * - Block Jointing Adhesive (40 kg bags for AAC blocks)
 * - RCC Structural Steel Reinforcement (Fe 500D TMT bars in kg & Quintals/Tonnes per IS 1786)
 * - Material Costs in ₹ INR
 */
import { formatNumber, formatPercent } from '../utils/formatters.js';
import { formatCurrency } from '../data/currencies.js';

export const framingCalculator = {
  id: 'framing',
  category: 'materials',

  presets: [
    { label: '9" External Red Brick Wall (100 ft run, 10 ft height)', values: { wallType: 'brick_9', wallLength: 100, wallHeight: 10, openingsArea: 100, waste: 5, priceUnit: 9, priceCementBag: 380, priceSandBrass: 4500 } },
    { label: '4.5" Internal Brick Partition (80 ft run, 10 ft height)', values: { wallType: 'brick_4', wallLength: 80, wallHeight: 10, openingsArea: 60, waste: 5, priceUnit: 9, priceCementBag: 380, priceSandBrass: 4500 } },
    { label: 'AAC Block Partition Wall (120 ft run, 10 ft height, 150mm)', values: { wallType: 'aac_150', wallLength: 120, wallHeight: 10, openingsArea: 80, waste: 5, priceUnit: 65, priceAdhesiveBag: 350 } },
    { label: 'RCC Slab Steel Reinforcement (1,000 sq.ft, 5" thick)', values: { wallType: 'rcc_steel', slabAreaSqFt: 1000, slabThicknessInches: 5, steelRatioKgCuM: 80, waste: 5, priceSteelKg: 68 } }
  ],

  calculate(inputs) {
    const wallType = inputs.wallType || 'brick_9';
    const waste = (Number(inputs.waste) || 5) / 100;

    if (wallType === 'rcc_steel') {
      const slabAreaSqFt = Number(inputs.slabAreaSqFt) || 1000;
      const thicknessInches = Number(inputs.slabThicknessInches) || 5;
      const volCuFt = slabAreaSqFt * (thicknessInches / 12);
      const volCuM = volCuFt * 0.0283168;
      const steelRatioKgCuM = Number(inputs.steelRatioKgCuM) || 80;
      const grossSteelKg = (volCuM * steelRatioKgCuM) * (1 + waste);
      const steelQuintals = grossSteelKg / 100;
      const steelTonnes = grossSteelKg / 1000;

      const priceSteelKg = Number(inputs.priceSteelKg) || 68;
      const totalCost = grossSteelKg * priceSteelKg;

      return {
        wallType: 'rcc_steel',
        volCuM,
        volCuFt,
        grossSteelKg,
        steelQuintals,
        steelTonnes,
        priceSteelKg,
        totalCost,
        primaryMetrics: [
          { label: 'Fe 500D TMT Steel', value: `${formatNumber(grossSteelKg, 0)} kg`, subtext: `≈ ${formatNumber(steelQuintals, 1)} Quintals (${formatNumber(steelTonnes, 2)} Tonnes)`, highlight: 'amber' },
          { label: 'Concrete Volume', value: `${formatNumber(volCuM, 2)} m³`, subtext: `${formatNumber(volCuFt, 0)} CFT Volume`, highlight: 'emerald' },
          { label: 'Steel Reinforcement Cost', value: formatCurrency(totalCost), subtext: `@ ₹${priceSteelKg}/kg TMT Rebar`, highlight: 'purple' },
          { label: 'Steel Density Ratio', value: `${steelRatioKgCuM} kg/m³`, subtext: 'IS 456 standard for RCC slabs', highlight: 'blue' }
        ],
        materialList: [
          { material: 'Fe 500D / Fe 550D TMT Rebar (IS 1786)', quantity: formatNumber(grossSteelKg, 0), unit: 'kg', estCost: formatCurrency(totalCost) }
        ],
        breakdown: [
          { item: 'Structural Concrete Volume', value: `${formatNumber(volCuM, 2)} m³`, note: `${slabAreaSqFt} sq.ft slab @ ${thicknessInches}" thickness` },
          { item: 'Total Steel Weight', value: `${formatNumber(steelQuintals, 1)} Quintals`, note: `${formatNumber(grossSteelKg, 0)} kg total` },
          { item: 'Total Estimated Steel Cost', value: formatCurrency(totalCost), note: `Excludes binding wire & cutting` }
        ],
        csvRows: [
          ['Item', 'Value', 'Unit'],
          ['Concrete Volume', volCuM.toFixed(2), 'm3'],
          ['TMT Steel Weight', grossSteelKg.toFixed(0), 'kg'],
          ['TMT Steel Quintals', steelQuintals.toFixed(1), 'Quintals'],
          ['Total Cost', totalCost, 'INR']
        ]
      };
    }

    const length = Number(inputs.wallLength) || 100;
    const height = Number(inputs.wallHeight) || 10;
    const openings = Number(inputs.openingsArea) || 0;
    const grossWallArea = Math.max((length * height) - openings, 0);

    if (wallType.startsWith('aac')) {
      const blocksPerSqFt = 1 / 1.29;
      const totalBlocks = Math.ceil((grossWallArea * blocksPerSqFt) * (1 + waste));
      const adhesiveBags40kg = Math.ceil(grossWallArea / 125);
      const priceUnit = Number(inputs.priceUnit) || 65;
      const priceAdhesive = Number(inputs.priceAdhesiveBag) || 350;
      const costBlocks = totalBlocks * priceUnit;
      const costAdhesive = adhesiveBags40kg * priceAdhesive;
      const totalCost = costBlocks + costAdhesive;

      return {
        wallType: 'aac',
        grossWallArea,
        totalBlocks,
        adhesiveBags40kg,
        totalCost,
        primaryMetrics: [
          { label: 'AAC Lightweight Blocks', value: `${formatNumber(totalBlocks)} Nos`, subtext: `${formatNumber(grossWallArea, 0)} sq.ft wall area`, highlight: 'amber' },
          { label: 'Joint Adhesive (40kg)', value: `${formatNumber(adhesiveBags40kg)} Bags`, subtext: 'Polymer-modified block jointing', highlight: 'emerald' },
          { label: 'Total Masonry Cost', value: formatCurrency(totalCost), subtext: `Blocks (@ ₹${priceUnit}/pc) + Adhesive`, highlight: 'purple' },
          { label: 'Wall Thickness', value: '150 mm (6")', subtext: 'AAC Thermal Block', highlight: 'blue' }
        ],
        materialList: [
          { material: 'AAC Blocks (600x200x150 mm)', quantity: totalBlocks, unit: 'Blocks', estCost: formatCurrency(costBlocks) },
          { material: 'Thin-bed Block Adhesive (40kg)', quantity: adhesiveBags40kg, unit: 'Bags', estCost: formatCurrency(costAdhesive) }
        ],
        breakdown: [
          { item: 'Net Masonry Wall Area', value: `${formatNumber(grossWallArea, 0)} sq.ft`, note: `After door/window deductions` },
          { item: 'AAC Blocks Count', value: `${formatNumber(totalBlocks)} Nos`, note: 'Includes 5% breakage allowance' },
          { item: 'Total Material Cost', value: formatCurrency(totalCost), note: 'AAC Blocks + Polymer Adhesive' }
        ],
        csvRows: [
          ['Item', 'Value', 'Unit'],
          ['Wall Area', grossWallArea.toFixed(0), 'sq.ft'],
          ['AAC Blocks', totalBlocks, 'Blocks'],
          ['Adhesive Bags 40kg', adhesiveBags40kg, 'Bags'],
          ['Total Cost', totalCost, 'INR']
        ]
      };
    }

    // Red Clay Brickwork
    const is9Inch = wallType === 'brick_9';
    const bricksPerSqFt = is9Inch ? 10.5 : 5.25;
    const totalBricks = Math.ceil((grossWallArea * bricksPerSqFt) * (1 + waste));
    const cementFactor = is9Inch ? 0.025 : 0.012;
    const sandFactor = is9Inch ? 0.0035 : 0.0018;

    const cementBags50kg = Math.ceil(grossWallArea * cementFactor);
    const sandBrass = Number((grossWallArea * sandFactor).toFixed(2));

    const priceUnit = Number(inputs.priceUnit) || 9;
    const priceCementBag = Number(inputs.priceCementBag) || 380;
    const priceSandBrass = Number(inputs.priceSandBrass) || 4500;

    const costBricks = totalBricks * priceUnit;
    const costCement = cementBags50kg * priceCementBag;
    const costSand = sandBrass * priceSandBrass;
    const totalCost = costBricks + costCement + costSand;

    return {
      wallType: 'brick',
      is9Inch,
      grossWallArea,
      totalBricks,
      cementBags50kg,
      sandBrass,
      totalCost,
      primaryMetrics: [
        { label: 'Red Clay Bricks', value: `${formatNumber(totalBricks)} Bricks`, subtext: `${is9Inch ? '9" Main Load-bearing Wall' : '4.5" Internal Partition'}`, highlight: 'amber' },
        { label: '50 kg Cement Bags', value: `${formatNumber(cementBags50kg)} Bags`, subtext: 'For 1:6 Masonry Mortar', highlight: 'emerald' },
        { label: 'Mortar Sand', value: `${formatNumber(sandBrass, 2)} Brass`, subtext: 'Screened masonry sand', highlight: 'blue' },
        { label: 'Total Material Cost', value: formatCurrency(totalCost), subtext: 'Bricks + Cement + Sand', highlight: 'purple' }
      ],
      materialList: [
        { material: 'First-Class Red Clay Bricks', quantity: formatNumber(totalBricks), unit: 'Bricks', estCost: formatCurrency(costBricks) },
        { material: 'PPC Cement (50kg Bags)', quantity: cementBags50kg, unit: 'Bags', estCost: formatCurrency(costCement) },
        { material: 'Screened Masonry Sand', quantity: formatNumber(sandBrass, 2), unit: 'Brass', estCost: formatCurrency(costSand) }
      ],
      breakdown: [
        { item: 'Net Wall Surface Area', value: `${formatNumber(grossWallArea, 0)} sq.ft`, note: `Excluding openings` },
        { item: 'Brickwork Thickness', value: is9Inch ? '9 Inches (230 mm)' : '4.5 Inches (115 mm)', note: is9Inch ? 'Double brick' : 'Single brick' },
        { item: 'Mortar Cement Bags', value: `${cementBags50kg} Bags`, note: '50 kg bags' },
        { item: 'Total Material Cost', value: formatCurrency(totalCost), note: 'Bricks + Cement + Sand' }
      ],
      csvRows: [
        ['Item', 'Value', 'Unit'],
        ['Wall Area', grossWallArea.toFixed(0), 'sq.ft'],
        ['Total Bricks', totalBricks, 'Bricks'],
        ['Cement Bags', cementBags50kg, 'Bags'],
        ['Sand Brass', sandBrass.toFixed(2), 'Brass'],
        ['Total Cost', totalCost, 'INR']
      ]
    };
  }
};
