const router = require('express').Router();
const controller = require('./controllers');

router.get('/reviews/meta', controller.reviewsMeta.get);
router.get('/reviews', controller.reviews.get);
router.post('/reviews', controller.reviews.post);
router.put('/reviews/:review_id/helpful', controller.reviews.put.helpful);
router.put('/reviews/:review_id/report', controller.reviews.put.report);

module.exports = router;