document.addEventListener('DOMContentLoaded', () => {
  const columnsContainer = document.querySelector('.columns-container');

  let draggedBlock = null;

  // Добавляем draggable и события на блоки
  document.querySelectorAll('.block').forEach(block => {
      block.setAttribute('draggable', 'true');

      block.addEventListener('dragstart', (e) => {
          draggedBlock = e.target;
          e.target.classList.add('dragging');
      });

      block.addEventListener('dragend', (e) => {
          e.target.classList.remove('dragging');
          draggedBlock = null;
      });
  });

  // Перетаскивание на колонку
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

          if (draggedBlock) {
              container.appendChild(draggedBlock);

              const blockId = draggedBlock.dataset.blockId;
              const newColumnId = container.closest('.column').dataset.columnId;

              // Обновление на сервере
              await updateBlockColumn(blockId, newColumnId);
              location.reload();
          }
      });
  });

  // Функция обновления блока на сервере
  async function updateBlockColumn(blockId, newColumnId) {
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
});