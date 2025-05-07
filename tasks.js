// Task-related functions
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentEditIndex = -1;
let currentSort = { field: 'date', order: 'asc' };

function loadTasks() {
  const savedTasks = localStorage.getItem('tasks');
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  const taskList = document.getElementById('task-list');
  const filterStatus = document.getElementById('filter-status');
  const filterPriority = document.getElementById('filter-priority');
  
  taskList.innerHTML = '';
  
  let filteredTasks = [...tasks];
  const statusFilter = filterStatus.value;
  const priorityFilter = filterPriority.value;
  
  if (statusFilter !== 'all') {
    filteredTasks = filteredTasks.filter(task => 
      statusFilter === 'completed' ? task.completed : !task.completed
    );
  }
  
  if (priorityFilter !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
  }
  
  filteredTasks.sort((a, b) => {
    if (currentSort.field === 'date') {
      return currentSort.order === 'asc' 
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date);
    } else {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return currentSort.order === 'asc'
        ? priorityOrder[a.priority] - priorityOrder[b.priority]
        : priorityOrder[b.priority] - priorityOrder[a.priority];
    }
  });
  
  filteredTasks.forEach((task, index) => {
    const originalIndex = tasks.findIndex(t => t.id === task.id);
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority}`;
    li.setAttribute('aria-label', `Task: ${task.title}. Priority: ${task.priority}. Due: ${task.date}. ${task.completed ? 'Completed' : 'Pending'}`);

    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';
    taskContent.innerHTML = `
      <strong>${task.title}</strong>
      <p>${task.desc}</p>
      <p>Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</p>
      <p>Due: ${task.date}</p>
    `;

    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';

    const completeButton = document.createElement('button');
    completeButton.className = 'complete-btn';
    completeButton.textContent = task.completed ? 'Undo' : 'Complete';
    completeButton.setAttribute('aria-label', task.completed ? `Mark ${task.title} as pending` : `Mark ${task.title} as completed`);
    completeButton.addEventListener('click', () => toggleTaskCompletion(originalIndex));

    const editButton = document.createElement('button');
    editButton.className = 'edit-btn';
    editButton.textContent = 'Edit';
    editButton.setAttribute('aria-label', `Edit task: ${task.title}`);
    editButton.addEventListener('click', () => openEditModal(originalIndex));

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-btn';
    deleteButton.textContent = 'Delete';
    deleteButton.setAttribute('aria-label', `Delete task: ${task.title}`);
    deleteButton.addEventListener('click', () => deleteTask(originalIndex));

    taskActions.appendChild(completeButton);
    taskActions.appendChild(editButton);
    taskActions.appendChild(deleteButton);
    
    li.appendChild(taskContent);
    li.appendChild(taskActions);
    taskList.appendChild(li);
  });
}

function addTask(title, desc, date, priority) {
  const newTask = {
    id: Date.now().toString(),
    title,
    desc,
    date,
    priority,
    completed: false
  };
  tasks.push(newTask);
  saveTasks();
  renderTasks();
  showNotification(`Task "${title}" added successfully`, 'success');
  document.getElementById('task-title').focus();
}

function toggleTaskCompletion(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
  const status = tasks[index].completed ? 'completed' : 'pending';
  showNotification(`Task "${tasks[index].title}" marked as ${status}`, 'success');
}

function openEditModal(index) {
  currentEditIndex = index;
  const task = tasks[index];
  
  document.getElementById('edit-title').value = task.title;
  document.getElementById('edit-desc').value = task.desc;
  document.getElementById('edit-date').value = task.date;
  document.getElementById('edit-priority').value = task.priority;
  
  document.getElementById('edit-modal').style.display = 'flex';
  document.getElementById('edit-title').focus();
}

function closeEditModal() {
  document.getElementById('edit-modal').style.display = 'none';
  currentEditIndex = -1;
}

function saveEditedTask(title, desc, date, priority) {
  if (currentEditIndex >= 0) {
    tasks[currentEditIndex] = { 
      ...tasks[currentEditIndex],
      title, 
      desc, 
      date,
      priority
    };
    saveTasks();
    renderTasks();
    showNotification(`Task "${title}" updated successfully`, 'success');
    closeEditModal();
  }
}

function deleteTask(index) {
  const taskTitle = tasks[index].title;
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
  showNotification(`Task "${taskTitle}" deleted`, 'success');
}

function showNotification(message, type) {
  const notifications = document.getElementById('notifications');
  notifications.textContent = message;
  notifications.className = `notifications ${type}`;
  notifications.setAttribute('aria-live', 'polite');
  setTimeout(() => {
    notifications.textContent = '';
  }, 3000);
}