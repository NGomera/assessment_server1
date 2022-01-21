const express = require("express");
const cors = require("cors");
const pool = require("./db");
const uuid = require("uuid");

const app = express();
const PORT = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors());

//route

//POST
app.post("/add", async (req, res) => {
  try {
    const {
      date,
      customer,
      type,
      address,
      fooditem,
      quantity,
      price,
      totalamount,
    } = req.body;

    const addOrder = await pool.query(
      "INSERT INTO foods(order_id, order_date, order_customer, order_type, order_address, order_food_item, order_quantity, order_price, order_total_amount, order_status) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending') RETURNING *",
      [
        uuid.v4(),
        date,
        customer,
        type,
        address,
        fooditem,
        quantity,
        price,
        totalamount,
      ]
    );
    res.json(addOrder.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

//PUT
app.put("/edit", async (req, res) => {
  try {
    const { id, status } = req.body;

    const updateStatus = await pool.query(
      "UPDATE foods SET order_status = $1 WHERE order_id = $2 RETURNING *",
      [status, id]
    );

    res.json(updateStatus.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const checkUser = await pool.query(
      "SELECT * FROM users WHERE user_username = $1",
      [username]
    );

    if (checkUser.rows.length === 0) {
      return res.status(403).json("Username does not exist");
    } else {
      if (password === checkUser.rows[0].user_password) {
        res.json("login Successfully!!");
      } else {
        return res.status(403).json("Password is incorrect");
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

//GET
app.get("/read", async (req, res) => {
  try {
    const orders = await pool.query("SELECT * FROM foods");
    res.json(orders.rows);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

//GET
app.get("/readitem", async (req, res) => {
  try {
    const item = await pool.query("SELECT * FROM menu");
    res.json(item.rows);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

app.listen(PORT, () => {
  console.log("server is running on port 5000");
});
