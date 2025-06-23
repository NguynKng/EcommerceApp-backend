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

module.exports = sendEmail;
