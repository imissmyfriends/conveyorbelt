const glob = require("glob");

/**
 * Wraps a `glob` call with a Promise.
 *
 * @param {string} globMatch - The glob to match
 * @param {string} errorText - The error that the Promise should return
 * @returns {Promise}
 */
function getGlobPromise(globMatch, errorText) {
  var checkProject = new Promise((resolve, reject) => {
    glob(globMatch, function (error, files) {
      if (error != null) {
        reject(error);
      } else if (files.length == 0) {
        reject(new Error(errorText));
      } else {
        resolve(files);
      }
    });
  })
  return checkProject;
}

module.exports = getGlobPromise;