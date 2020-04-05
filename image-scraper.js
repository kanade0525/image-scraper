const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  await page.goto('目的の画像サイトのURL');
  await page.waitFor(5000);

  let images = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.pict')).map(a => a.src)
  )
  //↓これ絶対冗長だからなおしたい
  let imagesPop = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.pict')).map(a => a.src.split('/').pop())
  )

  for (let i = 0; i < images.length; i++) {
    let localfilefullpath = path.join(__dirname, imagesPop[i]);

    const viewSource = await page.goto(images[i]);
    fs.writeFile(localfilefullpath, await viewSource.buffer(), (error) => {
      if (error) {
        console.log(error);
        return;
      }
      console.log('保存できたよ！');
    });
    await page.waitFor(1000);
  }
  await browser.close();
})();