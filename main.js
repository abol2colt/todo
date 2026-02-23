// DOM CACHE
const DOM = {
  todoInput: document.getElementById("todo-input"),
  todoList: document.getElementById("todo-list"),
  inProgressList: document.getElementById("in-progress-list"),
  doneList: document.getElementById("done-list"),
  modal: document.getElementById("add-modal"),
  openModalBtn: document.getElementById("open-add-modal"),
  closeModalBtn: document.getElementById("close-modal"),
  saveNewTaskBtn: document.getElementById("add-btn-final"),
  categoryCards: document.querySelectorAll(".category-card"),
  modalCatBtns: document.querySelectorAll(".cat-btn"),
  todoDescInput: document.getElementById("todo-desc"),
  modalEdit: document.getElementById("edit-modal"),
  editTodoInput: document.getElementById("edit-todo-input"),
  editTodoDescInput: document.getElementById("edit-todo-desc"),
  saveEditBtn: document.getElementById("save-edit-btn"),
  closeEditModalBtn: document.getElementById("close-edit-modal"),
};

//            STATE MANAGEMENT
// ==========================================

const Store = {
  // State variables
  todos: JSON.parse(localStorage.getItem("todos")) || [],
  selectedCategory: localStorage.getItem("selectedCategory") || "all",

  // Save to local storage
  save() {
    localStorage.setItem("todos", JSON.stringify(this.todos));
    localStorage.setItem("selectedCategory", this.selectedCategory);
  },

  setCategory(cat) {
    this.selectedCategory = cat;
    this.save();
  },

  // Add new task
  addTodo(text, desc, category) {
    const newTodo = {
      id: Date.now(),
      text,
      description: desc,
      category,
      status: "todo",
    };
    this.todos.push(newTodo);
    this.save();
  },

  // Delete task
  deleteTodo(id) {
    this.todos = this.todos.filter((t) => t.id !== id);
    this.save();
  },

  // Update task status (for drag & drop)
  updateStatus(id, newStatus) {
    this.todos = this.todos.map((t) =>
      t.id === id ? { ...t, status: newStatus } : t,
    );
    this.save();
  },

  // Get filtered data
  getFilteredTodos() {
    if (this.selectedCategory === "all") return this.todos;
    return this.todos.filter((t) => t.category === this.selectedCategory);
  },
  updateTodo(id, updateData) {
    this.todos = this.todos.map((t) =>
      t.id === id ? { ...t, ...updateData } : t,
    );
    this.save();
  },
};

//              COMPONENTS
// ==========================================
const Components = {
  // Task Card Component
  TaskCard(todo, onDelete, onEdit) {
    const li = document.createElement("li");
    li.setAttribute("draggable", "true");

    const contentDiv = document.createElement("div");
    contentDiv.style.cursor = "pointer";

    const title = document.createElement("strong");
    title.textContent = todo.text;

    const desc = document.createElement("p");
    let descText = todo.description || "";
    if (descText.length > 20) descText = descText.substring(0, 20) + "...";
    desc.textContent = descText;

    contentDiv.appendChild(title);
    contentDiv.appendChild(desc);
    contentDiv.addEventListener("click", () => {
      window.location.href = `task.html?id=${todo.id}`;
    });
    li.appendChild(contentDiv);

    // Drag Start Event
    li.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", todo.id);
    });

    // Buttons Container
    const btnContainer = document.createElement("div");

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "✖️";
    deleteButton.addEventListener("click", (e) => {
      e.stopPropagation();
      onDelete(todo.id);
    });

    const editButton = document.createElement("button");
    editButton.textContent = "✏️";
    editButton.addEventListener("click", (e) => {
      e.stopPropagation();
      onEdit(todo.id);
    });

    btnContainer.appendChild(deleteButton);
    btnContainer.appendChild(editButton);
    btnContainer.classList.add("btn-container");
    li.appendChild(btnContainer);

    return li;
  },
};

//            MAIN APP CONTROLLER
// ==========================================
const App = {
  // Initialize the app
  init() {
    this.setupEventListeners();
    this.setupDragAndDrop();
    this.updateCategoryUI();
    this.render();
  },

  // Render tasks to the DOM
  render() {
    DOM.todoList.innerHTML = "";
    DOM.inProgressList.innerHTML = "";
    DOM.doneList.innerHTML = "";

    const listToRender = Store.getFilteredTodos();

    listToRender.forEach((todo) => {
      const li = Components.TaskCard(
        todo,
        (id) => {
          Store.deleteTodo(id);
          this.render();
        },
        (id) => {
          this.handleEdit(id);
        },
      );
      if (todo.status === "todo") DOM.todoList.appendChild(li);
      else if (todo.status === "in-progress")
        DOM.inProgressList.appendChild(li);
      else if (todo.status === "done") DOM.doneList.appendChild(li);
    });
  },

  // Update visual active state of category cards
  updateCategoryUI() {
    DOM.categoryCards.forEach((c) => {
      if (c.dataset.cat === Store.selectedCategory) c.classList.add("active");
      else c.classList.remove("active");
    });
  },
  handleEdit(id) {
    const todo = Store.todos.find((t) => t.id === id);
    if (!todo) return;

    DOM.editTodoInput.value = todo.text;
    DOM.editTodoDescInput.value = todo.description;

    const categoryCardsEdit = document.querySelectorAll(".catE-btn");
    categoryCardsEdit.forEach((btn) => {
      btn.dataset.cat === todo.category
        ? btn.classList.add("active")
        : btn.classList.remove("active");
    });

    DOM.modalEdit.classList.add("active");

    DOM.saveEditBtn.onclick = () => {
      const activeBtn = document.querySelector(".catE-btn.active");

      const updatedData = {
        text: DOM.editTodoInput.value.trim(),
        description: DOM.editTodoDescInput.value.trim(),
        category: activeBtn ? activeBtn.dataset.cat : todo.category,
      };

      Store.updateTodo(id, updatedData);
      DOM.modalEdit.classList.remove("active");
      this.render();
    };
  },

  // Setup all UI Event Listeners
  setupEventListeners() {
    // Category Filtering
    DOM.categoryCards.forEach((card) => {
      card.addEventListener("click", () => {
        Store.setCategory(card.dataset.cat);
        this.updateCategoryUI();
        this.render();
      });
    });
    const categoryCardsEdit = document.querySelectorAll(".catE-btn");
    categoryCardsEdit.forEach((card) => {
      card.addEventListener("click", () => {
        categoryCardsEdit.forEach((c) => c.classList.remove("active"));
        card.classList.add("active");
      });
    });

    // Modal Category Selection
    DOM.modalCatBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        DOM.modalCatBtns.forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    // Modal Toggles
    DOM.openModalBtn.addEventListener("click", () =>
      DOM.modal.classList.add("active"),
    );
    DOM.closeModalBtn.addEventListener("click", () =>
      DOM.modal.classList.remove("active"),
    );
    DOM.closeEditModalBtn.addEventListener("click", () =>
      DOM.modalEdit.classList.remove("active"),
    );

    // Add New Task
    DOM.saveNewTaskBtn.addEventListener("click", () => {
      const todoText = DOM.todoInput.value.trim();
      if (!todoText) return alert("لطفا یک تسک وارد کنید!");

      const activeCategoryBtn = document.querySelector(".cat-btn.active");
      const category = activeCategoryBtn
        ? activeCategoryBtn.dataset.cat
        : "personal";
      const descText = DOM.todoDescInput.value.trim();

      Store.addTodo(todoText, descText, category);

      DOM.todoInput.value = "";
      DOM.todoDescInput.value = "";
      DOM.modal.classList.remove("active");

      this.render();
    });
  },

  // Setup Drag & Drop Logic
  setupDragAndDrop() {
    const columns = [
      { element: DOM.todoList, status: "todo" },
      { element: DOM.inProgressList, status: "in-progress" },
      { element: DOM.doneList, status: "done" },
    ];

    columns.forEach((column) => {
      column.element.addEventListener("dragover", (e) => e.preventDefault());

      column.element.addEventListener("drop", (e) => {
        e.preventDefault();
        const taskId = Number(e.dataTransfer.getData("text/plain"));
        Store.updateStatus(taskId, column.status);
        this.render();
      });
    });
  },
};

// START APPLICATION
App.init();
