document.addEventListener("DOMContentLoaded", () => {
    const popup = document.getElementById("members-div");
    const openBtn = document.querySelector(".show-members-btn");
    const closeBtn = document.querySelector(".close");

    openBtn.addEventListener("click", (event) => {
        // Получаем координаты кнопки
        const rect = openBtn.getBoundingClientRect();
        popup.style.top = `${rect.bottom + window.scrollY + 5}px`; // Чуть ниже кнопки
        popup.style.left = `${rect.left + window.scrollX}px`; // На уровне кнопки
        popup.style.display = "block";
    });

    closeBtn.addEventListener("click", () => {
        popup.style.display = "none";
    });

    document.addEventListener("click", (event) => {
        if (!popup.contains(event.target) && event.target !== openBtn) {
            popup.style.display = "none";
        }
    });
});
