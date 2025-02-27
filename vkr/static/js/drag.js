document.addEventListener('DOMContentLoaded', () => {
    const columnsContainer = document.querySelector('.columns-container');
    const trashZone = document.querySelector('.trash-zone');
  
    let draggedElement = null; // Элемент, который перетаскивается (блок или колонка)
    let draggedType = null;    // 'block' или 'column'
  
    // ----- Настройка draggable для блоков -----
    document.querySelectorAll('.block').forEach(block => {
      block.setAttribute('draggable', 'true');
  
      block.addEventListener('dragstart', (e) => {
        // Останавливаем всплытие, чтобы избежать перехвата родительскими элементами
        e.stopPropagation();
        draggedElement = e.currentTarget; // всегда сам элемент с классом .block
        draggedType = 'block';
        e.dataTransfer.effectAllowed = 'move';
        // Сохраняем тип в dataTransfer для дополнительной проверки
        e.dataTransfer.setData('text/plain', 'block');
        e.currentTarget.classList.add('dragging');
        console.log('БЛОК взят, id:', draggedElement.dataset.blockId);
      });
  
      block.addEventListener('dragend', (e) => {
        e.currentTarget.classList.remove('dragging');
        draggedElement = null;
        draggedType = null;
        console.log("БЛОК опущен");
      });
    });
  
    // ----- Настройка draggable для колонок (только для возможности удаления) -----
    document.querySelectorAll('.column').forEach(column => {
      column.setAttribute('draggable', 'true');
  
      column.addEventListener('dragstart', (e) => {
        // Если внутри колонки перетаскивают блок, этот обработчик не должен срабатывать
        if (e.target.closest('.block')) {
          return;
        }
        e.stopPropagation();
        draggedElement = e.currentTarget; // колонка
        draggedType = 'column';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', 'column');
        e.currentTarget.classList.add('dragging');
        console.log('КОЛОНКА взята, id:', draggedElement.dataset.columnId);
      });
  
      column.addEventListener('dragend', (e) => {
        e.currentTarget.classList.remove('dragging');
        draggedElement = null;
        draggedType = null;
        console.log("КОЛОНКА опущена");
      });
    });
  
    // ----- Перетаскивание блоков внутри колонок (drop на контейнер блоков) -----
    document.querySelectorAll('.blocks-container').forEach(container => {
      container.addEventListener('dragover', (e) => {
        e.preventDefault();
        container.classList.add('dragover');
      });
  
      container.addEventListener('dragleave', () => {
        container.classList.remove('dragover');
      });
  
      container.addEventListener('drop', async (e) => {
        e.preventDefault();
        container.classList.remove('dragover');
  
        // Проверяем тип из dataTransfer (на всякий случай)
        const dtType = e.dataTransfer.getData('text/plain');
        console.log('Drop на блокс-контейнере, dataTransfer type:', dtType);
        
        if (draggedType === 'block') {
          // Перемещаем блок в этот контейнер
          container.appendChild(draggedElement);
          const blockId = draggedElement.dataset.blockId;
          const newColumnId = container.closest('.column').dataset.columnId;
          console.log('Перемещаем блок', blockId, 'в колонку', newColumnId);
          await updateBlockColumn(blockId, newColumnId);
        }
      });
    });
  
    // ----- Зона мусорки для удаления блоков и колонок -----
    if (trashZone) {
      trashZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        trashZone.classList.add('dragover');
      });
      trashZone.addEventListener('dragleave', () => {
        trashZone.classList.remove('dragover');
      });
      trashZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        trashZone.classList.remove('dragover');
        // Получаем тип из dataTransfer для проверки
        const dtType = e.dataTransfer.getData('text/plain');
        console.log('Drop в мусорку, dataTransfer type:', dtType);
        
        if (draggedType === 'block') {
          const blockId = draggedElement.dataset.blockId;
          console.log('Удаляем блок, id:', blockId);
          await deleteBlock(blockId);
          if (draggedElement) {
            draggedElement.remove();
          }
        } else if (draggedType === 'column') {
          const columnId = draggedElement.dataset.columnId;
          console.log('Удаляем колонку, id:', columnId);
          await deleteColumn(columnId);
          if (draggedElement) {
            draggedElement.remove();
          }
        }
      });
    }
  
    // ----- Функции для работы с сервером -----
    async function updateBlockColumn(blockId, newColumnId) {
      console.log('Вызвана функция updateBlockColumn для блока', blockId, 'в колонку', newColumnId);
      try {
        const response = await fetch(`/board/${boardId}/move_block`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ block_id: blockId, column_id: newColumnId })
        });
        if (!response.ok) {
          alert('Ошибка при перемещении блока.');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось переместить блок.');
      }
    }
  
    async function deleteBlock(blockId) {
        try {
          const response = await fetch(`/board/${boardId}/delete_block`, {
            method: 'DELETE', // Используем метод DELETE
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ block_id: blockId }) // Передаём block_id в теле запроса
          });
          if (!response.ok) {
            alert('Ошибка при удалении блока.');
          }
        } catch (error) {
          console.error('Ошибка:', error);
          alert('Не удалось удалить блок.');
        }
      }
  
    async function deleteColumn(columnId) {
      try {
        const response = await fetch(`/board/${boardId}/delete_column/${columnId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
          alert('Ошибка при удалении колонки.');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось удалить колонку.');
      }
    }
  });
  