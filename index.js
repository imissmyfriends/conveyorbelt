#! /usr/bin/env node
const { program } = require('commander');
const surveyGMS = require('./commonds/surveygms');

program
  .command('surveygms')
  .description('Surveys the sprites that are currently in GMS')
  .action(surveyGMS);

program.parse();
