import { backend } from 'declarations/backend';

let canvas;
let draggables;
let saveBtn;
let loadBtn;
let undoBtn;
let redoBtn;
let previewBtn;
let loadingSpinner;
let stylePanel;
let mobilePreview;
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
    previewBtn = document.getElementById('previewBtn');
    loadingSpinner = document.getElementById('loadingSpinner');
    stylePanel = document.getElementById('stylePanel');
    mobilePreview = document.getElementById('mobilePreview');

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
    previewBtn.addEventListener('click', showMobilePreview);

    document.getElementById('applyStyles').addEventListener('click', applyStyles);
    document.getElementById('closeMobilePreview').addEventListener('click', closeMobilePreview);

    // Add event listeners for style inputs
    document.getElementById('fontSize').addEventListener('input', updateFontSizeValue);
    document.getElementById('borderWidth').addEventListener('input', updateBorderWidthValue);
    document.getElementById('borderRadius').addEventListener('input', updateBorderRadiusValue);
    document.getElementById('customCSS').addEventListener('input', applyCustomCSS);
    document.getElementById('typographyPreset').addEventListener('change', applyTypographyPreset);
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
        case 'container':
            element = document.createElement('div');
            element.className = 'container-element';
            element.style.width = '200px';
            element.style.height = '200px';
            element.style.border = '1px dashed #ccc';
            break;
        case 'list':
            element = document.createElement('ul');
            for (let i = 1; i <= 3; i++) {
                const li = document.createElement('li');
                li.textContent = `List item ${i}`;
                element.appendChild(li);
            }
            break;
        case 'input':
            element = document.createElement('input');
            element.type = 'text';
            element.placeholder = 'Enter text here';
            break;
        case 'hero':
            element = createHeroSection();
            break;
        case 'features':
            element = createFeatureGrid();
            break;
        case 'testimonials':
            element = createTestimonials();
            break;
        case 'pricing':
            element = createPricingTable();
            break;
        case 'team':
            element = createTeamMembers();
            break;
        case 'newsletter':
            element = createNewsletterSignup();
            break;
        case 'footer':
            element = createFooterSection();
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

function createHeroSection() {
    const hero = document.createElement('div');
    hero.className = 'hero-section';
    hero.innerHTML = `
        <h1>Welcome to Our Website</h1>
        <p>Discover amazing features and services</p>
        <button class="btn btn-primary">Get Started</button>
    `;
    return hero;
}

function createFeatureGrid() {
    const features = document.createElement('div');
    features.className = 'feature-grid';
    features.innerHTML = `
        <div class="feature">
            <i class="fas fa-rocket"></i>
            <h3>Fast</h3>
            <p>Lightning quick performance</p>
        </div>
        <div class="feature">
            <i class="fas fa-lock"></i>
            <h3>Secure</h3>
            <p>Your data is safe with us</p>
        </div>
        <div class="feature">
            <i class="fas fa-cogs"></i>
            <h3>Customizable</h3>
            <p>Tailor it to your needs</p>
        </div>
    `;
    return features;
}

function createTestimonials() {
    const testimonials = document.createElement('div');
    testimonials.className = 'testimonials';
    testimonials.innerHTML = `
        <div class="testimonial">
            <p>"This product changed my life!"</p>
            <cite>- John Doe</cite>
        </div>
        <div class="testimonial">
            <p>"I can't imagine working without it."</p>
            <cite>- Jane Smith</cite>
        </div>
    `;
    return testimonials;
}

function createPricingTable() {
    const pricing = document.createElement('div');
    pricing.className = 'pricing-table';
    pricing.innerHTML = `
        <div class="price-plan">
            <h3>Basic</h3>
            <p class="price">$9.99/mo</p>
            <ul>
                <li>Feature 1</li>
                <li>Feature 2</li>
                <li>Feature 3</li>
            </ul>
            <button class="btn btn-primary">Choose Plan</button>
        </div>
        <div class="price-plan">
            <h3>Pro</h3>
            <p class="price">$19.99/mo</p>
            <ul>
                <li>Feature 1</li>
                <li>Feature 2</li>
                <li>Feature 3</li>
                <li>Feature 4</li>
            </ul>
            <button class="btn btn-primary">Choose Plan</button>
        </div>
    `;
    return pricing;
}

function createTeamMembers() {
    const team = document.createElement('div');
    team.className = 'team-members';
    team.innerHTML = `
        <div class="team-member">
            <img src="https://via.placeholder.com/150" alt="Team Member 1">
            <h3>John Doe</h3>
            <p>CEO</p>
        </div>
        <div class="team-member">
            <img src="https://via.placeholder.com/150" alt="Team Member 2">
            <h3>Jane Smith</h3>
            <p>CTO</p>
        </div>
    `;
    return team;
}

function createNewsletterSignup() {
    const newsletter = document.createElement('div');
    newsletter.className = 'newsletter-signup';
    newsletter.innerHTML = `
        <h3>Subscribe to Our Newsletter</h3>
        <p>Stay updated with our latest news and offers</p>
        <form>
            <input type="email" placeholder="Enter your email">
            <button type="submit" class="btn btn-primary">Subscribe</button>
        </form>
    `;
    return newsletter;
}

function createFooterSection() {
    const footer = document.createElement('footer');
    footer.className = 'footer-section';
    footer.innerHTML = `
        <div class="footer-content">
            <div class="footer-section">
                <h4>About Us</h4>
                <p>We are a company dedicated to providing the best services.</p>
            </div>
            <div class="footer-section">
                <h4>Contact</h4>
                <p>Email: info@example.com</p>
                <p>Phone: (123) 456-7890</p>
            </div>
            <div class="footer-section">
                <h4>Follow Us</h4>
                <div class="social-icons">
                    <i class="fab fa-facebook"></i>
                    <i class="fab fa-twitter"></i>
                    <i class="fab fa-instagram"></i>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2023 Your Company. All rights reserved.</p>
        </div>
    `;
    return footer;
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
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
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
        updateStylePanel();
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

function updateStylePanel() {
    if (selectedElement) {
        document.getElementById('fontColor').value = rgb2hex(selectedElement.style.color);
        document.getElementById('backgroundColor').value = rgb2hex(selectedElement.style.backgroundColor);
        document.getElementById('fontSize').value = parseInt(selectedElement.style.fontSize) || 16;
        document.getElementById('fontSizeValue').textContent = `${document.getElementById('fontSize').value}px`;
        document.getElementById('borderStyle').value = selectedElement.style.borderStyle || 'none';
        document.getElementById('borderWidth').value = parseInt(selectedElement.style.borderWidth) || 0;
        document.getElementById('borderWidthValue').textContent = `${document.getElementById('borderWidth').value}px`;
        document.getElementById('borderColor').value = rgb2hex(selectedElement.style.borderColor);
        document.getElementById('borderRadius').value = parseInt(selectedElement.style.borderRadius) || 0;
        document.getElementById('borderRadiusValue').textContent = `${document.getElementById('borderRadius').value}px`;
        document.getElementById('boxShadow').checked = selectedElement.style.boxShadow !== 'none' && selectedElement.style.boxShadow !== '';
        document.getElementById('animation').value = selectedElement.dataset.animation || 'none';
        document.getElementById('backgroundPattern').value = selectedElement.dataset.backgroundPattern || 'none';
        document.getElementById('customCSS').value = selectedElement.dataset.customCSS || '';
    }
}

function applyStyles() {
    if (selectedElement) {
        const fontColor = document.getElementById('fontColor').value;
        const backgroundColor = document.getElementById('backgroundColor').value;
        const fontSize = document.getElementById('fontSize').value;
        const borderStyle = document.getElementById('borderStyle').value;
        const borderWidth = document.getElementById('borderWidth').value;
        const borderColor = document.getElementById('borderColor').value;
        const borderRadius = document.getElementById('borderRadius').value;
        const boxShadow = document.getElementById('boxShadow').checked ? '0 0 10px rgba(0,0,0,0.5)' : 'none';
        const animation = document.getElementById('animation').value;
        const backgroundPattern = document.getElementById('backgroundPattern').value;

        executeCommand(new StyleCommand(selectedElement, {
            color: fontColor,
            backgroundColor,
            fontSize: `${fontSize}px`,
            borderStyle,
            borderWidth: `${borderWidth}px`,
            borderColor,
            borderRadius: `${borderRadius}px`,
            boxShadow,
            animation,
            backgroundPattern
        }));
    }
}

function applyCustomCSS() {
    if (selectedElement) {
        const customCSS = document.getElementById('customCSS').value;
        selectedElement.style.cssText += customCSS;
        selectedElement.dataset.customCSS = customCSS;
    }
}

function applyTypographyPreset() {
    if (selectedElement) {
        const preset = document.getElementById('typographyPreset').value;
        let styles = {};

        switch (preset) {
            case 'modern':
                styles = {
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '16px',
                    lineHeight: '1.6'
                };
                break;
            case 'classic':
                styles = {
                    fontFamily: 'Georgia, serif',
                    fontSize: '18px',
                    lineHeight: '1.8'
                };
                break;
            case 'playful':
                styles = {
                    fontFamily: 'Comic Sans MS, cursive',
                    fontSize: '14px',
                    lineHeight: '1.4'
                };
                break;
            default:
                styles = {
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    lineHeight: 'inherit'
                };
        }

        executeCommand(new StyleCommand(selectedElement, styles));
    }
}

function updateFontSizeValue() {
    document.getElementById('fontSizeValue').textContent = `${document.getElementById('fontSize').value}px`;
}

function updateBorderWidthValue() {
    document.getElementById('borderWidthValue').textContent = `${document.getElementById('borderWidth').value}px`;
}

function updateBorderRadiusValue() {
    document.getElementById('borderRadiusValue').textContent = `${document.getElementById('borderRadius').value}px`;
}

function rgb2hex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? "#" +
        ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
}

function showMobilePreview() {
    const mobileCanvas = document.getElementById('mobileCanvas');
    mobileCanvas.innerHTML = canvas.innerHTML;
    mobilePreview.style.display = 'flex';
}

function closeMobilePreview() {
    mobilePreview.style.display = 'none';
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
            fontSize: element.style.fontSize,
            borderStyle: element.style.borderStyle,
            borderWidth: element.style.borderWidth,
            borderColor: element.style.borderColor,
            borderRadius: element.style.borderRadius,
            boxShadow: element.style.boxShadow,
            animation: element.dataset.animation,
            backgroundPattern: element.dataset.backgroundPattern,
            customCSS: element.dataset.customCSS
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
                element.dataset.animation = item.styles.animation;
                element.dataset.backgroundPattern = item.styles.backgroundPattern;
                element.dataset.customCSS = item.styles.customCSS;
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
        this.oldStyles = {};
        for (let prop in newStyles) {
            this.oldStyles[prop] = element.style[prop];
        }
    }

    execute() {
        Object.assign(this.element.style, this.newStyles);
        if (this.newStyles.animation) {
            this.element.dataset.animation = this.newStyles.animation;
        }
        if (this.newStyles.backgroundPattern) {
            this.element.dataset.backgroundPattern = this.newStyles.backgroundPattern;
        }
    }

    undo() {
        Object.assign(this.element.style, this.oldStyles);
        if (this.oldStyles.animation) {
            this.element.dataset.animation = this.oldStyles.animation;
        }
        if (this.oldStyles.backgroundPattern) {
            this.element.dataset.backgroundPattern = this.oldStyles.backgroundPattern;
        }
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
