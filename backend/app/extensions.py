from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from flask_cors import CORS


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)
cors = CORS()