
import sys
import os
from Settings import Settings
# http://docs.python-requests.org/en/master/user/quickstart/#make-a-request
import requests
import datetime
import json
import jwt
import os
import requests


logger = Settings.get_logger(__name__)

# @see https://github.com/AdobeDocs/analytics-2.0-apis
class AdobeAnalytics:

    token = None

    # See sample code https://github.com/AdobeDocs/adobeio-auth/blob/master/JWT/samples/adobe-jwt-python/jwtencode.py
    def get_token(self):
        
        # Config Data
        url = 'https://ims-na1.adobelogin.com/ims/exchange/jwt'

        jwtPayloadRaw = os.getenv('ADOBE_JWT_TOKEN')

        logger.debug('ADOBE_JWT = ' + jwtPayloadRaw)

        jwtPayloadJson = json.loads(jwtPayloadRaw)
        jwtPayloadJson["exp"] = datetime.datetime.utcnow() + datetime.timedelta(seconds=30)

        accessTokenRequestPayload = {'client_id': os.getenv('ADOBE_CLIENT_ID'), 'client_secret': os.getenv('ADOBE_API_SECRET')}

        # Request Access Key 
        # This Needs to point at where your private key is on the file system
        #keyfile = open(os.path.join(os.path.expanduser('~'),'.ssh/private.key'),'r') 
        #private_key = keyfile.read()
        private_key = os.getenv('ADOBE_PRIVATE_KEY')

        # Encode the jwt Token
        jwttoken = jwt.encode(jwtPayloadJson, private_key, algorithm='RS256')
        #print("Encoded JWT Token")
        #print(jwttoken.decode('utf-8'))


        # We are making a http request simmilar to this curl request
        #curl -X POST -H "Content-Type: multipart/form-data" -F "client_id=6e806c8aa87b42a49260d7a47a8d3218" -F "client_secret=f4813774-c72f-42ca-8039-3208ff189932" -F "jwt_token=`./jwtenc.sh`" https://ims-na1.adobelogin.com/ims/exchange/jwt
        accessTokenRequestPayload['jwt_token'] = jwttoken
        result = requests.post(url, data = accessTokenRequestPayload)
        resultjson = json.loads(result.text);
        
        print("Full output from the access token request")
        print(json.dumps(resultjson, indent=4, sort_keys=True))

        # Echo out the access token
        print(resultjson["access_token"])


    @staticmethod
    def get_analytics():

        # @see http://docs.python-requests.org/en/master/user/quickstart/#make-a-request

        # Set up the parameters we want to pass to the API.
        # This is the latitude and longitude of New York City.
        parameters = {"lat": 40.71, "lon": -74}

        # Make a get request with the parameters.
        
        response = requests.get("http://api.open-notify.org/iss-pass.json", params=parameters)

        # Print the content of the response (the data the server returned)
        print(response.content)

        # This gets the same data as the command above
        response = requests.get("http://api.open-notify.org/iss-pass.json?lat=40.71&lon=-74")
        print(response.content)

    

    
