const _ = require('lodash');
const fs = require('fs');
const ProgressBar = require('progress');

const output = [];

async function cleanFile(dataFile) {
  const rawdata = fs.readFileSync(dataFile);
  const contents = JSON.parse(rawdata);

  const len = contents.length;

  const bar = new ProgressBar('scrubbing URLs [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: len
  });

  contents.forEach((v) => {
    bar.tick();
    const url = v instanceof String ? v : v.url;
    const regex = /\/\/([^\/,\s]+\.[^\/,\s]+?)(?=\/|,|\s|$|\?|#)/g; // eslint-disable-line
    const newUrl = regex.exec(url)[1];
    return _.includes(output, newUrl) ? null : output.push(newUrl);
  });

  return output;
}

module.exports = {
  cleanFile
};
