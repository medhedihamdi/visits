// ============= Data & State =============
let logs = [];
let chartInstances = [];
let printChartInstances = [];
let customStatuses = [];
let statusColors = {};
let customTitles = {
    main: "📞 Father's visits",
    printTable: "Visiting - Records",
    printChart: "Visiting - Statistics"
};
let columns = [
    { id: 'status_1', name: 'Status', visible: true }
];
let nextColumnId = 2;

Chart.register(ChartDataLabels);

// ============= Translations =============
const translations = {
    en: {
        title: "📞 Father's visits",
        add: "➕ Add",
        date: "📅 Date",
        status: "📌 Status",
        customStatus: "✏️ Quick Add Custom Status",
        colorTitle: "🎨 Status Colors",
        addColor: "➕ Add Custom Color",
        stats: "📊 Statistics",
        print: "🖨️ Print",
        clear: "🗑️ Clear All",
        records: "📋 Records",
        chartTitle: "📊 Statistics",
        actions: "⚙️ Actions",
        delete: "🗑️ Delete",
        empty: "📭 No records yet",
        confirmDelete: "Are you sure you want to delete this record?",
        confirmClear: "⚠️ Are you sure you want to clear all records?",
        noData: "❌ No data to show statistics!",
        noChartData: "❌ Not enough data to display chart!",
        printTitle: "Visiting - Records",
        printChartTitle: "Visiting - Statistics",
        enterCustomStatus: "Enter new status...",
        removeColor: "Remove",
        titlesTitle: "📝 Custom Titles for Print",
        printTableLabel: "📄 Table Title:",
        printChartLabel: "📊 Statistics Title:",
        editTitle: "✏️ Edit Title",
        columnsTitle: "📋 Manage Columns",
        addColumn: "➕ Add Column",
        hide: "Hide",
        show: "Show",
        deleteCol: "Delete",
        statuses: {
            father_cancelled: "Father Cancelled",
            mother_cancelled: "Mother Cancelled",
            medical: "Medical Certificate",
           
        }
    },
    hu: {
        title: "📞 Apa látogatásai",
        add: "➕ Hozzáadás",
        date: "📅 Dátum",
        status: "📌 Státusz",
        customStatus: "✏️ Egyedi státusz gyors hozzáadása",
        colorTitle: "🎨 Státusz színek",
        addColor: "➕ Egyedi szín hozzáadása",
        stats: "📊 Statisztika",
        print: "🖨️ Nyomtatás",
        clear: "🗑️ Minden törlése",
        records: "📋 Rekordok",
        chartTitle: "📊 Statisztika",
        actions: "⚙️ Műveletek",
        delete: "🗑️ Törlés",
        empty: "📭 Még nincsenek rekordok",
        confirmDelete: "Biztosan törölni szeretné ezt a rekordot?",
        confirmClear: "⚠️ Biztosan törölni szeretné az összes rekordot?",
        noData: "❌ Nincs adat a statisztikákhoz!",
        noChartData: "❌ Nincs elég adat a diagram megjelenítéséhez!",
        printTitle: "Kapcsolattartási Napló - Rekordok",
        printChartTitle: "Kapcsolattartási Napló - Statisztika",
        enterCustomStatus: "Adjon meg új státuszt...",
        removeColor: "Eltávolítás",
        titlesTitle: "📝 Egyedi címek nyomtatáshoz",
        printTableLabel: "📄 Táblázat címe:",
        printChartLabel: "📊 Statisztika címe:",
        editTitle: "✏️ Cím szerkesztése",
        columnsTitle: "📋 Oszlopok kezelése",
        addColumn: "➕ Oszlop hozzáadása",
        hide: "Elrejtés",
        show: "Megjelenítés",
        deleteCol: "Törlés",
        statuses: {
            father_cancelled: "Apa által lemondott",
            mother_cancelled: "Anya által lemondott",
            medical: "Orvosi igazolás",
          
        }
    }
};

// ============= Default Colors =============
const defaultColors = {
    father_cancelled: "#ef4444",
    father_verified: "#3b82f6",
    mother_cancelled: "#f59e0b",
    medical: "#10b981",
    provable: "#8b5cf6"
};

// ============= Helper function for colors =============
function getStatusColor(status) {
    if (!status) return "#94a3b8";
    if (statusColors[status]) {
        return statusColors[status];
    }
    if (defaultColors[status]) {
        return defaultColors[status];
    }
    return "#94a3b8";
}

// ============= Load / Save Helpers =============
function loadData() {
    const saved = localStorage.getItem("contactLogs");
    if (saved) { try { logs = JSON.parse(saved); } catch (e) { logs = []; } }
    const savedCustom = localStorage.getItem("customStatuses");
    if (savedCustom) { try { customStatuses = JSON.parse(savedCustom); } catch (e) { customStatuses = []; } }
    const savedColors = localStorage.getItem("statusColors");
    if (savedColors) { try { statusColors = JSON.parse(savedColors); } catch (e) { statusColors = { ...defaultColors }; } } else { statusColors = { ...defaultColors }; }
    const savedColumns = localStorage.getItem("columns");
    if (savedColumns) {
        try {
            columns = JSON.parse(savedColumns);
            columns.forEach(c => { if (!c.id) c.id = 'status_' + Date.now() + Math.random(); });
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
    const savedTitles = localStorage.getItem("customTitles");
    if (savedTitles) { try { customTitles = JSON.parse(savedTitles); } catch (e) {} }
}

function saveData() {
    localStorage.setItem("contactLogs", JSON.stringify(logs));
    localStorage.setItem("customStatuses", JSON.stringify(customStatuses));
    localStorage.setItem("statusColors", JSON.stringify(statusColors));
    localStorage.setItem("columns", JSON.stringify(columns));
    localStorage.setItem("customTitles", JSON.stringify(customTitles));
    updateRecordCount();
}

function updateRecordCount() {
    const el = document.getElementById("recordCount");
    if (el) el.textContent = logs.length;
}

// ============= Columns Management =============
function getVisibleColumns() {
    return columns.filter(c => c.visible !== false);
}

function addColumn() {
    const lang = document.getElementById("language").value;
    const t = translations[lang];
    const newId = 'status_' + nextColumnId++;
    const newName = `Status ${columns.length}`;
    columns.push({ id: newId, name: newName, visible: true });
    saveData();
    renderColumnManagement();
    renderStatusInputs();
    renderTable();
    generateChart();
}

function removeColumn(colId) {
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
    generateChart();
}

function toggleColumnVisibility(colId) {
    const col = columns.find(c => c.id === colId);
    if (col) { 
        col.visible = !col.visible; 
        saveData(); 
        renderColumnManagement(); 
        renderStatusInputs(); 
        renderTable(); 
        generateChart(); 
    }
}

function updateColumnName(colId, newName) {
    const col = columns.find(c => c.id === colId);
    if (col) { 
        col.name = newName.trim() || col.name; 
        saveData(); 
        renderColumnManagement(); 
        renderStatusInputs(); 
        renderTable(); 
        generateChart(); 
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
                   onchange="updateColumnName('${col.id}', this.value)"
                   onfocus="this.select()" placeholder="Column name..." />
            <span class="column-actions">
                <button class="col-btn visibility" onclick="toggleColumnVisibility('${col.id}')" 
                        title="${col.visible !== false ? t.hide || 'Hide' : t.show || 'Show'}">
                    ${col.visible !== false ? '👁️' : '🚫'}
                </button>
                ${columns.length > 1 ? `
                    <button class="col-btn delete-col" onclick="removeColumn('${col.id}')" 
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
                generateChart();
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

function getAllStatusList() {
    const lang = document.getElementById("language").value;
    const t = translations[lang];
    const set = new Set();
    for (let key in t.statuses) set.add(t.statuses[key]);
    customStatuses.forEach(s => set.add(s));
    return Array.from(set);
}

// ============= Quick Add Custom Status =============
function addCustomStatusFromInput() {
    const input = document.getElementById("customStatus");
    if (!input) return;
    const val = input.value.trim();
    if (!val) { alert("Please enter a status name."); return; }
    const all = getAllStatusList();
    if (all.includes(val)) { alert("This status already exists!"); return; }
    customStatuses.push(val);
    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    statusColors[val] = randomColor;
    input.value = '';
    saveData();
    renderStatusInputs();
    renderColorManagement();
    renderTable();
    generateChart();
}

// ============= Custom Status & Colors =============
function updateColor(statusKey, color) {
    statusColors[statusKey] = color;
    saveData();
    renderTable();
    generateChart();
}

function addCustomColor() {
    const input = document.getElementById("customStatus");
    if (!input) return;
    const val = input.value.trim();
    if (!val) { alert("Please enter a status name."); return; }
    const all = getAllStatusList();
    if (all.includes(val)) { alert("This status already exists!"); return; }
    customStatuses.push(val);
    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    statusColors[val] = randomColor;
    input.value = '';
    saveData();
    renderStatusInputs();
    renderColorManagement();
    renderTable();
    generateChart();
}

function removeCustomStatus(status) {
    const lang = document.getElementById("language").value;
    const t = translations[lang];
    const isUsed = logs.some(log => {
        for (let key in log) if (log[key] === status) return true;
        return false;
    });
    if (isUsed) { alert(`Cannot remove "${status}" because it is used in existing records!`); return; }
    if (confirm(`Are you sure you want to remove "${status}"?`)) {
        customStatuses = customStatuses.filter(s => s !== status);
        delete statusColors[status];
        saveData();
        renderStatusInputs();
        renderColorManagement();
        renderTable();
        generateChart();
    }
}

// ============= Render Color Management =============
function renderColorManagement() {
    const lang = document.getElementById("language").value;
    const t = translations[lang];
    const container = document.getElementById("customColorsContainer");
    if (!container) return;
    container.innerHTML = "";
    const defaultKeys = Object.keys(t.statuses);
    const defaultContainer = document.getElementById("colorManagement");
    if (!defaultContainer) return;
    defaultContainer.innerHTML = "";
    defaultKeys.forEach(key => {
        const div = document.createElement("div");
        div.className = "color-item";
        const color = getStatusColor(key);
        div.innerHTML = `
            <span>${t.statuses[key]}</span>
            <input type="color" value="${color}" onchange="updateColor('${key}', this.value)" />
        `;
        defaultContainer.appendChild(div);
    });
    customStatuses.forEach(status => {
        const div = document.createElement("div");
        div.className = "color-item";
        const color = getStatusColor(status);
        div.innerHTML = `
            <span>${status}</span>
            <input type="color" value="${color}" onchange="updateColor('${status}', this.value)" />
            <button class="remove-color" onclick="removeCustomStatus('${status}')">${t.removeColor}</button>
        `;
        container.appendChild(div);
    });
}

// ============= Add Entry =============
function addEntry() {
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
                    customStatuses.push(val);
                    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
                    statusColors[val] = randomColor;
                    saveData();
                    renderStatusInputs();
                    renderColorManagement();
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
    generateChart();
}

// ============= Delete Entry =============
function deleteEntry(id) {
    const lang = document.getElementById("language").value;
    if (confirm(translations[lang].confirmDelete)) {
        logs = logs.filter(log => log.id !== id);
        saveData();
        renderTable();
        generateChart();
    }
}

// ============= Edit Entry =============
function editEntry(id) {
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
    generateChart();
    document.getElementById("addBtn").focus();
}

// ============= Render Table =============
function renderTable() {
    const lang = document.getElementById("language").value;
    const t = translations[lang];
    const table = document.getElementById("logTable");
    const headersRow = document.getElementById("tableHeaders");
    if (!table) return;
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
            const color = getStatusColor(val);
            const displayName = val || '—';
            rowHTML += `<td>${val ? `<span class="status-badge" style="background-color:${color}">${displayName}</span>` : '—'}</td>`;
        });
        rowHTML += `<td>
            <button class="action-btn delete" onclick="deleteEntry(${log.id})">🗑️</button>
        </td>`;
        const row = document.createElement("tr");
        row.innerHTML = rowHTML;
        row.addEventListener('dblclick', function() {
            editEntry(log.id);
        });
        table.appendChild(row);
    });
    updateRecordCount();
}

// ============= Change Language =============
function changeLanguage() {
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
    generateChart();
}

// ============= Clear All =============
function clearAll() {
    const lang = document.getElementById("language").value;
    if (confirm(translations[lang].confirmClear)) {
        logs = [];
        saveData();
        renderTable();
        destroyAllCharts();
        document.getElementById("chartSection").style.display = "none";
    }
}

// ============= Chart Helpers =============
function destroyAllCharts() {
    if (chartInstances && chartInstances.length) {
        chartInstances.forEach(c => c.destroy());
        chartInstances = [];
    }
    const container = document.querySelector('.chart-container');
    if (container) {
        container.innerHTML = '';
    }
}

function getColors(count) {
    const palette = ["#ef4444","#3b82f6","#f59e0b","#10b981","#8b5cf6","#ec4899","#14b8a6","#f97316","#6366f1","#84cc16"];
    return palette.slice(0, count);
}

// ============= Generate Charts =============
function generateChart() {
    const lang = document.getElementById("language").value;
    const t = translations[lang];

    destroyAllCharts();

    if (logs.length === 0) {
        document.getElementById("chartSection").style.display = "none";
        return;
    }

    const visibleCols = getVisibleColumns();
    if (visibleCols.length === 0) {
        document.getElementById("chartSection").style.display = "none";
        return;
    }

    const chartSection = document.getElementById("chartSection");
    chartSection.style.display = "block";

    const container = document.querySelector('.chart-container');
    container.innerHTML = '';
    container.style.height = 'auto';
    container.style.maxWidth = '100%';
    container.style.overflowY = 'auto';

    let hasAnyData = false;

    visibleCols.forEach((col) => {
        const statusCount = {};
        logs.forEach(log => {
            const val = log[col.id];
            if (val && val.trim() !== '') {
                statusCount[val] = (statusCount[val] || 0) + 1;
            }
        });

        const labels = [];
        const data = [];
        const statusKeys = [];
        for (let key in statusCount) {
            labels.push(t.statuses[key] || key);
            data.push(statusCount[key]);
            statusKeys.push(key);
        }

        if (data.length === 0) return;
        hasAnyData = true;

        const wrapper = document.createElement('div');
        wrapper.className = 'chart-wrapper';
        wrapper.style.cssText = `
            margin-bottom: 30px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            page-break-inside: avoid;
        `;

        const title = document.createElement('h4');
        title.style.cssText = `
            text-align: center;
            color: #1e293b;
            margin-bottom: 10px;
            font-size: 16px;
            font-weight: 600;
        `;
        title.textContent = col.name;
        wrapper.appendChild(title);

        const canvasWrapper = document.createElement('div');
        canvasWrapper.style.cssText = `
            position: relative;
            height: 300px;
            max-width: 500px;
            margin: 0 auto;
        `;
        const canvas = document.createElement('canvas');
        canvas.id = `chart_${col.id}`;
        canvasWrapper.appendChild(canvas);
        wrapper.appendChild(canvasWrapper);
        container.appendChild(wrapper);

        const ctx = canvas.getContext('2d');
        
        // استخدام الألوان المخزنة
        const colors = statusKeys.map(key => getStatusColor(key));
        
        const total = data.reduce((a, b) => a + b, 0);

        const newChart = new Chart(ctx, {
            type: "pie",
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 3,
                    borderColor: "#fff"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "right",
                        labels: {
                            font: { size: 12, weight: "bold" },
                            padding: 12,
                            usePointStyle: true,
                            pointStyle: "circle",
                            generateLabels: function(chart) {
                                return chart.data.labels.map((label, i) => {
                                    const val = chart.data.datasets[0].data[i];
                                    const pct = ((val / total) * 100).toFixed(1);
                                    return {
                                        text: `${label} (${pct}%)`,
                                        fillStyle: chart.data.datasets[0].backgroundColor[i],
                                        strokeStyle: chart.data.datasets[0].backgroundColor[i],
                                        pointStyle: "circle",
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const val = context.parsed;
                                const pct = ((val / total) * 100).toFixed(1);
                                return `${context.label}: ${val} (${pct}%)`;
                            }
                        }
                    },
                    datalabels: {
                        display: function(context) {
                            const val = context.dataset.data[context.dataIndex];
                            return val > 0 && val / total > 0.05;
                        },
                        color: '#fff',
                        font: { weight: 'bold', size: 13 },
                        formatter: function(val) { return ((val / total) * 100).toFixed(1) + '%'; },
                        anchor: 'center',
                        align: 'center',
                        backgroundColor: function(context) {
                            return context.dataset.backgroundColor[context.dataIndex] + 'CC';
                        },
                        borderRadius: 4,
                        padding: { top: 4, bottom: 4, left: 6, right: 6 }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
        chartInstances.push(newChart);
    });

    if (!hasAnyData) {
        chartSection.style.display = "none";
        container.innerHTML = `<p style="text-align:center;color:#94a3b8;padding:20px;">${t.noChartData}</p>`;
    }
}

// ============= Print All =============
function printAll() {
    const lang = document.getElementById("language").value;
    const t = translations[lang];

    if (logs.length === 0) {
        alert(t.noData);
        return;
    }

    const visibleCols = getVisibleColumns();
    if (visibleCols.length === 0) {
        alert("No visible columns to print!");
        return;
    }

    const printHeaders = document.getElementById("printTableHeaders");
    let hdr = `<tr><th>Date</th>`;
    visibleCols.forEach(col => hdr += `<th>${col.name}</th>`);
    hdr += `</tr>`;
    printHeaders.innerHTML = hdr;

    const body = document.getElementById("printTableBody");
    body.innerHTML = "";
    const sorted = [...logs].reverse();
    sorted.forEach(log => {
        let row = `<tr><td>${log.date}</td>`;
        visibleCols.forEach(col => {
            const val = log[col.id] || '';
            row += `<td>${t.statuses[val] || val || '—'}</td>`;
        });
        row += `</tr>`;
        body.innerHTML += row;
    });

    document.getElementById("printTitle").textContent = customTitles.printTable;
    document.getElementById("printChartTitle").textContent = customTitles.printChart;
    const now = new Date().toLocaleString();
    document.getElementById("printDate").textContent = now;
    document.getElementById("printDate2").textContent = now;

    const printArea = document.getElementById("printArea");
    printArea.style.display = "block";

    const printWrapper = document.querySelector('.print-chart-wrapper');
    if (printWrapper) {
        printWrapper.innerHTML = '';
        printWrapper.style.display = 'flex';
        printWrapper.style.flexWrap = 'wrap';
        printWrapper.style.justifyContent = 'center';
        printWrapper.style.gap = '30px';
    }

    let hasChartData = false;

    visibleCols.forEach((col) => {
        const statusCount = {};
        logs.forEach(log => {
            const val = log[col.id];
            if (val && val.trim() !== '') {
                statusCount[val] = (statusCount[val] || 0) + 1;
            }
        });

        const labels = [];
        const data = [];
        const statusKeys = [];
        for (let key in statusCount) {
            labels.push(t.statuses[key] || key);
            data.push(statusCount[key]);
            statusKeys.push(key);
        }

        if (data.length === 0) return;
        hasChartData = true;

        const card = document.createElement('div');
        card.style.cssText = `
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
            page-break-inside: avoid;
        `;

        const title = document.createElement('h4');
        title.textContent = col.name;
        title.style.cssText = 'margin-bottom: 10px; color: #1e293b;';
        card.appendChild(title);

        const canvasWrapper = document.createElement('div');
        canvasWrapper.style.cssText = 'position: relative; height: 280px; width: 100%;';
        const canvas = document.createElement('canvas');
        canvas.id = `print_chart_${col.id}`;
        canvas.style.cssText = 'width: 100% !important; height: 100% !important;';
        canvasWrapper.appendChild(canvas);
        card.appendChild(canvasWrapper);
        printWrapper.appendChild(card);

        const renderChart = () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const ctx = canvas.getContext('2d');
                    const total = data.reduce((a, b) => a + b, 0);
                    
                    const colors = statusKeys.map(key => getStatusColor(key));

                    const chart = new Chart(ctx, {
                        type: "pie",
                        data: {
                            labels: labels,
                            datasets: [{
                                data: data,
                                backgroundColor: colors,
                                borderWidth: 2,
                                borderColor: "#fff"
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: "bottom",
                                    labels: {
                                        font: { size: 11, weight: "bold" },
                                        padding: 8,
                                        usePointStyle: true,
                                        pointStyle: "circle",
                                        generateLabels: function(chart) {
                                            return chart.data.labels.map((label, i) => {
                                                const val = chart.data.datasets[0].data[i];
                                                const pct = ((val / total) * 100).toFixed(1);
                                                return {
                                                    text: `${label} (${pct}%)`,
                                                    fillStyle: chart.data.datasets[0].backgroundColor[i],
                                                    strokeStyle: chart.data.datasets[0].backgroundColor[i],
                                                    pointStyle: "circle",
                                                    hidden: false,
                                                    index: i
                                                };
                                            });
                                        }
                                    }
                                },
                                datalabels: {
                                    display: function(context) {
                                        const val = context.dataset.data[context.dataIndex];
                                        return val > 0 && val / total > 0.05;
                                    },
                                    color: '#fff',
                                    font: { weight: 'bold', size: 11 },
                                    formatter: function(val) { return ((val / total) * 100).toFixed(1) + '%'; },
                                    anchor: 'center',
                                    align: 'center',
                                    backgroundColor: function(context) {
                                        return context.dataset.backgroundColor[context.dataIndex] + 'CC';
                                    },
                                    borderRadius: 3,
                                    padding: { top: 2, bottom: 2, left: 4, right: 4 }
                                }
                            }
                        },
                        plugins: [ChartDataLabels]
                    });
                    printChartInstances.push(chart);
                    resolve();
                }, 300);
            });
        };

        renderChart();
    });

    if (!hasChartData) {
        if (printWrapper) {
            printWrapper.innerHTML = `<p style="text-align:center;color:#94a3b8;padding:40px;">${t.noChartData}</p>`;
        }
    }

    setTimeout(() => {
        window.print();
    }, 1500);
}

// Handle after print
window.addEventListener('afterprint', function() {
    document.getElementById("printArea").style.display = "none";
    if (printChartInstances && printChartInstances.length) {
        printChartInstances.forEach(c => c.destroy());
        printChartInstances = [];
    }
    const printWrapper = document.querySelector('.print-chart-wrapper');
    if (printWrapper) {
        printWrapper.innerHTML = '';
    }
});

// ============= Title Management =============
function updateMainTitle() {
    const input = document.getElementById("mainTitle"); }