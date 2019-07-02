const fs = require('fs');
const chalk = require('chalk');
const puppeteer = require('puppeteer');
const ProgressBar = require('progress');

const write = require('./services/createFile.js');

const outputDirectory = './output';
const outputFile = 'ember-versions.txt';

// Use the count to specifiy start length in asyncForEach array
let count = 930;

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

  if (!fs.existsSync(outputDirectory)) fs.mkdirSync(outputDirectory);
  const stream = fs.createWriteStream(`${outputDirectory}/${outputFile}`, { flags: 'a' });

  const len = contents.length;
  if (len < count) throw new Error('Count must be less than array length for starting value');
  console.log(chalk.green(`Scanning ${len} urls - starting at ${count}`));

  const bar = new ProgressBar('Visiting URLs [:bar] :percent', {
    complete: '=',
    incomplete: ' ',
    width: 70,
    total: len
  });

  const browser = await puppeteer.launch({ ignoreHTTPSErrors: true });

  const processUrl = async (url) => {
    const page = await browser.newPage();
    const domain = url.indexOf('http://') === 0 || url.indexOf('https://') === 0
      ? url
      : `http://${url}`;
    // eslint-disable-next-line no-unused-vars
    try {
      await page.goto(domain, {
        waitUntil: 'load',
        timeout: 1000 * 60
      });
      count += 1;
      const emberVer = await page.evaluate(() => Ember.VERSION); // eslint-disable-line
      const foundEV = `- (${emberVer}) ${url}`;
      stream.write(`${foundEV}\n`);
      console.log(chalk.green(foundEV));
    } catch (error) {
      console.log(chalk.blue(`No Ember @ ${domain} - count is ${count}`));
    }
  };

  async function asyncForEach(array, callback) {
    for (let index = count; index < array.length; index++) { // eslint-disable-line
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
getEV('data/nz-a-c.json');
