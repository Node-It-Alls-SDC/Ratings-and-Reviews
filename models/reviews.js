const pool = require('../db/index.js');

module.exports = {
  getSome: async (productId, page, count, sort) => {
    // sort: 'newest', 'helpful', 'relevant'
    let sortBy;
    if (sort === 'newest') {
      sortBy = 'date DESC';
    } else if (sort === 'helpful') {
      sortBy = 'helpfulness DESC';
    } else {
      // Relevance = helpfulness * weight + recency * weight
      // DATEDIFF(NOW(), reviews.date) -> returns difference in days
      sortBy = '(reviews.helpfulness * 1) + (DATEDIFF(NOW(), reviews.date) * -0.05) DESC';
    }
    const offset = (page - 1) * count;

    try {
      const query = `
        SELECT
          reviews.id AS review_id,
          reviews.rating,
          reviews.summary,
          reviews.recommend,
          reviews.response,
          reviews.body,
          reviews.date,
          reviews.reviewer_name,
          reviews.helpfulness,
          COALESCE(
            NULLIF(
              JSON_ARRAYAGG(
                IF(photos.id IS NOT NULL, JSON_OBJECT('id', photos.id, 'url', photos.url), null)
              ),
              JSON_ARRAY(NULL)
            ),
              JSON_ARRAY()
          ) AS photos
        FROM reviews
        LEFT JOIN photos ON reviews.id = photos.review_id
        WHERE product_id = ? AND reported = FALSE
        GROUP BY reviews.id
        ORDER BY ${sortBy}
        LIMIT ? OFFSET ?
      `;
      const [rows] = await pool.query(query, [productId, count, offset]);
      return rows;
    } catch (err) {
      const errMsg = 'Failed to query reviews.'
      console.error(errMsg, err);
      throw new Error(errMsg);
    }
  },
  addOne: async (productId, rating, summary, body, recommend, name, email, photos, characteristics) => {
    try {
      // Insert in reviews table
      const query = `
        INSERT INTO reviews (product_id, rating, summary, body, recommend, reviewer_name, reviewer_email)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await pool.query(query, [productId, rating, summary, body, recommend, name, email]);
      const newReviewId = result.insertId;
      console.log('Inserted a new review', newReviewId);

      // Insert in photos table
      if (photos && photos.length > 0) {
        const photoValues = photos.map(() => '(?, ?)').join(', ')
        const photoParameters = [];
        photos.forEach((url) => {
          photoParameters.push(newReviewId);
          photoParameters.push(url);
        });
        const photosQuery = `
          INSERT INTO photos (review_id, url)
          VALUES ${photoValues}
        `;
        await pool.query(photosQuery, photoParameters);
        console.log(`Inserted photos for review ${newReviewId}`);
      }

      // Insert in reviews_characteristics table
      const characteristicsValues = Object.keys(characteristics).map(() => '(?, ?, ?)').join(', ');
      const characteristicsParameters = [];
      Object.entries(characteristics).forEach(([charId, val]) => {
        characteristicsParameters.push(newReviewId);
        characteristicsParameters.push(Number(charId));
        characteristicsParameters.push(Number(val));
      });
      const reviewsCharacteristicsQuery = `
        INSERT INTO reviews_characteristics (review_id, characteristic_id, value)
        VALUES ${characteristicsValues}
      `;
      await pool.query(reviewsCharacteristicsQuery, characteristicsParameters);
      console.log(`Inserted characteristics for review ${newReviewId}`)

    } catch (err) {
      const errMsg = 'Failed to insert a review';
      console.error(errMsg, err);
      throw new Error(errMsg);
    }
  },
  updateHelpfulness: async(reviewId) => {
    try {
      const query = `
      UPDATE reviews
      SET helpfulness = helpfulness + 1
      WHERE id = ?
      `;
      await pool.query(query, [reviewId]);
      console.log(`Updated helpfulness of review ${reviewId}`);
    } catch (err) {
      const errMsg = `Failed to update helpfulness of review ${reviewId}`;
      console.error(errMsg, err);
      throw new Error(errMsg);
    }
  },
  updateReport: async(reviewId) => {
    try {
      const query = `
      UPDATE reviews
      SET reported = TRUE
      WHERE id = ?
      `;
      await pool.query(query, [reviewId]);
      console.log(`Updated reported of review ${reviewId}`);
    } catch (err) {
      const errMsg = `Failed to update reported of review ${reviewId}`;
      console.error(errMsg, err);
      throw new Error(errMsg);
    }
  }
}