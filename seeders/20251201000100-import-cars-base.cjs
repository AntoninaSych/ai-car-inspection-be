"use strict";

const axios = require("axios");

module.exports = {
    async up() {
        console.log("🚗 Fetching data from Cars-Base API...");

        // Load models (ESM)
        const { CarBrand, CarModel } = await import("../models/index.js");

        const response = await axios.get("https://api.cars-base.ru/full", {
            timeout: 300000,
        });

        const brands = response.data?.data;

        if (!Array.isArray(brands)) {
            console.error("❌ Invalid API format:", response.data);
            throw new Error("Cars-Base API did not return brand array");
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
