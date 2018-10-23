const fs = require('fs');
const cleaner = require('./cleaner.js');


async function saveFile(fileInput, fileOutput) {
  const output = await cleaner.cleanFile(fileInput);

  fs.writeFile(`data/${fileOutput}.json`, JSON.stringify(output), 'utf8', (err) => {
    if (err) throw err;
  });

  return output;
}

module.exports = {
  saveFile
};
