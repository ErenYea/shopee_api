const express = require("express");
const ProductsController = require("./products.controller.js");

const router = express.Router();

router.route("/").get(ProductsController.apiGetProducts);

module.exports = router;
