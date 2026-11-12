import crypto from "crypto";
import nodemailer from "nodemailer";
import { VerificationCodeModel } from "./db";

// Expiration window for time-restricted verification codes (10 minutes)
export const CODE_EXPIRATION_MS = 10 * 60 * 1000;

// Configure SMTP transport dynamically (strips whitespace from app passwords if present)
function getTransporter() {
    const smtpHost = process.env.SMTP_HOST?.trim();
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, "") : undefined;

    if (smtpHost && smtpUser && smtpPass) {
        return nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });
    }
    return null;
}

export type VerificationType = "signup" | "profile_update" | "password_reset";

/**
 * Sends a 6-digit time-restricted verification code to the target email
 */
export async function sendVerificationEmail(email: string, code: string, type: VerificationType = "signup"): Promise<boolean> {
    const isReset = type === "password_reset";
    const subject = isReset
        ? `Your Brainscratch Password Reset Code: ${code}`
        : `Your Brainscratch Verification Code: ${code}`;
    const actionText = isReset
        ? "reset your account password"
        : "complete your email verification";

    const text = `Hello,\n\nYour 6-digit code to ${actionText} is: ${code}\n\nThis code is valid for 10 minutes.\n\nIf you did not request this, please ensure your account is secure.\n\n- The Brainscratch Team`;
    const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #6d28d9; margin-top: 0;">${isReset ? "Password Reset Request" : "Email Verification"}</h2>
            <p style="color: #334155; font-size: 14px; line-height: 1.5;">Please use the following time-restricted 6-digit code to ${actionText}:</p>
            <div style="margin: 24px 0; text-align: center;">
                <span style="display: inline-block; padding: 12px 24px; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #6d28d9; background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px;">
                    ${code}
                </span>
            </div>
            <p style="color: #64748b; font-size: 12px;">This code will expire in <strong>10 minutes</strong>. For your security, never share this code with anyone.</p>
        </div>
    `;

    const transporter = getTransporter();
    if (transporter) {
        try {
            await transporter.sendMail({
                from: process.env.SMTP_FROM || `"Brainscratch" <noreply@brainscratch.app>`,
                to: email,
                subject,
                text,
                html
            });
            return true;
        } catch (err) {
            console.error("Failed to send email via SMTP, falling back to console log:", err);
        }
    }

    // Development fallback: Log prominently to console
    console.log(`\n======================================================`);
    console.log(`[EMAIL VERIFICATION CODE] To: ${email}`);
    console.log(`[CODE] >>> ${code} <<< (Valid for 10 minutes)`);
    console.log(`======================================================\n`);
    return true;
}

/**
 * Generates and stores a cryptographically secure 6-digit time-restricted code
 */
export async function createVerificationCode(
    email: string,
    type: VerificationType = "signup"
): Promise<{ code: string; expiresAt: Date }> {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Generate secure 6-digit numeric code
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + CODE_EXPIRATION_MS);

    // Invalidate previous unused codes for this email and type
    await VerificationCodeModel.deleteMany({ email: normalizedEmail, type });

    // Store new active code
    await VerificationCodeModel.create({
        email: normalizedEmail,
        code,
        expiresAt,
        type
    });

    // Deliver the code
    await sendVerificationEmail(normalizedEmail, code, type);

    return { code, expiresAt };
}

/**
 * Validates a user-supplied code against stored time-restricted records
 */
export async function verifyTimeRestrictedCode(
    email: string,
    code: string,
    type: VerificationType = "signup"
): Promise<{ valid: boolean; reason?: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanCode = (code || "").trim();

    if (!cleanCode || cleanCode.length !== 6) {
        return { valid: false, reason: "Please enter a valid 6-digit verification code." };
    }

    const record = await VerificationCodeModel.findOne({
        email: normalizedEmail,
        code: cleanCode,
        type
    });

    if (!record) {
        return { valid: false, reason: "Invalid verification code. Please check your email or request a new one." };
    }

    if (new Date() > record.expiresAt) {
        await VerificationCodeModel.findByIdAndDelete(record._id);
        return { valid: false, reason: "Verification code has expired. Please request a new code." };
    }

    // Code is valid - remove so it cannot be reused
    await VerificationCodeModel.findByIdAndDelete(record._id);

    return { valid: true };
}
