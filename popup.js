// Framework Templatizer Popup Logic
import { TEMPLATIZE_ENDPOINT, AUTH_ENDPOINT, EXTENSION_NAME } from './config.js';

// Auth Elements
const authView = document.getElementById('auth-view');
const authInput = document.getElementById('auth-user-id');
const authSubmit = document.getElementById('auth-submit');
const authError = document.getElementById('auth-error');

// UI Elements
const mainView = document.getElementById('main-view');
const successView = document.getElementById('success-view');
const titleInput = document.getElementById('title-input');
const messageInput = document.getElementById('message-input');
const subjectInput = document.getElementById('subject-input');
const submitBtn = document.getElementById('submit-btn');
const statusMessage = document.getElementById('status-message');
const closeBtn = document.getElementById('close-btn');
const closeBtnSuccess = document.getElementById('close-btn-success');
const newBtn = document.getElementById('new-btn');
const notionLink = document.getElementById('notion-link');
const createdTitle = document.getElementById('created-title');
const createdStep = document.getElementById('created-step');

// Initialize
init();

async function init() {
  const auth = await getAuth();
  if (auth?.userId) {
    showMainContent();
  } else {
    showAuthView();
  }
  setupEventListeners();
  updateSubmitButton();
}

// Auth functions
function showAuthView() {
  authView.style.display = 'block';
  mainView.style.display = 'none';
  successView.style.display = 'none';

  authInput.addEventListener('input', () => {
    authSubmit.disabled = authInput.value.trim().length === 0;
    authError.textContent = '';
  });

  authSubmit.addEventListener('click', handleAuth);
}

function showMainContent() {
  authView.style.display = 'none';
  mainView.style.display = 'block';
}

async function handleAuth() {
  const userId = authInput.value.trim();
  if (!userId) return;

  authSubmit.disabled = true;
  authSubmit.textContent = 'Verifying...';
  authError.textContent = '';

  try {
    const resp = await fetch(`${AUTH_ENDPOINT}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, extension: EXTENSION_NAME }),
    });

    const data = await resp.json();

    if (resp.ok && data.success) {
      await chrome.storage.local.set({ extensionAuth: { userId, name: data.name } });
      showMainContent();
    } else {
      authError.textContent = data.error || 'Verification failed';
      authError.className = 'status-message status-error';
      authSubmit.disabled = false;
      authSubmit.textContent = 'Verify';
    }
  } catch (err) {
    authError.textContent = 'Could not connect to server';
    authError.className = 'status-message status-error';
    authSubmit.disabled = false;
    authSubmit.textContent = 'Verify';
  }
}

function getAuth() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['extensionAuth'], (result) => {
      resolve(result.extensionAuth || null);
    });
  });
}

function setupEventListeners() {
  // Message input - enable/disable submit button
  messageInput.addEventListener('input', updateSubmitButton);
  
  // Submit button
  submitBtn.addEventListener('click', handleSubmit);
  
  // Close buttons
  closeBtn.addEventListener('click', () => window.close());
  closeBtnSuccess.addEventListener('click', () => window.close());
  
  // New button - go back to main view
  newBtn.addEventListener('click', resetToMainView);
  
  // Allow Ctrl+Enter to submit
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!submitBtn.disabled) {
        handleSubmit();
      }
    }
  });
}

function updateSubmitButton() {
  const hasMessage = messageInput.value.trim().length > 0;
  submitBtn.disabled = !hasMessage;
}

function getSelectedStep() {
  const selectedRadio = document.querySelector('input[name="step"]:checked');
  return selectedRadio ? selectedRadio.value : 'First-touch';
}

function getSelectedChannel() {
  const selectedRadio = document.querySelector('input[name="channel"]:checked');
  const value = selectedRadio ? selectedRadio.value : '';
  return value || undefined;
}

async function handleSubmit() {
  const message = messageInput.value.trim();
  const title = titleInput.value.trim();
  const step = getSelectedStep();
  const channel = getSelectedChannel();
  const subjectFramework = subjectInput?.value?.trim() || undefined;

  if (!message) {
    showStatus('Please enter a message to templatize', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';
  showStatus('Templatizing framework with AI...', 'loading');

  try {
    const response = await fetch(TEMPLATIZE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        title: title || undefined,
        step: step,
        channel: channel,
        subject_framework: subjectFramework
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to templatize framework');
    }

    showSuccessView(data);

  } catch (error) {
    console.error('Error:', error);
    showStatus(error.message || 'An error occurred', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Templatize';
  }
}

function showStatus(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = `status-message status-${type}`;
  
  if (type === 'loading') {
    statusMessage.innerHTML = `<span class="loading-spinner"></span> ${message}`;
  }
}

function showSuccessView(data) {
  // Update success view content
  createdTitle.textContent = data.title || 'Untitled Framework';
  createdStep.textContent = data.step || 'First-touch';
  
  // Set Notion link
  if (data.framework_url) {
    notionLink.href = data.framework_url;
    notionLink.style.display = 'flex';
  } else {
    notionLink.style.display = 'none';
  }
  
  // Switch views
  mainView.style.display = 'none';
  successView.style.display = 'block';
}

function resetToMainView() {
  titleInput.value = '';
  messageInput.value = '';
  if (subjectInput) subjectInput.value = '';
  document.querySelector('input[name="step"][value="First-touch"]').checked = true;
  const unspecifiedChannel = document.querySelector('input[name="channel"][value=""]');
  if (unspecifiedChannel) unspecifiedChannel.checked = true;

  statusMessage.textContent = '';
  statusMessage.className = 'status-message';

  submitBtn.disabled = true;
  submitBtn.textContent = 'Templatize';

  successView.style.display = 'none';
  mainView.style.display = 'block';
}
