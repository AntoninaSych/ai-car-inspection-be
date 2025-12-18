import clm from 'country-locale-map';

/**
 * Prompt templates for car inspection analysis
 */

export const CAR_INSPECTION_PROMPT = `
You are an expert car inspector. Analyze the provided images of a {{brand}} {{model}} ({{year}}) with {{mileage}} km mileage.
{{regionContext}}
Rules (must follow):
- Describe only damage clearly visible in the images.
- Do not assume hidden, internal, mechanical, or not-visible damage.
- If damage cannot be confirmed, use "severity": "unknown".
- No phrases like “likely”, “probable”, or assumptions for detected damage.
- Costs should be based only on confirmed visible damage.
- All cost estimates must be in {{currency}} and reflect typical prices for the {{region}} market.
- All text values (descriptions, recommendations, summary) must be written in {{language}}.
- Keep all JSON keys in English exactly as shown in the structure below.
- Output valid JSON only, no extra text.

Images descriptions: {{imageDescriptions}}
Owner description: {{ownerDescription}}

JSON structure:
{
  "damage_detected": true,
  "currency": "{{currencyCode}}",
  "region": "{{region}}",
  "locale": "{{locale}}",
  "damages": [
    {
      "location": "location in {{language}}",
      "severity": "minor/moderate/severe/unknown translated to {{language}}",
      "description": "detailed description in {{language}}",
      "estimated_parts_cost_original": "approximate cost for OEM parts only in {{currencyCode}}",
      "estimated_parts_cost_alternative": "approximate cost for aftermarket parts only in {{currencyCode}}",
      "estimated_labor_cost": "approximate labor/repair work cost in {{currencyCode}}"
    }
  ],
  "recommendations": [
    "recommendation in {{language}}"
  ],
  "estimated_total_parts_cost_original": "total OEM parts cost in {{currencyCode}}",
  "estimated_total_parts_cost_alternative": "total aftermarket parts cost in {{currencyCode}}",
  "estimated_total_labor_cost": "total labor cost in {{currencyCode}}",
  "summary": "brief summary of the inspection in {{language}}"
}`;

/**
 * Language code to language name mapping
 * Used to convert ISO 639-1 codes to human-readable names
 */
const LANGUAGE_NAMES = {
  en: 'English', uk: 'Ukrainian', pl: 'Polish', de: 'German', fr: 'French',
  it: 'Italian', es: 'Spanish', nl: 'Dutch', cs: 'Czech', sk: 'Slovak',
  hu: 'Hungarian', ro: 'Romanian', bg: 'Bulgarian', sv: 'Swedish', no: 'Norwegian',
  da: 'Danish', fi: 'Finnish', pt: 'Portuguese', ja: 'Japanese', ko: 'Korean',
  zh: 'Chinese', ar: 'Arabic', he: 'Hebrew', tr: 'Turkish', ru: 'Russian',
  el: 'Greek', th: 'Thai', vi: 'Vietnamese', id: 'Indonesian', ms: 'Malay',
  hi: 'Hindi', bn: 'Bengali', ta: 'Tamil', te: 'Telugu', mr: 'Marathi',
};

// Default fallback for unknown countries
const DEFAULT_COUNTRY_INFO = {
  region: 'International',
  currency: 'US Dollar',
  currencyCode: 'USD',
  locale: 'en-US',
  language: 'English'
};

/**
 * Get country information from country code using country-locale-map
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code
 * @returns {Object} Country information with region, currency, currencyCode, locale, and language
 */
export function getCountryInfo(countryCode) {
  if (!countryCode) return DEFAULT_COUNTRY_INFO;

  const upperCode = countryCode.toUpperCase();
  const country = clm.getCountryByAlpha2(upperCode);

  if (!country) return DEFAULT_COUNTRY_INFO;

  // Get locale from package (format: "uk_UA") and convert to standard format ("uk-UA")
  const rawLocale = country.default_locale || `${country.languages?.[0] || 'en'}_${upperCode}`;
  const locale = rawLocale.replace('_', '-');

  // Extract language code from locale (e.g., "uk" from "uk_UA")
  const langCode = rawLocale.split('_')[0];
  // Get language name from mapping, fallback to code if not found
  const language = LANGUAGE_NAMES[langCode] || langCode;

  return {
    region: country.name,
    currency: country.currency_name || country.currency, // Human-readable currency name
    currencyCode: country.currency, // Currency code (e.g., "UAH")
    locale,
    language
  };
}

/**
 * Build car inspection prompt with provided data
 * @param {Object} carInfo - Car information { brand, model, year, mileage, description, country_code }
 * @param {string[]} imageDescriptions - Array of image descriptions
 * @returns {string} Formatted prompt
 */
export function buildCarInspectionPrompt(carInfo, imageDescriptions) {
  const ownerDescription = carInfo.description
    ? `Owner's description: ${carInfo.description}`
    : '';

  // Get country/region info for currency, locale and market context
  const countryInfo = getCountryInfo(carInfo.country_code);
  const regionContext = carInfo.country_code
    ? `This vehicle is located in ${countryInfo.region}. Provide all cost estimates in ${countryInfo.currency} (${countryInfo.currencyCode}) based on ${countryInfo.region} market prices. Write all text content in ${countryInfo.language}.`
    : '';

  return CAR_INSPECTION_PROMPT
    .replace('{{brand}}', carInfo.brand || 'Unknown')
    .replace('{{model}}', carInfo.model || 'Unknown')
    .replace('{{year}}', carInfo.year || 'unknown year')
    .replace('{{mileage}}', carInfo.mileage || 'unknown')
    .replace('{{imageDescriptions}}', imageDescriptions.join(", "))
    .replace('{{ownerDescription}}', ownerDescription)
    .replace('{{regionContext}}', regionContext)
    .replace(/\{\{currency\}\}/g, countryInfo.currency)
    .replace(/\{\{currencyCode\}\}/g, countryInfo.currencyCode)
    .replace(/\{\{region\}\}/g, countryInfo.region)
    .replace(/\{\{locale\}\}/g, countryInfo.locale)
    .replace(/\{\{language\}\}/g, countryInfo.language);
}
