/**
 * Todo App Main JavaScript
 * Handles UI interactions and app logic
 */

class TodoApp {
    constructor() {
        this.apiService = todoApiService;
        this.currentFilter = 'all';
        this.isLoading = false;
        
        // DOM elements
        this.elements = {};
        
        // Initialize app
        this.init();
    }

    /**
     * Initialize the todo app
     */
    async init() {
        this.bindDOMElements();
        this.attachEventListeners();
        await this.loadTodos();
        this.updateUI();
    }

    /**
     * Bind DOM elements for easy access
     */
    bindDOMElements() {
        this.elements = {
            // Forms and inputs
            todoForm: document.getElementById('todoForm'),
            taskInput: document.getElementById('taskInput'),
            editForm: document.getElementById('editTaskForm'),
            editInput: document.getElementById('editTaskInput'),
            editTaskId: document.getElementById('editTaskId'),
            
            // Lists and containers
            todoList: document.getElementById('todoList'),
            emptyState: document.getElementById('emptyState'),
            loadingSpinner: document.getElementById('loadingSpinner'),
            
            // Buttons
            refreshBtn: document.getElementById('refreshTodos'),
            clearCompletedBtn: document.getElementById('clearCompleted'),
            saveEditBtn: document.getElementById('saveEditedTask'),
            
            // Filter buttons
            filterBtns: document.querySelectorAll('[data-filter]'),
            
            // Counters
            totalCount: document.getElementById('totalCount'),
            pendingCount: document.getElementById('pendingCount'),
            completedCount: document.getElementById('completedCount'),
            
            // Alerts
            errorAlert: document.getElementById('errorAlert'),
            successAlert: document.getElementById('successAlert'),
            errorMessage: document.getElementById('errorMessage'),
            successMessage: document.getElementById('successMessage'),
            
            // Modals
            confirmModal: document.getElementById('confirmModal'),
            editModal: document.getElementById('editModal'),
            confirmMessage: document.getElementById('confirmMessage'),
            confirmAction: document.getElementById('confirmAction')
        };
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Form submissions
        this.elements.todoForm.addEventListener('submit', (e) => this.handleAddTodo(e));
        this.elements.editForm.addEventListener('submit', (e) => this.handleEditSubmit(e));
        
        // Button clicks
        this.elements.refreshBtn.addEventListener('click', () => this.handleRefresh());
        this.elements.clearCompletedBtn.addEventListener('click', () => this.handleClearCompleted());
        this.elements.saveEditBtn.addEventListener('click', () => this.handleSaveEdit());
        
        // Filter buttons
        this.elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        });
        
        // Alert close buttons
        this.elements.errorAlert.querySelector('.btn-close')?.addEventListener('click', () => {
            this.hideAlert('error');
        });
        this.elements.successAlert.querySelector('.btn-close')?.addEventListener('click', () => {
            this.hideAlert('success');
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Auto-hide alerts after 5 seconds
        this.autoHideAlerts();
    }

    /**
     * Load todos from API
     */
    async loadTodos() {
        this.showLoading(true);
        try {
            await this.apiService.getAllTodos();
            this.updateUI();
        } catch (error) {
            this.showAlert('error', 'Failed to load todos. Please try again.');
            console.error('Error loading todos:', error);
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Handle adding new todo
     */
    async handleAddTodo(event) {
        event.preventDefault();
        
        const task = this.elements.taskInput.value.trim();
        if (!task) {
            this.showAlert('error', 'Please enter a task.');
            return;
        }
        
        if (task.length > 255) {
            this.showAlert('error', 'Task is too long. Maximum 255 characters allowed.');
            return;
        }

        this.setButtonLoading(this.elements.todoForm.querySelector('button[type="submit"]'), true);
        
        try {
            await this.apiService.createTodo(task);
            this.elements.taskInput.value = '';
            this.elements.taskInput.focus();
            this.updateUI();
            this.showAlert('success', 'Task added successfully!');
        } catch (error) {
            this.showAlert('error', 'Failed to add task. Please try again.');
            console.error('Error adding todo:', error);
        } finally {
            this.setButtonLoading(this.elements.todoForm.querySelector('button[type="submit"]'), false);
        }
    }

    /**
     * Handle todo checkbox change
     */
    async handleToggleComplete(id, completed) {
        try {
            await this.apiService.updateTodo(id, { completed });
            this.updateUI();
            const message = completed ? 'Task completed!' : 'Task marked as pending.';
            this.showAlert('success', message);
        } catch (error) {
            this.showAlert('error', 'Failed to update task. Please try again.');
            console.error('Error toggling todo:', error);
        }
    }

    /**
     * Handle editing todo
     */
    handleEditTodo(id, currentTask) {
        this.elements.editTaskId.value = id;
        this.elements.editInput.value = currentTask;
        
        // Show modal
        const modal = new bootstrap.Modal(this.elements.editModal);
        modal.show();
        
        // Focus on input after modal is shown
        this.elements.editModal.addEventListener('shown.bs.modal', () => {
            this.elements.editInput.focus();
            this.elements.editInput.select();
        }, { once: true });
    }

    /**
     * Handle edit form submission
     */
    handleEditSubmit(event) {
        event.preventDefault();
        this.handleSaveEdit();
    }

    /**
     * Handle saving edited todo
     */
    async handleSaveEdit() {
        const id = this.elements.editTaskId.value;
        const newTask = this.elements.editInput.value.trim();
        
        if (!newTask) {
            this.showAlert('error', 'Please enter a task.');
            return;
        }
        
        if (newTask.length > 255) {
            this.showAlert('error', 'Task is too long. Maximum 255 characters allowed.');
            return;
        }

        this.setButtonLoading(this.elements.saveEditBtn, true);
        
        try {
            await this.apiService.updateTodo(id, { task: newTask });
            this.updateUI();
            this.showAlert('success', 'Task updated successfully!');
            
            // Hide modal
            const modal = bootstrap.Modal.getInstance(this.elements.editModal);
            modal?.hide();
        } catch (error) {
            this.showAlert('error', 'Failed to update task. Please try again.');
            console.error('Error updating todo:', error);
        } finally {
            this.setButtonLoading(this.elements.saveEditBtn, false);
        }
    }

    /**
     * Handle deleting todo with confirmation
     */
    handleDeleteTodo(id, task) {
        this.elements.confirmMessage.textContent = `Are you sure you want to delete "${task}"?`;
        
        // Show confirmation modal
        const modal = new bootstrap.Modal(this.elements.confirmModal);
        modal.show();
        
        // Handle confirmation
        const handleConfirm = async () => {
            modal.hide();
            await this.deleteTodo(id);
            this.elements.confirmAction.removeEventListener('click', handleConfirm);
        };
        
        this.elements.confirmAction.addEventListener('click', handleConfirm);
    }

    /**
     * Delete todo
     */
    async deleteTodo(id) {
        try {
            await this.apiService.deleteTodo(id);
            this.updateUI();
            this.showAlert('success', 'Task deleted successfully!');
        } catch (error) {
            this.showAlert('error', 'Failed to delete task. Please try again.');
            console.error('Error deleting todo:', error);
        }
    }

    /**
     * Handle filter change
     */
    handleFilterChange(event) {
        event.preventDefault();
        
        // Update active filter button
        this.elements.filterBtns.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Update current filter
        this.currentFilter = event.target.dataset.filter;
        
        // Update UI
        this.updateUI();
    }

    /**
     * Handle refresh
     */
    async handleRefresh() {
        this.setButtonLoading(this.elements.refreshBtn, true);
        await this.loadTodos();
        this.setButtonLoading(this.elements.refreshBtn, false);
        this.showAlert('success', 'Todos refreshed!');
    }

    /**
     * Handle clear completed
     */
    async handleClearCompleted() {
        const stats = this.apiService.getTodoStats();
        if (stats.completed === 0) {
            this.showAlert('error', 'No completed tasks to clear.');
            return;
        }

        this.elements.confirmMessage.textContent = `Are you sure you want to delete ${stats.completed} completed task(s)?`;
        
        // Show confirmation modal
        const modal = new bootstrap.Modal(this.elements.confirmModal);
        modal.show();
        
        // Handle confirmation
        const handleConfirm = async () => {
            modal.hide();
            await this.clearCompleted();
            this.elements.confirmAction.removeEventListener('click', handleConfirm);
        };
        
        this.elements.confirmAction.addEventListener('click', handleConfirm);
    }

    /**
     * Clear completed todos
     */
    async clearCompleted() {
        this.setButtonLoading(this.elements.clearCompletedBtn, true);
        
        try {
            await this.apiService.clearCompleted();
            this.updateUI();
            this.showAlert('success', 'Completed tasks cleared!');
        } catch (error) {
            this.showAlert('error', 'Failed to clear completed tasks. Please try again.');
            console.error('Error clearing completed todos:', error);
        } finally {
            this.setButtonLoading(this.elements.clearCompletedBtn, false);
        }
    }

    /**
     * Update the entire UI
     */
    updateUI() {
        this.renderTodos();
        this.updateCounts();
        this.updateEmptyState();
    }

    /**
     * Render todos in the list
     */
    renderTodos() {
        const filteredTodos = this.apiService.filterTodos(this.currentFilter);
        
        this.elements.todoList.innerHTML = '';
        
        filteredTodos.forEach(todo => {
            const todoElement = this.createTodoElement(todo);
            this.elements.todoList.appendChild(todoElement);
        });
    }

    /**
     * Create a todo DOM element
     */
    createTodoElement(todo) {
        const todoItem = document.createElement('div');
        todoItem.className = `list-group-item todo-item ${todo.completed ? 'completed' : ''}`;
        todoItem.dataset.id = todo.id;
        
        const createdDate = new Date(todo.created_at).toLocaleDateString();
        const isPending = todo.pending ? '<span class="badge bg-warning ms-2">Syncing...</span>' : '';
        
        todoItem.innerHTML = `
            <input 
                type="checkbox" 
                class="form-check-input todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="todoApp.handleToggleComplete('${todo.id}', this.checked)"
            >
            <div class="todo-content flex-grow-1">
                <div class="todo-text">${this.escapeHtml(todo.task)}${isPending}</div>
                <div class="todo-date">Created: ${createdDate}</div>
            </div>
            <div class="todo-actions">
                <button 
                    type="button" 
                    class="btn btn-sm btn-outline-warning"
                    onclick="todoApp.handleEditTodo('${todo.id}', '${this.escapeHtml(todo.task, true)}')"
                    title="Edit task"
                >
                    <i class="bi bi-pencil"></i>
                </button>
                <button 
                    type="button" 
                    class="btn btn-sm btn-outline-danger"
                    onclick="todoApp.handleDeleteTodo('${todo.id}', '${this.escapeHtml(todo.task, true)}')"
                    title="Delete task"
                >
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        
        todoItem.classList.add('fade-in');
        return todoItem;
    }

    /**
     * Update todo counts
     */
    updateCounts() {
        const stats = this.apiService.getTodoStats();
        
        this.elements.totalCount.textContent = stats.total;
        this.elements.pendingCount.textContent = stats.pending;
        this.elements.completedCount.textContent = stats.completed;
    }

    /**
     * Update empty state visibility
     */
    updateEmptyState() {
        const filteredTodos = this.apiService.filterTodos(this.currentFilter);
        const isEmpty = filteredTodos.length === 0;
        
        this.elements.emptyState.classList.toggle('d-none', !isEmpty);
        this.elements.todoList.classList.toggle('d-none', isEmpty);
    }

    /**
     * Show/hide loading spinner
     */
    showLoading(show) {
        this.isLoading = show;
        this.elements.loadingSpinner.classList.toggle('d-none', !show);
    }

    /**
     * Set button loading state
     */
    setButtonLoading(button, loading) {
        if (loading) {
            button.classList.add('btn-loading');
            button.disabled = true;
        } else {
            button.classList.remove('btn-loading');
            button.disabled = false;
        }
    }

    /**
     * Show alert message
     */
    showAlert(type, message) {
        const alertElement = type === 'error' ? this.elements.errorAlert : this.elements.successAlert;
        const messageElement = type === 'error' ? this.elements.errorMessage : this.elements.successMessage;
        
        messageElement.textContent = message;
        alertElement.classList.remove('d-none');
        
        // Hide other alert
        const otherAlert = type === 'error' ? this.elements.successAlert : this.elements.errorAlert;
        otherAlert.classList.add('d-none');
    }

    /**
     * Hide alert
     */
    hideAlert(type) {
        const alertElement = type === 'error' ? this.elements.errorAlert : this.elements.successAlert;
        alertElement.classList.add('d-none');
    }

    /**
     * Auto-hide alerts after 5 seconds
     */
    autoHideAlerts() {
        setInterval(() => {
            if (!this.elements.errorAlert.classList.contains('d-none')) {
                this.hideAlert('error');
            }
            if (!this.elements.successAlert.classList.contains('d-none')) {
                this.hideAlert('success');
            }
        }, 5000);
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + Enter: Add todo
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            if (document.activeElement === this.elements.taskInput) {
                this.elements.todoForm.requestSubmit();
            }
        }
        
        // Escape: Close modals
        if (event.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                modalInstance?.hide();
            });
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text, forAttribute = false) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        const escaped = text.replace(/[&<>"']/g, (m) => map[m]);
        return forAttribute ? escaped.replace(/"/g, '&quot;') : escaped;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});

// Handle page visibility change for potential syncing
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && navigator.onLine) {
        // Page became visible and we're online, sync if needed
        todoApiService.syncOfflineChanges();
    }
});