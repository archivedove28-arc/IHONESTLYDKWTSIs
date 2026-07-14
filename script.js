// CONFIGURATION: Set your secret variables here
const ADMIN_PASSWORD = "153264"; 

// Words to filter out automatically (Case-insensitive)
const BANNED_WORDS = ["ASS", "UGLY"]; 

// Local Database initialization
let entries = JSON.parse(localStorage.getItem('guestbook_entries')) || [];

const form = document.getElementById('guestbook-form');
const notesList = document.getElementById('notes-list');
const adminNotesList = document.getElementById('admin-notes-list');
const entryCounter = document.getElementById('entry-counter');
const adminCounter = document.getElementById('admin-counter');
const loginForm = document.getElementById('login-form');

// View Switching Router
function switchView(viewId) {
  document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
  
  if (viewId === 'view-guestbook') renderGuestbook();
  if (viewId === 'view-admin') renderAdminPanel();
}

// Censor Filter Engine
function filterBadWords(text) {
  let filteredText = text;
  BANNED_WORDS.forEach(word => {
    const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
    filteredText = filteredText.replace(regex, '[censored]');
  });
  return filteredText;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + 
         ' at ' + 
         date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3000);
}

// Renders public view (Form + Active Messages directly beneath)
function renderGuestbook() {
  entryCounter.innerText = `${entries.length} ${entries.length === 1 ? 'ENTRY' : 'ENTRIES'} SO FAR`;
  
  if (entries.length === 0) {
    notesList.innerHTML = `
      <div class="empty-state">No entries yet.<span>Be the first to sign!</span></div>
    `;
    return;
  }

  notesList.innerHTML = entries.map(entry => {
    const cleanName = filterBadWords(escapeHTML(entry.name));
    const cleanMessage = filterBadWords(escapeHTML(entry.message));
    const websiteLink = entry.website ? `<a href="${escapeHTML(entry.website)}" target="_blank" rel="noopener noreferrer" class="note-website">↗ website</a>` : '';

    // Notice how entry.email is missing here completely to preserve privacy
    return `
      <div class="note-card">
        <div class="note-meta">
          <div class="note-author-row">
            <span class="note-author">${cleanName}</span>
            ${websiteLink}
          </div>
          <span class="note-date">${formatDate(entry.date)}</span>
        </div>
        <p class="note-body">${cleanMessage}</p>
      </div>
    `;
  }).join('');
}

// Renders the private back-end dashboard
function renderAdminPanel() {
  adminCounter.innerText = `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`;

  if (entries.length === 0) {
    adminNotesList.innerHTML = `<div class="empty-state" style="background: white;">No entries yet.</div>`;
    return;
  }

  adminNotesList.innerHTML = entries.map((entry, index) => {
    const rawName = escapeHTML(entry.name);
    const rawMessage = escapeHTML(entry.message);
    const websiteLink = entry.website ? `<a href="${escapeHTML(entry.website)}" target="_blank" class="note-website">↗ Website</a>` : '';
    
    // Displays the email to you inside the manager panel
    const adminEmailBadge = entry.email ? `<div class="admin-email-badge">📩 Private Email: ${escapeHTML(entry.email)}</div>` : '';

    return `
      <div class="admin-row">
        <div class="admin-row-content">
          <div class="note-meta">
            <div class="note-author-row">
              <span class="note-author">${rawName}</span>
              ${websiteLink}
            </div>
            <span class="note-date">${formatDate(entry.date)}</span>
          </div>
          <p class="note-body">${rawMessage}</p>
          ${adminEmailBadge}
        </div>
        <button class="btn-delete" onclick="deleteEntry(${index})" title="Delete Entry">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="trash-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.34 9m-4.78 0L9 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>
    `;
  }).join('');
}

// Handling note submissions
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const nameInput = document.getElementById('guest-name');
  const emailInput = document.getElementById('guest-email');
  const websiteInput = document.getElementById('guest-website');
  const messageInput = document.getElementById('guest-message');

  const newEntry = {
    name: nameInput.value,
    email: emailInput.value || null, 
    website: websiteInput.value || null,
    message: messageInput.value,
    date: new Date().toISOString()
  };

  entries.unshift(newEntry);
  localStorage.setItem('guestbook_entries', JSON.stringify(entries));
  
  nameInput.value = '';
  emailInput.value = '';
  websiteInput.value = '';
  messageInput.value = '';
  
  renderGuestbook();
  showToast('Message added!');
});

// Admin Password Validator
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const passwordInput = document.getElementById('admin-password');
  
  if (passwordInput.value === ADMIN_PASSWORD) {
    passwordInput.value = '';
    switchView('view-admin');
  } else {
    alert('Incorrect password!');
    passwordInput.value = '';
  }
});

// Delete Execution Engine
window.deleteEntry = function(index) {
  entries.splice(index, 1);
  localStorage.setItem('guestbook_entries', JSON.stringify(entries));
  renderAdminPanel();
  showToast('Entry deleted');
};

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag] || tag));
}

// Initialize active page state
renderGuestbook();