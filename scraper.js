const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });
const cheerio = require('cheerio');
const getHTMLBody = require('./functions/getBody'); 
const getSchemaStructure = require('./functions/fetchSchema'); 
const { getProductName, getProductPrice, getProductCurrency, getProductImages } = require('./functions/fetchNonSchema'); 


async function fetchProductData(url) {
    const shop = url.split('/')[2]

    let result = {
        'Domain-Name': shop,
        'Product-Url': url,
        'Product': {
            'Name': '',
            'Price': '',
            'Currency': '',
            'Images': []
        },
    }

    const body = await getHTMLBody(url)
    const $ = cheerio.load(body);

    result.Product = getSchemaStructure(body);

    if(!result.Product.Name) {
        const name = getProductName(body);
        if (name) {
            result.Product.Name = name
        }
        else {
            result.Product.Name = 'Not Found'
        }
    }
    
    if(!result.Product.Price) {
        const price = getProductPrice(body);
        if (price) {
            result.Product.Price = price
        }
        else {
            result.Product.Price = 'Not Found'
        }
    }

    if(!result.Product.Currency) {
        const currency = getProductCurrency(body);
        if(currency) {
            result.Product.Currency = currency
        }
        else {
            result.Product.Currency = 'Not Found'
        }
    }

    const images = getProductImages(body);
    console.log(images)
    if(images) {
        if(!result.Product.Images) {
            result.Product.Images = images
        }
        else {
            result.Product.Images.concat(images)
        }

    }
    result.Product.Images = result.Product.Images.flat()

    if(result.Product.Images.lenght == 0) {
        result.Product.Images = 'Not Found'
    }

    return result;
}

readline.question(`Paste product url:`, url => {
    try {
        fetchProductData(url).then(data => {
            console.log(data)
        })
    } catch (error) {
        console.log(error)
    }
    readline.close();
  });
