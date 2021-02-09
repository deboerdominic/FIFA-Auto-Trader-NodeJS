const removeAccents = require('remove-accents')
const puppeteer = require('puppeteer');
const childProcess = require('child_process');
const fs = require('fs');
const config = require('./config.js');
let child = childProcess.fork('priceScraper.js');

const request = require('request-promise-native');
const poll = require('promise-poller').default;
function requestCaptchaResults(requestId) {
    const url = `http://2captcha.com/res.php?key=3a71477fcdd51f851c8cb2f546b4c275&action=get&id=${requestId}&json=1`;
    return async function () {
        return new Promise(async function (resolve, reject) {
            const rawResponse = await request.get(url);
            const resp = JSON.parse(rawResponse);
            if (resp.status === 0) return reject(resp.request);
            resolve(resp.request);
        });
    }
}
async function initiateCaptchaRequest() {

    console.log('Submitting solution request to 2captcha');
    const response = await request.post('https://2captcha.com/in.php?key=3a71477fcdd51f851c8cb2f546b4c275&method=funcaptcha&publickey=A4EECF77-AC87-8C8D-5754-BF882F72063B&surl=https://ea-api.arkoselabs.com&pageurl=https://www.easports.com/fifa/ultimate-team/web-app/&json=1')
    return JSON.parse(response).request;
}
async function pollForRequestResults(id, retries = 30, interval = 1500, delay = 15000) {
    await timeout(delay);
    return poll({
        taskFn: requestCaptchaResults(id),
        interval,
        retries
    });
}


var firstSearch = true;

let players;

function maxBidCalc(auctionName, auctionRating) {
    var j;
    for (j = 0; j < players.length; j++) {
        if (players[j].playerName.includes(auctionName) && players[j].rating == auctionRating) {
            return (players[j].price) * .90;
        }
    }
    return 0;
}
function playerPrice(auctionName, auctionRating) {
    var j;
    for (j = 0; j < players.length; j++) {
        if (players[j].playerName.includes(auctionName) && players[j].rating == auctionRating) {
            return (players[j].price);
        }
    }
    return 0;
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
async function clickUpgrade(selector1, selector2, page, time = 100) {
    var clicked = false;
    //console.log("time " + time)
    while (!clicked) {
        try {
            await page.waitForSelector(selector2, { timeout: time });
            clicked = true;
            //console.log("selector 1\n" + selector1 + "\nselector 2\n" + selector2)

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
        //console.log('working');
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
            //console.log(clicked);
            //console.log(selector);
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





///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////PAGE BREAK

let clubName = config.config[0].club;

(async () => {
    const browser = await puppeteer.launch({
        headless: false, args: [
            '--start-maximized',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
        ], defaultViewport: null
    });
    console.log('Running tests..');
    const page = await browser.newPage();
    await page.goto('https://www.easports.com/fifa/ultimate-team/web-app/');
    clickUntilAvailable('#Login > div > div > button.btn-standard.call-to-action', page);

    await page.waitForSelector('#email');
    await page.type('#email', config.config[0].Fifa_Account_1_Email);
    await page.type('#password', config.config[0].Fifa_Account_1_Password);
    await page.click('#btnLogin > span > span');
    clickUntilAvailable('#btnSendCode > span > span', page);
    await page.waitFor(10000);

    const page2 = await browser.newPage();
    await page2.goto('https://login.yahoo.com/?.src=ym&.lang=en-US&.intl=us&.done=https%3A%2F%2Fmail.yahoo.com%2Fd%3F.src%3Dfp');
    let correctlyTyped = false;
    while (!correctlyTyped) {
        clickUntilAvailable('#login-username', page2);
        await page2.type('#login-username', config.config[0].Yahoo_Account_1_Email);
        let emailInputElement = await page2.$('#login-username');
        let emailInput = await page2.evaluate(emailInputElement => emailInputElement.value, emailInputElement);
        console.log('email ' + emailInput)
        if (emailInput != config.config[0].Yahoo_Account_1_Email) {
            await page2.click('#login-username', { clickCount: 3 });
            await page2.waitFor(500)
            let emailTyped = await page2.$('#login-username');
            await emailTyped.press('Backspace');
        }
        else {
            correctlyTyped = true;
        }
    }
    await page2.click('#login-signin');
    await page2.waitForNavigation();
    correctlyTyped = false;
    while (!correctlyTyped) {
        clickUntilAvailable('#login-passwd', page2);
        await page2.type('#login-passwd', config.config[0].Yahoo_Account_1_Password);
        let passwordInputElement = await page2.$('#login-passwd');
        let passwordInput = await page2.evaluate(passwordInputElement => passwordInputElement.value, passwordInputElement);
        if (passwordInput != config.config[0].Yahoo_Account_1_Password) {
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
    await page2.close();

    await page.waitForSelector('#oneTimeCode', { visible: true });
    await page.click('#oneTimeCode');
    await page.type('#oneTimeCode', securityCode);
    await page.click('#btnSubmit > span > span');

    await page.waitForNavigation();
    console.log('navigated');

    clickUpgrade('body > main > section > nav > button.ut-tab-bar-item.icon-transfer', 'body > main > section > section > div.ut-navigation-container-view--content > div > div > div.tile.col-1-1.ut-tile-transfer-market', page);
    clickUpgrade('body > main > section > section > div.ut-navigation-container-view--content > div > div > div.tile.col-1-1.ut-tile-transfer-market', 'body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-player-search-control > div > div.ut-player-search-control--input-container > input', page);
    clickUpgrade('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div:nth-child(2) > div', 'body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-search-filter-control.has-default.has-image.is-open > div > ul > li:nth-child(4)', page);
    await page.waitForSelector('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-search-filter-control.has-default.has-image.is-open > div > ul > li:nth-child(4)', { displayed: true });
    await page.click('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-search-filter-control.has-default.has-image.is-open > div > ul > li:nth-child(4)');
    //clicks gold
    await page.click('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div:nth-child(8) > div > div');
    await page.waitForSelector('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-search-filter-control.force-ltr.has-default.has-image.is-open > div > ul > li:nth-child(440)', { displayed: true });
    let clubElements = await page.$$('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-search-filter-control.force-ltr.has-default.has-image.is-open > div > ul > li');
    let clubIndex;
    for (let c = 1; c <= clubElements.length; c++) {
        let clubElement = clubElements[c - 1];
        let club = await page.evaluate(clubElement => clubElement.textContent, clubElement);
        //console.log('club ' + club);
        if (clubName == club) {
            clubIndex = c;
            break;
        }
    }
    await page.click(`body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-search-filter-control.force-ltr.has-default.has-image.is-open > div > ul > li:nth-child(${clubIndex})`);
    //clicks club
    let listing = [];
    let searching = true;
    let expiredTransferTargets = 0;
    let won = 0;
    let hitSearch = false;
    console.log('before');

    await new Promise((resolve) => {
        child.on("message", (data) => {
            firstSearch = data;
            resolve();
        })
    })
    console.log('here');

    let negativeNotifications = 0;
    while (!firstSearch) {
        try {
            let error = true;
            while (error) {
                try {
                    let rawdata = fs.readFileSync('players.json');
                    players = JSON.parse(rawdata);
                    error = false;
                }
                catch (err) {
                }
            }


            if (!hitSearch) {
                await page.waitFor(Math.random(1000) + 5000)
                clickUpgrade('body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.button-container > button.btn-standard.call-to-action', 'body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-pinned-list-container.SearchResults.ui-layout-left > div > ul', page, 1500);
                //hits search
                await page.screenshot({ path: 'hitSearch.png' })
                hitSearch = true;
            }
            await page.waitForSelector('body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-pinned-list-container.SearchResults.ui-layout-left > div > ul > li');
            let auctions = await page.$$eval('body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-pinned-list-container.SearchResults.ui-layout-left > div > ul > li', element => element);
            //console.log('auctions= ' + auctions.length);
            let currentAuctions = [];
            let expired = 0;
            let winning = 0;
            let numBiddable = 0
            for (let i = 1; i <= auctions.length; i++) {
                //console.log("auction length" + auctions.length)
                let auctionBidElement = await page.$(`body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-pinned-list-container.SearchResults.ui-layout-left > div > ul > li:nth-child(${i}) > div > div.auction > div:nth-child(2) > span.currency-coins.value`)
                let auctionBid = await page.evaluate(auctionBidElement => auctionBidElement.textContent, auctionBidElement);
                //console.log(auctionBid);
                let startPrice = false
                if (auctionBid == '---') {
                    startPrice = true
                    auctionBidElement = await page.$(`body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-pinned-list-container.SearchResults.ui-layout-left > div > ul > li:nth-child(${i}) > div > div.auction > div.auctionStartPrice.auctionValue > span.currency-coins.value`)
                    auctionBid = await page.evaluate(auctionBidElement => auctionBidElement.textContent, auctionBidElement)
                    //console.log(auctionBid)
                }
                auctionBid = parseInt(auctionBid.replace(/,/g, ''));
                /*
                if(!startPrice && auctionBid<1000){
                    auctionBid+=50
                }
                else if(!startprice && auctionBid<10000){
                    auctionBid+=100
                }
                else if(!startprice && auctionBid<50000){
                    auctionBid+=250
                }
                else if(!startprice && auctionBid<100000){
                    auctionBid+=500
                }
                else if(!startPrice){
                    auctionBid+=1000
                }
                */
                //console.log(auctionBid)
                let auctionNameElement = await page.$(`body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-pinned-list-container.SearchResults.ui-layout-left > div > ul > li:nth-child(${i}) > div > div.entityContainer > div.name`);
                let auctionName = await page.evaluate(auctionNameElement => auctionNameElement.textContent, auctionNameElement);
                auctionName = removeAccents(auctionName)
                //console.log(auctionName);

                let auctionRatingElements = await page.$x(`/html/body/main/section/section/div[2]/div/div/section[1]/div/ul/li[${i}]/div/div[1]/div[1]/div[4]/div[2]/div[1]`);
                let auctionRatingElement = auctionRatingElements[0];
                let auctionRating = await page.evaluate(auctionRatingElement => auctionRatingElement.textContent, auctionRatingElement);
                //console.log(auctionRating);

                let maxBid = maxBidCalc(auctionName, auctionRating);

                //console.log(maxBid);

                let auctionTimeElement = await page.$(`body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-pinned-list-container.SearchResults.ui-layout-left > div > ul > li:nth-child(${i}) > div > div.auction > div.auction-state > span.time`)
                let auctionTime = await page.evaluate(auctionTimeElement => auctionTimeElement.textContent, auctionTimeElement);
                let biddableTime = false;
                if (auctionTime.includes('<') || auctionTime.includes('Seconds')) {
                    biddableTime = true;
                    numBiddable += 1
                }

                let attributeElement = await page.$(`body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-pinned-list-container.SearchResults.ui-layout-left > div > ul > li:nth-child(${i})`);
                let attribute = await page.evaluate(attributeElement => attributeElement.getAttribute('class'), attributeElement);
                //console.log(attribute);
                attribute = attribute.replace('selected ', '');
                attribute = attribute.replace('listFUTItem has-auction-data ', '');
                if (attribute == 'highest-bid') {
                    winning++;
                    currentAuctions.push({ index: i, name: auctionName, rating: auctionRating, maxBid: maxBid, price: playerPrice(auctionName, auctionRating), auctionStatus: attribute, wonFor: 'invalid' });
                    continue;
                }
                else if (attribute == 'outbid' && auctionBid > maxBid) {
                    currentAuctions.push({ index: i, name: auctionName, rating: auctionRating, maxBid: maxBid, price: playerPrice(auctionName, auctionRating), auctionStatus: attribute, wonFor: 'invalid' });
                    //console.log('outbid')
                }
                else if (attribute == 'won') {
                    won++;
                    clickUpgrade(`body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-pinned-list-container.SearchResults.ui-layout-left > div > ul > li:nth-child(${i}) `, 'body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-navigation-container-view.ui-layout-right > div > div > div.DetailPanel > div.ut-quick-list-panel-view > div.ut-button-group > button', page);
                    //clicks auction
                    await page.waitFor(250);
                    let boughtForElement = await page.$('body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-navigation-container-view.ui-layout-right > div > div > div.DetailPanel > div.ut-item-details--metadata > div.auctionInfo > div > span.currency-coins.subContent');
                    let boughtFor = await page.evaluate(boughtForElement => boughtForElement.textContent, boughtForElement);
                    currentAuctions.push({ index: i, name: auctionName, rating: auctionRating, maxBid: maxBid, price: playerPrice(auctionName, auctionRating), auctionStatus: attribute, wonFor: boughtFor });


                    await page.waitFor(500);
                    await page.waitForSelector('body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-navigation-container-view.ui-layout-right > div > div > div.DetailPanel > div.ut-quick-list-panel-view > div.ut-button-group > button', { displayed: true });
                    await page.click('body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-navigation-container-view.ui-layout-right > div > div > div.DetailPanel > div.ut-quick-list-panel-view > div.ut-button-group > button');
                    await page.waitForSelector('#futweb-loader > img', { displayed: false });
                    await page.waitFor(500);

                    await page.waitForSelector('body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-navigation-container-view.ui-layout-right > div > div > div.DetailPanel > div.ut-quick-list-panel-view > div.panelActions.open > div:nth-child(2) > div.ut-numeric-input-spinner-control > input');
                    await page.click('body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-navigation-container-view.ui-layout-right > div > div > div.DetailPanel > div.ut-quick-list-panel-view > div.panelActions.open > div:nth-child(2) > div.ut-numeric-input-spinner-control > input');
                    await page.waitFor(250);
                    await page.type('body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-navigation-container-view.ui-layout-right > div > div > div.DetailPanel > div.ut-quick-list-panel-view > div.panelActions.open > div:nth-child(2) > div.ut-numeric-input-spinner-control > input', ' ' + playerPrice(auctionName, auctionRating));
                    await page.waitFor(250);
                    await page.click('body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-navigation-container-view.ui-layout-right > div > div > div.DetailPanel > div.ut-quick-list-panel-view > div.panelActions.open > div:nth-child(3) > div.ut-numeric-input-spinner-control > input');
                    await page.waitFor(250)
                    await page.type('body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-navigation-container-view.ui-layout-right > div > div > div.DetailPanel > div.ut-quick-list-panel-view > div.panelActions.open > div:nth-child(3) > div.ut-numeric-input-spinner-control > input', ' ' + playerPrice(auctionName, auctionRating));
                    await page.click('body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-navigation-container-view.ui-layout-right > div > div > div.DetailPanel > div.ut-quick-list-panel-view > div.panelActions.open > div:nth-child(3) > div.ut-numeric-input-spinner-control > button.btn-standard.decrement-value');
                    //sets price and decrements it twice

                    await page.click('body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-navigation-container-view.ui-layout-right > div > div > div.DetailPanel > div.ut-quick-list-panel-view > div.panelActions.open > button');
                    //lists item

                    await page.waitForSelector('#futweb-loader > img', { displayed: false });
                    await page.screenshot({ path: 'loader.png' })
                    await page.waitFor(500);
                    console.log(auctionName + " listed for " + playerPrice(auctionName,auctionRating) + ' bought for ' + boughtFor)
                    listing.push({ name: auctionName, rating: auctionRating, time: new Date(), })
                    auctions = await page.$$eval('body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-pinned-list-container.SearchResults.ui-layout-left > div > ul > li', element => element);
                    //console.log("new length " + auctions.length)
                    i = 0;
                    expired = 0;
                    winning = 0;
                    continue;

                }
                else if (attribute == 'expired') {
                    //console.log('expired++');
                    expired++;
                    continue;
                }
                if (auctionBid <= maxBid && biddableTime && playerPrice(auctionName, auctionRating) - maxBid >= 150 && attribute != 'winning') {
                    //console.log('in bid if');
                    await page.click(`body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-pinned-list-container.SearchResults.ui-layout-left > div > ul > li:nth-child(${i}) `);
                    //clicks auction
                    await page.waitFor(250);
                    await page.waitForSelector('body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-navigation-container-view.ui-layout-right > div > div > div.DetailPanel > div.bidOptions > button.btn-standard.call-to-action.bidButton', { displayed: true });
                    let newAuctionBidElement = await page.$('body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-navigation-container-view.ui-layout-right > div > div > div.DetailPanel > div.bidOptions > div > input');
                    auctionBid = await page.evaluate(newAuctionBidElement => newAuctionBidElement.value, newAuctionBidElement);
                    auctionBid = parseInt(auctionBid.replace(/,/g, ''));
                    if (auctionBid <= maxBid && biddableTime && playerPrice(auctionName, auctionRating) - maxBid >= 150) {
                        console.log('auction bid ' + auctionBid + ' on ' + auctionName + ' bin of ' + playerPrice(auctionName, auctionRating));
                        //console.log('bidding');
                        await page.waitForSelector('body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-navigation-container-view.ui-layout-right > div > div > div.DetailPanel > div.bidOptions > button.btn-standard.call-to-action.bidButton', { displayed: true });
                        await page.click('body > main > section > section > div.ut-navigation-container-view--content > div > div > section.ut-navigation-container-view.ui-layout-right > div > div > div.DetailPanel > div.bidOptions > button.btn-standard.call-to-action.bidButton');
                        //clicks bid
                        winning++
                        await page.waitFor(1500 + Math.random(1000));
                        if (await page.$('#NotificationLayer > div')) {
                            negativeNotifications++;
                            //console.log("negative not " + negativeNotifications + ' winning ' + winning);
                            await page.waitFor(1000);
                            winning--
                            let negativeNotificationElement = await page.$('#NotificationLayer > div > p')
                            let negativeNotificationText = await page.evaluate(negativeNotificationElement => negativeNotificationElement.textContent, negativeNotificationElement)
                            if (negativeNotificationText == 'Too many actions have been taken, and use of this feature has been temporarily disabled.') {
                                throw 'too many actions taken'
                            }
                        }
                        if (await page.$('body > div.view-modal-container.form-modal > section > header > h1')) {
                            await page.waitFor(500)
                            await page.click('body > div.view-modal-container.form-modal > section > div > div > button:nth-child(1) > span.btn-text')
                            await page.screenshot({ path: 'highestbidderalready.png' })
                        }
                    }//end of inner auctionBid<=maxBid
                }//end of first auctionBid<=maxBid
                //console.log("outside if, negative not " + negativeNotifications + ' winning' + winning);

                //console.log('expired ' + expired);

            }//end of auctions for loop
            //console.log("outside for, negative not " + negativeNotifications + ' winning' + winning);
            //console.log(currentAuctions);
            //console.log('winning ' + winning + 'expired ' + expired);
            if (winning == 0 && (expired > 5 || negativeNotifications > 3 || numBiddable == auctions.length)) {
                for (let i = 0; i < currentAuctions.length; i++) {
                    if (currentAuctions[i].auctionStatus == 'outbid') {
                        expiredTransferTargets++;
                    }
                }
                //console.log('return to search')
                await page.waitForSelector('body > main > section > section > div.ut-navigation-bar-view.navbar-style-landscape > button.ut-navigation-button-control', { displayed: true });
                await page.waitFor(500);
                await page.screenshot({ path: 'beforeReturn.png' })
                await page.click('body > main > section > section > div.ut-navigation-bar-view.navbar-style-landscape > button.ut-navigation-button-control');
                //clicks return to search
                await page.screenshot({ path: 'returnSearch.png' })
                //console.log('clickedReturn')
                if (expiredTransferTargets >= 3) {
                    await page.screenshot({ path: 'transferTargetIf.png' })
                    console.log('expiredTransferTargets')
                    await page.waitForSelector('body > main > section > section > div.ut-navigation-bar-view.navbar-style-landscape > button.ut-navigation-button-control', { displayed: true });
                    await page.waitFor(250)
                    await page.click('body > main > section > section > div.ut-navigation-bar-view.navbar-style-landscape > button.ut-navigation-button-control');
                    //clicks return to transfer hub menu
                    await page.screenshot({ path: 'click1.png' })
                    clickUpgrade('body > main > section > section > div.ut-navigation-container-view--content > div > div > div.tile.col-1-2.ut-tile-transfer-targets', 'body > main > section > section > div.ut-navigation-container-view--content > div > div > div > section:nth-child(4) > header > button', page);
                    //clicks transfer targets
                    await page.screenshot({ path: 'click2.png' })
                    await page.waitFor(500);
                    await page.waitForSelector('#futweb-loader > img', { displayed: false });
                    await page.waitForSelector('body > main > section > section > div.ut-navigation-container-view--content > div > div > div > section:nth-child(4) > header > button', { displayed: true });
                    await page.click('body > main > section > section > div.ut-navigation-container-view--content > div > div > div > section:nth-child(4) > header > button', { displayed: true });
                    //clicks clear expired
                    await page.screenshot({ path: 'click3.png' })
                    await page.waitFor(500);
                    await page.waitForSelector('#futweb-loader > img', { displayed: false });
                    await page.waitForSelector('body > main > section > section > div.ut-navigation-bar-view.navbar-style-landscape > button.ut-navigation-button-control', { displayed: true });
                    await page.click('body > main > section > section > div.ut-navigation-bar-view.navbar-style-landscape > button.ut-navigation-button-control');
                    //clicks return to transfer hub menu
                    clickUpgrade('body > main > section > section > div.ut-navigation-container-view--content > div > div > div.tile.col-1-1.ut-tile-transfer-market', 'body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-player-search-control > div > div.ut-player-search-control--input-container > input', page);
                    //returns to transfer search menu
                    expiredTransferTargets = 0;

                }
                if (won >= 25) {
                    console.log('wonIf')
                    await page.waitForSelector('body > main > section > section > div.ut-navigation-bar-view.navbar-style-landscape > button.ut-navigation-button-control', { displayed: true });
                    await page.click('body > main > section > section > div.ut-navigation-bar-view.navbar-style-landscape > button.ut-navigation-button-control');
                    //clicks return to transfer hub menu
                    clickUpgrade('body > main > section > section > div.ut-navigation-container-view--content > div > div > div.tile.col-1-2.ut-tile-transfer-list', 'body > main > section > section > div.ut-navigation-container-view--content > div > div > div > section:nth-child(1) > header > button', page);
                    //clicks transfer list
                    await page.waitFor(500);
                    await page.waitForSelector('#futweb-loader > img', { displayed: false });
                    await page.waitForSelector('body > main > section > section > div.ut-navigation-container-view--content > div > div > div > section:nth-child(1) > header > button', { displayed: true });
                    await page.click('body > main > section > section > div.ut-navigation-container-view--content > div > div > div > section:nth-child(1) > header > button', { displayed: true });
                    //clicks clear expired
                    await page.waitFor(500);
                    await page.waitForSelector('#futweb-loader > img', { displayed: false });
                    await page.waitForSelector('body > main > section > section > div.ut-navigation-bar-view.navbar-style-landscape > button.ut-navigation-button-control', { displayed: true });
                    await page.click('body > main > section > section > div.ut-navigation-bar-view.navbar-style-landscape > button.ut-navigation-button-control');
                    //clicks return to transfer hub menu
                    clickUpgrade('body > main > section > section > div.ut-navigation-container-view--content > div > div > div.tile.col-1-1.ut-tile-transfer-market', 'body > main > section > section > div.ut-navigation-container-view--content > div > div.ut-pinned-list-container.ut-content-container > div > div.ut-pinned-list > div.ut-item-search-view > div.inline-list-select.ut-player-search-control > div > div.ut-player-search-control--input-container > input', page);
                    //returns to transfer search menu
                    won = 0;
                }
                negativeNotifications = 0;
                hitSearch = false;
                await page.waitFor(500);
                //console.log('search refresh');
            }

        }
        catch (err) {
            console.log('error');
            console.log(err)
            await page.screenshot({ path: 'Ierror.png' });
            let errorElement = await page.$('body > div.view-modal-container.form-modal > section > header > h1')
            if(errorElement!=null){
            let errorText = await page.evaluate(errorElement => errorElement.textContent, errorElement)
            console.log('Errortext  ' + errorText)
            }
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
                    await page.type('#password', config.config[0].Fifa_Account_1_Password);
                    let passwordInputElement = await page.$('#password');
                    let passwordInput = await page.evaluate(passwordInputElement => passwordInputElement.value, passwordInputElement);
                    if (passwordInput != config.config[0].Fifa_Account_1_Password) {
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
                const frame=await page.frames()[0]
                await frame.click('#html-verify-btn')
                await page.screenshot({path:'Isolved.png'})
            }
            else if(error=='too many actions taken'){
                await page.waitFor(1000*60*15)
            }
            else if(errorElement!=null) {
                await page.waitFor(500)
                await page.click('body > div.view-modal-container.form-modal > section > div > div > button:nth-child(1) > span.btn-text')
                await page.screenshot({ path: 'highestbidderalready.png' })
            }
        }
    }//end of firstSearch while
    console.log('first search first ' + firstSearch);




})();


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////PAGE BREAK






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