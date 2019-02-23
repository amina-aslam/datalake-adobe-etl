'use strict'

const Logger = require('./utils/Logger.js')
require('dotenv-safe').load()
const Sequelize = require('sequelize')

var Settings = {

    sequelize: null,

    init() {

        if (process.env.LOG_LEVEL) {
            Logger.setLevel(process.env.LOG_LEVEL)
        }

        // If we don't have a postgress url, then it's not needed
        if (!process.env.POSTGRES_URI) {
            Logger.warn("Service is not using Postgres")
            return callback()
        }

        Settings.sequelize = new Sequelize(encodeURI(process.env.POSTGRES_URI), {
            logging: false,
            dialect: 'postgres',
            dialectOptions: {
                ssl: true
            },
            enableOfflineQueue: false
        })

    }

}

Settings.init()

module.exports = Settings
