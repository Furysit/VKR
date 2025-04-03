document.addEventListener('DOMContentLoaded', () => {
    const columnsContainer = document.querySelector('.columns-container');
    const columnNameInput = document.getElementById('new-column-name');
    const addColumnButton = document.getElementById('add-column-btn');
    const goBackColumnButton = document.querySelector('.go-back-column');
    const addColumnForm = document.querySelector(".add-column-form");
    

    // **************LISTENERS*************************
    addColumnButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (columnNameInput.style.display === 'none' || columnNameInput.style.display === '') {
            columnNameInput.style.display = 'block';
            goBackColumnButton.style.display = 'block';
            columnNameInput.focus();
        } else {
            addColumnForm.requestSubmit();
        }
    });

    goBackColumnButton.addEventListener('click', (e) => {
        e.preventDefault();
        columnNameInput.style.display = 'none';
        columnNameInput.value = '';
        goBackColumnButton.style.display = 'none';
    });
    
    
    addColumnForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addColumn();
    });

    // Обработка кликов в пределах контейнера колонок (делегирование событий)
    columnsContainer.addEventListener('click', (event) => {
        // Если клик по кнопке "Добавить ячейку"
        const addBlockButton = event.target.closest('.add-block-btn');
        if (addBlockButton) {
          event.preventDefault();
          const columnElement = addBlockButton.closest('.column');
          const blockInput = columnElement.querySelector('.new-block-input');
          const backButton = columnElement.querySelector('.go-back');
    
          // Если поле ввода скрыто, показываем его и соответствующую кнопку "Назад"
          if (!blockInput || blockInput.style.display === 'none' || blockInput.style.display === '') {
            blockInput.style.display = 'block';
            backButton.style.display = 'block';
            blockInput.focus();
          } else {
            // Если уже видно — отправляем форму
            columnElement.querySelector('.add-block-form').requestSubmit();
          }
          return;
        }
    
        // Если клик по кнопке "Назад" внутри конкретной колонки
        const clickedBackButton = event.target.closest('.go-back');
        if (clickedBackButton) {
          event.preventDefault();
          const columnElement = clickedBackButton.closest('.column');
          const blockInput = columnElement.querySelector('.new-block-input');
    
          // Скрываем поле ввода и кнопку "Назад" для этой колонки
          if (blockInput) {
            blockInput.style.display = 'none';
            blockInput.value = '';
          }
          clickedBackButton.style.display = 'none';
          return;
        }
    
        // Другие обработчики (например, для удаления колонки) можно добавить здесь
      });
    
      // Обработка отправки формы добавления блока
      columnsContainer.addEventListener('submit', async (event) => {
        const form = event.target.closest('.add-block-form');
        if (form) {
          event.preventDefault();
          const columnElement = form.closest('.column');
          const blockInput = columnElement.querySelector('.new-block-input');
          const blockText = blockInput.value.trim();
    
          if (!blockText) {
            alert('Введите текст блока!');
            return;
          }
    
          
          await addBlockToColumn(columnElement, columnElement.dataset.columnId, blockText);
    
          // Сброс значений и скрытие элементов после отправки
          blockInput.value = '';
          blockInput.style.display = 'none';
          const backButton = columnElement.querySelector('.go-back');
          if (backButton) {
            backButton.style.display = 'none';
          }
          location.reload();
        }
      });


// ********************FUNCTIONS*****************************
    async function addColumn() {
        console.log('Скрипт вызвал добавление колонки');
        const columnName = columnNameInput.value.trim();
        if (!columnName) {
            alert('Введите название колонки!');
            return;
        }

        try {
            const response = await fetch(`/board/${boardId}/add_column`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: columnName })
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.error || 'Ошибка при добавлении колонки');
                return;
            }

            const { column_id } = await response.json();

            const newColumn = document.createElement('div');
            newColumn.classList.add('column');
            newColumn.setAttribute('data-column-id', column_id);
            newColumn.innerHTML = `
                <div class="column-info">
                    <h2>{{ column.name }}</h2>
                </div>
                <div class="blocks-container">
                        {% for block in column.blocks %}
                        <div class="block" data-block-id="{{ block.id }}">
                            {{ block.text }}
                        </div>
                        {% endfor %}
                </div>
                <div class="column-tools">
                    <form class="add-block-form">
                        <textarea type="text" class="new-block-input" placeholder="Введите текст блока" style="display: none;"></textarea>
                        <div style="display: flex; flex-direction: row;">
                            <button class="add-block-btn" type="submit">Добавить ячейку</button>
                            <button class="go-back" type="button" style="display: none;">
                                <img src="{{ url_for('static', filename='img/back.png') }}" alt="Назад">
                            </button>
                        </div>
                    </form>
                </div>
            `;
            columnsContainer.appendChild(newColumn);

            columnNameInput.value = '';
            columnNameInput.style.display = 'none'; // Скрыть поле после добавления
            newColumn.classList.add('fade-in'); // Анимация появления
            location.reload();
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось добавить колонку.');
        }
    }

    async function deleteColumn(columnElement, columnId) {
        if (!confirm('Вы уверены, что хотите удалить эту колонку?')) return;

        try {
            const response = await fetch(`/board/${boardId}/delete_column/${columnId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                alert('Ошибка при удалении колонки.');
                return;
            }

            columnElement.remove();
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось удалить колонку.');
        }
    }
    

    async function addBlockToColumn(columnElement, columnId, blockText) {
        try {
            const response = await fetch(`/board/${boardId}/add_block/${columnId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: blockText })
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.error || 'Ошибка при добавлении блока.');
                return;
            }
    
            const { block_id } = await response.json();
    
            const newBlock = document.createElement('div');
            newBlock.classList.add('block');
            newBlock.setAttribute('data-block-id', block_id);
            newBlock.textContent = blockText;
            columnElement.querySelector('.blocks-container').prepend(newBlock);
            location.reload();
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось добавить блок.');
        }
    }







    console.log('Скрипт board.js загружен и работает!');
});

