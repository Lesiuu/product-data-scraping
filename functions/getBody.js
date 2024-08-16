const cheerio = require('cheerio');
const axios = require('axios');

const { useWebdriver } = require('./useWebDriver')

module.exports = async function getHTMLBody(url) {
    let headers = {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Sec-Ch-Ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Brave\";v=\"126\"",
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": "\"Windows\"",
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    }

    try {
        const firstRequest = await axios.get(url, {headers: headers})
        const $ = cheerio.load(firstRequest.data);

        const metaRefresh = $('meta[http-equiv="refresh"]');
        if(metaRefresh.length > 0) {
            retryWithCookies($, firstRequest);
        }
        else {
            return (firstRequest.data);
        }
    }
    catch (error) {
        if(error.code === 'ERR_BAD_REQUEST') {
            return useWebdriver(url)
        }
    }
}

async function retryWithCookies($, firstRequest) {
    const metaContent = $('meta[http-equiv="refresh"]').attr('content')
    const redirect = url + '?&' + metaContent.substring(metaContent.lastIndexOf('bm-verify'), metaContent.length - 1)
    headers.Cookie = firstRequest.headers['set-cookie'][0]

    const secondRequest = await axios.get(redirect,{headers: headers}).catch(error => {
        console.log(`2`,error)
    })
    return (secondRequest.data); 
}