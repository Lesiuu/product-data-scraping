const cheerio = require('cheerio');

module.exports = function getSchemaStructure(body) {
    const $ = cheerio.load(body)
    let product = {}

    const scriptTag = $('script[type="application/ld+json"]');
    if (scriptTag.html()) {
        scriptTag.each((index, element) => {
            if ($(element).html()) {
                const productData = findTypeProductData(JSON.parse($(element).html().replace(/\n/g, '')))
                if(productData) {
                    const name = productData.name
                    product.Name  = name;
                    const priceSpecification = (function getPriceFromStructure(productData) {
                        let offer;
                        if(typeof productData.offers === 'object') {
                            offer = productData.offers
                        }

                        if(Array.isArray(productData.offers)) {
                            offer = productData.offers[0]
                        }
                        if(offer.price) {
                            return [offer.price, offer.priceCurrency];
                        }
                        if(offer.priceSpecification) {
                            if(Array.isArray(offer.priceSpecification)) {
                                let price;
                                (offer.priceSpecification.forEach(element => {
                                    if(element.priceType) {
                                        price = element.price;
                                        currency = element.priceCurrency
                                    }
                                }));
                                return [price, currency];
                            } 
                            if(typeof offer.priceSpecification === 'object') {
                                return [offer.priceSpecification.price, offer.priceSpecification.priceCurrency];
                            }
                            
                        }
                        if(offer.offers) {
                            return getPriceFromStructure(offer);
                        }
                    })(productData)

                    product.Price = priceSpecification[0]
                    product.Currency = priceSpecification[1]

                    const images = productData.image
                    product.Images = [images]
                }
            }
        })
    }
    function findTypeProductData(data) {
        if (data === null) {
            return null;
        }
        if (Array.isArray(data)) {
            for (const item of data) {
                const result = findTypeProductData(item);
                if (result && result.offers) return result;
            }
        } 
        if (typeof data === 'object') {
            if (data["@type"] === "Product" && data.offers) return data;
    
            if (data["@graph"]) return findTypeProductData(data["@graph"]);
        }
        return null;
    }

    return product;
}
