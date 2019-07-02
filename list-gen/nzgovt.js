/* eslint-disable no-unused-vars */
const fs = require('fs');
const chalk = require('chalk');
const puppeteer = require('puppeteer');
const _ = require('lodash');

const outputDirectory = './output';

const getGovWebLinks = async (url) => {
  let websiteLinks;
  const browser = await puppeteer.launch({ ignoreHTTPSErrors: true });
  const page = await browser.newPage();
  try {
    await page.goto(url, {
      waitUntil: 'load',
      timeout: 1000 * 60
    });
    websiteLinks = await page.$$eval('ul.links-list a', as => as.map(a => a.href));
    console.log(websiteLinks);
    if (!fs.existsSync(outputDirectory)) fs.mkdirSync(outputDirectory);
    fs.writeFile(`${outputDirectory}/govt-web-links.json`, JSON.stringify(websiteLinks), (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
    browser.close();
  } catch (error) {
    console.log(chalk.red(error));
  }
};

const scanGovtWebLinks = async () => {
  const browser = await puppeteer.launch();
  const data = fs.readFileSync(`${outputDirectory}/govt-web-links.json`);
  const websiteLinks = JSON.parse(data);

  try {
    const links = await websiteLinks.map(async (pageUrl) => {
      const page = await browser.newPage();
      console.log(chalk.blue(pageUrl));
      await new Promise(res => page.goto(pageUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 1000 * 60
      })
        .then(e => res(e))
        .catch(() => res(null)));
      const finalLink = await new Promise(res => page.$$eval('.website a', el => el.map(a => a.href))
        .then(e => res(e))
        .catch(() => res(null)));
      console.log(finalLink);
      return _.union(finalLink);
    });
    Promise.all(links).then((v) => {
      const extLinks = _.flatten(v);
      if (!fs.existsSync(outputDirectory)) fs.mkdirSync(outputDirectory);
      fs.writeFile(`${outputDirectory}/govt-ext-links.json`, JSON.stringify(extLinks), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      });
      browser.close();
    });
  } catch (error) {
    console.log(chalk.red(error));
  }
};

const cleanGovtLinks = () => {
  const data = fs.readFileSync(`${outputDirectory}/govt-ext-links.json`);
  const websiteLinks = JSON.parse(data);
  const singlelinks = _.uniqBy(websiteLinks, (url) => {
    const nodeUrl = new URL(url);
    return nodeUrl.host;
  });
  fs.writeFile(
    `${outputDirectory}/govt-scrubbed-ext-links.json`,
    JSON.stringify(singlelinks),
    (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    }
  );
};

// getGovWebLinks('https://www.govt.nz/organisations/');
// scanGovtWebLinks();
cleanGovtLinks();
