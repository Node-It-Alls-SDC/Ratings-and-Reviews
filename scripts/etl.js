const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const insertBatch = require('./insertBatch.js');

const etlReviews = async () => {
  const tableName = 'reviews';
  const batch = [];
  const stream = fs.createReadStream(path.resolve(__dirname, '../data/reviews.csv')).pipe(csv());

  try {
    for await (const data of stream) {
      batch.push([
        Number(data.id),
        Number(data.product_id),
        Number(data.rating),
        Number(data.date),
        data.summary,
        data.body,
        data.recommend === 'true',
        data.reported === 'true',
        data.reviewer_name,
        data.reviewer_email,
        data.response === 'null' ? null : data.response,
        Number(data.helpfulness)
      ]);
      if (batch.length >= 10000) {
        await insertBatch(batch, tableName);
        batch.length = 0;
        console.log(`Inserted 10 000 ${tableName}`)
      }
    }
    if (batch.length > 0) {
      await insertBatch(batch, tableName);
    }
    console.log(`✅ ETL of ${tableName} completed.`)
  } catch (err) {
    console.error(`ETL of ${tableName} failed.`, err)
    throw err;
  }
}

const etlPhotos = async () => {
  const tableName = 'photos';
  const batch = [];
  const stream = fs.createReadStream(path.resolve(__dirname, '../data/reviews_photos.csv')).pipe(csv());

  try {
    for await (const data of stream) {
      batch.push([
       Number(data.id),
       data.url,
       Number(data.review_id)
      ]);
      if (batch.length >= 10000) {
        await insertBatch(batch, tableName);
        batch.length = 0;
        console.log(`Inserted 10 000 ${tableName}`)
      }
    }
    if (batch.length > 0) {
      await insertBatch(batch, tableName);
    }
    console.log(`✅ ETL of ${tableName} completed.`)
  } catch (err) {
    console.error(`ETL of ${tableName} failed.`, err)
    throw err;
  }
}

const etlCharacteristics = async () => {
  const tableName = 'characteristics';
  const batch = [];
  const stream = fs.createReadStream(path.resolve(__dirname, '../data/characteristics.csv')).pipe(csv());

  try {
    for await (const data of stream) {
      batch.push([
       Number(data.id),
       Number(data.product_id),
       data.name
      ]);
      if (batch.length >= 10000) {
        await insertBatch(batch, tableName);
        batch.length = 0;
        console.log(`Inserted 10 000 ${tableName}`)
      }
    }
    if (batch.length > 0) {
      await insertBatch(batch, tableName);
    }
    console.log(`✅ ETL of ${tableName} completed.`)
  } catch (err) {
    console.error(`ETL of ${tableName} failed.`, err)
    throw err;
  }
}

const etlReviewsCharacteristics = async () => {
  const tableName = 'reviews_characteristics';
  const batch = [];
  const stream = fs.createReadStream(path.resolve(__dirname, '../data/characteristic_reviews.csv')).pipe(csv());

  try {
    for await (const data of stream) {
      batch.push([
       Number(data.id),
       Number(data.characteristic_id),
       Number(data.review_id),
       Number(data.value)
      ]);
      if (batch.length >= 10000) {
        await insertBatch(batch, tableName);
        batch.length = 0;
        console.log(`Inserted 10 000 ${tableName}`)
      }
    }
    if (batch.length > 0) {
      await insertBatch(batch, tableName);
    }
    console.log(`✅ ETL of ${tableName} completed.`)
  } catch (err) {
    console.error(`ETL of ${tableName} failed.`, err)
    throw err;
  }
}

(async () => {
  try {
    await etlReviews();
    // TODO: Run etlPhotos and etlCharacteristics in parrallel?
    await etlPhotos();
    await etlCharacteristics();
    await etlReviewsCharacteristics();
    console.log('✅ ETL COMPLETED');
  } catch (err) {
    console.error(err);
  }
})();
