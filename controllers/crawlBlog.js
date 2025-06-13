const puppeteer = require("puppeteer");

const crawlBlog = async (req, res) => {
  try {
    const { pageNumber } = req.query
    const url = pageNumber ? `https://techcrunch.com/latest/page/${pageNumber}` : "https://techcrunch.com/latest";

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.waitForSelector("body");

    const articles = await page.evaluate(() => {
        return Array.from(
          document.querySelectorAll("ul li"),
          (el) => ({
            time: el.querySelector("time")?.innerText || "",
            link_author: el.querySelector(".loop-card__author")?.href || "",
            author: el.querySelector(".loop-card__author")?.innerText || "",
            link_cat: el.querySelector(".loop-card__cat")?.href || "",
            category: el.querySelector(".loop-card__cat")?.innerText || "",
            title: el.querySelector("h3")?.innerText || "",
            link: el.querySelector(".loop-card__title > a")?.href || "",
            image: el.querySelector("img")?.src || "",
          })
        ).filter(
          (article) => article.title && article.link && article.image
        );
    });

    await browser.close();

    res.json({ success: true, articles });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error crawling the blog" });
  }
};

module.exports = {
  crawlBlog
};
