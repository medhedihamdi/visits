// ============= chartManager.js =============
// مسؤول عن إدارة الرسوم البيانية والطباعة

// ============= Chart Instances =============
let chartInstances = [];
let printChartInstances = [];

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

function destroyPrintCharts() {
    if (printChartInstances && printChartInstances.length) {
        printChartInstances.forEach(c => c.destroy());
        printChartInstances = [];
    }
}

// ============= Generate Charts =============
function generateChartInternal() {
    console.log('generateChartInternal called');
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
            labels.push(key);
            data.push(statusCount[key]);
            statusKeys.push(key);
        }

        if (data.length === 0) return;
        hasAnyData = true;

        const wrapper = document.createElement('div');
        wrapper.className = 'chart-wrapper';
        wrapper.style.cssText = `
            margin-bottom: 30px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            page-break-inside: avoid;
            display: flex;
            flex-direction: column;
        `;

        const title = document.createElement('h4');
        title.style.cssText = `
            text-align: center;
            color: #1e293b;
            margin-bottom: 15px;
            font-size: 16px;
            font-weight: 600;
        `;
        title.textContent = col.name;
        wrapper.appendChild(title);

        const chartFlexContainer = document.createElement('div');
        chartFlexContainer.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 20px;
            width: 100%;
        `;

        const canvasWrapper = document.createElement('div');
        canvasWrapper.style.cssText = `
            position: relative;
            height: 300px;
            width: 300px;
            flex-shrink: 0;
        `;
        const canvas = document.createElement('canvas');
        canvas.id = `chart_${col.id}`;
        canvasWrapper.appendChild(canvas);
        chartFlexContainer.appendChild(canvasWrapper);

        const legendWrapper = document.createElement('div');
        legendWrapper.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
            min-width: 150px;
            padding: 10px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        `;
        legendWrapper.id = `legend_${col.id}`;

        chartFlexContainer.appendChild(legendWrapper);
        wrapper.appendChild(chartFlexContainer);
        container.appendChild(wrapper);

        const ctx = canvas.getContext('2d');
        
        const colors = statusKeys.map(key => getStatusColor(key));
        const total = data.reduce((a, b) => a + b, 0);

        try {
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
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
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

            const legendContainer = document.getElementById(`legend_${col.id}`);
            if (legendContainer) {
                legendContainer.innerHTML = '<div style="font-weight:600;font-size:14px;color:#475569;margin-bottom:4px;">📊 Legend</div>';
                labels.forEach((label, i) => {
                    const pct = ((data[i] / total) * 100).toFixed(1);
                    const item = document.createElement('div');
                    item.style.cssText = `
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 13px;
                        color: #1e293b;
                    `;
                    item.innerHTML = `
                        <span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:${colors[i]} !important;flex-shrink:0;border:1px solid rgba(0,0,0,0.1);"></span>
                        <span style="flex:1;">${label}</span>
                        <span style="font-weight:600;color:#475569;">${data[i]} (${pct}%)</span>
                    `;
                    legendContainer.appendChild(item);
                });
            }

        } catch (e) {
            console.error('Error creating chart:', e);
        }
    });

    if (!hasAnyData) {
        chartSection.style.display = "none";
        container.innerHTML = `<p style="text-align:center;color:#94a3b8;padding:20px;">${t.noChartData}</p>`;
    }
}

// ============= PRINT ALL - نسخة محسّنة جداً =============
function printAllInternal() {
    console.log('printAllInternal called');
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

    // 1. تجهيز الجدول للطباعة
    preparePrintTable(visibleCols);
    
    // 2. تجهيز العناوين والتواريخ
    preparePrintHeaders();
    
    // 3. إظهار منطقة الطباعة
    const printArea = document.getElementById("printArea");
    printArea.style.display = "block";
    printArea.classList.add('active');

    // 4. تجهيز حاوية الرسوم البيانية
    const printWrapper = document.getElementById('printChartWrapper');
    if (printWrapper) {
        printWrapper.innerHTML = '';
        printWrapper.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 25px;
            padding: 20px;
            width: 100%;
        `;
    }

    // 5. تدمير الرسوم البيانية القديمة
    destroyPrintCharts();

    // 6. إنشاء الرسوم البيانية للطباعة
    let hasChartData = false;
    const chartPromises = [];

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
            labels.push(key);
            data.push(statusCount[key]);
            statusKeys.push(key);
        }

        if (data.length === 0) return;
        hasChartData = true;

        // إنشاء بطاقة الرسم البياني
        const card = createPrintChartCard(col, labels, data, statusKeys);
        if (printWrapper) {
            printWrapper.appendChild(card);
        }

        // إنشاء الرسم البياني باستخدام Canvas (للنسخ الاحتياطي)
        const promise = createPrintChartWithCanvas(card, col, labels, data, statusKeys);
        chartPromises.push(promise);
    });

    // 7. التعامل مع حالة عدم وجود بيانات للرسوم
    if (!hasChartData) {
        if (printWrapper) {
            printWrapper.innerHTML = `<p style="text-align:center;color:#94a3b8;padding:40px;width:100%;">${t.noChartData}</p>`;
        }
        setTimeout(() => {
            window.print();
            restoreAfterPrint();
        }, 500);
    } else {
        Promise.all(chartPromises).then(() => {
            console.log('All print charts rendered, printing...');
            setTimeout(() => {
                window.print();
                restoreAfterPrint();
            }, 800);
        });
    }
}

// ============= دوال مساعدة للطباعة =============

function preparePrintTable(visibleCols) {
    const printHeaders = document.getElementById("printTableHeaders");
    let hdr = `<tr>`;
    if (isDateColumnVisible) {
        hdr += `<th>Date</th>`;
    }
    visibleCols.forEach(col => hdr += `<th>${col.name}</th>`);
    hdr += `</tr>`;
    printHeaders.innerHTML = hdr;

    const body = document.getElementById("printTableBody");
    body.innerHTML = "";
    const sorted = [...logs].reverse();
    sorted.forEach(log => {
        let row = `<tr>`;
        if (isDateColumnVisible) {
            row += `<td>${log.date}</td>`;
        }
        visibleCols.forEach(col => {
            const val = log[col.id] || '';
            row += `<td>${val || '—'}</td>`;
        });
        row += `</tr>`;
        body.innerHTML += row;
    });
}

function preparePrintHeaders() {
    document.getElementById("printTitle").textContent = customTitles.printTable || "Visiting - Records";
    document.getElementById("printChartTitle").textContent = customTitles.printChart || "Visiting - Statistics";
    const now = new Date().toLocaleString();
    document.getElementById("printDate").textContent = now;
    document.getElementById("printDate2").textContent = now;
}

// ============= إنشاء بطاقة الرسم البياني للطباعة مع النسب المئوية =============
function createPrintChartCard(col, labels, data, statusKeys) {
    const total = data.reduce((a, b) => a + b, 0);
    const colors = statusKeys.map(key => getStatusColor(key));

    const card = document.createElement('div');
    card.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        width: 100%;
        max-width: 500px;
        min-width: 320px;
        text-align: center;
        page-break-inside: avoid;
        margin: 0 auto;
        border: 1px solid #e2e8f0;
    `;

    // العنوان
    const title = document.createElement('h4');
    title.textContent = col.name;
    title.style.cssText = `
        margin-bottom: 15px;
        color: #1e293b;
        font-size: 16px;
        font-weight: 600;
    `;
    card.appendChild(title);

    // حاوية مرنة
    const flexContainer = document.createElement('div');
    flexContainer.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 15px;
        width: 100%;
    `;

    // === رسم الدائرة باستخدام SVG مع النسب المئوية ===
    const svgWrapper = document.createElement('div');
    svgWrapper.style.cssText = `
        position: relative;
        width: 200px;
        height: 200px;
        flex-shrink: 0;
    `;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '200');
    svg.setAttribute('height', '200');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.style.cssText = 'width:100%;height:100%;print-color-adjust: exact; -webkit-print-color-adjust: exact; color-adjust: exact;';
    
    const centerX = 100;
    const centerY = 100;
    const radius = 80;
    let startAngle = -Math.PI / 2;
    
    data.forEach((value, i) => {
        if (value === 0) return;
        const sliceAngle = (value / total) * 2 * Math.PI;
        const endAngle = startAngle + sliceAngle;
        
        const x1 = centerX + radius * Math.cos(startAngle);
        const y1 = centerY + radius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);
        
        const largeArc = sliceAngle > Math.PI ? 1 : 0;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        path.setAttribute('d', d);
        path.setAttribute('fill', colors[i]);
        path.setAttribute('stroke', 'white');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('style', 'print-color-adjust: exact; -webkit-print-color-adjust: exact; color-adjust: exact;');
        svg.appendChild(path);
        
        // === إضافة النسبة المئوية داخل كل قطعة ===
        // حساب منتصف الزاوية
        const midAngle = startAngle + sliceAngle / 2;
        // نصف قطر النص (أقرب للمركز قليلاً)
        const labelRadius = radius * 0.65;
        const lx = centerX + labelRadius * Math.cos(midAngle);
        const ly = centerY + labelRadius * Math.sin(midAngle);
        
        // إضافة النص إذا كانت القطعة كبيرة بما يكفي
        const percentage = ((value / total) * 100);
        if (percentage > 8) { // فقط إذا كانت النسبة أكبر من 8%
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', lx);
            text.setAttribute('y', ly);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'central');
            text.setAttribute('fill', 'white');
            text.setAttribute('font-size', '14');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('style', 'print-color-adjust: exact; -webkit-print-color-adjust: exact; color-adjust: exact;');
            // إضافة ظل خفيف للنص لتحسين القراءة
            text.textContent = percentage.toFixed(1) + '%';
            svg.appendChild(text);
        }
        
        startAngle = endAngle;
    });
    
    svgWrapper.appendChild(svg);
    flexContainer.appendChild(svgWrapper);

    // === القائمة الجانبية (Legend) مع ألوان مضمونة ===
    const legendWrapper = document.createElement('div');
    legendWrapper.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 130px;
        padding: 12px 16px;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        text-align: left;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
    `;
    legendWrapper.style.setProperty('background', '#f8fafc', 'important');
    
    legendWrapper.innerHTML = '<div style="font-weight:600;font-size:13px;color:#475569;margin-bottom:6px;">📊 Legend</div>';
    labels.forEach((label, i) => {
        const pct = ((data[i] / total) * 100).toFixed(1);
        const item = document.createElement('div');
        item.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 4px 6px;
            border-radius: 4px;
            font-size: 12px;
            color: #1e293b;
        `;
        
        // استخدام SVG صغير للدائرة الملونة
        const colorSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        colorSvg.setAttribute('width', '16');
        colorSvg.setAttribute('height', '16');
        colorSvg.setAttribute('viewBox', '0 0 16 16');
        colorSvg.style.cssText = 'flex-shrink: 0; print-color-adjust: exact; -webkit-print-color-adjust: exact; color-adjust: exact;';
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '8');
        circle.setAttribute('cy', '8');
        circle.setAttribute('r', '7');
        circle.setAttribute('fill', colors[i]);
        circle.setAttribute('stroke', 'rgba(0,0,0,0.1)');
        circle.setAttribute('stroke-width', '1');
        circle.setAttribute('style', 'print-color-adjust: exact; -webkit-print-color-adjust: exact; color-adjust: exact;');
        colorSvg.appendChild(circle);
        
        const labelSpan = document.createElement('span');
        labelSpan.style.cssText = 'flex:1;font-weight:500;';
        labelSpan.textContent = label;
        
        const valueSpan = document.createElement('span');
        valueSpan.style.cssText = 'font-weight:600;color:#475569;font-size:11px;';
        valueSpan.textContent = `${data[i]} (${pct}%)`;
        
        item.appendChild(colorSvg);
        item.appendChild(labelSpan);
        item.appendChild(valueSpan);
        legendWrapper.appendChild(item);
    });
    
    flexContainer.appendChild(legendWrapper);
    card.appendChild(flexContainer);

    // إضافة حاوية Canvas مخفية للرسم الاحتياطي
    const canvasHidden = document.createElement('canvas');
    canvasHidden.id = `print_chart_${col.id}`;
    canvasHidden.style.display = 'none';
    card.appendChild(canvasHidden);

    return card;
}

// ============= إنشاء رسم بياني باستخدام Canvas (كدعم إضافي) =============
function createPrintChartWithCanvas(card, col, labels, data, statusKeys) {
    return new Promise((resolve) => {
        const canvas = card.querySelector(`#print_chart_${col.id}`);
        if (!canvas) {
            resolve();
            return;
        }

        setTimeout(() => {
            try {
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
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                display: false
                            },
                            datalabels: {
                                display: function(context) {
                                    const val = context.dataset.data[context.dataIndex];
                                    return val > 0 && val / total > 0.05;
                                },
                                color: '#fff',
                                font: { weight: 'bold', size: 11 },
                                formatter: function(val) { 
                                    return ((val / total) * 100).toFixed(1) + '%'; 
                                },
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
                console.log(`Print chart created for ${col.name}`);
            } catch (e) {
                console.error('Error creating print chart:', e);
            }
            resolve();
        }, 400);
    });
}

function restoreAfterPrint() {
    console.log('Restoring after print...');
    const printArea = document.getElementById("printArea");
    printArea.style.display = "none";
    printArea.classList.remove('active');
    destroyPrintCharts();
    const printWrapper = document.getElementById('printChartWrapper');
    if (printWrapper) {
        printWrapper.innerHTML = '';
    }
}

// ============= الاستماع لحدث الطباعة =============
let printHandler = null;

if (printHandler) {
    window.removeEventListener('afterprint', printHandler);
}

printHandler = function() {
    console.log('After print event - cleaning up');
    restoreAfterPrint();
};
window.addEventListener('afterprint', printHandler);