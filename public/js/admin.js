// ===== DOM Elements =====
const tabBtns = document.querySelectorAll('.tab-btn');
const messagesForm = document.getElementById('messagesForm');
const uploadForm = document.getElementById('uploadForm');
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const uploadPreview = document.getElementById('uploadPreview');
const previewImg = document.getElementById('previewImg');
const uploadBtn = document.getElementById('uploadBtn');
const imagesGrid = document.getElementById('imagesGrid');
const imageCount = document.getElementById('imageCount');
const messageStatus = document.getElementById('messageStatus');
const imageStatus = document.getElementById('imageStatus');

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    setupUpload();
    loadData();
});

// ===== Tab Navigation =====
function setupTabs() {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            
            // Add active to clicked
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab + '-tab').classList.add('active');
        });
    });
}

// ===== Load Data =====
async function loadData() {
    try {
        const res = await fetch('/api/data');
        const data = await res.json();
        
        // Fill messages form
        if (data.messages) {
            document.getElementById('title').value = data.messages.title || '';
            document.getElementById('subtitle').value = data.messages.subtitle || '';
            document.getElementById('loveMessage').value = data.messages.loveMessage || '';
            document.getElementById('hiddenMessage').value = data.messages.hiddenMessage || '';
            document.getElementById('quote').value = data.messages.quote || '';
            document.getElementById('quoteAuthor').value = data.messages.quoteAuthor || '';
        }
        
        // Fill images grid
        renderImages(data.images || []);
    } catch (err) {
        console.error('Failed to load data:', err);
    }
}

// ===== Save Messages =====
messagesForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const messages = {
        title: document.getElementById('title').value,
        subtitle: document.getElementById('subtitle').value,
        loveMessage: document.getElementById('loveMessage').value,
        hiddenMessage: document.getElementById('hiddenMessage').value,
        quote: document.getElementById('quote').value,
        quoteAuthor: document.getElementById('quoteAuthor').value
    };
    
    try {
        const res = await fetch('/api/messages', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messages)
        });
        const result = await res.json();
        
        if (result.success) {
            showStatus(messageStatus, '✅ บันทึกข้อความเรียบร้อยแล้ว!', 'success');
        } else {
            showStatus(messageStatus, '❌ เกิดข้อผิดพลาด', 'error');
        }
    } catch (err) {
        showStatus(messageStatus, '❌ ไม่สามารถบันทึกได้: ' + err.message, 'error');
    }
});

// ===== Upload Setup =====
function setupUpload() {
    // Click to upload
    uploadArea.addEventListener('click', () => imageInput.click());
    
    // File selected
    imageInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            showPreview(e.target.files[0]);
        }
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files[0]) {
            imageInput.files = e.dataTransfer.files;
            showPreview(e.dataTransfer.files[0]);
        }
    });
}

function showPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        uploadPreview.style.display = 'block';
        uploadBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

// ===== Upload Image =====
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('image', imageInput.files[0]);
    formData.append('alt', document.getElementById('imageAlt').value || 'Valentine Image');
    
    uploadBtn.disabled = true;
    uploadBtn.textContent = '⏳ กำลังอัปโหลด...';
    
    try {
        const res = await fetch('/api/images', {
            method: 'POST',
            body: formData
        });
        const result = await res.json();
        
        if (result.success) {
            showStatus(imageStatus, '✅ อัปโหลดรูปเรียบร้อยแล้ว!', 'success');
            // Reset form
            uploadPreview.style.display = 'none';
            imageInput.value = '';
            document.getElementById('imageAlt').value = '';
            uploadBtn.textContent = '📤 อัปโหลดรูป';
            // Reload images
            loadData();
        } else {
            showStatus(imageStatus, '❌ ' + (result.error || 'เกิดข้อผิดพลาด'), 'error');
            uploadBtn.disabled = false;
            uploadBtn.textContent = '📤 อัปโหลดรูป';
        }
    } catch (err) {
        showStatus(imageStatus, '❌ ไม่สามารถอัปโหลดได้: ' + err.message, 'error');
        uploadBtn.disabled = false;
        uploadBtn.textContent = '📤 อัปโหลดรูป';
    }
});

// ===== Render Images =====
function renderImages(images) {
    imageCount.textContent = images.length;
    imagesGrid.innerHTML = '';
    
    images.forEach(img => {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.innerHTML = `
            <img src="images/${img.filename}" alt="${img.alt}" loading="lazy">
            <div class="image-card-info">
                <p>${img.alt}</p>
                <button class="delete-btn" onclick="deleteImage(${img.id})">🗑️ ลบรูป</button>
            </div>
        `;
        imagesGrid.appendChild(card);
    });
}

// ===== Delete Image =====
async function deleteImage(id) {
    if (!confirm('คุณต้องการลบรูปนี้หรือไม่?')) return;
    
    try {
        const res = await fetch(`/api/images/${id}`, { method: 'DELETE' });
        const result = await res.json();
        
        if (result.success) {
            showStatus(imageStatus, '✅ ลบรูปเรียบร้อยแล้ว!', 'success');
            loadData();
        } else {
            showStatus(imageStatus, '❌ ' + (result.error || 'เกิดข้อผิดพลาด'), 'error');
        }
    } catch (err) {
        showStatus(imageStatus, '❌ ไม่สามารถลบได้: ' + err.message, 'error');
    }
}

// ===== Status Message =====
function showStatus(element, message, type) {
    element.textContent = message;
    element.className = 'status-message ' + type;
    
    setTimeout(() => {
        element.style.display = 'none';
        element.className = 'status-message';
    }, 4000);
}
