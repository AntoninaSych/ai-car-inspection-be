/**
 * Prompt templates for car inspection analysis
 */

export const CAR_INSPECTION_PROMPT = `
You are an expert car inspector. Analyze the provided images of a {{brand}} {{model}} ({{year}}) with {{mileage}} km mileage.
Rules (must follow):
- Describe only damage clearly visible in the images.
- Do not assume hidden, internal, mechanical, or not-visible damage.
- If damage cannot be confirmed, use "severity": "unknown".
- No phrases like “likely”, “probable”, or assumptions for detected damage.
- Costs should be based only on confirmed visible damage.
- Output valid JSON only, no extra text.

Images descriptions: {{imageDescriptions}}
Owner description: {{ownerDescription}}

JSON structure:
{
  "damage_detected": true,
  "damages": [
    {
      "location": "front bumper/door/etc",
      "severity": "minor/moderate/severe/unknown",
      "description": "detailed description",
      "estimated_parts_cost_original": "approximate cost for OEM parts only",
      "estimated_parts_cost_alternative": "approximate cost for aftermarket parts only",
      "estimated_labor_cost": "approximate labor/repair work cost"
    }
  ],
  "recommendations": [
    "recommendation 1",
    "recommendation 2"
  ],
  "estimated_total_parts_cost_original": "total OEM parts cost",
  "estimated_total_parts_cost_alternative": "total aftermarket parts cost",
  "estimated_total_labor_cost": "total labor cost",
  "summary": "brief summary of the inspection"
}`;

/**
 * Build car inspection prompt with provided data
 * @param {Object} carInfo - Car information { brand, model, year, mileage, description }
 * @param {string[]} imageDescriptions - Array of image descriptions
 * @returns {string} Formatted prompt
 */
export function buildCarInspectionPrompt(carInfo, imageDescriptions) {
    const ownerDescription = carInfo.description
        ? `Owner's description: ${carInfo.description}`
        : '';

    return CAR_INSPECTION_PROMPT
        .replace('{{brand}}', carInfo.brand || 'Unknown')
        .replace('{{model}}', carInfo.model || 'Unknown')
        .replace('{{year}}', carInfo.year || 'unknown year')
        .replace('{{mileage}}', carInfo.mileage || 'unknown')
        .replace('{{imageDescriptions}}', imageDescriptions.join(", "))
        .replace('{{ownerDescription}}', ownerDescription);
}
