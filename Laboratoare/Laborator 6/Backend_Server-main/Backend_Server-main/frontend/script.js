
const API_URL = 'http://localhost:5000/tasks';

document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    loadTasks();
    document.getElementById('taskForm').onsubmit = addTask;
}

// Fetch and display tasks
function loadTasks() {
    fetch(API_URL).then(response => {
        let res = response.json();
        displayTasks(res.data)
    }).catch(error => {
        console.error('Error loading tasks:', error);
    });
}

function displayTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    // console.log(tasks);
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
        <span>${task.title}</span>
        <button onclick="editTask(${task.id},'${task.title}')">Edit</button>
        <button onclick="deleteTask(${task.id})">Delete</button>
      `;
        taskList.appendChild(li);
    });
}

// Add a new task
function addTask(event) {
    event.preventDefault();
    const taskInput = document.getElementById('taskInput');
    const newTask = { title: taskInput.value, description: "" };

    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
    }).then(() => {
        taskInput.value = '';
        loadTasks();
    }).catch(error => {
        console.error('Error adding task:', error);
    });
}

// Update a task
function editTask(id, currentName) {
    const newName = prompt("Update task:", currentName);
    if (!newName) return;

    fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newName }),
    })
        .then(loadTasks)
        .catch(error => console.error('Error updating task:', error));
}

// Delete a task
function deleteTask(id) {
    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
        .then(loadTasks)
        .catch(error => console.error('Error deleting task:', error));
}