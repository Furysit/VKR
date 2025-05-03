from flask import render_template, request, session, redirect, url_for, flash, abort, jsonify
from flask_login import login_user, login_required, current_user, logout_user
from werkzeug.security import check_password_hash, generate_password_hash



from vkr import app,db,manager
from vkr.models import User, Board, Column, Block, student_board_association


@manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))


@app.route('/admin')
def admin_panel():
    if current_user.role == 'admin':
        return render_template('admin.html')
    else:
        return render_template('index.html')

@login_required
@app.route('/register' , methods = ['GET', 'POST'])
def register():

    name = request.form.get('name')
    surname = request.form.get('surname')
    patronymic = request.form.get('patronymic')
    login = request.form.get('email')
    password = request.form.get('password')
    role = request.form.get('role')
    group = request.form.get('group')

    if request.method == 'POST':
        # Проверка на заполненность полей
        if not (name and login and password and role):
            flash('Ошибка: Вы пропустили поле', 'error')
            return render_template('register.html')

        # Проверка на существующего пользователя
        existing_user = User.query.filter_by(email=login).first()
        if existing_user:
            flash('Ошибка: Пользователь с таким email уже существует!', 'error')
            return render_template('register.html')

        # Создание нового пользователя
        try:
            password_hash = generate_password_hash(password)
            new_user = User(name=name, surname = surname, patronymic = patronymic, email=login, password=password_hash, role=role, group=group)
            db.session.add(new_user)
            db.session.commit()
            flash('Пользователь успешно добавлен!', 'success')
            return redirect(url_for('index'))
        except Exception as e:
            db.session.rollback()
            flash(f'Ошибка при добавлении пользователя: {e}', 'error')
            return redirect(url_for('register'))
    return render_template('register.html')

@app.route('/authorization' , methods = ['GET', 'POST'])
def authorization():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        if not ( email and password ):
            flash('Ошибка: Все поля должны быть заполнены!', 'error')
            return render_template('authorization.html')
        
        if email and password:
            user = db.session.execute(
                db.select(User).filter_by(email = email)
            ).scalar_one_or_none()
            if user and check_password_hash(user.password, password):
                login_user(user)
                session['role'] = user.role
                flash(message='Вы вошли в систему')
                return redirect(url_for('index'))
        else:
            flash(message='Ошибка.Неправильные данные')
            return render_template('authorization.html')
    return render_template('authorization.html')


@login_required
@app.route('/boards')
def boards():
    if current_user.is_authenticated:
        if current_user.role == "teacher":
            # Преподаватель видит только свои доски
            boards = Board.query.filter_by(owner=current_user.id).all()
        elif current_user.role == "student":
            # Студент видит доски, к которым у него есть доступ
            boards = current_user.boards
        elif current_user.role == 'admin':
            boards = Board.query.all()
        else:
            boards = []
        return render_template('boards.html', boards=boards)
    else:
        return redirect(url_for('authorization'))
    



@app.route('/board/<int:board_id>')
def board(board_id):
    # Получаем доску или выдаем 404
    board = Board.query.get_or_404(board_id)

    # Проверяем доступ к доске
    if current_user.role == "teacher" and board.owner != current_user.id:
        abort(403)  # Преподаватель видит только свои доски
    if current_user.role == "student" and board_id not in [b.id for b in current_user.boards]:
        abort(403)  # Студент видит только доски, к которым у него есть доступ

    # Загружаем колонки доски
    columns = Column.query.filter_by(board_id=board_id).all()

     # Загружаем студентов с их цветами
    students_list = db.session.execute(
        db.select(User.id, User.name, student_board_association.c.color)
        .join(student_board_association)
        .where(student_board_association.c.board_id == board_id)
        .where(User.role == "student")
    ).fetchall()

    students = [{"id": s.id, "name": s.name, "color": s.color} for s in students_list]
    current_user_color = next(
    (s.color for s in students_list if s.id == current_user.id),
    None  # Значение по умолчанию, если не найден
    )
    teacher = User.query.get(board.owner)

    
    return render_template('board_page.html', board=board, columns=columns, students=students, teacher=teacher, current_user_color = current_user_color)

@app.route('/user_page')
def user_page():
    theme = session.get('theme', 'light')  # Получаем текущую тему, по умолчанию light
    return render_template('user_page.html', theme=theme)

@app.route('/students_list')
def students_list():
    
    students = User.query.filter_by(role = 'student').all()

    students_with_boards = [
        {
            "student" : student,
            "boards": student.boards
        }
        for student in students
    ]
    return render_template('students.html', students_with_boards = students_with_boards)

@app.route('/teachers_list')
def teachers_list():
    
    teachers = User.query.filter_by(role = 'teacher').all()

    teachers_with_boards = [
    {
        "teacher": teacher,
        "boards": teacher.created_boards  # Только созданные доски
    }
    for teacher in teachers
]
    return render_template('teachers.html', teachers_with_boards = teachers_with_boards)




# ДОБАВЛЕНИЕ ДОСКИ
@app.route('/add_board', methods = ['GET', 'POST'])
def add_board():
    if request.method == 'POST':
        name = request.form['name']  # Имя доски
        owner_id = request.form.get('owner')  # ID преподавателя, создающего доску
        selected_students = request.form.getlist('students')  # Выбранные студенты

        # Проверка: является ли пользователь преподавателем
        owner = User.query.get(owner_id)
        if not owner or owner.role != 'teacher':
            return "Error: Only teachers can create boards.", 403

        # Создание доски
        new_board = Board(name=name, owner=owner_id)

        # Добавление студентов с доступом
        for student_id in selected_students:
            student = User.query.get(int(student_id))
            if student and student.role == 'student':  # Только студенты могут быть добавлены
                new_board.students.append(student)

        db.session.add(new_board)
        db.session.commit()

        return redirect(url_for('add_board'))

    # Получение всех преподавателей и студентов для отображения в форме
    teachers = User.query.filter_by(role='teacher').all()
    students = User.query.filter_by(role='student').all()
    

    return render_template('add_board.html', teachers=teachers, students=students)
###############################




# ОПЕРАЦИИ С DRAG N DROP
@app.route('/board/<int:board_id>/add_column', methods = ['POST'])
def add_column(board_id):
    data = request.get_json()
    column_name = data.get('name')

    if not column_name or not column_name.strip():
        return {"error": "Пустое название колонки"}, 400
    
    new_column = Column(name = column_name, board_id = board_id)
    
    db.session.add(new_column)
    db.session.commit()

    return {"message": "Колонка добавлена", "column_id": new_column.id}, 201
    
@app.route('/board/<int:board_id>/delete_column/<int:column_id>', methods=['DELETE'])
def delete_column(board_id, column_id):
    column = Column.query.get_or_404(column_id)
    if column.board_id != board_id:
        return {"error": "Колонка не принадлежит этой доске"}, 403
    
    Block.query.filter_by(column_id=column.id).delete()
    db.session.delete(column)
    db.session.commit()

    return {"message": "Колонка удалена"}, 200

@app.route('/board/<int:board_id>/move_column', methods=['POST'])
def move_column(board_id):
    data = request.get_json()
    new_order = data.get('order')
    if new_order is None or not isinstance(new_order, list):
        return jsonify({"error": "Неверные данные для обновления порядка"}), 400

    # Предполагается, что модель Column имеет поле order (например, Integer)
    for index, column_id in enumerate(new_order):
        column = Column.query.get(column_id)
        if column and column.board_id == board_id:
            column.order = index
    db.session.commit()
    return jsonify({"message": "Порядок колонок обновлён"}), 200

@app.route('/board/<int:board_id>/add_block/<int:column_id>', methods=['POST'])
def add_block(board_id, column_id):
    data = request.get_json()
    text = data.get('text')
    if not text:
        return jsonify({'error': 'Текст блока обязателен'}), 400

    # Пример создания блока
    new_block = Block(text=text, column_id=column_id)
    db.session.add(new_block)
    db.session.commit()

    return jsonify({'block_id': new_block.id})

@app.route('/board/<int:board_id>/delete_block', methods=['DELETE'])
def delete_block(board_id):
    data = request.get_json()
    block_id = data.get('block_id')
    if not block_id:
        return jsonify({"error": "Отсутствует идентификатор блока"}), 400

    block = Block.query.get_or_404(block_id)
    # Проверка принадлежности блока доске (если требуется)
    column = Column.query.get(block.column_id)
    if column.board_id != board_id:
        return jsonify({"error": "Блок не принадлежит этой доске"}), 403

    db.session.delete(block)
    db.session.commit()
    return jsonify({"message": "Блок удалён"}), 200

@app.route('/board/<int:board_id>/move_block', methods=['POST'])
def move_block(board_id):
    data = request.json
    block_id = data.get('block_id')
    new_column_id = data.get('column_id')


    # Найти блок и обновить его колонку
    block = Block.query.get(block_id)
    if block:
        block.column_id = new_column_id
        db.session.commit()
        return jsonify({"success": True}), 200

    return jsonify({"error": "Блок не найден"}), 404


########################################################

@app.route('/save_color', methods=["POST"])
@login_required
def save_color():
    data = request.get_json()
    board_id = data.get('board_id')
    color = data.get('color')

    if not board_id or not color:
        return jsonify({"error": "Неверные данные"}), 400

    # Проверяем, есть ли связь между студентом и доской
    association = db.session.execute(
        db.select(student_board_association).where(
            student_board_association.c.student_id == current_user.id,
            student_board_association.c.board_id == board_id
        )
    ).fetchone()

    if association:
        # Обновляем цвет
        db.session.execute(
            student_board_association.update()
            .where(student_board_association.c.student_id == current_user.id)
            .where(student_board_association.c.board_id == board_id)
            .values(color=color)
        )
        db.session.commit()
        return jsonify({"message": "Цвет сохранен!"}), 200
    else:
        return jsonify({"error": "Связь не найдена"}), 404


@app.route('/update_block_color/<int:block_id>', methods=['POST'])
@login_required
def update_block_color(block_id):
    data = request.get_json()
    new_color = data.get('color')

    block = Block.query.get(block_id)
    if not block:
        return jsonify({"error": "Блок не найден"}), 404

    # Сохраняем только цвет (привязку к пользователю не меняем)
    block.color = new_color
    db.session.commit()

    return jsonify({"message": "Цвет успешно обновлен!"})

@app.route('/change_colorset', methods = ["POST"])
def change_colorset():
    theme = session.get('theme', 'light')
    if theme == 'light':
        session['theme'] = 'dark'
    else: 
        session['theme'] = 'light'
    return redirect(url_for('index'))

@app.context_processor
def inject_theme():
    theme = session.get('theme', 'light')  # Тема по умолчанию — "light"
    return {'theme': theme}  # Передает переменную theme во все шаблоны