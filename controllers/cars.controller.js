import { Op } from "sequelize";
import { CarBrand, CarModel } from "../models/index.js";

/**
 * Get list of brands with optional search
 */
export const getBrands = async (req, res) => {
    const search = req.query.search || "";

    try {
        const where = search
            ? { name: { [Op.iLike]: `%${search}%` } }
            : {};

        const brands = await CarBrand.findAll({
            where,
            order: [["name", "ASC"]],
            limit: 100,
        });

        res.json({ brands });
    } catch (err) {
        console.error("🔥 Brand search error:", err);
        res.status(500).json({ message: "Failed to load brands" });
    }
};

/**
 * Get models belonging to a brand
 */
export const getModelsByBrand = async (req, res) => {
    const brandId = req.params.brandId;

    try {
        const models = await CarModel.findAll({
            where: { brand_id: brandId },
            order: [["name", "ASC"]],
        });

        if (!models.length) {
            return res.status(404).json({
                message: `Models for brand '${brandId}' not found`,
            });
        }

        res.json({ models });
    } catch (err) {
        console.error("🔥 Model fetch error:", err);
        res.status(500).json({ message: "Failed to load models" });
    }
};
