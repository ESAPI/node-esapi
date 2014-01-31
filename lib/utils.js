'use strict';

function contains(arr, val) {
    return arr.some(function (elem) {
        if(( val.equals && val.equals(e) ) || elem === val) {
            return true;
        }
    });
}

module.exports.contains = contains;

function containsKey(arr, key) {
    if(typeof key === 'string') {
        var comp = key.toLowerCase();
        return arr.some(function (elem, index) {
            if(comp === index || (typeof index === 'string' && comp === index.toLowerCase())) {
                return true;
            }
        });
    }
    return false;
}

module.exports.containsKey = containsKey;

function middleware(req, res, next) {
    switch(req.url) {
        case '/esapi/esapi.js':
            res.sendfile(__dirname + '/public/esapi.js');
            break;
        case '/esapi/esapi-compressed.js':
            res.sendfile(__dirname + '/public/esapi-compressed.js');
            break;
        case '/esapi/resources/Base.esapi.properties.js':
            res.sendfile(__dirname + '/public/resources/Base.esapi.properties.js');
            break;
        case '/esapi/resources/i18n/ESAPI_Standard_en_US.properties.js':
            res.sendfile(__dirname + '/public/resources/i18n/ESAPI_Standard_en_US.properties.js');
            break;
        default:
            next();
            break;
    }
}

module.exports.middleware = middleware;