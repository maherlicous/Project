// DOM Elements
const toggleContrastButton = document.getElementById('toggle-contrast');
const toggleDarkButton = document.getElementById('toggle-dark');
const toggleColorBlindButton = document.getElementById('toggle-color-blind');
const textScaleSlider = document.getElementById('text-scale');
const body = document.body;
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const notifications = document.getElementById('notifications');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const cancelEditBtn = document.getElementById('cancel-edit');
const filterStatus = document.getElementById('filter-status');
const filterPriority = document.getElementById('filter-priority');
const sortDateBtn = document.getElementById('sort-date');
const sortPriorityBtn = document.getElementById('sort-priority');

// App State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentEditIndex = -1;
let currentSort = { field: 'date', order: 'asc' };

// Initialize the app
function init() {
  loadTasks();
  renderTasks();
  setupEventListeners();
}

// Load tasks from local storage
function loadTasks() {
  const savedTasks = localStorage.getItem('tasks');
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }
}

// Save tasks to local storage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render tasks based on current filters and sort
function renderTasks() {
  taskList.innerHTML = '';
  
  // Filter tasks
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
  
  // Sort tasks
  filteredTasks.sort((a, b) => {
    if (currentSort.field === 'date') {
      return currentSort.order === 'asc' 
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date);
    } else {
      // Priority sorting (high > medium > low)
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return currentSort.order === 'asc'
        ? priorityOrder[a.priority] - priorityOrder[b.priority]
        : priorityOrder[b.priority] - priorityOrder[a.priority];
    }
  });
  
  // Render each task
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

// Add a new task
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

// Toggle task completion status
function toggleTaskCompletion(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
  const status = tasks[index].completed ? 'completed' : 'pending';
  showNotification(`Task "${tasks[index].title}" marked as ${status}`, 'success');
}

// Open edit modal
function openEditModal(index) {
  currentEditIndex = index;
  const task = tasks[index];
  
  document.getElementById('edit-title').value = task.title;
  document.getElementById('edit-desc').value = task.desc;
  document.getElementById('edit-date').value = task.date;
  document.getElementById('edit-priority').value = task.priority;
  
  editModal.style.display = 'flex';
  document.getElementById('edit-title').focus();
}

// Close edit modal
function closeEditModal() {
  editModal.style.display = 'none';
  currentEditIndex = -1;
}

// Save edited task
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

// Delete task
function deleteTask(index) {
  const taskTitle = tasks[index].title;
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
  showNotification(`Task "${taskTitle}" deleted`, 'success');
}

// Show notification
function showNotification(message, type) {
  notifications.textContent = message;
  notifications.className = `notifications ${type}`;
  notifications.setAttribute('aria-live', 'polite');
  setTimeout(() => {
    notifications.textContent = '';
  }, 3000);
}

// Set up event listeners
function setupEventListeners() {
  // Form submission
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value.trim();
    const desc = document.getElementById('task-desc').value.trim();
    const date = document.getElementById('task-date').value;
    const priority = document.getElementById('task-priority').value;

    if (!title) {
      showNotification('Task title is required', 'error');
      return;
    }

    addTask(title, desc, date, priority);
    taskForm.reset();
  });

  // Edit form submission
  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('edit-title').value.trim();
    const desc = document.getElementById('edit-desc').value.trim();
    const date = document.getElementById('edit-date').value;
    const priority = document.getElementById('edit-priority').value;

    if (!title) {
      showNotification('Task title is required', 'error');
      return;
    }

    saveEditedTask(title, desc, date, priority);
  });

  // Cancel edit
  cancelEditBtn.addEventListener('click', closeEditModal);

  // Filter and sort controls
  filterStatus.addEventListener('change', renderTasks);
  filterPriority.addEventListener('change', renderTasks);
  
  sortDateBtn.addEventListener('click', () => {
    currentSort.field = 'date';
    currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
    sortDateBtn.textContent = `Sort by Date (${currentSort.order.toUpperCase()})`;
    renderTasks();
  });
  
  sortPriorityBtn.addEventListener('click', () => {
    currentSort.field = 'priority';
    currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
    sortPriorityBtn.textContent = `Sort by Priority (${currentSort.order.toUpperCase()})`;
    renderTasks();
  });

  // Accessibility toggles
  toggleContrastButton.addEventListener('click', () => {
    body.classList.toggle('high-contrast');
    showNotification(`High contrast mode ${body.classList.contains('high-contrast') ? 'enabled' : 'disabled'}`, 'success');
  });

  toggleDarkButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    showNotification(`Dark mode ${body.classList.contains('dark-mode') ? 'enabled' : 'disabled'}`, 'success');
  });

  toggleColorBlindButton.addEventListener('click', () => {
    body.classList.toggle('color-blind-mode');
    showNotification(`Color-blind mode ${body.classList.contains('color-blind-mode') ? 'enabled' : 'disabled'}`, 'success');
  });

  // Text resizing
  textScaleSlider.addEventListener('input', (e) => {
    document.documentElement.style.fontSize = `${e.target.value}em`;
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'c') {
      body.classList.toggle('high-contrast');
    }
    if (e.altKey && e.key === 'd') {
      body.classList.toggle('dark-mode');
    }
    if (e.altKey && e.key === 'b') {
      body.classList.toggle('color-blind-mode');
    }
    if (e.altKey && e.key === 'Enter') {
      if (editModal.style.display === 'flex') {
        editForm.dispatchEvent(new Event('submit'));
      } else {
        taskForm.dispatchEvent(new Event('submit'));
      }
    }
    if (e.key === 'Escape' && editModal.style.display === 'flex') {
      closeEditModal();
    }
  });

  // Close modal when clicking outside
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
      closeEditModal();
    }
  });
}

// Initialize the app
init();