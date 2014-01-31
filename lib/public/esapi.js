/*
 * OWASP Enterprise Security API (ESAPI)
 *
 * This file is part of the Open Web Application Security Project (OWASP)
 * Enterprise Security API (ESAPI) project. For details, please see
 * <a href="http://www.owasp.org/index.php/ESAPI">http://www.owasp.org/index.php/ESAPI</a>.
 *
 * Copyright (c) 2008 - The OWASP Foundation
 *
 * The ESAPI is published by OWASP under the BSD license. You should read and accept the
 * LICENSE before you use, modify, and/or redistribute this software.
 */


// Utility and Core API Methods
var $namespace = function(name, separator, container){
    var ns = name.split(separator || '.'),
        o = container || window,
        i,
        len;
    for(i = 0, len = ns.length; i < len; i++){
        o = o[ns[i]] = o[ns[i]] || {};
    }
    return o;
};

var $type = function( oVar, oType ) {
    if ( !oVar instanceof oType ) {
        throw new SyntaxError();
    }
};

if (!$) {
    var $ = function( sElementID ) {
        return document.getElementById( sElementID );
    };
}

if (!Array.prototype.each) {
    Array.prototype.each = function(fIterator) {
        if (typeof fIterator != 'function') {
            throw 'Illegal Argument for Array.each';
        }

        for (var i = 0; i < this.length; i ++) {
            fIterator(this[i]);
        }
    };
}

if (!Array.prototype.contains) {
    Array.prototype.contains = function(srch) {
        var found = false;
        this.each(function(e) {
            if ( ( srch.equals && srch.equals(e) ) || e == srch) {
                found = true;
                return;
            }
        });
        return found;
    };
}

if (!Array.prototype.containsKey) {
    Array.prototype.containsKey = function(srch) {
        for ( var key in this ) {
            if ( key.toLowerCase() == srch.toLowerCase() ) {
                return true;
            }
        }
        return false;
    };
}

if (!Array.prototype.getCaseInsensitive) {
    Array.prototype.getCaseInsensitive = function(key) {
        for (var k in this) {
            if (k.toLowerCase() == key.toLowerCase()) {
                return this[k];
            }
        }
        return null;
    };
}

if (!String.prototype.charCodeAt) {
    String.prototype.charCodeAt = function( idx ) {
        var c = this.charAt(idx);
        for ( var i=0;i<65536;i++) {
            var s = String.fromCharCode(i);
            if ( s == c ) { return i; }
        }
        return 0;
    };
}

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function( test ) {
        return this.substr( ( this.length - test.length ), test.length ) == test;
    };
}

// Declare Core Exceptions
if ( !Exception ) {
    var Exception = function( sMsg, oException ) {
        this.cause = oException;
        this.errorMessage = sMsg;
    };

    Exception.prototype = Error.prototype;

    Exception.prototype.getCause = function() { return this.cause; };

    Exception.prototype.getMessage = function() { return this.message; };

    /**
     * This method creates the stacktrace for the Exception only when it is called the first time and
     * caches it for access after that. Since building a stacktrace is a fairly expensive process, we
     * only want to do it if it is called.
     */
    Exception.prototype.getStackTrace = function() {
        if ( this.callstack ) {
            return this.callstack;
        }

        if ( this.stack ) { // Mozilla
            var lines = stack.split("\n");
            for ( var i=0, len=lines.length; i<len; i ++ ) {
                if ( lines[i].match( /^\s*[A-Za-z0-9\=+\$]+\(/ ) ) {
                    this.callstack.push(lines[i]);
                }
            }
            this.callstack.shift();
            return this.callstack;
        }
        else if ( window.opera && this.message ) { // Opera
            var lines = this.message.split('\n');
            for ( var i=0, len=lines.length; i<len; i++ ) {
                if ( lines[i].match( /^\s*[A-Za-z0-9\=+\$]+\(/ ) ) {
                    var entry = lines[i];
                    if ( lines[i+1] ) {
                        entry += " at " + lines[i+1];
                        i++;
                    }
                    this.callstack.push(entry);
                }
            }
            this.callstack.shift();
            return this.callstack;
        }
        else { // IE and Safari
            var currentFunction = arguments.callee.caller;
            while ( currentFunction ) {
                var fn = currentFunction.toString();
                var fname = fn.substring(fn.indexOf("function")+8,fn.indexOf("(")) || "anonymous";
                this.callstack.push(fname);
                currentFunction = currentFunction.caller;
            }
            return this.callstack;
        }
    };

    Exception.prototype.printStackTrace = function( writer ) {
        var out = this.getMessage() + "|||" + this.getStackTrace().join( "|||" );

        if ( this.cause ) {
            if ( this.cause.printStackTrace ) {
                out += "||||||Caused by " + this.cause.printStackTrace().replace( "\n", "|||" );
            }
        }

        if ( !writer ) {
            return writer.replace( "|||", "\n" );
        } else if ( writer.value ) {
            writer.value = out.replace( "|||", "\n" );
        } else if ( writer.writeln ) {
            writer.writeln( out.replace( "|||", "\n" ) );
        } else if ( writer.innerHTML ) {
            writer.innerHTML = out.replace( "|||", "<br/>" );
        } else if ( writer.innerText ) {
            writer.innerText = out.replace( "|||", "<br/>" );
        } else if ( writer.append ) {
            writer.append( out.replace( "|||", "\n" ) );
        } else if ( writer instanceof Function ) {
            writer(out.replace( "|||", "\n" ) );
        }
    };
}

if ( !RuntimeException ) {
    var RuntimeException = Exception;
}

if ( !IllegalArgumentException ) {
    var IllegalArgumentException = Exception;
}

if ( !DateFormat ) {
    // Based on http://jacwright.com/projects/javascript/date_format
    var DateFormat = function( sFmt ) {

        var fmt = sFmt;

        var replaceChars = {
            longMonths: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
            shortMonths: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
            longDays: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
            shortDays: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],

            // Day
            d: function(date) { return (date.getDate() < 10 ? '0' : '') + date.getDate(); },
            D: function(date) { return replaceChars.shortDays[date.getDay()]; },
            j: function(date) { return date.getDate(); },
            l: function(date) { return replaceChars.longDays[date.getDay()]; },
            N: function(date) { return date.getDay() + 1; },
            S: function(date) { return (date.getDate() % 10 == 1 && date.getDate() != 11 ? 'st' : (date.getDate() % 10 == 2 && date.getDate() != 12 ? 'nd' : (date.getDate() % 10 == 3 && date.getDate() != 13 ? 'rd' : 'th'))); },
            w: function(date) { return date.getDay(); },
            z: function(date) { return "Not Yet Supported"; },
            // Week
            W: function(date) { return "Not Yet Supported"; },
            // Month
            F: function(date) { return replaceChars.longMonths[date.getMonth()]; },
            m: function(date) { return (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1); },
            M: function(date) { return replaceChars.shortMonths[date.getMonth()]; },
            n: function(date) { return date.getMonth() + 1; },
            t: function(date) { return "Not Yet Supported"; },
            // Year
            L: function(date) { return (((date.getFullYear()%4==0)&&(date.getFullYear()%100 != 0)) || (date.getFullYear()%400==0)) ? '1' : '0'; },
            o: function(date) { return "Not Supported"; },
            Y: function(date) { return date.getFullYear(); },
            y: function(date) { return ('' + date.getFullYear()).substr(2); },
            // Time
            a: function(date) { return date.getHours() < 12 ? 'am' : 'pm'; },
            A: function(date) { return date.getHours() < 12 ? 'AM' : 'PM'; },
            B: function(date) { return "Not Yet Supported"; },
            g: function(date) { return date.getHours() % 12 || 12; },
            G: function(date) { return date.getHours(); },
            h: function(date) { return ((date.getHours() % 12 || 12) < 10 ? '0' : '') + (date.getHours() % 12 || 12); },
            H: function(date) { return (date.getHours() < 10 ? '0' : '') + date.getHours(); },
            i: function(date) { return (date.getMinutes() < 10 ? '0' : '') + date.getMinutes(); },
            s: function(date) { return (date.getSeconds() < 10 ? '0' : '') + date.getSeconds(); },
            // Timezone
            e: function(date) { return "Not Yet Supported"; },
            I: function(date) { return "Not Supported"; },
            O: function(date) { return (-date.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(date.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(date.getTimezoneOffset() / 60)) + '00'; },
            P: function(date) { return (-date.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(date.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(date.getTimezoneOffset() / 60)) + ':' + (Math.abs(date.getTimezoneOffset() % 60) < 10 ? '0' : '') + (Math.abs(date.getTimezoneOffset() % 60)); },
            T: function(date) { var m = date.getMonth(); date.setMonth(0); var result = date.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); date.setMonth(m); return result;},
            Z: function(date) { return -date.getTimezoneOffset() * 60; },
            // Full Date/Time
            c: function(date) { return date.format("Y-m-d") + "T" + date.format("H:i:sP"); },
            r: function(date) { return date.toString(); },
            U: function(date) { return date.getTime() / 1000; }
        };


        return {
            format: function(oDate) {
                var out = '';
                for(var i=0;i<fmt.length;i++) {
                    var c = fmt.charAt(i);
                    if ( replaceChars[c] ) {
                        out += replaceChars[c].call(oDate);
                    } else {
                        out += c;
                    }
                }
                return out;
            }
        };
    };

    DateFormat.getDateInstance = function() {
        return new DateFormat("M/d/y h:i a");
    };
}

$namespace('org.owasp.esapi');

org.owasp.esapi.ESAPI = function( oProperties ) {
    var _properties = oProperties;

    if ( !_properties ) throw new RuntimeException("Configuration Error - Unable to load $ESAPI_Properties Object");

    var _encoder = null;
    var _validator = null;
    var _logFactory = null;
    var _resourceBundle = null;
    var _httputilities = null;

    return {
        properties: _properties,

        encoder: function() {
            if (!_encoder) {
                if (!_properties.encoder.Implementation) throw new RuntimeException('Configuration Error - $ESAPI.properties.encoder.Implementation object not found.');
                _encoder = new _properties.encoder.Implementation();
            }
            return _encoder;
        },

        logFactory: function() {
            if ( !_logFactory ) {
                if (!_properties.logging.Implementation) throw new RuntimeException('Configuration Error - $ESAPI.properties.logging.Implementation object not found.');
                _logFactory = new _properties.logging.Implementation();
            }
            return _logFactory;
        },

        logger: function(sModuleName) {
            return this.logFactory().getLogger(sModuleName);
        },

        locale: function() {
            return org.owasp.esapi.i18n.Locale.getLocale( _properties.localization.DefaultLocale );
        },

        resourceBundle: function() {
            if (!_resourceBundle) {
                if(!_properties.localization.StandardResourceBundle) throw new RuntimeException("Configuration Error - $ESAPI.properties.localization.StandardResourceBundle not found.");
                _resourceBundle = new org.owasp.esapi.i18n.ObjectResourceBundle( _properties.localization.StandardResourceBundle );
            }
            return _resourceBundle;
        },

        validator: function() {
            if (!_validator) {
                if (!_properties.validation.Implementation) throw new RuntimeException('Configuration Error - $ESAPI.properties.validation.Implementation object not found.');
                _validator = new _properties.validation.Implementation();
            }
            return _validator;
        },

        httpUtilities: function() {
            if (!_httputilities) _httputilities = new org.owasp.esapi.HTTPUtilities();
            return _httputilities;
        }
    };
};

var $ESAPI = null;

org.owasp.esapi.ESAPI.initialize = function() {
    $ESAPI = new org.owasp.esapi.ESAPI( Base.esapi.properties );
};

$namespace('org.owasp.esapi');

org.owasp.esapi.Encoder = function() {

}

$namespace('org.owasp.esapi');

org.owasp.esapi.EncoderConstants = {
    CHAR_LOWERS: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ],
    CHAR_UPPERS: [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ],
    CHAR_DIGITS: [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ],
    CHAR_SPECIALS: [ '!', '$', '*', '+', '-', '.', '=', '?', '@', '^', '_', '|', '~' ],
    CHAR_LETTERS: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ],
    CHAR_ALNUM: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ]
};

$namespace('org.owasp.esapi');

org.owasp.esapi.EnterpriseSecurityException = function(sUserMessage, sLogMessage, oException) {
    var _logMessage = sLogMessage;
    var _super = new Exception(sUserMessage, oException);

    return {
        getMessage: _super.getMessage,
        getUserMessage: _super.getMessage,
        getLogMessage: function() {
            return _logMessage;
        },
        getStackTrace: _super.getStackTrace,
        printStackTrace: _super.printStackTrace
    };
};

$namespace('org.owasp.esapi');

org.owasp.esapi.HTTPUtilities = function() {
    var log = $ESAPI.logger("HTTPUtilities");
    var resourceBundle = $ESAPI.resourceBundle();
    var EventType = org.owasp.esapi.Logger.EventType;

    return {
        addCookie: function( oCookie ) {
            $type(oCookie,org.owasp.esapi.net.Cookie);

            if ( window.top.location.protocol != 'http:' || window.top.location.protocol != 'https:' )
                throw new RuntimeException(resourceBundle.getString( "HTTPUtilities.Cookie.Protocol", {"protocol":window.top.location.protocol}));

            var name = oCookie.getName(),
                value = oCookie.getValue(),
                maxAge = oCookie.getMaxAge(),
                domain = oCookie.getDomain(),
                path = oCookie.getPath(),
                secure = oCookie.getSecure();

            var validationErrors = new org.owasp.esapi.ValidationErrorList();
            var cookieName = $ESAPI.validator().getValidInput("cookie name", name, "HttpCookieName", 50, false, validationErrors );
            var cookieValue = $ESAPI.validator().getValidInput("cookie value", value, "HttpCookieValue", 5000, false, validationErrors );

            if (validationErrors.size() == 0) {
                var header = name+'='+escape(value);
                header += maxAge?";expires=" + ( new Date( ( new Date() ).getTime() + ( 1000 * maxAge ) ).toGMTString() ) : "";
                header += path?";path="+path:"";
                header += domain?";domain="+domain:"";
                header += secure||$ESAPI.properties.httputilities.cookies.ForceSecure?";secure":"";
                document.cookie=header;
            }
            else
            {
                log.warning(EventType.SECURITY_FAILURE, resourceBundle.getString("HTTPUtilities.Cookie.UnsafeData", { 'name':name, 'value':value } ) );
            }
        },

        /**
         * Returns a {@link org.owasp.esapi.net.Cookie} containing the name and value of the requested cookie.
         *
         * IMPORTANT: The value of the cookie is not sanitized at this level. It is the responsibility of the calling
         * code to sanitize the value for proper output encoding prior to using it.
         *
         * @param sName {String} The name of the cookie to retrieve
         * @return {org.owasp.esapi.net.Cookie}
         */
        getCookie: function(sName) {
            var cookieJar = document.cookie.split("; ");
            for(var i=0,len=cookieJar.length;i<len;i++) {
                var cookie = cookieJar[i].split("=");
                if (cookie[0] == escape(sName)) {
                    return new org.owasp.esapi.net.Cookie( sName, cookie[1]?unescape(cookie[1]):'' );
                }
            }
            return null;
        },

        /**
         * Will attempt to kill any cookies associated with the current request (domain,path,secure). If a cookie cannot
         * be deleted, a RuntimeException will be thrown.
         *
         * @throws RuntimeException if one of the cookies cannot be deleted.
         */
        killAllCookies: function() {
            var cookieJar = document.cookie.split("; ");
            for(var i=0,len=cookieJar.length;i<len;i++) {
                var cookie = cookieJar[i].split("=");
                var name = unescape(cookie[0]);
                // RuntimeException will bubble through if the cookie cannot be deleted
                if (!this.killCookie(name)) {
                    // Something is wrong - cookieJar contains a cookie that is inaccesible using getCookie
                    throw new RuntimeException(resourceBundle.getString("HTTPUtilities.Cookie.CantKill", {"name":name}));
                }
            }
        },

        /**
         * Will kill a single cookie. If that cookie cannot be deleted a RuntimeException will be thrown
         * @param sName {String} The name of the cookie
         */
        killCookie: function(sName) {
            var c = this.getCookie(sName);
            if ( c ) {
                c.setMaxAge( -10 );
                this.addCookie(c);
                if (this.getCookie(sName)) {
                    throw new RuntimeException(resourceBundle.getString("HTTPUtilities.Cookie.CantKill", {"name":sName}));
                }
                return true;
            }
            return false;
        },

        /**
         * This only works for GET parameters and is meerly a convenience method for accessing that information if need be
         * @param sName {String} The name of the parameter to retrieve
         */
        getRequestParameter: function( sName ) {
            var url = window.top.location.search.substring(1);
            var pIndex = url.indexOf(sName);
            if (pIndex<0) return null;
            pIndex=pIndex+sName.length;
            var lastIndex=url.indexOf("&",pIndex);
            if (lastIndex<0) lastIndex=url.length;
            return unescape(url.substring(pIndex,lastIndex));
        }
    };
};

$namespace('org.owasp.esapi');

org.owasp.esapi.IntrusionException = function(sUserMessage, sLogMessage, oCause) {
    var _super = new org.owasp.esapi.EnterpriseSecurityException(sUserMessage, sLogMessage, oCause);

    return {
        getMessage: _super.getMessage,
        getUserMessage: _super.getMessage,
        getLogMessage: _super.getLogMessage,
        getStackTrace: _super.getStackTrace,
        printStackTrace: _super.printStackTrace
    };
};

$namespace('org.owasp.esapi');

org.owasp.esapi.LogFactory = function() {
    return {
        getLogger: false
    };
}

$namespace('org.owasp.esapi');

org.owasp.esapi.Logger = function() {
    return {
        setLevel: false,
        fatal: false,
        error: false,
        isErrorEnabled: false,
        warning: false,
        isWarningEnabled: false,
        info: false,
        isInfoEnabled: false,
        debug: false,
        isDebugEnabled: false,
        trace: false,
        isTraceEnabled: false
    };
};

org.owasp.esapi.Logger.EventType = function( sName, bNewSuccess ) {
    var type = sName;
    var success = bNewSuccess;

    return {
        isSuccess: function() {
            return success;
        },

        toString: function() {
            return type;
        }
    };
};

with(org.owasp.esapi.Logger) {

    EventType.SECURITY_SUCCESS = new EventType( "SECURITY SUCCESS", true );
    EventType.SECURITY_FAILURE = new EventType( "SECURITY FAILURE", false );
    EventType.EVENT_SUCCESS    = new EventType( "EVENT SUCCESS", true );
    EventType.EVENT_FAILURE    = new EventType( "EVENT FAILURE", false );

    OFF = Number.MAX_VALUE;
    FATAL = 1000;
    ERROR = 800;
    WARNING = 600;
    INFO = 400;
    DEBUG = 200;
    TRACE = 100;
    ALL = Number.MIN_VALUE;
}

$namespace('org.owasp.esapi');

org.owasp.esapi.PreparedString = function(sTemplate, oCodec, sParameterCharacter) {
    // Private Scope
    var parts = [];
    var parameters = [];

    function split(s) {
        var idx = 0, pcount = 0;
        for (var i = 0; i < s.length; i ++) {
            if (s.charAt(i) == sParameterCharacter) {
                pcount ++;
                parts.push(s.substr(idx, i));
                idx = i + 1;
            }
        }
        parts.push(s.substr(idx));
        parameters = new Array(pcount);
    }

    ;

    if (!sParameterCharacter) {
        sParameterCharacter = '?';
    }

    split(sTemplate);

    return {
        set: function(iIndex, sValue, codec) {
            if (iIndex < 1 || iIndex > parameters.length) {
                throw new IllegalArgumentException("Attempt to set parameter: " + iIndex + " on a PreparedString with only " + parameters.length + " placeholders");
            }
            if (!codec) {
                codec = oCodec;
            }
            parameters[iIndex - 1] = codec.encode([], sValue);
        },

        toString: function() {
            for (var ix = 0; ix < parameters.length; ix ++) {
                if (parameters[ix] == null) {
                    throw new RuntimeException("Attempt to render PreparedString without setting parameter " + (ix + 1));
                }
            }
            var out = '', i = 0;
            for (var p = 0; p < parts.length; p ++) {
                out += parts[p];
                if (i < parameters.length) {
                    out += parameters[i++];
                }
            }
            return out;
        }
    };
};


$namespace('org.owasp.esapi');

org.owasp.esapi.ValidationErrorList = function() {
    var errorList = Array();

    return {
        addError: function( sContext, oValidationException ) {
            if ( sContext == null ) throw new RuntimeException( "Context cannot be null: " + oValidationException.getLogMessage(), oValidationException );
            if ( oValidationException == null ) throw new RuntimeException( "Context (" + sContext + ") - Error cannot be null" );
            if ( errorList[sContext] ) throw new RuntimeException( "Context (" + sContext + ") already exists. must be unique." );
            errorList[sContext] = oValidationException;
        },

        errors: function() {
            return errorList;
        },

        isEmpty: function() {
            return errorList.length == 0;
        },

        size: function() {
            return errorList.length;
        }
    };
};


$namespace('org.owasp.esapi');

org.owasp.esapi.ValidationRule = function() {
    return {
        getValid: false,
        setAllowNull: false,
        getTypeName: false,
        setTypeName: false,
        setEncoder: false,
        assertValid: false,
        getSafe: false,
        isValid: false,
        whitelist: false
    };
};


$namespace('org.owasp.esapi');

org.owasp.esapi.Validator = function() {
    return {
        addRule: false,
        getRule: false,
        getValidInput: false,
        isValidDate: false,
        getValidDate: false,
        isValidSafeHTML: false,
        getValidSafeHTML: false,
        isValidCreditCard: false,
        getValidCreditCard: false,
        isValidFilename: false,
        getValidFilename: false,
        isValidNumber: false,
        getValidNumber: false,
        isValidPrintable: false,
        getValidPrintable: false
    };
};


$namespace('org.owasp.esapi.codecs.Base64');

org.owasp.esapi.codecs.Base64 = {
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    encode: function(sInput) {
        if (!sInput) {
            return null;
        }

        var out = '';
        var ch1,ch2,ch3,enc1,enc2,enc3,enc4;
        var i = 0;

        var input = org.owasp.esapi.codecs.UTF8.encode(sInput);

        while (i < input.length) {
            ch1 = input.charCodeAt(i++);
            ch2 = input.charCodeAt(i++);
            ch3 = input.charCodeAt(i++);

            enc1 = ch1 >> 2;
            enc2 = ((ch1 & 3) << 4) | (ch2 >> 4);
            enc3 = ((ch2 & 15) << 2) | (ch3 >> 6);
            enc4 = ch3 & 63;

            if (isNaN(ch2)) {
                enc3 = enc4 = 64;
            }
            else if (isNaN(ch3)) {
                enc4 = 64;
            }

            out += this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }

        return out;
    },

    decode: function(sInput) {
        if (!sInput) {
            return null;
        }

        var out = '';
        var ch1, ch2, ch3, enc1, enc2, enc3, enc4;
        var i = 0;

        var input = sInput.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            ch1 = (enc1 << 2) | (enc2 >> 4);
            ch2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            ch3 = ((enc3 & 3) << 6) | enc4;

            out += String.fromCharCode(ch1);
            if (enc3 != 64) {
                out += String.fromCharCode(ch2);
            }
            if (enc4 != 64) {
                out += String.fromCharCode(ch3);
            }
        }

        out = org.owasp.esapi.codecs.UTF8.decode(out);
        return out;
    }
};


$namespace('org.owasp.esapi.codecs');

org.owasp.esapi.codecs.CSSCodec = function() {
    var _super = new org.owasp.esapi.codecs.Codec();

    return {
        encode: _super.encode,

        decode: _super.decode,

        encodeCharacter: function(aImmune, c) {
            if (aImmune.contains(c)) {
                return c;
            }

            var hex = org.owasp.esapi.codecs.Codec.getHexForNonAlphanumeric(c);
            if (hex == null) {
                return c;
            }

            return "\\" + hex + " ";
        },

        decodeCharacter: function(oPushbackString) {
            oPushbackString.mark();
            var first = oPushbackString.next();
            if (first == null) {
                oPushbackString.reset();
                return null;
            }

            if (first != '\\') {
                oPushbackString.reset();
                return null;
            }

            var second = oPushbackString.next();
            if (second == null) {
                oPushbackString.reset();
                return null;
            }

            if (oPushbackString.isHexDigit(second)) {
                var out = second;
                for (var i = 0; i < 6; i ++) {
                    var c = oPushbackString.next();
                    if (c == null || c.charCodeAt(0) == 0x20) {
                        break;
                    }
                    if (oPushbackString.isHexDigit(c)) {
                        out += c;
                    } else {
                        input.pushback(c);
                        break;
                    }
                }

                try {
                    var n = parseInt(out, 16);
                    return String.fromCharCode(n);
                } catch (e) {
                    oPushbackString.reset();
                    return null;
                }
            }

            return second;
        }
    };
};


$namespace('org.owasp.esapi.codecs');

org.owasp.esapi.codecs.Codec = function() {
    return {
        /**
         * Encode a String so that it can be safely used in a specific context.
         *
         * @param aImmune
         *              array of immune characters
         * @param sInput
         *              the String to encode
         * @return the encoded String
         */
        encode: function(aImmune, sInput) {
            var out = '';
            for (var i = 0; i < sInput.length; i ++) {
                var c = sInput.charAt(i);
                out += this.encodeCharacter(aImmune, c);
            }
            return out;
        },

        /**
         * Default implementation that should be overridden in specific codecs.
         *
         * @param aImmune
         *              array of immune characters
         * @param c
         *              the Character to encode
         * @return
         *              the encoded Character
         */
        encodeCharacter: function(aImmune, c) {
            return c;
        },

        /**
         * Decode a String that was encoded using the encode method in this Class
         *
         * @param sInput
         *              the String to decode
         * @return
         *              the decoded String
         */
        decode: function(sInput) {
            var out = '';
            var pbs = new org.owasp.esapi.codecs.PushbackString(sInput);
            while (pbs.hasNext()) {
                var c = this.decodeCharacter(pbs);
                if (c != null) {
                    out += c;
                } else {
                    out += pbs.next();
                }
            }
            return out;
        },

        /**
         * Returns the decoded version of the next character from the input string and advances the
         * current character in the PushbackString.  If the current character is not encoded, this
         * method MUST reset the PushbackString.
         *
         * @param oPushbackString the Character to decode
         * @return the decoded Character
         */
        decodeCharacter: function(oPushbackString) {
            return oPushbackString.next();
        }
    };
};

org.owasp.esapi.codecs.Codec.getHexForNonAlphanumeric = function(c) {
    if (c.charCodeAt(0) < 256) {
        return org.owasp.esapi.codecs.Codec.hex[c.charCodeAt(0)];
    }
    return c.charCodeAt(0).toString(16);
};

org.owasp.esapi.codecs.Codec.hex = [];
for ( var c = 0; c < 0xFF; c ++ ) {
    if ( c >= 0x30 && c <= 0x39 || c>= 0x41 && c <= 0x5A || c >= 0x61 && c <= 0x7A ) {
        org.owasp.esapi.codecs.Codec.hex[c] = null;
    } else {
        org.owasp.esapi.codecs.Codec.hex[c] = c.toString(16);
    }
};

var entityToCharacterMap = [];
entityToCharacterMap["&quot"]        = "34";      /* 34 : quotation mark */
entityToCharacterMap["&amp"]         = "38";      /* 38 : ampersand */
entityToCharacterMap["&lt"]          = "60";        /* 60 : less-than sign */
entityToCharacterMap["&gt"]          = "62";        /* 62 : greater-than sign */
entityToCharacterMap["&nbsp"]        = "160";      /* 160 : no-break space */
entityToCharacterMap["&iexcl"]       = "161";     /* 161 : inverted exclamation mark */
entityToCharacterMap["&cent"]			= "162";	/* 162  : cent sign */
entityToCharacterMap["&pound"]			= "163";	/* 163  : pound sign */
entityToCharacterMap["&curren"]			= "164";	/* 164  : currency sign */
entityToCharacterMap["&yen"]			= "165";	/* 165  : yen sign */
entityToCharacterMap["&brvbar"]			= "166";	/* 166  : broken bar */
entityToCharacterMap["&sect"]			= "167";	/* 167  : section sign */
entityToCharacterMap["&uml"]			= "168";	/* 168  : diaeresis */
entityToCharacterMap["&copy"]			= "169";	/* 169  : copyright sign */
entityToCharacterMap["&ordf"]			= "170";	/* 170  : feminine ordinal indicator */
entityToCharacterMap["&laquo"]          = "171";    /* 171 : left-pointing double angle quotation mark */
entityToCharacterMap["&not"]			= "172";	/* 172  : not sign */
entityToCharacterMap["&shy"]			= "173";	/* 173  : soft hyphen */
entityToCharacterMap["&reg"]			= "174";	/* 174  : registered sign */
entityToCharacterMap["&macr"]			= "175";	/* 175  : macron */
entityToCharacterMap["&deg"]			= "176";	/* 176  : degree sign */
entityToCharacterMap["&plusmn"]         = "177";    /* 177 : plus-minus sign */
entityToCharacterMap["&sup2"]			= "178";	/* 178  : superscript two */
entityToCharacterMap["&sup3"]			= "179";	/* 179  : superscript three */
entityToCharacterMap["&acute"]			= "180";	/* 180  : acute accent */
entityToCharacterMap["&micro"]			= "181";	/* 181  : micro sign */
entityToCharacterMap["&para"]			= "182";	/* 182  : pilcrow sign */
entityToCharacterMap["&middot"]			= "183";	/* 183  : middle dot */
entityToCharacterMap["&cedil"]			= "184";	/* 184  : cedilla */
entityToCharacterMap["&sup1"]			= "185";	/* 185  : superscript one */
entityToCharacterMap["&ordm"]			= "186";	/* 186  : masculine ordinal indicator */
entityToCharacterMap["&raquo"]          = "187";    /* 187 : right-pointing double angle quotation mark */
entityToCharacterMap["&frac14"]			= "188";	/* 188  : vulgar fraction one quarter */
entityToCharacterMap["&frac12"]			= "189";	/* 189  : vulgar fraction one half */
entityToCharacterMap["&frac34"]			= "190";	/* 190  : vulgar fraction three quarters */
entityToCharacterMap["&iquest"]			= "191";	/* 191  : inverted question mark */
entityToCharacterMap["&Agrave"]			= "192";	/* 192  : Latin capital letter a with grave */
entityToCharacterMap["&Aacute"]			= "193";	/* 193  : Latin capital letter a with acute */
entityToCharacterMap["&Acirc"]			= "194";	/* 194  : Latin capital letter a with circumflex */
entityToCharacterMap["&Atilde"]			= "195";	/* 195  : Latin capital letter a with tilde */
entityToCharacterMap["&Auml"]			= "196";	/* 196  : Latin capital letter a with diaeresis */
entityToCharacterMap["&Aring"]			= "197";	/* 197  : Latin capital letter a with ring above */
entityToCharacterMap["&AElig"]			= "198";	/* 198  : Latin capital letter ae */
entityToCharacterMap["&Ccedil"]			= "199";	/* 199  : Latin capital letter c with cedilla */
entityToCharacterMap["&Egrave"]			= "200";	/* 200  : Latin capital letter e with grave */
entityToCharacterMap["&Eacute"]			= "201";	/* 201  : Latin capital letter e with acute */
entityToCharacterMap["&Ecirc"]			= "202";	/* 202  : Latin capital letter e with circumflex */
entityToCharacterMap["&Euml"]			= "203";	/* 203  : Latin capital letter e with diaeresis */
entityToCharacterMap["&Igrave"]			= "204";	/* 204  : Latin capital letter i with grave */
entityToCharacterMap["&Iacute"]			= "205";	/* 205  : Latin capital letter i with acute */
entityToCharacterMap["&Icirc"]			= "206";	/* 206  : Latin capital letter i with circumflex */
entityToCharacterMap["&Iuml"]			= "207";	/* 207  : Latin capital letter i with diaeresis */
entityToCharacterMap["&ETH"]			    = "208";	/* 208  : Latin capital letter eth */
entityToCharacterMap["&Ntilde"]			= "209";	/* 209  : Latin capital letter n with tilde */
entityToCharacterMap["&Ograve"]			= "210";	/* 210  : Latin capital letter o with grave */
entityToCharacterMap["&Oacute"]			= "211";	/* 211  : Latin capital letter o with acute */
entityToCharacterMap["&Ocirc"]           = "212";  /* 212 : Latin capital letter o with circumflex */
entityToCharacterMap["&Otilde"]			= "213";	 /* 213 : Latin capital letter o with tilde */
entityToCharacterMap["&Ouml"]			= "214";	 /* 214 : Latin capital letter o with diaeresis */
entityToCharacterMap["&times"]			= "215";	 /* 215 : multiplication sign */
entityToCharacterMap["&Oslash"]			= "216";	 /* 216 : Latin capital letter o with stroke */
entityToCharacterMap["&Ugrave"]			= "217";	 /* 217 : Latin capital letter u with grave */
entityToCharacterMap["&Uacute"]			= "218";	 /* 218 : Latin capital letter u with acute */
entityToCharacterMap["&Ucirc"]			= "219";	 /* 219 : Latin capital letter u with circumflex */
entityToCharacterMap["&Uuml"]			= "220";	 /* 220 : Latin capital letter u with diaeresis */
entityToCharacterMap["&Yacute"]			= "221";	 /* 221 : Latin capital letter y with acute */
entityToCharacterMap["&THORN"]			= "222";	 /* 222 : Latin capital letter thorn */
entityToCharacterMap["&szlig"]           = "223";   /* 223 : Latin small letter sharp s, German Eszett */
entityToCharacterMap["&agrave"]			= "224";	 /* 224 : Latin small letter a with grave */
entityToCharacterMap["&aacute"]			= "225";	 /* 225 : Latin small letter a with acute */
entityToCharacterMap["&acirc"]			= "226";	 /* 226 : Latin small letter a with circumflex */
entityToCharacterMap["&atilde"]			= "227";	 /* 227 : Latin small letter a with tilde */
entityToCharacterMap["&auml"]			= "228";	 /* 228 : Latin small letter a with diaeresis */
entityToCharacterMap["&aring"]			= "229";	 /* 229 : Latin small letter a with ring above */
entityToCharacterMap["&aelig"]			= "230";	 /* 230 : Latin lowercase ligature ae */
entityToCharacterMap["&ccedil"]			= "231";	 /* 231 : Latin small letter c with cedilla */
entityToCharacterMap["&egrave"]			= "232";	 /* 232 : Latin small letter e with grave */
entityToCharacterMap["&eacute"]			= "233";	 /* 233 : Latin small letter e with acute */
entityToCharacterMap["&ecirc"]			= "234";	 /* 234 : Latin small letter e with circumflex */
entityToCharacterMap["&euml"]			= "235";	 /* 235 : Latin small letter e with diaeresis */
entityToCharacterMap["&igrave"]			= "236";	 /* 236 : Latin small letter i with grave */
entityToCharacterMap["&iacute"]			= "237";	 /* 237 : Latin small letter i with acute */
entityToCharacterMap["&icirc"]			= "238";	 /* 238 : Latin small letter i with circumflex */
entityToCharacterMap["&iuml"]			= "239";	 /* 239 : Latin small letter i with diaeresis */
entityToCharacterMap["&eth"]			    = "240";	 /* 240 : Latin small letter eth */
entityToCharacterMap["&ntilde"]			= "241";	 /* 241 : Latin small letter n with tilde */
entityToCharacterMap["&ograve"]			= "242";	 /* 242 : Latin small letter o with grave */
entityToCharacterMap["&oacute"]			= "243";	 /* 243 : Latin small letter o with acute */
entityToCharacterMap["&ocirc"]			= "244";	 /* 244 : Latin small letter o with circumflex */
entityToCharacterMap["&otilde"]			= "245";	 /* 245 : Latin small letter o with tilde */
entityToCharacterMap["&ouml"]			= "246";	 /* 246 : Latin small letter o with diaeresis */
entityToCharacterMap["&divide"]			= "247";	 /* 247 : division sign */
entityToCharacterMap["&oslash"]			= "248";	 /* 248 : Latin small letter o with stroke */
entityToCharacterMap["&ugrave"]			= "249";	 /* 249 : Latin small letter u with grave */
entityToCharacterMap["&uacute"]			= "250";	 /* 250 : Latin small letter u with acute */
entityToCharacterMap["&ucirc"]			= "251";	 /* 251 : Latin small letter u with circumflex */
entityToCharacterMap["&uuml"]			= "252";	 /* 252 : Latin small letter u with diaeresis */
entityToCharacterMap["&yacute"]			= "253";	 /* 253 : Latin small letter y with acute */
entityToCharacterMap["&thorn"]			= "254";	 /* 254 : Latin small letter thorn */
entityToCharacterMap["&yuml"]			= "255";	 /* 255 : Latin small letter y with diaeresis */
entityToCharacterMap["&OElig"]			= "338";	 /* 338 : Latin capital ligature oe */
entityToCharacterMap["&oelig"]			= "339";	 /* 339 : Latin small ligature oe */
entityToCharacterMap["&Scaron"]			= "352";	 /* 352 : Latin capital letter s with caron */
entityToCharacterMap["&scaron"]			= "353";	 /* 353 : Latin small letter s with caron */
entityToCharacterMap["&Yuml"]			= "376";	 /* 376 : Latin capital letter y with diaeresis */
entityToCharacterMap["&fnof"]			= "402";	 /* 402 : Latin small letter f with hook */
entityToCharacterMap["&circ"]			= "710";	 /* 710 : modifier letter circumflex accent */
entityToCharacterMap["&tilde"]			= "732";	 /* 732 : small tilde */
entityToCharacterMap["&Alpha"]			= "913";	 /* 913 : Greek capital letter alpha */
entityToCharacterMap["&Beta"]			= "914";	 /* 914 : Greek capital letter beta */
entityToCharacterMap["&Gamma"]			= "915";	 /* 915 : Greek capital letter gamma */
entityToCharacterMap["&Delta"]			= "916";	 /* 916 : Greek capital letter delta */
entityToCharacterMap["&Epsilon"]			= "917";	 /* 917 : Greek capital letter epsilon */
entityToCharacterMap["&Zeta"]			= "918";	 /* 918 : Greek capital letter zeta */
entityToCharacterMap["&Eta"]			    = "919";	 /* 919 : Greek capital letter eta */
entityToCharacterMap["&Theta"]			= "920";	 /* 920 : Greek capital letter theta */
entityToCharacterMap["&Iota"]			= "921";	 /* 921 : Greek capital letter iota */
entityToCharacterMap["&Kappa"]			= "922";	 /* 922 : Greek capital letter kappa */
entityToCharacterMap["&Lambda"]			= "923";	 /* 923 : Greek capital letter lambda */
entityToCharacterMap["&Mu"]			= "924";	 /* 924 : Greek capital letter mu */
entityToCharacterMap["&Nu"]			= "925";	 /* 925 : Greek capital letter nu */
entityToCharacterMap["&Xi"]			= "926";	 /* 926 : Greek capital letter xi */
entityToCharacterMap["&Omicron"]			= "927";	 /* 927 : Greek capital letter omicron */
entityToCharacterMap["&Pi"]			= "928";	 /* 928 : Greek capital letter pi */
entityToCharacterMap["&Rho"]			= "929";	 /* 929 : Greek capital letter rho */
entityToCharacterMap["&Sigma"]			= "931";	 /* 931 : Greek capital letter sigma */
entityToCharacterMap["&Tau"]			= "932";	 /* 932 : Greek capital letter tau */
entityToCharacterMap["&Upsilon"]			= "933";	 /* 933 : Greek capital letter upsilon */
entityToCharacterMap["&Phi"]			= "934";	 /* 934 : Greek capital letter phi */
entityToCharacterMap["&Chi"]			= "935";	 /* 935 : Greek capital letter chi */
entityToCharacterMap["&Psi"]			= "936";	 /* 936 : Greek capital letter psi */
entityToCharacterMap["&Omega"]			= "937";	 /* 937 : Greek capital letter omega */
entityToCharacterMap["&alpha"]			= "945";	 /* 945 : Greek small letter alpha */
entityToCharacterMap["&beta"]			= "946";	 /* 946 : Greek small letter beta */
entityToCharacterMap["&gamma"]			= "947";	 /* 947 : Greek small letter gamma */
entityToCharacterMap["&delta"]			= "948";	 /* 948 : Greek small letter delta */
entityToCharacterMap["&epsilon"]			= "949";	 /* 949 : Greek small letter epsilon */
entityToCharacterMap["&zeta"]			= "950";	 /* 950 : Greek small letter zeta */
entityToCharacterMap["&eta"]			= "951";	 /* 951 : Greek small letter eta */
entityToCharacterMap["&theta"]			= "952";	 /* 952 : Greek small letter theta */
entityToCharacterMap["&iota"]			= "953";	 /* 953 : Greek small letter iota */
entityToCharacterMap["&kappa"]			= "954";	 /* 954 : Greek small letter kappa */
entityToCharacterMap["&lambda"]			= "955";	 /* 955 : Greek small letter lambda */
entityToCharacterMap["&mu"]			= "956";	 /* 956 : Greek small letter mu */
entityToCharacterMap["&nu"]			= "957";	 /* 957 : Greek small letter nu */
entityToCharacterMap["&xi"]			= "958";	 /* 958 : Greek small letter xi */
entityToCharacterMap["&omicron"]			= "959";	 /* 959 : Greek small letter omicron */
entityToCharacterMap["&pi"]			= "960";	 /* 960 : Greek small letter pi */
entityToCharacterMap["&rho"]			= "961";	 /* 961 : Greek small letter rho */
entityToCharacterMap["&sigmaf"]			= "962";	 /* 962 : Greek small letter final sigma */
entityToCharacterMap["&sigma"]			= "963";	 /* 963 : Greek small letter sigma */
entityToCharacterMap["&tau"]			= "964";	 /* 964 : Greek small letter tau */
entityToCharacterMap["&upsilon"]			= "965";	 /* 965 : Greek small letter upsilon */
entityToCharacterMap["&phi"]			= "966";	 /* 966 : Greek small letter phi */
entityToCharacterMap["&chi"]			= "967";	 /* 967 : Greek small letter chi */
entityToCharacterMap["&psi"]			= "968";	 /* 968 : Greek small letter psi */
entityToCharacterMap["&omega"]			= "969";	 /* 969 : Greek small letter omega */
entityToCharacterMap["&thetasym"]			= "977";	 /* 977 : Greek theta symbol */
entityToCharacterMap["&upsih"]			= "978";	 /* 978 : Greek upsilon with hook symbol */
entityToCharacterMap["&piv"]			= "982";	 /* 982 : Greek pi symbol */
entityToCharacterMap["&ensp"]			= "8194";	 /* 8194 : en space */
entityToCharacterMap["&emsp"]			= "8195";	 /* 8195 : em space */
entityToCharacterMap["&thinsp"]			= "8201";	 /* 8201 : thin space */
entityToCharacterMap["&zwnj"]            = "8204"; /* 8204 : zero width non-joiner */
entityToCharacterMap["&zwj"]			= "8205";	 /* 8205 : zero width joiner */
entityToCharacterMap["&lrm"]             = "8206"; /* 8206 : left-to-right mark */
entityToCharacterMap["&rlm"]             = "8207"; /* 8207 : right-to-left mark */
entityToCharacterMap["&ndash"]			= "8211";	 /* 8211 : en dash */
entityToCharacterMap["&mdash"]			= "8212";	 /* 8212 : em dash */
entityToCharacterMap["&lsquo"]			= "8216";	 /* 8216 : left single quotation mark */
entityToCharacterMap["&rsquo"]			= "8217";	 /* 8217 : right single quotation mark */
entityToCharacterMap["&sbquo"]           = "8218";  /* 8218 : single low-9 quotation mark */
entityToCharacterMap["&ldquo"]			= "8220";	 /* 8220 : left double quotation mark */
entityToCharacterMap["&rdquo"]			= "8221";	 /* 8221 : right double quotation mark */
entityToCharacterMap["&bdquo"]           = "8222";  /* 8222 : double low-9 quotation mark */
entityToCharacterMap["&dagger"]			= "8224";	 /* 8224 : dagger */
entityToCharacterMap["&Dagger"]			= "8225";	 /* 8225 : double dagger */
entityToCharacterMap["&bull"]			= "8226";	 /* 8226 : bullet */
entityToCharacterMap["&hellip"]			= "8230";	 /* 8230 : horizontal ellipsis */
entityToCharacterMap["&permil"]			= "8240";	 /* 8240 : per mille sign */
entityToCharacterMap["&prime"]			= "8242";	 /* 8242 : prime */
entityToCharacterMap["&Prime"]			= "8243";	 /* 8243 : double prime */
entityToCharacterMap["&lsaquo"]          = "8249";  /* 8249 : single left-pointing angle quotation mark */
entityToCharacterMap["&rsaquo"]          = "8250";  /* 8250 : single right-pointing angle quotation mark */
entityToCharacterMap["&oline"]			= "8254";	 /* 8254 : overline */
entityToCharacterMap["&frasl"]			= "8260";	 /* 8260 : fraction slash */
entityToCharacterMap["&euro"]			= "8364";	 /* 8364 : euro sign */
entityToCharacterMap["&image"]           = "8365";  /* 8465 : black-letter capital i */
entityToCharacterMap["&weierp"]          = "8472";  /* 8472 : script capital p, Weierstrass p */
entityToCharacterMap["&real"]            = "8476";  /* 8476 : black-letter capital r */
entityToCharacterMap["&trade"]			= "8482";	 /* 8482 : trademark sign */
entityToCharacterMap["&alefsym"]			= "8501";	 /* 8501 : alef symbol */
entityToCharacterMap["&larr"]			= "8592";	 /* 8592 : leftwards arrow */
entityToCharacterMap["&uarr"]			= "8593";	 /* 8593 : upwards arrow */
entityToCharacterMap["&rarr"]			= "8594";	 /* 8594 : rightwards arrow */
entityToCharacterMap["&darr"]			= "8595";	 /* 8595 : downwards arrow */
entityToCharacterMap["&harr"]			= "8596";	 /* 8596 : left right arrow */
entityToCharacterMap["&crarr"]			= "8629";	 /* 8629 : downwards arrow with corner leftwards */
entityToCharacterMap["&lArr"]			= "8656";	 /* 8656 : leftwards double arrow */
entityToCharacterMap["&uArr"]			= "8657";	 /* 8657 : upwards double arrow */
entityToCharacterMap["&rArr"]			= "8658";	 /* 8658 : rightwards double arrow */
entityToCharacterMap["&dArr"]			= "8659";	 /* 8659 : downwards double arrow */
entityToCharacterMap["&hArr"]			= "8660";	 /* 8660 : left right double arrow */
entityToCharacterMap["&forall"]			= "8704";	 /* 8704 : for all */
entityToCharacterMap["&part"]			= "8706";	 /* 8706 : partial differential */
entityToCharacterMap["&exist"]			= "8707";	 /* 8707 : there exists */
entityToCharacterMap["&empty"]			= "8709";	 /* 8709 : empty set */
entityToCharacterMap["&nabla"]			= "8711";	 /* 8711 : nabla */
entityToCharacterMap["&isin"]			= "8712";	 /* 8712 : element of */
entityToCharacterMap["&notin"]			= "8713";	 /* 8713 : not an element of */
entityToCharacterMap["&ni"]			    = "8715";	 /* 8715 : contains as member */
entityToCharacterMap["&prod"]            = "8719";  /* 8719 : n-ary product */
entityToCharacterMap["&sum"]             = "8721";  /* 8721 : n-ary summation */
entityToCharacterMap["&minus"]			= "8722";	 /* 8722 : minus sign */
entityToCharacterMap["&lowast"]			= "8727";	 /* 8727 : asterisk operator */
entityToCharacterMap["&radic"]			= "8730";	 /* 8730 : square root */
entityToCharacterMap["&prop"]			= "8733";	 /* 8733 : proportional to */
entityToCharacterMap["&infin"]			= "8734";	 /* 8734 : infinity */
entityToCharacterMap["&ang"]			= "8736";	 /* 8736 : angle */
entityToCharacterMap["&and"]			= "8743";	 /* 8743 : logical and */
entityToCharacterMap["&or"]			= "8744";	 /* 8744 : logical or */
entityToCharacterMap["&cap"]			= "8745";	 /* 8745 : intersection */
entityToCharacterMap["&cup"]			= "8746";	 /* 8746 : union */
entityToCharacterMap["&int"]			= "8747";	 /* 8747 : integral */
entityToCharacterMap["&there4"]			= "8756";	 /* 8756 : therefore */
entityToCharacterMap["&sim"]			= "8764";	 /* 8764 : tilde operator */
entityToCharacterMap["&cong"]			= "8773";	 /* 8773 : congruent to */
entityToCharacterMap["&asymp"]			= "8776";	 /* 8776 : almost equal to */
entityToCharacterMap["&ne"]			= "8800";	 /* 8800 : not equal to */
entityToCharacterMap["&equiv"]           = "8801";   /* 8801 : identical to, equivalent to */
entityToCharacterMap["&le"]              = "8804"; /* 8804 : less-than or equal to */
entityToCharacterMap["&ge"]              = "8805"; /* 8805 : greater-than or equal to */
entityToCharacterMap["&sub"]			= "8834";	 /* 8834 : subset of */
entityToCharacterMap["&sup"]			= "8835";	 /* 8835 : superset of */
entityToCharacterMap["&nsub"]			= "8836";	 /* 8836 : not a subset of */
entityToCharacterMap["&sube"]			= "8838";	 /* 8838 : subset of or equal to */
entityToCharacterMap["&supe"]			= "8839";	 /* 8839 : superset of or equal to */
entityToCharacterMap["&oplus"]			= "8853";	 /* 8853 : circled plus */
entityToCharacterMap["&otimes"]			= "8855";	 /* 8855 : circled times */
entityToCharacterMap["&perp"]			= "8869";	 /* 8869 : up tack */
entityToCharacterMap["&sdot"]			= "8901";	 /* 8901 : dot operator */
entityToCharacterMap["&lceil"]			= "8968";	 /* 8968 : left ceiling */
entityToCharacterMap["&rceil"]			= "8969";	 /* 8969 : right ceiling */
entityToCharacterMap["&lfloor"]			= "8970";	 /* 8970 : left floor */
entityToCharacterMap["&rfloor"]			= "8971";	 /* 8971 : right floor */
entityToCharacterMap["&lang"]            = "9001";  /* 9001 : left-pointing angle bracket */
entityToCharacterMap["&rang"]            = "9002";  /* 9002 : right-pointing angle bracket */
entityToCharacterMap["&loz"]			= "9674";	 /* 9674 : lozenge */
entityToCharacterMap["&spades"]			= "9824";	 /* 9824 : black spade suit */
entityToCharacterMap["&clubs"]			= "9827";	 /* 9827 : black club suit */
entityToCharacterMap["&hearts"]			= "9829";	 /* 9829 : black heart suit */
entityToCharacterMap["&diams"]			= "9830";	 /* 9830 : black diamond suit */

var characterToEntityMap = [];

for ( var entity in entityToCharacterMap ) {
    characterToEntityMap[entityToCharacterMap[entity]] = entity;
}

$namespace('org.owasp.esapi.codecs');

org.owasp.esapi.codecs.HTMLEntityCodec = function() {
    var _super = new org.owasp.esapi.codecs.Codec();

    var getNumericEntity = function(input) {
        var first = input.peek();
        if (first == null) {
            return null;
        }

        if (first == 'x' || first == 'X') {
            input.next();
            return parseHex(input);
        }
        return parseNumber(input);
    };

    var parseNumber = function(input) {
        var out = '';
        while (input.hasNext()) {
            var c = input.peek();
            if (c.match(/[0-9]/)) {
                out += c;
                input.next();
            } else if (c == ';') {
                input.next();
                break;
            } else {
                break;
            }
        }

        try {
            return parseInt(out);
        } catch (e) {
            return null;
        }
    };

    var parseHex = function(input) {
        var out = '';
        while (input.hasNext()) {
            var c = input.peek();
            if (c.match(/[0-9A-Fa-f]/)) {
                out += c;
                input.next();
            } else if (c == ';') {
                input.next();
                break;
            } else {
                break;
            }
        }
        try {
            return parseInt(out, 16);
        } catch (e) {
            return null;
        }
    };

    var getNamedEntity = function(input) {
        var entity = '';
        while (input.hasNext()) {
            var c = input.peek();
            if (c.match(/[A-Za-z]/)) {
                entity += c;
                input.next();
                if (entityToCharacterMap.containsKey('&' + entity)) {
                    if (input.peek(';')) input.next();
                    break;
                }
            } else if (c == ';') {
                input.next();
            } else {
                break;
            }
        }

        return String.fromCharCode(entityToCharacterMap.getCaseInsensitive('&' + entity));
    };

    return {
        encode: _super.encode,

        decode: _super.decode,

        encodeCharacter: function(aImmune, c) {
            if (aImmune.contains(c)) {
                return c;
            }

            var hex = org.owasp.esapi.codecs.Codec.getHexForNonAlphanumeric(c);
            if (hex == null) {
                return c;
            }

            var cc = c.charCodeAt(0);
            if (( cc <= 0x1f && c != '\t' && c != '\n' && c != '\r' ) || ( cc >= 0x7f && cc <= 0x9f ) || c == ' ') {
                return " ";
            }

            var entityName = characterToEntityMap[cc];
            if (entityName != null) {
                return entityName + ";";
            }

            return "&#x" + hex + ";";
        },

        decodeCharacter: function(oPushbackString) {
            //noinspection UnnecessaryLocalVariableJS
            var input = oPushbackString;
            input.mark();
            var first = input.next();
            if (first == null || first != '&') {
                input.reset();
                return null;
            }

            var second = input.next();
            if (second == null) {
                input.reset();
                return null;
            }

            if (second == '#') {
                var c = getNumericEntity(input);
                if (c != null) {
                    return c;
                }
            } else if (second.match(/[A-Za-z]/)) {
                input.pushback(second);
                c = getNamedEntity(input);
                if (c != null) {
                    return c;
                }
            }
            input.reset();
            return null;
        }
    };
};


$namespace('org.owasp.esapi.codecs');

org.owasp.esapi.codecs.JavascriptCodec = function() {
    var _super = new org.owasp.esapi.codecs.Codec();

    return {
        encode: function(aImmune, sInput) {
            var out = '';
            for (var idx = 0; idx < sInput.length; idx ++) {
                var ch = sInput.charAt(idx);
                if (aImmune.contains(ch)) {
                    out += ch;
                }
                else {
                    var hex = org.owasp.esapi.codecs.Codec.getHexForNonAlphanumeric(ch);
                    if (hex == null) {
                        out += ch;
                    }
                    else {
                        var tmp = ch.charCodeAt(0).toString(16);
                        if (ch.charCodeAt(0) < 256) {
                            var pad = "00".substr(tmp.length);
                            out += "\\x" + pad + tmp.toUpperCase();
                        }
                        else {
                            pad = "0000".substr(tmp.length);
                            out += "\\u" + pad + tmp.toUpperCase();
                        }
                    }
                }
            }
            return out;
        },

        decode: _super.decode,

        decodeCharacter: function(oPushbackString) {
            oPushbackString.mark();
            var first = oPushbackString.next();
            if (first == null) {
                oPushbackString.reset();
                return null;
            }

            if (first != '\\') {
                oPushbackString.reset();
                return null;
            }

            var second = oPushbackString.next();
            if (second == null) {
                oPushbackString.reset();
                return null;
            }

            // \0 collides with the octal decoder and is non-standard
            // if ( second.charValue() == '0' ) {
            //      return Character.valueOf( (char)0x00 );
            if (second == 'b') {
                return 0x08;
            } else if (second == 't') {
                return 0x09;
            } else if (second == 'n') {
                return 0x0a;
            } else if (second == 'v') {
                return 0x0b;
            } else if (second == 'f') {
                return 0x0c;
            } else if (second == 'r') {
                return 0x0d;
            } else if (second == '\"') {
                return 0x22;
            } else if (second == '\'') {
                return 0x27;
            } else if (second == '\\') {
                return 0x5c;
            } else if (second.toLowerCase() == 'x') {
                out = '';
                for (var i = 0; i < 2; i++) {
                    var c = oPushbackString.nextHex();
                    if (c != null) {
                        out += c;
                    } else {
                        input.reset();
                        return null;
                    }
                }
                try {
                    n = parseInt(out, 16);
                    return String.fromCharCode(n);
                } catch (e) {
                    oPushbackString.reset();
                    return null;
                }
            } else if (second.toLowerCase() == 'u') {
                out = '';
                for (i = 0; i < 4; i++) {
                    c = oPushbackString.nextHex();
                    if (c != null) {
                        out += c;
                    } else {
                        input.reset();
                        return null;
                    }
                }
                try {
                    var n = parseInt(out, 16);
                    return String.fromCharCode(n);
                } catch (e) {
                    oPushbackString.reset();
                    return null;
                }
            } else if (oPushbackString.isOctalDigit(second)) {
                var out = second;
                var c2 = oPushbackString.next();
                if (!oPushbackString.isOctalDigit(c2)) {
                    oPushbackString.pushback(c2);
                } else {
                    out += c2;
                    var c3 = oPushbackString.next();
                    if (!oPushbackString.isOctalDigit(c3)) {
                        oPushbackString.pushback(c3);
                    } else {
                        out += c3;
                    }
                }

                try {
                    n = parseInt(out, 8);
                    return String.fromCharCode(n);
                } catch (e) {
                    oPushbackString.reset();
                    return null;
                }
            }
            return second;
        }
    };
};


$namespace('org.owasp.esapi.codecs');

org.owasp.esapi.codecs.PercentCodec = function() {
    var _super = new org.owasp.esapi.codecs.Codec();

    var ALPHA_NUMERIC_STR = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var RFC_NON_ALPHANUMERIC_UNRESERVED_STR = "-._~";
    var ENCODED_NON_ALPHA_NUMERIC_UNRESERVED = true;
    var UNENCODED_STR = ALPHA_NUMERIC_STR + (ENCODED_NON_ALPHA_NUMERIC_UNRESERVED ? "" : RFC_NON_ALPHANUMERIC_UNRESERVED_STR);

    var getTwoUpperBytes = function(b) {
        var out = '';
        if (b < -128 || b > 127) {
            throw new IllegalArgumentException("b is not a byte (was " + b + ")");
        }
        b &= 0xFF;
        if (b < 0x10) {
            out += '0';
        }
        return out + b.toString(16).toUpperCase();
    };

    return {
        encode: _super.encode,

        decode: _super.decode,

        encodeCharacter: function(aImmune, c) {
            if (UNENCODED_STR.indexOf(c) > -1) {
                return c;
            }

            var bytes = org.owasp.esapi.codecs.UTF8.encode(c);
            var out = '';
            for (var b = 0; b < bytes.length; b++) {
                out += '%' + getTwoUpperBytes(bytes.charCodeAt(b));
            }
            return out;
        },

        decodeCharacter: function(oPushbackString) {
            oPushbackString.mark();
            var first = oPushbackString.next();
            if (first == null || first != '%') {
                oPushbackString.reset();
                return null;
            }

            var out = '';
            for (var i = 0; i < 2; i++) {
                var c = oPushbackString.nextHex();
                if (c != null) {
                    out += c;
                }
            }
            if (out.length == 2) {
                try {
                    var n = parseInt(out, 16);
                    return String.fromCharCode(n);
                } catch (e) {
                }
            }
            oPushbackString.reset();
            return null;
        }
    };
};


$namespace('org.owasp.esapi.codecs');

org.owasp.esapi.codecs.PushbackString = function(sInput) {
    var _input = sInput,
        _pushback = '',
        _temp = '',
        _index = 0,
        _mark = 0;

    return {
        pushback: function(c) {
            _pushback = c;
        },

        index: function() {
            return _index;
        },

        hasNext: function() {
            if (_pushback != null) return true;
            return !(_input == null || _input.length == 0 || _index >= _input.length);

        },

        next: function() {
            if (_pushback != null) {
                var save = _pushback;
                _pushback = null;
                return save;
            }
            if (_input == null || _input.length == 0 || _index >= _input.length) {
                return null;
            }
            return _input.charAt(_index++);
        },

        nextHex: function() {
            var c = this.next();
            if (this.isHexDigit(c)) return c;
            return null;
        },

        nextOctal: function() {
            var c = this.next();
            if (this.isOctalDigit(c)) return c;
            return null;
        },

        isHexDigit: function(c) {
            return c != null && ( ( c >= '0' && c <= '9' ) || ( c >= 'a' && c <= 'f' ) || ( c >= 'A' && c <= 'F' ) );
        },

        isOctalDigit: function(c) {
            return c != null && ( c >= '0' && c <= '7' );
        },

        peek: function(c) {
            if (!c) {
                if (_pushback != null) return _pushback;
                if (_input == null || _input.length == 0 || _index >= _input.length) return null;
                return _input.charAt(_index);
            } else {
                if (_pushback != null && _pushback == c) return true;
                if (_input == null || _input.length == 0 || _index >= _input.length) return false;
                return _input.charAt(_index) == c;
            }
        },

        mark: function() {
            _temp = _pushback;
            _mark = _index;
        },

        reset: function() {
            _pushback = _temp;
            _index = _mark;
        },

        remainder: function() {
            var out = _input.substr(_index);
            if (_pushback != null) {
                out = _pushback + out;
            }
            return out;
        }
    };
};


$namespace('org.owasp.esapi.codecs');

org.owasp.esapi.codecs.UTF8 = {
    encode: function(sInput) {
        var input = sInput.replace(/\r\n/g, "\n");
        var utftext = '';

        for (var n = 0; n < input.length; n ++) {
            var c = input.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if (( c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }

        return utftext;
    }
    ,

    decode: function(sInput) {
        var out = '';
        var i = c = c1 = c2 = 0;

        while (i < sInput.length) {
            c = sInput.charCodeAt(i);

            if (c < 128) {
                out += String.fromCharCode(c);
                i ++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = sInput.charCodeAt(i + 1);
                out += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }

        return out;
    }
};


$namespace('org.owasp.esapi.i18n');

org.owasp.esapi.i18n.ArrayResourceBundle = function( sName, oLocale, aMessages, oParent ) {
    with(org.owasp.esapi.i18n) var _super = new ResourceBundle( sName, oLocale, oParent );

    var messages = aMessages;

    return {
        getParent: _super.getParent,
        getLocale: _super.getLocale,
        getName: _super.getName,
        getString: _super.getString,
        getMessage: function(sKey) {
            return messages[sKey];
        }
    };
};


$namespace('org.owasp.esapi.i18n');

org.owasp.esapi.i18n.Locale = function( sLanguage, sCountry, sVariant ) {
    var language = sLanguage, country = sCountry, variant = sVariant;

    return {
        getLanguage: function() { return language; },
        getCountry: function() { return country; },
        getVariant: function() { return variant; },
        toString: function() { return language + ( country ? "-" + country + ( variant ? "-" + variant : "" ) : "" ); }
    };
};

org.owasp.esapi.i18n.Locale.US = new org.owasp.esapi.i18n.Locale("en","US");
org.owasp.esapi.i18n.Locale.GB = new org.owasp.esapi.i18n.Locale("en","GB");

org.owasp.esapi.i18n.Locale.getLocale = function(sLocale) {
    var l = sLocale.split("-");
    return new org.owasp.esapi.i18n.Locale( l[0], (l.length>1?l[1]:""), (l.length>2?l.length[2]:""));
};

org.owasp.esapi.i18n.Locale.getDefault = function() {
    var l = (navigator['language']?navigator['language']:(navigator['userLanguage']?navigator['userLanguage']:'en-US')).split("-");
    return new org.owasp.esapi.i18n.Locale( l[0], (l.length>1?l[1]:""), (l.length>2?l.length[2]:""));
};


$namespace('org.owasp.esapi.i18n');

org.owasp.esapi.i18n.ObjectResourceBundle = function( oResource, oParent ) {
    var _super = new org.owasp.esapi.i18n.ResourceBundle( oResource.name, org.owasp.esapi.i18n.Locale.getLocale(oResource.locale), oParent );

    var messages = oResource.messages;

    return {
        getParent: _super.getParent,
        getLocale: _super.getLocale,
        getName: _super.getName,
        getString: _super.getString,
        getMessage: function(sKey) {
            return messages[sKey];
        }
    };
};


$namespace('org.owasp.esapi.i18n');

org.owasp.esapi.i18n.ResourceBundle = function( sName, oLocale, oParentResourceBundle ) {
    var parent = oParentResourceBundle;
    var locale = oLocale;
    var name = sName;

    if ( !name ) throw new SyntaxError("Name required for implementations of org.owasp.esapi.i18n.ResourceBundle");
    if ( !locale ) throw new SyntaxError("Locale required for implementations of org.owasp.esapi.i18n.ResourceBundle");

    return {
        getParent: function() { return parent; },
        getLocale: function() { return locale; },
        getName: function() { return name; },
        getMessage: function(sKey) { return sKey; },
        getString: function( sKey, oContextMap ) {
            if ( arguments.length < 1 ) {
                throw new IllegalArgumentException("No key passed to getString");
            }

            var msg = this.getMessage(sKey);
            if ( !msg ) {
                if ( parent ) {
                    return parent.getString( sKey, oContextMap );
                } else {
                    return sKey;
                }
            }

            if ( !msg.match( /\{([A-Za-z]+)\}/ ) || !oContextMap ) {
                return msg;
            }

            var out = '', lastIndex = 0;
            while (true) {
                var nextVarIdx = msg.indexOf( "{", lastIndex );
                var endIndex = msg.indexOf( "}", nextVarIdx );

                if ( nextVarIdx < 0 ) {
                    out += msg.substr( lastIndex, msg.length-lastIndex );
                    break;
                }

                if ( nextVarIdx >= 0 && endIndex < -1 ) {
                    throw new SyntaxError("Invalid Message - Unclosed Context Reference: " + msg );
                }

                out += msg.substring( lastIndex, nextVarIdx );
                var contextKey = msg.substring( nextVarIdx+1, endIndex );
                if ( oContextMap[contextKey] ) {
                    out += oContextMap[contextKey];
                } else {
                    out += msg.substring( nextVarIdx, endIndex+1 );
                }

                lastIndex = endIndex + 1;
            }

            return out;
        }
    };
};

org.owasp.esapi.i18n.ResourceBundle.getResourceBundle = function(sResource, oLocale) {
    var classname = sResource + "_" + oLocale.toString().replace("-","_");

    with( org.owasp.esapi.i18n ) {
        if ( ResourceBundle[classname] instanceof Object ) {
            return ResourceBundle[classname];
        } else {
            return new ResourceBundle[classname]();
        }
    }
};

$namespace('org.owasp.esapi.net');

/**
 * Constructs a cookie with a specified name and value.
 * <p/>
 * The name must conform to RFC 2109. That means it can contain only ASCII alphanumeric characters and cannot contain
 * commas, semicolons, or white space or begin with a $ character. The cookie's name cannot be changed after creation.
 * <p/>
 * The value can be anything the server chooses to send. Its value is probably of interest only to the server. The
 * cookie's value can be changed after creation with the setValue method.
 * <p/>
 * By default, cookies are created according to the Netscape cookie specification. The version can be changed with the
 * {@link #setVersion} method.
 *
 * @constructor
 * @param sName {String} a <code>String</code> specifying the name of the cookie
 * @param sValue {String} a <code>String</code> specifying the value of the cookie
 * @throws  IllegalArgumentException
 *          if the cookie name contains illegal characters (for example, a comma, space, or semicolon) or it is one of
 *          the tokens reserved for use by the cookie protocol
 */
org.owasp.esapi.net.Cookie = function( sName, sValue ) {
    var name;       // NAME= ... "$Name" style is reserved
    var value;      // value of NAME

    var comment;    // ;Comment=VALUE ... describes the cookies use
    var domain;     // ;Domain=VALUE ... domain that sees the cookie
    var maxAge;     // ;Max-Age=VALUE ... cookies auto-expire
    var path;       // ;Path=VALUE ... URLs that see the cookie
    var secure;     // ;Secure ... e.g. use SSL
    var version;    // ;Version=1 ... means RFC-2109++ style

    var _resourceBundle = $ESAPI.resourceBundle();

    var tSpecials = ",; ";

    var isToken = function(sValue) {
        for(var i=0,len=sValue.length;i<len;i++) {
            var cc = sValue.charCodeAt(i),c=sValue.charAt(i);
            if (cc<0x20||cc>=0x7F||tSpecials.indexOf(c)!=-1) {
                return false;
            }
        }
        return true;
    };

    if ( !isToken(sName)
        || sName.toLowerCase() == 'comment'
        || sName.toLowerCase() == 'discard'
        || sName.toLowerCase() == 'domain'
        || sName.toLowerCase() == 'expires'
        || sName.toLowerCase() == 'max-age'
        || sName.toLowerCase() == 'path'
        || sName.toLowerCase() == 'secure'
        || sName.toLowerCase() == 'version'
        || sName.charAt(0) == '$' ) {
        var errMsg = _resourceBundle.getString( "Cookie.Name", { 'name':sName } );
        throw new IllegalArgumentException(errMsg);
    }

    name = sName;
    value = sValue;

    return {
        setComment: function(purpose) { comment = purpose; },
        getComment: function() { return comment; },
        setDomain: function(sDomain) { domain = sDomain.toLowerCase(); },
        getDomain: function() { return domain; },
        setMaxAge: function(nExpirey) { maxAge = nExpirey; },
        getMaxAge: function() { return maxAge; },
        setPath: function(sPath) { path = sPath; },
        getPath: function() { return path; },
        setSecure: function(bSecure) { secure = bSecure; },
        getSecure: function() { return secure; },
        getName: function() { return name; },
        setValue: function(sValue) { value = sValue; },
        getValue: function() { return value; },
        setVersion: function(nVersion) {
            if(nVersion<0||nVersion>1)throw new IllegalArgumentException(_resourceBundle.getString("Cookie.Version", { 'version':nVersion } ) );
            version = nVersion;
        },
        getVersion: function() { return version; }
    };
};

$namespace('org.owasp.esapi.reference.encoding');

org.owasp.esapi.reference.encoding.DefaultEncoder = function(aCodecs) {
    var _codecs = [],
        _htmlCodec = new org.owasp.esapi.codecs.HTMLEntityCodec(),
        _javascriptCodec = new org.owasp.esapi.codecs.JavascriptCodec(),
        _cssCodec = new org.owasp.esapi.codecs.CSSCodec(),
        _percentCodec = new org.owasp.esapi.codecs.PercentCodec();

    if (!aCodecs) {
        _codecs.push(_htmlCodec);
        _codecs.push(_javascriptCodec);
        _codecs.push(_cssCodec);
        _codecs.push(_percentCodec);
    } else {
        _codecs = aCodecs;
    }

    var IMMUNE_HTML = new Array(',', '.', '-', '_', ' ');
    var IMMUNE_HTMLATTR = new Array(',', '.', '-', '_');
    var IMMUNE_CSS = new Array();
    var IMMUNE_JAVASCRIPT = new Array(',', '.', '_');

    return {
        cananicalize: function(sInput, bStrict) {
            if (!sInput) {
                return null;
            }
            var working = sInput, codecFound = null, mixedCount = 1, foundCount = 0, clean = false;
            while (!clean) {
                clean = true;

                _codecs.each(function(codec) {
                    var old = working;
                    working = codec.decode(working);

                    if (old != working) {
                        if (codecFound != null && codecFound != codec) {
                            mixedCount ++;
                        }
                        codecFound = codec;
                        if (clean) {
                            foundCount ++;
                        }
                        clean = false;
                    }
                });
            }

            if (foundCount >= 2 && mixedCount > 1) {
                if (bStrict) {
                    throw new org.owasp.esapi.IntrusionException("Input validation failure", "Multiple (" + foundCount + "x) and mixed encoding (" + mixedCount + "x) detected in " + sInput);
                }
            }
            else if (foundCount >= 2) {
                if (bStrict) {
                    throw new org.owasp.esapi.IntrusionException("Input validation failure", "Multiple (" + foundCount + "x) encoding detected in " + sInput);
                }
            }
            else if (mixedCount > 1) {
                if (bStrict) {
                    throw new org.owasp.esapi.IntrusionException("Input validation failure", "Mixed (" + mixedCount + "x) encoding detected in " + sInput);
                }
            }
            return working;
        },

        normalize: function(sInput) {
            return sInput.replace(/[^\x00-\x7F]/g, '');
        },

        encodeForHTML: function(sInput) {
            return !sInput ? null : _htmlCodec.encode(IMMUNE_HTML, sInput);
        },

        decodeForHTML: function(sInput) {
            return !sInput ? null : _htmlCodec.decode(sInput);
        },

        encodeForHTMLAttribute: function(sInput) {
            return !sInput ? null : _htmlCodec.encode(IMMUNE_HTMLATTR, sInput);
        },

        encodeForCSS: function(sInput) {
            return !sInput ? null : _cssCodec.encode(IMMUNE_CSS, sInput);
        },

        encodeForJavaScript: function(sInput) {
            return !sInput ? null : _javascriptCodec.encode(IMMUNE_JAVASCRIPT, sInput);
        },

        encodeForJavascript: this.encodeForJavaScript,

        encodeForURL: function(sInput) {
            return !sInput ? null : escape(sInput);
        },

        decodeFromURL: function(sInput) {
            return !sInput ? null : unescape(sInput);
        },

        encodeForBase64: function(sInput) {
            return !sInput ? null : org.owasp.esapi.codecs.Base64.encode(sInput);
        },

        decodeFromBase64: function(sInput) {
            return !sInput ? null : org.owasp.esapi.codecs.Base64.decode(sInput);
        }
    };
};


$namespace('org.owasp.esapi.reference.logging');

org.owasp.esapi.reference.logging.Log4JSLogFactory = function() {
    var loggersMap = Array();

    var Level = {
        TRACE: 10,
        DEBUG: 20,
        INFO: 30,
        WARN: 40,
        ERROR: 50,
        FATAL: 60
    };
    var Log4JSLogger = function( sModuleName ) {
        var level = 0;
        return {
            setLevel: function( nLevel ) {

            },

            trace: function( oEventType, sMessage, oException ) {
                this.log( Level.TRACE, oEventType, sMessage, oException );
            },

            debug: function( oEventType, sMessage, oException ) {
                this.log( Level.DEBUG, oEventType, sMessage, oException );
            },

            info: function( oEventType, sMessage, oException ) {
                this.log( Level.INFO, oEventType, sMessage, oException );
            },

            warning: function( oEventType, sMessage, oException ) {
                this.log( Level.WARN, oEventType, sMessage, oException );
            },

            error: function( oEventType, sMessage, oException ) {
                this.log( Level.ERROR, oEventType, sMessage, oException );
            },

            fatal: function( oEventType, sMessage, oException ) {
                this.log( Level.FATAL, oEventType, sMessage, oException );
            },

            log: function( oLevel, oEventType, sMessage, oException ) {

            },

            addAppender: function( oAppender ) {

            },

            isLogUrl: function()                {},
            setLogUrl: function(b)              {},
            isLogApplicationName: function()    {},
            setLogApplicationName: function(b)  {},
            isEncodingRequired: function()      {},
            setEncodingRequired: function(b)    {},
            setEncodingFunction: function(f)    {},
            isDebugEnabled: function()          {},
            isErrorEnabled: function()          {},
            isFatalEnabled: function()          {},
            isInfoEnabled: function()           {},
            isTraceEnabled: function()          {},
            isWarningEnabled: function()        {}
        };
    };

    return {
        getLogger: function ( moduleName ) {
            var key = ( typeof moduleName == 'string' ) ? moduleName : moduleName.constructor.toString();

            return new Log4JSLogger(key);
        }
    };
};


$namespace('org.owasp.esapi.reference.validation');

org.owasp.esapi.reference.validation.BaseValidationRule = function( sTypeName, oEncoder, oLocale ) {
    var log = $ESAPI.logger( "Validation" );
    var EventType = org.owasp.esapi.Logger.EventType;

    var typename = sTypeName;
    var encoder = oEncoder?oEncoder:$ESAPI.encoder();
    var allowNull = false;

    var ResourceBundle = org.owasp.esapi.i18n.ResourceBundle;

    var locale = oLocale?oLocale:$ESAPI.locale();
    var resourceBundle;

    if ( $ESAPI.properties.validation.ResourceBundle ) {
        resourceBundle = ResourceBundle.getResourceBundle( $ESAPI.properties.validation.ResourceBundle, locale );
    }

    if ( !resourceBundle ) {
        resourceBundle = $ESAPI.resourceBundle();
        log.info( EventType.EVENT_FAILURE, "No Validation ResourceBundle - Defaulting to " + resourceBundle.getName() + "(" + resourceBundle.getLocale().toString() + ")" );
    }

    log.info( EventType.EVENT_SUCCESS, "Validation Rule Initialized with ResourceBundle: " + resourceBundle.getName() );

    return {
        setAllowNull: function(b) { allowNull = b; },

        isAllowNull: function() { return allowNull; },

        getTypeName: function() { return typename; },

        setTypeName: function(s) { typename = s; },

        setEncoder: function(oEncoder) { encoder = oEncoder; },

        getEncoder: function() { return encoder; },

        assertValid: function( sContext, sInput ) {
            this.getValid( sContext, sInput );
        },

        getValid: function( sContext, sInput, oValidationErrorList ) {
            var valid = null;
            try {
                valid = this.getValidInput( sContext, sInput );
            } catch (oValidationException) {
                return this.sanitize( sContext, sInput );
            }
            return valid;
        },

        getValidInput: function( sContext, sInput ) {
            return sInput;
        },

        getSafe: function( sContext, sInput ) {
            var valid = null;
            try {
                valid = this.getValidInput( sContext, sInput );
            } catch (oValidationException) {
                return this.sanitize( sContext, sInput );
            }
            return valid;
        },

        /**
         * The method is similar to ValidationRuile.getSafe except that it returns a
         * harmless object that <b>may or may not have any similarity to the original
         * input (in some cases you may not care)</b>. In most cases this should be the
         * same as the getSafe method only instead of throwing an exception, return
         * some default value.
         *
         * @param context
         * @param input
         * @return a parsed version of the input or a default value.
         */
        sanitize: function( sContext, sInput ) {
            return sInput;
        },

        isValid: function( sContext, sInput ) {
            var valid = false;
            try {
                this.getValidInput( sContext, sInput );
                valid = true;
            } catch (oValidationException) {
                return false;
            }
            return valid;
        },

        /**
         * Removes characters that aren't in the whitelist from the input String.
         * O(input.length) whitelist performance
         * @param input String to be sanitized
         * @param whitelist allowed characters
         * @return input stripped of all chars that aren't in the whitelist
         */
        whitelist: function( sInput, aWhitelist ) {
            var stripped = '';
            for ( var i=0;i<sInput.length;i++ ) {
                var c = sInput.charAt(i);
                if ( aWhitelist.contains(c) ) {
                    stripped += c;
                }
            }
            return stripped;
        },

        getUserMessage: function( sContext, sDefault, oContextValues ) {
            return this.getMessage( sContext+".Usr", sDefault+".Usr", oContextValues );
        },

        getLogMessage: function( sContext, sDefault, oContextValues ) {
            return this.getMessage( sContext+".Log", sDefault+".Log", oContextValues );
        },

        getMessage: function( sContext, sDefault, oContextValues ) {
            return resourceBundle.getString( sContext, oContextValues ) ? resourceBundle.getString( sContext, oContextValues ) : resourceBundle.getString( sDefault, oContextValues );
        },

        validationException: function( sContext, sDefault, sValidation, oContextValues ) {
            throw new org.owasp.esapi.reference.validation.ValidationException(
                this.getUserMessage( sContext+"."+sValidation, sDefault+"."+sValidation, oContextValues ),
                this.getLogMessage( sContext+"."+sValidation, sDefault+"."+sValidation, oContextValues ),
                sContext
            );
        }
    };
};


$namespace('org.owasp.esapi.reference.validation');

org.owasp.esapi.reference.validation.CreditCardValidationRule = function( sTypeName, oEncoder, oLocale ) {
    var _super = new org.owasp.esapi.reference.validation.BaseValidationRule( sTypeName, oEncoder, oLocale );
    var _validationType = "CreditCard";

    var maxCardLength = 19;
    var ccrule;

    var readDefaultCreditCardRule = function() {
        var p = new RegExp( $ESAPI.properties.validation.CreditCard );
        var ccr = new org.owasp.esapi.reference.validation.StringValidationRule( "ccrule", _super.getEncoder(), oLocale, p );
        ccr.setMaxLength( maxCardLength );
        ccr.setAllowNull( false );
        return ccr;
    };

    ccRule = readDefaultCreditCardRule();

    var validCreditCardFormat = function( ccNum ) {
        var digitsonly = '';
        var c;
        for (var i=0;o<ccNum.length;i++) {
            c = ccNum.charAt(i);
            if ( c.match( /[0-9]/ ) ) digitsonly += c;
        }

        var sum = 0, digit = 0, addend = 0, timesTwo = false;

        for (var j=digitsonly.length-1; j>=0; j--) {
            digit = parseInt(digitsonly.substring(j,i+1));
            if ( timesTwo ) {
                addend = digit * 2;
                if ( addend > 9 ) addend -= 9;
            } else {
                addend = digit;
            }
            sum += addend;
            timesTwo = !timesTwo;
        }
        return sum % 10 == 0;
    };

    return {
        getMaxCardLength: function() { return maxCardLength; },

        setMaxCardLength: function(n) { maxCardLength = n; },

        setAllowNull: _super.setAllowNull,

        isAllowNull: _super.isAllowNull,

        getTypeName: _super.getTypeName,

        setTypeName: _super.setTypeName,

        setEncoder: _super.setEncoder,

        getEncoder: _super.getEncoder,

        assertValid: _super.assertValid,

        getValid: _super.getValid,

        getValidInput: function( sContext, sInput ) {
            if ( !sInput || sInput.trim() == '' ) {
                if ( this.isAllowNull() ) {
                    return null;
                }
                _super.validationException( sContext, _validationType, "Required", { "context":sContext, "input":sInput } );
            }

            var canonical = ccrule.getValid( sContext, sInput );

            if ( !validCreditCardFormat(canonical) ) {
                _super.validationException( sContext, _validationType, "Invalid", { "context":sContext, "input":sInput } );
            }

            return canonical;
        },

        getSafe: _super.getSafe,

        sanitize: function( sContext, sInput ) {
            return this.whitelist( sInput, org.owasp.esapi.EncoderConstants.CHAR_DIGITS );
        },

        isValid: _super.isValid,

        whitelist: _super.whitelist
    };
};


$namespace('org.owasp.esapi.reference.validation');

org.owasp.esapi.reference.validation.DateValidationRule = function( sTypeName, oEncoder, oLocale ) {
    var _super = new org.owasp.esapi.reference.validation.BaseValidationRule( sTypeName, oEncoder, oLocale );
    var _validationTarget = "Date";

    var format = DateFormat.getDateInstance();

    var safelyParse = function(sContext,sInput) {
        if ( !sContext || sContext.trim() == '' ) {
            if ( _super.isAllowNull() ) {
                return null;
            }
            _super.validationException( sContext, _validationTarget, "Required", { "context":sContext, "input":sInput, "format":format } );
        }

        var canonical = _super.getEncoder().cananicalize(sInput);

        try {
            return format.parse(canonical);
        } catch (e) {
            _super.validationException( sContext, _validationTarget, "Invalid", { "context":sContext, "input":sInput, "format":format } );
        }
    };

    return {
        setDateFormat: function(fmt) {
            if ( !fmt ) {
                throw new IllegalArgumentException("DateValidationRule.setDateFormat requires a non-null DateFormat");
            }
            format = fmt;
        },

        setAllowNull: _super.setAllowNull,

        isAllowNull: _super.isAllowNull,

        getTypeName: _super.getTypeName,

        setTypeName: _super.setTypeName,

        setEncoder: _super.setEncoder,

        getEncoder: _super.getEncoder,

        assertValid: _super.assertValid,

        getValid: _super.getValid,

        getValidInput: function( sContext, sInput ) {
            return safelyParse(sContext,sInput);
        },

        getSafe: _super.getSafe,

        sanitize: function( sContext, sInput ) {
            var date = new Date(0);
            try {
                date = safelyParse(sContext,sInput);
            } catch (e) { }
            return date;
        },

        isValid: _super.isValid,

        whitelist: _super.whitelist
    };
};


$namespace('org.owasp.esapi.reference.validation');

org.owasp.esapi.reference.validation.DefaultValidator = function( oEncoder, oLocale ) {
    var rules = Array();
    var encoder = oEncoder?oEncoder:$ESAPI.encoder();
    var locale = oLocale?oLocale:org.owasp.esapi.i18n.Locale.getDefault();

    var p = org.owasp.esapi.reference.validation;

    return {
        addRule: function( oValidationRule ) {
            rules[oValidationRule.getName()] = oValidationRule;
        },

        getRule: function( sName ) {
            return rules[sName];
        },

        isValidInput: function( sContext, sInput, sType, nMaxLength, bAllowNull ) {
            try {
                this.getValidInput( sContext, sInput, sType, nMaxLength, bAllowNull );
                return true;
            } catch (e) {
                return false;
            }
        },

        getValidInput: function( sContext, sInput, sType, nMaxLength, bAllowNull, oValidationErrorList ) {
            var rvr = new org.owasp.esapi.reference.validation.StringValidationRule( sType, encoder, locale );
            var p = new RegExp($ESAPI.properties.validation[sType]);
            if ( p && p instanceof RegExp ) {
                rvr.addWhitelistPattern( p );
            } else {
                throw new IllegalArgumentException("Invalid Type: " + sType + " not found.");
            }
            rvr.setMaxLength( nMaxLength );
            rvr.setAllowNull( bAllowNull );

            try {
                return rvr.getValid(sContext,sInput);
            } catch (e) {
                if ( e instanceof p.ValidationErrorList && oValidationErrorList ) {
                    oValidationErrorList.addError( sContext, e );
                }
                throw e;
            }
        },

        isValidDate: function( sContext, sInput, oDateFormat, bAllowNull ) {
            try {
                this.getValidDate( sContext, sInput, oDateFormat, bAllowNull );
                return true;
            } catch (e) {
                return false;
            }
        },

        getValidDate: function( sContext, sInput, oDateFormat, bAllowNull, oValidationErrorList ) {
            var dvr = new p.DateValidationRule( sContext, encoder, locale );
            dvr.setAllowNull( bAllowNull );
            dvr.setDateFormat(oDateFormat);
            try {
                return dvr.getValid( sContext, sInput );
            } catch (e) {
                if ( e instanceof p.ValidationErrorList && oValidationErrorList ) {
                    oValidationErrorList.addError( sContext, e );
                }
                throw e;
            }
        },

        getValidCreditCard: function( sContext, sInput, bAllowNull, oValidationErrorList ) {
            var ccr = new p.CreditCardValidationRule( sContext, encoder, locale );
            ccr.setAllowNull(bAllowNull);

            try {
                return ccr.getValid(sContext,sInput);
            } catch (e) {
                if ( e instanceof p.ValidationErrorList && oValidationErrorList ) {
                    oValidationErrorList.addError( sContext, e );
                }
                throw e;
            }
        },

        isValidCreditCard: function( sContext, sInput, bAllowNull ) {
            try {
                this.getValidCreditCard( sContext,sInput,bAllowNull );
                return true;
            } catch (e) {
                return false;
            }
        },

        getValidNumber: function( sContext, sInput, bAllowNull, nMinValue, nMaxValue, oValidationErrorList ) {
            var nvr = new p.NumberValidationRule( sContext, encoder, locale, nMinValue, nMaxValue );
            nvr.setAllowNull(bAllowNull);

            try {
                return nvr.getValid(sContext, sInput);
            } catch(e) {
                if ( e instanceof p.ValidationErrorList && oValidationErrorList ) {
                    oValidationErrorList.addError( sContext, e );
                }
                throw e;
            }
        },

        isValidNumber: function( sContext, sInput, bAllowNull, nMinValue, nMaxValue ) {
            try {
                this.getValidNumber(sContext,sInput,bAllowNull,nMinValue,nMaxValue);
                return true;
            } catch (e) {
                return false;
            }
        },

        getValidInteger: function( sContext, sInput, bAllowNull, nMinValue, nMaxValue, oValidationErrorList ) {
            var nvr = new p.IntegerValidationRule( sContext, encoder, locale, nMinValue, nMaxValue );
            nvr.setAllowNull(bAllowNull);

            try {
                return nvr.getValid(sContext, sInput);
            } catch(e) {
                if ( e instanceof p.ValidationErrorList && oValidationErrorList ) {
                    oValidationErrorList.addError( sContext, e );
                }
                throw e;
            }
        },

        isValidInteger: function( sContext, sInput, bAllowNull, nMinValue, nMaxValue ) {
            try {
                this.getValidInteger(sContext,sInput,bAllowNull,nMinValue,nMaxValue);
                return true;
            } catch (e) {
                return false;
            }
        }
    };
};


$namespace('org.owasp.esapi.reference.validation');

org.owasp.esapi.reference.validation.IntegerValidationRule = function( sTypeName, oEncoder, oLocale, nMinValue, nMaxValue ) {
    var _super = new org.owasp.esapi.reference.validation.BaseValidationRule( sTypeName, oEncoder, oLocale );
    var _validationTarget = "Integer";

    var minValue = nMinValue?nMinValue:Number.MIN_VALUE;
    var maxValue = nMaxValue?nMaxValue:Number.MAX_VALUE;

    if ( minValue >= maxValue ) {
        throw new IllegalArgumentException( "minValue must be less than maxValue" );
    }

    var safelyParse = function(sContext,sInput) {
        if ( !sInput || sInput.trim() == '' ) {
            if ( _super.allowNull() ) {
                return null;
            }
            _super.validationException( sContext, _validationTarget, "Required", { "context":sContext, "input":sInput, "minValue":minValue, "maxValue":maxValue } );
        }

        var canonical = _super.getEncoder().cananicalize(sInput);

        var n = parseInt(canonical);
        if ( n == 'NaN' ) {
            _super.validationException( sContext, _validationTarget, "NaN", { "context":sContext, "input":sInput, "minValue":minValue, "maxValue":maxValue } );
        }
        if ( n < minValue ) {
            _super.validationException( sContext, _validationTarget, "MinValue", { "context":sContext, "input":sInput, "minValue":minValue, "maxValue":maxValue } );
        }
        if ( n > maxValue ) {
            _super.validationException( sContext, _validationTarget, "MaxValue", { "context":sContext, "input":sInput, "minValue":minValue, "maxValue":maxValue } );
        }
        return n;
    };

    return {
        setMinValue: function(n) { minValue = n; },

        getMinValue: function() { return minValue; },

        setMaxValue: function(n) { maxValue = n; },

        getMaxValue: function() { return maxValue; },

        setAllowNull: _super.setAllowNull,

        isAllowNull: _super.isAllowNull,

        getTypeName: _super.getTypeName,

        setTypeName: _super.setTypeName,

        setEncoder: _super.setEncoder,

        getEncoder: _super.getEncoder,

        assertValid: _super.assertValid,

        getValid: _super.getValid,

        getValidInput: function( sContext, sInput ) {
            return safelyParse(sContext,sInput);
        },

        getSafe: _super.getSafe,

        sanitize: function( sContext, sInput ) {
            var n = 0;
            try {
                n = safelyParse(sContext,sInput);
            } catch (e) { }
            return n;
        },

        isValid: _super.isValid,

        whitelist: _super.whitelist
    };
};


$namespace('org.owasp.esapi.reference.validation');

org.owasp.esapi.reference.validation.NumberValidationRule = function( sTypeName, oEncoder, oLocale, fMinValue, fMaxValue ) {
    var _super = new org.owasp.esapi.reference.validation.BaseValidationRule( sTypeName, oEncoder, oLocale );
    var _validationTarget = 'Number';

    var minValue = fMinValue?fMinValue:Number.MIN_VALUE;
    var maxValue = fMaxValue?fMaxValue:Number.MAX_VALUE;

    if ( minValue >= maxValue ) throw new IllegalArgumentException("MinValue must be less that MaxValue");

    var safelyParse = function( sContext, sInput ) {
        if ( !sInput || sInput.trim() == '' ) {
            if ( _super.isAllowNull() ) {
                return null;
            }
            _super.validationException( sContext, _validationTarget, "Required", { "context":sContext, "input":sInput, "minValue":minValue, "maxValue":maxValue } );
        }

        var canonical = _super.getEncoder().cananicalize( sInput );

        var f = 0.0;
        try {
            f = parseFloat( canonical );
        } catch (e) {
            _super.validationException( sContext, _validationTarget, "Invalid", { "context":sContext, "input":sInput, "minValue":minValue, "maxValue":maxValue } );
        }

        if ( f == 'NaN' ) {
            _super.validationException( sContext, _validationTarget, "NaN", { "context":sContext, "input":sInput, "minValue":minValue, "maxValue":maxValue } );
        }
        if ( f < minValue ) {
            _super.validationException( sContext, _validationTarget, "MinValue", { "context":sContext, "input":sInput, "minValue":minValue, "maxValue":maxValue } );
        }
        if ( f > maxValue ) {
            _super.validationException( sContext, _validationTarget, "MaxValue", { "context":sContext, "input":sInput, "minValue":minValue, "maxValue":maxValue } );
        }
        return f;
    };

    return {
        setMinValue: function(n) { minValue = n; },

        getMinValue: function() { return minValue; },

        setMaxValue: function(n) { maxValue = n; },

        getMaxValue: function() { return maxValue; },

        setAllowNull: _super.setAllowNull,

        isAllowNull: _super.isAllowNull,

        getTypeName: _super.getTypeName,

        setTypeName: _super.setTypeName,

        setEncoder: _super.setEncoder,

        getEncoder: _super.getEncoder,

        assertValid: _super.assertValid,

        getValid: _super.getValid,

        getValidInput: function( sContext, sInput ) {
            return safelyParse(sContext,sInput);
        },

        getSafe: _super.getSafe,

        sanitize: function( sContext, sInput ) {
            var n = 0;
            try {
                n = safelyParse(sContext,sInput);
            } catch (e) { }
            return n;
        },

        isValid: _super.isValid,

        whitelist: _super.whitelist
    };
};


$namespace('org.owasp.esapi.reference.validation');

org.owasp.esapi.reference.validation.StringValidationRule = function( sTypeName, oEncoder, oLocale, sWhiteListPattern ) {
    var _super = new org.owasp.esapi.reference.validation.BaseValidationRule( sTypeName, oEncoder, oLocale );
    var _validationTarget = 'String';

    var whitelistPatterns = Array();
    var blacklistPatterns = Array();
    var minLength = 0;
    var maxLength = Number.MAX_VALUE;
    var validateInputAndCanonical = true;

    if ( sWhiteListPattern ) {
        if ( sWhiteListPattern instanceof String ) {
            whitelistPatterns.push( new RegExp(sWhiteListPattern) );
        } else if ( sWhiteListPattern instanceof RegExp ) {
            whitelistPatterns.push( sWhiteListPattern );
        } else {
            throw new IllegalArgumentException("sWhiteListPattern must be a string containing RegExp or a RegExp Object");
        }
    }

    var checkWhitelist = function( sContext, sInput, sOrig ) {
        whitelistPatterns.each(function(p){
            if ( sInput.match(p) ) {
                _super.validationException( sContext, _validationTarget, "Whitelist", { "context":sContext, "input":sInput, "orig":sOrig, "pattern":p.toString(), "minLength":minLength, "maxLength":maxLength, "validateInputAndCanonical":validateInputAndCanonical } );
            }
        });
    };

    var checkBlacklist = function( sContext, sInput, sOrig ) {
        blacklistPatterns.each(function(p){
            if ( sInput.match(p) ) {
                _super.validationException( sContext, _validationTarget, "Blacklist", { "context":sContext, "input":sInput, "orig":sOrig, "pattern":p.toString(), "minLength":minLength, "maxLength":maxLength, "validateInputAndCanonical":validateInputAndCanonical } );
            }
        });
    };

    var checkLength = function( sContext, sInput, sOrig ) {
        if ( sInput.length < minLength ) {
            _super.validationException( sContext, _validationTarget, "MinLength", { "context":sContext, "input":sInput, "orig":sOrig, "minLength":minLength, "maxLength":maxLength, "validateInputAndCanonical":validateInputAndCanonical } );
        }
        if ( sInput.length > maxLength ) {
            _super.validationException( sContext, _validationTarget, "MaxLength", { "context":sContext, "input":sInput, "orig":sOrig, "minLength":minLength, "maxLength":maxLength, "validateInputAndCanonical":validateInputAndCanonical } );
        }
        return sInput;
    };

    var checkEmpty = function( sContext, sInput, sOrig ) {
        if ( !sInput || sInput.trim() == '' ) {
            if ( _super.isAllowNull() ) {
                return null;
            }
            _super.validationException( sContext, _validationTarget, "Required", { "context":sContext, "input":sInput, "orig":sOrig, "minLength":minLength, "maxLength":maxLength, "validateInputAndCanonical":validateInputAndCanonical } );
        }
    };

    return {
        addWhitelistPattern: function(p) {
            if ( p instanceof String ) {
                whitelistPatterns.push( new RegExp(p) );
            } else if ( p instanceof RegExp ) {
                whitelistPatterns.push(p);
            } else {
                throw new IllegalArgumentException("p must be a string containing RegExp or a RegExp Object");
            }
        },

        addBlacklistPattern: function(p) {
            if ( p instanceof String ) {
                blacklistPatterns.push( new RegExp(p) );
            } else if ( p instanceof RegExp ) {
                blacklistPatterns.push(p);
            } else {
                throw new IllegalArgumentException("p must be a string containing RegExp or a RegExp Object");
            }
        },

        setMinLength: function(n) { minLength = n; },

        getMinLength: function() { return minLength; },

        setMaxLength: function(n) { maxLength = n; },

        getMaxLength: function() { return maxLength; },

        setValidateInputAndCanonical: function(b) { validateInputAndCanonical = b; },

        isValidateInputAndCanonical: function() { return validateInputAndCanonical; },

        setAllowNull: _super.setAllowNull,

        isAllowNull: _super.isAllowNull,

        getTypeName: _super.getTypeName,

        setTypeName: _super.setTypeName,

        setEncoder: _super.setEncoder,

        getEncoder: _super.getEncoder,

        assertValid: _super.assertValid,

        getValid: _super.getValid,

        getValidInput: function( sContext, sInput ) {
            var canonical = null;

            if ( checkEmpty( sContext, sInput ) == null ) {
                return null;
            }

            if ( validateInputAndCanonical ) {
                checkLength(sContext, sInput);
                checkWhitelist(sContext,sInput);
                checkBlacklist(sContext,sInput);
            }

            canonical = this.getEncoder().cananicalize(sInput);

            if ( checkEmpty( sContext, canonical, sInput ) == null ) {
                return null;
            }

            checkLength( sContext, canonical, sInput );
            checkWhitelist( sContext, canonical, sInput );
            checkBlacklist( sContext, canonical, sInput );

            return canonical;
        },

        getSafe: _super.getSafe,

        sanitize: function( sContext, sInput ) {
            return this.whitelist( sInput, org.owasp.esapi.EncoderConstants.CHAR_ALNUM );
        },

        isValid: _super.isValid,

        whitelist: _super.whitelist
    };
};


$namespace('org.owasp.esapi.reference.validation');

org.owasp.esapi.reference.validation.ValidationException = function( sUserMessage, sLogMessage ) {
    var oException, sContext;
    if ( arguments[2] && arguments[2] instanceof Exception ) {
        oException = arguments[2];
        if ( arguments[3] && arguments[3] instanceof String ) {
            sContext = arguments[3];
        }
    } else if ( arguments[2] && arguments[2] instanceof String ) {
        sContext = arguments[2];
    }

    var _super = new org.owasp.esapi.EnterpriseSecurityException( sUserMessage, sLogMessage, oException );

    return {
        setContext: function(s) { sContext = s; },
        getContext: function() { return sContext; },
        getMessage: _super.getMessage,
        getUserMessage: _super.getMessage,
        getLogMessage: _super.getLogMessage,
        getStackTrace: _super.getStackTrace,
        printStackTrace: _super.printStackTrace
    };
};
