"use strict";

const axios = require("axios");

module.exports = {
    async up() {
        console.log("🚗 Fetching data from Cars-Base API...");

        // import ESM models
        const {
            CarBrand,
            CarModel,
            CarGeneration,
            CarConfiguration,
            sequelize,
        } = await import("../models/index.js").then(m => m);

        const response = await axios.get("https://api.cars-base.ru/full", {
            timeout: 300000,
        });

        // ⭐ HERE → API returns { data: [...] }
        const brands = response.data?.data;

        if (!Array.isArray(brands)) {
            console.error("❌ API returned invalid format:", response.data);
            throw new Error("Cars-Base API did not return array in data.data");
        }

        console.log(`🔥 Import started... ${brands.length} brands found`);

        for (const brand of brands) {
            await CarBrand.findOrCreate({
                where: { id: brand.id },
                defaults: {
                    name: brand.name,
                    cyrillic_name: brand.cyrillic_name || null,
                    country: brand.country || null,
                    popular: brand.popular === 1,
                },
            });

            for (const model of brand.models || []) {
                await CarModel.findOrCreate({
                    where: { id: model.id },
                    defaults: {
                        brand_id: brand.id,
                        name: model.name,
                        cyrillic_name: model.cyrillic_name || null,
                        class: model.class || null,
                        year_from: model.year_from || null,
                        year_to: model.year_to || null,
                    },
                });

                if (model.generations) {
                    for (const gen of model.generations) {
                        await CarGeneration.findOrCreate({
                            where: { id: gen.id },
                            defaults: {
                                model_id: model.id,
                                name: gen.name,
                                year_start: gen.year_start || null,
                                year_stop: gen.year_stop || null,
                                is_restyle: gen.is_restyle === 1,
                            },
                        });

                        if (gen.configurations) {
                            for (const cfg of gen.configurations) {
                                await CarConfiguration.findOrCreate({
                                    where: { id: cfg.id },
                                    defaults: {
                                        generation_id: gen.id,
                                        doors_count: cfg.doors_count || null,
                                        body_type: cfg.body_type || null,
                                        notice: cfg.notice || null,
                                    },
                                });
                            }
                        }
                    }
                }
            }
        }

        console.log("✅ Import completed!");
    },

    async down() {
        // import models again
        const {
            CarBrand,
            CarModel,
            CarGeneration,
            CarConfiguration,
        } = await import("../models/index.js").then(m => m);

        console.log("🗑 Clearing imported data...");

        await CarConfiguration.destroy({ where: {} });
        await CarGeneration.destroy({ where: {} });
        await CarModel.destroy({ where: {} });
        await CarBrand.destroy({ where: {} });

        console.log("🧹 All car tables emptied");
    }
};
