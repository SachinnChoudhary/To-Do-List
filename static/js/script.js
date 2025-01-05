// Global task list and recently deleted tasks
let tasks = [];
let deletedTasks = [];

// Add Task Function
document.getElementById("addTaskBtn").addEventListener("click", () => {
    const taskInput = document.getElementById("taskInput").value;
    const priorityInput = document.getElementById("priorityInput").value;
    const dueDateInput = document.getElementById("dueDateInput").value;

    if (taskInput.trim() && priorityInput) {
        const newTask = {
            id: tasks.length + 1,
            task: taskInput,
            priority: priorityInput,
            dueDate: dueDateInput,
            completed: false
        };
        tasks.push(newTask);
        document.getElementById("taskInput").value = "";
        document.getElementById("priorityInput").value = "";
        document.getElementById("dueDateInput").value = "";
        renderTasks();
        updateTaskCounts();
    }
});

// Render Tasks in List
function renderTasks() {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = ""; // Clear the list before rendering new tasks

    tasks.forEach(task => {
        const taskItem = document.createElement("div");
        taskItem.classList.add("task-item");

        const taskText = document.createElement("div");
        taskText.classList.add("task-text");
        if (task.completed) taskText.classList.add("completed");
        taskText.textContent = `${task.task} (Priority: ${task.priority} | Due Date: ${task.dueDate})`;

        const greenTick = document.createElement("button");
        greenTick.classList.add("green-tick");
        greenTick.textContent = "✔";
        greenTick.onclick = () => toggleComplete(task.id);

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-task");
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = () => deleteTask(task.id);

        taskItem.appendChild(taskText);
        taskItem.appendChild(greenTick);
        taskItem.appendChild(deleteBtn);

        taskList.appendChild(taskItem);
    });
}

// Toggle Task Completion
function toggleComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        renderTasks();
        updateTaskCounts();
    }
}

// Delete Task
function deleteTask(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        const deletedTask = tasks.splice(taskIndex, 1);
        deletedTasks.push(deletedTask[0]); // Add to recently deleted tasks
        renderTasks();
        updateTaskCounts();
        renderRecentlyDeletedTasks();
    }
}

// Undo Deleted Task
function undoDeleteTask(selectElement) {
    const taskId = parseInt(selectElement.value);
    if (taskId) {
        const task = deletedTasks.find(t => t.id === taskId);
        tasks.push(task);
        deletedTasks = deletedTasks.filter(t => t.id !== taskId);
        renderTasks();
        updateTaskCounts();
        renderRecentlyDeletedTasks();
    }
}

// Filter Tasks
function filterTasks(status) {
    if (status === "completed") {
        tasks = tasks.filter(task => task.completed);
    } else if (status === "incomplete") {
        tasks = tasks.filter(task => !task.completed);
    }
    renderTasks();
    updateTaskCounts();
}

// Update Task Counts
function updateTaskCounts() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const incompleteTasks = totalTasks - completedTasks;

    document.getElementById("totalTasks").textContent = totalTasks;
    document.getElementById("completedTasks").textContent = completedTasks;
    document.getElementById("incompleteTasks").textContent = incompleteTasks;
}

// Render Recently Deleted Tasks in Dropdown
function renderRecentlyDeletedTasks() {
    const recentlyDeletedList = document.getElementById("recentlyDeletedTasks");
    recentlyDeletedList.innerHTML = "<option value=''>Select a task to undo</option>"; // Clear existing options

    deletedTasks.forEach(task => {
        const option = document.createElement("option");
        option.value = task.id;
        option.textContent = `${task.task} (Priority: ${task.priority}, Due Date: ${task.dueDate})`;
        recentlyDeletedList.appendChild(option);
    });
}

// Sort Tasks by Priority or Date
function sortTasksBy(selectElement) {
    const sortType = selectElement.value;

    if (sortType === "priority") {
        tasks.sort((a, b) => {
            const priorityOrder = { Low: 1, Medium: 2, High: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    } else if (sortType === "date") {
        tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }

    renderTasks();
}

// Initial render
renderTasks();
updateTaskCounts();
