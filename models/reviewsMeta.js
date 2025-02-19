const pool = require('../db/index.js');

module.exports = {
  getOne: async (productId) => {
    try {
      const query1 = `
        SELECT
          SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS '1',
          SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS '2',
          SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS '3',
          SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS '4',
          SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS '5',
          SUM(CASE WHEN recommend = TRUE THEN 1 ELSE 0 END) AS 'true',
          SUM(CASE WHEN recommend = FALSE THEN 1 ELSE 0 END) AS 'false'
        FROM reviews
        WHERE product_id = ? AND reported = FALSE
      `;
      const query2 = `
        SELECT
          characteristics.name,
          reviews_characteristics.characteristic_id,
          AVG(reviews_characteristics.value) as characteristic_avg
        FROM reviews_characteristics
        JOIN characteristics ON reviews_characteristics.characteristic_id = characteristics.id
        WHERE review_id IN (SELECT id FROM reviews WHERE product_id = ? AND reported = FALSE)
        GROUP BY reviews_characteristics.characteristic_id, characteristics.name
      `;
      const [ratingsAndRecommended, reviewsCharacteristics] = await Promise.all([
        pool.query(query1, [productId]),
        pool.query(query2, [productId, productId])
      ]);
      return [ratingsAndRecommended[0], reviewsCharacteristics[0]];
    } catch (err) {
      const errMsg = 'Failed to fetch reviews metadata.';
      console.error(errMsg, err);
      throw new Error(errMsg);
    }
  }
}