const request = require('supertest');
const { expect } = require('chai');
const { performance } = require('perf_hooks');

const app = require('../index.js');
const pool = require('../db/index.js');

const PRODUCT_ID = 1000000;
const MAX_RESPONSE_TIME = 55;

const performanceLog = {};

describe('Ratings and Reviews API', () => {

  // GET /reviews
  describe('GET /reviews', () => {

    it('Should return a list of reviews for a given product', async () => {
      const page = 1;
      const count = 5;
      const sort = 'newest';

      const start = performance.now();
      const res = await request(app).get(`/reviews?product_id=${PRODUCT_ID}&page=${page}&count=${count}&sort=${sort}`);
      const resDuration = performance.now() - start;
      performanceLog['GET /reviews'] = resDuration;

      // Performance
      expect(resDuration).to.be.lessThan(MAX_RESPONSE_TIME);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('product').that.equals(String(PRODUCT_ID));
      expect(res.body).to.have.property('page').that.equals(page);
      expect(res.body).to.have.property('count').that.equals(count);
      expect(res.body).to.have.property('results').that.is.an('array').with.lengthOf(count);

      res.body.results.forEach((review) => {
        expect(review).to.be.an('object');
        expect(review).to.have.property('review_id').that.is.a('number');
        expect(review).to.have.property('rating').that.is.a('number');
        expect(review).to.have.property('summary').that.is.a('string');
        expect(review).to.have.property('recommend').that.is.a('number');
        expect(['object', 'string']).to.include(typeof review.response);
        expect(review).to.have.property('body').that.is.a('string');
        expect(review).to.have.property('date').that.is.a('string');
        expect(review).to.have.property('reviewer_name').that.is.a('string');
        expect(review).to.have.property('helpfulness').that.is.a('number');
        expect(review).to.have.property('photos').that.is.an('array');
      })

      expect(new Date(res.body.results[0].date).getTime()).to.be.greaterThan(new Date(res.body.results[1].date).getTime());
      expect(new Date(res.body.results[1].date).getTime()).to.be.greaterThan(new Date(res.body.results[2].date).getTime());
      expect(new Date(res.body.results[2].date).getTime()).to.be.greaterThan(new Date(res.body.results[3].date).getTime());
      expect(new Date(res.body.results[3].date).getTime()).to.be.greaterThan(new Date(res.body.results[4].date).getTime());
    })

  });

  // GET /reviews/meta
  describe('GET /reviews/meta', () => {

    it('Should return metadata for a given product', async () => {
      const start = performance.now();
      const res = await request(app).get(`/reviews/meta?product_id=${PRODUCT_ID}`);
      const resDuration = performance.now() - start;
      performanceLog['GET /reviews/meta'] = resDuration;

      // Performance
      expect(resDuration).to.be.lessThan(MAX_RESPONSE_TIME);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('product_id').that.equals(String(PRODUCT_ID));
      expect(res.body).to.have.property('ratings').that.is.an('object');
      Object.entries(res.body.ratings).forEach(([key, val]) => {
        expect(['1', '2', '3', '4', '5']).to.include(key);
        expect(Number(val)).to.be.a('number');
      })
      expect(res.body).to.have.property('recommended').that.is.an('object');
      expect(Number(res.body.recommended.true)).to.be.a('number');
      expect(Number(res.body.recommended.false)).to.be.a('number');
      expect(res.body).to.have.property('characteristics').that.is.an('object');
      Object.entries(res.body.characteristics).forEach(([key, val]) => {
       expect(key).to.be.a('string');
       expect(val).to.be.an('object');
       Object.entries(res.body.characteristics[key]).forEach(() => {
          expect(Number(res.body.characteristics[key].id)).to.be.a('number');
          expect(Number(res.body.characteristics[key].value)).to.be.a('number');
       })
      })
    })
  });

  // POST /reviews
  describe('POST /reviews', () => {

    it('Should add a review for a given product', async () => {
      const data = {
        'product_id': 325,
        'rating': 3,
        'summary': "This is a short summary.",
        'body': "This is a long body...",
        'recommend': true,
        'name': "nick123",
        'email': "nick123@gmail.com",
        'photos': [
          'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80',
          'https://images.unsplash.com/photo-1553830591-d8632a99e6ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=1511&q=80'
         ],
        'characteristics': {
          '1117': 5,
          '1118': 4
        }
      }
      const start = performance.now();
      const res = await request(app).post(`/reviews`).send(data);
      const resDuration = performance.now() - start;
      performanceLog['POST /reviews'] = resDuration;

      // Performance
      expect(resDuration).to.be.lessThan(MAX_RESPONSE_TIME);

      expect(res.status).to.equal(201);
      expect(res.body.message).to.equal('Successfully added a new review.');
    })
  });

  // PUT /reviews/:review_id/helpful
  describe('PUT /reviews/:review_id/helpful', () => {
    const reviewId = 3279175;

    it('Should update a helpfulness of the given review', async () => {
      const start = performance.now();
      const res = await request(app).put(`/reviews/${reviewId}/helpful`);
      const resDuration = performance.now() - start;
      performanceLog['PUT /reviews/:review_id/helpful'] = resDuration;

      // Performance
      expect(resDuration).to.be.lessThan(MAX_RESPONSE_TIME);

      expect(res.status).to.equal(204);
    })
  });

  // PUT /reviews/:review_id/report
  describe('PUT /reviews/:review_id/report', () => {
    const reviewId = 3279175;

    it('Should update reported of the given review', async () => {
      const start = performance.now();
      const res = await request(app).put(`/reviews/${reviewId}/report`);
      const resDuration = performance.now() - start;
      performanceLog['PUT /reviews/:review_id/report'] = resDuration;

      // Performance
      expect(resDuration).to.be.lessThan(MAX_RESPONSE_TIME);

      expect(res.status).to.equal(204);
    })
  });

  after(() => {
    // Log response time of each request
    let icon = '✅';
    if (Object.values(performanceLog).some((val) => val > MAX_RESPONSE_TIME)) {
      icon = '❌';
    }
    console.log(`${icon} PERFORMANCE LOG (Response time in ms):`)
    Object.entries(performanceLog).forEach(([key, val]) => {
      console.log(`${key}: ${val}`);
    })
  })
});
