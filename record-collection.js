class RecordCollection {
    constructor() {
        this.records = this.loadFromStorage();
        this.editingId = null;
        this.currentSortBy = 'dateAdded-desc';
        this.currentSearchQuery = '';
        this.currentView = localStorage.getItem('recordCollectionView') || 'cards';
        this.initializeEventListeners();
        this.restoreViewPreference();
        this.displayRecords();
        this.updateStats();
    }

    initializeEventListeners() {
        // Add record button
        document.getElementById('addRecordBtn').addEventListener('click', () => {
            this.showForm();
        });

        // Cancel button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideForm();
        });

        // Form submission
        document.getElementById('recordFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRecord();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentSearchQuery = e.target.value;
            this.applyFiltersAndSort();
        });

        // Sort functionality
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.currentSortBy = e.target.value;
            this.applyFiltersAndSort();
        });

        // View toggle
        document.getElementById('viewSelect').addEventListener('change', (e) => {
            this.currentView = e.target.value;
            localStorage.setItem('recordCollectionView', this.currentView);
            this.applyView();
        });

        // Export CSV button
        document.getElementById('exportCsvBtn').addEventListener('click', () => {
            this.exportToCSV();
        });

        // Import CSV button
        document.getElementById('importCsvBtn').addEventListener('click', () => {
            document.getElementById('csvFileInput').click();
        });

        // File input change
        document.getElementById('csvFileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        // Modal close buttons
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.hideImportModal();
        });

        document.getElementById('closeModalBtnFooter').addEventListener('click', () => {
            this.hideImportModal();
        });
    }

    restoreViewPreference() {
        document.getElementById('viewSelect').value = this.currentView;
        this.applyView();
    }

    applyView() {
        const recordsList = document.getElementById('recordsList');
        recordsList.classList.toggle('list-view', this.currentView === 'list');
    }

    showForm(record = null) {
        const form = document.getElementById('recordForm');
        const formTitle = document.getElementById('formTitle');
        
        if (record) {
            // Editing existing record
            formTitle.textContent = 'Edit Record';
            this.editingId = record.id;
            this.populateForm(record);
        } else {
            // Adding new record
            formTitle.textContent = 'Add New Record';
            this.editingId = null;
            this.clearForm();
        }
        
        form.classList.remove('hidden');
        form.scrollIntoView({ behavior: 'smooth' });
    }

    hideForm() {
        document.getElementById('recordForm').classList.add('hidden');
        this.clearForm();
        this.editingId = null;
    }

    populateForm(record) {
        document.getElementById('artist').value = record.artist;
        document.getElementById('album').value = record.album;
        document.getElementById('year').value = record.year || '';
        document.getElementById('genre').value = record.genre || '';
        document.getElementById('condition').value = record.condition || '';
        document.getElementById('price').value = record.price || '';
        document.getElementById('notes').value = record.notes || '';
    }

    clearForm() {
        document.getElementById('recordFormElement').reset();
    }

    saveRecord() {
        const formData = {
            artist: document.getElementById('artist').value,
            album: document.getElementById('album').value,
            year: document.getElementById('year').value,
            genre: document.getElementById('genre').value,
            condition: document.getElementById('condition').value,
            price: document.getElementById('price').value,
            notes: document.getElementById('notes').value,
            dateAdded: new Date().toISOString()
        };

        if (this.editingId) {
            // Update existing record
            const index = this.records.findIndex(r => r.id === this.editingId);
            if (index !== -1) {
                this.records[index] = { ...this.records[index], ...formData };
            }
        } else {
            // Add new record
            const newRecord = {
                id: Date.now().toString(),
                ...formData
            };
            this.records.push(newRecord);
        }

        this.saveToStorage();
        this.applyFiltersAndSort();
        this.updateStats();
        this.hideForm();
    }

    deleteRecord(id) {
        if (confirm('Are you sure you want to delete this record?')) {
            this.records = this.records.filter(record => record.id !== id);
            this.saveToStorage();
            this.applyFiltersAndSort();
            this.updateStats();
        }
    }

    editRecord(id) {
        const record = this.records.find(r => r.id === id);
        if (record) {
            this.showForm(record);
        }
    }

    displayRecords(recordsToShow = null) {
        const recordsList = document.getElementById('recordsList');
        const emptyState = document.getElementById('emptyState');
        const records = recordsToShow || this.records;

        if (records.length === 0) {
            recordsList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        recordsList.innerHTML = records.map(record => this.createRecordCard(record)).join('');

        // Add event listeners to buttons
        records.forEach(record => {
            const editBtn = document.querySelector(`[data-edit="${record.id}"]`);
            const deleteBtn = document.querySelector(`[data-delete="${record.id}"]`);
            
            if (editBtn) {
                editBtn.addEventListener('click', () => this.editRecord(record.id));
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteRecord(record.id));
            }
        });
    }

    createRecordCard(record) {
        const formatPrice = (price) => {
            return price ? `$${parseFloat(price).toFixed(2)}` : 'N/A';
        };

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString();
        };

        return `
            <div class="record-card">
                <div class="record-actions">
                    <button class="btn-small btn-edit" data-edit="${record.id}">Edit</button>
                    <button class="btn-small btn-delete" data-delete="${record.id}">Delete</button>
                </div>
                
                <div class="record-title">${record.album}</div>
                <div class="record-artist">by ${record.artist}</div>
                
                <div class="record-details">
                    ${record.year ? `<div class="record-detail"><span>Year:</span> <strong>${record.year}</strong></div>` : ''}
                    ${record.genre ? `<div class="record-detail"><span>Genre:</span> <strong>${record.genre}</strong></div>` : ''}
                    ${record.condition ? `<div class="record-detail"><span>Condition:</span> <strong>${record.condition}</strong></div>` : ''}
                    ${record.price ? `<div class="record-detail"><span>Price:</span> <strong>${formatPrice(record.price)}</strong></div>` : ''}
                    <div class="record-detail"><span>Added:</span> <strong>${formatDate(record.dateAdded)}</strong></div>
                </div>
                
                ${record.notes ? `<div class="record-notes">"${record.notes}"</div>` : ''}
            </div>
        `;
    }

    applyFiltersAndSort() {
        let filteredRecords = [...this.records];

        // Apply search filter
        if (this.currentSearchQuery.trim()) {
            filteredRecords = filteredRecords.filter(record => {
                const searchFields = [
                    record.artist,
                    record.album,
                    record.genre,
                    record.year,
                    record.notes
                ].map(field => (field || '').toLowerCase());

                return searchFields.some(field => 
                    field.includes(this.currentSearchQuery.toLowerCase())
                );
            });
        }

        // Apply sorting
        filteredRecords.sort((a, b) => {
            const [field, direction] = this.currentSortBy.split('-');
            let aValue, bValue;

            switch (field) {
                case 'artist':
                    aValue = (a.artist || '').toLowerCase();
                    bValue = (b.artist || '').toLowerCase();
                    break;
                case 'album':
                    aValue = (a.album || '').toLowerCase();
                    bValue = (b.album || '').toLowerCase();
                    break;
                case 'year':
                    aValue = parseInt(a.year) || 0;
                    bValue = parseInt(b.year) || 0;
                    break;
                case 'price':
                    aValue = parseFloat(a.price) || 0;
                    bValue = parseFloat(b.price) || 0;
                    break;
                case 'genre':
                    aValue = (a.genre || '').toLowerCase();
                    bValue = (b.genre || '').toLowerCase();
                    break;
                case 'dateAdded':
                    aValue = new Date(a.dateAdded).getTime();
                    bValue = new Date(b.dateAdded).getTime();
                    break;
                default:
                    return 0;
            }

            let result;
            if (typeof aValue === 'string') {
                result = aValue.localeCompare(bValue);
            } else {
                result = aValue - bValue;
            }

            return direction === 'desc' ? -result : result;
        });

        this.displayRecords(filteredRecords);
    }

    updateStats() {
        const recordCount = document.getElementById('recordCount');
        const totalSpent = document.getElementById('totalSpent');
        
        const count = this.records.length;
        recordCount.textContent = count;
        
        // Calculate total spent
        const total = this.records.reduce((sum, record) => {
            const price = parseFloat(record.price) || 0;
            return sum + price;
        }, 0);
        
        totalSpent.textContent = `$${total.toFixed(2)}`;
    }

    saveToStorage() {
        localStorage.setItem('recordCollection', JSON.stringify(this.records));
    }

    loadFromStorage() {
        const stored = localStorage.getItem('recordCollection');
        return stored ? JSON.parse(stored) : [];
    }

    exportToCSV() {
        if (this.records.length === 0) {
            alert('No records to export!');
            return;
        }

        // Define CSV headers (all fields)
        const headers = ['id', 'artist', 'album', 'year', 'genre', 'condition', 'price', 'notes', 'dateAdded'];

        // Helper function to escape CSV values
        const escapeCSV = (value) => {
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        };

        // Build CSV content
        let csvContent = headers.join(',') + '\n';

        this.records.forEach(record => {
            const row = headers.map(header => escapeCSV(record[header]));
            csvContent += row.join(',') + '\n';
        });

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `record-collection-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    handleFileSelect(event) {
        const file = event.target.files[0];

        if (!file) return;

        // Validate file type
        if (!file.name.endsWith('.csv')) {
            alert('Please select a valid CSV file.');
            event.target.value = ''; // Reset input
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File is too large. Maximum size is 5MB.');
            event.target.value = '';
            return;
        }

        // Read and process file
        const reader = new FileReader();
        reader.onload = (e) => {
            this.importFromCSV(e.target.result);
            event.target.value = ''; // Reset input for next import
        };
        reader.onerror = () => {
            alert('Error reading file. Please try again.');
            event.target.value = '';
        };
        reader.readAsText(file);
    }

    importFromCSV(csvContent) {
        const results = {
            added: 0,
            updated: 0,
            errors: 0,
            errorDetails: []
        };

        try {
            // Parse CSV
            const lines = csvContent.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                alert('CSV file is empty or invalid.');
                return;
            }

            // Parse header
            const headers = this.parseCSVLine(lines[0]);

            // Validate required columns
            if (!headers.includes('artist') || !headers.includes('album')) {
                alert('CSV must contain at least "artist" and "album" columns.');
                return;
            }

            // Process each record
            for (let i = 1; i < lines.length; i++) {
                try {
                    const values = this.parseCSVLine(lines[i]);

                    if (values.length === 0) continue; // Skip empty lines

                    // Create record object from CSV row
                    const record = {};
                    headers.forEach((header, index) => {
                        record[header] = values[index] || '';
                    });

                    // Validate required fields
                    if (!record.artist || !record.artist.trim()) {
                        results.errors++;
                        results.errorDetails.push(`Row ${i + 1}: Missing artist`);
                        continue;
                    }

                    if (!record.album || !record.album.trim()) {
                        results.errors++;
                        results.errorDetails.push(`Row ${i + 1}: Missing album`);
                        continue;
                    }

                    // Attempt to match existing record
                    const matchedRecord = this.findMatchingRecord(record);

                    if (matchedRecord) {
                        // Update existing record
                        const index = this.records.findIndex(r => r.id === matchedRecord.id);
                        if (index !== -1) {
                            // Preserve original ID and dateAdded if not in CSV
                            this.records[index] = {
                                ...matchedRecord,
                                ...record,
                                id: matchedRecord.id,
                                dateAdded: record.dateAdded || matchedRecord.dateAdded
                            };
                            results.updated++;
                        }
                    } else {
                        // Add new record
                        const newRecord = {
                            id: record.id && !this.records.find(r => r.id === record.id)
                                ? record.id
                                : Date.now().toString() + Math.random().toString(36).substr(2, 9),
                            artist: record.artist.trim(),
                            album: record.album.trim(),
                            year: record.year || '',
                            genre: record.genre || '',
                            condition: record.condition || '',
                            price: record.price || '',
                            notes: record.notes || '',
                            dateAdded: record.dateAdded || new Date().toISOString()
                        };
                        this.records.push(newRecord);
                        results.added++;
                    }
                } catch (error) {
                    results.errors++;
                    results.errorDetails.push(`Row ${i + 1}: ${error.message}`);
                }
            }

            // Save and refresh
            if (results.added > 0 || results.updated > 0) {
                this.saveToStorage();
                this.applyFiltersAndSort();
                this.updateStats();
            }

            // Show results modal
            this.showImportModal(results);

        } catch (error) {
            alert(`Error importing CSV: ${error.message}`);
        }
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Escaped quote
                    current += '"';
                    i++; // Skip next quote
                } else {
                    // Toggle quote mode
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // End of field
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        // Add last field
        result.push(current.trim());

        return result;
    }

    findMatchingRecord(importedRecord) {
        // Strategy 1: Match by ID (exact match)
        if (importedRecord.id) {
            const idMatch = this.records.find(r => r.id === importedRecord.id);
            if (idMatch) return idMatch;
        }

        // Strategy 2: Match by artist + album (case-insensitive)
        const normalizedArtist = (importedRecord.artist || '').toLowerCase().trim();
        const normalizedAlbum = (importedRecord.album || '').toLowerCase().trim();

        return this.records.find(r => {
            const recordArtist = (r.artist || '').toLowerCase().trim();
            const recordAlbum = (r.album || '').toLowerCase().trim();
            return recordArtist === normalizedArtist && recordAlbum === normalizedAlbum;
        });
    }

    showImportModal(results) {
        document.getElementById('recordsAdded').textContent = results.added;
        document.getElementById('recordsUpdated').textContent = results.updated;
        document.getElementById('recordsErrored').textContent = results.errors;

        const errorDetails = document.getElementById('errorDetails');
        const errorList = document.getElementById('errorList');

        if (results.errors > 0 && results.errorDetails.length > 0) {
            errorDetails.classList.remove('hidden');
            errorList.innerHTML = results.errorDetails
                .map(error => `<li>${error}</li>`)
                .join('');
        } else {
            errorDetails.classList.add('hidden');
        }

        document.getElementById('importModal').classList.remove('hidden');
    }

    hideImportModal() {
        document.getElementById('importModal').classList.add('hidden');
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new RecordCollection();
});
