// ============= Data & Translations =============
let logs = [];
let chart = null;
let printChart = null;
let customStatuses = [];
let statusColors = {};
let customTitles = {
    main: "📞Father's visits",
    printTable: "Visiting - Records",
    printChart: "Visiting - Statistics"
};

// Register the datalabels plugin globally
Chart.register(ChartDataLabels);

const translations = {
    en: {
        title: "📞Father's visits",
        add: "➕ Add",
        date: "📅 Date",
        status: "📌 Status",
        customStatus: "✏️ Custom Status",
        colorTitle: "🎨 Status Colors",
        addColor: "➕ Add Custom Color",
        stats: "📊 Statistics",
        print: "🖨️ Print",
        clear: "🗑️ Clear All",
        records: "📋 Records",
        chartTitle: "📊 Statistics",
        actions: "⚙️ Actions",
        edit: "✏️ Edit",
        delete: "🗑️ Delete",
        empty: "📭 No records yet",
        confirmDelete: "Are you sure you want to delete this record?",
        confirmClear: "⚠️ Are you sure you want to clear all records?",
        noData: "❌ No data to show statistics!",
        noChartData: "❌ Not enough data to display chart!",
        printTitle: "Visiting- Records",
        printChartTitle: "Visiting- Statistics",
        enterCustomStatus: "Enter custom status...",
        removeColor: "Remove",
        titlesTitle: "📝 Custom Titles for Print",
        printTableLabel: "📄 Table Title:",
        printChartLabel: "📊 Statistics Title:",
        editTitle: "✏️ Edit Title",
        statuses: {
            father_cancelled: "Father Cancelled",
            father_verified: "Father Verified",
            mother_cancelled: "Mother Cancelled",
            medical: "Medical Certificate",
            provable: "Provable"
        }
    },
    hu: {
        title: "📞 Apa látogatásai",
        add: "➕ Hozzáadás",
        date: "📅 Dátum",
        status: "📌 Státusz",
        customStatus: "✏️ Egyedi státusz",
        colorTitle: "🎨 Státusz színek",
        addColor: "➕ Egyedi szín hozzáadása",
        stats: "📊 Statisztika",
        print: "🖨️ Nyomtatás",
        clear: "🗑️ Minden törlése",
        records: "📋 Rekordok",
        chartTitle: "📊 Statisztika",
        actions: "⚙️ Műveletek",
        edit: "✏️ Szerkesztés",
        delete: "🗑️ Törlés",
        empty: "📭 Még nincsenek rekordok",
        confirmDelete: "Biztosan törölni szeretné ezt a rekordot?",
        confirmClear: "⚠️ Biztosan törölni szeretné az összes rekordot?",
        noData: "❌ Nincs adat a statisztikákhoz!",
        noChartData: "❌ Nincs elég adat a diagram megjelenítéséhez!",
        printTitle: "Kapcsolattartási Napló - Rekordok",
        printChartTitle: "Kapcsolattartási Napló - Statisztika",
        enterCustomStatus: "Adjon meg egyedi státuszt...",
        removeColor: "Eltávolítás",
        titlesTitle: "📝 Egyedi címek nyomtatáshoz",
        printTableLabel: "📄 Táblázat címe:",
        printChartLabel: "📊 Statisztika címe:",
        editTitle: "✏️ Cím szerkesztése",
        statuses: {
            father_cancelled: "Apa által lemondott",
            father_verified: "Apa által igazolt",
            mother_cancelled: "Anya által lemondott",
            medical: "Orvosi igazolás",
            provable: "Bizonyítható"
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

// ============= Load Custom Titles =============
function loadCustomTitles() {
    const saved = localStorage.getItem("customTitles");
    if (saved) {
        try {
            customTitles = JSON.parse(saved);
        } catch (e) {
            customTitles = {
                main: "📞Father's visits",
                printTable: "Visiting - Records",
                printChart: "Visiting - Statistics"
            };
        }
    }
}

function saveCustomTitles() {
    localStorage.setItem("customTitles", JSON.stringify(customTitles));
}

// ============= Update Main Title =============
function updateMainTitle() {
    const input = document.getElementById("mainTitle");
    if (!input) return;
    
    const newTitle = input.value.trim() || "📞Father's visits";
    customTitles.main = newTitle;
    saveCustomTitles();
    
    document.getElementById("title").innerText = newTitle;
}

function editMainTitle() {
    const input = document.getElementById("mainTitle");
    if (!input) return;
    input.focus();
    input.select();
}

// ============= Update Print Titles =============
function updatePrintTitles() {
    const tableInput = document.getElementById("printTitleInput");
    const chartInput = document.getElementById("printChartTitleInput");
    
    if (tableInput) {
        customTitles.printTable = tableInput.value.trim() || "Visiting - Records";
    }
    
    if (chartInput) {
        customTitles.printChart = chartInput.value.trim() || "Visiting - Statistics";
    }
    
    saveCustomTitles();
    
    const printTitle = document.getElementById("printTitle");
    const printChartTitle = document.getElementById("printChartTitle");
    
    if (printTitle) printTitle.textContent = customTitles.printTable;
    if (printChartTitle) printChartTitle.textContent = customTitles.printChart;
}

// ============= Load Titles into UI =============
function loadTitlesIntoUI() {
    const mainInput = document.getElementById("mainTitle");
    const mainTitleDisplay = document.getElementById("title");
    
    if (mainInput) mainInput.value = customTitles.main;
    if (mainTitleDisplay) mainTitleDisplay.innerText = customTitles.main;
    
    const tableInput = document.getElementById("printTitleInput");
    const chartInput = document.getElementById("printChartTitleInput");
    const printTitle = document.getElementById("printTitle");
    const printChartTitle = document.getElementById("printChartTitle");
    
    if (tableInput) tableInput.value = customTitles.printTable;
    if (chartInput) chartInput.value = customTitles.printChart;
    if (printTitle) printTitle.textContent = customTitles.printTable;
    if (printChartTitle) printChartTitle.textContent = customTitles.printChart;
}

// ============= Load Data =============
function loadData() {
    const saved = localStorage.getItem("contactLogs");
    if (saved) {
        try {
            logs = JSON.parse(saved);
        } catch (e) {
            logs = [];
        }
    }
    
    const savedCustom = localStorage.getItem("customStatuses");
    if (savedCustom) {
        try {
            customStatuses = JSON.parse(savedCustom);
        } catch (e) {
            customStatuses = [];
        }
    }
    
    const savedColors = localStorage.getItem("statusColors");
    if (savedColors) {
        try {
            statusColors = JSON.parse(savedColors);
        } catch (e) {
            statusColors = { ...defaultColors };
        }
    } else {
        statusColors = { ...defaultColors };
    }
}

function saveData() {
    localStorage.setItem("contactLogs", JSON.stringify(logs));
    localStorage.setItem("customStatuses", JSON.stringify(customStatuses));
    localStorage.setItem("statusColors", JSON.stringify(statusColors));
    updateRecordCount();
}

// ============= Update Record Count =============
function updateRecordCount() {
    const count = document.getElementById("recordCount");
    if (count) {
        count.textContent = logs.length;
    }
}

// ============= Change Language =============
function changeLanguage() {
    const lang = document.getElementById("language").value;
    const t = translations[lang];

    document.getElementById("title").innerText = t.title;
    document.getElementById("addBtn").innerText = t.add;
    document.getElementById("dateLabel").innerText = t.date;
    document.getElementById("statusLabel").innerText = t.status;
    document.getElementById("customStatusLabel").innerText = t.customStatus;
    document.getElementById("colorTitle").innerText = t.colorTitle;
    document.getElementById("statsBtn").innerText = t.stats;
    document.getElementById("printBtn").innerText = t.print;
    document.getElementById("clearBtn").innerText = t.clear;
    document.getElementById("recordsTitle").innerText = t.records;
    document.getElementById("chartTitle").innerText = t.chartTitle;
    document.getElementById("dateHeader").innerText = t.date;
    document.getElementById("statusHeader").innerText = t.status;
    document.getElementById("actionsHeader").innerText = t.actions;
    document.getElementById("customStatus").placeholder = t.enterCustomStatus;
    
    // Titles section
    const titlesTitle = document.getElementById("titlesTitle");
    const printTableLabel = document.getElementById("printTitleLabel");
    const printChartLabel = document.getElementById("printChartTitleLabel");
    const editBtn = document.querySelector('.title-control .btn-small');
    
    if (titlesTitle) titlesTitle.textContent = t.titlesTitle;
    if (printTableLabel) printTableLabel.textContent = t.printTableLabel;
    if (printChartLabel) printChartLabel.textContent = t.printChartLabel;
    if (editBtn) editBtn.textContent = t.editTitle;

    updateStatusDropdown();
    renderTable();
    renderColorManagement();
    if (chart) generateChart();
}

// ============= Update Status Dropdown =============
function updateStatusDropdown() {
    const lang = document.getElementById("language").value;
    const t = translations[lang];
    const statusSelect = document.getElementById("status");
    
    statusSelect.innerHTML = "";
    
    for (let key in t.statuses) {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = t.statuses[key];
        statusSelect.appendChild(option);
    }
    
    customStatuses.forEach(status => {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status;
        statusSelect.appendChild(option);
    });
}

// ============= Render Color Management =============
function renderColorManagement() {
    const lang = document.getElementById("language").value;
    const t = translations[lang];
    const container = document.getElementById("customColorsContainer");
    if (!container) return;
    
    container.innerHTML = "";
    
    const defaultKeys = Object.keys(t.statuses);
    const customKeys = customStatuses;
    
    const defaultContainer = document.getElementById("colorManagement");
    if (!defaultContainer) return;
    
    defaultContainer.innerHTML = "";
    
    defaultKeys.forEach(key => {
        const div = document.createElement("div");
        div.className = "color-item";
        const color = statusColors[key] || defaultColors[key] || "#94a3b8";
        div.innerHTML = `
            <span>${t.statuses[key]}</span>
            <input type="color" value="${color}" 
                   onchange="updateColor('${key}', this.value)" />
        `;
        defaultContainer.appendChild(div);
    });
    
    customKeys.forEach(status => {
        const div = document.createElement("div");
        div.className = "color-item";
        const color = statusColors[status] || "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        div.innerHTML = `
            <span>${status}</span>
            <input type="color" value="${color}" 
                   onchange="updateColor('${status}', this.value)" />
            <button class="remove-color" onclick="removeCustomStatus('${status}')">${t.removeColor}</button>
        `;
        container.appendChild(div);
    });
}

// ============= Update Color =============
function updateColor(statusKey, color) {
    statusColors[statusKey] = color;
    saveData();
    if (chart) generateChart();
}

// ============= Add Custom Color =============
function addCustomColor() {
    const lang = document.getElementById("language").value;
    const t = translations[lang];
    
    const statusInput = document.getElementById("customStatus");
    if (!statusInput) return;
    
    const status = statusInput.value.trim();
    
    if (!status) {
        alert("Please enter a custom status name!");
        return;
    }
    
    const allStatuses = Object.keys(t.statuses).concat(customStatuses);
    if (allStatuses.includes(status)) {
        alert("This status already exists!");
        return;
    }
    
    customStatuses.push(status);
    
    const randomColor = "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    statusColors[status] = randomColor;
    
    statusInput.value = "";
    saveData();
    updateStatusDropdown();
    renderColorManagement();
    renderTable();
    if (chart) generateChart();
}

// ============= Remove Custom Status =============
function removeCustomStatus(status) {
    const lang = document.getElementById("language").value;
    const t = translations[lang];
    
    const isUsed = logs.some(log => log.status === status);
    if (isUsed) {
        alert(`Cannot remove "${status}" because it is used in existing records!`);
        return;
    }
    
    if (confirm(`Are you sure you want to remove "${status}"?`)) {
        customStatuses = customStatuses.filter(s => s !== status);
        delete statusColors[status];
        saveData();
        updateStatusDropdown();
        renderColorManagement();
        renderTable();
        if (chart) generateChart();
    }
}

// ============= Add Entry =============
function addEntry() {
    const date = document.getElementById("date").value;
    const statusSelect = document.getElementById("status");
    const status = statusSelect.value;
    const customStatusInput = document.getElementById("customStatus");
    const customStatus = customStatusInput ? customStatusInput.value.trim() : "";

    if (!date) {
        const lang = document.getElementById("language").value;
        alert(translations[lang].noData || "Please select a date!");
        return;
    }

    if (customStatus) {
        const lang = document.getElementById("language").value;
        const t = translations[lang];
        const allStatuses = Object.keys(t.statuses).concat(customStatuses);
        
        if (!allStatuses.includes(customStatus)) {
            customStatuses.push(customStatus);
            const randomColor = "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
            statusColors[customStatus] = randomColor;
            saveData();
            updateStatusDropdown();
            renderColorManagement();
        }
        
        logs.push({ 
            id: Date.now(),
            date, 
            status: customStatus
        });
        if (customStatusInput) customStatusInput.value = "";
    } else {
        logs.push({ 
            id: Date.now(),
            date, 
            status
        });
    }
    
    saveData();
    renderTable();
    
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("date").value = today;
    
    if (chart) generateChart();
}

// ============= Delete Entry =============
function deleteEntry(id) {
    const lang = document.getElementById("language").value;
    if (confirm(translations[lang].confirmDelete)) {
        logs = logs.filter(log => log.id !== id);
        saveData();
        renderTable();
        if (chart) generateChart();
    }
}

// ============= Edit Entry =============
function editEntry(id) {
    const log = logs.find(log => log.id === id);
    if (!log) return;

    document.getElementById("date").value = log.date;
    
    const statusSelect = document.getElementById("status");
    let found = false;
    for (let i = 0; i < statusSelect.options.length; i++) {
        if (statusSelect.options[i].value === log.status) {
            statusSelect.value = log.status;
            found = true;
            break;
        }
    }
    
    if (!found) {
        const lang = document.getElementById("language").value;
        const t = translations[lang];
        const allStatuses = Object.keys(t.statuses).concat(customStatuses);
        
        if (!allStatuses.includes(log.status)) {
            customStatuses.push(log.status);
            const randomColor = "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
            statusColors[log.status] = randomColor;
            saveData();
            updateStatusDropdown();
            renderColorManagement();
        }
        
        statusSelect.value = log.status;
    }

    logs = logs.filter(log => log.id !== id);
    saveData();
    renderTable();
    if (chart) generateChart();

    document.getElementById("addBtn").focus();
}

// ============= Render Table =============
function renderTable() {
    const lang = document.getElementById("language").value;
    const t = translations[lang];
    const table = document.getElementById("logTable");

    if (!table) return;

    if (logs.length === 0) {
        table.innerHTML = `<tr><td colspan="3" class="empty-msg">${t.empty}</td></tr>`;
        updateRecordCount();
        return;
    }

    table.innerHTML = "";
    const sorted = [...logs].reverse();
    sorted.forEach(log => {
        const row = document.createElement("tr");
        const color = statusColors[log.status] || "#94a3b8";
        const displayName = t.statuses[log.status] || log.status;
        row.innerHTML = `
            <td>${log.date}</td>
            <td>
                <span class="status-badge" style="background-color: ${color}">
                    ${displayName}
                </span>
            </td>
            <td>
                <button class="action-btn edit" onclick="editEntry(${log.id})">✏️</button>
                <button class="action-btn delete" onclick="deleteEntry(${log.id})">🗑️</button>
            </td>
        `;
        table.appendChild(row);
    });
    
    updateRecordCount();
}

// ============= Clear All =============
function clearAll() {
    const lang = document.getElementById("language").value;
    if (confirm(translations[lang].confirmClear)) {
        logs = [];
        saveData();
        renderTable();
        if (chart) {
            chart.destroy();
            chart = null;
            document.getElementById("chartSection").style.display = "none";
        }
    }
}

// ============= Generate Chart =============
function generateChart() {
    const lang = document.getElementById("language").value;
    const t = translations[lang];

    if (logs.length === 0) {
        alert(t.noData);
        return;
    }

    const categories = getCategoryData();
    const { labels, data } = processCategoryData(categories, t);

    if (data.length === 0) {
        alert(t.noChartData);
        return;
    }

    const chartSection = document.getElementById("chartSection");
    if (chartSection) {
        chartSection.style.display = "block";
    }

    const ctx = document.getElementById("myChart");
    if (!ctx) return;
    
    const context = ctx.getContext("2d");

    if (chart) {
        chart.destroy();
        chart = null;
    }

    const colors = data.map((_, index) => {
        const keys = Object.keys(categories).filter(k => categories[k] > 0);
        return statusColors[keys[index]] || getColors(data.length)[index];
    });

    const total = data.reduce((a, b) => a + b, 0);

    chart = new Chart(context, {
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
            layout: {
                padding: {
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10
                }
            },
            plugins: {
                legend: {
                    position: "right",
                    align: "center",
                    labels: {
                        font: { 
                            size: 13, 
                            weight: "bold" 
                        },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: "circle",
                        generateLabels: function(chart) {
                            const data = chart.data;
                            return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i];
                                const percentage = ((value / total) * 100).toFixed(1);
                                return {
                                    text: `${label} (${percentage}%)`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    strokeStyle: data.datasets[0].backgroundColor[i],
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
                            const value = context.parsed;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${value} (${percentage}%)`;
                        }
                    }
                },
                datalabels: {
                    display: function(context) {
                        const value = context.dataset.data[context.dataIndex];
                        return value > 0 && value / total > 0.05; // Only show if > 5%
                    },
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 14
                    },
                    formatter: function(value) {
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${percentage}%`;
                    },
                    anchor: 'center',
                    align: 'center',
                    offset: 0,
                    backgroundColor: function(context) {
                        const color = context.dataset.backgroundColor[context.dataIndex];
                        return color + 'CC';
                    },
                    borderRadius: 4,
                    padding: {
                        top: 4,
                        bottom: 4,
                        left: 6,
                        right: 6
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// ============= Helper Functions =============
function getCategoryData() {
    const categories = {
        father_cancelled: 0,
        father_verified: 0,
        mother_cancelled: 0,
        medical: 0,
        provable: 0
    };

    customStatuses.forEach(status => {
        categories[status] = 0;
    });

    logs.forEach(log => {
        if (categories[log.status] !== undefined) {
            categories[log.status]++;
        } else {
            categories[log.status] = 1;
        }
    });
    
    return categories;
}

function processCategoryData(categories, t) {
    const labels = [];
    const data = [];
    
    for (let key in categories) {
        if (categories[key] > 0) {
            const displayName = t.statuses[key] || key;
            labels.push(displayName);
            data.push(categories[key]);
        }
    }
    
    return { labels, data };
}

function getColors(count) {
    const colors = ["#ef4444", "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16"];
    return colors.slice(0, count);
}

// ============= Print All =============
function printAll() {
    const lang = document.getElementById("language").value;
    const t = translations[lang];

    if (logs.length === 0) {
        alert(t.noData);
        return;
    }

    const printTableBody = document.getElementById("printTableBody");
    if (printTableBody) {
        printTableBody.innerHTML = "";
        
        const sorted = [...logs].reverse();
        sorted.forEach(log => {
            const row = document.createElement("tr");
            const displayName = t.statuses[log.status] || log.status;
            row.innerHTML = `
                <td>${log.date}</td>
                <td>${displayName}</td>
            `;
            printTableBody.appendChild(row);
        });
    }

    const printTitle = document.getElementById("printTitle");
    const printChartTitle = document.getElementById("printChartTitle");
    const printDate = document.getElementById("printDate");
    const printDate2 = document.getElementById("printDate2");
    
    if (printTitle) printTitle.textContent = customTitles.printTable;
    if (printChartTitle) printChartTitle.textContent = customTitles.printChart;
    
    const now = new Date().toLocaleString();
    if (printDate) printDate.textContent = now;
    if (printDate2) printDate2.textContent = now;

    const categories = getCategoryData();
    const { labels, data } = processCategoryData(categories, t);

    if (data.length === 0) {
        alert(t.noChartData);
        return;
    }

    const printArea = document.getElementById("printArea");
    if (printArea) {
        printArea.style.display = "block";
        printArea.offsetHeight;
    }

    setTimeout(() => {
        const printCanvas = document.getElementById("printChart");
        if (!printCanvas) return;
        
        const printCtx = printCanvas.getContext("2d");
        
        if (printChart) {
            printChart.destroy();
            printChart = null;
        }
        
        const container = printCanvas.parentElement;
        if (container) {
            printCanvas.width = container.clientWidth || 500;
            printCanvas.height = container.clientHeight || 380;
        }
        
        const colors = data.map((_, index) => {
            const keys = Object.keys(categories).filter(k => categories[k] > 0);
            return statusColors[keys[index]] || getColors(data.length)[index];
        });
        
        const total = data.reduce((a, b) => a + b, 0);
        
        printChart = new Chart(printCtx, {
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
                        position: "right",
                        labels: {
                            font: { size: 14, weight: "bold" },
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: "circle",
                            generateLabels: function(chart) {
                                const data = chart.data;
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return {
                                        text: `${label} (${percentage}%)`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        strokeStyle: data.datasets[0].backgroundColor[i],
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
                            const value = context.dataset.data[context.dataIndex];
                            return value > 0 && value / total > 0.05;
                        },
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: 14
                        },
                        formatter: function(value) {
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${percentage}%`;
                        },
                        anchor: 'center',
                        align: 'center',
                        backgroundColor: function(context) {
                            const color = context.dataset.backgroundColor[context.dataIndex];
                            return color + 'CC';
                        },
                        borderRadius: 4,
                        padding: {
                            top: 4,
                            bottom: 4,
                            left: 6,
                            right: 6
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });

        setTimeout(() => {
            window.print();
        }, 800);
    }, 300);
}

// Handle print dialog close
window.addEventListener('afterprint', function() {
    const printArea = document.getElementById("printArea");
    if (printArea) {
        printArea.style.display = "none";
    }
    
    if (printChart) {
        printChart.destroy();
        printChart = null;
    }
});

// ============= Initialize Page =============
window.onload = function() {
    loadCustomTitles();
    loadTitlesIntoUI();
    loadData();
    
    const today = new Date().toISOString().split("T")[0];
    const dateInput = document.getElementById("date");
    if (dateInput) {
        dateInput.value = today;
    }
    
    const languageSelect = document.getElementById("language");
    if (languageSelect) {
        languageSelect.value = "en";
    }
    
    changeLanguage();
    updateRecordCount();
    
    // Event listeners for title inputs
    const mainInput = document.getElementById("mainTitle");
    const tableInput = document.getElementById("printTitleInput");
    const chartInput = document.getElementById("printChartTitleInput");
    
    if (mainInput) {
        mainInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                updateMainTitle();
                this.blur();
            }
        });
    }
    
    if (tableInput) {
        tableInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                updatePrintTitles();
                this.blur();
            }
        });
    }
    
    if (chartInput) {
        chartInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                updatePrintTitles();
                this.blur();
            }
        });
    }
};

// Handle window resize
window.addEventListener('resize', function() {
    if (chart) {
        chart.resize();
    }
});