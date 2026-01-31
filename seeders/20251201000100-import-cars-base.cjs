"use strict";

const fs = require("fs");
const path = require("path");

module.exports = {
    async up() {
        console.log("🚗 Loading car data from local JSON...");

        // Load models (ESM)
        const { CarBrand, CarModel } = await import("../models/index.js");

        const jsonPath = path.resolve(__dirname, "../db/source/cars.json");
        const fileContent = fs.readFileSync(jsonPath, "utf-8");
        const jsonData = JSON.parse(fileContent);

        const brands = jsonData?.data;

        if (!Array.isArray(brands)) {
            console.error("❌ Invalid JSON format:", jsonData);
            throw new Error("cars.json did not contain brand array");
        }

        console.log(`🔥 Import started: ${brands.length} brands found`);

        for (const brand of brands) {
            const [brandRecord] = await CarBrand.findOrCreate({
                where: { code: brand.id },

                defaults: {
                    code: brand.id,
                    name: brand.name,
                    cyrillic_name: brand.cyrillic_name,
                    country: brand.country,
                    numeric_id: brand.numeric_id,
                    year_from: brand.year_from,
                    year_to: brand.year_to,
                    popular: brand.popular === 1,
                },
            });

            for (const model of brand.models || []) {
                await CarModel.findOrCreate({
                    where: { code: model.id },

                    defaults: {
                        code: model.id,
                        brand_id: brandRecord.id, // UUID link
                        name: model.name,
                        cyrillic_name: model.cyrillic_name,
                        class: model.class,
                        year_from: model.year_from,
                        year_to: model.year_to,
                    },
                });
            }
        }

        console.log("✅ Import completed!");
    },

    async down() {
        const { CarBrand, CarModel } = await import("../models/index.js");

        console.log("🗑 Clearing imported car data...");

        await CarModel.destroy({ where: {} });
        await CarBrand.destroy({ where: {} });

        console.log("🧹 Car tables cleaned");
    },
};
