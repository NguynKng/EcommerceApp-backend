const dotenv = require("dotenv")
dotenv.config()

module.exports = {
    PORT: process.env.PORT || 8000,
    MONGO_URI: process.env.MONGO_URI,
    SECRET_KEY: process.env.SECRET_KEY,
    NODE_ENV: process.env.NODE_ENV
}