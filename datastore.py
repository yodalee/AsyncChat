from google.appengine.ext import ndb


class RecordFile(ndb.Model):
    """One uploaded sound with sound, upload date, and random generated URL"""
    content = ndb.BlobProperty(indexed=False)
    date = ndb.DateTimeProperty(auto_now_add=True)
