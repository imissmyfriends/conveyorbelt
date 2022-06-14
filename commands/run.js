const Listr = require('listr');
const {Observable} = require('rxjs');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
var glob = require("glob");

const getGlobPromise = require('./utils/getGlobPromise');
const collectSpriteData = require("./collectSpriteData");
const exportFromAseprite = require("./exportFromAseprite");

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
        return getGlobPromise(SPRITES_DIR+"*/*.yy", "No sprites found").then((files) => {
          ctx.files = files;
        });
      }
    },
    {
      title: "Collect sprite data",
      task: collectSpriteData
    },
    {
      title: "Look up Aseprite files in art directory",
      task: function (ctx) {
        // console.log(ctx.spriteDetails);
        return getGlobPromise(ART_DIR+"**/*.aseprite", "No PNGs found").then((ases) => {
          ctx.ases = ases;
          // console.log(ases);
        });
      }
    },
    {
      title: "Export Aseprite files to PNG",
      task: function (ctx) {
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

// Getting Aseprite files


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
