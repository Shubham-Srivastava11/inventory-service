const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();
const port = 3000;

app.use(bodyParser.json());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "test",
  database: "products",
  connectionLimit: 10,
});

// Create a new product in inventory
app.post("/create-product", (req, res) => {
  const { productName, productCategory, productDesc, productRating } = req.body;

  if (!productName || !productDesc) {
    return res
      .status(400)
      .json({ status: 400, message: "All fields are required." });
  }

  pool.query(
    `SELECT * FROM category WHERE categoryName = ?`,
    [productCategory],
    (err, result) => {
      if (result.length === 0) {
        pool.query(
          "INSERT INTO category (categoryName) VALUES (?)",
          [productCategory],
          (err, result1) => {
            if (err) {
              console.error("Error during category creation:", err);
              return res
                .status(500)
                .json({ status: 500, message: "Failed to create category." });
            }
            pool.query(
              "INSERT INTO productDetails ( productName, productDesc, productRating, categoryId) VALUES (?, ?, ?, ?)",
              [productName, productDesc, productRating, result1.insertId],
              (err, result) => {
                if (err) {
                  console.error("Error during product creation:", err);
                  return res
                    .status(500)
                    .json({ status: 500, message: "Failed to Add product." });
                }

                return res.status(201).json({
                  status: 201,
                  message: `Created a new product - ${productName}, successfully.`,
                });
              }
            );
          }
        );
      } else {
        if (err) {
          console.error("Error during fetching category", err);
          return res
            .status(500)
            .json({ status: 500, message: "Failed to fetch category." });
        }
        pool.query(
          "INSERT INTO productDetails ( productName, productDesc, productRating, categoryId) VALUES (?, ?, ?, ?)",
          [productName, productDesc, productRating, result[0].categoryId],
          (err, result) => {
            if (err) {
              console.error("Error during product creation:", err);
              return res
                .status(500)
                .json({ status: 500, message: "Failed to Add product." });
            }

            return res.status(201).json({
              status: 201,
              message: `Created a new product - ${productName}, successfully.`,
            });
          }
        );
      }
    }
  );
});

// Update details for an existing Product
app.put("/update-product/:id", (req, res) => {
  const { productName, categoryId, productDesc, productRating } = req.body;
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ status: 400, message: "Id is required." });
  }

  pool.query(
    "UPDATE productDetails SET productName = ?, productDesc = ?, productRating = ?, categoryId = ?  WHERE productId = ?",
    [productName, productDesc, productRating, categoryId, id],
    (err, result) => {
      if (err) {
        console.error("Error during update product details:", err);
        return res
          .status(500)
          .json({ status: 500, message: "Failed to update product." });
      }

      return res
        .status(200)
        .json({ status: 200, message: "Updated product successfully." });
    }
  );
});

// Get all listed products
app.get("/products", (req, res) => {
  pool.query(
    `select productdetails.productId, productName, category.categoryName, productDesc, productRating, stockQuantity 
    from productdetails 
    join category on productdetails.categoryId = category.categoryId
    left join inventory on inventory.productId = productdetails.productId`,
    (err, result) => {
      if (err) {
        console.error("Error fetching product details:", err);
        return res
          .status(500)
          .json({ status: 500, message: "Failed to fetch product details." });
      }

      if (result.length === 0) {
        return res
          .status(404)
          .json({ status: 404, message: `Products not found.` });
      }

      return res.status(200).json(result);
    }
  );
});

app.listen(port, () => {
  console.log(`Inventory Service listening at http://localhost:${port}`);
});
