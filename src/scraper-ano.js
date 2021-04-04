const puppeteer = require('puppeteer');
var fs = require("fs");

function parseRow(row) {
    var date = row.childNodes[0].innerText
    var money = row.childNodes[1].innerText
    var symbols = row.childNodes[1].innerText
    var donationBody = row.childNodes[3].innerText.split("\n")
    return {
        "datum": date, 
        "transferAmount": money, 
        "transferSymbols": symbols, 
        "person": donationBody[0],
        "transferType": donationBody[1], 
        "transferMessage": donationBody[2]
    }
}

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto('https://www.kb.cz/cs/transparentni-ucty/4070217', 
                    {waitUntil: 'networkidle2'});

  var buttonNext = await page.evaluate(() => {
      document.getElementsByClassName("btn-outline-secondary")[0]
  })

  var donations = await page.evaluate(() => {
    rows = document.getElementsByTagName("tr")
    rowsArray = Array.from(rows)
    return rowsArray.map(x => parseRow(x))
  });

/*
  fs.appendFile('output/champions.csv', huntersTable, function(err) {
    if (err) {
       return console.error(err);
    }
    console.log("Data written successfully!");
 });
 
 */
  await browser.close();
})();