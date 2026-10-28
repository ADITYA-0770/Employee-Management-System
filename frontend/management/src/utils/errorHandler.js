export const parseError = (err) => {
    if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
            if (data.includes('<!DOCTYPE') || data.includes('<html') || data.includes('<head>')) {
                return `Request failed (${err.response.status} ${err.response.statusText || 'Error'})`;
            }
            return data;
        }
        if (data.detail) return data.detail;
        if (data.message) return data.message;
        
        // Parse DRF validation errors (e.g., {"email": ["Email already exists."]})
        const errors = [];
        for (const [key, value] of Object.entries(data)) {
            if (Array.isArray(value)) {
                // Capitalize the field name for better readability
                const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');
                errors.push(`${fieldName}: ${value[0]}`);
            } else if (typeof value === 'string') {
                const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');
                errors.push(`${fieldName}: ${value}`);
            }
        }
        
        if (errors.length > 0) {
            return errors.join('\n');
        }
    }
    return err.message || 'An unexpected error occurred';
};
