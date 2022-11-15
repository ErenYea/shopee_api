const mongodb = require("mongodb");
const dotenv = require("dotenv");
const ProductsDAO = require("./dao/productsDAO.js");
const express = require("express");
const cors = require("cors");
const products = require("./api/products.route.js");

dotenv.config();

const MongoClient = mongodb.MongoClient;

const port = process.env.PORT || 8000;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/products", async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;

  const page = req.query.page ? parseInt(req.query.page, 10) : 0;

  let filters = {};
  if (req.query.dest) {
    filters.dest = req.query.dest;
  } else if (req.query.name) {
    filters.name = req.query.name;
  } else if (req.query.brand) {
    filters.brand = req.query.brand;
  }

  const { productsList, totalNumProducts } = await ProductsDAO.getProducts({
    filters,
    page,
    limit,
  });

  let response = {
    products: productsList,
    page: page,
    filters: filters,
    entries_per_page: limit,
    total_results: totalNumProducts,
  };
  res.json(response);
});

app.use("*", (req, res) => res.status(404).json({ error: "Not Found" }));

MongoClient.connect(process.env.RESTREVIEWS_DB_URI, {
  maxPoolSize: 50,
  wtimeoutMS: 2500,
  useNewUrlParser: true,
})
  .catch((err) => {
    console.error(err.stack);
    process.exit(1);
  })
  .then(async (client) => {
    await ProductsDAO.injectDB(client);

    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });

module.exports = app;
