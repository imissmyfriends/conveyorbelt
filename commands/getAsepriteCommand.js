const Listr = require('listr');
const path = require('path');
const { exec } = require('child_process');

function getAllAsepriteCommands (ctx) {
    ctx.asepriteCommands = {};
    var subTasks = ctx.ases.map(file => {
        return {
            title: `Finding command for ${file}...`,
            task: function (ctx) {
                return getAsepriteCommand(ctx, file);
            }
        };
    });
    return new Listr(subTasks);
}

function getAsepriteCommand (ctx, filePath) {
    var getCommand = new Promise((resolve, reject) => {
        let layerCommand = [
            ctx.ASEPRITE_PATH,
            '-b',
            '--list-layers',
            filePath
        ].join(" ");
        exec(layerCommand, (error, stdout, stderr) => {
            if (error) reject(new Error(error));
            if (stderr) reject(new Error(stderr));
            let layers = stdout.split('\n').filter(l => l.indexOf('-x') ==0 );
            if (layers.length === 0 ) {
                ctx.asepriteCommands[filePath] = createAsepriteCommand(ctx, filePath);
                resolve(ctx);
            } else {
                let commands = []
                layers.forEach(layer => {
                    commands.push(createAsepriteCommand(ctx, filePath, layer));
                });
                ctx.asepriteCommands[filePath] = commands.join(' && ');
                resolve(ctx);
            }
        });
    });
    return getCommand;
}

function createAsepriteCommand(ctx, filePath, layer) {
    let name = path.basename(filePath, '.aseprite');
    let dir = path.dirname(filePath);
    let bin = [ ctx.ASEPRITE_PATH, '-b' ].join(' ');
    let suffix = '{tag}-{frame001}.png';
    
    if (layer === undefined ) {
        return [
            bin,
            filePath,
            '--save-as',
            dir + '/' + ctx.PREFIX + name + suffix
        ].join(" ");
    } else if ( layer.indexOf('-xt') === 0 ) {
        let layerExportName = layer.substring(3);
        return [
            bin,
            '--layer',
            `"${layer}"`,
            '--trim',
            filePath,
            '--save-as',
            dir + '/' + ctx.PREFIX + name + layerExportName + suffix
        ].join(' ');
    } else {
        let layerExportName = layer.substring(2);
        return [
            bin,
            '--layer',
            `"${layer}"`,
            filePath,
            '--save-as',
            dir + '/' + ctx.PREFIX + name + layerExportName + suffix
        ].join(' ');
    }
}

module.exports = getAllAsepriteCommands;