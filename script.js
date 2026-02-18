// =============================================
// Observatorio Electoral Perú 2026
// Premium Interactive Dashboard
// =============================================

let data = null;
let candidateData = {
    complete: [],    // ≥4 appearances
    moderate: [],    // 3 appearances
    sporadic: [],    // ≤2 appearances
    excluded: []     // Manually excluded
};
let monthOrder = [];
let focusedCandidates = [];

// Candidates manually excluded (Fuera de carrera)
const EXCLUDED_CANDIDATES = [
    'Alfredo Barnechea',
    'Arturo Fernández',

    'Guillermo Bermejo',
    'Javier Velásquez Quesquén',
    'Jorge del Castillo',
    'Phillip Butters',
    'Victor Andrés García Belaunde'
];

// Special categories
const SPECIAL_CATEGORIES = ['Blanco/viciado/ninguno', 'Otros', 'No precisa'];

// Explicit chronological order of months (internal keys)
const MONTH_ORDER_DEFINED = [
    'Julio 2025',
    'Agosto 2025',
    'Setiembre 2025',
    'Octubre 2025',
    'Octubre (2) 2025',
    'Noviembre (1) 2025',
    'Noviembre (2) 2025',
    'Diciembre 2025 (1)',
    'Diciembre 2025 (2)',
    'Enero 2026'
];

// Display labels for X-axis (without 2025)
// Display labels for X-axis (Abbreviated Mmm YY)
const MONTH_DISPLAY_LABELS = {
    'Julio 2025': 'Jul 25',
    'Agosto 2025': 'Ago 25',
    'Setiembre 2025': 'Set 25',
    'Octubre 2025': 'Oct 25',
    'Octubre (2) 2025': 'Oct (2) 25',
    'Noviembre (1) 2025': 'Nov (1) 25',
    'Noviembre (2) 2025': 'Nov (2) 25',
    'Diciembre 2025 (1)': 'Dic (1) 25',
    'Diciembre 2025 (2)': 'Dic (2) 25',
    'Enero 2026': 'Ene 26'
};

// Mobile labels (No '25' year suffix, except for 2026 change)
const MONTH_LABELS_MOBILE = {
    'Julio 2025': 'Jul',
    'Agosto 2025': 'Ago',
    'Setiembre 2025': 'Set',
    'Octubre 2025': 'Oct',
    'Octubre (2) 2025': 'Oct (2)',
    'Noviembre (1) 2025': 'Nov (1)',
    'Noviembre (2) 2025': 'Nov (2)',
    'Diciembre 2025 (1)': 'Dic (1)',
    'Diciembre 2025 (2)': 'Dic (2)',
    'Enero 2026': 'Ene 26'
};

// Extended color palette (15+ candidates)
// Specific colors for candidates (2026)
const CANDIDATE_COLORS = {
    "Alfonso López Chau": "#e90305", // Rojo Vibrante
    "Carlos Espá": "#535353",
    "César Acuña": "#17519b",
    "George Forsyth": "#fe0000",
    "Keiko Fujimori": "#ed6b09",
    "Mario Vizcarra": "#E91E63",     // Rojo Rosado (estilo PPK)
    "Rafael Belaunde": "#ffff01",
    "Rafael López Aliaga": "#00AEEF",
    "Ricardo Belmont": "#1f5802",
    "Vladimir Cerrón": "#e80000",
    "Yonhy Lescano": "#B03A2E",       // Rojo Ladrillo (para diferenciar)
    "Carlos Álvarez": "#FFC107"       // Dorado/Mostaza (vs Amarillo Belaunde)
};

// Fallback palette for other candidates
const COLOR_PALETTE = [
    '#3498db', // Blue
    '#9b59b6', // Purple
    '#1abc9c', // Teal
    '#e67e22', // Dark Orange
    '#34495e', // Dark Blue Gray
    '#16a085', // Dark Teal
    '#c0392b', // Dark Red
    '#7f8c8d', // Gray
    '#2c3e50', // Navy
    '#f1c40f', // Yellow
];

// Special category colors - distinct for each
const SPECIAL_COLORS = {
    'Blanco/viciado/ninguno': '#95a5a6',  // Gray
    'Blanco/viciado': '#95a5a6',          // Alias for display
    'Otros': '#8B4513',                   // Brown (SaddleBrown) - distinct
    'No precisa': '#6c5ce7'                // Purple - distinct
};

// Marker symbols by trajectory type
const TRAJECTORY_MARKERS = {
    complete: 'circle',
    moderate: 'diamond',
    complete: 'circle',
    moderate: 'diamond',
    sporadic: 'star',
    excluded: 'x'
};

// Line styles by trajectory type
const TRAJECTORY_STYLES = {
    complete: { width: 4, dash: 'solid' },
    moderate: { width: 3, dash: 'dash' },
    complete: { width: 4, dash: 'solid' },
    moderate: { width: 3, dash: 'dash' },
    sporadic: { width: 2, dash: 'dot' },
    excluded: { width: 2, dash: 'dot' }
};

// Asset Mappings (Photos & Logos)
const CANDIDATE_ASSETS = {
    "Alfonso López Chau": { photo: "Alfonso Lopez-Chau.jpg", logo: "AHORA_NACION_LOGO.jpg" },
    "Carlos Espá": { photo: "Carlos Espá.png", logo: "SICREO_LOGO.jpg" },
    "César Acuña": { photo: "César Acuña.jpg", logo: "ALIANZA_PARA_EL_PROGRESO_LOGO.bmp" },
    "George Forsyth": { photo: "George Forsyth.png", logo: "SOMOS_PERU_LOGO.jpg" },
    "Keiko Fujimori": { photo: "Keiko Fujimori.png", logo: "FUERZA_POPULAR_LOGO.jpg" },
    "Mario Vizcarra": { photo: "Mario Vizcarra.jpg", logo: "PERU_PRIMERO_LOGO.jpg" },
    "Rafael Belaunde": { photo: "Rafael Belaunde.jpg", logo: "LIBERTAD_POPULAR_LOGO.jpg" },
    "Rafael López Aliaga": { photo: "Rafael López Aliaga.png", logo: "RENOVACION_POPULAR_LOGO.jpg" },
    "Ricardo Belmont": { photo: "Ricardo Belmont.jpg", logo: "OBRAS_LOGO.jpg" },
    "Vladimir Cerrón": { photo: "Vladimir Cerrón.png", logo: "PERU_LIBRE_LOGO.jpg" },
    "Yonhy Lescano": { photo: "Yonhy Lescano.jpg", logo: "COOPERACION_POPULAR_LOGO.jpg" },
    "Roberto Chiabra": { photo: "Roberto Chiabra.png", logo: "UNIDAD_NACIONAL_LOGO.png" }, // Verify party?
    "Fiorella Molinelli": { photo: "Fiorella Molinelli.jpg", logo: "FUERZA_Y_LIBERTAD_LOGO.png" }, // Verify party?
    "Hernando de Soto": { photo: "Hernando De Soto.jpg", logo: "PROGRESEMOS_LOGO.jpg" },
    "Jorge Nieto": { photo: "Jorge Nieto.jpg", logo: "BUEN_GOBIERNO_LOGO.jpg" },
    "Carlos Álvarez": { photo: "Carlos Álvarez.png", logo: "PAIS_PARA_TODOS_LOGO.jpg" },
    "José Luna Gálvez": { photo: "José Luna Gálvez.png", logo: "PODEMOS_PERU_LOGO.jpg" },
    "José Williams": { photo: "José Williams.png", logo: "AVANZA_PAIS_LOGO.jpg" },
    "Álex González": { photo: "Alex Gonzáles.png", logo: "DEMOCRATA_VERDE_LOGO.jpg" },
    "Álvaro Paz de la Barra": { photo: "Alvaro Paz de La Barra.png", logo: "FE_EN_EL_PERU_LOGO.jpg" },
    "Antonio Ortiz": { photo: "Antonio Ortiz.png", logo: "SALVEMOS_AL_PERU_LOGO.jpg" },
    "Armando Massé": { photo: "Armando Massé.jpg", logo: "PERU_FEDERAL_LOGO.jpg" },
    "Carlos Jaico": { photo: "Carlos Jaico.jpg", logo: "PERU_MODERNO_LOGO.jpg" },
    "Charlie Carrasco": { photo: "Charlie Carrasco.png", logo: "UNIDO_PERU_LOGO.jpg" },
    "Enrique Valderrama": { photo: "Enrique Valderrama.png", logo: "APRA_LOGO.jpg" },
    "Fernando Olivera": { photo: "Fernando Olivera.jpg", logo: "FRENTE_DE_LA_ESPERANZA_LOGO.jpg" },
    "Francisco Diez Canseco": { photo: "Francisco Diez-Canseco.png", logo: "PERU_ACCION_LOGO.jpg" },
    "Herbert Caller": { photo: "Herbert Caller.jpg", logo: "PARTIDO_PATRIOTICO_DEL_PERU_LOGO.jpg" },
    "Mesías Guevara": { photo: "Mesías Guevara.png", logo: "PARTIDO_MORADO_LOGO.jpg" },
    "Napoleón Becerra": { photo: "Napoleón Becerra.png", logo: "PARTIDO_DE_LOS_TRABAJADORES_Y_EMPRENDEDORES_LOGO.jpg" },
    "Paul Jaimes": { photo: "Paul Jaimes.png", logo: "PROGRESEMOS_LOGO.jpg" },
    "Roberto Sánchez": { photo: "Roberto Sánchez.png", logo: "JUNTOS_POR_EL_PERU_LOGO.jpg" },
    "Ronald Atencio": { photo: "Ronald Atencio.jpg", logo: "VENCEREMOS_LOGO.png" },
    "Rosario del Pilar Fernández": { photo: "Rosario Fernández.png", logo: "UN_CAMINO_DIFERENTE_LOGO.jpg" },
    "Walter Chirinos": { photo: "Walter Chirinos.jpg", logo: "PRIN_LOGO.jpg" },
    "Wolfgang Grozo": { photo: "Wolfgang Grozo.jpg", logo: "INTEGRIDAD_DEMOCRATICA_LOGO.jpg" }
    // Add others as needed. If missing, it will use text fallback.
};

const LOGO_BASE_PATH = "Logos EG 2026/";
const PHOTO_BASE_PATH = "Fotos candidatos_OECP/";

// =============================================
// Initialize on page load
// =============================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`datos_encuestas.json?v=${new Date().getTime()}`);
        data = await response.json();

        processData();
        updateDateDisplay();
        populateCandidateDropdown();

        // On desktop: auto-open the controls accordion (it starts closed by default for mobile)
        const controlsToggle = document.getElementById('chart-controls-toggle');
        if (controlsToggle && window.innerWidth > 768) {
            controlsToggle.setAttribute('open', '');
        }

        // Show legend container BEFORE rendering chart to get correct dimensions
        document.getElementById('legend-container').style.display = 'block';

        renderMainChart();
        renderCustomLegend();
        renderDemographicCharts();
        setupEventListeners();

        // Force resize after everything is rendered to ensure correct dimensions
        setTimeout(() => {
            Plotly.Plots.resize('main-chart');
        }, 100);

    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('main-chart').innerHTML =
            '<div class="loading" style="color: #e74c3c;"><span>Error cargando datos. Verifica que datos_encuestas.json esté en la carpeta.</span></div>';
    }
});

// =============================================
// Window Resize Handling
// =============================================
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const charts = [
            'main-chart',
            'gender-chart',
            'nse-chart',
            'age-chart',
            'geo-ambito-chart',
            'geo-interior-chart',
            'geo-region-chart',
            'comparative-chart'
        ];

        const isMobile = window.innerWidth <= 768;

        charts.forEach(id => {
            const el = document.getElementById(id);
            if (el && el.data && el.data.length > 0) { // Check if chart exists and has data
                Plotly.relayout(id, {
                    'xaxis.tickfont.size': isMobile ? 10 : 11,
                    // Optimized margins for mobile to minimize whitespace
                    'margin': isMobile ? { l: 25, r: 10, t: 10, b: 30 } : (id === 'main-chart' ? { l: 60, r: 20, t: 20, b: 80 } : { l: 40, r: 20, t: 40, b: 40 }),
                    'height': isMobile ? (id === 'main-chart' ? 260 : (id.includes('geo-') || id.includes('gender') || id.includes('nse') || id.includes('age') ? 220 : 380)) : (id === 'main-chart' ? 520 : (id === 'comparative-chart' ? 500 : 320))
                });
                Plotly.Plots.resize(el);
            }
        });
    }, 200);
});

// =============================================
// Data Processing with Trajectory Categorization
// =============================================
function processData() {
    const availableMonths = Object.keys(data);
    monthOrder = MONTH_ORDER_DEFINED.filter(m => availableMonths.includes(m));
    console.log('Available in JSON:', availableMonths);
    console.log('Processed Months:', monthOrder);

    // Count appearances for each candidate
    const candidateStats = {};

    monthOrder.forEach(month => {
        data[month].candidates.forEach(c => {
            if (!SPECIAL_CATEGORIES.includes(c.name)) {
                if (!candidateStats[c.name]) {
                    candidateStats[c.name] = { appearances: 0, totalVotes: 0, maxVote: 0 };
                }
                candidateStats[c.name].appearances++;
                candidateStats[c.name].totalVotes += c.total || 0;
                candidateStats[c.name].maxVote = Math.max(candidateStats[c.name].maxVote, c.total || 0);
            }
        });
    });

    // Categorize candidates by trajectory
    const sorted = Object.entries(candidateStats)
        .map(([name, stats]) => ({
            name,
            ...stats,
            avgVote: stats.totalVotes / stats.appearances
        }))
        .sort((a, b) => b.avgVote - a.avgVote);

    // Filter excluded first
    candidateData.excluded = sorted.filter(c => EXCLUDED_CANDIDATES.includes(c.name)).map(c => c.name);

    // Filter active candidates
    const activeCandidates = sorted.filter(c => !EXCLUDED_CANDIDATES.includes(c.name));

    candidateData.complete = activeCandidates.filter(c => c.appearances >= 4).map(c => c.name);
    candidateData.moderate = activeCandidates.filter(c => c.appearances === 3).map(c => c.name);
    candidateData.sporadic = activeCandidates.filter(c => c.appearances <= 2).map(c => c.name);
}

function updateDateDisplay() {
    const lastMonth = monthOrder[monthOrder.length - 1];
    document.getElementById('update-date').textContent = `Actualizado: ${lastMonth}`;
}

function populateCandidateDropdown() {
    const select = document.getElementById('candidate-select');
    // For dropdown, we generally only show active candidates
    const allCandidates = [...candidateData.complete, ...candidateData.moderate, ...candidateData.sporadic];

    allCandidates.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });

    if (allCandidates.length > 0) {
        select.value = allCandidates[0];
    }
}

function getCandidateColor(candidateName, index = 0) {
    if (SPECIAL_COLORS[candidateName]) {
        return SPECIAL_COLORS[candidateName];
    }
    if (EXCLUDED_CANDIDATES.includes(candidateName)) {
        return '#555555'; // Dark Gray for excluded (more visible)
    }
    if (CANDIDATE_COLORS[candidateName]) {
        return CANDIDATE_COLORS[candidateName];
    }
    return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

function getCandidateType(candidateName) {
    if (SPECIAL_CATEGORIES.includes(candidateName)) return 'special';
    // Check specific lists
    if (candidateData.excluded.includes(candidateName)) return 'excluded';
    if (candidateData.complete.includes(candidateName)) return 'complete';
    if (candidateData.moderate.includes(candidateName)) return 'moderate';
    return 'sporadic';
}

// =============================================
// Custom Legend with SVG Icons
// =============================================
function renderCustomLegend() {
    const container = document.getElementById('legend-container');
    container.style.display = 'block';
    container.innerHTML = '';

    const showBlanco = document.getElementById('show-blanco').checked;
    const showOtros = document.getElementById('show-otros').checked;
    const showNoPrecisa = document.getElementById('show-noprecisa').checked;
    const showExcluded = document.getElementById('show-excluded').checked;

    // Build categories
    const categories = [
        { title: 'Presencia Constante', candidates: candidateData.complete, type: 'complete' },
        { title: 'Presencia Intermedia', candidates: candidateData.moderate, type: 'moderate' },
        { title: 'Presencia Baja', candidates: candidateData.sporadic, type: 'sporadic' }
    ];

    // Add Excluded if enabled
    if (showExcluded && candidateData.excluded.length > 0) {
        categories.push({ title: 'Fuera de carrera', candidates: candidateData.excluded, type: 'excluded' });
    }

    // Add special categories if enabled
    const specialToShow = [];
    if (showBlanco) specialToShow.push('Blanco/viciado');
    if (showOtros) specialToShow.push('Otros');
    if (showNoPrecisa) specialToShow.push('No precisa');

    if (specialToShow.length > 0) {
        categories.push({ title: 'Categorías Especiales', candidates: specialToShow, type: 'special' });
    }

    let colorIndex = 0;
    categories.forEach(category => {
        if (category.candidates.length === 0) return;

        // Category header
        const header = document.createElement('div');
        header.className = 'legend-category';
        header.textContent = category.title;
        container.appendChild(header);

        // Candidate items
        category.candidates.forEach(candidateName => {
            const color = getCandidateColor(candidateName, colorIndex);
            if (!SPECIAL_CATEGORIES.includes(candidateName)) colorIndex++;

            const item = document.createElement('div');
            item.className = 'legend-item';
            item.dataset.candidate = candidateName;

            if (focusedCandidates.length > 0) {
                if (focusedCandidates.includes(candidateName)) {
                    item.classList.add('active');
                } else {
                    item.classList.add('faded');
                }
            }

            // Asset lookup
            const assets = CANDIDATE_ASSETS[candidateName] || {};
            const photoSrc = assets.photo ? `${PHOTO_BASE_PATH}${assets.photo}` : null;
            const logoSrc = assets.logo ? `${LOGO_BASE_PATH}${assets.logo}` : null;

            let photoHTML = photoSrc
                ? `<img class="legend-photo" src="${photoSrc}" alt="${candidateName}" onerror="this.style.visibility='hidden'">`
                : `<div class="legend-photo" style="background:${color}; display:flex; align-items:center; justify-content:center; color:white; font-size:10px;">${candidateName.charAt(0)}</div>`;

            let logoHTML = logoSrc
                ? `<img class="legend-party-logo" src="${logoSrc}" alt="Partido">`
                : '';

            // Format name for display (multi-line)
            let displayName = candidateName;
            if (candidateName === 'Blanco/viciado') {
                displayName = 'Blanco/<br>viciado';
            } else if (candidateName.includes(' ') && candidateName.length > 15) {
                // Try to split long names
                const parts = candidateName.split(' ');
                if (parts.length > 2) {
                    displayName = `${parts.slice(0, 2).join(' ')}<br>${parts.slice(2).join(' ')}`;
                }
            }

            item.innerHTML = `
                ${photoHTML}
                <div class="legend-info">
                    <span class="legend-name">${displayName}</span>
                    ${logoHTML}
                </div>
                ${createLegendIcon(category.type, color)}
            `;

            item.addEventListener('click', () => toggleCandidateFocus(candidateName));
            container.appendChild(item);
        });
    });
}

function createLegendIcon(type, color) {
    let svg = '';
    switch (type) {
        case 'complete':
            svg = `<svg class="legend-icon" viewBox="0 0 28 28">
                <line x1="2" y1="14" x2="26" y2="14" stroke="${color}" stroke-width="4"/>
                <circle cx="14" cy="14" r="6" fill="${color}"/>
            </svg>`;
            break;
        case 'moderate':
            svg = `<svg class="legend-icon" viewBox="0 0 28 28">
                <line x1="2" y1="14" x2="26" y2="14" stroke="${color}" stroke-width="3" stroke-dasharray="5,3"/>
                <path d="M14 6 L22 14 L14 22 L6 14 Z" fill="${color}"/>
            </svg>`;
            break;
        case 'sporadic':
            svg = `<svg class="legend-icon" viewBox="0 0 28 28">
                <line x1="2" y1="14" x2="26" y2="14" stroke="${color}" stroke-width="2" stroke-dasharray="2,2"/>
                <path d="M14 3 L17 11 L26 11 L19 16 L22 24 L14 19 L6 24 L9 16 L2 11 L11 11 Z" fill="${color}"/>
            </svg>`;
            break;
        case 'excluded':
            svg = `<svg class="legend-icon" viewBox="0 0 28 28">
                <line x1="2" y1="14" x2="26" y2="14" stroke="${color}" stroke-width="2" stroke-dasharray="2,2"/>
                <text x="14" y="19" font-size="20" text-anchor="middle" fill="${color}" font-weight="bold" font-family="Arial">×</text>
            </svg>`;
            break;
        case 'special':
            svg = `<svg class="legend-icon" viewBox="0 0 28 28">
                <line x1="2" y1="14" x2="26" y2="14" stroke="${color}" stroke-width="2"/>
                <rect x="9" y="9" width="10" height="10" fill="${color}"/>
            </svg>`;
            break;
    }
    return svg;
}

function toggleCandidateFocus(candidateName) {
    const index = focusedCandidates.indexOf(candidateName);
    if (index === -1) {
        focusedCandidates.push(candidateName);
    } else {
        focusedCandidates.splice(index, 1);
    }
    renderMainChart();
    renderCustomLegend();
}

// =============================================
// Main Evolution Chart
// =============================================
function renderMainChart() {
    const isMobile = window.innerWidth <= 768;
    const showBlanco = document.getElementById('show-blanco').checked;
    const showOtros = document.getElementById('show-otros').checked;
    const showNoPrecisa = document.getElementById('show-noprecisa').checked;
    const showExcluded = document.getElementById('show-excluded').checked;

    // Build candidate list in order
    let candidatesToShow = [
        ...candidateData.complete,
        ...candidateData.moderate,
        ...candidateData.sporadic
    ];

    if (showExcluded) {
        candidatesToShow.push(...candidateData.excluded);
    }

    if (showBlanco) candidatesToShow.push('Blanco/viciado');
    if (showOtros) candidatesToShow.push('Otros');
    if (showNoPrecisa) candidatesToShow.push('No precisa');

    // Build traces
    const traces = [];
    let colorIndex = 0;

    candidatesToShow.forEach((candidateName) => {
        const xValues = [];
        const yValues = [];

        monthOrder.forEach(month => {
            // Mapping for data lookup (since data uses 'Blanco/viciado/ninguno')
            let searchName = candidateName;
            if (candidateName === 'Blanco/viciado') searchName = 'Blanco/viciado/ninguno';

            const candidate = data[month].candidates.find(c => c.name === searchName);
            if (candidate && candidate.total !== undefined) {
                xValues.push(month);
                yValues.push(candidate.total);
            }
        });

        if (xValues.length === 0) return;

        // Use original names for type lookup if needed, but display name is already strict
        const type = getCandidateType(candidateName === 'Blanco/viciado' ? 'Blanco/viciado/ninguno' : candidateName);
        const color = getCandidateColor(candidateName === 'Blanco/viciado' ? 'Blanco/viciado/ninguno' : candidateName, colorIndex);
        if (!SPECIAL_CATEGORIES.includes(candidateName) && candidateName !== 'Blanco/viciado') colorIndex++;

        const style = TRAJECTORY_STYLES[type] || TRAJECTORY_STYLES.sporadic;
        const marker = TRAJECTORY_MARKERS[type] || 'circle';
        const dataPoints = xValues.length;

        // Determine opacity and colors based on focus
        let opacity = 1;
        let lineColor = color;
        let lineWidth = style.width;
        let tooltipBgColor = color;
        let tooltipFontColor = '#ffffff';

        if (focusedCandidates.length > 0) {
            if (focusedCandidates.includes(candidateName)) {
                lineWidth = style.width + 2; // Bold focus (same as desktop)
                // Keep original color for focused candidate
                tooltipBgColor = color;
                tooltipFontColor = '#ffffff';
            } else {
                opacity = 0.25;
                lineColor = '#d0d0d0';
                // Gray tooltip for unfocused, but legible
                tooltipBgColor = '#e0e0e0';
                tooltipFontColor = '#333333';
            }
        }
        // Removed explicit mobile reduction to match desktop thickness as requested

        traces.push({
            x: xValues,
            y: yValues,
            name: candidateName,
            type: 'scatter',
            mode: dataPoints <= 2 ? 'markers' : 'lines+markers',
            line: {
                width: lineWidth,
                dash: style.dash,
                color: lineColor,
                shape: 'spline',
                smoothing: 1.1
            },
            marker: {
                size: isMobile
                    ? (dataPoints <= 2 ? 10 : (type === 'complete' ? 8 : 6)) // Slightly larger than "ultra-compact" but still mobile-optimized
                    : (dataPoints <= 2 ? 16 : (type === 'complete' ? 12 : 10)), // Standard desktop
                symbol: type === 'excluded' ? 'x' : (dataPoints <= 2 ? 'star' : marker),
                color: lineColor,
                line: { width: isMobile ? 1 : 2, color: '#fff' }
            },
            opacity: opacity,
            connectgaps: true,
            hovertemplate: '<b>%{fullData.name}</b>: %{y:.1f}%<extra></extra>',
            hoverlabel: {
                bgcolor: tooltipBgColor,
                bordercolor: tooltipBgColor,
                font: {
                    color: tooltipFontColor,
                    size: isMobile ? 10 : 10, // Force small hover font here too
                    family: 'Inter, sans-serif'
                },
                namelength: 18
            }
        });
    });

    // Dynamic Y-axis: Auto-scaling (like Comparative Chart)
    // We let Plotly handle the range automatically based on visible data
    let yAxisConfig = {
        title: { text: 'Intención de Voto', font: { size: 12 } },
        rangemode: 'tozero', // Ensure it always starts at 0
        gridcolor: 'rgba(0,0,0,0.06)',
        zerolinecolor: 'rgba(0,0,0,0.1)',
        ticksuffix: '%'
    };

    // Layout configuration
    const layout = {
        title: '',
        xaxis: {
            title: '',
            tickangle: 0,
            categoryorder: 'array',
            categoryarray: monthOrder,
            tickvals: monthOrder,
            ticktext: monthOrder.map(m => (isMobile ? MONTH_LABELS_MOBILE[m] : MONTH_DISPLAY_LABELS[m]) || m),
            tickfont: { size: isMobile ? 10 : 11 }, // Restored to 10 (Comparative style)
            gridcolor: 'rgba(0,0,0,0.03)',
            // Spikeline configuration
            showspikes: true,
            spikemode: 'across',
            spikesnap: 'cursor',
            spikecolor: 'rgba(0,0,0,0.3)',
            spikethickness: 1,
            spikedash: 'dot'
        },
        yaxis: yAxisConfig,
        // On mobile: 'closest' so tapping a point shows only that candidate's value.
        // On desktop: 'x' shows all candidates at the same X position (unified tooltip).
        hovermode: isMobile ? 'closest' : 'x',
        hoverdistance: isMobile ? 30 : 50,
        // Compact hover label styling
        hoverlabel: {
            bgcolor: 'rgba(255,255,255,0.95)',
            bordercolor: 'rgba(0,0,0,0.1)',
            font: { size: isMobile ? 11 : 11, family: 'Inter, sans-serif' },
            align: 'left',
            namelength: 25
        },
        showlegend: false, // Using custom legend
        // Mobile: tighter margins + 300px height = good horizontal ratio
        margin: isMobile ? { l: 35, r: 5, t: 5, b: 20 } : { l: 60, r: 20, t: 20, b: 80 },
        height: isMobile ? 300 : 520,
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { family: 'Inter, sans-serif' }
    };



    const config = {
        responsive: true,
        displayModeBar: false,
        staticPlot: isMobile ? false : false // Keep tooltips, but disable interaction via layout
    };

    // Disable zoom/pan on mobile to prevent scroll hijacking
    if (isMobile) {
        layout.xaxis.fixedrange = true;
        layout.yaxis.fixedrange = true;
        layout.dragmode = false; // Disable box zoom/pan interactions
    }

    Plotly.newPlot('main-chart', traces, layout, config);
}

// =============================================
// Demographic Charts - Two Mode System
// =============================================

// Segment definitions for each dimension
const SEGMENTS = {
    nse: ['A', 'B', 'C', 'D', 'E'],
    gender: ['Masculino', 'Femenino'],
    age: ['18-25', '26-42', '43+'],
    ambito: ['Lima', 'Interior'],
    interior: ['Interior Urbano', 'Interior Rural'],
    region: ['Norte', 'Centro', 'Sur', 'Oriente']
};

// Map UI dimension to JSON data key
const DIMENSION_DATA_MAP = {
    nse: 'nse',
    gender: 'gender',
    age: 'age',
    ambito: 'geography',
    interior: 'geography',
    region: 'geography'
};

// Colors for segments (consistent across dimensions)
const SEGMENT_COLORS = [
    '#e74c3c', '#f39c12', '#3498db', '#2ecc71', '#9b59b6', '#1abc9c', '#e67e22'
];

// Colors for special categories in comparative mode
const SPECIAL_COLORS_COMPARATIVE = {
    'Blanco/viciado/ninguno': '#95a5a6',
    'Otros': '#8B4513',
    'No precisa': '#6c5ce7'
};

function renderDemographicCharts() {
    const analysisMode = document.querySelector('input[name="analysis-mode"]:checked').value;

    if (analysisMode === 'profile') {
        renderProfileMode();
    } else {
        renderComparativeMode();
    }
}

function renderProfileMode() {
    // Show profile charts, hide comparative
    document.getElementById('profile-charts').style.display = 'grid';
    document.getElementById('comparative-chart-container').style.display = 'none';

    const selectedCandidate = document.getElementById('candidate-select').value;

    const commonLayout = {
        template: 'plotly_white',
        margin: { l: 50, r: 60, t: 50, b: 60 },
        height: 320,
        legend: {
            orientation: 'h',
            y: 1.12,
            x: 0.5,
            xanchor: 'center',
            font: { size: 9, family: 'Inter, sans-serif' }
        },
        hovermode: 'x unified',
        xaxis: {
            tickangle: 0,
            categoryorder: 'array',
            categoryarray: monthOrder,
            tickvals: monthOrder,
            ticktext: monthOrder.map(m => MONTH_DISPLAY_LABELS[m] || m),
            tickfont: { size: 9 },
            gridcolor: 'rgba(0,0,0,0.04)'
        },
        yaxis: { title: '%', gridcolor: 'rgba(0,0,0,0.06)', ticksuffix: '%' },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { family: 'Inter, sans-serif' }
    };

    // Render each demographic chart for the selected candidate only
    renderProfileChart('gender-chart', selectedCandidate, 'gender', 'Género', commonLayout);
    renderProfileChart('nse-chart', selectedCandidate, 'nse', 'NSE', commonLayout);
    renderProfileChart('age-chart', selectedCandidate, 'age', 'Edad', commonLayout);
    renderProfileChart('geo-ambito-chart', selectedCandidate, 'geography', 'Ámbito (Lima vs Interior)', commonLayout, ['Lima', 'Interior']);
    renderProfileChart('geo-interior-chart', selectedCandidate, 'geography', 'Interior (Urbano vs Rural)', commonLayout, ['Interior Urbano', 'Interior Rural']);
    renderProfileChart('geo-region-chart', selectedCandidate, 'geography', 'Regiones', commonLayout, ['Norte', 'Centro', 'Sur', 'Oriente']);
}

function renderProfileChart(containerId, candidateName, demoType, title, layout, filterSegments = null) {
    const traces = [];
    const segments = filterSegments || SEGMENTS[demoType];

    segments.forEach((segment, idx) => {
        const xValues = [];
        const yValues = [];
        const color = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];

        monthOrder.forEach(month => {
            const candidate = data[month].candidates.find(c => c.name === candidateName);
            if (candidate && candidate[demoType] && candidate[demoType][segment] !== undefined) {
                xValues.push(month);
                yValues.push(candidate[demoType][segment]);
            }
        });

        if (xValues.length > 0) {
            traces.push({
                x: xValues,
                y: yValues,
                name: segment,
                type: 'scatter',
                mode: xValues.length <= 2 ? 'markers' : 'lines+markers',
                line: { width: 2.5, shape: 'spline', smoothing: 1.1, color: color },
                marker: { size: xValues.length <= 2 ? 10 : 7, color: color, line: { width: 1, color: '#fff' } },
                connectgaps: true,
                hovertemplate: `<b>${segment}</b>: %{y:.1f}%<extra></extra>`,
                hoverlabel: {
                    bgcolor: color,
                    bordercolor: color,
                    font: { color: '#ffffff', size: 11, family: 'Inter, sans-serif' }
                }
            });
        }
    });

    // Update layout to show all tooltips at same X position
    const isMobile = window.innerWidth <= 768;
    const profileLayout = {
        ...layout,
        title: { text: title, font: { size: isMobile ? 12 : 13, family: 'Inter, sans-serif' } },
        margin: isMobile ? { l: 30, r: 10, t: 30, b: 30 } : { l: 40, r: 20, t: 40, b: 40 },
        height: isMobile ? 250 : 320,
        hovermode: 'x',
        font: { family: 'Inter, sans-serif' },
        xaxis: {
            ticktext: monthOrder.map(m => (isMobile ? MONTH_LABELS_MOBILE[m] : MONTH_DISPLAY_LABELS[m]) || m),
            tickvals: monthOrder,
            fixedrange: isMobile ? true : false
        }
    };

    // Disable zoom/pan on mobile
    if (isMobile) {
        profileLayout.yaxis.fixedrange = true;
        profileLayout.dragmode = false;
    }

    Plotly.newPlot(containerId, traces, profileLayout, { responsive: true, displayModeBar: false });
}

function renderComparativeMode() {
    // Hide profile charts, show comparative
    document.getElementById('profile-charts').style.display = 'none';
    document.getElementById('comparative-chart-container').style.display = 'flex';

    const dimension = document.getElementById('dimension-select').value;
    const segment = document.getElementById('segment-select').value;

    // Get selected candidates from sidebar legend checkboxes with trajectory info
    const selectedCandidates = Array.from(document.querySelectorAll('#candidates-legend-list input[type="checkbox"]:checked'))
        .map(cb => ({
            name: cb.value,
            color: cb.dataset.color,
            trajectory: cb.dataset.trajectory || 'complete'
        }));

    // Add special categories if checked
    const entitiesToShow = [...selectedCandidates];
    if (document.getElementById('compare-blanco')?.checked) {
        entitiesToShow.push({ name: 'Blanco/viciado', color: '#95a5a6', isSpecial: true, trajectory: 'special' });
    }
    if (document.getElementById('compare-otros')?.checked) {
        entitiesToShow.push({ name: 'Otros', color: '#8B4513', isSpecial: true, trajectory: 'special' });
    }
    if (document.getElementById('compare-noprecisa')?.checked) {
        entitiesToShow.push({ name: 'No precisa', color: '#6c5ce7', isSpecial: true, trajectory: 'special' });
    }

    // Map trajectory type to Plotly marker symbol
    const getMarkerSymbol = (trajectory) => {
        switch (trajectory) {
            case 'complete': return 'circle';
            case 'moderate': return 'diamond';
            case 'sporadic': return 'star';
            case 'special': return 'square';
            default: return 'circle';
        }
    };

    // Map trajectory type to line style
    const getLineStyle = (trajectory, isSpecial) => {
        if (isSpecial) {
            return { width: 2, dash: 'dot' };
        }
        switch (trajectory) {
            case 'complete': return { width: 4, dash: 'solid' };
            case 'moderate': return { width: 3, dash: 'dash' };
            case 'sporadic': return { width: 2, dash: 'dot' };
            default: return { width: 3, dash: 'solid' };
        }
    };

    const traces = [];

    entitiesToShow.forEach((entity) => {
        const xValues = [];
        const yValues = [];
        const isSpecial = entity.isSpecial || false;
        const dataKey = DIMENSION_DATA_MAP[dimension] || dimension;

        monthOrder.forEach(month => {
            let searchName = entity.name;
            if (entity.name === 'Blanco/viciado') searchName = 'Blanco/viciado/ninguno';

            const candidate = data[month].candidates.find(c => c.name === searchName);
            if (candidate && candidate[dataKey] && candidate[dataKey][segment] !== undefined) {
                xValues.push(month);
                yValues.push(candidate[dataKey][segment]);
            }
        });

        if (xValues.length > 0) {
            const lineStyle = getLineStyle(entity.trajectory, isSpecial);
            const markerSymbol = getMarkerSymbol(entity.trajectory);
            const shortName = entity.name.split(' ').slice(0, 2).join(' ').replace('/viciado/ninguno', '');

            traces.push({
                x: xValues,
                y: yValues,
                name: shortName,
                type: 'scatter',
                mode: 'lines+markers',
                line: { width: lineStyle.width, dash: lineStyle.dash, shape: 'spline', smoothing: 1.1, color: entity.color },
                marker: { size: 10, symbol: markerSymbol, line: { width: 1, color: '#fff' }, color: entity.color },
                connectgaps: true,
                hovertemplate: `<b>${shortName}</b>: %{y:.1f}%<extra></extra>`,
                hoverlabel: {
                    bgcolor: entity.color,
                    bordercolor: entity.color,
                    font: { color: '#ffffff', size: 11, family: 'Inter, sans-serif' }
                }
            });
        }
    });

    const isMobile = window.innerWidth <= 768;
    const layout = {
        template: 'plotly_white',
        title: { text: `${getDimensionLabel(dimension)} - Segmento: ${segment}`, font: { size: isMobile ? 13 : 15, family: 'Inter, sans-serif' } },
        margin: isMobile ? { l: 40, r: 10, t: 40, b: 60 } : { l: 60, r: 20, t: 50, b: 70 },
        height: isMobile ? 350 : 500,
        showlegend: false, // Using sidebar legend instead
        hovermode: 'x',
        hoverdistance: 50,
        xaxis: {
            tickangle: 0,
            categoryorder: 'array',
            categoryarray: monthOrder,
            tickvals: monthOrder,
            ticktext: monthOrder.map(m => (isMobile ? MONTH_LABELS_MOBILE[m] : MONTH_DISPLAY_LABELS[m]) || m),
            tickfont: { size: isMobile ? 10 : 12 },
            gridcolor: 'rgba(0,0,0,0.04)',
            showspikes: true,
            spikemode: 'across',
            spikesnap: 'cursor',
            spikecolor: 'rgba(0,0,0,0.3)',
            spikethickness: 1,
            spikedash: 'dot'
        },
        yaxis: { title: 'Intención de Voto (%)', gridcolor: 'rgba(0,0,0,0.06)', ticksuffix: '%' },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { family: 'Inter, sans-serif' }
    };

    // Disable zoom/pan on mobile
    if (isMobile) {
        layout.xaxis.fixedrange = true;
        layout.yaxis.fixedrange = true;
        layout.dragmode = false;
    }

    Plotly.newPlot('comparative-chart', traces, layout, { responsive: true, displayModeBar: false });
}

function getDimensionLabel(dim) {
    const labels = {
        nse: 'NSE',
        gender: 'Género',
        age: 'Edad',
        ambito: 'Ámbito',
        interior: 'Interior',
        region: 'Región'
    };
    return labels[dim] || dim;
}

function updateSegmentSelector() {
    const dimension = document.getElementById('dimension-select').value;
    const segmentSelect = document.getElementById('segment-select');
    segmentSelect.innerHTML = '';

    SEGMENTS[dimension].forEach(seg => {
        const option = document.createElement('option');
        option.value = seg;
        option.textContent = seg;
        segmentSelect.appendChild(option);
    });
}

function populateCandidateCheckboxes() {
    const container = document.getElementById('candidates-legend-list');
    if (!container) return;
    container.innerHTML = '';

    let colorIndex = 0;

    // Helper to format name with line break for long names
    const formatName = (name) => {
        const parts = name.split(' ');
        if (parts.length <= 2) return name;
        // Split into two lines: first name + second word, rest on second line
        const firstLine = parts.slice(0, 2).join(' ');
        const secondLine = parts.slice(2).join(' ');
        return `${firstLine}<br>${secondLine}`;
    };

    // Helper to create legend icon SVG (matches main chart style)
    const createMarkerSVG = (type, color) => {
        switch (type) {
            case 'complete':
                return `<svg class="legend-icon" viewBox="0 0 28 18" width="28" height="18">
                    <line x1="2" y1="9" x2="26" y2="9" stroke="${color}" stroke-width="3"/>
                    <circle cx="14" cy="9" r="5" fill="${color}"/>
                </svg>`;
            case 'moderate':
                return `<svg class="legend-icon" viewBox="0 0 28 18" width="28" height="18">
                    <line x1="2" y1="9" x2="26" y2="9" stroke="${color}" stroke-width="2" stroke-dasharray="4,2"/>
                    <polygon points="14,3 20,9 14,15 8,9" fill="${color}"/>
                </svg>`;
            case 'sporadic':
                return `<svg class="legend-icon" viewBox="0 0 28 18" width="28" height="18">
                    <line x1="2" y1="9" x2="26" y2="9" stroke="${color}" stroke-width="2" stroke-dasharray="2,2"/>
                    <path d="M14 2 L15.5 7 L21 7 L16.5 10 L18 15 L14 12 L10 15 L11.5 10 L7 7 L12.5 7 Z" fill="${color}"/>
                </svg>`;
            default:
                return `<span class="legend-color" style="background: ${color};"></span>`;
        }
    };

    // Helper to create a candidate item
    const createCandidateItem = (candidateName, isChecked, trajectoryType) => {
        const label = document.createElement('label');
        label.className = 'legend-item';
        const color = getCandidateColor(candidateName, colorIndex);
        if (!CANDIDATE_COLORS[candidateName] && !SPECIAL_COLORS[candidateName] && !EXCLUDED_CANDIDATES.includes(candidateName)) {
            colorIndex++;
        }

        const markerHTML = createMarkerSVG(trajectoryType, color);

        // Asset lookup
        const assets = CANDIDATE_ASSETS[candidateName] || {};
        const photoSrc = assets.photo ? `${PHOTO_BASE_PATH}${assets.photo}` : null;
        const logoSrc = assets.logo ? `${LOGO_BASE_PATH}${assets.logo}` : null;

        let photoHTML = photoSrc
            ? `<img class="legend-photo" src="${photoSrc}" alt="${candidateName}" onerror="this.style.visibility='hidden'">`
            : `<div class="legend-photo" style="background:${color}; display:flex; align-items:center; justify-content:center; color:white; font-size:10px;">${candidateName.charAt(0)}</div>`;

        let logoHTML = logoSrc
            ? `<img class="legend-party-logo" src="${logoSrc}" alt="Partido">`
            : '';

        label.innerHTML = `
            <input type="checkbox" name="compare-candidate" value="${candidateName}" ${isChecked ? 'checked' : ''} data-color="${color}" data-trajectory="${trajectoryType}">
            ${photoHTML}
            <div class="legend-info">
                <span class="legend-name">${candidateName}</span>
                ${logoHTML}
            </div>
            ${markerHTML}
        `;
        label.querySelector('input').addEventListener('change', () => {
            updateSelectAllState();
            renderDemographicCharts();
        });
        return label;
    };

    // Helper to create section header
    const createSectionHeader = (title) => {
        const header = document.createElement('div');
        header.className = 'legend-section-title';
        header.textContent = title;
        return header;
    };

    // Render complete trajectory candidates (first 3 checked by default)
    candidateData.complete.forEach((name, idx) => {
        container.appendChild(createCandidateItem(name, idx < 3, 'complete'));
    });

    // Render moderate trajectory with header
    if (candidateData.moderate.length > 0) {
        container.appendChild(createSectionHeader('Trayectoria Moderada'));
        candidateData.moderate.forEach(name => {
            container.appendChild(createCandidateItem(name, false, 'moderate'));
        });
    }

    // Render sporadic trajectory with header
    if (candidateData.sporadic.length > 0) {
        container.appendChild(createSectionHeader('Aparición Esporádica'));
        candidateData.sporadic.forEach(name => {
            container.appendChild(createCandidateItem(name, false, 'sporadic'));
        });
    }

    updateSelectAllState();
}

function updateSelectAllState() {
    const allCheckboxes = document.querySelectorAll('#candidates-legend-list input[type="checkbox"]');
    const checkedCount = document.querySelectorAll('#candidates-legend-list input[type="checkbox"]:checked').length;
    const selectAllCheckbox = document.getElementById('select-all-candidates');

    if (selectAllCheckbox) {
        selectAllCheckbox.checked = checkedCount === allCheckboxes.length;
        selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < allCheckboxes.length;
    }
}

function toggleAllCandidates(checked) {
    document.querySelectorAll('#candidates-legend-list input[type="checkbox"]').forEach(cb => {
        cb.checked = checked;
    });
    renderDemographicCharts();
}

function getDemographicData(candidatesToShow, demoType) {
    const traces = [];
    let traceIndex = 0;

    candidatesToShow.forEach(candidateName => {
        const segments = new Set();
        monthOrder.forEach(month => {
            const candidate = data[month].candidates.find(c => c.name === candidateName);
            if (candidate && candidate[demoType]) {
                Object.keys(candidate[demoType]).forEach(s => segments.add(s));
            }
        });

        segments.forEach(segment => {
            const xValues = [];
            const yValues = [];

            monthOrder.forEach(month => {
                const candidate = data[month].candidates.find(c => c.name === candidateName);
                if (candidate && candidate[demoType] && candidate[demoType][segment] !== undefined) {
                    xValues.push(month);
                    yValues.push(candidate[demoType][segment]);
                }
            });

            if (xValues.length > 0) {
                const label = candidatesToShow.length > 1
                    ? `${candidateName.split(' ')[0]} - ${segment}`
                    : segment;

                const dataPoints = xValues.length;
                traces.push({
                    x: xValues,
                    y: yValues,
                    name: label,
                    type: 'scatter',
                    mode: dataPoints <= 2 ? 'markers' : 'lines+markers',
                    line: {
                        width: 2.5,
                        shape: 'spline',
                        smoothing: 1.1,
                        color: COLOR_PALETTE[traceIndex % COLOR_PALETTE.length]
                    },
                    marker: {
                        size: dataPoints <= 2 ? 12 : 8,
                        symbol: dataPoints <= 2 ? 'star' : 'circle',
                        line: { width: 1, color: '#fff' }
                    },
                    connectgaps: true
                });
                traceIndex++;
            }
        });
    });

    return traces;
}

function renderGenderChart(candidatesToShow, layout) {
    const traces = getDemographicData(candidatesToShow, 'gender');
    Plotly.newPlot('gender-chart', traces, { ...layout, title: { text: '👫 Género', font: { size: 14 } } }, { responsive: true, displayModeBar: false });
}

function renderNSEChart(candidatesToShow, layout) {
    const traces = getDemographicData(candidatesToShow, 'nse');
    Plotly.newPlot('nse-chart', traces, { ...layout, title: { text: '💰 Nivel Socioeconómico', font: { size: 14 } } }, { responsive: true, displayModeBar: false });
}

function renderAgeChart(candidatesToShow, layout) {
    const traces = getDemographicData(candidatesToShow, 'age');
    Plotly.newPlot('age-chart', traces, { ...layout, title: { text: '🎂 Rango de Edad', font: { size: 14 } } }, { responsive: true, displayModeBar: false });
}

function renderGeoBasicChart(candidatesToShow, layout) {
    const traces = [];
    let traceIndex = 0;

    candidatesToShow.forEach(candidateName => {
        const geoSegments = ['Lima', 'Interior'];

        geoSegments.forEach(segment => {
            const xValues = [];
            const yValues = [];

            monthOrder.forEach(month => {
                const candidate = data[month].candidates.find(c => c.name === candidateName);
                if (candidate && candidate.geography && candidate.geography[segment] !== undefined) {
                    xValues.push(month);
                    yValues.push(candidate.geography[segment]);
                }
            });

            if (xValues.length > 0) {
                const displaySegment = segment === 'Interior Urbano' ? 'Int. Urbano' :
                    segment === 'Interior Rural' ? 'Int. Rural' : segment;
                const label = candidatesToShow.length > 1 ? `${candidateName.split(' ')[0]} - ${displaySegment}` : displaySegment;
                const dataPoints = xValues.length;

                traces.push({
                    x: xValues,
                    y: yValues,
                    name: label,
                    type: 'scatter',
                    mode: dataPoints <= 2 ? 'markers' : 'lines+markers',
                    line: { width: 2.5, shape: 'spline', smoothing: 1.1, color: COLOR_PALETTE[traceIndex % COLOR_PALETTE.length] },
                    marker: { size: dataPoints <= 2 ? 12 : 8, symbol: dataPoints <= 2 ? 'star' : 'circle', line: { width: 1, color: '#fff' } },
                    connectgaps: true
                });
                traceIndex++;
            }
        });
    });

    Plotly.newPlot('geo-ambito-chart', traces, { ...layout, title: { text: '🏙️ Ámbito (Lima vs Interior)', font: { size: 14 } } }, { responsive: true, displayModeBar: false });
}

function renderGeoRegionChart(candidatesToShow, layout) {
    const traces = [];
    let traceIndex = 0;

    candidatesToShow.forEach(candidateName => {
        const regionSegments = ['Norte', 'Centro', 'Sur', 'Oriente'];

        regionSegments.forEach(segment => {
            const xValues = [];
            const yValues = [];

            monthOrder.forEach(month => {
                const candidate = data[month].candidates.find(c => c.name === candidateName);
                if (candidate && candidate.geography && candidate.geography[segment] !== undefined) {
                    xValues.push(month);
                    yValues.push(candidate.geography[segment]);
                }
            });

            if (xValues.length > 0) {
                const label = candidatesToShow.length > 1 ? `${candidateName.split(' ')[0]} - ${segment}` : segment;
                const dataPoints = xValues.length;

                traces.push({
                    x: xValues,
                    y: yValues,
                    name: label,
                    type: 'scatter',
                    mode: dataPoints <= 2 ? 'markers' : 'lines+markers',
                    line: { width: 2.5, shape: 'spline', smoothing: 1.1, color: COLOR_PALETTE[traceIndex % COLOR_PALETTE.length] },
                    marker: { size: dataPoints <= 2 ? 12 : 8, symbol: dataPoints <= 2 ? 'star' : 'circle', line: { width: 1, color: '#fff' } },
                    connectgaps: true
                });
                traceIndex++;
            }
        });
    });

    Plotly.newPlot('geo-region-chart', traces, { ...layout, title: { text: '🗺️ Regiones', font: { size: 14 } } }, { responsive: true, displayModeBar: false });
}

// =============================================
// Event Listeners
// =============================================
function setupEventListeners() {
    // Main chart controls
    ['show-blanco', 'show-otros', 'show-noprecisa', 'show-excluded'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            focusedCandidates = []; // Reset focus on category change
            renderMainChart();
            renderCustomLegend();
        });
    });

    // Demographic chart controls
    document.getElementById('candidate-select').addEventListener('change', renderDemographicCharts);

    // Analysis mode toggle
    document.querySelectorAll('input[name="analysis-mode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const isComparative = e.target.value === 'comparative';

            // Toggle candidate selector style: dropdown hidden in comparative mode
            document.getElementById('candidate-select').style.display = isComparative ? 'none' : 'block';
            const candidatesCheckboxes = document.getElementById('candidates-checkboxes');
            if (candidatesCheckboxes) {
                candidatesCheckboxes.style.display = isComparative ? 'flex' : 'none';
            }
            document.getElementById('candidate-label').textContent = isComparative ? '' : 'Candidato:';

            // Hide candidate control group entirely in comparative mode (selection is in sidebar)
            document.getElementById('candidate-control-group').style.display = isComparative ? 'none' : 'flex';

            // Show/hide comparative-only controls
            document.getElementById('comparative-controls').style.display = isComparative ? 'block' : 'none';
            document.getElementById('segment-controls').style.display = isComparative ? 'block' : 'none';

            // Initialize selectors if switching to comparative
            if (isComparative) {
                updateSegmentSelector();
                populateCandidateCheckboxes();
            }

            renderDemographicCharts();
        });
    });

    // Dimension selector (for comparative mode)
    document.getElementById('dimension-select').addEventListener('change', () => {
        updateSegmentSelector();
        renderDemographicCharts();
    });

    // Segment selector (for comparative mode)
    document.getElementById('segment-select').addEventListener('change', renderDemographicCharts);

    // Select All checkbox (for comparative mode sidebar)
    const selectAllCheckbox = document.getElementById('select-all-candidates');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            toggleAllCandidates(e.target.checked);
        });
    }

    // Compare special categories checkboxes (in sidebar)
    ['compare-blanco', 'compare-otros', 'compare-noprecisa'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', renderDemographicCharts);
        }
    });

    // Click outside legend to reset focus (main chart)
    document.getElementById('main-chart').addEventListener('click', (e) => {
        if (e.target.closest('.legend-item')) return;
        if (focusedCandidates.length > 0) {
            focusedCandidates = [];
            renderMainChart();
            renderCustomLegend();
        }
    });
}

