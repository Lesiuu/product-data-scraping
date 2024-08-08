const puppeteer = require('puppeteer');

async function useWebdriver(url) {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--incognito',
        ]
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Brave";v="126"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Accept-Language': 'en-US,en;q=0.5'
    });

    await page.setRequestInterception(true);
    page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['stylesheet', 'font', 'media'].includes(resourceType)) {
            req.abort();
        } else {
            req.continue();
        }
    });


    await page.goto(url, { waitUntil: 'networkidle2'});

    const content = await page.content();
    await browser.close();
    return content;
}

module.exports = { useWebdriver }