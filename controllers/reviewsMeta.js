const models = require('../models');

module.exports = {
  get: async (req, res) => {
    try {
      const productId = Number(req.query.product_id);
      const [ratingsAndRecommended, reviewsCharacteristics] = await models.reviewsMeta.getOne(productId);
      const result = {
        product_id: productId.toString(),
        ratings: {},
        recommended: {},
        characteristics: {}
      };
      // Ratings
      Object.entries(ratingsAndRecommended[0]).forEach(([key, value]) => {
        if (key === 'true' || key === 'false') {
          result.recommended[key] = value;
        } else {
          result.ratings[key] = value;
        }
      })

      // Characteristics
      reviewsCharacteristics.forEach((row) => {
        result.characteristics[row.name] = {};
        result.characteristics[row.name].id = row.characteristic_id;
        result.characteristics[row.name].value = row.characteristic_avg;
      })

      console.log(reviewsCharacteristics);
      res.status(200).json(result);
    } catch (err) {
      const errMsg = 'Failed to fetch reviews metadata.'
      console.error(errMsg, err);
      res.status(500).send(errMsg);
    }
  }
}