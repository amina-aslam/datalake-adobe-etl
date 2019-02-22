# fabfile.py

from dotenv import load_dotenv
import sys, os
import numpy as np
import logging
import psycopg2
from sqlalchemy import create_engine
from pathlib import Path 
import os.path
import coloredlogs


class Settings:

    engine = None

    @staticmethod
    def init():

        dirname = os.path.dirname
        
        root_dir = dirname((dirname(os.path.abspath(__file__))))
        load_dotenv(os.path.join(root_dir, '.env'), verbose=True)

    @staticmethod
    def get_logger(name):

        # Create a logger object.
        logger = logging.getLogger(name)

        # By default the install() function installs a handler on the root logger,
        # this means that log messages from your code and log messages from the
        # libraries that you use will all show up on the terminal.
        coloredlogs.install(level=os.getenv('LOG_LEVEL', 'DEBUG'))

        # If you don't want to see log messages from libraries, you can pass a
        # specific logger object to the install() function. In this case only log
        # messages originating from that logger will show up on the terminal.
        coloredlogs.install(level=os.getenv('LOG_LEVEL', 'DEBUG'), logger=logger)

        return logger

    @staticmethod
    def get_database():
        
        logger = Settings.get_logger(__name__)

        try:

            if (Settings.engine == None):

                Settings.engine = create_engine(os.getenv('POSTGRES_URI'), pool_size = 50)

                logger.info("Connected to PostgreSQL database!")

            else :
                logger.info("Already connected to PostgreSQL database!")

        except IOError:
            logging.exception("Failed to get database connection!")
            return None, 'fail'

        return Settings.engine


Settings.init()

if __name__ == '__main__':

    Settings.get_database()
