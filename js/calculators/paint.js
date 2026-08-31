/**
 * Paint, Wall Putty & Primer Coverage Estimator
 * Computes:
 * - Interior Emulsion (Royale / Tractor) & Exterior (Apex / Ultima) in Litres (1L, 4L, 10L, 20L buckets)
 * - Wall Putty (40 kg & 20 kg bags for 2 coats smooth finish - Birla White / JK Putty)
 * - Water Thinnable Primer in Litres
 * - Material Costing in ₹ INR
 */
import { formatNumber, formatPercent } from '../utils/formatters.js';
import { formatCurrency } from '../data/currencies.js';

export const paintCalculator = {
  id: 'paint',
  category: 'materials',

  presets: [
    { label: '2BHK Complete Fresh Painting + Putty (2,200 sq.ft)', values: { wallAreaSqFt: 2200, ceilingAreaSqFt: 600, coats: 2, includePutty: true, includePrimer: true, paintType: 'royale', pricePaintLitre: 380, pricePuttyBag40kg: 780, pricePrimerLitre: 160 } },
    { label: '3BHK Interior Repaint (3,400 sq.ft, 2 Coats Royale)', values: { wallAreaSqFt: 3400, ceilingAreaSqFt: 900, coats: 2, includePutty: false, includePrimer: true, paintType: 'royale', pricePaintLitre: 380, pricePuttyBag40kg: 780, pricePrimerLitre: 160 } },
    { label: 'Exterior Building Elevation (2,500 sq.ft, Apex Weatherproof)', values: { wallAreaSqFt: 2500, ceilingAreaSqFt: 0, coats: 2, includePutty: false, includePrimer: true, paintType: 'apex', pricePaintLitre: 320, pricePuttyBag40kg: 780, pricePrimerLitre: 160 } },
    { label: 'Single Room Quick Touchup (450 sq.ft, Tractor Emulsion)', values: { wallAreaSqFt: 450, ceilingAreaSqFt: 150, coats: 2, includePutty: false, includePrimer: false, paintType: 'tractor', pricePaintLitre: 210, pricePuttyBag40kg: 780, pricePrimerLitre: 160 } }
  ],

  calculate(inputs) {
    const wallArea = Number(inputs.wallAreaSqFt) || 2200;
    const ceilingArea = Number(inputs.ceilingAreaSqFt) || 600;
    const totalSurfaceArea = wallArea + ceilingArea;

    const coats = Number(inputs.coats) || 2;
    const includePutty = inputs.includePutty === true || inputs.includePutty === 'true';
    const includePrimer = inputs.includePrimer === true || inputs.includePrimer === 'true';

    const paintCoveragePerLitre = coats === 1 ? 130 : 65;
    const grossPaintLitres = Math.ceil(totalSurfaceArea / paintCoveragePerLitre);

    let remLitres = grossPaintLitres;
    const buckets20L = Math.floor(remLitres / 20);
    remLitres %= 20;
    const buckets10L = Math.floor(remLitres / 10);
    remLitres %= 10;
    const buckets4L = Math.floor(remLitres / 4);
    remLitres %= 4;
    const buckets1L = remLitres > 0 ? remLitres : 0;

    const puttyKg = includePutty ? Math.ceil(totalSurfaceArea / 14) : 0;
    const puttyBags40kg = Math.ceil(puttyKg / 40);
    const primerLitres = includePrimer ? Math.ceil(totalSurfaceArea / 130) : 0;

    const pricePaintLitre = Number(inputs.pricePaintLitre) || 380;
    const pricePuttyBag = Number(inputs.pricePuttyBag40kg) || 780;
    const pricePrimerLitre = Number(inputs.pricePrimerLitre) || 160;

    const costPaint = grossPaintLitres * pricePaintLitre;
    const costPutty = puttyBags40kg * pricePuttyBag;
    const costPrimer = primerLitres * pricePrimerLitre;
    const totalCost = costPaint + costPutty + costPrimer;

    return {
      totalSurfaceArea,
      wallArea,
      ceilingArea,
      coats,
      grossPaintLitres,
      buckets20L,
      buckets10L,
      buckets4L,
      buckets1L,
      puttyBags40kg,
      primerLitres,
      costPaint,
      costPutty,
      costPrimer,
      totalCost,
      primaryMetrics: [
        { label: 'Total Paint Litres', value: `${formatNumber(grossPaintLitres)} Litres`, subtext: `${coats} Coats (${formatNumber(totalSurfaceArea)} sq.ft)`, highlight: 'amber' },
        { label: 'Bucket Packaging', value: `${buckets20L ? buckets20L + 'x20L ' : ''}${buckets10L ? buckets10L + 'x10L ' : ''}${buckets4L ? buckets4L + 'x4L ' : ''}${buckets1L ? buckets1L + 'x1L' : ''}`, subtext: 'Standard Indian pack sizes', highlight: 'emerald' },
        { label: '40kg Wall Putty', value: `${includePutty ? formatNumber(puttyBags40kg) : '0'} Bags`, subtext: includePutty ? 'Birla White / JK Putty 2 coats' : 'Excluded', highlight: 'blue' },
        { label: 'Total Material Cost', value: formatCurrency(totalCost), subtext: 'Paint + Putty + Primer', highlight: 'purple' }
      ],
      materialList: [
        { material: `Emulsion Paint (${coats} Coats)`, quantity: grossPaintLitres, unit: 'Litres', estCost: formatCurrency(costPaint) },
        { material: 'Wall Putty (40kg Bags, 2 Coats)', quantity: puttyBags40kg, unit: 'Bags', estCost: formatCurrency(costPutty) },
        { material: 'Water-Thinnable Base Primer', quantity: primerLitres, unit: 'Litres', estCost: formatCurrency(costPrimer) }
      ],
      breakdown: [
        { item: 'Total Surface Area', value: `${formatNumber(totalSurfaceArea)} sq.ft`, note: `Wall: ${wallArea} sq.ft + Ceiling: ${ceilingArea} sq.ft` },
        { item: 'Paint Coverage Spec', value: `${paintCoveragePerLitre} sq.ft/L`, note: `${coats} coat coverage` },
        { item: 'Wall Putty Demand', value: `${puttyBags40kg} Bags (40kg)`, note: includePutty ? '2 coats smooth finish' : 'N/A' },
        { item: 'Total Material Cost', value: formatCurrency(totalCost), note: 'Asian Paints / Berger grade' }
      ],
      csvRows: [
        ['Item', 'Value', 'Unit'],
        ['Total Paint Area', totalSurfaceArea.toFixed(0), 'sq.ft'],
        ['Paint Volume', grossPaintLitres, 'Litres'],
        ['Wall Putty Bags 40kg', puttyBags40kg, 'Bags'],
        ['Primer Volume', primerLitres, 'Litres'],
        ['Total Cost', totalCost, 'INR']
      ]
    };
  }
};
