const Listr = require('listr');
const {Observable} = require('rxjs');
const chokidar = require('chokidar');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
var glob = require("glob");

const getGlobPromise = require('./utils/getGlobPromise');

const SPRITES_DIR = "sprites/";
const ART_DIR = "art/";
const ASEPRITE_PATH = "~/Library/Application\\ Support/Steam/steamapps/common/Aseprite/Aseprite.app/Contents/MacOS/aseprite";
const PREFIX = "s";

function run() {
  const tasks = new Listr([
    {
      title: "Check if git repo exists",
      task: function () {
        return getGlobPromise(".git/", "No .git directory. Please setup a git repo first");
      }
    },
    {
      title: "Check YYP file exists",
      task: function () {
        return getGlobPromise("*.yyp", "No .yyp file");;
      }
    },
    {
      title: "Check sprites directory exists",
      task: function () {
        return getGlobPromise(SPRITES_DIR, "No sprites directory");
      }
    },
    {
      title: "Get sprites",
      task: function (ctx) {
        return getGlobPromise(SPRITES_DIR+"*/*.yy", "No sprites found")
        .then(function (files) {
          ctx.files = files;
        });
      }
    },
    {
      title: "Collect sprite data",
      task: collectSpriteData
    },
    {
      title: "Show sprite info",
      task: function (ctx) {
        //console.log(ctx.spriteDetails);
      }
    },
    {
      title: "Look up Aseprite files in art directory",
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
      task: (ctx) => {
        return new Observable(observer => {
          observer.next('Watching…');
          
          const watcher = chokidar.watch(`${ART_DIR}**/*.aseprite`);
          watcher.on('change', (path) => {
            observer.next('Updated: ' + path);
            exportFromAseprite(path).then(function () {
              observer.next('Exported: ' + path);
              findGMSSpriteFromAseprite(path, ctx, observer);
            });
          })
          
          // Never call this, let the user stop the program
          // observer.complete();
        });
      }
    }
  ]);
  tasks.run().catch(err => {
    console.error(err);
  });
}

// SPRITES

/**
* Collects sprites data for all the `files` in `ctx` and puts
* it in `spriteDetails`.
*
* @param ctx
* @returns {Listr}
*/
function collectSpriteData(ctx) {
  ctx.spriteDetails = {};
  var subTasks = ctx.files.map(file => {
    return {
      title: `Looking up ${file}...`,
      task: function (ctx, task) {
        return getSpriteReader(ctx, file);
      }
    };
  })
  return new Listr(subTasks)
}

/**
* Reads the sprite file, parses it, gets its details and puts them
* in the `ctx`
*
* @param ctx
* @param file - to be read
* @returns {Promise}
*/
function getSpriteReader(ctx, file) {
  var readSprite = new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, json) => {
      if (err) {
        reject(new Error(`Error reading file from disk: ${err}`));
      } else {
        var sprite = parseSpriteJSON(json);
        ctx.spriteDetails[sprite.name] = getSpriteDetails(sprite);
        resolve(ctx);
      }
    });
  });
  return readSprite;
}

/**
* Parses the `yy` JSON format and returns it
*
* @params {string} json - JSON of the yy file
* @returns {Object}
*/
function parseSpriteJSON(json) {
  // Remove trailing commas
  let regex = /\,(?!\s*?[\{\[\"\'\w])/g;
  let correctData = json.replace(regex, '');
  
  // parse JSON string to JSON object
  return JSON.parse(correctData);
}

/**
* Gets the image and layer name details from a sprite.
*
* @params {Object} sprite - Parsed sprite data
* @returns {Object} Object with `imgName(s)` and `layerName(s)`
*/
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


function findGMSSpriteFromAseprite(filePath, ctx, observer) {
  let name = path.basename(filePath,'.aseprite');
  let dir = path.dirname(filePath);
  let globMatch = dir+'/'+PREFIX+name+'-*.png';
  glob(globMatch, function (error, files) {
    if (files.length === 1) { // Single sprite
      let pngName = path.basename(files[0],'.png');
      let pngPath = dir + `/` + pngName + '.png';
      let spriteName = pngName.split('-')[0];
      let spriteImgName = ctx.spriteDetails[spriteName].imgName
      let spriteImgPath  = [
        SPRITES_DIR,
        spriteName,'/',
        spriteImgName,'.png'
      ].join('');
      let spriteLayerImgName = ctx.spriteDetails[spriteName].layerName;
      let spriteLayerImgPath = [
        SPRITES_DIR,
        spriteName,'/',
        'layers/',
        spriteImgName,'/',
        spriteLayerImgName, '.png'
      ].join('');
      
      var pngBuf = fs.readFileSync(pngPath)
      var gmsBuf = fs.readFileSync(spriteImgPath)
      if (pngBuf.equals(gmsBuf)) {
        observer.next('No change in: ' + spriteName)
      } else {
        fs.copyFile(pngPath, spriteImgPath, function (error) {
          if (error) throw new Error(error);
          observer.next('Updated in GMS: ' + spriteName);
        });
        fs.copyFile(pngPath, spriteLayerImgPath, function (error) {
          if (error) throw new Error(error);
          observer.next('Updated in GMS: ' + spriteName);
        });
      }
    } else { // Animation
      
    }
    //console.log(files);
    //observer.next(globMatch);
    //observer.next(files[0]);
  });
}

module.exports = run;