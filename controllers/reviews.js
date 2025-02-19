const models = require('../models');

module.exports = {
  get: async (req, res) => {
    try {
      const productId = Number(req.query.product_id);
      const page = Number(req.query.page) || 1;
      const count = Number(req.query.count) || 5;
      const sort = req.query.sort || 'relevant';

      const results = await models.reviews.getSome(productId, page, count, sort);
      const resultsObj = {
        product: productId.toString(),
        page,
        count,
        results
      }
      res.status(200).json(resultsObj);
    } catch (err) {
      const errMsg = 'Failed to fetch reviews.'
      console.error(errMsg, err);
      res.status(500).send(errMsg);
    }
  },
  post: async (req, res) => {
    try {
      const {
        product_id: productId,
        rating,
        summary,
        body,
        recommend,
        name,
        email,
        photos,
        characteristics
      } = req.body;

      await models.reviews.addOne(productId, rating, summary, body, recommend, name, email, photos, characteristics);
      res.status(201).json({ message: 'Successfully added a new review.' });
    } catch (err) {
      const errMsg = 'Failed to add a review.'
      console.error(errMsg, err);
      res.status(500).send(errMsg);
    }
  },
  put: {
    helpful: async (req, res) => {
      try {
        const reviewId = Number(req.params.review_id);
        await models.reviews.updateHelpfulness(reviewId);
        res.status(204).end();
      } catch (err) {
        const errMsg = 'Failed to update helpfulness of the review.'
        console.error(errMsg, err);
        res.status(500).send(errMsg);
      }
    },
    report: async (req, res) => {
      try {
        const reviewId = Number(req.params.review_id);
        await models.reviews.updateReport(reviewId);
        res.status(204).end();
      } catch (err) {
        const errMsg = 'Failed to report the review.'
        console.error(errMsg, err);
        res.status(500).send(errMsg);
      }
    }
  }
}