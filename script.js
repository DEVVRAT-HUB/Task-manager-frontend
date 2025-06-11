// Global variable to hold the li element currently being edited
let editingTaskLi = null;

// Get DOM elements
const taskInput = document.getElementById('task-input');
const taskPriorityCustom = document.getElementById('task-priority-custom');
const taskPrioritySelected = taskPriorityCustom.querySelector('.select-selected');
const taskPriorityItems = taskPriorityCustom.querySelector('.select-items');
const taskDueDate = document.getElementById('task-due-date');
const addTaskButton = document.getElementById('add-task-button');
const taskList = document.getElementById('task-list');
const emptyStateMessageElement = document.getElementById('empty-state-message');
const progressBar = document.getElementById('progress');
const progressNumbers = document.getElementById('numbers');
const themeToggle = document.getElementById('theme-toggle');

// Function to update the visibility of the empty message
function toggleEmptyState() {
    if (taskList.children.length === 0) {
        emptyStateMessageElement.style.display = 'flex'; // Show empty message
    } else {
        emptyStateMessageElement.style.display = 'none'; // Hide empty message
    }
}

// Function to update the progress bar
function updateProgress(checkConfetti = true) {
    const totalTasks = taskList.children.length;
    const completedTasks = taskList.querySelectorAll('li.completed').length;

    const progressPercentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    progressNumbers.textContent = `${completedTasks}/${totalTasks}`;

    // Handle progress bar pulse animation
    if (totalTasks > 0 && completedTasks === totalTasks) {
        progressBar.classList.add('full-pulse');
        if (checkConfetti) {
            triggerConfetti(); // Trigger confetti only if explicitly allowed
        }
    } else {
        progressBar.classList.remove('full-pulse');
    }
}

// Function to save tasks to local storage
function saveTasksToLocalStorage() {
    const tasks = [];
    taskList.querySelectorAll('li').forEach(li => {
        tasks.push({
            text: li.querySelector('span').textContent,
            completed: li.classList.contains('completed'),
            priority: li.dataset.priority,
            dueDate: li.dataset.dueDate
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to load tasks from local storage
function loadTasksFromLocalStorage() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => addTask(task.text, task.completed, task.priority, task.dueDate));
    toggleEmptyState(); // Check empty state after loading
    updateProgress(false); // Update progress, but don't trigger confetti on load
}

// Function to check if a task is overdue
function isOverdue(dueDate) {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate date comparison
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    // Task is overdue if due date is in the past and it's not completed
    return due < today;
}

// Function to add/update a task
function addTask(taskText = '', isCompleted = false, priority = 'medium', dueDate = '') {
    let currentTaskText = taskText.trim();
    let currentPriority = priority;
    let currentDueDate = dueDate;

    const isAddingFromInput = (taskText === '' && taskInput.value.trim() !== '');

    if (isAddingFromInput) {
        currentTaskText = taskInput.value.trim();
        currentPriority = taskPrioritySelected.dataset.value;
        currentDueDate = taskDueDate.value;
    } else if (taskText === '' && taskInput.value.trim() === '') {
        return;
    }

    if (currentTaskText === '') {
        return;
    }

    let li;
    if (editingTaskLi) {
        li = editingTaskLi;
        li.querySelector('span').textContent = currentTaskText;
        li.setAttribute('data-priority', currentPriority);
        li.setAttribute('data-due-date', currentDueDate);

        li.classList.remove('priority-low', 'priority-medium', 'priority-high');
        li.classList.add(`priority-${currentPriority}`);

        let dueDateSpan = li.querySelector('.due-date');
        const taskMeta = li.querySelector('.task-meta');

        if (currentDueDate) {
            const dateObj = new Date(currentDueDate);
            if (dueDateSpan) {
                dueDateSpan.textContent = `Due: ${dateObj.toLocaleDateString()}`;
            } else if (taskMeta) {
                dueDateSpan = document.createElement('span');
                dueDateSpan.classList.add('due-date');
                dueDateSpan.textContent = `Due: ${dateObj.toLocaleDateString()}`;
                taskMeta.appendChild(dueDateSpan);
            }
        } else if (dueDateSpan) {
            dueDateSpan.remove();
        }

        const priorityLabel = li.querySelector('.priority-label');
        if (priorityLabel) {
            priorityLabel.textContent = currentPriority;
        }

        if (!li.classList.contains('completed') && isOverdue(currentDueDate)) {
            li.classList.add('overdue');
        } else {
            li.classList.remove('overdue');
        }

        editingTaskLi = null;
        addTaskButton.textContent = 'Add';
    } else {
        li = document.createElement('li');
        li.setAttribute('data-priority', currentPriority);
        li.setAttribute('data-due-date', currentDueDate);
        li.classList.add(`priority-${currentPriority}`);

        let dueDateDisplay = '';
        let overdueClass = '';
        if (currentDueDate) {
            const dateObj = new Date(currentDueDate);
            dueDateDisplay = `<span class="due-date">Due: ${dateObj.toLocaleDateString()}</span>`;
            if (!isCompleted && isOverdue(currentDueDate)) {
                overdueClass = 'overdue';
                li.classList.add(overdueClass);
            }
        }

        li.innerHTML = `
            <input type="checkbox" ${isCompleted ? 'checked' : ''}>
            <span>${currentTaskText}</span>
            <div class="task-details">
                <div class="task-buttons">
                    <button class="edit-BTN"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="delete-BTN"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="task-meta">
                    <span class="priority-label">${currentPriority}</span>
                    ${dueDateDisplay}
                </div>
            </div>
        `;
        taskList.appendChild(li);
    }

    if (isCompleted) {
        li.classList.add('completed');
        li.querySelector('.edit-BTN').style.opacity = '0.5';
        li.querySelector('.edit-BTN').style.pointerEvents = 'none';
        li.classList.remove('overdue');
    } else {
        li.querySelector('.edit-BTN').style.opacity = '1';
        li.querySelector('.edit-BTN').style.pointerEvents = 'auto';
        if (isOverdue(li.dataset.dueDate)) {
            li.classList.add('overdue');
        }
    }

    if (!editingTaskLi) {
        li.classList.add('fade-in');
        li.addEventListener('animationend', () => {
            li.classList.remove('fade-in');
        }, { once: true });
    }

    taskInput.value = '';
    taskPrioritySelected.textContent = 'Medium Priority';
    taskPrioritySelected.dataset.value = 'medium';
    taskDueDate.value = '';

    toggleEmptyState();
    saveTasksToLocalStorage();
    updateProgress();
}

// Event listener for adding task button
addTaskButton.addEventListener('click', () => addTask());

// Event listener for Enter key press in the input field
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addTask();
    }
});

// Event delegation for handling clicks on task items (checkbox, edit, delete)
taskList.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;

    if (e.target.type === 'checkbox') {
        li.classList.toggle('completed');
        const editButton = li.querySelector('.edit-BTN');
        if (li.classList.contains('completed')) {
            editButton.style.opacity = '0.5';
            editButton.style.pointerEvents = 'none';
            li.classList.remove('overdue');
        } else {
            editButton.style.opacity = '1';
            editButton.style.pointerEvents = 'auto';
            if (isOverdue(li.dataset.dueDate)) {
                li.classList.add('overdue');
            }
        }
        saveTasksToLocalStorage();
        updateProgress();
    } else if (e.target.classList.contains('delete-BTN') || e.target.closest('.delete-BTN')) {
        li.classList.add('fade-out');
        li.addEventListener('animationend', () => {
            li.remove();
            toggleEmptyState();
            saveTasksToLocalStorage();
            updateProgress();
        }, { once: true });
    } else if (e.target.classList.contains('edit-BTN') || e.target.closest('.edit-BTN')) {
        if (!li.classList.contains('completed')) {
            taskInput.value = li.querySelector('span').textContent;
            taskPrioritySelected.textContent = li.dataset.priority.charAt(0).toUpperCase() + li.dataset.priority.slice(1) + ' Priority';
            taskPrioritySelected.dataset.value = li.dataset.priority;
            taskDueDate.value = li.dataset.dueDate;

            editingTaskLi = li;
            addTaskButton.textContent = 'Update Task';
            taskInput.focus();
        }
    }
});

// Custom dropdown logic
taskPrioritySelected.addEventListener('click', function(e) {
    e.stopPropagation();
    closeAllSelect(this);
    this.classList.toggle("select-arrow-active");
    taskPriorityItems.style.display = taskPriorityItems.style.display === 'block' ? 'none' : 'block';
});

taskPriorityItems.querySelectorAll('div').forEach(function(item) {
    item.addEventListener('click', function(e) {
        taskPrioritySelected.textContent = this.textContent;
        taskPrioritySelected.dataset.value = this.dataset.value;
        taskPriorityItems.style.display = 'none';
        taskPrioritySelected.classList.remove('select-arrow-active');
    });
});

function closeAllSelect(elmnt) {
    var x, y, i, arrNo = [];
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");
    for (i = 0; i < y.length; i++) {
        if (elmnt == y[i]) {
            arrNo.push(i)
        } else {
            y[i].classList.remove("select-arrow-active");
        }
    }
    for (i = 0; i < x.length; i++) {
        if (arrNo.indexOf(i)) {
            x[i].style.display = "none";
        }
    }
}
document.addEventListener("click", closeAllSelect);


// Theme toggle functionality
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    themeToggle.querySelector('i').className = isDarkMode ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
});

// Load theme preference on page load
function loadThemePreference() {
    const darkModePreference = localStorage.getItem('darkMode');
    if (darkModePreference === 'enabled') {
        document.body.classList.add('dark-mode');
        themeToggle.querySelector('i').className = 'fa-solid fa-sun';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.querySelector('i').className = 'fa-solid fa-moon';
    }
}


// Confetti effect (simplified for demonstration, you can replace with a library)
function triggerConfetti() {
    const confettiColors = [
        getComputedStyle(document.documentElement).getPropertyValue('--confetti-color-1'),
        getComputedStyle(document.documentElement).getPropertyValue('--confetti-color-2'),
        getComputedStyle(document.documentElement).getPropertyValue('--confetti-color-3'),
        getComputedStyle(document.documentElement).getPropertyValue('--confetti-color-4'),
        getComputedStyle(document.documentElement).getPropertyValue('--confetti-color-5'),
        getComputedStyle(document.documentElement).getPropertyValue('--confetti-color-6')
    ];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 10 + 5}px`;
        confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        confetti.style.borderRadius = '50%';
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.top = `${Math.random() * 100}vh`;
        confetti.style.opacity = `${Math.random()}`;
        confetti.style.transform = `scale(${Math.random()})`;
        confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
        confetti.style.zIndex = '9999'; // Ensure confetti is on top
        document.body.appendChild(confetti);

        // Clean up confetti elements after animation
        confetti.addEventListener('animationend', () => {
            confetti.remove();
        });
    }
}

// Basic CSS for confetti animation
// Note: This block dynamically adds the @keyframes rule.
// In a real project, consider pre-defining this in style.css
// or using a small JS function to inject it once.
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
    @keyframes fall {
        0% { transform: translate(0, -100px) rotate(0deg) scale(1); opacity: 1; }
        100% { transform: translate(${Math.random() * 400 - 200}px, 100vh) rotate(${Math.random() * 720}deg) scale(0); opacity: 0; }
    }
`;
document.head.appendChild(styleSheet);


// Load tasks and update UI when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    loadThemePreference(); // Load theme first
    loadTasksFromLocalStorage();
});
