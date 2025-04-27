const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = 3001;
const sqlite3 = require("sqlite3").verbose();
app.use(cors());
app.use(bodyParser.json());

// Database
const db = new sqlite3.Database("./database.db");

// creating a default table called task
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

/**
 *
 * Fetching all tasks
 */
app.get("/tasks", (req, res) => {
  const { sort_by } = req.query;
  let orderClause = "id DESC"; // default order

  if (sort_by)
    orderClause =
      sort_by === "pending"
        ? "completed ASC, id DESC"
        : "completed DESC, id DESC";

  db.all(`SELECT * FROM tasks ORDER BY ${orderClause}`, (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(rows);
  });
});

/**
 *
 * Creating new task
 */
app.post("/tasks", (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res
      .status(400)
      .json({ error: "Title and description are required." });
  }

  db.run(
    `INSERT INTO tasks (title, description) VALUES (?, ?)`,
    [title, description],
    function (err) {
      if (err) {
        console.error(err); // Good practice to log errors
        return res.status(500).json({ error: "Failed to create task." });
      }

      return res
        .status(201)
        .json({ message: "Created successfully!!!", id: this.lastID });
    }
  );
});

/**
 * Updating existing task
 *
 */

app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  db.run(
    `UPDATE tasks SET  completed = ? WHERE id = ?`,
    [true, id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      return res.status(200).json({ message: "Update successfully!!!" });
    }
  );
});

/**
 * Delete existing task
 *
 */
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM tasks WHERE id = ?`, [id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    return res.status(200).json({ message: "Delete successfully!!!" });
  });
});

// starting application in port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
