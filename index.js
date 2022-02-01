const express = require("express");
const cors = require("cors");
const pool = require("./db");
const uuid = require("uuid");
const jwtGenerator = require("./utils/jwtGenerator");
const authorization = require("./middleware/authorization");

const app = express();
const PORT = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors());

//route

//POST
app.post("/add", authorization, async (req, res) => {
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
      id,
    } = req.body;

    const addOrder = await pool.query(
      "INSERT INTO foods(order_id, order_date, order_customer, order_type, order_address, order_food_item, order_quantity, order_price, order_total_amount, order_status, order_customer_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10) RETURNING *",
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
        id,
      ]
    );
    res.json(addOrder.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

//PUT
app.put("/edit", authorization, async (req, res) => {
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

//GET
app.get("/read", authorization, async (req, res) => {
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

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await pool.query(
      "SELECT * FROM users WHERE user_username = $1",
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(403).json("Username is does not exist");
    } else if (username === "admin") {
      if (password === "adminpass") {
        const token = jwtGenerator("admin");
        res.json({ token });
      } else {
        return res.status(403).json("Password is incorrect");
      }
    } else {
      if (password !== user.rows[0].user_password) {
        return res.status(403).json("Password is incorrect");
      }

      const token = jwtGenerator(user.rows[0].user_id);
      res.json({ token });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { fname, lname, address, username, password } = req.body;

    const check_user = await pool.query(
      "SELECT * FROM users WHERE user_username = $1",
      [username]
    );

    if (check_user.rows.length !== 0) {
      return res.status(403).json("Username already exists");
    } else {
      const create_user = await pool.query(
        `INSERT INTO users(user_id, user_username, user_password, user_fname, user_lname, user_address) 
             VALUES ($1,$2,$3,$4, $5, $6) RETURNING *`,
        [uuid.v4(), username, password, fname, lname, address]
      );

      res.json(create_user.rows[0]);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/user", authorization, async (req, res) => {
  try {
    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      req.user,
    ]);
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

app.get("/is-verify", authorization, async (req, res) => {
  try {
    if (req.user === "admin") res.json({ auth: true, isAdmin: true });
    else res.json({ auth: true, isAdmin: false });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

app.listen(PORT, () => {
  console.log("server is running on port 5000");
});
