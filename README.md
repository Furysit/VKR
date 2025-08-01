# 🎓 VKR Trello-Clone — веб-приложение для координации студенческих проектов

Этот проект — дипломная работа, созданная на Flask. Это аналог Trello, предназначенный для взаимодействия между студентами и преподавателями в рамках проектной деятельности.

---

## 🚀 Возможности

- 👥 Роли пользователей: студент / преподаватель / админ
- 🔐 Регистрация и авторизация с защитой пароля (Flask-Login + Werkzeug)
- 📋 CRUD-доски, колонки и блоки
- 🧩 Drag & Drop интерфейс для работы с задачами (JS)
- 🎨 Настройка цветов карточек и досок
- 🌙 Переключение темы (светлая/тёмная)
- 🔒 Разграничение доступа к доскам по ролям
- 🧾 Панели преподавателей и студентов с отображением досок

---

## 🧱 Стек технологий

| Технология         | Назначение                         |
|--------------------|------------------------------------|
| Python + Flask     | Бэкенд, маршруты и логика          |
| SQLAlchemy         | ORM и работа с базой данных        |
| SQLite             | Локальная БД (можно заменить на Postgres) |
| Flask-Login        | Авторизация, управление сессиями   |
| Jinja2             | Шаблоны фронтенда                  |
| JavaScript (Vanilla)| Drag & Drop, динамика интерфейса  |
| HTML + CSS         | Вёрстка страниц                    |

---

## 🖼 Демонстрация



https://github.com/user-attachments/assets/d385ccb9-917e-47cf-9c3a-ef5ba6929592


---

# Клонируйте репозиторий
git clone https://github.com/your-username/vkr-flask-trello-clone.git
cd vkr-flask-trello-clone

# Создайте виртуальное окружение
python -m venv venv
source venv/bin/activate  # или venv\Scripts\activate на Windows

# Установите зависимости
pip install -r requirements.txt

# Запустите приложение
flask run / python app.py


