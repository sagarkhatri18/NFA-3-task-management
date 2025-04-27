const API_URL = "http://localhost:3001/tasks";
const taskList = document.getElementById("taskList");
const taskForm = document.getElementById("taskForm");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const loading = document.getElementById("loading");
const cancelEditBtn = document.getElementById("cancelEdit");

let editingTaskId = null;

function setLoading(isLoading) {
  loading.classList.toggle("hidden", !isLoading);
}

function displayNoTaskFound() {
  const li = document.createElement("li");
  li.className = ` group  items-start  rounded  `;
  li.innerHTML = `
  <div class="flex-1 flex items-center justify-center   rounded cursor-pointer  font-semibold text-base  ">
    No Task Found
  </div>

`;

  taskList.appendChild(li);
}

function sortBy() {
  return document.getElementById("sortBy").value;
}

async function fetchTasks() {
  setLoading(true);
  try {
    const res = await fetch(`${API_URL}?sort_by=${sortBy()}`);
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (err) {
    alert("Failed to fetch tasks. Server might be down.");
  }
  setLoading(false);
}

function renderTasks(tasks) {
  taskList.innerHTML = "";
  if (tasks.length === 0) displayNoTaskFound();
  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `flex  group  items-start p-4 bg-gray-200 rounded hover:bg-gray-300  `;
    li.innerHTML = `
    
   
  <div class="flex-1 flex flex-col p-4 rounded cursor-pointer  ">
       <div class="flex items-center gap-1">
          <h3 class=" inline-flex items-center  gap-2 font-semibold text-lg">${
            task.title
          }
        </h3>
          <span class="inline-flex items-center justify-center border-2  text-white text-[0.5rem] px-1 py-0.5 rounded-full h-3 font-bold uppercase w-fit ${
            !task.completed
              ? "border-red-600 text-red-600"
              : "border-green-600 text-green-600"
          }">
          ${!task.completed ? "Pending" : "Completed"}
        </span>
       </div>
    <p class="text-gray-700 text-sm">${task.description}</p>
 
  </div>
  <div class="flex flex-col gap-2 ml-4    mt-2 hidden group-hover:flex transition-all duration-700 delay-700 ease-in-out" >
    <button onclick="toggleComplete(${
      task.id
    })" class="px-3 py-1 text-white text-sm rounded   w-24 bg-black text-white font-medium ${
      task.completed ? "hidden" : "visible"
    }">
      Complete
    </button>

    <button onclick="deleteTask(${
      task.id
    })" class="px-3 py-1  text-white text-sm rounded    w-24 border-2 border-black text-black font-medium bg-white ">
      Delete
    </button>
  </div>
`;

    taskList.appendChild(li);
  });
}

async function addTask(e) {
  e.preventDefault();
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  if (!title || !description) return alert("Both fields are required.");

  if (editingTaskId) {
    await updateTask(editingTaskId, title, description);
  } else {
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      fetchTasks();
      taskForm.reset();
    } catch (err) {
      alert("Failed to add task.");
    }
  }
}

async function updateTask(id) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: {},
    });
    editingTaskId = null;
    document.querySelector('button[type="submit"]').textContent = "Add Task";
    cancelEditBtn.classList.add("hidden");
    taskForm.reset();
    fetchTasks();
  } catch (err) {
    alert("Failed to update task.");
  }
}

async function toggleComplete(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: "PUT" });
    fetchTasks();
  } catch (err) {
    alert("Failed to update task.");
  }
}

async function deleteTask(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchTasks();
  } catch (err) {
    alert("Failed to delete task.");
  }
}

cancelEditBtn.addEventListener("click", () => {
  editingTaskId = null;
  taskForm.reset();
  document.querySelector('button[type="submit"]').textContent = "Add Task";
  cancelEditBtn.classList.add("hidden");
});

taskForm.addEventListener("submit", addTask);
fetchTasks();
