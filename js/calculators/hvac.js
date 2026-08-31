/**
 * Room AC Tonnage & BEE 5-Star Electricity Cost Sizing Tool
 * Computes:
 * - Room AC Cooling Capacity in Tons (0.8 Ton, 1.0 Ton, 1.5 Ton, 2.0 Ton, 2.5 Ton)
 * - Total Cooling BTU & Kilowatts (1 Ton = 12,000 BTU/hr = 3.516 kW)
 * - BEE ISEER Rating comparison (3-Star vs 5-Star Inverter AC)
 * - Monthly Power Consumption (Units / kWh) and Electricity Bill at ₹8.00/unit
 * - 5 Indian Climate Zones (NBC 2016 / ECBC): Hot & Dry, Warm & Humid, Composite, Temperate, Cold
 */
import { formatNumber, formatPercent } from '../utils/formatters.js';
import { formatCurrency } from '../data/currencies.js';

export const hvacCalculator = {
  id: 'hvac',
  category: 'mechanical',

  climateZones: {
    hot_dry: { name: 'Hot & Dry (Delhi, Rajasthan, Gujarat)', btuMultiplier: 1.25 },
    warm_humid: { name: 'Warm & Humid (Mumbai, Chennai, Kolkata)', btuMultiplier: 1.20 },
    composite: { name: 'Composite (UP, Bihar, Punjab, MP)', btuMultiplier: 1.15 },
    temperate: { name: 'Temperate (Bengaluru, Pune, Hyderabad)', btuMultiplier: 1.00 },
    cold: { name: 'Cold (Himachal, Uttarakhand, Kashmir)', btuMultiplier: 0.85 }
  },

  presets: [
    { label: 'Master Bedroom (150 sq.ft, Top Floor, Warm & Humid)', values: { roomLength: 15, roomWidth: 10, ceilingHeight: 10, isTopFloor: true, climateZone: 'warm_humid', occupants: 2, hasGlassWindow: true, dailyUsageHours: 8, electricityTariff: 8.0 } },
    { label: 'Living & Dining Hall (300 sq.ft, Middle Floor, Hot & Dry)', values: { roomLength: 20, roomWidth: 15, ceilingHeight: 10, isTopFloor: false, climateZone: 'hot_dry', occupants: 4, hasGlassWindow: true, dailyUsageHours: 10, electricityTariff: 8.0 } },
    { label: 'Compact Study / Kid Bedroom (100 sq.ft, Temperate)', values: { roomLength: 10, roomWidth: 10, ceilingHeight: 9, isTopFloor: false, climateZone: 'temperate', occupants: 1, hasGlassWindow: false, dailyUsageHours: 6, electricityTariff: 8.0 } }
  ],

  calculate(inputs) {
    const length = Number(inputs.roomLength) || 15;
    const width = Number(inputs.roomWidth) || 10;
    const ceilingHeight = Number(inputs.ceilingHeight) || 10;
    const isTopFloor = inputs.isTopFloor === true || inputs.isTopFloor === 'true';
    const zoneKey = inputs.climateZone || 'warm_humid';
    const zone = this.climateZones[zoneKey] || this.climateZones.warm_humid;
    const occupants = Number(inputs.occupants) || 2;
    const hasGlassWindow = inputs.hasGlassWindow === true || inputs.hasGlassWindow === 'true';
    const dailyHours = Number(inputs.dailyUsageHours) || 8;
    const electricityTariff = Number(inputs.electricityTariff) || 8.0;

    const floorAreaSqFt = length * width;
    let baseBtu = floorAreaSqFt * 50;

    if (ceilingHeight > 10) baseBtu *= (1 + ((ceilingHeight - 10) * 0.05));
    if (isTopFloor) baseBtu *= 1.15;
    if (hasGlassWindow) baseBtu *= 1.10;
    if (occupants > 2) baseBtu += (occupants - 2) * 500;

    const totalCoolingBtu = Math.round(baseBtu * zone.btuMultiplier);
    const totalCoolingKw = Number((totalCoolingBtu / 3412.142).toFixed(2));
    const rawTonnage = totalCoolingBtu / 12000;
    
    let recommendedTon = 1.0;
    if (rawTonnage <= 0.85) recommendedTon = 0.8;
    else if (rawTonnage <= 1.15) recommendedTon = 1.0;
    else if (rawTonnage <= 1.65) recommendedTon = 1.5;
    else if (rawTonnage <= 2.2) recommendedTon = 2.0;
    else recommendedTon = 2.5;

    const wattsPerTon5Star = 850;
    const wattsPerTon3Star = 1100;
    const powerWatts5Star = Math.round(recommendedTon * wattsPerTon5Star);
    const powerWatts3Star = Math.round(recommendedTon * wattsPerTon3Star);

    const monthlyUnits5Star = Math.round((powerWatts5Star * dailyHours * 30 * 0.60) / 1000);
    const monthlyUnits3Star = Math.round((powerWatts3Star * dailyHours * 30 * 0.60) / 1000);

    const monthlyBill5Star = Math.round(monthlyUnits5Star * electricityTariff);
    const monthlyBill3Star = Math.round(monthlyUnits3Star * electricityTariff);
    const monthlySavings5Star = monthlyBill3Star - monthlyBill5Star;
    const annualSavings5Star = monthlySavings5Star * 8;

    return {
      floorAreaSqFt,
      ceilingHeight,
      isTopFloor,
      zoneName: zone.name,
      totalCoolingBtu,
      totalCoolingKw,
      rawTonnage,
      recommendedTon,
      dailyHours,
      electricityTariff,
      powerWatts5Star,
      powerWatts3Star,
      monthlyUnits5Star,
      monthlyUnits3Star,
      monthlyBill5Star,
      monthlyBill3Star,
      monthlySavings5Star,
      annualSavings5Star,
      primaryMetrics: [
        { label: 'Recommended AC Tonnage', value: `${recommendedTon} Ton`, subtext: `${formatNumber(totalCoolingBtu)} BTU (${totalCoolingKw} kW)`, highlight: 'amber' },
        { label: '5-Star Inverter Monthly Bill', value: formatCurrency(monthlyBill5Star), subtext: `≈ ${monthlyUnits5Star} Units/month (@ ₹${electricityTariff}/unit)`, highlight: 'emerald' },
        { label: '3-Star Inverter Monthly Bill', value: formatCurrency(monthlyBill3Star), subtext: `≈ ${monthlyUnits3Star} Units/month`, highlight: 'rose' },
        { label: '5-Star Annual Power Savings', value: formatCurrency(annualSavings5Star), subtext: `Saves ₹${monthlySavings5Star}/month over 3-Star AC`, highlight: 'blue' }
      ],
      materialList: [
        { material: `${recommendedTon} Ton 5-Star Inverter Split AC (ISEER ≥ 5.0)`, quantity: '1 Unit', unit: 'Appliance', estCost: '≈ ₹38,000' },
        { material: 'Copper Piping & Drain Kit (up to 3m)', quantity: '1 Set', unit: 'Hardware', estCost: 'Included' },
        { material: 'Monthly Power Consumption (5-Star)', quantity: `${monthlyUnits5Star} kWh`, unit: 'Power', estCost: formatCurrency(monthlyBill5Star) }
      ],
      breakdown: [
        { item: 'Floor Area & Climate Zone', value: `${floorAreaSqFt} sq.ft`, note: zone.name },
        { item: 'Direct Roof Solar Heat', value: isTopFloor ? '+15% Top Floor Surcharge' : 'Normal / Intermediate Floor', note: 'Thermal insulation factor' },
        { item: 'BEE 5-Star Power Draw', value: `${powerWatts5Star} Watts (Avg ${Math.round(powerWatts5Star * 0.6)}W)`, note: 'Variable inverter compressor' },
        { item: 'Monthly Energy Bill (5-Star)', value: formatCurrency(monthlyBill5Star), note: `${dailyHours} hrs/day run @ ₹${electricityTariff}/unit` }
      ],
      csvRows: [
        ['Parameter', 'Value', 'Unit'],
        ['Floor Area', floorAreaSqFt, 'sq.ft'],
        ['Total Cooling BTU', totalCoolingBtu, 'BTU'],
        ['Recommended Ton', recommendedTon, 'Ton'],
        ['5-Star Monthly Units', monthlyUnits5Star, 'kWh'],
        ['5-Star Monthly Bill', monthlyBill5Star, 'INR'],
        ['3-Star Monthly Bill', monthlyBill3Star, 'INR'],
        ['Annual Power Savings', annualSavings5Star, 'INR']
      ]
    };
  }
};
