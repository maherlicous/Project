// event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the app
  loadTasks();
  renderTasks();
  setupEventListeners();
});

function setupEventListeners() {
  const taskForm = document.getElementById('task-form');
  const editForm = document.getElementById('edit-form');
  const cancelEditBtn = document.getElementById('cancel-edit');
  const filterStatus = document.getElementById('filter-status');
  const filterPriority = document.getElementById('filter-priority');
  const sortDateBtn = document.getElementById('sort-date');
  const sortPriorityBtn = document.getElementById('sort-priority');
  const toggleContrastButton = document.getElementById('toggle-contrast');
  const toggleDarkButton = document.getElementById('toggle-dark');
  const toggleColorBlindButton = document.getElementById('toggle-color-blind');
  const textScaleSlider = document.getElementById('text-scale');
  const editModal = document.getElementById('edit-modal');

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
    document.body.classList.toggle('high-contrast');
    showNotification(`High contrast mode ${document.body.classList.contains('high-contrast') ? 'enabled' : 'disabled'}`, 'success');
  });

  toggleDarkButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    showNotification(`Dark mode ${document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled'}`, 'success');
  });

  toggleColorBlindButton.addEventListener('click', () => {
    document.body.classList.toggle('color-blind-mode');
    showNotification(`Color-blind mode ${document.body.classList.contains('color-blind-mode') ? 'enabled' : 'disabled'}`, 'success');
  });

  // Text resizing
  textScaleSlider.addEventListener('input', (e) => {
    document.documentElement.style.fontSize = `${e.target.value}em`;
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'c') {
      document.body.classList.toggle('high-contrast');
    }
    if (e.altKey && e.key === 'd') {
      document.body.classList.toggle('dark-mode');
    }
    if (e.altKey && e.key === 'b') {
      document.body.classList.toggle('color-blind-mode');
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

  
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
      closeEditModal();
    }
  });
}