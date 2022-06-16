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
  return new Promise(function(resolve, reject){
    let command = ctx.asepriteCommands[filePath];

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
}
module.exports = exportFromAseprite;
