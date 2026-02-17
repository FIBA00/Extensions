document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('colorPicker');
    const lineWidth = document.getElementById('lineWidth');
    const clearBtn = document.getElementById('clearBtn');
    const undoBtn = document.getElementById('undoBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const uploadBtn = document.getElementById('uploadBtn');

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let history = [];
    let historyStep = -1;
    let originalImage = null;

    // Load image from storage
    chrome.storage.local.get(['screenshot'], (result) => {
        if (result.screenshot) {
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                originalImage = img;
                saveHistory();
            };
            img.src = result.screenshot;
        } else {
            alert('No screenshot found!');
        }
    });

    // Drawing functions
    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function draw(e) {
        if (!isDrawing) return;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = lineWidth.value;
        ctx.lineCap = 'round';
        ctx.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function stopDrawing() {
        if (isDrawing) {
            isDrawing = false;
            saveHistory();
        }
    }

    // History functions
    function saveHistory() {
        historyStep++;
        if (historyStep < history.length) {
            history.length = historyStep;
        }
        history.push(canvas.toDataURL());
    }

    function undo() {
        if (historyStep > 0) {
            historyStep--;
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = history[historyStep];
        }
    }

    // Event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    undoBtn.addEventListener('click', undo);

    clearBtn.addEventListener('click', () => {
        if (confirm('Clear all annotations?')) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (originalImage) {
                ctx.drawImage(originalImage, 0, 0);
                saveHistory();
            }
        }
    });

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'screenshot-annotated.png';
        link.href = canvas.toDataURL();
        link.click();
    });

    uploadBtn.addEventListener('click', () => {
        // Mock upload functionality for monetization hook
        uploadBtn.textContent = 'Uploading...';
        uploadBtn.disabled = true;

        setTimeout(() => {
            alert('Cloud Upload is a Premium feature! \n\n(This is a demo of where you would integrate an API)');
            uploadBtn.textContent = 'Upload to Cloud ☁️';
            uploadBtn.disabled = false;
        }, 1500);
    });
});
