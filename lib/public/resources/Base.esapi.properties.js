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

$namespace('Base.esapi.properties');

Base.esapi.properties = {
    application: {
        // Change this value to reflect your application, or override it in an application scoped configuration.
        Name: 'ESAPI4JS Base Application'
    },

    httputilities: {
        cookies: {
            ForceSecure: true
        }
    },

    logging: {
        Implementation: org.owasp.esapi.reference.logging.Log4JSLogFactory,
        Level: org.owasp.esapi.Logger.ERROR,
        // For a console that pops up in a seperate window
        // Appenders: [ new ConsoleAppender(true) ],
        // To log to a logging service on the server
        // Appenders: [ new AjaxAppender( '/log/' ) ],
        // Default to log nowhere
        Appenders: [  ],
        LogUrl: false,
        LogApplicationName: false,
        EncodingRequired: true
    },

    encoder: {
        Implementation: org.owasp.esapi.reference.encoding.DefaultEncoder,
        AllowMultipleEncoding: false
    },

    localization: {
        StandardResourceBundle: ESAPI_Standard_en_US,
        DefaultLocale: 'en-US'
    },

    validation: {
        Implementation: org.owasp.esapi.reference.validation.DefaultValidator,
        AccountName: '^[a-zA-Z0-9]{3,20}$',
        SafeString: '[a-zA-Z0-9\\-_+]*',
        Email: '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\\.[a-zA-Z]{2,4}$',
        IPAddress: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
        URL: '^(ht|f)tp(s?)\\:\\/\\/[0-9a-zA-Z]([-.\\w]*[0-9a-zA-Z])*(:(0-9)*)*(\\/?)([a-zA-Z0-9\\-\\.\\?\\,\\:\\\'\\/\\\\\\+=&amp;%\\$#_]*)?$',
        CreditCard: '^(\\d{4}[- ]?){3}\\d{4}$',
        SSN: '^(?!000)([0-6]\\d{2}|7([0-6]\\d|7[012]))([ -]?)(?!00)\\d\\d\\3(?!0000)\\d{4}$',
        HttpScheme: '^(http|https)$',
        HttpServerName: '^[a-zA-Z0-9_.\\-]*$',
        HttpParameterName: '^[a-zA-Z0-9_]{1,32}$',
        HttpParameterValue: '^[a-zA-Z0-9.\\-\\/+=_ ]*$',
        HttpCookieName: '^[a-zA-Z0-9\\-_]{1,32}$',
        HttpCookieValue: '^[a-zA-Z0-9\\-\\/+=_ ]*$'
    }
};