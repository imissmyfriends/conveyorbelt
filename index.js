#! /usr/bin/env node
const { program } = require('commander');
const run = require('./commands/run');

program
  .command('run')
  .action(run);

program.parse();
