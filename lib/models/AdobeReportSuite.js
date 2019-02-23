
"use strict";

const Sequelize = require('sequelize');

// http://docs.sequelizejs.com/manual/tutorial/models-definition.html

module.exports = function(sequelize) {

    var Model = sequelize.define('AdobeReportSuite', {        
        rsid: { type: Sequelize.STRING},
        parentRsid: { type: Sequelize.STRING, defaultValue:null},
        name: { type: Sequelize.STRING},
        timezone: { type: Sequelize.STRING}
    }, {
        createdAt: 'created',
        updatedAt: 'modified'
    });

    Model.sync({force:false})

    return Model
}
