const puppeteer = require('puppeteer');
var fs = require("fs");

var args = process.argv.slice(2);

// 4070217 - general transparent account
// 4090453 - PSP elections

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

  var buttonStatus = false;
  var i = 0;
  while (!buttonStatus) {
    await page.click('.btn-outline-secondary');
    await delay(4000);
    buttonStatus = await page.$eval('.btn-outline-secondary', x => x.disabled);
    // console.log(buttonStatus)
    i = i + 1;
    console.log(i);
  };
  
  const tbody = await page.$('tbody');
  const rows = await page.evaluate(body => Array.from(body.getElementsByTagName("tr")).map(x => x.innerText.replaceAll("\n", ";").replaceAll("\t", ";")).join("\n"), tbody);
  
  // console.log(rows);
    
  await fs.appendFile('output/ano-transfers-' + args[0] + '.csv', rows, function(err) {
    if (err) {
       return console.error(err);
    }
    console.log("Data written successfully!");
 });
 
  await browser.close();
})();