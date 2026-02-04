'use strict';

const fs = require("fs/promises");
const path = require("path");
const bcrypt = require("bcryptjs");

require("dotenv").config();
const host = process.env.HOST || "localhost";
const port = process.env.PORT || '';
const baseUrl = port ? `http://${host}:${port}` : `http://${host}`;

// Fixed IDs for seeding (unique IDs to prevent collision)
const TASK_ID = "00000000-0000-0000-0000-000000000001";
const REPORT_ID = "00000000-0000-0000-0000-000000000002";

// Exact report data from database
const REPORT_DATA = {
  "success": true,
  "analysis": {
    "locale": "uk-UA",
    "region": "Ukraine",
    "damages": [
      { "location": "Windshield", "severity": "severe", "description": "The windshield is severely cracked and shattered across a large portion of its surface.", "estimated_labor_cost": 200, "estimated_parts_cost_original": 1000, "estimated_parts_cost_alternative": 550 },
      { "location": "Front Bumper Lower Valance", "severity": "minor", "description": "Minor scuffs and scratches are visible on the lower front bumper valance.", "estimated_labor_cost": 75, "estimated_parts_cost_original": 200, "estimated_parts_cost_alternative": 100 },
      { "location": "Tailgate", "severity": "moderate", "description": "Minor denting and deformation are visible on the tailgate panel below the Toyota emblem. The 'TACOMA' lettering appears misaligned due to panel damage.", "estimated_labor_cost": 400, "estimated_parts_cost_original": 800, "estimated_parts_cost_alternative": 450 },
      { "location": "Right Rear Bed Side", "severity": "severe", "description": "Significant crush damage and deformation are present on the right rear bed side, extending towards the taillight area.", "estimated_labor_cost": 1500, "estimated_parts_cost_original": 2000, "estimated_parts_cost_alternative": 1000 },
      { "location": "Rear Bumper", "severity": "moderate", "description": "The right side of the rear bumper is damaged and dislodged, likely from the impact to the bed side. Visible shattered plastic pieces are on the bumper surface.", "estimated_labor_cost": 225, "estimated_parts_cost_original": 600, "estimated_parts_cost_alternative": 300 },
      { "location": "Right Rear Taillight", "severity": "moderate", "description": "The right rear taillight is damaged and pushed inwards due to the impact on the bed side.", "estimated_labor_cost": 75, "estimated_parts_cost_original": 300, "estimated_parts_cost_alternative": 175 },
      { "location": "Left Front Door", "severity": "moderate", "description": "A noticeable dent with a sharp crease is present on the lower section of the left front door.", "estimated_labor_cost": 600, "estimated_parts_cost_original": 1000, "estimated_parts_cost_alternative": 600 },
      { "location": "Left Rear Door", "severity": "moderate", "description": "A noticeable dent with a sharp crease is present on the lower section of the left rear door.", "estimated_labor_cost": 600, "estimated_parts_cost_original": 1000, "estimated_parts_cost_alternative": 600 },
      { "location": "Roof (Left Side)", "severity": "moderate", "description": "Visible creasing and deformation are present on the left side of the roof panel above the doors.", "estimated_labor_cost": 1200, "estimated_parts_cost_original": 1500, "estimated_parts_cost_alternative": 750 },
      { "location": "Left Rear Wheel/Tire", "severity": "minor", "description": "The left rear tire appears flat or significantly deflated. The wheel shows minor scuffing.", "estimated_labor_cost": 40, "estimated_parts_cost_original": 300, "estimated_parts_cost_alternative": 225 },
      { "location": "Bed Cover", "severity": "moderate", "description": "The roll-up bed cover is damaged, appearing wrinkled and possibly ripped.", "estimated_labor_cost": 75, "estimated_parts_cost_original": 1200, "estimated_parts_cost_alternative": 600 }
    ],
    "summary": "The Toyota Tacoma has sustained multiple areas of damage, including a severely shattered windshield, moderate to severe body damage on the left side (both doors and roof), and significant crush damage to the right rear bed side, tailgate, and rear bumper. Both rear tires are deflated, and the bed cover is damaged. A comprehensive body shop inspection is crucial to assess potential underlying structural damage.",
    "currency": "USD",
    "damage_detected": true,
    "recommendations": [
      "A full body shop assessment is recommended to evaluate the extent of structural damage, especially to the roof and right rear bed side.",
      "Repair or replace the severely damaged windshield for safety and legality.",
      "Address all body panel damage on the tailgate, bed side, and doors, including painting.",
      "Replace the damaged rear bumper and right rear taillight.",
      "Inspect and replace/repair both flat rear tires.",
      "Replace the damaged bed cover."
    ],
    "estimated_total_labor_cost": 5645,
    "estimated_total_parts_cost_original": 10200,
    "estimated_total_parts_cost_alternative": 5575
  },
  "timestamp": "2026-02-04T19:43:15.173Z",
  "model_used": "gemini-2.5-flash"
};

module.exports = {
  async up(queryInterface) {
    const dataPath = path.join(__dirname, "../db/source/user.json");
    const rawData = await fs.readFile(dataPath, "utf-8");
    const user = JSON.parse(rawData);

    const now = new Date();

    // 1. Insert user
    const hashedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      password: await bcrypt.hash(user.password, 10),
      avatarURL: `${baseUrl}/public/images/avatars/default.png`,
      token: user.token || null,
      language: user.language || null,
      currency: user.currency || null,
      agreeToPolicies: user.agreeToPolicies || false,
      emailVerified: user.emailVerified || false,
      createdAt: now,
      updatedAt: now,
    };

    await queryInterface.bulkInsert("users", [hashedUser]);

    // Get user ID for task ownership
    const userId = user.id;

    // 2. Get "completed" status ID
    const [statuses] = await queryInterface.sequelize.query(
      `SELECT id FROM task_statuses WHERE name = 'completed' LIMIT 1`
    );
    const completedStatusId = statuses[0]?.id;

    // 3. Get Toyota brand and Tacoma model (exact match from original task)
    const [brands] = await queryInterface.sequelize.query(
      `SELECT id FROM car_brands WHERE name = 'Toyota' LIMIT 1`
    );
    const brandId = brands[0]?.id;

    const [models] = await queryInterface.sequelize.query(
      `SELECT id FROM car_models WHERE name = 'Tacoma' AND brand_id = '${brandId}' LIMIT 1`
    );
    const modelId = models[0]?.id;

    // 4. Create task (exact copy from database)
    await queryInterface.bulkInsert("tasks", [{
      id: TASK_ID,
      owner_id: userId,
      brand_id: brandId,
      model_id: modelId,
      year: 2022,
      mileage: 85000,
      description: "Several damages",
      current_status_id: completedStatusId,
      is_paid: true,
      country_code: "ua",
      created_at: now,
      updated_at: now,
    }]);

    // 5. Get image types
    const [imageTypes] = await queryInterface.sequelize.query(
      `SELECT id, name FROM image_types`
    );
    const imageTypeMap = {};
    for (const it of imageTypes) {
      imageTypeMap[it.name] = it.id;
    }

    // 6. Copy images from db/source/images to uploads/tasks and create image records
    const sourceImagesDir = path.join(__dirname, "../db/source/images");
    const uploadsDir = path.join(__dirname, "../uploads/tasks");

    // Ensure uploads directory exists
    await fs.mkdir(uploadsDir, { recursive: true });

    const imageFiles = ["front.jpg", "back.jpg", "left.jpg", "right.jpg"];
    const imageRecords = [];

    for (const fileName of imageFiles) {
      const typeName = fileName.replace(".jpg", ""); // front, back, left, right
      const imageTypeId = imageTypeMap[typeName];

      if (!imageTypeId) continue;

      // Generate unique filename for uploads
      const uniqueFileName = `${Date.now()}-${Math.floor(Math.random() * 1000000000)}-${fileName}`;
      const sourcePath = path.join(sourceImagesDir, fileName);
      const destPath = path.join(uploadsDir, uniqueFileName);

      // Copy file
      await fs.copyFile(sourcePath, destPath);

      imageRecords.push({
        id: require("uuid").v4(),
        local_path: `uploads/tasks/${uniqueFileName}`,
        verified: true,
        task_id: TASK_ID,
        image_type_id: imageTypeId,
        created_at: now,
        updated_at: now,
      });
    }

    await queryInterface.bulkInsert("images", imageRecords);

    // 7. Create report attached to task (exact copy from database)
    await queryInterface.bulkInsert("reports", [{
      id: REPORT_ID,
      task_id: TASK_ID,
      data: JSON.stringify(REPORT_DATA),
      created_at: now,
    }]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("reports", { id: REPORT_ID }, {});
    await queryInterface.bulkDelete("images", { task_id: TASK_ID }, {});
    await queryInterface.bulkDelete("tasks", { id: TASK_ID }, {});
    await queryInterface.bulkDelete("users", null, {});
  },
};
