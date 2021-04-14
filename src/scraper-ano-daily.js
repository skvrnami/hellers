const puppeteer = require('puppeteer');
var fs = require("fs");

// 4070217 - general transparent account
// 4090453 - PSP elections
// 4090445 - 2020 Senate elections

var args = process.argv.slice(2);
var date = new Date(); 
var dateString = date.toISOString().replace(':', '-').substr(0,16);
const path = 'output/ano-transfers-' + args[0] + "-" + dateString + '.csv';

(async () => {
  function delay(time) {
   return new Promise(function(resolve) { 
       setTimeout(resolve, time)
   });
  }
  
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto('https://www.kb.cz/cs/transparentni-ucty/' + args[0], 
                    {waitUntil: 'networkidle2'});

  var shouldStop = false;
  var buttonStatus = false;
  var tableBody;
  var tableRows;
  var i = 0;
  
  while (!shouldStop) {
    await page.click('.btn-outline-secondary');
    await delay(4000);
    buttonStatus = await page.$eval('.btn-outline-secondary', x => x.disabled);
    tableBody = await page.$('tbody');
    tableRows = await page.evaluate(body => Array.from(body.getElementsByTagName("tr")).map(x => x.innerText.replaceAll(';', ':').replaceAll('\t', ';').replaceAll('\n', ';')), tableBody);
    shouldStop = buttonStatus
    i = i + 1;
    console.log(i);
  };
  
  const tbody = await page.$('tbody');
  var rows = await page.evaluate(body => Array.from(body.getElementsByTagName("tr")).map(x => x.innerText.replaceAll(';', ':').replaceAll('\t', ';').replaceAll('\n', ';')), tbody);
  
  rows = rows.reverse().join('\n')
  
  await fs.appendFile(path, rows, function(err) {
    if (err) {
       return console.error(err);
    }
    console.log("Data written successfully!");
 });
  
  await browser.close();
})();

