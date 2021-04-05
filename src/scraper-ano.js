const puppeteer = require('puppeteer');
var fs = require("fs");

// 4070217 - general transparent account
// 4090453 - PSP elections
// 4090445 - 2020 Senate elections

var args = process.argv.slice(2);
const path = 'output/ano-transfers-' + args[0] + '.csv';

function findLastLine(path){
    var lastLine;
    try {
        const fileContent = fs.readFileSync(path, 'UTF-8');
        const lines = fileContent.split(/\r?\n/);
        lastLine = lines[lines.length - 1];
    } catch (err) {
        lastLine = ''
    }
    
    return lastLine
}

var finalLine;
finalLine = findLastLine(path);

console.log(finalLine);

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
  var lastLineIndex;
  var tableBody;
  var tableRows;
  var i = 0;
  
  while (!shouldStop) {
    await page.click('.btn-outline-secondary');
    await delay(4000);
    buttonStatus = await page.$eval('.btn-outline-secondary', x => x.disabled);
    tableBody = await page.$('tbody');
    tableRows = await page.evaluate(body => Array.from(body.getElementsByTagName("tr")).map(x => x.innerText.replaceAll(';', ':').replaceAll('\t', ';').replaceAll('\n', ';')), tableBody);
    lastLineIndex = tableRows.indexOf(finalLine);
    shouldStop = lastLineIndex != -1 || buttonStatus
    i = i + 1;
    console.log(i);
  };
  
  console.log(lastLineIndex);
  const tbody = await page.$('tbody');
  var rows = await page.evaluate(body => Array.from(body.getElementsByTagName("tr")).map(x => x.innerText.replaceAll(';', ':').replaceAll('\t', ';').replaceAll('\n', ';')), tbody);
  
  if(lastLineIndex !== -1){
    rows = '\n' + rows.slice(0, lastLineIndex).reverse().join('\n')
  }else{
    rows = rows.reverse().join('\n')
  }
  
  await fs.appendFile(path, rows, function(err) {
    if (err) {
       return console.error(err);
    }
    console.log("Data written successfully!");
 });
  
  await browser.close();
})();

