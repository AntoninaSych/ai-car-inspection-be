import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Read logo as base64
const logoBase64 = fs.readFileSync(path.join(__dirname, "../public/logo_base64.txt"), "utf-8").trim();
const logoDataUri = `data:image/png;base64,${logoBase64}`;

/**
 * Generate a styled email template (HTML)
 * @param {Object} options - Template options
 * @param {string} options.title - Email title/greeting
 * @param {string} options.content - Main content HTML
 * @param {string} [options.buttonText] - Button text (optional)
 * @param {string} [options.buttonUrl] - Button URL (optional)
 * @param {string} [options.buttonColor] - Button color (default: #059669)
 * @returns {string} Complete HTML email
 */
const generateEmailTemplate = ({ title, content, buttonText, buttonUrl, buttonColor = "#059669" }) => {
    const buttonHtml = buttonText && buttonUrl ? `
            <p style="text-align: center;">
                <a href="${buttonUrl}" class="button" style="display: inline-block; background: ${buttonColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px;">
                    ${buttonText}
                </a>
            </p>` : "";

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; border: 1px solid #e5e7eb; border-bottom: none; }
        .logo { display: flex; align-items: center; justify-content: center; gap: 10px; }
        .logo img { width: 48px; height: 48px; }
        .logo-text { text-align: left; }
        .logo-text h1 { margin: 0; font-size: 24px; color: #1a1a1a; }
        .logo-text h1 span { color: #2563eb; }
        .logo-text p { margin: 0; font-size: 14px; color: #6b7280; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <table role="presentation" style="margin: 0 auto;">
                <tr>
                    <td style="padding-right: 12px;">
                        <img src="${logoDataUri}" alt="Car RepAIr Logo" width="48" style="display: block;">
                    </td>
                    <td style="text-align: left;">
                        <div style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin: 0;">Car Rep<span style="color: #2563eb;">AI</span>r</div>
                        <div style="font-size: 14px; color: #6b7280; margin: 0;">Estimator</div>
                    </td>
                </tr>
            </table>
        </div>
        <div class="content">
            <h2>${title}</h2>
            ${content}
            ${buttonHtml}
        </div>
        <div class="footer">
            <p>This email was sent by Car RepAIr - AI-powered car inspection service.</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
`;
};

/**
 * Generate a plain text email template
 * @param {Object} options - Template options
 * @param {string} options.greeting - Email greeting line
 * @param {string} options.content - Main content text
 * @param {string} [options.linkText] - Link description (optional)
 * @param {string} [options.linkUrl] - Link URL (optional)
 * @returns {string} Complete plain text email
 */
const generateTextTemplate = ({ greeting, content, linkText, linkUrl }) => {
    const linkSection = linkText && linkUrl ? `${linkText}: ${linkUrl}\n` : "";
    return `${greeting}

${content}
${linkSection}
---
Car RepAIr - AI-powered car inspection service
`;
};

// Create reusable transporter
const createTransporter = () => {
    if (!SMTP_USER || !SMTP_PASS) {
        console.warn("[📧 Email] SMTP credentials not configured, emails will be logged only");
        return null;
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
};

const transporter = createTransporter();

/**
 * Send email notification when report is ready
 * @param {string} toEmail - Recipient email address
 * @param {string} userName - User's name
 * @param {string} reportId - Report ID
 */
export const sendReportReadyEmail = async (toEmail, userName, reportId) => {
    const reportUrl = `${FRONTEND_URL}/reports/${reportId}`;
    const subject = "🚗 Your Car Inspection Report is Ready!";

    const htmlContent = generateEmailTemplate({
        title: `Hello${userName ? `, ${userName}` : ""}!`,
        content: `
            <p>Great news! Your car inspection report is now ready.</p>
            <p>Our AI has analyzed your vehicle images and prepared a detailed damage assessment with repair cost estimates.</p>`,
        buttonText: "View Report",
        buttonUrl: reportUrl,
        buttonColor: "#059669",
    });

    const textContent = generateTextTemplate({
        greeting: `Hello${userName ? `, ${userName}` : ""}!`,
        content: "Great news! Your car inspection report is now ready.\n\nOur AI has analyzed your vehicle images and prepared a detailed damage assessment with repair cost estimates.",
        linkText: "View your report",
        linkUrl: reportUrl,
    });

    const mailOptions = {
        from: SMTP_FROM,
        to: toEmail,
        subject,
        text: textContent,
        html: htmlContent,
    };

    if (!transporter) {
        console.log("📧 Would send email (SMTP not configured):");
        console.log(`  To: ${toEmail}`);
        console.log(`  Subject: ${subject}`);
        console.log(`  Report URL: ${reportUrl}`);
        return { messageId: "mock-" + Date.now(), mock: true };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Sent to ${toEmail}, messageId: ${info.messageId}`);
    return info;
};

/**
 * Verify SMTP connection
 */
export const verifyEmailConnection = async () => {
    if (!transporter) {
        console.log("📧❌ SMTP not configured, skipping verification");
        return false;
    }

    try {
        await transporter.verify();
        console.log("📧 SMTP connection verified");
        return true;
    } catch (error) {
        console.error("📧❌ SMTP verification failed:", error.message);
        return false;
    }
};

/**
 * Send password reset email
 * @param {string} toEmail - Recipient email address
 * @param {string} resetLink - Password reset link
 */
export const sendPasswordResetEmail = async (toEmail, resetLink) => {
    const subject = "🔐 Reset Your Password";

    const htmlContent = generateEmailTemplate({
        title: "Hello!",
        content: `
            <p>You requested a password reset for your Car RepAIr account.</p>
            <p>Click the button below to set a new password. This link is valid for 30 minutes.</p>
            <p style="color: #6b7280; font-size: 14px;">If you did not request this, you can safely ignore this email.</p>`,
        buttonText: "Reset Password",
        buttonUrl: resetLink,
        buttonColor: "#2563eb",
    });

    const textContent = generateTextTemplate({
        greeting: "Hello!",
        content: "You requested a password reset for your Car RepAIr account.\n\nClick the link below to set a new password. This link is valid for 30 minutes.\n\nIf you did not request this, you can safely ignore this email.",
        linkText: "Reset your password",
        linkUrl: resetLink,
    });

    const mailOptions = {
        from: SMTP_FROM,
        to: toEmail,
        subject,
        text: textContent,
        html: htmlContent,
    };

    if (!transporter) {
        console.log("📧 Would send password reset email (SMTP not configured):");
        console.log(`  To: ${toEmail}`);
        console.log(`  Subject: ${subject}`);
        console.log(`  Reset link: ${resetLink}`);
        return { messageId: "mock-" + Date.now(), mock: true };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Password reset email sent to ${toEmail}, messageId: ${info.messageId}`);
    return info;
};
