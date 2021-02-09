const puppeteer = require('puppeteer');
const removeAccents = require('remove-accents')
const fs = require('fs');
const request = require('request-promise-native');
const poll = require('promise-poller').default;
var http=require('http')
var ipAndPort='23.19.101.78:65432'



function requestCaptchaResults(requestId) {
    const url = `http://2captcha.com/res.php?key=3a71477fcdd51f851c8cb2f546b4c275&action=get&id=${requestId}&json=1&proxy=${ipAndPort}&proxytype=HTTPS`;
    return async function () {
        return new Promise(async function (resolve, reject) {
            console.log('polling for response...')
            const rawResponse = await request.get(url)
            const resp = JSON.parse(rawResponse);
            if (resp.status === 0) return reject(resp.request);
            resolve(resp.request);
        });
    }
}

const timeout = millis => new Promise(resolve => setTimeout(resolve, millis))

var firstSearch = true;

let players;


async function initiateCaptchaRequest() {

    console.log('Submitting solution request to 2captcha');
    const response = await request.post('https://2captcha.com/in.php?key=3a71477fcdd51f851c8cb2f546b4c275&method=funcaptcha&publickey=A4EECF77-AC87-8C8D-5754-BF882F72063B&surl=https://ea-api.arkoselabs.com&pageurl=https://www.easports.com/fifa/ultimate-team/web-app/&json=1')
    return JSON.parse(response).request;
}
async function pollForRequestResults(id, retries = 10, interval = 5000, delay = 10000) {
    await timeout(delay);
    return poll({
        taskFn: requestCaptchaResults(id),
        interval,
        retries
    });
}
async function clickUntilAvailable(selector, page) {
    await page.waitForSelector(selector);
    try {
        while (page.waitForSelector(selector), { visible: true }, { displayed: true }) {
            await page.click(selector);
            //console.log(selector);

        }
    }
    catch (err) {
        //console.log('catch');
    }
}
async function clickUntilAvailable2(selector, page) {
    var clicked = false;
    while (!clicked) {
        try {
            await page.waitForSelector(selector, { visible: true, displayed: true, timeout: 100 })
            await page.click(selector);
            //console.log(selector);

        }

        catch (err) {
            //console.log('catch');
            clicked = true;
        }
    }
}
async function clickUpgrade(selector1, selector2, page) {
    var clicked = false;
    while (!clicked) {
        try {
            await page.waitForSelector(selector2, { timeout: 100 });
            clicked = true;
            //console.log(clicked);
        }
        catch (err) {
            try {
                await page.click(selector1);

            }
            catch (err) {

            }
        }
    }
}
async function clickUpgrade2(selector, page) {
    await page.waitForSelector(selector, { displayed: true });
    var clicked = false;
    while (!clicked) {
        console.log('working');
        try {
            await page.click(selector);
        }
        catch (err) {
            console.log(clicked);
        }
        try {
            await page.waitForSelector(selector, { displayed: true, timeout: 100 });
        }
        catch (err) {
            clicked = true;
            console.log(clicked);
            console.log(selector);
        }
    }
}

async function clickUpgradeXPath(selector, page) {
    let clicked = false;
    await page.waitForXPath(selector, { visible: true, displayed: true });
    try {
        while (clicked == false) {
            xpathClick(selector, page);
            clicked = true;
            console.log(selector);

        }
    }
    catch (err) {
        console.log('catch');
    }
}
async function xpathClick(xpath, page) {
    const elements = await page.$x(xpath);
    await elements[0].click();
}
const config = require('./config.js');
const futbinClubs = require('./futbinClubs.js');
const { url } = require('inspector');
let club = config.config[0].club;
(async () => {
    const browser = await puppeteer.launch({
        headless: false, args: [
            '--start-maximized',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--ignore-certificate-errors',
            '--ignore-certificate-errors-spki-list ',
            `--proxy-server=${ipAndPort}`
        ], defaultViewport: null
    });
    console.log('Running tests..');
    const page = await browser.newPage();
    await page.goto('https://whatismyipaddress.com/')
    await page.click('#section_left > div:nth-child(3) > div:nth-child(10) > a')
    await page.waitFor(3000)
    await page.screenshot({path:'ip.png'})
    await page.goto('https://www.easports.com/fifa/ultimate-team/web-app/');
    clickUntilAvailable('#Login > div > div > button.btn-standard.call-to-action', page);

    await page.waitForSelector('#email');
    await page.type('#email', config.config[0].Fifa_Account_2_Email);
    await page.type('#password', config.config[0].Fifa_Account_2_Password);
    await page.click('#btnLogin > span > span');
    clickUntilAvailable('#btnSendCode > span > span', page);
    await page.waitFor(10000);

    const page2 = await browser.newPage();
    await page2.goto('https://login.yahoo.com/?.src=ym&.lang=en-US&.intl=us&.done=https%3A%2F%2Fmail.yahoo.com%2Fd%3F.src%3Dfp');
    let correctlyTyped = false;
    while (!correctlyTyped) {
        clickUntilAvailable('#login-username', page2);
        await page2.type('#login-username', config.config[0].Yahoo_Account_2_Email);
        let emailInputElement = await page2.$('#login-username');
        let emailInput = await page2.evaluate(emailInputElement => emailInputElement.value, emailInputElement);
        if (emailInput != config.config[0].Yahoo_Account_2_Email) {
            await page2.click('#login-username', { clickCount: 3 });
            let emailTyped = await page2.$('#login-username');
            await emailTyped.press('Backspace');
        }
        else {
            correctlyTyped = true;
        }
    }
    await page2.click('#login-signin');
    await page2.waitForNavigation({ timeout: 90000 });
    correctlyTyped = false;
    while (!correctlyTyped) {
        clickUntilAvailable('#login-passwd');
        await page2.type('#login-passwd', config.config[0].Yahoo_Account_2_Password);
        let passwordInputElement = await page2.$('#login-passwd');
        let passwordInput = await page2.evaluate(passwordInputElement => passwordInputElement.value, passwordInputElement);
        if (passwordInput != config.config[0].Yahoo_Account_2_Password) {
            await page2.click('#login-passwd', { clickCount: 3 });
            let passwordTyped = await page2.$('#login-passwd');
            await passwordTyped.press('Backspace');
        }
        else {
            correctlyTyped = true;
        }
    }
    await page2.click('#login-signin');
    console.log('check');

    await page2.waitForNavigation();
    await page2.waitForXPath('//*[@id="mail-app-component"]/div[1]/div/div[2]/div/div/div[3]/div/div[1]/ul/li[3]/a/div/div[2]/div[1]/div[1]/span[1]', { visible: true });
    let element = await page2.$x('//*[@id="mail-app-component"]/div[1]/div/div[2]/div/div/div[3]/div/div[1]/ul/li[3]/a/div/div[2]/div[1]/div[1]/span[1]');
    element = element[0];
    let securityCode = await page2.evaluate(element => element.innerText, element);
    securityCode = securityCode.substring(securityCode.indexOf(':') + 2);
    console.log(securityCode);
    //xpathClick('//*[@id="mail-app-component"]/div[2]/div/div[2]/div/div/div[3]/div/div[1]/ul/li[3]/a/div/div[1]/div[1]/button/span/svg/path',page2);
    //xpathClick('//*[@id="mail-app-component"]/div[2]/div/div[1]/div/div[2]/div/div[3]/button',page2);
    await page2.close();

    await page.waitForSelector('#oneTimeCode', { visible: true });
    await page.click('#oneTimeCode');
    await page.type('#oneTimeCode', securityCode);
    await page.click('#btnSubmit > span > span');

    await page.waitForNavigation();
    console.log('navigated');
/*//start futbin
    const page3 = await browser.newPage();
    let index;
    for (let c = 0; c < futbinClubs.futbinClubs.length; c++) {
        if (futbinClubs.futbinClubs[c].club == club) {
            index = futbinClubs.futbinClubs[c].index;
            break;
        }
    }
    await page3.goto(`https://www.futbin.com/21/players?page=1&version=gold&club=${index}`);
    await page3.waitForSelector('#platform_switch > img');
    await page3.hover('#platform_switch > img');
    console.log('clicked logo');
    //await page3.waitFor(1000);
    await page3.waitForSelector('#main-site-nav > ul.navbar-nav.ml-auto.nav-flex-icons > li:nth-child(4) > div > ul > li:nth-child(2) > a > img');
    await page3.click('#main-site-nav > ul.navbar-nav.ml-auto.nav-flex-icons > li:nth-child(4) > div > ul > li:nth-child(2) > a > img');
    //await page3.waitForNavigation();
    await page3.waitForSelector('#repTb > tbody > tr:nth-child(1) > td.table-row-text.row > div.d-inline.pt-2.pl-3 > div:nth-child(1) > a')
    var futbinPrice;
    var i;
    let error = false;
    let playerCountElements = await page3.$$eval('#repTb > tbody > tr', element => element);
    let playerCount = playerCountElements.length;
    while (!error) {
        try {
            for (i = 1; i <= playerCount; i++) {
                //console.log(i);
                let playerElement = await page3.$(`#repTb > tbody > tr:nth-child(${i}) > td.table-row-text.row > div.d-inline.pt-2.pl-3 > div:nth-child(1) > a`);
                let playerName = await page3.evaluate(playerElement => playerElement.textContent, playerElement)
                playerName = removeAccents(playerName)
                let priceElement = await page3.$(`#repTb > tbody > tr:nth-child(${i})> td:nth-child(5) > span`);
                let price = await page3.evaluate(priceElement => priceElement.textContent, priceElement);
                let ratingElement = await page3.$(`#repTb > tbody > tr:nth-child(${i}) > td:nth-child(2) > span`);
                let rating = await page3.evaluate(ratingElement => ratingElement.textContent, ratingElement);
                if (price.includes('K')) {
                    price = price.substring(0, price.indexOf('K'));
                    price = parseInt(price);
                    price = price * 1000;
                }
                else {
                    price = parseInt(price);
                }
                //console.log(playerName);
                //console.log(price);
                if (price > 0) {
                    players.push({ index: i, playerName: playerName, price: price, rating: rating });
                }
            }
            error = true;
        }
        catch (err) {
            players = [];
            i = 1;
            console.log('reset');

        }
    }

    await page3.close();
    *///end futbin 
    //debug verification
    
    const elementHandle=await page.waitForSelector('#fc-iframe-wrap')
    const frame=await elementHandle.contentFrame()
    await frame.waitForSelector('#triggerLiteMode',{displayed:true,visible:true})
    await page.waitFor(1000)
    innerHtmlBefore=await page.evaluate('document.getElementsByName("fc-token")[0].value')
    console.log(innerHtmlBefore)
    //const requestId = await initiateCaptchaRequest();
    //const response = await pollForRequestResults(requestId);
    //console.log(response)
    //await page.evaluate(`document.getElementsByName("fc-token")[0].value="${response}";`);
    //await page.evaluate(`document.getElementById("FunCaptcha-Token").value="${response}";`);
    //await frame.evaluate(`document.getElementById("funcaptcha_token").value="${response}";`);
    //await page.evaluate(`document.getElementsByName("verification-token")[0].value="${response}";`);
    innerHtmlAfter=await page.evaluate('document.getElementsByName("fc-token")[0].value')
    console.log(innerHtmlAfter)
    await page.screenshot({ path: 'postEval.png' })
    //const frames = await page.frames()
    //const frame=frames[0]
    //console.log(frames.length)
    await page.waitFor(10000)
    await frame.click('#triggerLiteMode')
    let bottom=await page.evaluate('document.getElementById("fc-iframe-wrap").getBoundingClientRect().bottom');
    let left=await page.evaluate('document.getElementById("fc-iframe-wrap").getBoundingClientRect().left');
    let right=await page.evaluate('document.getElementById("fc-iframe-wrap").getBoundingClientRect().right');
    let top=await page.evaluate('document.getElementById("fc-iframe-wrap").getBoundingClientRect().top');
    console.log(left,right,bottom,top)
    console.log((await elementHandle.boundingBox()).x,(await elementHandle.boundingBox()).y)
    bottom=530
    left=817
    let imageNumber=0
    while(true){
        for(let count=0;count<9;count++){
        fs.mkdir(`./trainingImages/image${imageNumber}`, { recursive: true }, (err) => {
            if (err) console.log(err);
          });
        await page.waitFor(750)
        await page.mouse.move(left,bottom);
        await page.mouse.down({button:'left'});
        await page.mouse.up({button:'left'})
        await page.screenshot({path:`./trainingImages/image${imageNumber}/${count}.png`,
        clip:{
            x: left,
            y: top,
            width: right-250,
            height: bottom-150
        }})
    }
    await frame.click('#triggerLiteMode')
    await page.waitFor(1500)
    imageNumber+=1

    }
    
    await frame.click('#triggerLiteMode')
    // await page.waitFor(2500);
    await page.screenshot({ path: 'postVerifyClick.png' })






    //end debug
    clickUpgrade('body > main > section > nav > button.ut-tab-bar-item.icon-transfer', 'body > main > section > section > div.ut-navigation-container-view--content > div > div > div.tile.col-1-1.ut-tile-transfer-market', page);
    clickUpgrade('body > main > section > section > div.ut-navigation-container-view--content > div > div > div.tile.col-1-1.ut-tile-transfer-market', 'body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-player-search-control > div > input', page);
    await page.waitForSelector('#futweb-loader > img', { displayed: false });
    await page.waitForSelector('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-player-search-control > div > div.ut-player-search-control--input-container > input', { displayed: true });
    //await page.click('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-player-search-control > div > input');
    //await page.waitFor(500);
    var j;
    let searching = true;
    while (searching) {
        for (j = 0; j < players.length; j++) {
            try {
                await page.waitFor(5000 + Math.random() * 1500);
                //console.log(j);
                //console.log(players[j].playerName);
                await page.waitForSelector('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-player-search-control > div > div.ut-player-search-control--input-container > input', { displayed: true });
                await page.type('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-player-search-control > div > div.ut-player-search-control--input-container > input', ' ' + players[j].playerName, { delay: 100 });
                //type in player name
                await page.waitForSelector('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-player-search-control.is-open.has-selection.contract-text-input > div > div > ul', { timeout: 3000 });
                let elements = await page.$$eval('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-player-search-control.has-selection.contract-text-input.is-open > div > div > ul > button', element => element);
                //console.log(elements[0].textContent);
                //console.log(elements.length);
                var k;
                let breakLoop = false;
                if (elements.length == 0) {
                    console.log('continue');
                    await page.click('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-player-search-control > div > div.ut-player-search-control--input-container > input', { clickCount: 3 });
                    let searchName = await page.$('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-player-search-control > div > div.ut-player-search-control--input-container > input');
                    await searchName.press('Backspace');
                    players[j].price = 0;
                    continue;
                }
                for (k = 1; k <= elements.length; k++) {
                    let comparedRatingElement = await page.$(`body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-player-search-control.has-selection.contract-text-input.is-open > div > div > ul > button:nth-child(${k}) > span.btn-subtext`);
                    let comparedRating = await page.evaluate(comparedRatingElement => comparedRatingElement.textContent, comparedRatingElement);
                    //console.log(comparedRating);
                    let comparedNameElement = await page.$(`body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-player-search-control.has-selection.contract-text-input.is-open > div > div > ul > button:nth-child(${k}) > span.btn-text`);
                    let comparedName = await page.evaluate(comparedNameElement => comparedNameElement.textContent, comparedNameElement);
                    comparedName = removeAccents(comparedName)
                    //console.log(comparedName);
                    if (players[j].playerName.includes(comparedName) && players[j].rating == comparedRating) {
                        await page.waitFor(1000);
                        await page.click(`body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-player-search-control.has-selection.contract-text-input.is-open > div > div > ul > button:nth-child(${k})`);
                        break;
                    }
                    if (k == elements.length) {
                        //delete name, break then continue
                        await page.click('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-player-search-control > div > div.ut-player-search-control--input-container > input', { clickCount: 3 });
                        let searchName = await page.$('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-player-search-control > div > div.ut-player-search-control--input-container > input');
                        await searchName.press('Backspace');
                        breakLoop = true;
                        players[j].price = 0;
                        break;
                    }
                }
                //end of dropdown player search for loop
                if (breakLoop) {
                    console.log('breakLoop');
                    continue;
                }

                await page.waitForSelector('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.search-prices > div:nth-child(6) > div.ut-numeric-input-spinner-control > input', { displayed: true });
                await page.click('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.search-prices > div:nth-child(6) > div.ut-numeric-input-spinner-control > input');
                //clicks max bin
                await page.type('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.search-prices > div:nth-child(6) > div.ut-numeric-input-spinner-control > input', ' ' + players[j].price, { delay: 50 });
                //puts in player bin from futbin
                await page.waitFor(500);
                //console.log(players[j].price);
                //console.log('first search');
                let minPriceFound = false;
                let minPrice = players[j].price;
                let noResults = false;
                let prevMinPrice = minPrice;
                let flag = false;
                while (!minPriceFound) {
                    //await page.click('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.button-container > button.btn-standard.call-to-action');
                    await page.click('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.button-container > button.btn-standard.call-to-action');
                    //clicks search button
                    await page.waitFor(500);
                    await Promise.race([
                        page.waitForSelector('body > main > section > section > div.ut-navigation-container-view--content > div > div > section > div > div.ut-no-results-view > div > span', { displayed: true }),
                        page.waitForSelector('body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-pinned-list-container.SearchResults.ui-layout-left > div > ul > li', { displayed: true })
                    ]);
                    if (await page.$('body > main > section > section > div.ut-navigation-container-view--content > div > div > section > div > div.ut-no-results-view > div > span')) {
                        await page.waitFor(250);
                        noResults = true;
                        await page.waitForSelector('body > main > section > section > div.ut-navigation-bar-view.navbar-style-landscape > button.ut-navigation-button-control', { displayed: true });
                        await page.click('body > main > section > section > div.ut-navigation-bar-view.navbar-style-landscape > button.ut-navigation-button-control');
                        //clicks return to search

                        await page.waitFor(500);
                        await page.waitForSelector('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.search-prices > div:nth-child(6) > div.ut-numeric-input-spinner-control > button.btn-standard.increment-value', { displayed: true });
                        await page.click('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.search-prices > div:nth-child(6) > div.ut-numeric-input-spinner-control > button.btn-standard.increment-value');
                        //increment
                        await page.waitFor(100);
                        //await page.click('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.search-prices > div:nth-child(6) > div.ut-numeric-input-spinner-control > button.btn-standard.increment-value');
                        //increment
                        let newMinPriceElement = await page.$('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.search-prices > div:nth-child(6) > div.ut-numeric-input-spinner-control > input');
                        minPrice = await page.evaluate(newMinPriceElement => newMinPriceElement.value, newMinPriceElement);
                        minPrice = parseInt(minPrice.replace(/,/g, ''));
                        prevMinPrice = minPrice;
                        await page.waitFor(500);
                        flag = false;
                    }
                    else {
                        let auctions = await page.$$eval('body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-pinned-list-container.SearchResults.ui-layout-left > div > ul > li', element => element);
                        if (auctions.length > 5 && !noResults && !flag) {
                            let localMin = 9999999;
                            for (let x = 1; x <= auctions.length; x++) {
                                let buyNowElement = await page.$(`body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-pinned-list-container.SearchResults.ui-layout-left > div > ul > li:nth-child(${x}) > div > div.auction > div:nth-child(3) > span.currency-coins.value`);
                                let buyNowText = await page.evaluate(buyNowElement => buyNowElement.textContent, buyNowElement);
                                let buyNow = parseInt(buyNowText.replace(/,/g, ''));

                                if (buyNow < localMin) {
                                    localMin = buyNow;
                                    minPrice = buyNow;
                                    //console.log(minPrice);
                                }

                            }
                            //console.log("prevMinPrice " + prevMinPrice);
                            if (prevMinPrice == minPrice) {
                                flag = true;
                            }
                            else {
                                prevMinPrice = minPrice;
                            }
                            await page.waitFor(500);
                            await page.waitForSelector('body > main > section > section > div.ut-navigation-bar-view.navbar-style-landscape > button.ut-navigation-button-control', { displayed: true });
                            await page.click('body > main > section > section > div.ut-navigation-bar-view.navbar-style-landscape > button.ut-navigation-button-control');
                            //clicks return to search
                            await page.screenshot({ path: 'returnType.png' });
                            await page.waitFor(750);
                            await page.waitForSelector('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.search-prices > div:nth-child(6) > div.ut-numeric-input-spinner-control > input', { displayed: true });
                            await page.click('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.search-prices > div:nth-child(6) > div.ut-numeric-input-spinner-control > input');
                            //clicks max bin
                            await page.type('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.search-prices > div:nth-child(6) > div.ut-numeric-input-spinner-control > input', ' ' + minPrice, { delay: 50 });
                            //puts in player bin from futbin
                            await page.waitFor(500);

                        }
                        else if (auctions.length > 2) {
                            if (!noResults) {
                                await page.waitFor(500);
                                await page.waitForSelector('body > main > section > section > div.ut-navigation-bar-view.navbar-style-landscape > button.ut-navigation-button-control', { displayed: true });
                                await page.click('body > main > section > section > div.ut-navigation-bar-view.navbar-style-landscape > button.ut-navigation-button-control');
                                //clicks return to search

                                await page.waitFor(500);
                                await page.waitForSelector('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.search-prices > div:nth-child(6) > div.ut-numeric-input-spinner-control > button.btn-standard.decrement-value', { displayed: true });
                                await page.click('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.search-prices > div:nth-child(6) > div.ut-numeric-input-spinner-control > button.btn-standard.decrement-value');
                                //decrement
                                let newMinPriceElement = await page.$('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.search-prices > div:nth-child(6) > div.ut-numeric-input-spinner-control > input');
                                minPrice = await page.evaluate(newMinPriceElement => newMinPriceElement.value, newMinPriceElement);
                                // console.log('minPriceElement ' + minPrice);
                                minPrice = parseInt(minPrice.replace(/,/g, ''));
                                prevMinPrice = minPrice;
                                flag = false;
                                await page.waitFor(500);
                            }
                            else {
                                minPriceFound = true;
                                players[j].price = minPrice;
                                //console.log('player price ' + players[j].price);
                                await page.waitFor(500);
                                await page.waitForSelector('body > main > section > section > div.ut-navigation-bar-view.navbar-style-landscape > button.ut-navigation-button-control', { displayed: true });
                                await page.click('body > main > section > section > div.ut-navigation-bar-view.navbar-style-landscape > button.ut-navigation-button-control');
                                //clicks return to search
                                await page.waitFor(500);

                            }
                        }//if for greater than 2 auctions
                        else if (auctions.length == 1 || auctions.length == 2) {
                            minPriceFound = true;
                            players[j].price = minPrice;
                            //console.log('player price ' + players[j].price);
                            await page.waitFor(500);
                            await page.waitForSelector('body > main > section > section > div.ut-navigation-bar-view.navbar-style-landscape > button.ut-navigation-button-control', { displayed: true });
                            await page.click('body > main > section > section > div.ut-navigation-bar-view.navbar-style-landscape > button.ut-navigation-button-control');
                            //clicks return to search
                            await page.waitFor(500);

                        }
                        else {
                            console.log('shouldnt get here');
                        }
                    }
                }
            }//end of try
            catch (err) {
                console.log('error');
                console.log(err)
                await page.screenshot({ path: 'error.png' });
                let errorElement = await page.$('body > div.view-modal-container.form-modal > section > header > h1')
                let errorText = await page.evaluate(errorElement => errorElement.textContent, errorElement)
                console.log('Errortext  ' + errorText)
                if (errorText != 'Already Highest Bidder') {
                    await page.click('body > div.view-modal-container.form-modal > section > div > div > button > span.btn-text');
                    //clicks ok to verify
                    await page.waitForNavigation();
                    await page.screenshot({ path: 'postNavigation.png' })
                    clickUntilAvailable('#Login > div > div > button.btn-standard.call-to-action', page);
                    //clicks login
                    await page.screenshot({ path: 'clickLogin.png' })
                    await page.waitForNavigation();
                    await page.waitForSelector('#password', { displayed: true });
                    await page.waitFor(1500);
                    await page.screenshot({ path: 'postNavigation2.png' })
                    correctlyTyped = false;
                    while (!correctlyTyped) {
                        await page.click('#password');
                        await page.type('#password', config.config[0].Fifa_Account_2_Password);
                        let passwordInputElement = await page.$('#password');
                        let passwordInput = await page.evaluate(passwordInputElement => passwordInputElement.value, passwordInputElement);
                        if (passwordInput != config.config[0].Fifa_Account_2_Password) {
                            await page.click('#password', { clickCount: 3 });
                            let passwordTyped = await page.$('#password');
                            await passwordTyped.press('Backspace');
                        }
                        else {
                            correctlyTyped = true;
                        }
                    }
                    await page.click('#btnLogin > span');
                    await page.waitForNavigation();
                    await page.waitForSelector('#futweb-loader > img', { displayed: false });
                    await page.waitFor(2500);
                    await page.screenshot({ path: 'postNavigation3.png' })
                    const requestId = await initiateCaptchaRequest();
                    const response = await pollForRequestResults(requestId);
                    console.log(response)
                    await page.evaluate(`document.getElementsByName("fc-token")[0].innerHTML="${response}";`);
                    await page.screenshot({ path: 'postEval.png' })
                    const frame = await page.frames()[0]
                    await frame.click('#html-verify-btn')
                    // await page.waitFor(2500);
                    await page.screenshot({ path: 'postVerifyClick.png' })

                }
                clickUpgrade('body > main > section > nav > button.ut-tab-bar-item.icon-transfer', 'body > main > section > section > div.ut-navigation-container-view--content > div > div > div.tile.col-1-1.ut-tile-transfer-market', page);
                clickUpgrade('body > main > section > section > div.ut-navigation-container-view--content > div > div > div.tile.col-1-1.ut-tile-transfer-market', 'body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-player-search-control > div > input', page);
                await page.waitForSelector('#futweb-loader > img', { displayed: false });
                await page.waitForSelector('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-player-search-control > div > div.ut-player-search-control--input-container > input', { displayed: true });
                j = j - 1;
            }
            let data = JSON.stringify(players);
            fs.writeFileSync('players.json', data);
        }
        //end of player price for loop
        if (firstSearch) {
            firstSearch = false;
            process.send(firstSearch);
            console.log('sent');
        }
        console.log('first search ' + firstSearch);
        await page.waitFor(60000);
    }//end of searching while loop  


})();
/*
verification selector box: body > div.view-modal-container.form-modal > section > header > h1
verification click ok: body > div.view-modal-container.form-modal > section > div > div > button > span.btn-text
wait for navigation
click login
wait for navigation
enter password
click login
wait for navigation
click verify button:#html-verify-btn


*/