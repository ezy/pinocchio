const fs = require('fs');
const chalk = require('chalk');
const puppeteer = require('puppeteer');
const ProgressBar = require('progress');

const write = require('./services/createFile.js');

/**
 * Evaluate Ember VERSION function
 * @param  {[array]} dataFile can be array of objects requiring saveData,
 * or plain array of url strings
 * @param  {[boolean]} saveData set true if data should be cleaned
 */
async function getEV(dataFile, saveData) {
  let contents;
  if (saveData) {
    contents = await write.saveFile(dataFile, 'test'); // eslint-disable-line
  } else {
    const rawdata = fs.readFileSync(dataFile);
    contents = JSON.parse(rawdata);
  }

  const stream = fs.createWriteStream('output/ember-versions.txt', { flags: 'a' });

  const len = contents.length;
  const bar = new ProgressBar('Visiting URLs [:bar] :percent', {
    complete: '=',
    incomplete: ' ',
    width: 70,
    total: len
  });

  const browser = await puppeteer.launch({ ignoreHTTPSErrors: true });

  const processUrl = async (url) => {
    const page = await browser.newPage();
    const domain = `https://${url}`;
    try {
      await page.goto(domain, {
        waitUntil: 'load',
        timeout: 0
      });
      await page.evaluate(() => Ember.VERSION) // eslint-disable-line
        .then((emberVer) => {
          const foundEV = `- ${url} (${emberVer})`;
          stream.write(`${foundEV}\n`);
          console.log(chalk.green(foundEV));
        })
        .catch(() => {
          // console.log(chalk.blue(`No Ember @${i}`));
        });
    } catch (error) {
      // console.log(chalk.red(' No URL'));
    }
  };

  async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) { // eslint-disable-line
      await callback(array[index], index, array); // eslint-disable-line
    }
  }

  const start = async () => {
    await asyncForEach(contents, async (url) => {
      await processUrl(url);
      bar.tick();
    });
    browser.close();
  };

  start();
}

/**
 * Takes the string of the data file location with array of URLs
 */
getEV('data/test.json');
