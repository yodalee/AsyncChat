
import os

import webapp2
import jinja2
import base64

from google.appengine.ext.webapp import util

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)


class MainPage(webapp2.RequestHandler):
    @util.login_required
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('template/AsyncChat.html')
        self.response.write(template.render())


class UploadHandler(webapp2.RequestHandler):
    def post(self):
        data = self.request.get("file").replace(" ", "+")
        print(data)
        try:
            decoded = base64.b64decode(data)
        except ValueError:
            pass

app = webapp2.WSGIApplication([
    ('/index.html', MainPage),
    ('/upload', UploadHandler),
], debug=True)
