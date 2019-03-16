const fs = require('fs');
const { exchange } = require('../server/amqp');
const articles = require('../seed/articles.json');

function insert(article) {
  return new Promise((resolve, reject) => {
    const { image, ...form } = article;

    // read local image
    fs.readFile(`images/${image}`, (err, data) => {
      if (err) throw err;

      // creat buffer from data
      var base64data = new Buffer.from(data, 'binary');
      const file = { buffer: base64data, mimetype: 'image/png' };

      // create new article
      exchange
        .rpc({ form, file }, `db.req.article.create`)
        .then(msg => msg.getContent())
        .then(content => {
          console.log(`Insert ${JSON.stringify(content)}`);
          resolve();
        })
        .catch(reject);
    });
  });
}

// insert articles into database
Promise.all(articles.map(article => insert(article)))
  .then(() => {
    process.exit();
  })
  .catch(e => {
    console.error(e); // eslint-disable-line no-console
    process.exit(1);
  });
