// ============= tableManager.js =============
// مسؤول عن إدارة الجدول والبيانات والأعمدة

// ============= Data & State =============
let logs = [];
let columns = [
    { id: 'status_1', name: 'Status', visible: true }
];
let nextColumnId = 2;

// ============= Load / Save Helpers =============
function loadData() {
    const saved = localStorage.getItem("contactLogs");
    if (saved) { 
        try { 
            logs = JSON.parse(saved); 
        } catch (e) { 
            logs = []; 
        } 
    }
    
    const savedColumns = localStorage.getItem("columns");
    if (savedColumns) {
        try {
            columns = JSON.parse(savedColumns);
            columns.forEach(c => { 
                if (!c.id) c.id = 'status_' + Date.now() + Math.random(); 
            });
            const maxId = columns.reduce((m, c) => { 
                const n = parseInt(c.id.replace('status_', '')); 
                return n > m ? n : m; 
            }, 1);
            nextColumnId = maxId + 1;
        } catch (e) { 
            columns = [{ id: 'status_1', name: 'Status', visible: true }]; 
            nextColumnId = 2; 
        }
    } else { 
        columns = [{ id: 'status_1', name: 'Status', visible: true }]; 
        nextColumnId = 2; 
    }
    
    // Load custom statuses and colors from colorManager
    if (typeof loadColorData === 'function') {
        loadColorData();
    }
}

function saveData() {
    localStorage.setItem("contactLogs", JSON.stringify(logs));
    localStorage.setItem("columns", JSON.stringify(columns));
    updateRecordCount();
    
    // Save color data if available
    if (typeof saveColorData === 'function') {
        saveColorData();
    }
}

function updateRecordCount() {
    const el = document.getElementById("recordCount");
    if (el) el.textContent = logs.length;
}

// ============= Columns Management =============
function getVisibleColumns() {
    return columns.filter(c => c.visible !== false);
}

// الدوال الداخلية (غير موجودة في النطاق العام)
function addColumnInternal() {
    const lang = document.getElementById("language").value;
    const t = translations[lang];
    const newId = 'status_' + nextColumnId++;
    const newName = `Status ${columns.length}`;
    columns.push({ id: newId, name: newName, visible: true });
    saveData();
    renderColumnManagement();
    renderStatusInputs();
    renderTable();
    if (typeof generateChartInternal === 'function') {
        generateChartInternal();
    }
}

function removeColumnInternal(colId) {
    if (columns.length <= 1) { 
        alert("Cannot remove the last column!"); 
        return; 
    }
    const hasData = logs.some(log => log[colId] && log[colId].trim() !== '');
    if (hasData && !confirm(`Column "${getColumnName(colId)}" has data. Remove anyway?`)) return;
    columns = columns.filter(c => c.id !== colId);
    logs = logs.map(log => { 
        const newLog = { ...log }; 
        delete newLog[colId]; 
        return newLog; 
    });
    saveData();
    renderColumnManagement();
    renderStatusInputs();
    renderTable();
    if (typeof generateChartInternal === 'function') {
        generateChartInternal();
    }
}

function toggleColumnVisibilityInternal(colId) {
    const col = columns.find(c => c.id === colId);
    if (col) { 
        col.visible = !col.visible; 
        saveData(); 
        renderColumnManagement(); 
        renderStatusInputs(); 
        renderTable(); 
        if (typeof generateChartInternal === 'function') {
            generateChartInternal(); 
        }
    }
}

function updateColumnNameInternal(colId, newName) {
    const col = columns.find(c => c.id === colId);
    if (col) { 
        col.name = newName.trim() || col.name; 
        saveData(); 
        renderColumnManagement(); 
        renderStatusInputs(); 
        renderTable(); 
        if (typeof generateChartInternal === 'function') {
            generateChartInternal(); 
        }
    }
}

function getColumnName(colId) {
    const col = columns.find(c => c.id === colId);
    return col ? col.name : colId;
}

// ============= Render Column Management =============
function renderColumnManagement() {
    const lang = document.getElementById("language").value;
    const t = translations[lang];
    const container = document.getElementById("columnsList");
    if (!container) return;
    container.innerHTML = "";
    columns.forEach((col, index) => {
        const div = document.createElement("div");
        div.className = `column-item${col.visible === false ? ' hidden' : ''}`;
        div.draggable = true;
        div.innerHTML = `
            <span class="column-drag-handle" title="Drag to reorder">⠿</span>
            <input type="text" value="${col.name}" 
                   onchange="window.updateColumnName('${col.id}', this.value)"
                   onfocus="this.select()" placeholder="Column name..." />
            <span class="column-actions">
                <button class="col-btn visibility" onclick="window.toggleColumnVisibility('${col.id}')" 
                        title="${col.visible !== false ? 'Hide' : 'Show'}">
                    ${col.visible !== false ? '👁️' : '🚫'}
                </button>
                ${columns.length > 1 ? `
                    <button class="col-btn delete-col" onclick="window.removeColumn('${col.id}')" 
                            title="${t.deleteCol || 'Delete'}">✕</button>
                ` : ''}
            </span>
        `;
        container.appendChild(div);
        
        // Drag & drop
        div.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', index));
        div.addEventListener('dragover', (e) => e.preventDefault());
        div.addEventListener('drop', (e) => {
            e.preventDefault();
            const from = parseInt(e.dataTransfer.getData('text/plain'));
            const to = index;
            if (from !== to) {
                const [moved] = columns.splice(from, 1);
                columns.splice(to, 0, moved);
                saveData();
                renderColumnManagement();
                renderStatusInputs();
                renderTable();
                if (typeof generateChartInternal === 'function') {
                    generateChartInternal();
                }
            }
        });
    });
}

// ============= Render Status Inputs =============
function renderStatusInputs() {
    const container = document.getElementById("statusInputs");
    if (!container) return;
    container.innerHTML = "";
    const visibleCols = getVisibleColumns();
    const allStatuses = getAllStatusList();

    visibleCols.forEach(col => {
        const div = document.createElement("div");
        div.className = "status-text-input";
        const listId = `datalist_${col.id}`;
        div.innerHTML = `
            <label for="input_${col.id}">${col.name}</label>
            <input type="text" id="input_${col.id}" 
                   list="${listId}" 
                   placeholder="Type or select..." 
                   autocomplete="off" />
            <datalist id="${listId}"></datalist>
        `;
        container.appendChild(div);
        const datalist = div.querySelector('datalist');
        allStatuses.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            datalist.appendChild(opt);
        });
    });
}

// ============= Add Entry =============
function addEntryInternal() {
    const date = document.getElementById("date").value;
    if (!date) {
        const lang = document.getElementById("language").value;
        alert(translations[lang].noData || "Please select a date!");
        return;
    }
    const entry = { id: Date.now(), date: date };
    const visibleCols = getVisibleColumns();
    visibleCols.forEach(col => {
        const input = document.getElementById(`input_${col.id}`);
        if (input) {
            const val = input.value.trim();
            if (val) {
                const lang = document.getElementById("language").value;
                const all = getAllStatusList();
                if (!all.includes(val)) {
                    if (typeof addCustomStatus === 'function') {
                        addCustomStatus(val);
                    }
                }
                entry[col.id] = val;
            }
        }
    });
    logs.push(entry);
    saveData();
    renderTable();
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("date").value = today;
    visibleCols.forEach(col => {
        const inp = document.getElementById(`input_${col.id}`);
        if (inp) inp.value = '';
    });
    if (typeof generateChartInternal === 'function') {
        generateChartInternal();
    }
}

// ============= Delete Entry =============
function deleteEntryInternal(id) {
    const lang = document.getElementById("language").value;
    if (confirm(translations[lang].confirmDelete)) {
        logs = logs.filter(log => log.id !== id);
        saveData();
        renderTable();
        if (typeof generateChartInternal === 'function') {
            generateChartInternal();
        }
    }
}

// ============= Edit Entry =============
function editEntryInternal(id) {
    const log = logs.find(log => log.id === id);
    if (!log) return;
    document.getElementById("date").value = log.date;
    const visibleCols = getVisibleColumns();
    visibleCols.forEach(col => {
        const input = document.getElementById(`input_${col.id}`);
        if (input) {
            input.value = log[col.id] || '';
        }
    });
    logs = logs.filter(log => log.id !== id);
    saveData();
    renderTable();
    if (typeof generateChartInternal === 'function') {
        generateChartInternal();
    }
    document.getElementById("addBtn").focus();
}

// ============= Render Table =============
function renderTable() {
    const lang = document.getElementById("language").value;
    const t = translations[lang];
    const table = document.getElementById("logTable");
    const headersRow = document.getElementById("tableHeaders");
    if (!table || !headersRow) return;
    const visibleCols = getVisibleColumns();
    headersRow.innerHTML = `<th id="dateHeader">📅 Date</th>`;
    visibleCols.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col.name;
        headersRow.appendChild(th);
    });
    const actionsTh = document.createElement("th");
    actionsTh.id = "actionsHeader";
    actionsTh.textContent = "⚙️ Actions";
    actionsTh.style.minWidth = "80px";
    headersRow.appendChild(actionsTh);

    if (logs.length === 0) {
        table.innerHTML = `<tr><td colspan="${visibleCols.length + 2}" class="empty-msg">${t.empty}</td></tr>`;
        updateRecordCount();
        return;
    }
    table.innerHTML = "";
    const sorted = [...logs].reverse();
    sorted.forEach(log => {
        let rowHTML = `<td>${log.date}</td>`;
        visibleCols.forEach(col => {
            const val = log[col.id] || '';
            const color = typeof getStatusColor === 'function' ? getStatusColor(val) : '#94a3b8';
            const displayName = val || '—';
            rowHTML += `<td>${val ? `<span class="status-badge" style="background-color:${color}">${displayName}</span>` : '—'}</td>`;
        });
        rowHTML += `<td>
            <button class="action-btn delete" onclick="window.deleteEntry(${log.id})">🗑️</button>
        </td>`;
        const row = document.createElement("tr");
        row.innerHTML = rowHTML;
        row.addEventListener('dblclick', function() {
            window.editEntry(log.id);
        });
        table.appendChild(row);
    });
    updateRecordCount();
}

// ============= Clear All =============
function clearAllInternal() {
    const lang = document.getElementById("language").value;
    if (confirm(translations[lang].confirmClear)) {
        logs = [];
        saveData();
        renderTable();
        if (typeof destroyAllCharts === 'function') {
            destroyAllCharts();
        }
        document.getElementById("chartSection").style.display = "none";
    }
}

// ============= Change Language =============
function changeLanguageInternal() {
    const lang = document.getElementById("language").value;
    const t = translations[lang];
    document.getElementById("title").innerText = t.title;
    document.getElementById("addBtn").innerText = t.add;
    document.getElementById("dateLabel").innerText = t.date;
    document.getElementById("customStatusLabel").innerText = t.customStatus;
    document.getElementById("colorTitle").innerText = t.colorTitle;
    document.getElementById("statsBtn").innerText = t.stats;
    document.getElementById("printBtn").innerText = t.print;
    document.getElementById("clearBtn").innerText = t.clear;
    document.getElementById("recordsTitle").innerText = t.records;
    document.getElementById("chartTitle").innerText = t.chartTitle;
    document.getElementById("dateHeader").innerText = t.date;
    document.getElementById("actionsHeader").innerText = t.actions;
    document.getElementById("customStatus").placeholder = t.enterCustomStatus;
    const titlesTitle = document.getElementById("titlesTitle");
    const printTableLabel = document.getElementById("printTitleLabel");
    const printChartLabel = document.getElementById("printChartTitleLabel");
    const editBtn = document.querySelector('.title-control .btn-small');
    if (titlesTitle) titlesTitle.textContent = t.titlesTitle;
    if (printTableLabel) printTableLabel.textContent = t.printTableLabel;
    if (printChartLabel) printChartLabel.textContent = t.printChartLabel;
    if (editBtn) editBtn.textContent = t.editTitle;
    const columnsTitle = document.getElementById("columnsTitle");
    const addColumnBtn = document.getElementById("addColumnBtn");
    if (columnsTitle) columnsTitle.textContent = t.columnsTitle;
    if (addColumnBtn) addColumnBtn.textContent = t.addColumn;
    renderColumnManagement();
    renderStatusInputs();
    renderTable();
    renderColorManagement();
    if (typeof generateChartInternal === 'function') {
        generateChartInternal();
    }
}

// ============= Initialize =============
function initApp() {
    loadData();
    renderColumnManagement();
    renderStatusInputs();
    renderTable();
    if (typeof renderColorManagement === 'function') {
        renderColorManagement();
    }
    // Set today's date
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("date").value = today;
    // Load print titles
    if (typeof loadPrintTitles === 'function') {
        loadPrintTitles();
    }
    // Update main title
    const mainTitle = document.getElementById("mainTitle");
    if (mainTitle && customTitles.main) {
        mainTitle.value = customTitles.main;
        document.getElementById("title").innerText = customTitles.main;
    }
}