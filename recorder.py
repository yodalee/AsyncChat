
import os
import base64

import webapp2
import jinja2

from google.appengine.ext.webapp import util
from google.appengine.ext import ndb

from datastore import RecordFile

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)


class RecordPage(webapp2.RequestHandler):
    @util.login_required
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('template/Record.html')
        self.response.write(template.render())


class PlayPage(webapp2.RequestHandler):
    """Play recorded sound"""
    @util.login_required
    def get(self):
        urlString = self.request.get("key")

        template = JINJA_ENVIRONMENT.get_template('template/Play.html')
        self.response.write(
                template.render(audioaddress='/wav?key=%s' % urlString)
        )


class GetAudio(webapp2.RequestHandler):
    def get(self):
        urlString = self.request.get("key")
        retrieveKey = ndb.Key(urlsafe=urlString)
        recordFile = retrieveKey.get()

        if recordFile.content:
            self.response.headers['Content-Type'] = 'audio/wav'
            self.response.write(recordFile.content)


class UploadHandler(webapp2.RequestHandler):
    def post(self):
        print(self.request.body)
        try:
            decoded = base64.b64decode(self.request.body)
            recordFile = RecordFile(
                    content=decoded,
                    )
            retrieveKey = recordFile.put()
            self.response.write(retrieveKey.urlsafe())
        except ValueError:
            self.response.write("Cannot decode the wav file, record again")


app = webapp2.WSGIApplication([
    ('/record', RecordPage),
    ('/play', PlayPage),
    ('/wav', GetAudio),
    ('/upload', UploadHandler),
], debug=True)
