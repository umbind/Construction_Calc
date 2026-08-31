/**
 * Vitrified Tiles, Marble/Granite & Adhesive Estimator
 * Computes:
 * - Room Floor Square Footage + Skirting Running Feet (4" height)
 * - Tile Box Counts for Indian Formats: 600x600 mm (2x2 ft), 600x1200 mm (2x4 ft), 1200x1200 mm (4x4 ft), 300x450 mm (1x1.5 ft Dado)
 * - Tile Adhesive in 20 kg Bags (Pidilite Roff / Laticrete ~50 sq.ft/bag)
 * - Epoxy / Cementitious Grout (1kg / 5kg packs) & Spacers
 * - Total Material Costing in ₹ INR
 */
import { formatNumber, formatPercent } from '../utils/formatters.js';
import { formatCurrency } from '../data/currencies.js';

export const flooringCalculator = {
  id: 'flooring',
  category: 'materials',

  tileFormats: {
    '600x600': { name: '600 x 600 mm (2x2 ft Vitrified Tile)', sqFtPerTile: 3.875, pcsPerBox: 4, sqFtPerBox: 15.5 },
    '600x1200': { name: '600 x 1200 mm (2x4 ft GVT Slab)', sqFtPerTile: 7.75, pcsPerBox: 2, sqFtPerBox: 15.5 },
    '1200x1200': { name: '1200 x 1200 mm (4x4 ft Large Format)', sqFtPerTile: 15.5, pcsPerBox: 2, sqFtPerBox: 31.0 },
    '300x450': { name: '300 x 450 mm (1x1.5 ft Bathroom Wall Dado)', sqFtPerTile: 1.45, pcsPerBox: 6, sqFtPerBox: 8.7 },
    '300x300': { name: '300 x 300 mm (1x1 ft Anti-Skid Floor)', sqFtPerTile: 0.97, pcsPerBox: 9, sqFtPerBox: 8.73 }
  },

  presets: [
    { label: '2BHK Apartment Flooring (750 sq.ft, 600x1200 mm GVT)', values: { length: 30, width: 25, tileFormat: '600x1200', includeSkirting: true, waste: 8, priceSqFt: 65, priceAdhesiveBag: 380, priceGroutKg: 80 } },
    { label: 'Living & Dining Hall (350 sq.ft, 600x600 mm Vitrified)', values: { length: 25, width: 14, tileFormat: '600x600', includeSkirting: true, waste: 8, priceSqFt: 55, priceAdhesiveBag: 380, priceGroutKg: 80 } },
    { label: 'Master Bathroom (60 sq.ft Floor + 220 sq.ft Wall Dado)', values: { length: 28, width: 10, tileFormat: '300x450', includeSkirting: false, waste: 10, priceSqFt: 45, priceAdhesiveBag: 380, priceGroutKg: 120 } },
    { label: 'Luxury Villa Hall (800 sq.ft, 1200x1200 mm Large Slab)', values: { length: 40, width: 20, tileFormat: '1200x1200', includeSkirting: true, waste: 10, priceSqFt: 110, priceAdhesiveBag: 450, priceGroutKg: 150 } }
  ],

  calculate(inputs) {
    const length = Number(inputs.length) || 30;
    const width = Number(inputs.width) || 25;
    const waste = (Number(inputs.waste) || 8) / 100;
    const includeSkirting = inputs.includeSkirting !== false && inputs.includeSkirting !== 'false';

    const floorAreaSqFt = length * width;
    const perimeterFt = 2 * (length + width);
    const skirtingAreaSqFt = includeSkirting ? (perimeterFt * 0.333) : 0;
    const totalAreaSqFt = floorAreaSqFt + skirtingAreaSqFt;
    const grossAreaSqFt = totalAreaSqFt * (1 + waste);

    const formatKey = inputs.tileFormat || '600x1200';
    const tileMeta = this.tileFormats[formatKey] || this.tileFormats['600x1200'];

    const totalTiles = Math.ceil(grossAreaSqFt / tileMeta.sqFtPerTile);
    const totalBoxes = Math.ceil(grossAreaSqFt / tileMeta.sqFtPerBox);
    const adhesiveBags20kg = Math.ceil(grossAreaSqFt / 45);
    const groutKg = Math.ceil(grossAreaSqFt / 60);

    const priceSqFt = Number(inputs.priceSqFt) || 65;
    const priceAdhesive = Number(inputs.priceAdhesiveBag) || 380;
    const priceGrout = Number(inputs.priceGroutKg) || 80;

    const costTiles = grossAreaSqFt * priceSqFt;
    const costAdhesive = adhesiveBags20kg * priceAdhesive;
    const costGrout = groutKg * priceGrout;
    const totalCost = costTiles + costAdhesive + costGrout;

    return {
      floorAreaSqFt,
      skirtingAreaSqFt,
      totalAreaSqFt,
      grossAreaSqFt,
      perimeterFt,
      formatKey,
      tileMeta,
      totalTiles,
      totalBoxes,
      adhesiveBags20kg,
      groutKg,
      costTiles,
      costAdhesive,
      costGrout,
      totalCost,
      primaryMetrics: [
        { label: 'Tile Box Count', value: `${formatNumber(totalBoxes)} Boxes`, subtext: `${formatNumber(totalTiles)} Total Pieces`, highlight: 'amber' },
        { label: 'Total Tiling Area', value: `${formatNumber(grossAreaSqFt, 0)} sq.ft`, subtext: `Floor: ${formatNumber(floorAreaSqFt)} + Skirting: ${formatNumber(skirtingAreaSqFt, 0)} sq.ft`, highlight: 'emerald' },
        { label: 'Tile Adhesive (20kg)', value: `${formatNumber(adhesiveBags20kg)} Bags`, subtext: 'Pidilite Roff / Laticrete', highlight: 'blue' },
        { label: 'Total Material Cost', value: formatCurrency(totalCost), subtext: `Tiles (@ ₹${priceSqFt}/sq.ft) + Adhesive`, highlight: 'purple' }
      ],
      materialList: [
        { material: `${tileMeta.name} (${tileMeta.pcsPerBox} pcs/box)`, quantity: totalBoxes, unit: 'Boxes', estCost: formatCurrency(costTiles) },
        { material: 'Tile Adhesive (20 kg Polymer Bed)', quantity: adhesiveBags20kg, unit: 'Bags', estCost: formatCurrency(costAdhesive) },
        { material: 'Epoxy / Joint Grout', quantity: groutKg, unit: 'kg', estCost: formatCurrency(costGrout) }
      ],
      breakdown: [
        { item: 'Floor Net Area', value: `${formatNumber(floorAreaSqFt, 0)} sq.ft`, note: `${length} ft x ${width} ft` },
        { item: 'Skirting Area (4" Height)', value: `${formatNumber(skirtingAreaSqFt, 1)} sq.ft`, note: `${formatNumber(perimeterFt)} RFT Perimeter` },
        { item: 'Box Coverage Spec', value: `${tileMeta.sqFtPerBox} sq.ft/box`, note: `${tileMeta.pcsPerBox} tiles per box` },
        { item: 'Total Estimated Cost', value: formatCurrency(totalCost), note: 'Includes tiles, adhesive & grout' }
      ],
      csvRows: [
        ['Item', 'Value', 'Unit'],
        ['Total Tiling Area', grossAreaSqFt.toFixed(0), 'sq.ft'],
        ['Tile Boxes', totalBoxes, 'Boxes'],
        ['Total Tiles', totalTiles, 'Pieces'],
        ['Adhesive Bags 20kg', adhesiveBags20kg, 'Bags'],
        ['Grout Quantity', groutKg, 'kg'],
        ['Total Cost', totalCost, 'INR']
      ]
    };
  }
};
