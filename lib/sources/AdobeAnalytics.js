'use strict'

require('dotenv-safe').load()
const Settings = require('../Settings')
const request = require('request');
const needle = require('needle');
const jwt = require('jsonwebtoken');
const Logger = require('../utils/Logger');
const moment = require('moment')
const sleep = require('util').promisify(setTimeout)

/**
 * Interface to AdobeAnalytics's API
 *  
 * @see https://github.com/AdobeDocs/analytics-2.0-apis
 */
var AdobeAnalytics = {

    bearerToken: null,
    url: 'https://analytics.adobe.io/api',

    init() {
        AdobeAnalytics
            .generateToken()
            .then((info) => {
                AdobeAnalytics.bearerToken = info.access_token
            })
            .catch(err => {
                Logger.error('Error getting Adobe JWT token;', err)
            })
    },

    /**
     * Generate a new JWT token
     * @see https://github.com/AdobeDocs/analytics-2.0-apis/blob/master/jwt.md
     * @see https://github.com/AdobeDocs/adobeio-auth/blob/master/JWT/samples/adobe-jwt-node/app.js
     */
    generateToken() {

        var private_key = process.env.ADOBE_PRIVATE_KEY // .replace('\\n', '\n')
        var meta_scopes = process.env.ADOBE_JWT_SCOPES.split(",")

        // Generate the JWT payload
        var jwtPayload = {
            exp: Math.round(87000 + Date.now() / 1000),
            iss: process.env.ADOBE_ORG_ID,
            sub: process.env.ADOBE_TECHNICAL_ACCOUNT_ID,
            aud: `https://ims-na1.adobelogin.com/c/${process.env.ADOBE_CLIENT_ID}`
        };

        for (var i = 0; i < meta_scopes.length; i++) {
            if (meta_scopes[i].indexOf("https") > -1) {
                jwtPayload[meta_scopes[i]] = true;
            } else {
                jwtPayload[`https://ims-na1.adobelogin.com/s/${meta_scopes[i]}`] = true;
            }
        }

        return new Promise((resolve, reject) => {

            jwt.sign(
                jwtPayload,
                private_key,
                {
                    algorithm: "RS256"
                },
                function (err, token) {

                    if (err) {
                        return reject(err)
                    }

                    var params = {
                        client_id: process.env.ADOBE_CLIENT_ID,
                        client_secret: process.env.ADOBE_API_SECRET,
                        jwt_token: token
                    }

                    var opts = {
                        headers: {
                            "cache-control": "no-cache"
                        },
                        multipart: true,
                        json: true
                    };

                    needle.post('https://ims-na1.adobelogin.com/ims/exchange/jwt/', params, opts, function (err, response, body) {
                        //request.post(accessTokenOptions, function(err, response, body) {

                        if (err) {
                            Logger.error("Error:" + err)
                            return reject(err)
                        }

                        AdobeAnalytics.bearerToken = body.access_token

                        return resolve(body.access_token)

                    });
                }
            );

        })

    },

    async getCollectionSuites() {        
        let limit = 100
        return await AdobeAnalytics.__send('get', `bbg1/collections/suites?limit=${limit}&expansion=name, parentRsid, timezoneZoneinfo`, null)
    },

    /**
     * 
     * Need page url: https://helpx.adobe.com/analytics/kb/obtaining-url-reports.html
     * @see https://adobedocs.github.io/analytics-2.0-apis/#/reports/runReport
     * @see https://github.com/AdobeDocs/analytics-2.0-apis/blob/master/reporting-guide.md
     */
    async getPageViews(rsid, startDate, endDate) {

        Logger.debug(`Getting page views for ${rsid} from ${startDate} to ${endDate}`)

        var params = {
            dimension: "variables/daterangeday",
            globalFilters: [
                {
                    dateRange: `${startDate}/${endDate}`,
                    type: "dateRange"
                }
            ],
            metricContainer: {
                metricFilters: [
                    {
                        dateRange: `${startDate}/${endDate}`,
                        id: "0",
                        type: "dateRange"
                    }
                ],
                metrics: [
                    {
                        columnId: "0",
                        filters: ["0"],
                        id: "metrics/pageviews"
                    },
                    {
                        columnId: "1",
                        filters: ["0"],
                        id: "metrics/visits"
                    },
                    {
                        columnId: "2",
                        filters: ["0"],
                        id: "metrics/averagetimespentonsite"
                    },
                    {
                        columnId: "3",
                        filters: ["0"],
                        id: "metrics/bouncerate"
                    },
                    {
                        columnId: "4",
                        filters: ["0"],
                        id: "metrics/visitors"
                    }
                ]
            },
            rsid: rsid,
            settings: {
                dimensionSort: "asc"
            }
        }

        return await AdobeAnalytics.__send('post', `bbg1/reports`, params)
    },

    /**
     * Send request to adobe
     * @param {string} verb 
     * @param {string} cmd 
     * @param {object} params 
     */
    async __send(verb, cmd, params) {

        if (!AdobeAnalytics.bearerToken){
            Logger.debug('Getting token')
            await AdobeAnalytics.generateToken()
        }

        var opts = {
            json: true,
            headers: {
                "Authorization": `Bearer ${AdobeAnalytics.bearerToken}`,
                "x-api-key": process.env.ADOBE_API_KEY,
                "x-proxy-global-company-id": "bbg1"
            }
        }

        return new Promise((resolve, reject) => {

            let cb = async (err, response, body) => {

                if (err) {
                    return reject(err)
                }

                return resolve(body)
            }

            if (verb == 'get') {
                needle.get(`${AdobeAnalytics.url}/${cmd}`, opts, cb)
            }
            else if (verb == 'post') {
                needle.post(`${AdobeAnalytics.url}/${cmd}`, params, opts, cb)
            }

        })


    }


};

//AdobeAnalytics.init()

if (require.main === module) {

    let noDays = 1
    let startDate = moment().utc().subtract(noDays,'days').startOf('day').format('YYYY-MM-DDTHH:mm')
    let endDate = moment().utc().endOf('day').format('YYYY-MM-DDTHH:mm')

    // 2015-04-01T00:00

    AdobeAnalytics.getPageViews('bbgrferlenglishapp', startDate, endDate)
        .then((info) => {
            Logger.info(info)
        })
        .catch((err) => {
            Logger.error(err)
        })
    
}
else {
    module.exports = AdobeAnalytics;
}
