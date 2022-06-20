#! /usr/bin/env node
const { program } = require('commander');
const run = require('./commands/run');

const SPRITES_DIR = "sprites/";
const ART_DIR = "art/";
const ASEPRITE_PATH = "~/Library/Application\\ Support/Steam/steamapps/common/Aseprite/Aseprite.app/Contents/MacOS/aseprite";
const PREFIX = "s";

program
  .command('run')
  .option('-sd, --sprites-dir <string>', 'Directory of GMS sprites', SPRITES_DIR)
  .option('-ad, --art-dir <string>', 'Directory of Aseprite art', ART_DIR)
  .option('-ap, --aseprite-path <string>', 'Path to Aseprite executable', ASEPRITE_PATH)
  .option('-p, --prefix <string>', 'String prefix for GMS sprites', PREFIX)
  .option('-v, --verbose', 'Whether or not to use the verbose renderer', false)
  .action(run);

program.parse();
