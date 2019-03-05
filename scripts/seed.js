// const fs = require('fs');
// const mongoose = require('mongoose');

// const config = require('../config/config');
// const { uploadFile } = require('../util/s3');

// const Article = require('../server/article/article.model');
// const articles = require('../seed/articles.json');

// // connect to mongo db
// const { host, port, db } = config.mongo;
// const mongoUri = `mongodb://${host}:${port}/${db}`;
// const mongoOptions = { useNewUrlParser: true, useCreateIndex: true };
// mongoose.connect(mongoUri, mongoOptions);
// mongoose.connection.on('error', () => {
//   throw new Error(`unable to connect to database: ${mongoUri}`);
// });

// function insert(article) {
//   return new Promise(resolve => {
//     // read local image
//     fs.readFile(`images/${article.image}`, function(err, data) {
//       if (err) throw err;

//       // create buffer from data
//       var base64data = new Buffer.from(data, 'binary');

//       // upload file to s3
//       uploadFile(base64data, `testing/${article.image}`, 'image/png')
//         .then(data => {
//           // replace article image local path to s3 key
//           article.image = data.Location;

//           // save article into database
//           const mongoArticle = new Article(article);
//           mongoArticle
//             .save()
//             .then(savedArticle => {
//               console.log('saved: ', savedArticle); // eslint-disable-line no-console
//               resolve();
//             })
//             .catch(e => {
//               throw e;
//             });
//         })
//         .catch(e => {
//           throw e;
//         });
//     });
//   });
// }

// // insert articles into database
// Promise.all(articles.map(article => insert(article)))
//   .then(() => {
//     process.exit();
//   })
//   .catch(e => {
//     console.error(e); // eslint-disable-line no-console
//     process.exit(1);
//   });
