import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

// Automatically trigger native calendar picker when clicking on date fields or their labels
document.addEventListener('click', (e) => {
  const target = e.target;
  if (!target) return;

  if (target instanceof HTMLInputElement && target.type === 'date') {
    try {
      if (typeof target.showPicker === 'function') {
        target.showPicker();
      }
    } catch {
      // Ignore if unsupported or already showing
    }
    return;
  }

  if (target instanceof HTMLLabelElement) {
    const parent = target.closest('.form-group, .form-field, div');
    if (parent) {
      const dateInput = parent.querySelector('input[type="date"]');
      if (dateInput && typeof dateInput.showPicker === 'function') {
        try {
          dateInput.showPicker();
        } catch {
          // Ignore
        }
      }
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

