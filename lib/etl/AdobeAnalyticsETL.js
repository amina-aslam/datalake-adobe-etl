'use strict'

const Settings = require('../Settings')
const AdobeAnalytics = require('../sources/AdobeAnalytics')
const Logger = require('../utils/Logger');
const AdobeReportSuite = require('../models/AdobeReportSuite')(Settings.sequelize)
const Promise = require('bluebird')
const _ = require("lodash")
const moment = require("moment")

const AdobeAnalyticsETL = {


    async run(){

        //let maxDate = await FacebookProfileMetrics.max('date')
        //let dates = AdobeAnalyticsETL.getDates(maxDate, 30)

        await AdobeAnalyticsETL.syncReportSuites()

        return null
    },

    /**
     * Update the list of social profiles, a pre-requsite to getting other metrics
     */
    async syncReportSuites(){

        Logger.debug(`Getting available report suites`)
        let response = await AdobeAnalytics.getCollectionSuites()

        return await Promise.map(response.content, async (suite)=>{

            let doc = await AdobeReportSuite.findOne({where:{rsid:suite.rsid}})

            if (!doc){
                doc = new AdobeReportSuite({rsid:suite.rsid})
            }

            doc.parentRsid = (suite.parentRsid) ? suite.parentRsid : null
            doc.timezone = suite.timezoneZoneinfo
            doc.name = suite.name

            return await doc.save()

        }, {concurrency:10})

    },

}



if(require.main === module) {

    AdobeAnalyticsETL.run()
        .then((info) => {
            Logger.info('Sync complete')
        })
        .catch((err) => {
            Logger.error(err)
        })

}
else {
    module.exports = AdobeAnalyticsETL;
}

