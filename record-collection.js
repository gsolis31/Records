class RecordCollection {
    constructor() {
        this.records = this.loadFromStorage();
        this.editingId = null;
        this.currentSortBy = 'dateAdded-desc';
        this.currentSearchQuery = '';
        this.initializeEventListeners();
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
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new RecordCollection();
});
