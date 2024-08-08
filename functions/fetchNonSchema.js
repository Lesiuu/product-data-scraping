const cheerio = require('cheerio');

function getProductName(body) {
    const $ = cheerio.load(body);
    const ogTitle = $('meta[property="og:title"]').attr('content');
    if (ogTitle) {
        return ogTitle;
    }
    const titleText = $('head > title').text().trim();
    if(titleText){
        return titleText;
    }
}

function getProductPrice(body) {
    const $ = cheerio.load(body);

    const metaSaleProperty = $('meta[property="product:sale_price:amount"]').attr('content')
    if(metaSaleProperty) {
        return metaSaleProperty;
    }
    const metaProperty = $('meta[property="product:price:amount"]').attr('content')
    if(metaProperty) {
        return metaProperty;
    }
    const itempropAtrr = $('[itemprop="price"]').attr('content')
    if(itempropAtrr) {
        return itempropAtrr;
    }    
    const itemprop = $('[itemprop="price"]').text().trim().replace(/\n/g, '')
    if(itemprop) {
        return itemprop;
    }
    const scripts = $('script')
    let ecomm_totalvalue;
    scripts.each((element) => {
        const content = $(element).html()
        const googleTag = content.includes('ecomm_totalvalue')
        if(googleTag) {
            const pattern = /['"]?ecomm_totalvalue['"]?\s*:\s*['"]?(\d+(\.\d+)?)(['"]?)/;
            const match = content.match(pattern);
            ecomm_totalvalue = match[1];
        }
    })
    return ecomm_totalvalue;
}

function getProductCurrency(body) {
    const $ = cheerio.load(body)
    const metaItempropCurrency = $('meta[itemprop="priceCurrency"]').attr('content')
    if(metaItempropCurrency) {
        return metaItempropCurrency;
    }

    const metaPropertyCurrency = $('meta[property="product:price:currency"]').attr('content')
    if(metaPropertyCurrency) {
        return metaPropertyCurrency;
    }
}

function getProductImages(body) {
    const $ = cheerio.load(body)
    let images = []
    $('[itemprop="image"]').each((index, element) => {
        const srcImage = $(element).attr('src') 
        if(srcImage) {
            images.push(srcImage)
        }
        const contentImage = $(element).attr('content') 
        if(contentImage) {
            images.push(contentImage)
        }
    })
    $('meta[property="og:image"]').each((index, element) => {
    const ogImage = $(element).attr('content') 
    if (ogImage) {
        images.push(ogImage)
    }
    })

    return images;
}

module.exports = { getProductName, getProductPrice, getProductCurrency, getProductImages}