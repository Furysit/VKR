document.addEventListener("DOMContentLoaded", () => {
    const colorPicker = document.getElementById("color-picker");
    const currentUserCircle = document.querySelector(".current-user-color-circle");


    let timeout = null; // Переменная для хранения таймера

    colorPicker.addEventListener("input", (event) => {
        const selectedColor = event.target.value;
        currentUserCircle.style.backgroundColor = selectedColor;

        // Если уже есть таймер, сбрасываем его
        if (timeout) clearTimeout(timeout);

        // Устанавливаем новый таймер
        timeout = setTimeout(() => {
            fetch("/save_color", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ board_id: boardId, color: selectedColor })
            })
            .then(response => response.json())
            .then(data => console.log("Ответ сервера:", data))
            .catch(error => console.error("Ошибка сохранения цвета:", error));
        }, 500); // Запрос отправится только через 500 мс после последнего изменения цвета
    });

    // Кликаем по кружку — открывается палитра
    currentUserCircle.addEventListener("click", () => {
        const computedColor = getComputedStyle(currentUserCircle).backgroundColor;

        if (computedColor === "rgb(255, 255, 255)") {
            colorPicker.click(); // Открываем палитру, если цвет белый
        } else {
            alert("Вы уже выбрали цвет");
        }
    });

    
});