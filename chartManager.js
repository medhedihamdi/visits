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
        } catch (e) {
            console.error('Error creating chart:', e);
        }
    });

    if (!hasAnyData) {
        chartSection.style.display = "none";
        container.innerHTML = `<p style="text-align:center;color:#94a3b8;padding:20px;">${t.noChartData}</p>`;
    }
}

// ============= Print All =============
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

    // Prepare table
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

    // Set titles
    document.getElementById("printTitle").textContent = customTitles.printTable || "Visiting - Records";
    document.getElementById("printChartTitle").textContent = customTitles.printChart || "Visiting - Statistics";
    const now = new Date().toLocaleString();
    document.getElementById("printDate").textContent = now;
    document.getElementById("printDate2").textContent = now;

    // Show print area
    const printArea = document.getElementById("printArea");
    printArea.style.display = "block";
    printArea.classList.add('active');

    // Prepare charts for print
    const printWrapper = document.getElementById('printChartWrapper');
    if (printWrapper) {
        printWrapper.innerHTML = '';
        printWrapper.style.display = 'flex';
        printWrapper.style.flexWrap = 'wrap';
        printWrapper.style.justifyContent = 'center';
        printWrapper.style.gap = '30px';
        printWrapper.style.padding = '20px';
    }

    // Destroy old print charts
    destroyPrintCharts();

    let hasChartData = false;
    const chartPromises = [];

    visibleCols.forEach((col, index) => {
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
            max-width: 450px;
            min-width: 300px;
            text-align: center;
            page-break-inside: avoid;
            margin-bottom: 20px;
        `;

        const title = document.createElement('h4');
        title.textContent = col.name;
        title.style.cssText = 'margin-bottom: 15px; color: #1e293b; font-size: 16px;';
        card.appendChild(title);

        const canvasWrapper = document.createElement('div');
        canvasWrapper.style.cssText = `
            position: relative;
            height: 300px;
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
        `;
        const canvas = document.createElement('canvas');
        canvas.id = `print_chart_${col.id}`;
        canvas.style.cssText = 'width: 100% !important; height: 100% !important;';
        canvasWrapper.appendChild(canvas);
        card.appendChild(canvasWrapper);
        if (printWrapper) {
            printWrapper.appendChild(card);
        }

        // Create chart promise
        const promise = new Promise((resolve) => {
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
                    console.log(`Print chart created for ${col.name}`);
                } catch (e) {
                    console.error('Error creating print chart:', e);
                }
                resolve();
            }, 200);
        });
        chartPromises.push(promise);
    });

    if (!hasChartData) {
        if (printWrapper) {
            printWrapper.innerHTML = `<p style="text-align:center;color:#94a3b8;padding:40px;">${t.noChartData}</p>`;
        }
        // If no chart data, print immediately
        setTimeout(() => {
            window.print();
        }, 500);
    } else {
        // Wait for charts to render then print
        Promise.all(chartPromises).then(() => {
            console.log('All print charts rendered, waiting before print...');
            setTimeout(() => {
                window.print();
            }, 800);
        });
    }
}

// ============= Handle after print =============
window.addEventListener('afterprint', function() {
    console.log('After print - cleaning up');
    const printArea = document.getElementById("printArea");
    printArea.style.display = "none";
    printArea.classList.remove('active');
    destroyPrintCharts();
    const printWrapper = document.getElementById('printChartWrapper');
    if (printWrapper) {
        printWrapper.innerHTML = '';
    }
});