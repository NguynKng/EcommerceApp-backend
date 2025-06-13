const axios = require("axios");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const FormData = require("form-data");

// Define URL
const url = "https://www.thegioididong.com/laptop";

// Set the folder where images will be saved
const IMAGE_FOLDER = "C:\\Users\\ADMIN\\Downloads\\Picture\\product";

// Ensure the directory exists
if (!fs.existsSync(IMAGE_FOLDER)) {
    fs.mkdirSync(IMAGE_FOLDER, { recursive: true });
}

const convertPriceToUSD = (priceVND) => {
    if (!priceVND) return "0.00";

    const vndToUsdRate = 25000; // Assume 1 USD = 25,000 VND

    // Remove "đ" and thousands separator "."
    const numericPrice = priceVND.replace(/[^\d]/g, ""); // Keep only numbers
    const priceInVND = parseInt(numericPrice, 10); // Convert to integer

    if (isNaN(priceInVND) || priceInVND <= 0) return "0.00";

    // Convert to USD and format with two decimal places
    return (priceInVND / vndToUsdRate).toFixed(2);
};

const downloadImage = async (url, filename) => {
    try {
        const filePath = path.join(IMAGE_FOLDER, filename);
        const response = await axios({ url, responseType: "stream" });

        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);
            writer.on("finish", () => resolve(filePath));
            writer.on("error", reject);
        });
    } catch (error) {
        console.error(`❌ Failed to download image: ${url}`, error.message);
        return null;
    }
};

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    console.log("Navigating to:", url);
    await page.goto(url, { waitUntil: "load" });

    console.log("Page loaded successfully!");

    // Wait for elements before clicking
    // try {
    //     await page.waitForSelector(".main-menu .active a", { visible: true, timeout: 5000 });
    //     await page.click(".main-menu .active a");
    //     console.log("Clicked on category!");

    // } catch (error) {
    //     console.log("⚠️ Category not found or clickable:", error.message);
    // }

    // Wait for product list to load
    await page.waitForSelector(".listproduct", { visible: true });

    const totalProduct = await page.evaluate(() => {
        const element = document.querySelector(".sort-total");
        return element ? parseInt(element.textContent.trim().split(" ")[0]) : 0;
    });

    console.log(`Total products: ${totalProduct}`)
    const clickCount = Math.ceil(totalProduct / 20) - 1;
    console.log(`Clicking 'View More' ${clickCount} times...`);
    // Click "View More" to load more products (if applicable)
    for (let i = 0; i < clickCount; i++) {
        try {
            await page.waitForSelector(".view-more > a", { timeout: 5000 });
            await page.click(".view-more > a");
            console.log(`Clicked 'View More' (${i + 1}/${clickCount})`);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for new products to load
        } catch (error) {
            console.log("No 'View More' button found or all products loaded.");
            break;
        }
    }
    console.log("All products loaded.");

    const products = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".item > a"))
            .map(item => {
                const name = item.querySelector("h3")?.childNodes[0]?.textContent?.trim().replace(/\//g, "-") || null;
                const price = item.querySelector(".price")?.textContent?.trim() || null;
                const img = item.querySelector(".item-img > img")?.getAttribute("src") || null;
                const slug = name ? name.toLowerCase().replace(/\s+/g, "-") : null;

                return { name, price, img, slug };
            })
            .filter(product => product.img); // Chỉ bỏ qua nếu thiếu hình ảnh, không phải tên
    });

    console.log(`Extracted ${products.length} products`);

    // Loop through products to find the first one with valid data
    for (let product of products) {
        // Nếu 3 trường chính (name, img, price) bị thiếu, bỏ qua sản phẩm này
        if (!product.name || !product.img || !product.price) {
            console.log(`⚠️ Skipping product: ${JSON.stringify(product)}`);
            continue;
        }

        console.log(`✅ Processing product: ${product.name}`);

        try {
            const priceInUSD = convertPriceToUSD(product.price);

            // Step 1: Download the image to the specified folder
            const imagePath = await downloadImage(product.img, `${product.slug}.jpg`);
            if (!imagePath) {
                console.log("❌ Failed to download image. Skipping.");
                continue;
            }
            console.log(`📸 Downloaded image: ${imagePath}`);

            // Step 2: Prepare form data for API
            const formData = new FormData();
            formData.append("name", product.name); // Default name if null
            formData.append("price", parseFloat(priceInUSD)); // Ensure number format
            formData.append("slug", product.slug); // Default slug
            formData.append("description", "No description available");
            formData.append("category", "Mobile");
            formData.append("quantity", 10);
            formData.append("brand", product.name ? product.name.split(" ")[0] : "Unknown"); // Default brand
            formData.append("discount", 0);

            formData.append("images", fs.createReadStream(imagePath));

            // Step 3: Send the request to your API
            const response = await axios.post("http://localhost:8000/api/v1/product/add", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const { data } = response;
            if (!data.success) {
                console.log(`❌ Failed to add product to database: ${product.name} - ${data.message}`);
                continue;
            } else {
                console.log(`🎉 Successfully added: ${product.name}`);
            }
            console.log("Done");
            //break;
        } catch (err) {
            console.error(`❌ Failed to add: ${product.name} - ${err.response?.data?.message || err.message}`);
        }
    }
    await browser.close();
})();