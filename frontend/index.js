import { backend } from 'declarations/backend';

let canvas;
let draggables;
let saveBtn;
let loadBtn;
let undoBtn;
let redoBtn;
let loadingSpinner;
let stylePanel;
let selectedElement = null;
let draggedElement = null;
let commandHistory = [];
let commandIndex = -1;

document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('canvas');
    draggables = document.querySelectorAll('.draggable');
    saveBtn = document.getElementById('saveBtn');
    loadBtn = document.getElementById('loadBtn');
    undoBtn = document.getElementById('undoBtn');
    redoBtn = document.getElementById('redoBtn');
    loadingSpinner = document.getElementById('loadingSpinner');
    stylePanel = document.getElementById('stylePanel');

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', dragStart);
    });

    canvas.addEventListener('dragover', dragOver);
    canvas.addEventListener('drop', drop);
    canvas.addEventListener('mousedown', startDragging);
    canvas.addEventListener('mousemove', drag);
    canvas.addEventListener('mouseup', stopDragging);
    canvas.addEventListener('click', selectElement);

    saveBtn.addEventListener('click', saveLayout);
    loadBtn.addEventListener('click', loadLayout);
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);

    document.getElementById('applyStyles').addEventListener('click', applyStyles);
});

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.type);
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData('text');
    
    if (data === 'move') {
        if (draggedElement) {
            const offsetX = parseInt(draggedElement.dataset.offsetX);
            const offsetY = parseInt(draggedElement.dataset.offsetY);
            const newLeft = e.clientX - canvas.offsetLeft - offsetX;
            const newTop = e.clientY - canvas.offsetTop - offsetY;
            executeCommand(new MoveCommand(draggedElement, newLeft, newTop));
            draggedElement = null;
        }
    } else {
        const element = createElement(data);
        if (element) {
            element.style.position = 'absolute';
            element.style.left = `${e.clientX - canvas.offsetLeft}px`;
            element.style.top = `${e.clientY - canvas.offsetTop}px`;
            executeCommand(new AddCommand(canvas, element));
        }
    }
}

function createElement(type) {
    let element;
    switch (type) {
        case 'text':
            element = document.createElement('p');
            element.textContent = 'Double click to edit';
            element.addEventListener('dblclick', editText);
            break;
        case 'image':
            element = document.createElement('img');
            element.src = 'https://via.placeholder.com/150';
            element.alt = 'Placeholder image';
            break;
        case 'button':
            element = document.createElement('button');
            element.textContent = 'Button';
            element.className = 'btn btn-primary';
            break;
        case 'divider':
            element = document.createElement('hr');
            element.style.width = '100%';
            break;
        case 'heading':
            element = document.createElement('h2');
            element.textContent = 'Heading';
            element.addEventListener('dblclick', editText);
            break;
        default:
            console.error('Unknown element type:', type);
            return null;
    }
    if (element) {
        element.className = (element.className || '') + ' draggable-element';
        element.draggable = true;
        element.addEventListener('dragstart', dragElement);
        addResizeHandles(element);
        addDeleteButton(element);
    }
    return element;
}

function addResizeHandles(element) {
    const handles = ['nw', 'ne', 'sw', 'se'];
    handles.forEach(handle => {
        const resizeHandle = document.createElement('div');
        resizeHandle.className = `resize-handle ${handle}`;
        resizeHandle.addEventListener('mousedown', startResize);
        element.appendChild(resizeHandle);
    });
}

function addDeleteButton(element) {
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'X';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        executeCommand(new DeleteCommand(canvas, element));
    });
    element.appendChild(deleteBtn);
}

function dragElement(e) {
    e.dataTransfer.setData('text/plain', 'move');
    const rect = e.target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    e.target.dataset.offsetX = offsetX;
    e.target.dataset.offsetY = offsetY;
}

function editText(e) {
    const text = prompt('Enter new text:', e.target.textContent);
    if (text !== null) {
        executeCommand(new EditTextCommand(e.target, text));
    }
}

function startDragging(e) {
    if (e.target.classList.contains('draggable-element')) {
        draggedElement = e.target;
        const rect = draggedElement.getBoundingClientRect();
        draggedElement.dataset.offsetX = e.clientX - rect.left;
        draggedElement.dataset.offsetY = e.clientY - rect.top;
        draggedElement.style.zIndex = 1000;
    }
}

function drag(e) {
    if (draggedElement) {
        const offsetX = parseInt(draggedElement.dataset.offsetX);
        const offsetY = parseInt(draggedElement.dataset.offsetY);
        draggedElement.style.left = `${e.clientX - canvas.offsetLeft - offsetX}px`;
        draggedElement.style.top = `${e.clientY - canvas.offsetTop - offsetY}px`;
    }
}

function stopDragging() {
    if (draggedElement) {
        draggedElement.style.zIndex = '';
        draggedElement = null;
    }
}

function startResize(e) {
    e.stopPropagation();
    const element = e.target.parentElement;
    const handle = e.target.className.split(' ')[1];
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.offsetWidth;
    const startHeight = element.offsetHeight;

    function resize(e) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        let newWidth = startWidth;
        let newHeight = startHeight;

        if (handle.includes('e')) newWidth += dx;
        if (handle.includes('s')) newHeight += dy;
        if (handle.includes('w')) {
            newWidth -= dx;
            element.style.left = `${element.offsetLeft + dx}px`;
        }
        if (handle.includes('n')) {
            newHeight -= dy;
            element.style.top = `${element.offsetTop + dy}px`;
        }

        element.style.width = `${newWidth}px`;
        element.style.height = `${newHeight}px`;
    }

    function stopResize() {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }

    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
}

function selectElement(e) {
    if (e.target.classList.contains('draggable-element')) {
        if (selectedElement) {
            selectedElement.classList.remove('selected');
        }
        selectedElement = e.target;
        selectedElement.classList.add('selected');
        showStylePanel();
    } else {
        if (selectedElement) {
            selectedElement.classList.remove('selected');
            selectedElement = null;
        }
        hideStylePanel();
    }
}

function showStylePanel() {
    stylePanel.style.display = 'block';
}

function hideStylePanel() {
    stylePanel.style.display = 'none';
}

function applyStyles() {
    if (selectedElement) {
        const fontColor = document.getElementById('fontColor').value;
        const backgroundColor = document.getElementById('backgroundColor').value;
        const fontSize = document.getElementById('fontSize').value;
        executeCommand(new StyleCommand(selectedElement, { color: fontColor, backgroundColor, fontSize: `${fontSize}px` }));
    }
}

async function saveLayout() {
    showLoading();
    const layout = Array.from(canvas.children).map(element => ({
        type: element.tagName.toLowerCase(),
        content: element.tagName === 'P' || element.tagName === 'H2' ? element.textContent : (element.tagName === 'IMG' ? element.src : element.textContent),
        left: element.style.left,
        top: element.style.top,
        width: element.style.width,
        height: element.style.height,
        styles: {
            color: element.style.color,
            backgroundColor: element.style.backgroundColor,
            fontSize: element.style.fontSize
        }
    }));

    try {
        await backend.saveLayout(layout);
        alert('Layout saved successfully!');
    } catch (error) {
        console.error('Error saving layout:', error);
        alert('Failed to save layout. Please try again.');
    } finally {
        hideLoading();
    }
}

async function loadLayout() {
    showLoading();
    try {
        const layout = await backend.loadLayout();
        canvas.innerHTML = '';
        layout.forEach(item => {
            const element = createElement(item.type);
            if (element) {
                element.style.position = 'absolute';
                element.style.left = item.left;
                element.style.top = item.top;
                element.style.width = item.width;
                element.style.height = item.height;
                if (item.type === 'text' || item.type === 'heading') {
                    element.textContent = item.content;
                } else if (item.type === 'image') {
                    element.src = item.content;
                } else if (item.type === 'button') {
                    element.textContent = item.content;
                }
                Object.assign(element.style, item.styles);
                canvas.appendChild(element);
            }
        });
        alert('Layout loaded successfully!');
    } catch (error) {
        console.error('Error loading layout:', error);
        alert('Failed to load layout. Please try again.');
    } finally {
        hideLoading();
    }
}

function showLoading() {
    if (loadingSpinner) {
        loadingSpinner.classList.remove('d-none');
    }
}

function hideLoading() {
    if (loadingSpinner) {
        loadingSpinner.classList.add('d-none');
    }
}

// Command pattern for undo/redo
class Command {
    execute() {}
    undo() {}
}

class AddCommand extends Command {
    constructor(parent, element) {
        super();
        this.parent = parent;
        this.element = element;
    }

    execute() {
        this.parent.appendChild(this.element);
    }

    undo() {
        this.parent.removeChild(this.element);
    }
}

class DeleteCommand extends Command {
    constructor(parent, element) {
        super();
        this.parent = parent;
        this.element = element;
    }

    execute() {
        this.parent.removeChild(this.element);
    }

    undo() {
        this.parent.appendChild(this.element);
    }
}

class MoveCommand extends Command {
    constructor(element, newLeft, newTop) {
        super();
        this.element = element;
        this.newLeft = newLeft;
        this.newTop = newTop;
        this.oldLeft = parseInt(element.style.left);
        this.oldTop = parseInt(element.style.top);
    }

    execute() {
        this.element.style.left = `${this.newLeft}px`;
        this.element.style.top = `${this.newTop}px`;
    }

    undo() {
        this.element.style.left = `${this.oldLeft}px`;
        this.element.style.top = `${this.oldTop}px`;
    }
}

class EditTextCommand extends Command {
    constructor(element, newText) {
        super();
        this.element = element;
        this.newText = newText;
        this.oldText = element.textContent;
    }

    execute() {
        this.element.textContent = this.newText;
    }

    undo() {
        this.element.textContent = this.oldText;
    }
}

class StyleCommand extends Command {
    constructor(element, newStyles) {
        super();
        this.element = element;
        this.newStyles = newStyles;
        this.oldStyles = {
            color: element.style.color,
            backgroundColor: element.style.backgroundColor,
            fontSize: element.style.fontSize
        };
    }

    execute() {
        Object.assign(this.element.style, this.newStyles);
    }

    undo() {
        Object.assign(this.element.style, this.oldStyles);
    }
}

function executeCommand(command) {
    command.execute();
    commandHistory = commandHistory.slice(0, commandIndex + 1);
    commandHistory.push(command);
    commandIndex++;
}

function undo() {
    if (commandIndex >= 0) {
        commandHistory[commandIndex].undo();
        commandIndex--;
    }
}

function redo() {
    if (commandIndex < commandHistory.length - 1) {
        commandIndex++;
        commandHistory[commandIndex].execute();
    }
}
