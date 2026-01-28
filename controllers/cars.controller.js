import { Op } from "sequelize";
import { CarBrand, CarModel } from "../models/index.js";
import ErrorCodes from "../helpers/errorCodes.js";

/**
 * Get list of brands with optional search query
 */
export const getBrands = async (req, res) => {
    const search = req.query.search || "";

    try {
        const where = {};

        // Search by name, cyrillic_name or code (API original ID)
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { cyrillic_name: { [Op.iLike]: `%${search}%` } },
                { code: { [Op.iLike]: `%${search}%` } },
            ];
        }

        const brands = await CarBrand.findAll({
            where,
            order: [["name", "ASC"]],
            limit: 1000,
            attributes: [
                "id",
                "code",
                "name",
                "cyrillic_name",
                "country",
                "numeric_id",
                "year_from",
                "year_to",
                "popular",
            ],
        });

        return res.json({
            success: true,
            count: brands.length,
            brands,
        });
    } catch (err) {
        console.error("🔥 Brand search error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to load brands",
            internalCode: ErrorCodes.SERVER_DATABASE_ERROR,
        });
    }
};

/**
 * Get models by brand UUID or code
 */
export const getModelsByBrand = async (req, res) => {
    const brandId = req.params.brandId;

    if (!brandId) {
        return res.status(400).json({
            success: false,
            message: "Brand ID is required",
            internalCode: ErrorCodes.VALIDATION_REQUIRED_FIELD,
        });
    }

    try {
        // First find brand by UUID or by code
        const brand =
            (await CarBrand.findByPk(brandId)) ||
            (await CarBrand.findOne({ where: { code: brandId } }));

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: "Brand not found",
                internalCode: ErrorCodes.RESOURCE_BRAND_NOT_FOUND,
            });
        }

        const models = await CarModel.findAll({
            where: { brand_id: brand.id }, // UUID FK
            order: [["name", "ASC"]],
            attributes: [
                "id",
                "code",
                "name",
                "cyrillic_name",
                "class",
                "year_from",
                "year_to",
            ],
        });

        return res.json({
            success: true,
            brand: {
                id: brand.id,
                code: brand.code,
                name: brand.name,
                cyrillic_name: brand.cyrillic_name,
            },
            count: models.length,
            models,
        });
    } catch (err) {
        console.error("🔥 Model fetch error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to load models",
            internalCode: ErrorCodes.SERVER_DATABASE_ERROR,
        });
    }
};
