/**
 * API Service for Todo App
 * Handles all API calls and data management
 */

class TodoApiService {
    constructor() {
        this.baseURL = 'https://portfolio-server-40hp.onrender.com/api'; // Adjust this to match your backend URL
        this.todos = []; // Local cache
        this.isOnline = navigator.onLine;
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncOfflineChanges();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
        
        // Initialize local storage fallback
        this.initializeLocalStorage();
    }

    /**
     * Initialize local storage for offline functionality
     */
    initializeLocalStorage() {
        const storedTodos = localStorage.getItem('todos');
        if (storedTodos) {
            try {
                this.todos = JSON.parse(storedTodos);
            } catch (error) {
                console.error('Error parsing stored todos:', error);
                this.todos = [];
            }
        }
    }

    /**
     * Save todos to local storage
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        } catch (error) {
            console.error('Error saving to local storage:', error);
        }
    }

    /**
     * Generate a unique ID for new todos (fallback)
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Fetch all todos
     * @returns {Promise<Array>} Array of todo objects
     */
    async getAllTodos() {
        if (!this.isOnline) {
            return this.todos;
        }

        try {
            const response = await fetch(`${this.baseURL}/todos`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const todos = await response.json();
            this.todos = todos;
            this.saveToLocalStorage();
            return todos;
        } catch (error) {
            console.warn('API call failed, using local storage:', error);
            return this.todos;
        }
    }

    /**
     * Get a specific todo by ID
     * @param {string|number} id - Todo ID
     * @returns {Promise<Object>} Todo object
     */
    async getTodoById(id) {
        if (!this.isOnline) {
            return this.todos.find(todo => todo.id == id);
        }

        try {
            const response = await fetch(`${this.baseURL}/todos/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.warn('API call failed, using local storage:', error);
            return this.todos.find(todo => todo.id == id);
        }
    }

    /**
     * Create a new todo
     * @param {string} task - Todo task description
     * @returns {Promise<Object>} Created todo object
     */
    async createTodo(task) {
        const newTodo = {
            id: this.generateId(),
            task: task.trim(),
            completed: false,
            created_at: new Date().toISOString()
        };

        if (!this.isOnline) {
            // Add to local storage with pending flag
            newTodo.pending = true;
            this.todos.push(newTodo);
            this.saveToLocalStorage();
            return newTodo;
        }

        try {
            const response = await fetch(`${this.baseURL}/todos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task: task.trim() })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const createdTodo = await response.json();
            
            // Update local cache
            this.todos.push(createdTodo);
            this.saveToLocalStorage();
            
            return createdTodo;
        } catch (error) {
            console.warn('API call failed, saving locally:', error);
            newTodo.pending = true;
            this.todos.push(newTodo);
            this.saveToLocalStorage();
            return newTodo;
        }
    }

    /**
     * Update an existing todo
     * @param {string|number} id - Todo ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Object>} Updated todo object
     */
    async updateTodo(id, updates) {
        // Find todo in local cache
        const todoIndex = this.todos.findIndex(todo => todo.id == id);
        if (todoIndex === -1) {
            throw new Error('Todo not found');
        }

        const updatedTodo = { ...this.todos[todoIndex], ...updates };

        if (!this.isOnline) {
            // Update locally with pending flag
            updatedTodo.pending = true;
            this.todos[todoIndex] = updatedTodo;
            this.saveToLocalStorage();
            return updatedTodo;
        }

        try {
            const response = await fetch(`${this.baseURL}/todos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const serverUpdatedTodo = await response.json();
            
            // Update local cache
            this.todos[todoIndex] = serverUpdatedTodo;
            this.saveToLocalStorage();
            
            return serverUpdatedTodo;
        } catch (error) {
            console.warn('API call failed, updating locally:', error);
            updatedTodo.pending = true;
            this.todos[todoIndex] = updatedTodo;
            this.saveToLocalStorage();
            return updatedTodo;
        }
    }

    /**
     * Delete a todo
     * @param {string|number} id - Todo ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteTodo(id) {
        const todoIndex = this.todos.findIndex(todo => todo.id == id);
        if (todoIndex === -1) {
            throw new Error('Todo not found');
        }

        if (!this.isOnline) {
            // Mark as deleted locally
            this.todos[todoIndex].deleted = true;
            this.todos[todoIndex].pending = true;
            this.saveToLocalStorage();
            return true;
        }

        try {
            const response = await fetch(`${this.baseURL}/todos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Remove from local cache
            this.todos.splice(todoIndex, 1);
            this.saveToLocalStorage();
            
            return true;
        } catch (error) {
            console.warn('API call failed, marking as deleted locally:', error);
            this.todos[todoIndex].deleted = true;
            this.todos[todoIndex].pending = true;
            this.saveToLocalStorage();
            return true;
        }
    }

    /**
     * Get todo statistics
     * @returns {Object} Statistics object
     */
    getTodoStats() {
        const activeTodos = this.todos.filter(todo => !todo.deleted);
        const total = activeTodos.length;
        const completed = activeTodos.filter(todo => todo.completed).length;
        const pending = total - completed;

        return {
            total,
            completed,
            pending
        };
    }

    /**
     * Filter todos based on status
     * @param {string} filter - Filter type: 'all', 'pending', 'completed'
     * @returns {Array} Filtered todos
     */
    filterTodos(filter = 'all') {
        const activeTodos = this.todos.filter(todo => !todo.deleted);
        
        switch (filter) {
            case 'pending':
                return activeTodos.filter(todo => !todo.completed);
            case 'completed':
                return activeTodos.filter(todo => todo.completed);
            case 'all':
            default:
                return activeTodos;
        }
    }

    /**
     * Clear all completed todos
     * @returns {Promise<boolean>} Success status
     */
    async clearCompleted() {
        const completedTodos = this.todos.filter(todo => todo.completed && !todo.deleted);
        
        if (completedTodos.length === 0) {
            return true;
        }

        try {
            // If online, delete from server
            if (this.isOnline) {
                const deletePromises = completedTodos.map(todo => 
                    fetch(`${this.baseURL}/todos/${todo.id}`, { method: 'DELETE' })
                );
                await Promise.all(deletePromises);
            }

            // Remove from local cache
            this.todos = this.todos.filter(todo => !todo.completed || todo.deleted);
            this.saveToLocalStorage();
            
            return true;
        } catch (error) {
            console.warn('Error clearing completed todos:', error);
            // Mark as deleted locally
            completedTodos.forEach(todo => {
                const index = this.todos.findIndex(t => t.id === todo.id);
                if (index !== -1) {
                    this.todos[index].deleted = true;
                    this.todos[index].pending = true;
                }
            });
            this.saveToLocalStorage();
            return true;
        }
    }

    /**
     * Sync offline changes when back online
     */
    async syncOfflineChanges() {
        const pendingTodos = this.todos.filter(todo => todo.pending);
        
        if (pendingTodos.length === 0) {
            return;
        }

        console.log(`Syncing ${pendingTodos.length} offline changes...`);

        for (const todo of pendingTodos) {
            try {
                if (todo.deleted) {
                    // Delete from server
                    await fetch(`${this.baseURL}/todos/${todo.id}`, { method: 'DELETE' });
                    // Remove from local cache
                    const index = this.todos.findIndex(t => t.id === todo.id);
                    if (index !== -1) {
                        this.todos.splice(index, 1);
                    }
                } else if (todo.id.toString().length > 10) {
                    // New todo created offline
                    const response = await fetch(`${this.baseURL}/todos`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ task: todo.task })
                    });
                    const serverTodo = await response.json();
                    
                    // Update local todo with server ID
                    const index = this.todos.findIndex(t => t.id === todo.id);
                    if (index !== -1) {
                        this.todos[index] = { ...serverTodo, pending: false };
                    }
                } else {
                    // Updated todo
                    await fetch(`${this.baseURL}/todos/${todo.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            task: todo.task,
                            completed: todo.completed
                        })
                    });
                    
                    // Remove pending flag
                    const index = this.todos.findIndex(t => t.id === todo.id);
                    if (index !== -1) {
                        delete this.todos[index].pending;
                    }
                }
            } catch (error) {
                console.error('Error syncing todo:', todo.id, error);
            }
        }

        this.saveToLocalStorage();
        console.log('Sync completed');
    }
}

// Create and export singleton instance
const todoApiService = new TodoApiService();