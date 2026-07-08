// ============= translations.js =============
// ملف الترجمات المشترك بين جميع الملفات

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
        // لا توجد حالات أساسية - كل شيء مخصص
        statuses: {}
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
        // لا توجد حالات أساسية - كل شيء مخصص
        statuses: {}
    }
};

// تحميل الترجمات في النطاق العام
if (typeof window !== 'undefined') {
    window.translations = translations;
}