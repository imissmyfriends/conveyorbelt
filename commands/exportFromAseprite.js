const path = require('path');
const { exec } = require('child_process');

/**
* Exports PNGs from an Aseprite file. The output differs
* based on whether the file is an animation or has exportable
* layers.
*
* @param {string} filePath - Path to aseprite file
* @returns {Promise}
*/
function exportFromAseprite(ctx, filePath) {
  var exporter = new Promise((resolve, reject) => {
    let name = path.basename(filePath, '.aseprite');
    let dir = path.dirname(filePath);
    let command = [
      ctx.ASEPRITE_PATH,
      '-b',
      filePath,
      '--save-as',
      dir + '/' + ctx.PREFIX + name + '{tag}-{frame001}.png'
    ].join(" ");

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`error: ${error.message}`);
      }

      if (stderr) {
        reject(`stderr: ${stderr}`);
      }

      resolve(`stdout:\n${stdout}`);
    });
  });
  return exporter;
}
module.exports = exportFromAseprite;