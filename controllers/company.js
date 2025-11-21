const companyModel = require("../models/companyModel");

const getCompanyBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const company = await companyModel.findOne({ slug });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllCompanies = async (req, res) => {
  try {
    const companies = await companyModel.find({});
    res.status(200).json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ API: Thêm 10 công ty mẫu
const seedCompanies = async (req, res) => {
  try {
    const companies = [
      {
        slug: "vng",
        name: "VNG Corporation",
        bio: "Công ty công nghệ hàng đầu Việt Nam với các sản phẩm nổi bật như Zalo, Zing, 123Pay.",
        website: "https://vng.com.vn",
        avatar: "/logos/vng-logo.png",
        coverPhoto: "/covers/vng-cover.jpg",
        skills: ["Công nghệ", "Phần mềm", "Game", "AI"],
        interests: ["Đổi mới sáng tạo", "Chuyển đổi số", "Startup"],
        socialLinks: [
          { platform: "Facebook", url: "https://www.facebook.com/vngcorp" },
          {
            platform: "LinkedIn",
            url: "https://www.linkedin.com/company/vng-corporation/",
          },
        ],
        email: "contact@vng.com.vn",
        seo: {
          title: "VNG Corporation | Công ty công nghệ hàng đầu Việt Nam",
          description: "Tập đoàn công nghệ Việt Nam hàng đầu.",
          keywords: ["VNG", "Công nghệ", "Zalo", "Zing"],
        },
      },
      {
        slug: "zalo",
        name: "Zalo",
        bio: "Nền tảng nhắn tin và mạng xã hội số 1 Việt Nam.",
        website: "https://zalo.me",
        avatar: "/logos/zalo-logo.png",
        coverPhoto: "/covers/zalo-cover.webp",
        skills: ["Chat", "Voice Call", "Video Call", "Social"],
        interests: ["Bảo mật", "Trải nghiệm người dùng", "Công nghệ di động"],
        socialLinks: [
          { platform: "Facebook", url: "https://www.facebook.com/Zaloapp" },
        ],
        email: "support@zalo.me",
      },
      {
        slug: "viettel",
        name: "Viettel Telecom",
        bio: "Tập đoàn viễn thông lớn nhất Việt Nam, tiên phong trong 5G và công nghệ quốc phòng.",
        website: "https://viettel.com.vn",
        avatar: "/logos/viettel-logo.jpg",
        coverPhoto: "/covers/viettel-cover.png",
        skills: ["Viễn thông", "5G", "AI", "IoT"],
        interests: ["Quốc phòng", "Đổi mới sáng tạo", "Kết nối toàn cầu"],
        email: "info@viettel.com.vn",
      },
      {
        slug: "vingroup",
        name: "Vingroup",
        bio: "Tập đoàn đa ngành lớn nhất Việt Nam, hoạt động trong công nghiệp, công nghệ và dịch vụ.",
        website: "https://vingroup.net",
        avatar: "/logos/vingroup-logo.png",
        coverPhoto: "/covers/vingroup-cover.webp",
        skills: ["Bất động sản", "Ô tô điện", "AI", "Sản xuất"],
        interests: ["Phát triển bền vững", "Toàn cầu hóa"],
        email: "contact@vingroup.net",
      },
      {
        slug: "vnpt",
        name: "VNPT",
        bio: "Tập đoàn Bưu chính Viễn thông Việt Nam - dẫn đầu về hạ tầng mạng và chuyển đổi số.",
        website: "https://vnpt.com.vn",
        avatar: "/logos/vnpt-logo.png",
        coverPhoto: "/covers/vnpt-cover.jpg",
        skills: ["Viễn thông", "Hạ tầng mạng", "Cloud", "AI"],
        interests: ["Chuyển đổi số", "Công nghệ 5G"],
        email: "info@vnpt.com.vn",
      },
      {
        slug: "mobifone",
        name: "Mobifone",
        bio: "Nhà mạng di động hàng đầu Việt Nam, cung cấp dịch vụ viễn thông và CNTT.",
        website: "https://mobifone.vn",
        avatar: "/logos/mobifone-logo.png",
        coverPhoto: "/covers/mobifone-cover.webp",
        skills: ["Viễn thông", "CNTT", "Mobile", "Dịch vụ số"],
        interests: ["Đổi mới", "Chuyển đổi số"],
        email: "contact@mobifone.vn",
      },
      {
        slug: "fpt",
        name: "FPT Corporation",
        bio: "Tập đoàn công nghệ hàng đầu Việt Nam trong lĩnh vực phần mềm, viễn thông và giáo dục.",
        website: "https://fpt.com.vn",
        avatar: "/logos/fpt-logo.png",
        coverPhoto: "/covers/fpt-cover.webp",
        skills: ["Phần mềm", "Cloud", "AI", "Giáo dục"],
        interests: ["Sáng tạo", "Công nghệ tương lai"],
        email: "contact@fpt.com.vn",
      },
      {
        slug: "tiki",
        name: "Tiki.vn",
        bio: "Nền tảng thương mại điện tử nội địa uy tín, cung cấp hàng triệu sản phẩm.",
        website: "https://tiki.vn",
        avatar: "/logos/tiki-logo.png",
        coverPhoto: "/covers/tiki-cover.webp",
        skills: ["E-commerce", "Logistics", "AI"],
        interests: ["Mua sắm", "Trải nghiệm khách hàng"],
        email: "support@tiki.vn",
      },
      {
        slug: "shopee",
        name: "Shopee Việt Nam",
        bio: "Nền tảng thương mại điện tử hàng đầu khu vực Đông Nam Á.",
        website: "https://shopee.vn",
        avatar: "/logos/shopee-logo.png",
        coverPhoto: "/covers/shopee-cover.jpg",
        skills: ["E-commerce", "Marketing", "AI"],
        interests: ["Thương mại số", "Khách hàng"],
        email: "support@shopee.vn",
      },
      {
        slug: "grab",
        name: "Grab Việt Nam",
        bio: "Nền tảng đa dịch vụ: đặt xe, giao đồ ăn, ví điện tử và tài chính.",
        website: "https://www.grab.com/vn/",
        avatar: "/logos/grab-logo.png",
        coverPhoto: "/covers/grab-cover.webp",
        skills: ["Giao thông", "Food Delivery", "Fintech"],
        interests: ["Tiện ích người dùng", "Đổi mới công nghệ"],
        email: "contact@grab.com",
      },
    ];

    // Xóa dữ liệu cũ trước khi seed lại (nếu muốn)
    await companyModel.deleteMany({});

    // Thêm mới
    const result = await companyModel.insertMany(companies);

    res.status(201).json({
      success: true,
      message: "Seeded 10 companies successfully!",
      count: result.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getCompanyBySlug,
  seedCompanies,
  getAllCompanies,
};
