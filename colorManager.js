// ============= colorManager.js =============
// مسؤول عن إدارة الألوان والحالات المخصصة

// ============= Data & State =============
let customStatuses = [];
let statusColors = {};
let customTitles = {
    main: "📞 Father's visits",
    printTable: "Visiting - Records",
    printChart: "Visiting - Statistics"
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
function loadColorData() {
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
    const savedTitles = localStorage.getItem("customTitles");
    if (savedTitles) { 
        try { 
            customTitles = JSON.parse(savedTitles); 
        } catch (e) {} 
    }
}

function saveColorData() {
    localStorage.setItem("customStatuses", JSON.stringify(customStatuses));
    localStorage.setItem("statusColors", JSON.stringify(statusColors));
    localStorage.setItem("customTitles", JSON.stringify(customTitles));
}

// ============= Get All Status List =============
function getAllStatusList() {
    const lang = document.getElementById("language").value;
    const t = translations[lang];
    const set = new Set();
    if (t && t.statuses) {
        for (let key in t.statuses) set.add(t.statuses[key]);
    }
    customStatuses.forEach(s => set.add(s));
    return Array.from(set);
}

// ============= Custom Status & Colors =============
function addCustomStatus(status) {
    if (!status) return;
    const all = getAllStatusList();
    if (!all.includes(status)) {
        customStatuses.push(status);
        const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        statusColors[status] = randomColor;
        saveColorData();
        if (typeof renderStatusInputs === 'function') renderStatusInputs();
        if (typeof renderColorManagement === 'function') renderColorManagement();
        if (typeof renderTable === 'function') renderTable();
        if (typeof generateChartInternal === 'function') generateChartInternal();
    }
}

function updateColorInternal(statusKey, color) {
    statusColors[statusKey] = color;
    saveColorData();
    if (typeof renderTable === 'function') renderTable();
    if (typeof generateChartInternal === 'function') generateChartInternal();
}

function addCustomColorInternal() {
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
    saveColorData();
    if (typeof renderStatusInputs === 'function') renderStatusInputs();
    if (typeof renderColorManagement === 'function') renderColorManagement();
    if (typeof renderTable === 'function') renderTable();
    if (typeof generateChartInternal === 'function') generateChartInternal();
}

function removeCustomStatusInternal(status) {
    const lang = document.getElementById("language").value;
    const t = translations[lang];
    const isUsed = logs.some(log => {
        for (let key in log) if (log[key] === status) return true;
        return false;
    });
    if (isUsed) { 
        alert(`Cannot remove "${status}" because it is used in existing records!`); 
        return; 
    }
    if (confirm(`Are you sure you want to remove "${status}"?`)) {
        customStatuses = customStatuses.filter(s => s !== status);
        delete statusColors[status];
        saveColorData();
        if (typeof renderStatusInputs === 'function') renderStatusInputs();
        if (typeof renderColorManagement === 'function') renderColorManagement();
        if (typeof renderTable === 'function') renderTable();
        if (typeof generateChartInternal === 'function') generateChartInternal();
    }
}

function addCustomStatusFromInputInternal() {
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
    saveColorData();
    if (typeof renderStatusInputs === 'function') renderStatusInputs();
    if (typeof renderColorManagement === 'function') renderColorManagement();
    if (typeof renderTable === 'function') renderTable();
    if (typeof generateChartInternal === 'function') generateChartInternal();
}

// ============= Render Color Management =============
function renderColorManagement() {
    const lang = document.getElementById("language").value;
    const t = translations[lang];
    const container = document.getElementById("customColorsContainer");
    if (!container) return;
    container.innerHTML = "";
    const defaultKeys = t && t.statuses ? Object.keys(t.statuses) : [];
    const defaultContainer = document.getElementById("colorManagement");
    if (!defaultContainer) return;
    defaultContainer.innerHTML = "";
    defaultKeys.forEach(key => {
        const div = document.createElement("div");
        div.className = "color-item";
        const color = getStatusColor(key);
        div.innerHTML = `
            <span>${t.statuses[key]}</span>
            <input type="color" value="${color}" onchange="window.updateColor('${key}', this.value)" />
        `;
        defaultContainer.appendChild(div);
    });
    customStatuses.forEach(status => {
        const div = document.createElement("div");
        div.className = "color-item";
        const color = getStatusColor(status);
        div.innerHTML = `
            <span>${status}</span>
            <input type="color" value="${color}" onchange="window.updateColor('${status}', this.value)" />
            <button class="remove-color" onclick="window.removeCustomStatus('${status}')">${t.removeColor || 'Remove'}</button>
        `;
        container.appendChild(div);
    });
}

// ============= Title Management =============
function updateMainTitleInternal() {
    const input = document.getElementById("mainTitle");
    if (!input) return;
    customTitles.main = input.value;
    saveColorData();
    document.getElementById("title").innerText = input.value;
}

function editMainTitleInternal() {
    const input = document.getElementById("mainTitle");
    if (input) {
        input.focus();
        input.select();
    }
}

function updatePrintTitlesInternal() {
    const tableTitle = document.getElementById("printTitleInput");
    const chartTitle = document.getElementById("printChartTitleInput");
    if (tableTitle) customTitles.printTable = tableTitle.value;
    if (chartTitle) customTitles.printChart = chartTitle.value;
    saveColorData();
}

function loadPrintTitles() {
    const tableTitle = document.getElementById("printTitleInput");
    const chartTitle = document.getElementById("printChartTitleInput");
    if (tableTitle) tableTitle.value = customTitles.printTable || "Visiting - Records";
    if (chartTitle) chartTitle.value = customTitles.printChart || "Visiting - Statistics";
    const mainTitle = document.getElementById("mainTitle");
    if (mainTitle) mainTitle.value = customTitles.main || "📞 Father's visits";
}