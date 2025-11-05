const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const port = 3001;

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',       // ваш пароль
  database: 'Pr14'    // ваша БД
});

// Healthcheck
app.get('/', (_req, res) => res.send('API OK'));

const TABLE = 'users';

// GET список товаров
app.get('/products', (_req, res) => {
  db.query(`SELECT * FROM ${TABLE} ORDER BY id DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST создать товар
app.post('/products', (req, res) => {
  const { title, description, specs, image_url, price } = req.body;
  // Приведение типа для DECIMAL; пустые строки превращаем в NULL, если колонка допускает NULL
  const priceVal = (price === '' || price === null || typeof price === 'undefined')
    ? null
    : Number(price);

  db.query(
    `INSERT INTO ${TABLE} (title, description, specs, image_url, price) VALUES (?, ?, ?, ?, ?)`,
    [title, description, specs, image_url, priceVal],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      db.query(`SELECT * FROM ${TABLE} WHERE id=?`, [result.insertId], (e, r) => {
        if (e) return res.status(500).json({ error: e.message });
        res.status(201).json(r[0]);
      });
    }
  );
});

// PUT обновить товар
app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, specs, image_url, price } = req.body;
  const priceVal = (price === '' || price === null || typeof price === 'undefined')
    ? null
    : Number(price);

  db.query(
    `UPDATE ${TABLE} SET title=?, description=?, specs=?, image_url=?, price=? WHERE id=?`,
    [title, description, specs, image_url, priceVal, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      db.query(`SELECT * FROM ${TABLE} WHERE id=?`, [id], (e, r) => {
        if (e) return res.status(500).json({ error: e.message });
        if (!r.length) return res.status(404).json({ error: 'Not found' });
        res.json(r[0]);
      });
    }
  );
});

// DELETE удалить товар
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  db.query(`DELETE FROM ${TABLE} WHERE id=?`, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  });
});

app.listen(port, () => console.log(`API http://localhost:${port}`)); 
