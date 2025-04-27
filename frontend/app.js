const API_URL = 'http://localhost:3001/tasks';
const taskList = document.getElementById('taskList');
const taskForm = document.getElementById('taskForm');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const loading = document.getElementById('loading');
const cancelEditBtn = document.getElementById('cancelEdit');

let editingTaskId = null;

function setLoading(isLoading) {
  loading.classList.toggle('hidden', !isLoading);
}

async function fetchTasks() {
  setLoading(true);
  try {
    const res = await fetch(API_URL);
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (err) {
    alert('Failed to fetch tasks. Server might be down.');
  }
  setLoading(false);
}

function renderTasks(tasks) {
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `flex justify-between items-start p-4 bg-gray-200 rounded hover:bg-gray-300 transition ${task.completed ? 'line-through' : ''}`;
    li.innerHTML = `
      <div class="flex-1">
        <h3 class="font-semibold text-lg">${task.title}</h3>
        <p class="text-gray-700">${task.description}</p>
      </div>
      <div class="flex flex-col gap-2 ml-4">
        <button onclick="toggleComplete(${task.id})" class="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition">${task.completed ? 'Undo' : 'Complete'}</button>
        <button onclick="startEditTask(${task.id}, '${task.title}', '${task.description}')" class="px-3 py-1 bg-yellow-400 text-white text-sm rounded hover:bg-yellow-500 transition">Edit</button>
        <button onclick="deleteTask(${task.id})" class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition">Delete</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

async function addTask(e) {
  e.preventDefault();
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  if (!title || !description) return alert('Both fields are required.');

  if (editingTaskId) {
    await updateTask(editingTaskId, title, description);
  } else {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      fetchTasks();
      taskForm.reset();
    } catch (err) {
      alert('Failed to add task.');
    }
  }
}

function startEditTask(id, currentTitle, currentDescription) {
  titleInput.value = currentTitle;
  descriptionInput.value = currentDescription;
  editingTaskId = id;
  document.querySelector('button[type="submit"]').textContent = 'Update Task';
  cancelEditBtn.classList.remove('hidden');
}

async function updateTask(id, title, description) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    });
    editingTaskId = null;
    document.querySelector('button[type="submit"]').textContent = 'Add Task';
    cancelEditBtn.classList.add('hidden');
    taskForm.reset();
    fetchTasks();
  } catch (err) {
    alert('Failed to update task.');
  }
}

async function toggleComplete(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: 'PUT' });
    fetchTasks();
  } catch (err) {
    alert('Failed to update task.');
  }
}

async function deleteTask(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchTasks();
  } catch (err) {
    alert('Failed to delete task.');
  }
}

cancelEditBtn.addEventListener('click', () => {
  editingTaskId = null;
  taskForm.reset();
  document.querySelector('button[type="submit"]').textContent = 'Add Task';
  cancelEditBtn.classList.add('hidden');
});

taskForm.addEventListener('submit', addTask);
fetchTasks();
