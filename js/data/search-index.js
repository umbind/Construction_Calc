/**
 * Plan & BuildMetric Search Index (India Construction & Real Estate)
 * Indexes all 11 calculators with Indian construction terminology, IS standards, units, and financial terms.
 */
export const searchIndex = [
  {
    id: 'concrete',
    title: 'Concrete Volume, 50kg Bags & RMC Estimator',
    shortTitle: 'Concrete & 50kg Bags',
    category: 'materials',
    description: 'Calculate concrete cubic meters (m³), Brass (100 cu.ft), 50kg cement bags (M20, M25, M15, M7.5), sand, 20mm aggregates, and RMC transit mixer loads.',
    keywords: ['concrete', 'cement', 'bags', '50kg', 'm20', 'm25', 'm15', 'pcc', 'rcc', 'slab', 'brass', 'cft', 'm3', 'cubic meter', 'sand', 'm-sand', 'aggregate', 'metal', 'rmc', 'transit mixer', 'is 456', 'footing', 'column']
  },
  {
    id: 'drywall',
    title: 'Gyproc False Ceiling, POP & Wall Plastering',
    shortTitle: 'Ceiling & Plastering',
    category: 'renovation',
    description: 'Estimate Gyproc 6x4 ft gypsum ceiling sheets, GI channels, drywall screws, joint compound bags, and 12mm/20mm cement wall plastering.',
    keywords: ['gypsum', 'false ceiling', 'pop', 'gyproc', 'saint gobain', 'ceiling section', 'perimeter channel', 'plaster', 'plastering', '12mm plaster', '20mm plaster', 'drywall', 'screws', 'joint compound', 'tape']
  },
  {
    id: 'flooring',
    title: 'Vitrified Tiles, Marble/Granite & Adhesive Estimator',
    shortTitle: 'Vitrified Tiles',
    category: 'materials',
    description: 'Calculate floor square footage, 4-inch skirting running feet, box counts for 600x600, 600x1200, 1200x1200mm tiles, and 20kg Roff adhesive bags.',
    keywords: ['tiles', 'flooring', 'vitrified', 'gvt', 'pgvt', '600x600', '600x1200', '1200x1200', 'boxes', 'skirting', 'tile adhesive', '20kg bag', 'roff', 'laticrete', 'grout', 'epoxy', 'marble', 'granite']
  },
  {
    id: 'framing',
    title: 'Brickwork Masonry, AAC Blocks & RCC Steel TMT',
    shortTitle: 'Brickwork & TMT Steel',
    category: 'materials',
    description: 'Estimate 9-inch and 4.5-inch red clay brick walls, AAC lightweight blocks, mortar cement bags, sand brass, and Fe 500D TMT steel reinforcement.',
    keywords: ['brick', 'brickwork', 'red brick', 'aac', 'aac block', 'masonry', 'mortar', 'partition wall', '9 inch wall', 'tmt steel', 'rebar', 'fe 500d', 'is 1786', 'steel kg', 'quintal', 'reinforcement', 'framing']
  },
  {
    id: 'paint',
    title: 'Paint Litres, 40kg Wall Putty & Primer Estimator',
    shortTitle: 'Paint & Wall Putty',
    category: 'materials',
    description: 'Calculate interior/exterior paint in Litres (20L, 10L, 4L, 1L buckets), 40kg Wall Putty bags (Birla/JK Putty 2 coats), and primer for fresh & repaint work.',
    keywords: ['paint', 'putty', 'wall putty', 'birla white', 'jk putty', 'primer', 'asian paints', 'royale', 'tractor', 'apex', 'litres', 'buckets', '20l bucket', 'emulsion', 'exterior', 'interior', 'painting']
  },
  {
    id: 'roofing',
    title: 'RCC Roof Slab Casting, Waterproofing & Profile Sheets',
    shortTitle: 'RCC Slab & Waterproofing',
    category: 'materials',
    description: 'Estimate M20 RCC roof slab casting with Fe 500D steel, Dr. Fixit liquid terrace waterproofing membrane (Litres), and JSW/Tata profile metal roofing sheets.',
    keywords: ['roof', 'roofing', 'rcc slab', 'roof slab', 'casting', 'm20 slab', 'waterproofing', 'dr fixit', 'roofseal', 'raincoat', 'terrace', 'profile sheets', 'metal sheets', 'jsw', 'tata shaktee', 'corrugated']
  },
  {
    id: 'caprate',
    title: 'Rental Yield & Net Operating Income (NOI) Calculator',
    shortTitle: 'Rental Yield (Cap Rate)',
    category: 'realestate',
    description: 'Compute gross rental yield % (2.5% - 4.5% residential benchmark), society maintenance, municipal property taxes (MCGM/BBMP/MCD), and annual NOI in ₹ Lakhs.',
    keywords: ['rental yield', 'cap rate', 'noi', 'net operating income', 'rent', 'society maintenance', 'property tax', 'bbmp', 'mcgm', 'mcd', 'grm', 'investment', 'apartment yield', 'commercial yield', 'lakhs', 'crores']
  },
  {
    id: 'brrrr',
    title: 'Home Loan EMI, Tax Benefits (Sec 24b/80C) & Finance',
    shortTitle: 'Home Loan EMI',
    category: 'realestate',
    description: 'Calculate monthly home loan EMI, Section 24(b) interest deduction (up to ₹2 Lakhs), Section 80C principal savings, RBI LTV cap, and monthly net cash flow.',
    keywords: ['home loan', 'emi', 'housing loan', 'interest', 'amortization', 'section 24b', 'section 80c', 'tax benefit', 'tax deduction', 'rbi', 'ltv', 'brrrr', 'refinance', 'equity', 'monthly emi']
  },
  {
    id: 'fixflip',
    title: 'Property Resale Profit & Capital Gains Tax (LTCG / STCG)',
    shortTitle: 'Resale Profit & LTCG',
    category: 'realestate',
    description: 'Calculate property flip and renovation profit, 12.5% LTCG tax (>24 mos per Budget 2024), stamp duty & registration charges, brokerage fees, and annualized ROI.',
    keywords: ['resale', 'flip', 'fix and flip', 'property profit', 'capital gains', 'ltcg', '12.5%', 'stcg', 'budget 2024', 'stamp duty', 'registration', 'brokerage', 'roi', 'renovation', 'lakhs', 'crores']
  },
  {
    id: 'hardmoney',
    title: 'Builder Construction Loan & Stage Disbursement Estimator',
    shortTitle: 'Construction Loan',
    category: 'realestate',
    description: 'Estimate project/builder loan interest at 12%-16% p.a., with RERA-aligned 6-stage milestone disbursement and exact interest savings vs lump-sum.',
    keywords: ['construction loan', 'builder loan', 'project finance', 'disbursement', 'milestone', 'draws', 'slab disbursement', 'plinth', 'stage loan', 'rera', 'interest savings', 'hard money', 'bridge loan']
  },
  {
    id: 'hvac',
    title: 'Room AC Tonnage & BEE 5-Star Electricity Cost Sizing',
    shortTitle: 'AC Tonnage & Power Bill',
    category: 'mechanical',
    description: 'Size room split AC in Tons (0.8, 1.0, 1.5, 2.0 Ton), compare BEE 3-Star vs 5-Star Inverter AC power consumption, and calculate monthly electricity bills at ₹8/unit.',
    keywords: ['ac', 'air conditioner', 'ac tonnage', '1.5 ton', '1 ton', '2 ton', 'inverter ac', 'bee 5 star', 'iseer', 'power consumption', 'electricity bill', 'units', 'btu', 'hvac', 'climate zone', 'cooling']
  }
];
