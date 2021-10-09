const express = require('express');
const router = express.Router();


const { hello } = require("../controllers/hello");

router.route("/").get(hello);

module.exports = router;