from vkr import db, manager
from flask_login import UserMixin



class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(50), nullable = False)
    surname = db.Column(db.String(50))
    patronymic = db.Column(db.String(50))

    email = db.Column(db.String(50), nullable = False)
    password = db.Column(db.String(255), nullable = False)
    role = db.Column(db.String(50), nullable = False)
    group = db.Column(db.String(50))
    # Связь: доски, созданные преподавателем
    created_boards = db.relationship('Board', backref='owner_user', lazy=True)


# Ассоциативная таблица для связи студентов и досок
student_board_association = db.Table(
    'student_board_association',
    db.Column('student_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('board_id', db.Integer, db.ForeignKey('board.id'), primary_key=True),
    db.Column('color', db.String(7))
)

class Board(db.Model):
    __tablename__ = 'board'
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(50), nullable = False)
    owner = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False) #Внешний ключ на User.id
    # Связь: Доска может содержать несколько колонок
    columns = db.relationship('Column', backref = 'board', lazy = True) 
    # Связь: студенты, которые имеют доступ к доске
    students = db.relationship(
        'User',
        secondary=student_board_association,
        backref=db.backref('boards', lazy=True)
    )

class Column(db.Model):
    __tablename__ = 'column'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    board_id = db.Column(db.Integer, db.ForeignKey('board.id'), nullable=False)  # Внешний ключ на Board.id

    # Связь: колонка может содержать несколько блоков
    blocks = db.relationship('Block', backref='column', lazy=True)

class Block(db.Model):
    __tablename__ = 'block'
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(255), nullable=False)
    color = db.Column(db.String(7))
    column_id = db.Column(db.Integer, db.ForeignKey('column.id'), nullable=False)  # Внешний ключ на Column.id