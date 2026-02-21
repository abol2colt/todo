const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const inProgressList = document.getElementById("in-progress-list");
const doneList = document.getElementById("done-list");
const modal = document.getElementById("add-modal");
const openModalBtn = document.getElementById("open-add-modal");
const closeModalBtn = document.getElementById("close-modal");
const addBtnFinal = document.getElementById("add-btn-final");
const categoryCards = document.querySelectorAll(".category-card");
const modalCatBtns = document.querySelectorAll(".cat-btn");
const todoDescInput = document.getElementById("todo-desc");
const modalEdit = document.getElementById("edit-modal");
const editTodoInput = document.getElementById("edit-todo-input");
const editTodoDescInput = document.getElementById("edit-todo-desc");
const saveEditBtn = document.getElementById("save-edit-btn");
const closeEditModalBtn = document.getElementById("close-edit-modal");

// State
let selectedCategory = localStorage.getItem("selectedCategory");
let todos = JSON.parse(localStorage.getItem("todos")) || [];

// Save initial state if not present
if (!selectedCategory) setSelectedCategory("all");

// --- Event Listeners ---

// E. Category Filtering Logic
categoryCards.forEach((card) => {
  card.addEventListener("click", () => {
    categoryCards.forEach((c) => c.classList.remove("active"));
    card.classList.add("active");

    setSelectedCategory(card.dataset.cat);

    filterAndRender();
  });
});

// E. Modal Category Selection
modalCatBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    modalCatBtns.forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
  });
});

// E. Modals & Inputs
openModalBtn.addEventListener("click", () => modal.classList.add("active"));
closeModalBtn.addEventListener("click", () => modal.classList.remove("active"));

addBtnFinal.addEventListener("click", () => {
  addTodo();
});
closeEditModalBtn.addEventListener("click", () =>
  modalEdit.classList.remove("active"),
);
// --- Functions ---

function setSelectedCategory(cat) {
  selectedCategory = cat;
  localStorage.setItem("selectedCategory", selectedCategory);
}

function addTodo() {
  const todoText = todoInput.value.trim();
  const activeCategoryBtn = document.querySelector(".cat-btn.active");

  if (!todoText) {
    alert("لطفا یک تسک وارد کنید!");
    return;
  }

  const newTodo = {
    id: Date.now(),
    text: todoText,
    status: "todo",
    category: activeCategoryBtn ? activeCategoryBtn.dataset.cat : "personal",
    description: todoDescInput.value.trim(),
  };

  todos.push(newTodo);
  saveAndRender();

  todoInput.value = "";
  todoDescInput.value = "";
  modal.classList.remove("active");
}

function renderTodos(list) {
  todoList.innerHTML = "";
  inProgressList.innerHTML = "";
  doneList.innerHTML = "";

  // If list is null, render nothing
  const listToRender = list || [];

  listToRender.forEach((todo) => {
    const li = createTodoElement(todo);
    if (todo.status === "todo") {
      todoList.appendChild(li);
    } else if (todo.status === "in-progress") {
      inProgressList.appendChild(li);
    } else if (todo.status === "done") {
      doneList.appendChild(li);
    }
  });
}

function createTodoElement(todo) {
  const li = document.createElement("li");
  li.setAttribute("draggable", "true");

  const contentDiv = document.createElement("div");
  contentDiv.style.cursor = "pointer";

  const title = document.createElement("strong");
  title.textContent = todo.text;

  const desc = document.createElement("p");
  desc.textContent = todo.description
    ? todo.description.substring(0, 20) + "..."
    : "";
  contentDiv.appendChild(title);
  contentDiv.appendChild(desc);

  contentDiv.addEventListener("click", () => {
    window.location.href = `task.html?id=${todo.id}`;
  });
  li.appendChild(contentDiv);

  // Drag Start
  li.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", todo.id);
  });

  // Buttons Container
  const btnContainer = document.createElement("div");
  // Delete Button
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "✖️";
  deleteButton.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteTodo(todo.id);
  });
  // Edit Button
  const editButton = document.createElement("button");
  editButton.textContent = "✏️";
  editButton.addEventListener("click", (e) => {
    e.stopPropagation();
    editTodo(todo.id);
  });
  btnContainer.appendChild(deleteButton);
  btnContainer.appendChild(editButton);
  btnContainer.classList.add("btn-container");
  li.appendChild(btnContainer);

  return li;
}

function editTodo(id) {
  const currentTodo = todos.find((t) => t.id === id);
  editTodoInput.value = currentTodo.text;
  editTodoDescInput.value = currentTodo.description;

  const categoryCards = document.querySelectorAll(".catE-btn");
  categoryCards.forEach((btn) => {
    btn.dataset.cat === currentTodo.category
      ? btn.classList.add("active")
      : btn.classList.remove("active");
  });

  modalEdit.classList.add("active");

  saveEditBtn.onclick = () => {
    saveEditedTodo(id);
    modalEdit.classList.remove("active");
  };
}

function saveEditedTodo(id) {
  const activeBtn = document.querySelector(".catE-btn.active");
  todos = todos.map((t) =>
    t.id === id
      ? {
          ...t,
          text: editTodoInput.value.trim(),
          description: editTodoDescInput.value.trim(),
          category: activeBtn ? activeBtn.dataset.cat : t.category,
        }
      : t,
  );
  saveAndRender();
}
function updateCategoryEdit() {
  const categoryCards = document.querySelectorAll(".catE-btn");
  categoryCards.forEach((card) => {
    card.addEventListener("click", () => {
      categoryCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
    });
  });
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveAndRender();
}

// Helper function to update storage and render
function saveAndRender() {
  localStorage.setItem("todos", JSON.stringify(todos));
  filterAndRender();
}

// --- Drag & Drop ---
const columns = [
  { element: todoList, status: "todo" },
  { element: inProgressList, status: "in-progress" },
  { element: doneList, status: "done" },
];

columns.forEach((column) => {
  column.element.addEventListener("dragover", (e) => e.preventDefault());

  column.element.addEventListener("drop", (e) => {
    e.preventDefault();
    const taskId = Number(e.dataTransfer.getData("text/plain"));

    todos = todos.map((t) =>
      t.id === taskId ? { ...t, status: column.status } : t,
    );
    saveAndRender();
  });
});

// --- Main Logic ---
function filterAndRender() {
  if (selectedCategory === "all") {
    renderTodos(todos);
  } else {
    const filtered = todos.filter((t) => t.category === selectedCategory);
    renderTodos(filtered);
  }
}

// Initial Run
// Set UI active state based on saved category
categoryCards.forEach((c) => {
  if (c.dataset.cat === selectedCategory) c.classList.add("active");
  else c.classList.remove("active");
});
filterAndRender();
updateCategoryEdit();
