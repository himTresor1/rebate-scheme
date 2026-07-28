/**
 * Canonical rebate document display names (standardization sheet — middle column).
 * Use these everywhere documents are listed, uploaded, or verified.
 */
export const DOC_NAMES = {
  nationalIdCopy: 'National ID Copy',
  motorcycleDriversLicense: "Motorcycle Driver's License",
  signedFinancingAgreement: 'Signed Financing Agreement',
  notarizedAffidavit: 'Notarized Individual Affidavit of Financial Need',
  afConfirmationFinancialNeed: 'Asset Financier Confirmation of Financial Need',
  possessionStatement: 'AF and Client E-Moto Possession Statement',
  retrofitSuitability: 'Retrofit Suitability Statement',
  iceEngineDisposal: 'ICE-Moto Engine Disposal Agreement',
  additionalSupporting: 'Additional Supporting Documents',
} as const;

export type DocNameKey = keyof typeof DOC_NAMES;

/** Keywords for matching uploaded file / seed document names to a canonical doc. */
export const DOC_KEYWORDS: Record<DocNameKey, string[]> = {
  nationalIdCopy: ['national id copy', 'national id', 'id document', 'nid'],
  motorcycleDriversLicense: [
    "motorcycle driver's license",
    'motorcycle license',
    'moto license',
    'driver',
  ],
  signedFinancingAgreement: [
    'signed financing agreement',
    'financing agreement',
    'financing contract',
    'signed lease',
    'loan agreement',
    'contract',
  ],
  notarizedAffidavit: ['notarized individual affidavit', 'individual affidavit', 'affidavit'],
  afConfirmationFinancialNeed: [
    'asset financier confirmation of financial need',
    'af confirmation of financial need',
    'confirmation of financial need',
    'af financial need',
  ],
  possessionStatement: [
    'af and client e-moto possession statement',
    'possession statement',
    'possession confirmation',
    'e-moto possession',
    'possession',
  ],
  retrofitSuitability: ['retrofit suitability', 'suitability'],
  iceEngineDisposal: ['ice-moto engine disposal', 'ice-engine', 'ice engine', 'disposal'],
  additionalSupporting: ['additional supporting', 'supporting document'],
};

export const DOC_TEMPLATE_FILES: Partial<Record<DocNameKey, string>> = {
  notarizedAffidavit: 'Individual_Affidavit_of_Financial_Need_Template.pdf',
  afConfirmationFinancialNeed: 'AF_Confirmation_of_Financial_Need_Template.pdf',
  possessionStatement: 'AF_Client_Confirmation_of_EMoto_Possession_Template.pdf',
  retrofitSuitability: 'Retrofit_Suitability_Statement_Template.pdf',
  iceEngineDisposal: 'ICE_Moto_Engine_Disposal_Agreement_Template.pdf',
};

export const ALL_APPLICATION_DOC_KEYS: DocNameKey[] = [
  'nationalIdCopy',
  'motorcycleDriversLicense',
  'signedFinancingAgreement',
  'notarizedAffidavit',
  'afConfirmationFinancialNeed',
  'possessionStatement',
];

export const RETROFIT_DOC_KEYS: DocNameKey[] = ['retrofitSuitability', 'iceEngineDisposal'];

export function matchDocByKeywords(
  fileName: string,
  keywords: string[]
): boolean {
  const name = fileName.toLowerCase();
  return keywords.some((kw) => name.includes(kw.toLowerCase()));
}
