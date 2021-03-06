const { calculateExpiry, parseOptions, shouldInvokePromise } = require('./utils');

const cache = {};

const createCache = (promiseFunc, options = {}) => {
  const internalOptions = parseOptions(options);

  const read = ({ key, forceInvoke = false }, ...parameters) =>
    new Promise((resolve, reject) => {
      if (shouldInvokePromise(cache, key, internalOptions.timeToLive, forceInvoke)) {
        promiseFunc(...parameters)
          .then((promiseResponse) => {
            if (internalOptions.timeToLive !== 0) {
              cache[key] = promiseResponse;
            }
            internalOptions.timeToLive = calculateExpiry(options.timeToLive);
            resolve(cache[key]);
          })
          .catch(reject);
      } else {
        resolve(cache[key]);
      }
    });

  const debug = () => cache;

  return { debug, read };
};

module.exports = createCache;
