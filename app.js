// ============= app.js =============
// هذا الملف يربط جميع الدوال في النطاق العام (window)

console.log('app.js loaded');

// ===== تعريف الدوال في النطاق العام =====
// هذه الدوال ستستدعي الدوال الداخلية من الملفات الأخرى

window.addColumn = function() {
    console.log('addColumn called');
    if (typeof addColumnInternal === 'function') {
        addColumnInternal();
    } else {
        console.error('addColumnInternal not found');
        alert('Error: addColumn function not properly loaded');
    }
};

window.removeColumn = function(colId) {
    console.log('removeColumn called', colId);
    if (typeof removeColumnInternal === 'function') {
        removeColumnInternal(colId);
    }
};

window.toggleColumnVisibility = function(colId) {
    console.log('toggleColumnVisibility called', colId);
    if (typeof toggleColumnVisibilityInternal === 'function') {
        toggleColumnVisibilityInternal(colId);
    }
};

window.updateColumnName = function(colId, newName) {
    console.log('updateColumnName called', colId, newName);
    if (typeof updateColumnNameInternal === 'function') {
        updateColumnNameInternal(colId, newName);
    }
};

window.addEntry = function() {
    console.log('addEntry called');
    if (typeof addEntryInternal === 'function') {
        addEntryInternal();
    }
};

window.deleteEntry = function(id) {
    console.log('deleteEntry called', id);
    if (typeof deleteEntryInternal === 'function') {
        deleteEntryInternal(id);
    }
};

window.editEntry = function(id) {
    console.log('editEntry called', id);
    if (typeof editEntryInternal === 'function') {
        editEntryInternal(id);
    }
};

window.clearAll = function() {
    console.log('clearAll called');
    if (typeof clearAllInternal === 'function') {
        clearAllInternal();
    }
};

window.generateChart = function() {
    console.log('generateChart called from window');
    if (typeof generateChartInternal === 'function') {
        generateChartInternal();
    } else {
        console.error('generateChartInternal not found');
        alert('Error: generateChart function not properly loaded');
    }
};

window.printAll = function() {
    console.log('printAll called from window');
    if (typeof printAllInternal === 'function') {
        printAllInternal();
    } else {
        console.error('printAllInternal not found');
        alert('Error: printAll function not properly loaded');
    }
};

window.addCustomStatusFromInput = function() {
    console.log('addCustomStatusFromInput called');
    if (typeof addCustomStatusFromInputInternal === 'function') {
        addCustomStatusFromInputInternal();
    }
};

window.updateColor = function(statusKey, color) {
    console.log('updateColor called', statusKey, color);
    if (typeof updateColorInternal === 'function') {
        updateColorInternal(statusKey, color);
    }
};

window.removeCustomStatus = function(status) {
    console.log('removeCustomStatus called', status);
    if (typeof removeCustomStatusInternal === 'function') {
        removeCustomStatusInternal(status);
    }
};

window.updateMainTitle = function() {
    console.log('updateMainTitle called');
    if (typeof updateMainTitleInternal === 'function') {
        updateMainTitleInternal();
    }
};

window.editMainTitle = function() {
    console.log('editMainTitle called');
    if (typeof editMainTitleInternal === 'function') {
        editMainTitleInternal();
    }
};

window.updatePrintTitles = function() {
    console.log('updatePrintTitles called');
    if (typeof updatePrintTitlesInternal === 'function') {
        updatePrintTitlesInternal();
    }
};

window.changeLanguage = function() {
    console.log('changeLanguage called');
    if (typeof changeLanguageInternal === 'function') {
        changeLanguageInternal();
    }
};

// ===== دوال جديدة للتحكم في عمود التاريخ =====
window.toggleDateColumn = function() {
    console.log('toggleDateColumn called');
    if (typeof toggleDateColumnInternal === 'function') {
        toggleDateColumnInternal();
    }
};

// ===== تهيئة التطبيق =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - initializing app');
    if (typeof initApp === 'function') {
        initApp();
    } else {
        console.error('initApp not found');
    }
});

// تأكد من تعريف الدوال بعد تحميل الصفحة
console.log('Window functions registered:');
console.log('generateChart:', typeof window.generateChart);
console.log('printAll:', typeof window.printAll);
console.log('toggleDateColumn:', typeof window.toggleDateColumn);