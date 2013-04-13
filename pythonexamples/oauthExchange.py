#!/usr/bin/env python

import urlparse
from rauth import OAuth1Service  # pip install rauth

import sys
sys.path.append('../lib/py')  # unnecessary if libZotero is installed separately
from libZotero import zotero


# Get a real consumer key & secret from https://www.zotero.org/oauth/apps
zotauth = OAuth1Service(
    name='zotero',
    consumer_key='<App Consumer Key>',
    consumer_secret='<App Consumer Secret>',
    request_token_url='https://www.zotero.org/oauth/request',
    access_token_url='https://www.zotero.org/oauth/access',
    authorize_url='https://www.zotero.org/oauth/authorize',
    base_url='https://api.zotero.org')

request_token, request_token_secret = zotauth.get_request_token(method='GET', params={'oauth_callback': 'oob'})
authorize_url = zotauth.get_authorize_url(request_token)

print 'Visit this URL in your browser: ' + authorize_url
pin = raw_input('Enter PIN from browser: ')

accessTokenResponse = zotauth.get_raw_access_token(request_token,
                                                    request_token_secret,
                                                    method='POST',
                                                    data={'oauth_verifier': pin})

if accessTokenResponse.status_code != 200:
    raise Exception("Error in Zotero OAuth token exchange")
accessVars = urlparse.parse_qs(accessTokenResponse.text)
apiKey = accessVars['oauth_token'][0]
userID = accessVars['userID'][0]
username = accessVars['username'][0]

zlib = zotero.Library('user', userID, username, apiKey)
