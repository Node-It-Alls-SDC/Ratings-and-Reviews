const pool = require('../db/index.js');

const reviewsQuery = `INSERT INTO reviews (id, product_id, rating, date_unix_timestamp, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) VALUES ?`;
const photosQuery = `INSERT INTO photos (id, url, review_id) VALUES ?`;
const characteristicsQuery = `INSERT INTO characteristics (id, product_id, name) VALUES ?`;
const reviewsCharacteristicsQuery = `INSERT INTO reviews_characteristics (id, characteristic_id, review_id, value) VALUES ?`;

const insertBatch = async (batch, tableName) => {
  let query;
  if (tableName === 'reviews') {
    query = reviewsQuery;
  } else if (tableName === 'photos') {
    query = photosQuery;
  } else if (tableName === 'characteristics') {
    query = characteristicsQuery;
  } else if (tableName === 'reviews_characteristics') {
    query = reviewsCharacteristicsQuery;
  }

  try {
    await pool.query(query, [batch]);
  } catch (err) {
    console.error('Error inserting the batch.', err);
  }
};

module.exports = insertBatch;