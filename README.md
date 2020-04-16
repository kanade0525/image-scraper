#puppeteerで画像を保存する#

##結論##

```app.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({headless: false});
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

  for(let i = 0; i < images.length; i ++){
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
```
##概略##

###evaluateで要素を２種類取得###

①images = https~から始まるやつ
②imagesPop = 一番最後の/から~.jpgとかで終わるやつ

###画像の保存###

①ローカルファイルのフルパスとimagesPopを連結する
②ローカルファイルに直接保存させちゃう（本当はfs.mkdirSyncでフォルダ作った方がいいと思う）

#誤解があったらご指摘ください#

##解説##

インストールするnpmは
`puppeteer` `fs` `path`の３つ

ブラウザで確認できるように
`const browser = await puppeteer.launch({headless: false});`に

目的のページにたどり着いてからローディングのぐるぐるが一旦止まるくらい待つ
`await page.waitFor(5000);`
セレクタで待つ方法、Xpathで待つ方法、ページ遷移で待つ方法、など様々あるが、簡単なのでこの方法。バンされちゃったらいやなので。安全に。

複数の要素を取得
`let images = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.pict')).map(a => a.src)
  )`
このevaluate, Array.from, querrySelectorAll, mapの流れはめっちゃ使う
ほかにも$xで指定する方法もあるがいつも混乱してしまうから個人的にはあまり好まない

ローカルファイルのフルパスと画像URLの最後の部分を連結
`let localfilefullpath = path.join(__dirname, imagesPop[i]);`

バイナリデータを扱うときは`buffer()`を使うんかなおそらく
`fs.writeFile(localfilefullpath, await viewSource.buffer())`
第一引数で保存場所、第二で保存したい画像URLに`.buffer()`を追加

#参考文献#
https://qiita.com/Ancient_Scapes/items/5f63bcfc2b5108313f77
https://qiita.com/KawamotoShuji/items/878ae659a5c6e540343e
http://info-i.net/fs-writefile
https://wa3.i-3-i.info/word1146.html
