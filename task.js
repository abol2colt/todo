function loadTaskDetails() {
  const params = new URLSearchParams(window.location.search);
  const taskId = params.get("id");
  const todos = JSON.parse(localStorage.getItem("todos")) || [];
  const task = todos.find((t) => t.id == taskId);

  if (task) {
    document.getElementById("task-title").textContent = task.text;
    document.getElementById("task-desc").textContent =
      task.description || "توضیحی ندارد";
    document.getElementById("task-cat").textContent =
      `دسته بندی: ${task.category}`;
  } else {
    document.body.innerHTML =
      "<h1>تسک پیدا نشد!</h1><a href='main.html'>بازگشت</a>";
  }
}

const backBtn = document.querySelector(".back-btn");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "main.html";
  });
}
window.addEventListener("DOMContentLoaded", loadTaskDetails);
