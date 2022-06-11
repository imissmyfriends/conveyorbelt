const Listr = require('listr');
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
      task: getArtPNGs
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


// Getting art PNGs
function getArtPNGs(ctx) {
    return getGlobPromise(ART_DIR+"**/*.aseprite", "No PNGs found")
      .then(function (ases) {
        ctx.ases = ases;
        exportFromAseprite(ases[0]);
      });
}

function exportFromAseprite(filePath) {
  let name = path.basename(filePath,'.aseprite');
  let dir = path.dirname(filePath);
  let command = [
    ASEPRITE_PATH,
    '-b',
    filePath,
    '--save-as',
    dir+'/'+PREFIX+name+'{tag}.png'
  ].join( " " );

  exec(command,(error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }

    console.log(`stdout:\n${stdout}`);
  });
}

module.exports = surveyGMS;
