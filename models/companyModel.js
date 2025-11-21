const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    // 👇 Mã định danh duy nhất cho company (dùng trong subdomain hoặc URL)
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // ví dụ: "vng", "zalo", "viettel"
      trim: true,
    },

    // 👇 Tên đầy đủ hiển thị
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // 👇 Mô tả ngắn (dùng cho SEO & metadata)
    bio: {
      type: String,
      default: "",
    },

    // 👇 Trang web chính thức
    website: {
      type: String,
      default: "",
    },

    // 👇 Ảnh đại diện & ảnh bìa (đường dẫn hoặc URL)
    avatar: {
      type: String,
      default: "",
    },
    coverPhoto: {
      type: String,
      default: "",
    },

    // 👇 Lĩnh vực hoạt động (ví dụ: ["AI", "Game", "Công nghệ"])
    skills: {
      type: [String],
      default: [],
    },

    // 👇 Mối quan tâm / định hướng
    interests: {
      type: [String],
      default: [],
    },

    // 👇 Liên kết mạng xã hội
    socialLinks: [
      {
        platform: { type: String }, // "Facebook", "LinkedIn", "Twitter"
        url: { type: String },
      },
    ],

    // 👇 Email liên hệ
    email: {
      type: String,
      default: "",
    },

    // 👇 SEO metadata
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: { type: [String], default: [] },
    },

    // 👇 Cấu hình riêng (nếu mỗi công ty có theme riêng)
    theme: {
      primaryColor: { type: String, default: "#4f46e5" },
      darkMode: { type: Boolean, default: false },
      logoPosition: { type: String, enum: ["left", "center"], default: "center" },
    },

    // 👇 Trạng thái hoạt động
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
