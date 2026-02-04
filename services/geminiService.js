import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";
import { buildCarInspectionPrompt } from "../prompts/carInspection.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * Convert image file to base64 and get mime type
 */
async function fileToGenerativePart(filePath) {
    try {
        const absolutePath = path.resolve(process.cwd(), filePath);

        console.log(`🔍 Reading file: ${absolutePath}`);

        await fs.access(absolutePath);

        const data = await fs.readFile(absolutePath);
        const ext = path.extname(absolutePath).toLowerCase();

        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.heic': 'image/heic',
            '.heif': 'image/heif'
        };

        const mimeType = mimeTypes[ext] || 'image/jpeg';

        console.log(`✅ File read successfully: ${path.basename(absolutePath)} (${mimeType})`);

        return {
            inlineData: {
                data: data.toString('base64'),
                mimeType: mimeType,
            },
        };
    } catch (error) {
        console.error(`❌ Error reading file ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Analyze car images using Gemini Vision API
 * @param {Object} images - Object containing image paths { front, back, left, right, issue }
 * @param {Object} carInfo - Car information { brand, model, year, mileage, description }
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeCarImages(images, carInfo) {
    try {
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

        // Prepare image parts
        const imageParts = [];
        const imageDescriptions = [];

        if (images.front) {
            imageParts.push(await fileToGenerativePart(images.front));
            imageDescriptions.push("Front view");
        }
        if (images.back) {
            imageParts.push(await fileToGenerativePart(images.back));
            imageDescriptions.push("Back view");
        }
        if (images.left) {
            imageParts.push(await fileToGenerativePart(images.left));
            imageDescriptions.push("Left side view");
        }
        if (images.right) {
            imageParts.push(await fileToGenerativePart(images.right));
            imageDescriptions.push("Right side view");
        }
        if (images.issue) {
            imageParts.push(await fileToGenerativePart(images.issue));
            imageDescriptions.push("Issue/Damage close-up");
        }

        // Build prompt from template
        const prompt = buildCarInspectionPrompt(carInfo, imageDescriptions);

        const result = await model.generateContent([...imageParts, prompt]);
        const response = await result.response;
        const text = response.text();

        // Try to parse JSON from response
        let analysisResult;
        try {
            // Remove markdown code blocks if present
            const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            analysisResult = JSON.parse(jsonText);
        } catch (parseError) {
            // If JSON parsing fails, return raw text
            analysisResult = {
                raw_response: text,
                error: "Failed to parse JSON response"
            };
        }

        return {
            success: true,
            analysis: analysisResult,
            model_used: GEMINI_MODEL,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error(`Gemini analysis failed: ${error.message}`);
    }
}

/**
 * Generate a simple text analysis for a car inspection
 * @param {Object} images - Object containing image paths
 * @param {Object} carInfo - Car information
 * @returns {Promise<Object>} Analysis result
 */
export async function generateSimpleAnalysis(images, carInfo) {
    try {
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

        const imageParts = [];
        for (const [, path] of Object.entries(images)) {
            if (path) {
                imageParts.push(await fileToGenerativePart(path));
            }
        }

        const prompt = buildSimpleAnalysisPrompt(carInfo);

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;

        return {
            success: true,
            summary: response.text(),
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error(`Gemini analysis failed: ${error.message}`);
    }
}
