from flask import Flask, render_template, request, flash, redirect, url_for, current_app, send_from_directory
from flask_login import login_user, login_required, LoginManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename




app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret_key'
# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://u2926938_default:w4LyTqR9np0B2fWK@localhost:3306/u2926938_flask_kino'
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://postgres:123@host.docker.internal:5432/flask_kino'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://postgres:123@localhost:5432/vkr'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db = SQLAlchemy(app)

manager = LoginManager(app)

migrate = Migrate(app, db)


from vkr import routes,models
