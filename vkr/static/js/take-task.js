document.addEventListener('DOMContentLoaded', () => {
    const columnsContainer = document.querySelector('.columns-container');

    // Обработчик клика на "Взять задачу себе"
    columnsContainer.addEventListener('click', async (event) => {
        const takeTaskBtn = event.target.closest('.take-task');
        if (!takeTaskBtn) return;

        const blockElement = takeTaskBtn.closest('.block');
        const blockId = blockElement.dataset.blockId;
        const userColor = getUserColor(); // Получаем цвет текущего пользователя
        

        if (!userColor || userColor === "#FFFFFF" || userColor === "#ffffff") {
            alert("Пожалуйста, сначала выберите цвет");
            return; // Прекращаем выполнение
        }

        try {
            // Отправляем цвет на сервер
            const response = await fetch(`/update_block_color/${blockId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ color: userColor })
            });

            if (!response.ok) {
                alert("Ошибка при сохранении цвета блока.");
                return;
            }
            else{
                location.reload();
            }

            // Меняем цвет блока в интерфейсе
            blockElement.style.borderBottom = `1rem solid ${userColor}`;
        } catch (error) {
            console.error("Ошибка при изменении цвета блока:", error);
        }
    });

    // Функция получения цвета текущего пользователя
    function getUserColor() {
        const colorCircle = document.querySelector(".current-user-color-circle");
        if (!colorCircle) return null;

        const rgbColor = window.getComputedStyle(colorCircle).backgroundColor;
        if (rgbColor == "rgb(255, 255, 255)"){
            return null
        }
        return rgbToHex(rgbColor);
    }

    // Функция конвертации RGB в HEX
    function rgbToHex(rgb) {
        // Проверяем, что строка соответствует формату "rgb(r, g, b)"
        const rgbRegex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
        const match = rgbRegex.exec(rgb);

        if (!match) {
            console.warn("Некорректный формат RGB:", rgb);
            return null;
        }

        // Извлекаем r, g, b
        const r = parseInt(match[1], 10);
        const g = parseInt(match[2], 10);
        const b = parseInt(match[3], 10);

        // Конвертируем в HEX
        const toHex = (c) => {
            const hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    }
});