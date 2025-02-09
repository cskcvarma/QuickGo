// options.js

// Get references to the form elements.
const form = document.getElementById('shortcutForm');
const nameInput = document.getElementById('shortcutName');
const urlInput = document.getElementById('shortcutURL');
const saveBtn = document.getElementById('saveBtn');
const listBody = document.getElementById('shortcutsList');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');

let editingKey = null; // Tracks which shortcut is being edited (if any)

// Function to load all shortcuts from storage and display them in the table.
function loadAndDisplayShortcuts() {
  chrome.storage.sync.get(null, (data) => {
    listBody.innerHTML = ''; // Clear existing entries.
    for (let shortcut in data) {
      const url = data[shortcut];
      // Create a table row.
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      nameCell.textContent = shortcut;
      const urlCell = document.createElement('td');
      urlCell.textContent = url;
      const actionsCell = document.createElement('td');
      actionsCell.className = 'actions';
      
      // Edit button.
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => {
        editingKey = shortcut;
        nameInput.value = shortcut;
        urlInput.value = url;
        saveBtn.textContent = 'Save';  // Update button text when editing.
      });
      
      // Delete button.
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => {
        chrome.storage.sync.remove(shortcut, () => {
          loadAndDisplayShortcuts(); // Refresh the list after deletion.
        });
      });
      
      // Append buttons and cells to the row.
      actionsCell.appendChild(editBtn);
      actionsCell.appendChild(deleteBtn);
      row.appendChild(nameCell);
      row.appendChild(urlCell);
      row.appendChild(actionsCell);
      listBody.appendChild(row);
    }
  });
}

// Handle form submission for adding or updating a shortcut.
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const shortcut = nameInput.value.trim();
  const url = urlInput.value.trim();
  if (!shortcut || !url) return;
  // If editing and the shortcut name has been changed, remove the old key.
  if (editingKey && editingKey !== shortcut) {
    chrome.storage.sync.remove(editingKey);
  }
  // Save or update the shortcut.
  chrome.storage.sync.set({ [shortcut]: url }, () => {
    // Reset form state.
    editingKey = null;
    saveBtn.textContent = 'Add Shortcut';
    form.reset();
    loadAndDisplayShortcuts();
  });
});

// Export all shortcuts to a JSON file.
exportBtn.addEventListener('click', () => {
  chrome.storage.sync.get(null, (data) => {
    const jsonStr = JSON.stringify(data, null, 2);  // Pretty-print with 2-space indent.
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'go_shortcuts_backup.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);  // Clean up.
  });
});

// Import shortcuts from a JSON file.
importBtn.addEventListener('click', () => {
  importFile.click();
});
importFile.addEventListener('change', () => {
  const file = importFile.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (typeof data === 'object' && data !== null) {
        // Clear current storage and set the imported shortcuts.
        chrome.storage.sync.clear(() => {
          chrome.storage.sync.set(data, () => {
            loadAndDisplayShortcuts();
          });
        });
      }
    } catch (err) {
      console.error('Invalid JSON file format', err);
      alert('Failed to import: invalid file format.');
    }
  };
  reader.readAsText(file);
  // Reset file input so the change event fires again if the same file is chosen later.
  importFile.value = '';
});
  
// On page load, display the list of shortcuts.
loadAndDisplayShortcuts();

// Add these new functions and event listener
document.getElementById('searchInput').addEventListener('input', filterShortcuts);

function filterShortcuts(e) {
  const searchTerm = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#shortcutsList tr');
  
  rows.forEach(row => {
    const shortcut = row.querySelector('td:first-child').textContent.toLowerCase();
    const url = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
    
    if (shortcut.includes(searchTerm) || url.includes(searchTerm)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

// Modify your existing displayShortcuts function to clear the search when refreshing the list
function displayShortcuts(shortcuts) {
  const shortcutsList = document.getElementById('shortcutsList');
  shortcutsList.innerHTML = '';
  
  // Clear search input when refreshing the list
  document.getElementById('searchInput').value = '';
  
  // ... rest of your existing displayShortcuts function ...
} 