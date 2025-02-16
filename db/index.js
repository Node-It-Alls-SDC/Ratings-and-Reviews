// TODO: Move this import?
require('dotenv').config()
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
}).promise();

const initializeDB = async () => {
  try {
    // Reviews Table
    await pool.query(`CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      rating TINYINT NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      summary VARCHAR(255) NOT NULL,
      body VARCHAR(1000) NOT NULL,
      recommend BOOLEAN NOT NULL,
      reported BOOLEAN DEFAULT FALSE,
      reviewer_name VARCHAR(255) NOT NULL,
      reviewer_email VARCHAR(255) NOT NULL,
      response VARCHAR(1000),
      helpfulness INT DEFAULT 0,
      INDEX idx_product_reported (product_id, reported)
    )`);
    console.log('Successfully initialized reviews table.')

    // Photos Table
    await pool.query(`CREATE TABLE IF NOT EXISTS photos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      url VARCHAR(255) NOT NULL,
      review_id INT NOT NULL,
      FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
    )`)
    console.log('Successfully initialized photos table.')

    // Characteristics Table
    await pool.query(`CREATE TABLE IF NOT EXISTS characteristics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      name VARCHAR(255) NOT NULL
    )`)
    console.log('Successfully initialized characteristics table.')

    // Reviews_characteristics Table - JOIN TABLE
    await pool.query(`CREATE TABLE IF NOT EXISTS reviews_characteristics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      characteristic_id INT NOT NULL,
      review_id INT NOT NULL,
      value TINYINT NOT NULL,
      FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
      FOREIGN KEY (characteristic_id) REFERENCES characteristics(id) ON DELETE CASCADE
    )`)
    console.log('Successfully initialized reviews_characteristics table.')
  } catch (err) {
    console.error(err);
  }
}

initializeDB();

module.exports = pool;