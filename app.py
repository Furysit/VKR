from vkr import app,db

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Создаем таблицы
    app.run(debug=True, host='0.0.0.0', port=5000)

