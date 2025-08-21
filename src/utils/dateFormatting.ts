export function formatDateShort(dateInput: string | Date): string {
  try {
    let date: Date;
    
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      const trimmed = dateInput.trim();
      
      if (trimmed.includes('T') || trimmed.includes('Z')) {
        date = new Date(trimmed);
      } else {
        const parts = trimmed.split('-');
        if (parts.length !== 3) {
          console.error('formatDateShort: Invalid date format:', dateInput);
          return 'Invalid Date';
        }
        
        const [yearStr, monthStr, dayStr] = parts;
        
        if (yearStr.length !== 4 || monthStr.length !== 2 || dayStr.length !== 2) {
          console.error('formatDateShort: Invalid date component lengths:', dateInput);
          return 'Invalid Date';
        }
        
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);
        const day = parseInt(dayStr, 10);
        
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
          console.error('formatDateShort: Non-numeric date components:', dateInput);
          return 'Invalid Date';
        }
        
        if (month < 1 || month > 12 || day < 1 || day > 31) {
          console.error('formatDateShort: Date components out of range:', dateInput);
          return 'Invalid Date';
        }
        
        date = new Date(year, month - 1, day, 12, 0, 0);
        
        if (date.getFullYear() !== year || 
            date.getMonth() !== month - 1 || 
            date.getDate() !== day) {
          console.error('formatDateShort: Date validation failed:', dateInput, 'resulted in', date);
          return 'Invalid Date';
        }
      }
    } else {
      console.error('formatDateShort: Invalid input type:', typeof dateInput, dateInput);
      return 'Invalid Date';
    }
    
    if (isNaN(date.getTime())) {
      console.error('formatDateShort: Invalid date object:', dateInput);
      return 'Invalid Date';
    }
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  } catch (e) {
    console.error('formatDateShort: Exception:', e, 'for input:', dateInput);
    return 'Invalid Date';
  }
}

export function formatDateLong(dateInput: string | Date): string {
  try {
    let date: Date;
    
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      const trimmed = dateInput.trim();
      
      if (trimmed.includes('T') || trimmed.includes('Z')) {
        date = new Date(trimmed);
      } else {
        const parts = trimmed.split('-');
        if (parts.length !== 3) {
          console.error('formatDateLong: Invalid date format:', dateInput);
          return 'Invalid Date';
        }
        
        const [yearStr, monthStr, dayStr] = parts;
        
        if (yearStr.length !== 4 || monthStr.length !== 2 || dayStr.length !== 2) {
          console.error('formatDateLong: Invalid date component lengths:', dateInput);
          return 'Invalid Date';
        }
        
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);
        const day = parseInt(dayStr, 10);
        
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
          console.error('formatDateLong: Non-numeric date components:', dateInput);
          return 'Invalid Date';
        }
        
        if (month < 1 || month > 12 || day < 1 || day > 31) {
          console.error('formatDateLong: Date components out of range:', dateInput);
          return 'Invalid Date';
        }
        
        date = new Date(year, month - 1, day, 12, 0, 0);
        
        if (date.getFullYear() !== year || 
            date.getMonth() !== month - 1 || 
            date.getDate() !== day) {
          console.error('formatDateLong: Date validation failed:', dateInput, 'resulted in', date);
          return 'Invalid Date';
        }
      }
    } else {
      console.error('formatDateLong: Invalid input type:', typeof dateInput, dateInput);
      return 'Invalid Date';
    }
    
    if (isNaN(date.getTime())) {
      console.error('formatDateLong: Invalid date object:', dateInput);
      return 'Invalid Date';
    }
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  } catch (e) {
    console.error('formatDateLong: Exception:', e, 'for input:', dateInput);
    return 'Invalid Date';
  }
}