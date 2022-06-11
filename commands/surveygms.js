const Listr = require('listr');
const {Observable} = require('rxjs');
const chokidar = require('chokidar');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
var glob = require("glob")

const SPRITES_DIR = "sprites/";
const ART_DIR = "art/";
const ASEPRITE_PATH = "~/Library/Application\\ Support/Steam/steamapps/common/Aseprite/Aseprite.app/Contents/MacOS/aseprite";
const PREFIX = "s";

function surveyGMS() {
  const tasks = new Listr([
    {
      title: "Check YYP file exists",
      task: checkYYPFileExists
    },
    {
      title: "Check sprites directory exists",
      task: checkSpritesDirExists
    },
    {
      title: "Get sprites",
      task: getSpriteDirectories
    },
    {
      title: "Collect sprite data",
      task: function (ctx, task) {
        ctx.spriteDetails = {};
        var subTasks = ctx.files.map(file => {
          return {
            title: `Looking up ${file}...`,
            task: function (ctx, task) {
              return getSpriteReader(ctx, file);
              task.output = 'hi';
            }
          };
        })
        task.output ='hi';
        return new Listr(subTasks)
      }
    },
    {
      title: "Show sprite info",
      task: function (ctx) {
        //console.log(ctx.spriteDetails);
      }
    },
    {
      title: "Look up PNGs in art directory",
      task: getAsepriteFiles
    },
    {
      title: "Show Aseprite info",
      task: function (ctx) {
        //console.log(ctx.ases);
      }
    },
    {
      title: "Export Aseprite files to PNG",
      task: exportAllAsepriteToPng
    },
    {
      title: "Watching files",
      task: () => {
        return new Observable(observer => {
          observer.next('Watching…');

          const watcher = chokidar.watch(ART_DIR+'**/*.aseprite');

          watcher.on('change', (path) => {
            observer.next('Updated: ' + path);
            exportFromAseprite(path).then(function () {
              observer.next('Exported: ' + path);
            });
          })
          //observer.complete();
        });
      }
    }
  ]);
  tasks.run().catch(err => {
    console.error(err);
  });
}

// Check project
function checkYYPFileExists() {
  return getGlobPromise("*.yyp", "No .yyp file");
}

function checkSpritesDirExists() {
  return getGlobPromise(SPRITES_DIR, "No sprites directory");
}

function getSpriteDirectories(ctx) {
    return getGlobPromise(SPRITES_DIR+"*/*.yy", "No sprites found")
      .then(function (files) {
        ctx.files = files;
      });
}

// Get sprites
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

// Get sprite information
function getSpriteReader(ctx, file) {
  var readSprite = new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        reject(new Error(`Error reading file from disk: ${err}`));
      } else {
        var sprite = getSpriteData(data);
        ctx.spriteDetails[sprite.name] = getSpriteDetails(sprite);
        resolve(ctx);
      }
    });
  });
  return readSprite;
}

function getSpriteData(data) {
  // Remove trailing commas
  let regex = /\,(?!\s*?[\{\[\"\'\w])/g;
  let correctData = data.replace(regex, '');

  // parse JSON string to JSON object
  return JSON.parse(correctData);
}

function getSpriteDetails(sprite) {
  if (sprite.frames.length === 1 ) {
    return {
      imgName: sprite.frames[0].compositeImage.FrameId.name,
      layerName: sprite.layers[0].name
    };
  } else {
    var imgNames = sprite.frames.map(frame => {
      return frame.compositeImage.FrameId.name;
    });

    return {
      imgNames,
      layerName: sprite.layers[0].name
    }
  }
}

// Getting Aseprite files

/**
 * Looks into the `ART_DIR` and finds all Aseprite files
 *
 * @param ctx
 * @returns {Promise}
 */
function getAsepriteFiles(ctx) {
  return getGlobPromise(ART_DIR+"**/*.aseprite", "No PNGs found")
    .then(function (ases) {
      ctx.ases = ases;
    });
}

/**
 * Creates tasks to export all Aseprite files that are in the
 * `ctx`.
 * @params ctx
 * @returns {Listr}
 */
function exportAllAsepriteToPng(ctx) {
  var subTasks = ctx.ases.map(ase => {
    return {
      title: `Exporting ${ase}...`,
      task: function (ctx, task) {
        return exportFromAseprite(ase);
      }
    };
  })
  return new Listr(subTasks)
}

/**
 * Exports PNGs from an Aseprite file. The output differs
 * based on whether the file is an animation or has exportable
 * layers.
 *
 * @param {string} filePath - Path to aseprite file
 * @returns {Promise}
 */
function exportFromAseprite(filePath) {
  var exporter = new Promise((resolve, reject) => {
    let name = path.basename(filePath,'.aseprite');
    let dir = path.dirname(filePath);
    let command = [
      ASEPRITE_PATH,
      '-b',
      filePath,
      '--save-as',
      dir+'/'+PREFIX+name+'{tag}-{frame001}.png'
    ].join( " " );

    exec(command,(error, stdout, stderr) => {
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

module.exports = surveyGMS;
