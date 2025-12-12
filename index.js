document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-go]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const to = btn.getAttribute("data-go");
            window.location.href = to;
        });
    });
});
