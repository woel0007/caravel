"""The main config file for Caravel

All configuration in this file can be overridden by providing a caravel_config
in your PYTHONPATH as there is a ``from caravel_config import *``
at the end of this file.
"""
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

import os

from dateutil import tz
from flask_appbuilder.security.manager import AUTH_DB

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


# ---------------------------------------------------------
# Caravel specific config
# ---------------------------------------------------------
ROW_LIMIT = 50000
CARAVEL_WORKERS = 16

CARAVEL_WEBSERVER_PORT = 8088
CARAVEL_WEBSERVER_TIMEOUT = 60

CUSTOM_SECURITY_MANAGER = None
# ---------------------------------------------------------

# Your App secret key
SECRET_KEY = '\2\1thisismyscretkey\1\2\e\y\y\h'  # noqa

# The SQLAlchemy connection string.
SQLALCHEMY_DATABASE_URI = 'sqlite:////tmp/caravel.db'
# SQLALCHEMY_DATABASE_URI = 'mysql://myapp@localhost/myapp'
# SQLALCHEMY_DATABASE_URI = 'postgresql://root:password@localhost/myapp'

# Flask-WTF flag for CSRF
CSRF_ENABLED = True

# Whether to run the web server in debug mode or not
DEBUG = False

# Whether to show the stacktrace on 500 error
SHOW_STACKTRACE = True

# ------------------------------
# GLOBALS FOR APP Builder
# ------------------------------
# Uncomment to setup Your App name
APP_NAME = "Caravel"

# Uncomment to setup Setup an App icon
APP_ICON = "/static/assets/images/caravel_logo.png"

# Druid query timezone
# tz.tzutc() : Using utc timezone
# tz.tzlocal() : Using local timezone
# other tz can be overridden by providing a local_config
DRUID_IS_ACTIVE = True
DRUID_TZ = tz.tzutc()

# ----------------------------------------------------
# AUTHENTICATION CONFIG
# ----------------------------------------------------
# The authentication type
# AUTH_OID : Is for OpenID
# AUTH_DB : Is for database (username/password()
# AUTH_LDAP : Is for LDAP
# AUTH_REMOTE_USER : Is for using REMOTE_USER from web server
AUTH_TYPE = AUTH_DB

# Uncomment to setup Full admin role name
# AUTH_ROLE_ADMIN = 'Admin'

# Uncomment to setup Public role name, no authentication needed
# AUTH_ROLE_PUBLIC = 'Public'

# Will allow user self registration
# AUTH_USER_REGISTRATION = True

# The default user self registration role
# AUTH_USER_REGISTRATION_ROLE = "Public"

# When using LDAP Auth, setup the ldap server
# AUTH_LDAP_SERVER = "ldap://ldapserver.new"

# Uncomment to setup OpenID providers example for OpenID authentication
# OPENID_PROVIDERS = [
#    { 'name': 'Yahoo', 'url': 'https://me.yahoo.com' },
#    { 'name': 'AOL', 'url': 'http://openid.aol.com/<username>' },
#    { 'name': 'Flickr', 'url': 'http://www.flickr.com/<username>' },
#    { 'name': 'MyOpenID', 'url': 'https://www.myopenid.com' }]

# ---------------------------------------------------
# Roles config
# ---------------------------------------------------
# Grant public role the same set of permissions as for the GAMMA role.
# This is useful if one wants to enable anonymous users to view
# dashboards. Explicit grant on specific datasets is still required.
PUBLIC_ROLE_LIKE_GAMMA = False

# ---------------------------------------------------
# Babel config for translations
# ---------------------------------------------------
# Setup default language
BABEL_DEFAULT_LOCALE = 'en'
# Your application default translation path
BABEL_DEFAULT_FOLDER = 'babel/translations'
# The allowed translation for you app
LANGUAGES = {
    'en': {'flag': 'us', 'name': 'English'},
    # 'fr': {'flag': 'fr', 'name': 'French'},
    # 'zh': {'flag': 'cn', 'name': 'Chinese'},
}
# ---------------------------------------------------
# Image and file configuration
# ---------------------------------------------------
# The file upload folder, when using models with files
UPLOAD_FOLDER = BASE_DIR + '/app/static/uploads/'

# The image upload folder, when using models with images
IMG_UPLOAD_FOLDER = BASE_DIR + '/app/static/uploads/'

# The image upload url, when using models with images
IMG_UPLOAD_URL = '/static/uploads/'
# Setup image size default is (300, 200, True)
# IMG_SIZE = (300, 200, True)

CACHE_DEFAULT_TIMEOUT = None
CACHE_CONFIG = {'CACHE_TYPE': 'null'}

# CORS Options
ENABLE_CORS = False
CORS_OPTIONS = {}


# ---------------------------------------------------
# List of viz_types not allowed in your environment
# For example: Blacklist pivot table and treemap:
#  VIZ_TYPE_BLACKLIST = ['pivot_table', 'treemap']
# ---------------------------------------------------

VIZ_TYPE_BLACKLIST = []

# ---------------------------------------------------
# List of data sources not to be refreshed in druid cluster
# ---------------------------------------------------

DRUID_DATA_SOURCE_BLACKLIST = []

"""
1) http://docs.python-guide.org/en/latest/writing/logging/
2) https://docs.python.org/2/library/logging.config.html
"""

# Console Log Settings

LOG_FORMAT = '%(asctime)s:%(levelname)s:%(name)s:%(message)s'
LOG_LEVEL = 'DEBUG'

# ---------------------------------------------------
# Enable Time Rotate Log Handler
# ---------------------------------------------------
# LOG_LEVEL = DEBUG, INFO, WARNING, ERROR, CRITICAL

ENABLE_TIME_ROTATE = False
TIME_ROTATE_LOG_LEVEL = 'DEBUG'
FILENAME = '/tmp/caravel.log'
ROLLOVER = 'midnight'
INTERVAL = 1
BACKUP_COUNT = 30

# Set this API key to enable Mapbox visualizations
MAPBOX_API_KEY = ""


try:
    from caravel_config import *  # noqa
except ImportError:
    pass

if not CACHE_DEFAULT_TIMEOUT:
    CACHE_DEFAULT_TIMEOUT = CACHE_CONFIG.get('CACHE_DEFAULT_TIMEOUT')
