// Paste the deployed Google Apps Script Web App URL ending in /exec here.
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxZbq4l1yE-zXb8dLSRd5fiY4m-vxI0e0PtHpXSQS1bOnlta-7if3dGOYcTnfYgSOnQ/exec';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const REQUEST_TIMEOUT = 90000;
const form = document.getElementById('orderForm');
const statusMessage = form.querySelector('.form-status');
const submitButton = form.querySelector('.submit-button');

// Keep the compact mobile menu accessible and close it after navigation.
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navigation.classList.remove('open')));

// Rotate the three featured artworks without a dependency.
const heroArt = [...document.querySelectorAll('.hero-art')];
const heroDots = [...document.querySelectorAll('.showcase-dots button')];
let heroIndex = 0;
setInterval(() => {
  heroArt[heroIndex].classList.remove('active');
  heroDots[heroIndex].classList.remove('active');
  heroIndex = (heroIndex + 1) % heroArt.length;
  heroArt[heroIndex].classList.add('active');
  heroDots[heroIndex].classList.add('active');
}, 4200);

// Filter and enlarge portfolio artwork.
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  const filter = button.dataset.filter;
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.hidden = filter !== 'all' && item.dataset.type !== filter;
  });
}));

const lightbox = document.getElementById('lightbox');
let zoomLevel = 1;
let isDragging = false;
let startX = 0, startY = 0, offsetX = 0, offsetY = 0;

document.querySelectorAll('.gallery-item').forEach(item => item.addEventListener('click', () => {
  const image = lightbox.querySelector('img');
  image.src = item.dataset.full;
  image.alt = item.querySelector('img').alt;
  zoomLevel = 1;
  offsetX = 0;
  offsetY = 0;
  image.style.transform = 'scale(1) translate(0, 0)';
  lightbox.showModal();
}));

const lightboxImg = lightbox.querySelector('img');

// Zoom with scroll wheel
lightbox.addEventListener('wheel', (e) => {
  if (lightboxImg.src) {
    e.preventDefault();
    zoomLevel += e.deltaY > 0 ? -0.1 : 0.1;
    zoomLevel = Math.max(0.5, Math.min(zoomLevel, 3));
    lightboxImg.style.transform = `scale(${zoomLevel}) translate(${offsetX}px, ${offsetY}px)`;
  }
}, { passive: false });

// Zoom with pinch (mobile)
let lastDistance = 0;
lightbox.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    lastDistance = Math.sqrt(dx * dx + dy * dy);
  } else if (e.touches.length === 1) {
    isDragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }
}, { passive: false });

lightbox.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const delta = (distance - lastDistance) * 0.01;
    zoomLevel += delta;
    zoomLevel = Math.max(0.5, Math.min(zoomLevel, 3));
    lightboxImg.style.transform = `scale(${zoomLevel}) translate(${offsetX}px, ${offsetY}px)`;
    lastDistance = distance;
  } else if (isDragging && zoomLevel > 1) {
    e.preventDefault();
    const moveX = (e.touches[0].clientX - startX) / zoomLevel;
    const moveY = (e.touches[0].clientY - startY) / zoomLevel;
    offsetX += moveX;
    offsetY += moveY;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    lightboxImg.style.transform = `scale(${zoomLevel}) translate(${offsetX}px, ${offsetY}px)`;
  }
}, { passive: false });

lightbox.addEventListener('touchend', () => {
  isDragging = false;
});

// Double-tap to reset zoom
lightboxImg.addEventListener('dblclick', () => {
  zoomLevel = 1;
  offsetX = 0;
  offsetY = 0;
  lightboxImg.style.transform = 'scale(1) translate(0, 0)';
});

lightbox.addEventListener('click', event => {
  if (event.target === lightbox || event.target.classList.contains('close-lightbox')) lightbox.close();
});

const photoInput = document.getElementById('photoInput');
const photoPreview = document.getElementById('photoPreview');
photoInput.addEventListener('change', () => {
  const file = photoInput.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/') || file.size > MAX_IMAGE_SIZE) {
    photoInput.value = '';
    statusMessage.textContent = 'Please choose an image smaller than 5MB.';
    statusMessage.className = 'form-status error';
    return;
  }
  const reader = new FileReader();
  reader.onload = event => {
    photoPreview.src = event.target.result;
    photoPreview.hidden = false;
  };
  reader.readAsDataURL(file);
});

function normalizeIndianPhone(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10 && /^[6-9]/.test(digits)) return digits;
  if (digits.length === 12 && digits.startsWith('91') && /^9[6-9]/.test(digits.slice(2))) return digits.slice(2);
  return '';
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();
    reader.onload = () => { image.src = reader.result; };
    reader.onerror = reject;
    image.onload = () => {
      const scale = Math.min(1, 1800 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.naturalWidth * scale);
      canvas.height = Math.round(image.naturalHeight * scale);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    image.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `form-status ${type}`;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  statusMessage.textContent = '';
  statusMessage.className = 'form-status';
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const phone = normalizeIndianPhone(document.getElementById('phone').value);
  if (!phone) {
    showStatus('Please enter a valid Indian mobile number, such as +91 78543 87656.', 'error');
    document.getElementById('phone').focus();
    return;
  }

  const file = photoInput.files[0];
  if (!file || !file.type.startsWith('image/') || file.size > MAX_IMAGE_SIZE) {
    showStatus('Please add an image smaller than 5MB.', 'error');
    return;
  }
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('PASTE_')) {
    showStatus('The order form is not connected yet. Please add the Google Apps Script /exec URL in script.js.', 'error');
    return;
  }

  submitButton.disabled = true;
  submitButton.firstChild.textContent = 'Sending...';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.phone = phone;
    payload.photoBase64 = await compressImage(file);
    payload.photoName = `${file.name.replace(/\.[^.]+$/, '')}.jpg`;
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    // Apps Script commonly returns an opaque response to static sites. The
    // request has reached the Web App, but its JSON response cannot be read.
    if (response.type === 'opaque') {
      form.reset();
      photoPreview.src = '';
      photoPreview.hidden = true;
      showStatus("Thanks! I'll review your request and call you shortly to confirm details.", 'success');
      return;
    }
    const responseText = await response.text();
    let result = {};
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      throw new Error('The Apps Script URL did not return JSON. Check that the deployment is public and uses /exec.');
    }
    const accepted = result.status === 'success' || result.success === true || result.ok === true;
    if (!response.ok || !accepted) throw new Error(result.message || 'The Apps Script rejected the request.');

    form.reset();
    photoPreview.src = '';
    photoPreview.hidden = true;
    showStatus("Thanks! I'll review your request and call you shortly to confirm details.", 'success');
  } catch (error) {
    const message = error.name === 'AbortError'
      ? 'The request timed out. Check the Apps Script deployment and try again.'
      : error.message.includes('Failed to fetch')
        ? 'The form could not reach Google Sheets. Set the Apps Script deployment access to Anyone, then try again.'
        : error.message || 'Sorry, your request could not be sent right now. Please try again in a moment.';
    showStatus(message, 'error');
  } finally {
    clearTimeout(timeout);
    submitButton.disabled = false;
    submitButton.firstChild.textContent = 'Send my request ';
  }
});
