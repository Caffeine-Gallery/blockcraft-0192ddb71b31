import { backend } from 'declarations/backend';

let canvas;
let draggables;
let saveBtn;
let loadBtn;
let loadingSpinner;

document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('canvas');
    draggables = document.querySelectorAll('.draggable');
    saveBtn = document.getElementById('saveBtn');
    loadBtn = document.getElementById('loadBtn');
    loadingSpinner = document.getElementById('loadingSpinner');

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', dragStart);
    });

    canvas.addEventListener('dragover', dragOver);
    canvas.addEventListener('drop', drop);

    saveBtn.addEventListener('click', saveLayout);
    loadBtn.addEventListener('click', loadLayout);
});

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.type);
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const type = e.dataTransfer.getData('text');
    const element = createElement(type);
    if (element) {
        element.style.position = 'absolute';
        element.style.left = `${e.clientX - canvas.offsetLeft}px`;
        element.style.top = `${e.clientY - canvas.offsetTop}px`;
        canvas.appendChild(element);
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
        default:
            console.error('Unknown element type:', type);
            return null;
    }
    if (element) {
        element.className = (element.className || '') + ' draggable-element';
        element.draggable = true;
        element.addEventListener('dragstart', dragElement);
    }
    return element;
}

function dragElement(e) {
    if (e.target) {
        const rect = e.target.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        e.dataTransfer.setData('text/plain', JSON.stringify({ offsetX, offsetY }));
    }
}

function editText(e) {
    const text = prompt('Enter new text:', e.target.textContent);
    if (text !== null) {
        e.target.textContent = text;
    }
}

async function saveLayout() {
    showLoading();
    const layout = Array.from(canvas.children).map(element => ({
        type: element.tagName.toLowerCase(),
        content: element.tagName === 'P' ? element.textContent : (element.tagName === 'IMG' ? element.src : element.textContent),
        left: element.style.left,
        top: element.style.top
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
                if (item.type === 'text') {
                    element.textContent = item.content;
                } else if (item.type === 'image') {
                    element.src = item.content;
                } else if (item.type === 'button') {
                    element.textContent = item.content;
                }
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
