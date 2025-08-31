/**
 * Advanced Calculator JavaScript
 * Handles all calculator operations and UI interactions
 */

class AdvancedCalculator {
    constructor() {
        // Calculator state
        this.currentValue = '0';
        this.previousValue = '';
        this.operator = null;
        this.waitingForNewValue = false;
        this.expression = '0';
        this.memory = 0;
        this.isScientificMode = false;
        this.isProgrammerMode = false;
        this.angleMode = 'DEG'; // DEG or RAD
        this.currentBase = 10; // For programmer mode
        this.history = [];
        this.maxHistoryItems = 50;
        
        // DOM elements
        this.elements = {};
        
        // Initialize calculator
        this.init();
    }

    /**
     * Initialize the calculator
     */
    init() {
        this.bindDOMElements();
        this.attachEventListeners();
        this.loadHistory();
        this.updateDisplay();
        this.updateMemoryIndicator();
    }

    /**
     * Bind DOM elements for easy access
     */
    bindDOMElements() {
        this.elements = {
            // Displays
            expressionDisplay: document.getElementById('expressionDisplay'),
            resultDisplay: document.getElementById('resultDisplay'),
            memoryIndicator: document.getElementById('memoryIndicator'),
            angleMode: document.getElementById('angleMode'),
            calculatorMode: document.getElementById('calculatorMode'),
            
            // Mode buttons
            standardMode: document.getElementById('standardMode'),
            scientificMode: document.getElementById('scientificMode'),
            programmerMode: document.getElementById('programmerMode'),
            
            // Scientific and programmer rows
            scientificRows: document.querySelectorAll('.scientific-row'),
            programmerRows: document.querySelectorAll('.programmer-row'),
            
            // History
            calculatorHistory: document.getElementById('calculatorHistory'),
            clearHistory: document.getElementById('clearHistory'),
            
            // Base conversions
            baseConversions: document.getElementById('baseConversions'),
            hexValue: document.getElementById('hexValue'),
            decValue: document.getElementById('decValue'),
            octValue: document.getElementById('octValue'),
            binValue: document.getElementById('binValue'),
            
            // All buttons
            buttons: document.querySelectorAll('.calc-btn'),
            // Quick function buttons
            quickFunctionButtons: document.querySelectorAll('.btn[data-action]')
        };
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Mode switching buttons
        this.elements.standardMode.addEventListener('click', () => this.switchMode('standard'));
        this.elements.scientificMode.addEventListener('click', () => this.switchMode('scientific'));
        this.elements.programmerMode.addEventListener('click', () => this.switchMode('programmer'));
        
        // Calculator buttons
        this.elements.buttons.forEach(button => {
            button.addEventListener('click', (e) => this.handleButtonClick(e));
        });
        
        // Clear history button
        this.elements.clearHistory.addEventListener('click', () => this.clearHistory());

        // Quick function buttons
        this.elements.quickFunctionButtons.forEach(button => {
            // Skip if it's already handled by main calculator buttons
            if (!button.classList.contains('calc-btn')) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const action = button.dataset.action;
                    if (action) {
                        this.addButtonFeedback(button);
                        this.performAction(action);
                    }
                });
            }
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // History item clicks
        this.elements.calculatorHistory.addEventListener('click', (e) => {
            if (e.target.closest('.history-item')) {
                this.recallHistoryItem(e.target.closest('.history-item'));
            }
        });
        
        // Button press effects
        this.elements.buttons.forEach(button => {
            button.addEventListener('mousedown', () => button.classList.add('pressed'));
            button.addEventListener('mouseup', () => button.classList.remove('pressed'));
            button.addEventListener('mouseleave', () => button.classList.remove('pressed'));
        });

        // Add button press effects for quick function buttons too
        this.elements.quickFunctionButtons.forEach(button => {
            if (!button.classList.contains('calc-btn')) {
                button.addEventListener('mousedown', () => button.classList.add('pressed'));
                button.addEventListener('mouseup', () => button.classList.remove('pressed'));
                button.addEventListener('mouseleave', () => button.classList.remove('pressed'));
            }
        });
    }

    /**
     * Handle button clicks
     */
    handleButtonClick(event) {
        const button = event.currentTarget;
        const action = button.dataset.action;
        const number = button.dataset.number;
        
        // Add visual feedback
        this.addButtonFeedback(button);
        
        if (number !== undefined) {
            this.inputNumber(number);
        } else if (action) {
            this.performAction(action);
        }
    }

    /**
     * Add visual feedback to button press
     */
    addButtonFeedback(button) {
        button.classList.add('pressed');
        setTimeout(() => button.classList.remove('pressed'), 150);
    }

    /**
     * Switch calculator mode
     */
    switchMode(mode) {
        // Remove active class from all mode buttons
        document.querySelectorAll('.mode-toggle .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to selected mode
        this.elements[mode + 'Mode'].classList.add('active');
        
        // Update mode state
        this.isScientificMode = mode === 'scientific';
        this.isProgrammerMode = mode === 'programmer';
        
        // Show/hide mode-specific rows
        this.elements.scientificRows.forEach(row => {
            row.classList.toggle('d-none', mode !== 'scientific');
        });
        
        this.elements.programmerRows.forEach(row => {
            row.classList.toggle('d-none', mode !== 'programmer');
        });
        
        // Show/hide base conversions
        this.elements.baseConversions.classList.toggle('d-none', mode !== 'programmer');
        
        // Update mode display
        this.elements.calculatorMode.textContent = mode.toUpperCase();
        
        // Update base conversions if in programmer mode
        if (this.isProgrammerMode) {
            this.updateBaseConversions();
        }
        
        // Clear current calculation
        this.clear();
    }

    /**
     * Input a number
     */
    inputNumber(num) {
        if (this.waitingForNewValue) {
            this.currentValue = num;
            this.waitingForNewValue = false;
        } else {
            this.currentValue = this.currentValue === '0' ? num : this.currentValue + num;
        }
        
        this.updateDisplay();
        
        if (this.isProgrammerMode) {
            this.updateBaseConversions();
        }
    }

    /**
     * Perform calculator actions
     */
    performAction(action) {
        try {
            switch (action) {
                // Basic operations
                case 'add':
                case 'subtract':
                case 'multiply':
                case 'divide':
                    this.handleBasicOperation(action);
                    break;
                
                case 'equals':
                    this.calculate();
                    break;
                
                case 'decimal':
                    this.inputDecimal();
                    break;
                
                case 'clear':
                    this.clear();
                    break;
                
                case 'ce':
                    this.clearEntry();
                    break;
                
                case 'backspace':
                    this.backspace();
                    break;
                
                case 'negate':
                    this.negate();
                    break;
                
                // Memory operations
                case 'mc':
                    this.memoryClear();
                    break;
                
                case 'mr':
                    this.memoryRecall();
                    break;
                
                case 'mplus':
                    this.memoryAdd();
                    break;
                
                case 'mminus':
                    this.memorySubtract();
                    break;
                
                case 'ms':
                    this.memoryStore();
                    break;
                
                // Mathematical functions
                case 'sqrt':
                    this.sqrt();
                    break;
                
                case 'square':
                    this.square();
                    break;
                
                case 'cube':
                    this.cube();
                    break;
                
                case 'reciprocal':
                    this.reciprocal();
                    break;
                
                case 'percent':
                    this.percent();
                    break;
                
                case 'factorial':
                    this.factorial();
                    break;
                
                case 'abs':
                    this.absolute();
                    break;
                
                case 'floor':
                    this.floor();
                    break;
                
                case 'ceil':
                    this.ceiling();
                    break;
                
                case 'round':
                    this.round();
                    break;
                
                // Scientific functions
                case 'sin':
                    this.sin();
                    break;
                
                case 'cos':
                    this.cos();
                    break;
                
                case 'tan':
                    this.tan();
                    break;
                
                case 'asin':
                    this.asin();
                    break;
                
                case 'acos':
                    this.acos();
                    break;
                
                case 'atan':
                    this.atan();
                    break;
                
                case 'ln':
                    this.naturalLog();
                    break;
                
                case 'log':
                    this.log();
                    break;
                
                case 'exp':
                    this.exp();
                    break;
                
                case 'pow':
                    this.power();
                    break;
                
                // Constants
                case 'pi':
                    this.inputConstant(Math.PI);
                    break;
                
                case 'e':
                    this.inputConstant(Math.E);
                    break;
                
                case 'random':
                    this.inputConstant(Math.random());
                    break;
                
                // Angle mode toggle
                case 'deg-rad':
                    this.toggleAngleMode();
                    break;
                
                // Programmer mode operations
                case 'hex':
                case 'dec':
                case 'oct':
                case 'bin':
                    this.changeBase(action);
                    break;
                
                case 'not':
                    this.bitwiseNot();
                    break;
                
                default:
                    console.warn('Unknown action:', action);
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * Handle basic arithmetic operations
     */
    handleBasicOperation(operation) {
        if (this.operator && !this.waitingForNewValue) {
            this.calculate();
        }
        
        this.previousValue = this.currentValue;
        this.operator = operation;
        this.waitingForNewValue = true;
        
        // Update expression display
        const operatorSymbols = {
            add: '+',
            subtract: '−',
            multiply: '×',
            divide: '÷'
        };
        
        this.expression = `${this.previousValue} ${operatorSymbols[operation]}`;
        this.updateDisplay();
    }

    /**
     * Calculate the result
     */
    calculate() {
        if (!this.operator || this.waitingForNewValue) return;
        
        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        let result;
        
        switch (this.operator) {
            case 'add':
                result = prev + current;
                break;
            case 'subtract':
                result = prev - current;
                break;
            case 'multiply':
                result = prev * current;
                break;
            case 'divide':
                if (current === 0) {
                    throw new Error('Cannot divide by zero');
                }
                result = prev / current;
                break;
            default:
                return;
        }
        
        // Add to history
        const operatorSymbols = {
            add: '+',
            subtract: '−',
            multiply: '×',
            divide: '÷'
        };
        
        this.addToHistory(`${prev} ${operatorSymbols[this.operator]} ${current}`, result);
        
        this.currentValue = this.formatNumber(result);
        this.expression = this.currentValue;
        this.operator = null;
        this.previousValue = '';
        this.waitingForNewValue = true;
        
        this.updateDisplay();
        
        if (this.isProgrammerMode) {
            this.updateBaseConversions();
        }
    }

    /**
     * Input decimal point
     */
    inputDecimal() {
        if (this.waitingForNewValue) {
            this.currentValue = '0.';
            this.waitingForNewValue = false;
        } else if (this.currentValue.indexOf('.') === -1) {
            this.currentValue += '.';
        }
        
        this.updateDisplay();
    }

    /**
     * Clear all
     */
    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operator = null;
        this.expression = '0';
        this.waitingForNewValue = false;
        this.updateDisplay();
        
        if (this.isProgrammerMode) {
            this.updateBaseConversions();
        }
    }

    /**
     * Clear entry
     */
    clearEntry() {
        this.currentValue = '0';
        this.updateDisplay();
        
        if (this.isProgrammerMode) {
            this.updateBaseConversions();
        }
    }

    /**
     * Backspace
     */
    backspace() {
        if (this.currentValue.length > 1 && this.currentValue !== '0') {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
        
        this.updateDisplay();
        
        if (this.isProgrammerMode) {
            this.updateBaseConversions();
        }
    }

    /**
     * Negate current value
     */
    negate() {
        if (this.currentValue !== '0') {
            this.currentValue = this.currentValue.startsWith('-') 
                ? this.currentValue.substring(1)
                : '-' + this.currentValue;
        }
        
        this.updateDisplay();
        
        if (this.isProgrammerMode) {
            this.updateBaseConversions();
        }
    }

    /**
     * Memory operations
     */
    memoryClear() {
        this.memory = 0;
        this.updateMemoryIndicator();
    }

    memoryRecall() {
        this.currentValue = this.formatNumber(this.memory);
        this.waitingForNewValue = true;
        this.updateDisplay();
        
        if (this.isProgrammerMode) {
            this.updateBaseConversions();
        }
    }

    memoryAdd() {
        this.memory += parseFloat(this.currentValue);
        this.updateMemoryIndicator();
    }

    memorySubtract() {
        this.memory -= parseFloat(this.currentValue);
        this.updateMemoryIndicator();
    }

    memoryStore() {
        this.memory = parseFloat(this.currentValue);
        this.updateMemoryIndicator();
    }

    /**
     * Mathematical functions
     */
    sqrt() {
        const value = parseFloat(this.currentValue);
        if (value < 0) {
            throw new Error('Invalid input');
        }
        const result = Math.sqrt(value);
        this.addToHistory(`√(${value})`, result);
        this.setResult(result);
    }

    square() {
        const value = parseFloat(this.currentValue);
        const result = value * value;
        this.addToHistory(`${value}²`, result);
        this.setResult(result);
    }

    cube() {
        const value = parseFloat(this.currentValue);
        const result = value * value * value;
        this.addToHistory(`${value}³`, result);
        this.setResult(result);
    }

    reciprocal() {
        const value = parseFloat(this.currentValue);
        if (value === 0) {
            throw new Error('Cannot divide by zero');
        }
        const result = 1 / value;
        this.addToHistory(`1/${value}`, result);
        this.setResult(result);
    }

    percent() {
        const value = parseFloat(this.currentValue);
        const result = value / 100;
        this.addToHistory(`${value}%`, result);
        this.setResult(result);
    }

    factorial() {
        const value = parseInt(this.currentValue);
        if (value < 0 || !Number.isInteger(parseFloat(this.currentValue))) {
            throw new Error('Invalid input for factorial');
        }
        if (value > 170) {
            throw new Error('Number too large for factorial');
        }
        
        let result = 1;
        for (let i = 2; i <= value; i++) {
            result *= i;
        }
        
        this.addToHistory(`${value}!`, result);
        this.setResult(result);
    }

    absolute() {
        const value = parseFloat(this.currentValue);
        const result = Math.abs(value);
        this.addToHistory(`|${value}|`, result);
        this.setResult(result);
    }

    floor() {
        const value = parseFloat(this.currentValue);
        const result = Math.floor(value);
        this.addToHistory(`⌊${value}⌋`, result);
        this.setResult(result);
    }

    ceiling() {
        const value = parseFloat(this.currentValue);
        const result = Math.ceil(value);
        this.addToHistory(`⌈${value}⌉`, result);
        this.setResult(result);
    }

    round() {
        const value = parseFloat(this.currentValue);
        const result = Math.round(value);
        this.addToHistory(`round(${value})`, result);
        this.setResult(result);
    }

    /**
     * Scientific functions
     */
    sin() {
        const value = parseFloat(this.currentValue);
        const angleValue = this.angleMode === 'DEG' ? value * Math.PI / 180 : value;
        const result = Math.sin(angleValue);
        this.addToHistory(`sin(${value}${this.angleMode === 'DEG' ? '°' : ''})`, result);
        this.setResult(result);
    }

    cos() {
        const value = parseFloat(this.currentValue);
        const angleValue = this.angleMode === 'DEG' ? value * Math.PI / 180 : value;
        const result = Math.cos(angleValue);
        this.addToHistory(`cos(${value}${this.angleMode === 'DEG' ? '°' : ''})`, result);
        this.setResult(result);
    }

    tan() {
        const value = parseFloat(this.currentValue);
        const angleValue = this.angleMode === 'DEG' ? value * Math.PI / 180 : value;
        const result = Math.tan(angleValue);
        this.addToHistory(`tan(${value}${this.angleMode === 'DEG' ? '°' : ''})`, result);
        this.setResult(result);
    }

    asin() {
        const value = parseFloat(this.currentValue);
        if (value < -1 || value > 1) {
            throw new Error('Invalid input for arcsin');
        }
        let result = Math.asin(value);
        if (this.angleMode === 'DEG') {
            result = result * 180 / Math.PI;
        }
        this.addToHistory(`sin⁻¹(${value})`, result);
        this.setResult(result);
    }

    acos() {
        const value = parseFloat(this.currentValue);
        if (value < -1 || value > 1) {
            throw new Error('Invalid input for arccos');
        }
        let result = Math.acos(value);
        if (this.angleMode === 'DEG') {
            result = result * 180 / Math.PI;
        }
        this.addToHistory(`cos⁻¹(${value})`, result);
        this.setResult(result);
    }

    atan() {
        const value = parseFloat(this.currentValue);
        let result = Math.atan(value);
        if (this.angleMode === 'DEG') {
            result = result * 180 / Math.PI;
        }
        this.addToHistory(`tan⁻¹(${value})`, result);
        this.setResult(result);
    }

    naturalLog() {
        const value = parseFloat(this.currentValue);
        if (value <= 0) {
            throw new Error('Invalid input for natural log');
        }
        const result = Math.log(value);
        this.addToHistory(`ln(${value})`, result);
        this.setResult(result);
    }

    log() {
        const value = parseFloat(this.currentValue);
        if (value <= 0) {
            throw new Error('Invalid input for log');
        }
        const result = Math.log10(value);
        this.addToHistory(`log(${value})`, result);
        this.setResult(result);
    }

    exp() {
        const value = parseFloat(this.currentValue);
        const result = Math.exp(value);
        this.addToHistory(`e^${value}`, result);
        this.setResult(result);
    }

    power() {
        if (this.operator && !this.waitingForNewValue) {
            this.calculate();
        }
        
        this.previousValue = this.currentValue;
        this.operator = 'power';
        this.waitingForNewValue = true;
        this.expression = `${this.previousValue} ^`;
        this.updateDisplay();
    }

    /**
     * Input a constant
     */
    inputConstant(value) {
        this.currentValue = this.formatNumber(value);
        this.waitingForNewValue = true;
        this.updateDisplay();
        
        if (this.isProgrammerMode) {
            this.updateBaseConversions();
        }
    }

    /**
     * Toggle angle mode (DEG/RAD)
     */
    toggleAngleMode() {
        this.angleMode = this.angleMode === 'DEG' ? 'RAD' : 'DEG';
        this.elements.angleMode.textContent = this.angleMode;
    }

    /**
     * Programmer mode functions
     */
    changeBase(base) {
        const baseMap = {
            'hex': 16,
            'dec': 10,
            'oct': 8,
            'bin': 2
        };
        
        // Convert current value to decimal first
        let decimalValue;
        try {
            if (this.currentBase === 16) {
                // From hex
                decimalValue = parseInt(this.currentValue, 16);
            } else if (this.currentBase === 8) {
                // From octal
                decimalValue = parseInt(this.currentValue, 8);
            } else if (this.currentBase === 2) {
                // From binary
                decimalValue = parseInt(this.currentValue, 2);
            } else {
                // From decimal
                decimalValue = parseInt(this.currentValue, 10);
            }
            
            // If conversion failed, use 0
            if (isNaN(decimalValue)) {
                decimalValue = 0;
            }
            
            // Convert to new base and update display
            this.currentBase = baseMap[base];
            
            if (base === 'hex') {
                this.currentValue = decimalValue.toString(16).toUpperCase();
            } else if (base === 'oct') {
                this.currentValue = decimalValue.toString(8);
            } else if (base === 'bin') {
                this.currentValue = decimalValue.toString(2);
            } else {
                // decimal
                this.currentValue = decimalValue.toString(10);
            }
            
            this.expression = this.currentValue;
            this.updateDisplay();
            
        } catch (error) {
            console.error('Error converting base:', error);
            this.currentValue = '0';
            this.updateDisplay();
        }
        
        // Update base button states
        document.querySelectorAll('.base-btn').forEach(btn => btn.classList.remove('active'));
        const baseButton = document.querySelector(`[data-action="${base}"]`);
        if (baseButton) {
            baseButton.classList.add('active');
        }
        
        this.updateBaseConversions();
    }

    bitwiseNot() {
        const value = parseInt(this.currentValue);
        const result = ~value;
        this.addToHistory(`NOT(${value})`, result);
        this.setResult(result);
    }

    /**
     * Update base conversions display
     */
    updateBaseConversions() {
        if (!this.isProgrammerMode) return;
        
        try {
            const value = parseInt(parseFloat(this.currentValue));
            
            if (isNaN(value)) {
                this.elements.hexValue.value = '';
                this.elements.decValue.value = '';
                this.elements.octValue.value = '';
                this.elements.binValue.value = '';
                return;
            }
            
            this.elements.hexValue.value = value.toString(16).toUpperCase();
            this.elements.decValue.value = value.toString(10);
            this.elements.octValue.value = value.toString(8);
            this.elements.binValue.value = value.toString(2);
        } catch (error) {
            console.error('Error updating base conversions:', error);
        }
    }

    /**
     * Set result and update display
     */
    setResult(result) {
        this.currentValue = this.formatNumber(result);
        this.expression = this.currentValue;
        this.waitingForNewValue = true;
        this.updateDisplay();
        
        if (this.isProgrammerMode) {
            this.updateBaseConversions();
        }
    }

    /**
     * Format number for display
     */
    formatNumber(num) {
        if (isNaN(num) || !isFinite(num)) {
            throw new Error('Invalid result');
        }
        
        // Handle very small numbers
        if (Math.abs(num) < 1e-10 && num !== 0) {
            return num.toExponential(6);
        }
        
        // Handle very large numbers
        if (Math.abs(num) > 1e15) {
            return num.toExponential(6);
        }
        
        // Remove unnecessary decimals
        const str = num.toString();
        if (str.includes('.')) {
            return parseFloat(num.toPrecision(12)).toString();
        }
        
        return str;
    }

    /**
     * Update display
     */
    updateDisplay() {
        this.elements.expressionDisplay.textContent = this.expression;
        this.elements.resultDisplay.textContent = this.currentValue;
        
        // Add animation
        this.elements.resultDisplay.classList.add('fade-in');
        setTimeout(() => {
            this.elements.resultDisplay.classList.remove('fade-in');
        }, 300);
    }

    /**
     * Update memory indicator
     */
    updateMemoryIndicator() {
        if (this.memory !== 0) {
            this.elements.memoryIndicator.classList.remove('d-none');
        } else {
            this.elements.memoryIndicator.classList.add('d-none');
        }
    }

    /**
     * Show error
     */
    showError(message) {
        this.elements.resultDisplay.textContent = 'Error';
        this.elements.expressionDisplay.textContent = message;
        this.elements.resultDisplay.classList.add('error-state');
        
        setTimeout(() => {
            this.elements.resultDisplay.classList.remove('error-state');
            this.clear();
        }, 2000);
    }

    /**
     * History management
     */
    addToHistory(expression, result) {
        const historyItem = {
            expression: expression,
            result: this.formatNumber(result),
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.history.unshift(historyItem);
        
        // Limit history size
        if (this.history.length > this.maxHistoryItems) {
            this.history = this.history.slice(0, this.maxHistoryItems);
        }
        
        this.updateHistoryDisplay();
        this.saveHistory();
    }

    updateHistoryDisplay() {
        const historyContainer = this.elements.calculatorHistory;
        
        if (this.history.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-history text-center py-4">
                    <i class="bi bi-clock text-muted" style="font-size: 2rem;"></i>
                    <p class="text-muted mt-2">No calculations yet</p>
                </div>
            `;
            return;
        }
        
        historyContainer.innerHTML = this.history.map(item => `
            <div class="history-item" data-result="${item.result}">
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">= ${item.result}</div>
                <small class="text-muted">${item.timestamp}</small>
            </div>
        `).join('');
    }

    recallHistoryItem(historyItem) {
        const result = historyItem.dataset.result;
        this.currentValue = result;
        this.expression = result;
        this.waitingForNewValue = true;
        this.updateDisplay();
        
        if (this.isProgrammerMode) {
            this.updateBaseConversions();
        }
    }

    clearHistory() {
        this.history = [];
        this.updateHistoryDisplay();
        this.saveHistory();
    }

    saveHistory() {
        try {
            localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }

    loadHistory() {
        try {
            const savedHistory = localStorage.getItem('calculatorHistory');
            if (savedHistory) {
                this.history = JSON.parse(savedHistory);
                this.updateHistoryDisplay();
            }
        } catch (error) {
            console.error('Error loading history:', error);
            this.history = [];
        }
    }

    /**
     * Keyboard support
     */
    handleKeyboard(event) {
        const key = event.key;
        
        // Prevent default for calculator keys
        if ('0123456789+-*/.=cC'.includes(key) || key === 'Enter' || key === 'Escape' || key === 'Backspace') {
            event.preventDefault();
        }
        
        // Number keys
        if ('0123456789'.includes(key)) {
            this.inputNumber(key);
            this.highlightButton(`[data-number="${key}"]`);
        }
        
        // Operator keys
        switch (key) {
            case '+':
                this.performAction('add');
                this.highlightButton('[data-action="add"]');
                break;
            case '-':
                this.performAction('subtract');
                this.highlightButton('[data-action="subtract"]');
                break;
            case '*':
                this.performAction('multiply');
                this.highlightButton('[data-action="multiply"]');
                break;
            case '/':
                this.performAction('divide');
                this.highlightButton('[data-action="divide"]');
                break;
            case '=':
            case 'Enter':
                this.performAction('equals');
                this.highlightButton('[data-action="equals"]');
                break;
            case '.':
                this.performAction('decimal');
                this.highlightButton('[data-action="decimal"]');
                break;
            case 'Backspace':
                this.performAction('backspace');
                this.highlightButton('[data-action="backspace"]');
                break;
            case 'Escape':
            case 'c':
            case 'C':
                this.performAction('clear');
                this.highlightButton('[data-action="clear"]');
                break;
        }
    }

    /**
     * Highlight button for keyboard feedback
     */
    highlightButton(selector) {
        const button = document.querySelector(selector);
        if (button) {
            this.addButtonFeedback(button);
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new AdvancedCalculator();
});

// Handle power calculation
document.addEventListener('DOMContentLoaded', () => {
    const originalCalculate = window.calculator.calculate;
    window.calculator.calculate = function() {
        if (this.operator === 'power') {
            const base = parseFloat(this.previousValue);
            const exponent = parseFloat(this.currentValue);
            const result = Math.pow(base, exponent);
            
            this.addToHistory(`${base}^${exponent}`, result);
            this.setResult(result);
            
            this.operator = null;
            this.previousValue = '';
            this.waitingForNewValue = true;
            return;
        }
        
        originalCalculate.call(this);
    };
});