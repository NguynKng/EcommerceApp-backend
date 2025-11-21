const router = require("express").Router();

const { getCompanyBySlug, seedCompanies, getAllCompanies } = require("../controllers/company");

router.get("/get-company-by-slug/:slug", getCompanyBySlug);
router.post("/seed-companies", seedCompanies);
router.get("/", getAllCompanies);

module.exports = router;
