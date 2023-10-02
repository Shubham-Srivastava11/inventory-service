const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const { CONFIG } = require("./config");

const app = express();
const port = 3000;

app.use(bodyParser.json());

const pool = mysql.createPool({
  // host: CONFIG.host,
  // user: CONFIG.user,
  // password: CONFIG.password,
  // database: CONFIG.database,
  host: "localhost",
  user: "root",
  password: "test",
  database: "products",
  connectionLimit: 10,
});

// Create a new product in inventory
app.post("/create-product", (req, res) => {
  console.log(req);
  const { productName, productCategory, productDesc, productRating } = req.body;

  if (!productName || !productDesc) {
    return res.status(400).json({ error: "All fields are required." });
  }

  pool.query(
    "INSERT INTO productDetails ( productName, productCategory, productDesc, productRating) VALUES (?, ?, ?, ?)",
    [productName, productCategory, productDesc, productRating],
    (err, result) => {
      if (err) {
        console.error("Error during registration:", err);
        return res.status(500).json({ error: "Failed to register user." });
      }

      return res.status(201).json({
        message: `Created a new product - ${productName}, successfully.`,
      });
    }
  );
});

// Update details for an existing Product
app.put("/update-product/:id", (req, res) => {
  const { productName, productCategory, productDesc, productRating } = req.body;
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  pool.query(
    "UPDATE productDetails SET productName = ?, productCategory = ?, productDesc = ?, productRating = ?  WHERE productId = ?",
    [productName, productCategory, productDesc, productRating, id],
    (err, result) => {
      if (err) {
        console.error("Error during login:", err);
        return res.status(500).json({ error: "Failed to authenticate user." });
      }

      if (result.length === 0) {
        return res.status(401).json({ error: "Invalid credentials." });
      }

      return res.status(200).json({ message: "Updated product successfully." });
    }
  );
});

// Get all listed products
app.get("/products", (req, res) => {
  pool.query("SELECT * FROM productDetails", (err, result) => {
    if (err) {
      console.error("Error fetching product details:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch product details." });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: `Products not found.` });
    }

    return res.status(200).json(result);
  });
});

app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});
