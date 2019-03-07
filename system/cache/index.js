const cache = require('memory-cache');
const SHA256 = require('crypto-js/sha256');
const memCache = new cache.Cache();

// Endpoint when use is not logged in
memCache.put('__express__/api/user/current', {});

function lookup(key, count = 0) {
  return new Promise(resolve => {
    const value = memCache.get(key);
    console.log('key: ', key);
    if (value) resolve(value);
    else if (count < 10) setTimeout(() => lookup(key, ++count).then(resolve), 100);
    else resolve({});
  });
}

module.exports = { memCache, lookup };
