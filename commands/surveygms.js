const Listr = require('listr');
const fs = require('fs');
var glob = require("glob")

function surveyGMS() {
  const tasks = new Listr([
    {
      title: "Check YYP file exists",
      task: checkYYPFileExists
    }
  ]);
  tasks.run().catch(err => {
    console.error(err);
  });
}

function checkYYPFileExists() {
  var checkProject = new Promise((resolve, reject) => {
    glob("*.yyp", function (error, files) {
      if (error != null) {
        reject(error);
      } else if (files.length == 0) {
        reject(new Error('No .yyp file'));
      } else {
        resolve(true);
      }
    });
  })
  return checkProject;
}

module.exports = surveyGMS;
