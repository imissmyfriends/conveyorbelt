const Listr = require('listr');
const {Observable} = require('rxjs');
const chokidar = require('chokidar');

const getGlobPromise = require('./getGlobPromise');
const collectSpriteData = require("./collectSpriteData");
const exportFromAseprite = require("./exportFromAseprite");
const findGMSSpriteFromAseprite = require("./findGMSSpriteFromAseprite");
const getAllAsepriteCommands = require('./getAsepriteCommand');

function run(options) {
  const tasks = new Listr([
    {
      title: "Initializing context",
      task: function (ctx) {
        ctx.SPRITES_DIR = options.spritesDir;
        ctx.ART_DIR = options.artDir;
        ctx.ASEPRITE_PATH = options.asepritePath;
        ctx.PREFIX = options.prefix;
      }
    },
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
      task: function (ctx) {
        return getGlobPromise(ctx.SPRITES_DIR, "No sprites directory");
      }
    },
    {
      title: "Get sprites",
      task: function (ctx) {
        return getGlobPromise(ctx.SPRITES_DIR+"*/*.yy", "No sprites found").then((files) => {
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
        return getGlobPromise(ctx.ART_DIR+"**/*.aseprite", "No PNGs found").then((ases) => {
          ctx.ases = ases;
          // console.log(ases);
        });
      }
    },
    {
      title: "Get Aseprite commands",
      task: getAllAsepriteCommands
    },
    {
      title: "Export Aseprite files to PNG",
      task: function (ctx) {
        var subTasks = ctx.ases.map(ase => {
          return {
            title: `Exporting ${ase}...`,
            task: function (ctx) {
              return exportFromAseprite(ctx, ase);
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
          
          const watcher = chokidar.watch(`${ctx.ART_DIR}**/*.aseprite`);
          watcher.on('change', (path) => {
            observer.next('Updated: ' + path);
            exportFromAseprite(ctx, path).then(function () {
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

module.exports = run;
