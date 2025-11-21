const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail", // or use "hotmail", "yahoo", etc. Or set up a custom SMTP
      auth: {
        user: process.env.EMAIL_USER, // your email address
        pass: process.env.EMAIL_PASS, // your email app password (or real password, not recommended)
      },
    });

    const mailOptions = {
      from: `"NguynKng Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html, // Use HTML for better formatting
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw new Error("Email sending failed");
  }
};

const sendVerificationEmail = async (email, code, username, action) => {
  let html = "";
  let subject = "";

  // Default user name fallback
  const displayName = username;

  const baseWrapper = (title, icon, message) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border-radius: 12px; background: #ffffff; border: 1px solid #ddd;">
      <h2 style="color: #333; text-align: center;">${icon} ${title}</h2>
      <p style="font-size: 16px; color: #555;">
        Hi <strong>${displayName}</strong>,
        <br/>
        ${message}
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <span style="display: inline-block; background: #007bff; color: white; font-size: 24px; font-weight: bold; padding: 12px 24px; border-radius: 8px;">
          ${code}
        </span>
      </div>
      <p style="font-size: 14px; color: #777;">
        This code will expire in 1 minutes. If you didn't request this, please ignore this email.
      </p>
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #aaa; text-align: center;">
        Thanks,<br/>
        MyShop Team
      </p>
    </div>
  `;

  if (action === "resetPassword") {
    subject = "🔐 Your Password Reset Code";
    html = baseWrapper(
      "Reset Your Password",
      "🔐",
      "You requested to reset your password. Use the verification code below:"
    );
  } else if (action === "verifyAccount") {
    subject = "✅ Verify Your Account";
    html = baseWrapper(
      "Verify Your Account",
      "✅",
      "Thank you for signing up! Please verify your account using the code below:"
    );
  } else {
    throw new Error("Invalid action for email verification");
  }

  return sendEmail({
    to: email,
    subject,
    html,
  });
};

module.exports = sendVerificationEmail;
