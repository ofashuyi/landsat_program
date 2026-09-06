const MISSION_CATALOG_URL = "/api/mission-catalog";
const DATA_GUIDE_URL = "/api/data-guide";
const APPLICATION_CATALOG_URL = "/api/application-catalog";
const BAND_CATALOG_URL = "/api/band-catalog";
const STUDIO_CATALOG_URL = "/api/studio-catalog";
const LEARNING_CATALOG_URL = "/api/learning-catalog";

let missions = [];
let filters = [];
let missionCatalogLoaded = false;
let workflowGuides = {};
let workflowRecommendations = {};
let dataGuideLoaded = false;
let impactStories = [];
let complementaryMissions = [];
let applicationCatalogLoaded = false;
let bandPresets = [];
let bandCatalogLoaded = false;
let studioHotspots = [];
let studioOptions = {
    basemaps: [],
    satellites: [],
    viewModes: []
};
let studioModeDetails = {};
let studioCatalogLoaded = false;
let orbitModes = [];
let resolutionModes = [];
let learningCatalogLoaded = false;

const filterRow = document.getElementById("filter-row");
const missionGrid = document.getElementById("mission-grid");
const searchInput = document.getElementById("mission-search");
const sortSelect = document.getElementById("mission-sort");

const detailImage = document.getElementById("detail-image");
const detailEyebrow = document.getElementById("detail-eyebrow");
const detailTitle = document.getElementById("detail-title");
const detailSummary = document.getElementById("detail-summary");
const detailHighlight = document.getElementById("detail-highlight");
const detailGrid = document.getElementById("detail-grid");
const compareSelection = document.getElementById("compare-selection");
const compareGrid = document.getElementById("compare-grid");
const compareClearButton = document.getElementById("compare-clear");
const orbitModesContainer = document.getElementById("orbit-modes");
const orbitFacts = document.getElementById("orbit-facts");
const orbitTitle = document.getElementById("orbit-title");
const orbitDescription = document.getElementById("orbit-description");
const orbitCaption = document.getElementById("orbit-caption");
const resolutionTabs = document.getElementById("resolution-tabs");
const resolutionTitle = document.getElementById("resolution-title");
const resolutionDescription = document.getElementById("resolution-description");
const resolutionFacts = document.getElementById("resolution-facts");
const resolutionVisual = document.getElementById("resolution-visual");
const bandPresetList = document.getElementById("band-preset-list");
const bandViewer = document.getElementById("band-viewer");
const impactFilters = document.getElementById("impact-filters");
const impactHero = document.getElementById("impact-hero");
const complementGrid = document.getElementById("complement-grid");
const workflowQuestions = document.getElementById("workflow-questions");
const workflowResult = document.getElementById("workflow-result");
const studioBasemap = document.getElementById("studio-basemap");
const studioSatellite = document.getElementById("studio-satellite");
const studioViewmode = document.getElementById("studio-viewmode");
const studioCustomBands = document.getElementById("studio-custom-bands");
const studioBandR = document.getElementById("studio-band-r");
const studioBandG = document.getElementById("studio-band-g");
const studioBandB = document.getElementById("studio-band-b");
const studioMapTarget = document.getElementById("studio-map");
const studioHotspotsContainer = document.getElementById("studio-hotspots");
const studioYearSlider = document.getElementById("studio-year-slider");
const studioYearLabel = document.getElementById("studio-year-label");
const studioYearNote = document.getElementById("studio-year-note");
const studioCloudSlider = document.getElementById("studio-cloud-slider");
const studioCloudLabel = document.getElementById("studio-cloud-label");
const studioPopupTitle = document.getElementById("studio-popup-title");
const studioPopupCopy = document.getElementById("studio-popup-copy");
const studioMapCaption = document.getElementById("studio-map-caption");
const studioSpectralTitle = document.getElementById("studio-spectral-title");
const studioSpectralChart = document.getElementById("studio-spectral-chart");
const studioHoverProbe = document.getElementById("studio-hover-probe");
const studioSpectralCopy = document.getElementById("studio-spectral-copy");
const studioIndexTitle = document.getElementById("studio-index-title");
const studioIndexCard = document.getElementById("studio-index-card");
const studioHistoryTitle = document.getElementById("studio-history-title");
const studioHistoryMetrics = document.getElementById("studio-history-metrics");
const studioHistoryCopy = document.getElementById("studio-history-copy");
const studioScenesList = document.getElementById("studio-scenes-list");
const studioSceneDetail = document.getElementById("studio-scene-detail");
const studioPixelInspector = document.getElementById("studio-pixel-inspector");
const satellites = {
    "satellite-a": document.getElementById("satellite-a"),
    "satellite-b": document.getElementById("satellite-b"),
    "satellite-c": document.getElementById("satellite-c"),
    "satellite-d": document.getElementById("satellite-d"),
    "satellite-e": document.getElementById("satellite-e")
};

let activeFilter = "all";
let activeMissionId = "landsat9";
let comparedMissionIds = ["landsat8", "landsat9"];
let activeOrbitMode = "pair";
let activeResolutionMode = "spatial";
let activeBandPresetId = "false-vegetation";
let activeImpactId = "water";
let activeComplementId = "sentinel2";
let workflowState = {
    task: "time-series",
    scale: "single-scene",
    priority: "simplicity"
};
let orbitAnimationFrame = null;
let studioState = {
    basemap: "imagery",
    satellite: "landsat",
    viewMode: "vegetation",
    hotspotId: "las-vegas",
    yearIndex: 3,
    cloudMax: 20,
    scenes: [],
    selectedSceneId: null,
    loadingScenes: false,
    sceneLoadError: false,
    customBands: { r: "red", g: "green", b: "blue" }
};
const BAND_KEY_LABELS = {
    blue: "Blue",
    green: "Green",
    red: "Red",
    nir: "NIR",
    swir1: "SWIR-1",
    swir2: "SWIR-2",
    thermal: "Thermal"
};
let studioMap = null;
let studioBaseLayers = {};
let studioVectorSource = null;
let studioHotspotLayer = null;
let studioActiveLayer = null;
let studioSceneSource = null;
let studioSceneLayer = null;
let studioHotspotFeatures = {};
let studioActiveFeature = null;
let studioSceneRequestToken = 0;
let studioSceneLoadTimer = null;
let studioRasterLayer = null;
let studioRasterMessage = "Select a real returned scene to attempt raster rendering from its STAC assets.";
let studioRasterDescriptor = null;
let studioPixelSample = null;
let studioHoverSample = null;
let studioHoverPixel = null;
let studioHoverCoordinate = null;
let studioHoverFrame = null;
let studioMapResizeObserver = null;

const STUDIO_STAC_SEARCH_URL = "/api/landsat-scenes/search";
const STUDIO_STAC_COLLECTIONS = ["landsat-c2-l2"];

function isReady(...elements) {
    return elements.every(Boolean);
}

async function loadLearningCatalog() {
    if (learningCatalogLoaded) {
        return true;
    }

    try {
        const response = await fetch(LEARNING_CATALOG_URL);
        if (!response.ok) {
            throw new Error(`Learning catalog request failed with ${response.status}`);
        }

        const catalog = await response.json();
        orbitModes = Array.isArray(catalog.orbitModes) ? catalog.orbitModes : [];
        resolutionModes = Array.isArray(catalog.resolutionModes) ? catalog.resolutionModes : [];

        if (!orbitModes.some((mode) => mode.id === activeOrbitMode) && orbitModes.length > 0) {
            activeOrbitMode = orbitModes[0].id;
        }

        if (!resolutionModes.some((mode) => mode.id === activeResolutionMode) && resolutionModes.length > 0) {
            activeResolutionMode = resolutionModes[0].id;
        }

        learningCatalogLoaded = orbitModes.length > 0 && resolutionModes.length > 0;
        return learningCatalogLoaded;
    } catch (error) {
        console.warn(error);
        if (orbitDescription) {
            orbitDescription.textContent = "Orbit lab data could not be loaded. Refresh the page or try again after the server is available.";
        }
        if (resolutionDescription) {
            resolutionDescription.textContent = "Resolution lab data could not be loaded. Refresh the page or try again after the server is available.";
        }
        return false;
    }
}

function getActiveOrbitMode() {
    return orbitModes.find((mode) => mode.id === activeOrbitMode) || orbitModes[0] || null;
}

function getActiveResolutionMode() {
    return resolutionModes.find((mode) => mode.id === activeResolutionMode) || resolutionModes[0] || null;
}

async function loadMissionCatalog() {
    if (missionCatalogLoaded) {
        return true;
    }

    try {
        const response = await fetch(MISSION_CATALOG_URL);
        if (!response.ok) {
            throw new Error(`Mission catalog request failed with ${response.status}`);
        }

        const catalog = await response.json();
        missions = Array.isArray(catalog.missions) ? catalog.missions : [];
        filters = Array.isArray(catalog.filters) ? catalog.filters : [];
        comparedMissionIds = comparedMissionIds.filter((missionId) => missions.some((mission) => mission.id === missionId));

        if (!missions.some((mission) => mission.id === activeMissionId) && missions.length > 0) {
            activeMissionId = missions[0].id;
        }

        missionCatalogLoaded = true;
        return true;
    } catch (error) {
        console.warn(error);
        if (missionGrid) {
            missionGrid.innerHTML = "";
            const empty = document.createElement("p");
            empty.className = "body-copy";
            empty.textContent = "Mission catalog data could not be loaded. Refresh the page or try again after the server is available.";
            missionGrid.appendChild(empty);
        }
        return false;
    }
}

function statusClass(status) {
    if (status === "active") return "status-pill status-active";
    if (status === "archive") return "status-pill status-archive";
    return "status-pill status-ended";
}

function renderFilters() {
    filterRow.innerHTML = "";
    filters.forEach((filter) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "chip-button";
        button.setAttribute("aria-pressed", String(activeFilter === filter.id));
        button.textContent = filter.label;
        button.addEventListener("click", () => {
            activeFilter = filter.id;
            renderFilters();
            renderMissionCards();
        });
        filterRow.appendChild(button);
    });
}

function getFilteredMissions() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = missions.filter((mission) => {
        if (activeFilter === "active" && mission.status !== "active") return false;
        if (activeFilter === "current" && mission.era !== "current") return false;
        if (activeFilter === "modern" && !["modern", "current"].includes(mission.era)) return false;
        if (activeFilter === "early" && !["early", "middle"].includes(mission.era)) return false;
        if (!query) return true;
        const haystack = [
            mission.name,
            mission.sensors,
            mission.short,
            mission.summary,
            mission.highlight,
            mission.keywords.join(" ")
        ].join(" ").toLowerCase();
        return haystack.includes(query);
    });

    filtered.sort((a, b) => (sortSelect.value === "asc" ? a.year - b.year : b.year - a.year));
    return filtered;
}

function renderMissionCards() {
    const filtered = getFilteredMissions();
    missionGrid.innerHTML = "";

    if (!filtered.some((mission) => mission.id === activeMissionId) && filtered.length > 0) {
        activeMissionId = filtered[0].id;
        renderMissionDetail(filtered[0]);
    }

    if (filtered.length === 0) {
        const empty = document.createElement("p");
        empty.className = "body-copy";
        empty.textContent = "No missions match that search. Try a sensor name like OLI, ETM+, or MSS.";
        missionGrid.appendChild(empty);
        return;
    }

    filtered.forEach((mission) => {
        const card = document.createElement("article");
        card.className = "mission-card"
            + (mission.id === activeMissionId ? " active" : "")
            + (comparedMissionIds.includes(mission.id) ? " compare-selected" : "");
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.setAttribute("aria-pressed", String(mission.id === activeMissionId));
        card.innerHTML = `
            <div class="card-top">
                <h3>${mission.name}</h3>
                <span class="${statusClass(mission.status)}">${mission.statusLabel}</span>
            </div>
            <p>${mission.short}</p>
            <div class="chips">
                <span class="chip">${mission.launchDate}</span>
                <span class="chip">${mission.sensors}</span>
                <span class="chip">${mission.revisit}</span>
            </div>
            <div class="card-actions">
                <span class="chip">${comparedMissionIds.includes(mission.id) ? "In compare" : "Single view"}</span>
                <button class="compare-toggle" type="button" aria-pressed="${comparedMissionIds.includes(mission.id)}">
                    ${comparedMissionIds.includes(mission.id) ? "Remove compare" : "Add compare"}
                </button>
            </div>
        `;
        card.addEventListener("click", (event) => {
            if (event.target.closest(".compare-toggle")) {
                return;
            }
            activeMissionId = mission.id;
            renderMissionCards();
            renderMissionDetail(mission);
        });
        card.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }
            if (event.target.closest(".compare-toggle")) {
                return;
            }
            event.preventDefault();
            activeMissionId = mission.id;
            renderMissionCards();
            renderMissionDetail(mission);
        });
        card.querySelector(".compare-toggle").addEventListener("click", (event) => {
            event.stopPropagation();
            toggleComparedMission(mission.id);
        });
        missionGrid.appendChild(card);
    });
}

function renderMissionDetail(mission) {
    detailImage.src = mission.image;
    detailImage.alt = mission.name + " mission image";
    detailEyebrow.textContent = mission.statusLabel;
    detailTitle.textContent = mission.name;
    detailSummary.textContent = mission.summary;
    detailHighlight.textContent = mission.highlight;
    detailGrid.innerHTML = `
        <div class="detail-item">
            <span>Launch date</span>
            <strong>${mission.launchDate}</strong>
        </div>
        <div class="detail-item">
            <span>Sensors</span>
            <strong>${mission.sensors}</strong>
        </div>
        <div class="detail-item">
            <span>Revisit cadence</span>
            <strong>${mission.revisit}</strong>
        </div>
        <div class="detail-item">
            <span>Resolution</span>
            <strong>${mission.resolution}</strong>
        </div>
    `;
}

function toggleComparedMission(missionId) {
    if (comparedMissionIds.includes(missionId)) {
        comparedMissionIds = comparedMissionIds.filter((id) => id !== missionId);
    } else if (comparedMissionIds.length < 3) {
        comparedMissionIds = [...comparedMissionIds, missionId];
    } else {
        comparedMissionIds = [...comparedMissionIds.slice(1), missionId];
    }

    renderMissionCards();
    renderCompareSelection();
    renderCompareGrid();
}

function renderCompareSelection() {
    compareSelection.innerHTML = "";

    for (let index = 0; index < 3; index += 1) {
        const missionId = comparedMissionIds[index];

        if (!missionId) {
            const empty = document.createElement("div");
            empty.className = "compare-slot compare-slot-empty";
            empty.textContent = `Slot ${index + 1}: add a mission to compare`;
            compareSelection.appendChild(empty);
            continue;
        }

        const mission = missions.find((item) => item.id === missionId);
        const slot = document.createElement("div");
        slot.className = "compare-slot";
        slot.innerHTML = `
            <span>${mission.name}</span>
            <button class="compare-remove" type="button" aria-label="Remove ${mission.name} from comparison">&times;</button>
        `;
        slot.querySelector(".compare-remove").addEventListener("click", () => {
            toggleComparedMission(mission.id);
        });
        compareSelection.appendChild(slot);
    }

    compareClearButton.disabled = comparedMissionIds.length === 0;
}

function renderCompareGrid() {
    compareGrid.innerHTML = "";

    if (comparedMissionIds.length === 0) {
        const empty = document.createElement("div");
        empty.className = "compare-empty";
        empty.textContent = "Add two or three missions from the explorer above to build a side-by-side comparison.";
        compareGrid.appendChild(empty);
        return;
    }

    comparedMissionIds
        .map((missionId) => missions.find((mission) => mission.id === missionId))
        .filter(Boolean)
        .forEach((mission) => {
            const card = document.createElement("article");
            card.className = "compare-card";
            card.innerHTML = `
                <img src="${mission.image}" alt="${mission.name} mission image">
                <div class="${statusClass(mission.status)}">${mission.statusLabel}</div>
                <div>
                    <h4>${mission.name}</h4>
                    <p>${mission.short}</p>
                </div>
                <div class="compare-specs">
                    <div class="compare-spec">
                        <span>Launch date</span>
                        <strong>${mission.launchDate}</strong>
                    </div>
                    <div class="compare-spec">
                        <span>Sensors</span>
                        <strong>${mission.sensors}</strong>
                    </div>
                    <div class="compare-spec">
                        <span>Revisit cadence</span>
                        <strong>${mission.revisit}</strong>
                    </div>
                    <div class="compare-spec">
                        <span>Resolution</span>
                        <strong>${mission.resolution}</strong>
                    </div>
                </div>
                <p>${mission.highlight}</p>
            `;
            compareGrid.appendChild(card);
        });
}

function setSatellitePosition(element, radius, angleDegrees, scale = 1) {
    const angle = (angleDegrees * Math.PI) / 180;
    const x = Math.cos(angle) * radius * scale;
    const y = Math.sin(angle) * radius * scale;
    element.style.setProperty("--tx", `${x}px`);
    element.style.setProperty("--ty", `${y}px`);
}

function renderOrbitFacts() {
    const mode = getActiveOrbitMode();
    if (!mode) {
        orbitFacts.innerHTML = "";
        orbitDescription.textContent = "Orbit lab data is not available yet.";
        return;
    }

    orbitModesContainer.innerHTML = orbitModes.map((orbitMode) => `
        <button class="mode-button ${orbitMode.id === activeOrbitMode ? "active" : ""}" type="button" data-mode="${orbitMode.id}" aria-pressed="${orbitMode.id === activeOrbitMode}">${orbitMode.label}</button>
    `).join("");
    orbitTitle.textContent = mode.title;
    orbitDescription.textContent = mode.description;
    orbitCaption.textContent = mode.caption;
    orbitFacts.innerHTML = mode.facts.map((fact) => `
        <div class="orbit-fact">
            <span>${fact.label}</span>
            <strong>${fact.value}</strong>
        </div>
    `).join("") + (mode.lesson ? `
        <div class="orbit-fact">
            <span>Tutor note</span>
            <strong>${mode.lesson}</strong>
        </div>
    ` : "");
}

function animateOrbits() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    const scales = () => {
        const viewport = window.innerWidth;
        if (viewport < 820) return 0.7;
        if (viewport < 1200) return 0.82;
        return 1;
    };

    const tick = (now) => {
        const elapsed = reducedMotion ? 0 : (now - start) / 1000;
        const scale = scales();
        const positions = {
            "satellite-a": { radius: 200, angle: elapsed * 30 - 90 },
            "satellite-b": { radius: 200, angle: elapsed * 30 + 90 },
            "satellite-c": { radius: 235, angle: elapsed * 18 - 20 },
            "satellite-d": { radius: 235, angle: elapsed * 18 + 120 },
            "satellite-e": { radius: 270, angle: elapsed * 18 + 230 }
        };

        Object.entries(satellites).forEach(([id, element]) => {
            const visible = (getActiveOrbitMode()?.visible || []).includes(id);
            element.style.opacity = visible ? "1" : "0";
            element.style.pointerEvents = visible ? "auto" : "none";
            if (visible) {
                setSatellitePosition(element, positions[id].radius, positions[id].angle, scale);
            }
        });

        if (!reducedMotion) {
            orbitAnimationFrame = requestAnimationFrame(tick);
        }
    };

    if (orbitAnimationFrame) {
        cancelAnimationFrame(orbitAnimationFrame);
    }
    orbitAnimationFrame = requestAnimationFrame(tick);
}

async function initializeOrbitLab() {
    if (
        !isReady(orbitModesContainer, orbitFacts, orbitTitle, orbitDescription, orbitCaption)
        || Object.values(satellites).some((element) => !element)
    ) {
        return;
    }

    const learningCatalogReady = await loadLearningCatalog();
    if (!learningCatalogReady) {
        return;
    }

    renderOrbitFacts();
    animateOrbits();
    orbitModesContainer.addEventListener("click", (event) => {
        const button = event.target.closest(".mode-button");
        if (!button) {
            return;
        }
        activeOrbitMode = button.dataset.mode;
        renderOrbitFacts();
    });
}

function renderResolutionVisual(mode) {
    if (mode.visualType === "spatial") {
        const pixelCount = mode.pixelCount || 0;
        const coarseEvery = mode.coarseEvery || 0;
        const cards = mode.cards || [];

        return `
            <div class="spatial-visual">
                <div class="pixel-demo">
                    ${Array.from({ length: pixelCount }, (_, index) => `<div class="pixel-cell ${coarseEvery > 0 && index % coarseEvery === 0 ? "coarse" : ""}"></div>`).join("")}
                </div>
                <div class="resolution-scale">
                    ${cards.map((card) => `
                        <div class="scale-card">
                            <strong>${card.title}</strong>
                            <p>${card.text}</p>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    }

    if (mode.visualType === "spectral") {
        return `
            <div class="spectral-visual">
                <div class="band-stack">
                    ${(mode.bands || []).map((band) => `<div class="band-bar ${band.className}">${band.label}</div>`).join("")}
                </div>
                <div class="resolution-scale">
                    ${(mode.cards || []).map((card) => `
                        <div class="band-card">
                            <strong>${card.title}</strong>
                            <p>${card.text}</p>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    }

    if (mode.visualType === "temporal") {
        return `
            <div class="temporal-visual">
                ${(mode.timelines || []).map((timeline) => `
                    <div class="timeline-card">
                        <strong>${timeline.title}</strong>
                        <div class="timeline">
                            ${Array.from({ length: timeline.length }, (_, index) => `<span class="timeline-dot ${(timeline.activeIndexes || []).includes(index) ? "active" : ""}"></span>`).join("")}
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    if (mode.visualType === "radiometric") {
        return `
            <div class="radiometric-visual">
                <div class="tone-stack">
                    ${(mode.tones || []).map((tone) => `
                        <div class="tone-card">
                            <strong>${tone.title}</strong>
                            <div class="tone-bar ${tone.className}">${tone.label}</div>
                        </div>
                    `).join("")}
                </div>
                <div class="impact-story-card">
                    ${mode.story || ""}
                </div>
            </div>
        `;
    }

    return `<p class="body-copy">No visual is available for this resolution mode.</p>`;
}

function renderResolutionMode() {
    const mode = getActiveResolutionMode();
    if (!mode) {
        resolutionFacts.innerHTML = "";
        resolutionVisual.innerHTML = "";
        resolutionDescription.textContent = "Resolution lab data is not available yet.";
        return;
    }

    resolutionTabs.innerHTML = resolutionModes.map((resolutionMode) => `
        <button class="resolution-tab ${resolutionMode.id === activeResolutionMode ? "active" : ""}" type="button" data-resolution="${resolutionMode.id}" aria-pressed="${resolutionMode.id === activeResolutionMode}">${resolutionMode.label}</button>
    `).join("");
    resolutionTitle.textContent = mode.title;
    resolutionDescription.textContent = mode.description;
    resolutionFacts.innerHTML = mode.facts.map((fact) => `
        <div class="resolution-fact">
            <span>${fact.label}</span>
            <strong>${fact.value}</strong>
        </div>
    `).join("");
    resolutionVisual.innerHTML = renderResolutionVisual(mode);
    if (mode.teacherNote) {
        resolutionVisual.insertAdjacentHTML("beforeend", `
            <div class="impact-story-card">
                <strong>Tutor note:</strong> ${mode.teacherNote}
            </div>
        `);
    }
}

async function initializeResolutionLab() {
    if (!isReady(resolutionTabs, resolutionTitle, resolutionDescription, resolutionFacts, resolutionVisual)) {
        return;
    }

    const learningCatalogReady = await loadLearningCatalog();
    if (!learningCatalogReady) {
        return;
    }

    renderResolutionMode();
    resolutionTabs.addEventListener("click", (event) => {
        const button = event.target.closest(".resolution-tab");
        if (!button) {
            return;
        }
        activeResolutionMode = button.dataset.resolution;
        renderResolutionMode();
    });
}

function renderBandPresetList() {
    bandPresetList.innerHTML = "";
    if (bandPresets.length === 0) {
        bandPresetList.innerHTML = `<p class="body-copy">Band presets are not available yet.</p>`;
        return;
    }

    bandPresets.forEach((preset) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "band-preset" + (preset.id === activeBandPresetId ? " active" : "");
        button.setAttribute("aria-pressed", String(preset.id === activeBandPresetId));
        button.innerHTML = `
            <strong>${preset.name}</strong>
            <p>${preset.combo}</p>
        `;
        button.addEventListener("click", () => {
            activeBandPresetId = preset.id;
            renderBandPresetList();
            renderBandViewer();
        });
        bandPresetList.appendChild(button);
    });
}

function renderBandViewer() {
    const preset = bandPresets.find((item) => item.id === activeBandPresetId);
    if (!preset) {
        bandViewer.innerHTML = `<p class="body-copy">No band preset is available for this selection.</p>`;
        return;
    }

    bandViewer.innerHTML = `
        <div class="band-stage">
            <div class="band-scene">
                <div class="band-overlay-grid"></div>
            </div>
            <div class="band-detail">
                <h3>${preset.name}</h3>
                <p>${preset.why}</p>
            </div>
            <div class="band-legend">
                <div class="band-legend-item">
                    <span>Band recipe</span>
                    <strong>${preset.combo}</strong>
                </div>
                <div class="band-legend-item">
                    <span>Best for</span>
                    <strong>${preset.goodFor}</strong>
                </div>
                <div class="band-legend-item">
                    <span>Watch out for</span>
                    <strong>${preset.caution}</strong>
                </div>
            </div>
            ${preset.lesson ? `
                <div class="impact-story-card">
                    <strong>Lesson:</strong> ${preset.lesson}
                </div>
            ` : ""}
            ${preset.practice ? `
                <div class="impact-story-card">
                    <strong>Practice:</strong> ${preset.practice}
                </div>
            ` : ""}
        </div>
    `;

    const scene = bandViewer.querySelector(".band-scene");
    scene.style.setProperty("--land-a", preset.colors.landA);
    scene.style.setProperty("--land-b", preset.colors.landB);
    scene.style.setProperty("--land-c", preset.colors.landC);
    scene.style.setProperty("--land-d", preset.colors.landD);
    scene.style.setProperty("--water", preset.colors.water);
    scene.style.setProperty("--city", preset.colors.city);
    scene.style.setProperty("--scar", preset.colors.scar);
}

async function loadBandCatalog() {
    if (bandCatalogLoaded) {
        return true;
    }

    try {
        const response = await fetch(BAND_CATALOG_URL);
        if (!response.ok) {
            throw new Error(`Band catalog request failed with ${response.status}`);
        }

        const catalog = await response.json();
        bandPresets = Array.isArray(catalog.presets) ? catalog.presets : [];

        if (!bandPresets.some((preset) => preset.id === activeBandPresetId) && bandPresets.length > 0) {
            activeBandPresetId = bandPresets[0].id;
        }

        bandCatalogLoaded = true;
        return true;
    } catch (error) {
        console.warn(error);
        bandPresetList.innerHTML = `<p class="body-copy">Band presets could not be loaded. Refresh the page or try again after the server is available.</p>`;
        bandViewer.innerHTML = "";
        return false;
    }
}

async function initializeBandLab() {
    if (!isReady(bandPresetList, bandViewer)) {
        return;
    }

    const bandCatalogReady = await loadBandCatalog();
    if (!bandCatalogReady) {
        return;
    }

    renderBandPresetList();
    renderBandViewer();
}

async function loadApplicationCatalog() {
    if (applicationCatalogLoaded) {
        return true;
    }

    try {
        const response = await fetch(APPLICATION_CATALOG_URL);
        if (!response.ok) {
            throw new Error(`Application catalog request failed with ${response.status}`);
        }

        const catalog = await response.json();
        impactStories = Array.isArray(catalog.impactStories) ? catalog.impactStories : [];
        complementaryMissions = Array.isArray(catalog.complementaryMissions) ? catalog.complementaryMissions : [];

        if (!impactStories.some((story) => story.id === activeImpactId) && impactStories.length > 0) {
            activeImpactId = impactStories[0].id;
        }

        if (!complementaryMissions.some((mission) => mission.id === activeComplementId) && complementaryMissions.length > 0) {
            activeComplementId = complementaryMissions[0].id;
        }

        applicationCatalogLoaded = true;
        return true;
    } catch (error) {
        console.warn(error);
        impactHero.innerHTML = `<p class="body-copy">Application stories could not be loaded. Refresh the page or try again after the server is available.</p>`;
        complementGrid.innerHTML = "";
        return false;
    }
}

function renderImpactFilters() {
    impactFilters.innerHTML = "";
    impactStories.forEach((story) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "impact-filter" + (story.id === activeImpactId ? " active" : "");
        button.setAttribute("aria-pressed", String(story.id === activeImpactId));
        button.textContent = story.label;
        button.addEventListener("click", () => {
            activeImpactId = story.id;
            renderImpactFilters();
            renderImpactHero();
        });
        impactFilters.appendChild(button);
    });
}

function renderImpactHero() {
    const story = impactStories.find((item) => item.id === activeImpactId);
    if (!story) {
        impactHero.innerHTML = `<p class="body-copy">No application story is available yet.</p>`;
        return;
    }

    impactHero.innerHTML = `
        <div class="impact-card">
            <div>
                <h3>${story.title}</h3>
                <p class="body-copy">${story.summary}</p>
            </div>
            <div class="impact-metrics">
                ${story.metrics.map((metric) => `
                    <div class="impact-metric">
                        <strong>${metric.value}</strong>
                        <span>${metric.label}</span>
                    </div>
                `).join("")}
            </div>
            <div class="impact-story-card">
                ${story.story}
            </div>
            ${story.question ? `
                <div class="impact-story-card">
                    <strong>Question:</strong> ${story.question}
                </div>
            ` : ""}
            ${story.workflow ? `
                <div class="impact-story-card">
                    <strong>Workflow:</strong> ${story.workflow}
                </div>
            ` : ""}
            ${story.limitation ? `
                <div class="impact-story-card">
                    <strong>Limitation:</strong> ${story.limitation}
                </div>
            ` : ""}
        </div>
    `;
}

function renderComplements() {
    complementGrid.innerHTML = "";
    if (complementaryMissions.length === 0) {
        complementGrid.innerHTML = `<p class="body-copy">No complementary missions are available yet.</p>`;
        return;
    }

    complementaryMissions.forEach((mission) => {
        const card = document.createElement("article");
        card.className = "complement-card" + (mission.id === activeComplementId ? " active" : "");
        card.innerHTML = `
            <strong>${mission.name}</strong>
            <p>${mission.id === activeComplementId ? mission.detail : mission.short}</p>
        `;
        card.addEventListener("click", () => {
            activeComplementId = mission.id;
            renderComplements();
        });
        complementGrid.appendChild(card);
    });
}

async function initializeImpactStudio() {
    if (!isReady(impactFilters, impactHero, complementGrid)) {
        return;
    }

    const applicationCatalogReady = await loadApplicationCatalog();
    if (!applicationCatalogReady) {
        return;
    }

    renderImpactFilters();
    renderImpactHero();
    renderComplements();
}

async function loadDataGuideCatalog() {
    if (dataGuideLoaded) {
        return true;
    }

    try {
        const response = await fetch(DATA_GUIDE_URL);
        if (!response.ok) {
            throw new Error(`Data guide request failed with ${response.status}`);
        }

        const catalog = await response.json();
        workflowGuides = catalog.guides && typeof catalog.guides === "object" ? catalog.guides : {};
        workflowRecommendations = catalog.recommendations && typeof catalog.recommendations === "object"
            ? catalog.recommendations
            : {};
        dataGuideLoaded = true;
        return true;
    } catch (error) {
        console.warn(error);
        workflowQuestions.innerHTML = `<p class="body-copy">The products guide could not be loaded. Refresh the page or try again after the server is available.</p>`;
        workflowResult.innerHTML = "";
        return false;
    }
}

function getWorkflowRecommendation() {
    const key = `${workflowState.task}|${workflowState.scale}|${workflowState.priority}`;
    return workflowRecommendations[key];
}

function renderWorkflowQuestions() {
    workflowQuestions.innerHTML = `
        <div class="workflow-choices">
            ${Object.entries(workflowGuides).map(([groupId, options]) => `
                <div class="workflow-choice-group">
                    <h3>${groupId === "task" ? "1. What are you trying to do?" : groupId === "scale" ? "2. How big is the workflow?" : "3. What matters more?"}</h3>
                    <div class="workflow-options-grid">
                        ${options.map((option) => `
                            <button class="workflow-option ${workflowState[groupId] === option.id ? "active" : ""}" type="button" data-group="${groupId}" data-id="${option.id}" aria-pressed="${workflowState[groupId] === option.id}">
                                <strong>${option.title}</strong>
                                <p>${option.text}</p>
                            </button>
                        `).join("")}
                    </div>
                </div>
            `).join("")}
        </div>
    `;

    workflowQuestions.querySelectorAll(".workflow-option").forEach((button) => {
        button.addEventListener("click", () => {
            workflowState = {
                ...workflowState,
                [button.dataset.group]: button.dataset.id
            };
            renderWorkflowQuestions();
            renderWorkflowResult();
        });
    });
}

function renderWorkflowResult() {
    const recommendation = getWorkflowRecommendation();
    if (!recommendation) {
        workflowResult.innerHTML = `<p class="body-copy">No recommendation is available for this combination yet.</p>`;
        return;
    }

    const task = workflowGuides.task?.find((item) => item.id === workflowState.task);
    const scale = workflowGuides.scale?.find((item) => item.id === workflowState.scale);
    const priority = workflowGuides.priority?.find((item) => item.id === workflowState.priority);

    workflowResult.innerHTML = `
        <div class="workflow-recommendation">
            <div>
                <div class="eyebrow">Recommended Starting Point</div>
                <h3>${recommendation.product}</h3>
                <p>${recommendation.why}</p>
            </div>
            <div class="workflow-pills">
                <div class="workflow-pill">
                    <span>Confidence</span>
                    <strong>${recommendation.confidence}</strong>
                </div>
                <div class="workflow-pill">
                    <span>Best for</span>
                    <strong>${recommendation.bestFor}</strong>
                </div>
                <div class="workflow-pill">
                    <span>Tradeoff</span>
                    <strong>${recommendation.tradeoff}</strong>
                </div>
            </div>
            <div class="workflow-metrics">
                <div class="workflow-metric">
                    <span>Task</span>
                    <strong>${task?.title || workflowState.task}</strong>
                </div>
                <div class="workflow-metric">
                    <span>Scale</span>
                    <strong>${scale?.title || workflowState.scale}</strong>
                </div>
                <div class="workflow-metric">
                    <span>Priority</span>
                    <strong>${priority?.title || workflowState.priority}</strong>
                </div>
            </div>
            <div class="impact-story-card">
                <strong>Next step:</strong> ${recommendation.nextStep}
            </div>
            ${recommendation.teachingTip ? `
                <div class="impact-story-card">
                    <strong>Teaching tip:</strong> ${recommendation.teachingTip}
                </div>
            ` : ""}
        </div>
    `;
}

async function initializeWorkflowGuide() {
    if (!isReady(workflowQuestions, workflowResult)) {
        return;
    }

    const dataGuideReady = await loadDataGuideCatalog();
    if (!dataGuideReady) {
        return;
    }

    renderWorkflowQuestions();
    renderWorkflowResult();
}

async function loadStudioCatalog() {
    if (studioCatalogLoaded) {
        return true;
    }

    try {
        const response = await fetch(STUDIO_CATALOG_URL);
        if (!response.ok) {
            throw new Error(`Studio catalog request failed with ${response.status}`);
        }

        const catalog = await response.json();
        studioHotspots = Array.isArray(catalog.hotspots) ? catalog.hotspots : [];
        studioOptions = catalog.options && typeof catalog.options === "object"
            ? {
                basemaps: Array.isArray(catalog.options.basemaps) ? catalog.options.basemaps : [],
                satellites: Array.isArray(catalog.options.satellites) ? catalog.options.satellites : [],
                viewModes: Array.isArray(catalog.options.viewModes) ? catalog.options.viewModes : []
            }
            : { basemaps: [], satellites: [], viewModes: [] };
        studioModeDetails = catalog.modeDetails && typeof catalog.modeDetails === "object" ? catalog.modeDetails : {};

        if (!studioHotspots.some((hotspot) => hotspot.id === studioState.hotspotId) && studioHotspots.length > 0) {
            studioState.hotspotId = studioHotspots[0].id;
        }

        const hotspot = getStudioHotspot();
        if (hotspot) {
            studioState.yearIndex = Math.min(studioState.yearIndex, Math.max(hotspot.years.length - 1, 0));
        }

        if (!studioOptions.basemaps.some((item) => item.id === studioState.basemap) && studioOptions.basemaps.length > 0) {
            studioState.basemap = studioOptions.basemaps[0].id;
        }

        if (!studioOptions.satellites.some((item) => item.id === studioState.satellite) && studioOptions.satellites.length > 0) {
            studioState.satellite = studioOptions.satellites[0].id;
        }

        if (!studioOptions.viewModes.some((item) => item.id === studioState.viewMode) && studioOptions.viewModes.length > 0) {
            studioState.viewMode = studioOptions.viewModes[0].id;
        }

        studioCatalogLoaded = studioHotspots.length > 0 && Object.keys(studioModeDetails).length > 0;
        return studioCatalogLoaded;
    } catch (error) {
        console.warn(error);
        studioMapCaption.textContent = "Studio configuration could not be loaded. Refresh the page or try again after the server is available.";
        return false;
    }
}

function getStudioHotspot() {
    return studioHotspots.find((item) => item.id === studioState.hotspotId) || studioHotspots[0] || null;
}

function getStudioYearRecord() {
    const hotspot = getStudioHotspot();
    if (!hotspot || hotspot.years.length === 0) {
        return null;
    }

    return hotspot.years[Math.min(studioState.yearIndex, hotspot.years.length - 1)];
}

function getSceneCloudCover(item) {
    const properties = item.properties || {};
    return properties["eo:cloud_cover"]
        ?? properties["landsat:cloud_cover_land"]
        ?? properties.cloud_cover
        ?? properties["landsat:scene_cloud_cover"]
        ?? 999;
}

function getScenePlatformLabel(item) {
    const properties = item.properties || {};
    return properties.platform || properties["landsat:platform"] || properties.constellation || "Landsat";
}

function getSceneBrowseHref(item) {
    const assets = item.assets || {};
    const candidates = [
        "rendered_preview",
        "thumbnail",
        "browse",
        "preview",
        "reduced_resolution_browse"
    ];
    for (const key of candidates) {
        const href = getPreferredAssetHref(assets[key]);
        if (href) {
            return href;
        }
    }
    return null;
}

function getSceneAssetKeys(item) {
    return Object.keys(item.assets || {}).filter((key) => !["mtl.txt", "mtl.xml"].includes(key)).slice(0, 12);
}

function getPreferredAssetHref(asset) {
    if (!asset) {
        return null;
    }

    const candidates = [asset.href];
    if (asset.alternate && typeof asset.alternate === "object") {
        Object.values(asset.alternate).forEach((alternateAsset) => {
            candidates.push(alternateAsset?.href);
        });
    }

    return candidates.find((href) => typeof href === "string" && /^https?:\/\//i.test(href)) || null;
}

function geometryToFeature(geometry, item) {
    if (!geometry) {
        return null;
    }
    const feature = new ol.format.GeoJSON().readFeature({
        type: "Feature",
        geometry: geometry,
        properties: {
            sceneId: item.id,
            type: "scene"
        }
    }, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857"
    });
    return feature;
}

function getSelectedScene() {
    return studioState.scenes.find((scene) => scene.id === studioState.selectedSceneId) || null;
}

function formatSampleNumber(value) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return "n/a";
    }
    return Number(value).toFixed(3);
}

function computeNormalizedDifference(a, b) {
    const denominator = a + b;
    if (!Number.isFinite(a) || !Number.isFinite(b) || denominator === 0) {
        return null;
    }
    return (a - b) / denominator;
}

function describePixelSample(sampleMap) {
    switch (studioState.viewMode) {
        case "vegetation":
            return {
                label: "NDVI",
                value: computeNormalizedDifference(sampleMap.nir, sampleMap.red),
                explanation: "Computed from the clicked pixel's near-infrared and red reflectance values."
            };
        case "water":
            return {
                label: "NDWI",
                value: computeNormalizedDifference(sampleMap.green, sampleMap.nir),
                explanation: "Computed from the clicked pixel's green and near-infrared reflectance values."
            };
        case "burn":
            return {
                label: "NBR",
                value: computeNormalizedDifference(sampleMap.nir, sampleMap.swir2),
                explanation: "Computed from the clicked pixel's near-infrared and SWIR-2 reflectance values."
            };
        case "urban":
            return {
                label: "NDBI",
                value: computeNormalizedDifference(sampleMap.swir1, sampleMap.nir),
                explanation: "Computed from the clicked pixel's SWIR-1 and near-infrared reflectance values."
            };
        case "thermal":
            return {
                label: "Thermal relative intensity",
                value: sampleMap.thermal,
                explanation: "This is the normalized thermal-band intensity returned by the browser-side raster renderer."
            };
        default:
            return {
                label: "Rendered channels",
                value: null,
                explanation: "This view reports the clicked display bands rather than a normalized-difference index."
            };
    }
}

function getSceneAsset(scene, aliases) {
    if (!scene?.raw?.assets) {
        return null;
    }
    const assets = scene.raw.assets;
    const normalized = Object.keys(assets).reduce((accumulator, key) => {
        accumulator[key.toLowerCase()] = assets[key];
        return accumulator;
    }, {});

    for (const alias of aliases) {
        const asset = normalized[alias.toLowerCase()];
        if (asset) {
            return asset;
        }
    }
    return null;
}

function getSceneAssetHref(scene, aliases) {
    return getPreferredAssetHref(getSceneAsset(scene, aliases));
}

function sceneUsesRequesterPaysAssets(scene, aliases) {
    const asset = getSceneAsset(scene, aliases);
    return Boolean(asset?.href && /^s3:\/\//i.test(asset.href) && !getPreferredAssetHref(asset));
}

function getSceneBandAssets(scene) {
    return {
        blue: getSceneAssetHref(scene, ["blue", "sr_b2", "b2"]),
        green: getSceneAssetHref(scene, ["green", "sr_b3", "b3"]),
        red: getSceneAssetHref(scene, ["red", "sr_b4", "b4"]),
        nir: getSceneAssetHref(scene, ["nir08", "nir", "sr_b5", "b5"]),
        swir1: getSceneAssetHref(scene, ["swir16", "swir_1", "swir1", "sr_b6", "b6"]),
        swir2: getSceneAssetHref(scene, ["swir22", "swir_2", "swir2", "sr_b7", "b7"]),
        thermal: getSceneAssetHref(scene, ["lwir11", "st_b10", "thermal", "bt_band10", "b10"])
    };
}

function createReflectanceSource(urls) {
    return new ol.source.GeoTIFF({
        normalize: true,
        sources: urls.map((url) => ({
            url,
            max: 10000
        }))
    });
}

function getStudioRasterConfig(scene) {
    const assets = getSceneBandAssets(scene);
    const requesterPaysOnly =
        (studioState.viewMode === "natural" && (
            sceneUsesRequesterPaysAssets(scene, ["red", "sr_b4", "b4"]) ||
            sceneUsesRequesterPaysAssets(scene, ["green", "sr_b3", "b3"]) ||
            sceneUsesRequesterPaysAssets(scene, ["blue", "sr_b2", "b2"])
        )) ||
        (studioState.viewMode === "vegetation" && (
            sceneUsesRequesterPaysAssets(scene, ["nir08", "nir", "sr_b5", "b5"]) ||
            sceneUsesRequesterPaysAssets(scene, ["red", "sr_b4", "b4"]) ||
            sceneUsesRequesterPaysAssets(scene, ["green", "sr_b3", "b3"])
        )) ||
        (studioState.viewMode === "water" && (
            sceneUsesRequesterPaysAssets(scene, ["green", "sr_b3", "b3"]) ||
            sceneUsesRequesterPaysAssets(scene, ["nir08", "nir", "sr_b5", "b5"])
        )) ||
        (studioState.viewMode === "burn" && (
            sceneUsesRequesterPaysAssets(scene, ["nir08", "nir", "sr_b5", "b5"]) ||
            sceneUsesRequesterPaysAssets(scene, ["swir22", "swir_2", "swir2", "sr_b7", "b7"])
        )) ||
        (studioState.viewMode === "urban" && (
            sceneUsesRequesterPaysAssets(scene, ["swir16", "swir_1", "swir1", "sr_b6", "b6"]) ||
            sceneUsesRequesterPaysAssets(scene, ["nir08", "nir", "sr_b5", "b5"])
        )) ||
        (studioState.viewMode === "thermal" &&
            sceneUsesRequesterPaysAssets(scene, ["lwir11", "st_b10", "thermal", "bt_band10", "b10"])) ||
        (studioState.viewMode === "custom" && (
            sceneUsesRequesterPaysAssets(scene, [studioState.customBands.r]) ||
            sceneUsesRequesterPaysAssets(scene, [studioState.customBands.g]) ||
            sceneUsesRequesterPaysAssets(scene, [studioState.customBands.b])
        ));

    if (requesterPaysOnly) {
        studioRasterMessage = "This scene only exposes requester-pays S3 band assets, which cannot be loaded directly in this browser-only client. The footprint and scene metadata are still available.";
        return null;
    }

    switch (studioState.viewMode) {
        case "natural":
            if (!assets.red || !assets.green || !assets.blue) {
                return null;
            }
            return {
                source: createReflectanceSource([assets.red, assets.green, assets.blue]),
                descriptor: {
                    mode: "natural",
                    bands: ["red", "green", "blue"]
                },
                style: {
                    color: ["array", ["band", 1], ["band", 2], ["band", 3], 1],
                    gamma: 1.1
                },
                message: "Rendering actual Landsat scene reflectance as a natural-color composite."
            };
        case "vegetation":
            if (!assets.nir || !assets.red || !assets.green) {
                return null;
            }
            return {
                source: createReflectanceSource([assets.nir, assets.red, assets.green]),
                descriptor: {
                    mode: "vegetation",
                    bands: ["nir", "red", "green"]
                },
                style: {
                    color: ["array", ["band", 1], ["band", 2], ["band", 3], 1],
                    gamma: 1.1
                },
                message: "Rendering actual Landsat scene reflectance as a color-infrared vegetation composite."
            };
        case "water": {
            if (!assets.green || !assets.nir) {
                return null;
            }
            const green = ["band", 1];
            const nir = ["band", 2];
            const ndwi = ["/", ["-", green, nir], ["+", green, nir]];
            return {
                source: createReflectanceSource([assets.green, assets.nir]),
                descriptor: {
                    mode: "water",
                    bands: ["green", "nir"]
                },
                style: {
                    color: [
                        "interpolate",
                        ["linear"],
                        ndwi,
                        -0.3, [130, 110, 80],
                        -0.05, [220, 205, 176],
                        0.1, [145, 198, 219],
                        0.3, [82, 164, 214],
                        0.6, [21, 96, 189]
                    ]
                },
                message: "Rendering an NDWI-like water/moisture view from the selected scene's green and near-infrared bands."
            };
        }
        case "burn": {
            if (!assets.nir || !assets.swir2) {
                return null;
            }
            const nir = ["band", 1];
            const swir2 = ["band", 2];
            const nbr = ["/", ["-", nir, swir2], ["+", nir, swir2]];
            return {
                source: createReflectanceSource([assets.nir, assets.swir2]),
                descriptor: {
                    mode: "burn",
                    bands: ["nir", "swir2"]
                },
                style: {
                    color: [
                        "interpolate",
                        ["linear"],
                        nbr,
                        -0.5, [75, 31, 15],
                        -0.1, [173, 65, 31],
                        0.1, [235, 170, 91],
                        0.3, [196, 210, 132],
                        0.6, [84, 130, 53]
                    ]
                },
                message: "Rendering an NBR-like burn and recovery view from the selected scene's NIR and SWIR-2 bands."
            };
        }
        case "urban": {
            if (!assets.swir1 || !assets.nir) {
                return null;
            }
            const swir1 = ["band", 1];
            const nir = ["band", 2];
            const ndbi = ["/", ["-", swir1, nir], ["+", swir1, nir]];
            return {
                source: createReflectanceSource([assets.swir1, assets.nir]),
                descriptor: {
                    mode: "urban",
                    bands: ["swir1", "nir"]
                },
                style: {
                    color: [
                        "interpolate",
                        ["linear"],
                        ndbi,
                        -0.4, [61, 120, 72],
                        0.0, [214, 206, 178],
                        0.2, [189, 153, 102],
                        0.4, [145, 103, 66],
                        0.6, [110, 79, 56]
                    ]
                },
                message: "Rendering an NDBI-like urban intensity view from the selected scene's SWIR-1 and NIR bands."
            };
        }
        case "thermal":
            if (!assets.thermal) {
                return null;
            }
            return {
                source: new ol.source.GeoTIFF({
                    normalize: true,
                    sources: [{ url: assets.thermal, max: 65535 }]
                }),
                descriptor: {
                    mode: "thermal",
                    bands: ["thermal"]
                },
                style: {
                    color: [
                        "interpolate",
                        ["linear"],
                        ["band", 1],
                        0.1, [44, 78, 143],
                        0.3, [79, 151, 210],
                        0.5, [247, 205, 95],
                        0.7, [234, 124, 63],
                        0.9, [164, 32, 24]
                    ]
                },
                message: "Rendering a thermal-style raster from the selected scene asset when a thermal-compatible band is exposed."
            };
        case "custom": {
            const { r, g, b } = studioState.customBands;
            const rAsset = assets[r];
            const gAsset = assets[g];
            const bAsset = assets[b];
            if (!rAsset || !gAsset || !bAsset) {
                return null;
            }
            return {
                source: createReflectanceSource([rAsset, gAsset, bAsset]),
                descriptor: {
                    mode: "custom",
                    bands: [r, g, b]
                },
                style: {
                    color: ["array", ["band", 1], ["band", 2], ["band", 3], 1],
                    gamma: 1.1
                },
                message: `Rendering a custom composite: red = ${BAND_KEY_LABELS[r]}, green = ${BAND_KEY_LABELS[g]}, blue = ${BAND_KEY_LABELS[b]}.`
            };
        }
        default:
            return null;
    }
}

function renderStudioChoiceButtons(container, items, activeId, onSelect) {
    container.innerHTML = "";
    items.forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "studio-chip" + (item.id === activeId ? " active" : "");
        button.setAttribute("aria-pressed", String(item.id === activeId));
        button.textContent = item.label;
        button.addEventListener("click", () => onSelect(item.id));
        container.appendChild(button);
    });
}

function renderStudioHotspots() {
    studioHotspotsContainer.innerHTML = "";
    studioHotspots.forEach((hotspot) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "studio-hotspot-button" + (hotspot.id === studioState.hotspotId ? " active" : "");
        button.setAttribute("aria-pressed", String(hotspot.id === studioState.hotspotId));
        button.innerHTML = `
            <strong>${hotspot.name}</strong>
            <span>${hotspot.short}</span>
        `;
        button.addEventListener("click", () => {
            studioState.hotspotId = hotspot.id;
            studioState.yearIndex = hotspot.years.length - 1;
            renderStudio();
            zoomStudioToHotspot();
            scheduleStudioSceneLoad(0);
        });
        studioHotspotsContainer.appendChild(button);
    });
}

function getStudioModeIndexDetails(modeId, yearRecord) {
    const mode = studioModeDetails[modeId];
    const indexKey = {
        vegetation: "ndvi",
        water: "ndwi",
        burn: "nbr",
        urban: "ndbi",
        thermal: "lst"
    }[modeId];

    if (!indexKey) {
        return {
            label: "RGB context",
            value: "Visual",
            context: mode.indexContext
        };
    }

    const rawValue = yearRecord.indices[indexKey];
    return {
        label: indexKey.toUpperCase(),
        value: indexKey === "lst" ? `${rawValue.toFixed(0)} C signal` : rawValue.toFixed(2),
        context: mode.indexContext
    };
}

function renderStudioPanels() {
    const hotspot = getStudioHotspot();
    const yearRecord = getStudioYearRecord();
    const mode = studioModeDetails[studioState.viewMode];
    const satellite = studioOptions.satellites.find((item) => item.id === studioState.satellite);
    const indexDetails = getStudioModeIndexDetails(studioState.viewMode, yearRecord);

    studioYearSlider.max = String(hotspot.years.length - 1);
    studioYearSlider.value = String(studioState.yearIndex);
    studioYearLabel.textContent = String(yearRecord.year);
    studioYearNote.textContent = yearRecord.note;
    studioCloudLabel.textContent = `${studioState.cloudMax}%`;

    studioPopupTitle.textContent = `${hotspot.name} | ${yearRecord.year}`;
    studioPopupCopy.textContent = `${yearRecord.note} ${satellite.note}.`;
    studioMapCaption.textContent = `${mode.title} view over ${hotspot.name}. Use the map to pan globally, then return to hotspots for curated temporal interpretation.`;

    studioSpectralTitle.textContent = `${mode.title} signature`;
    studioSpectralCopy.textContent = mode.copy;
    studioSpectralChart.innerHTML = mode.spectral.map((entry) => `
        <div class="studio-spectral-row">
            <span>${entry.label}</span>
            <strong>${entry.value}% relative response cue</strong>
            <div class="studio-bar-track"><div class="studio-bar-fill" data-width="${entry.value}"></div></div>
        </div>
    `).join("");
    studioSpectralChart.querySelectorAll(".studio-bar-fill").forEach((bar) => {
        bar.style.setProperty("--bar-width", `${bar.dataset.width}%`);
    });

    studioIndexTitle.textContent = indexDetails.label;
    studioIndexCard.innerHTML = `
        <div class="studio-index-row">
            <span>Current reading</span>
            <strong class="studio-index-value">${indexDetails.value}</strong>
            <div class="studio-index-context">${indexDetails.context}</div>
        </div>
        <div class="studio-index-row">
            <span>Satellite context</span>
            <strong>${satellite.label}</strong>
            <div class="studio-index-context">${satellite.note}</div>
        </div>
    `;

    studioHistoryTitle.textContent = `${hotspot.name} through time`;
    studioHistoryMetrics.innerHTML = [
        { label: "Vegetation signal", value: `${yearRecord.metrics.vegetation}%` },
        { label: "Water signal", value: `${yearRecord.metrics.water}%` },
        { label: "Urban intensity", value: `${yearRecord.metrics.urban}%` },
        { label: "Heat signal", value: `${yearRecord.metrics.heat}` },
        { label: "Disturbance", value: `${yearRecord.metrics.disturbance}%` }
    ].map((metric) => `
        <div class="studio-history-metric">
            <span>${metric.label}</span>
            <strong>${metric.value}</strong>
        </div>
    `).join("");
    studioHistoryCopy.textContent = `${hotspot.short}. ${yearRecord.note}`;
}

function renderStudioScenesList() {
    if (studioState.loadingScenes) {
        studioScenesList.innerHTML = `
            <div class="studio-scene-empty studio-scene-loading">
                <strong>Searching the Landsat STAC catalog</strong>
                <p>Checking this hotspot, year, and cloud threshold for usable scene metadata.</p>
            </div>
        `;
        return;
    }

    if (studioState.sceneLoadError) {
        studioScenesList.innerHTML = `
            <div class="studio-scene-empty">
                <strong>Couldn't reach the Landsat STAC catalog</strong>
                <p>The scene search request failed. Check your connection and try again, or adjust the filters to retry.</p>
            </div>
        `;
        return;
    }

    if (studioState.scenes.length === 0) {
        studioScenesList.innerHTML = `
            <div class="studio-scene-empty">
                <strong>No scenes matched this filter</strong>
                <p>Raise the cloud threshold, choose another year, or switch hotspots to broaden the search.</p>
            </div>
        `;
        return;
    }

    studioScenesList.innerHTML = studioState.scenes.map((scene) => `
        <button class="studio-scene-button ${scene.id === studioState.selectedSceneId ? "active" : ""}" type="button" data-scene-id="${scene.id}" aria-pressed="${scene.id === studioState.selectedSceneId}">
            <strong>${scene.id}</strong>
            <p>${scene.dateLabel} | ${scene.platformLabel} | Cloud ${scene.cloudCover}%</p>
        </button>
    `).join("");

    studioScenesList.querySelectorAll(".studio-scene-button").forEach((button) => {
        button.addEventListener("click", () => {
            studioState.selectedSceneId = button.dataset.sceneId;
            renderStudioScenesList();
            updateStudioSceneStyles();
            updateStudioRasterLayer();
        });
    });
}

function renderStudioSceneDetail() {
    if (studioState.loadingScenes) {
        studioSceneDetail.innerHTML = `<div class="studio-scene-empty studio-scene-loading">Waiting for scene metadata...</div>`;
        return;
    }

    if (studioState.sceneLoadError) {
        studioSceneDetail.innerHTML = `<div class="studio-scene-empty">The scene search failed, so there is nothing to inspect yet. Try again once the catalog request succeeds.</div>`;
        return;
    }

    const scene = getSelectedScene();
    if (!scene) {
        studioSceneDetail.innerHTML = `<div class="studio-scene-empty">Select a returned scene to inspect its actual footprint, browse product, and available assets.</div>`;
        return;
    }

    const thumb = scene.browseHref ? `<img class="studio-scene-thumb" src="${scene.browseHref}" alt="${scene.id} browse image">` : `<div class="studio-scene-empty">No browse preview exposed in the returned assets.</div>`;
    studioSceneDetail.innerHTML = `
        <div class="studio-scene-card">
            ${thumb}
        </div>
        <div class="studio-scene-meta">
            <strong>${scene.id}</strong>
            <p>${scene.description}</p>
        </div>
        <div class="studio-scene-metrics">
            <div class="studio-history-metric">
                <span>Date</span>
                <strong>${scene.dateLabel}</strong>
            </div>
            <div class="studio-history-metric">
                <span>Cloud cover</span>
                <strong>${scene.cloudCover}%</strong>
            </div>
            <div class="studio-history-metric">
                <span>Satellite</span>
                <strong>${scene.platformLabel}</strong>
            </div>
        </div>
        <div class="studio-scene-assets">
            <strong>Available asset keys</strong>
            <div class="studio-asset-chips">
                ${scene.assetKeys.map((key) => `<span class="studio-asset-chip">${key}</span>`).join("")}
            </div>
            <p>${studioRasterMessage}</p>
        </div>
    `;
}

function renderStudioPixelInspector() {
    if (!studioPixelSample) {
        studioPixelInspector.innerHTML = `<div class="studio-scene-empty">Click inside a rendered scene area on the map to inspect that pixel's current band values and derived index behavior.</div>`;
        return;
    }

    const sampleEntries = Object.entries(studioPixelSample.sampleMap).map(([key, value]) => `
        <div class="studio-history-metric">
            <span>${key}</span>
            <strong>${formatSampleNumber(value)}</strong>
        </div>
    `).join("");

    const derivedValue = studioPixelSample.derived.value === null ? "n/a" : formatSampleNumber(studioPixelSample.derived.value);
    studioPixelInspector.innerHTML = `
        <div class="studio-scene-meta">
            <strong>${studioPixelSample.sceneId}</strong>
            <p>Sampled at lon ${studioPixelSample.lon.toFixed(4)}, lat ${studioPixelSample.lat.toFixed(4)} in the current ${studioState.viewMode} render mode.</p>
        </div>
        <div class="studio-pixel-grid">
            ${sampleEntries}
        </div>
        <div class="studio-index-row">
            <span>${studioPixelSample.derived.label}</span>
            <strong class="studio-index-value">${derivedValue}</strong>
            <div class="studio-index-context">${studioPixelSample.derived.explanation}</div>
        </div>
    `;
}

function getStudioPixelSample(pixel, coordinate) {
    if (!studioRasterLayer || !studioRasterDescriptor) {
        return null;
    }

    const data = studioRasterLayer.getData(pixel);
    if (!data || !data.length) {
        return null;
    }

    const sampleMap = {};
    studioRasterDescriptor.bands.forEach((bandName, index) => {
        sampleMap[bandName] = Number(data[index]);
    });

    const lonLat = ol.proj.toLonLat(coordinate);
    return {
        sceneId: studioState.selectedSceneId,
        lon: lonLat[0],
        lat: lonLat[1],
        sampleMap,
        derived: describePixelSample(sampleMap)
    };
}

function buildStudioHoverRows(sampleMap) {
    const entries = Object.entries(sampleMap);
    const maxValue = entries.reduce((highest, [, value]) => (
        Number.isFinite(value) ? Math.max(highest, Math.abs(value)) : highest
    ), 0);

    return entries.map(([key, value]) => {
        const width = maxValue === 0 ? 0 : Math.max(6, (Math.abs(value) / maxValue) * 100);
        return `
            <div class="studio-hover-row">
                <header>
                    <span>${key}</span>
                    <strong>${formatSampleNumber(value)}</strong>
                </header>
                <div class="studio-bar-track"><div class="studio-bar-fill" data-width="${width.toFixed(1)}"></div></div>
            </div>
        `;
    }).join("");
}

function paintStudioBars(root) {
    if (!root) {
        return;
    }
    root.querySelectorAll(".studio-bar-fill").forEach((bar) => {
        bar.style.setProperty("--bar-width", `${bar.dataset.width}%`);
    });
}

function renderStudioHoverProbe() {
    if (!studioHoverSample) {
        studioHoverProbe.innerHTML = `<div class="studio-scene-empty">Move across a rendered scene to watch the live spectral profile and derived index update in real time.</div>`;
        return;
    }

    const derivedValue = studioHoverSample.derived.value === null ? "n/a" : formatSampleNumber(studioHoverSample.derived.value);
    studioHoverProbe.innerHTML = `
        <div class="studio-hover-card">
            <div class="studio-hover-head">
                <strong>${studioHoverSample.sceneId}</strong>
                <p>Hovering lon ${studioHoverSample.lon.toFixed(4)}, lat ${studioHoverSample.lat.toFixed(4)} in the current ${studioState.viewMode} render mode.</p>
            </div>
            <div class="studio-hover-spectrum">
                ${buildStudioHoverRows(studioHoverSample.sampleMap)}
            </div>
            <div class="studio-index-row">
                <span>${studioHoverSample.derived.label}</span>
                <strong class="studio-index-value">${derivedValue}</strong>
                <div class="studio-index-context">${studioHoverSample.derived.explanation}</div>
            </div>
        </div>
    `;
    paintStudioBars(studioHoverProbe);
}

function sampleStudioPixel(pixel, coordinate) {
    studioPixelSample = getStudioPixelSample(pixel, coordinate);
    renderStudioPixelInspector();
}

function queueStudioHoverSample(pixel, coordinate) {
    studioHoverPixel = Array.isArray(pixel) ? pixel.slice() : pixel;
    studioHoverCoordinate = Array.isArray(coordinate) ? coordinate.slice() : coordinate;
    if (studioHoverFrame) {
        return;
    }

    studioHoverFrame = requestAnimationFrame(() => {
        studioHoverFrame = null;
        studioHoverSample = getStudioPixelSample(studioHoverPixel, studioHoverCoordinate);
        renderStudioHoverProbe();
    });
}

function clearStudioHoverSample() {
    studioHoverPixel = null;
    studioHoverCoordinate = null;
    if (studioHoverFrame) {
        cancelAnimationFrame(studioHoverFrame);
        studioHoverFrame = null;
    }
    studioHoverSample = null;
    renderStudioHoverProbe();
}

function updateStudioSceneStyles() {
    if (!studioSceneSource) {
        return;
    }
    studioSceneSource.getFeatures().forEach((feature) => {
        const selected = feature.get("sceneId") === studioState.selectedSceneId;
        feature.setStyle(new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: selected ? "rgba(255, 209, 102, 0.95)" : "rgba(121, 168, 255, 0.62)",
                width: selected ? 3 : 2
            }),
            fill: new ol.style.Fill({
                color: selected ? "rgba(255, 209, 102, 0.12)" : "rgba(121, 168, 255, 0.08)"
            })
        }));
    });
}

function updateStudioRasterLayer() {
    if (!studioMap) {
        return;
    }

    if (studioRasterLayer) {
        studioMap.removeLayer(studioRasterLayer);
        studioRasterLayer = null;
    }
    studioRasterDescriptor = null;

    const scene = getSelectedScene();
    if (!scene) {
        studioRasterMessage = "Select a real returned scene to attempt raster rendering from its STAC assets.";
        studioPixelSample = null;
        clearStudioHoverSample();
        renderStudioSceneDetail();
        renderStudioPixelInspector();
        return;
    }

    const rasterConfig = getStudioRasterConfig(scene);
    if (!rasterConfig) {
        if (!studioRasterMessage.includes("requester-pays S3")) {
            studioRasterMessage = `This scene does not expose the required band assets for the current "${studioState.viewMode}" rendering mode, so the map is showing the footprint and basemap only.`;
        }
        studioPixelSample = null;
        clearStudioHoverSample();
        renderStudioSceneDetail();
        renderStudioPixelInspector();
        return;
    }

    try {
        studioRasterLayer = new ol.layer.WebGLTile({
            source: rasterConfig.source,
            style: rasterConfig.style,
            opacity: 0.88
        });
        studioRasterDescriptor = rasterConfig.descriptor;
        studioMap.getLayers().insertAt(3, studioRasterLayer);
        studioRasterMessage = rasterConfig.message;
    } catch (error) {
        studioRasterMessage = "The scene was returned successfully, but the browser-side raster renderer could not be initialized for this asset set.";
        studioPixelSample = null;
        clearStudioHoverSample();
    }

    renderStudioSceneDetail();
    renderStudioPixelInspector();
    renderStudioHoverProbe();
}

async function loadStudioScenes() {
    const hotspot = getStudioHotspot();
    const yearRecord = getStudioYearRecord();
    const requestToken = ++studioSceneRequestToken;
    studioState.loadingScenes = true;
    studioState.scenes = [];
    studioState.selectedSceneId = null;
    studioState.sceneLoadError = false;
    studioRasterMessage = "Loading STAC scene results before attempting raster rendering...";
    renderStudioScenesList();
    renderStudioSceneDetail();
    if (studioSceneSource) {
        studioSceneSource.clear();
    }
    if (studioRasterLayer && studioMap) {
        studioMap.removeLayer(studioRasterLayer);
        studioRasterLayer = null;
    }
    clearStudioHoverSample();

    const start = `${yearRecord.year}-01-01T00:00:00Z`;
    const end = `${yearRecord.year}-12-31T23:59:59Z`;
    const body = {
        collections: STUDIO_STAC_COLLECTIONS,
        limit: 12,
        intersects: {
            type: "Point",
            coordinates: hotspot.center
        },
        datetime: `${start}/${end}`
    };

    try {
        const response = await fetch(STUDIO_STAC_SEARCH_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            throw new Error(`STAC request failed with ${response.status}`);
        }
        const json = await response.json();
        if (requestToken !== studioSceneRequestToken) {
            return;
        }

        const scenes = (json.features || [])
            .map((item) => ({
                id: item.id,
                raw: item,
                geometry: item.geometry,
                cloudCover: Number(getSceneCloudCover(item)).toFixed(1),
                cloudSort: Number(getSceneCloudCover(item)),
                dateLabel: (item.properties?.datetime || item.properties?.["start_datetime"] || "").slice(0, 10) || "Unknown date",
                platformLabel: getScenePlatformLabel(item),
                browseHref: getSceneBrowseHref(item),
                assetKeys: getSceneAssetKeys(item),
                description: `Returned from the Landsat STAC catalog for ${hotspot.name}. This footprint and metadata reflect a real Landsat Collection 2 Level-2 scene product.`
            }))
            .filter((scene) => scene.cloudSort <= studioState.cloudMax)
            .sort((a, b) => a.cloudSort - b.cloudSort)
            .slice(0, 6);

        studioState.loadingScenes = false;
        studioState.scenes = scenes;
        studioState.selectedSceneId = scenes[0]?.id || null;
        studioState.sceneLoadError = false;

        if (studioSceneSource) {
            studioSceneSource.clear();
            scenes.forEach((scene) => {
                const feature = geometryToFeature(scene.geometry, { id: scene.id });
                if (feature) {
                    studioSceneSource.addFeature(feature);
                }
            });
        }

        renderStudioScenesList();
        updateStudioSceneStyles();
        updateStudioRasterLayer();
    } catch (error) {
        if (requestToken !== studioSceneRequestToken) {
            return;
        }
        console.warn(error);
        studioState.loadingScenes = false;
        studioState.scenes = [];
        studioState.selectedSceneId = null;
        studioState.sceneLoadError = true;
        studioRasterMessage = "The STAC request did not return usable scene metadata in this session, so raster rendering could not be initialized.";
        renderStudioScenesList();
        renderStudioSceneDetail();
    }
}

function scheduleStudioSceneLoad(delay = 250) {
    if (studioSceneLoadTimer) {
        clearTimeout(studioSceneLoadTimer);
    }
    studioSceneLoadTimer = setTimeout(() => {
        loadStudioScenes();
    }, delay);
}

function getStudioPointStyle(feature) {
    const hotspotId = feature.get("hotspotId");
    const hotspot = studioHotspots.find((item) => item.id === hotspotId);
    const active = hotspotId === studioState.hotspotId;
    return new ol.style.Style({
        image: new ol.style.Circle({
            radius: active ? 9 : 6,
            fill: new ol.style.Fill({ color: active ? "rgba(108, 229, 177, 0.95)" : "rgba(121, 168, 255, 0.9)" }),
            stroke: new ol.style.Stroke({ color: "rgba(8, 17, 31, 0.9)", width: 2 })
        }),
        text: new ol.style.Text({
            text: hotspot.name,
            offsetY: -18,
            font: active ? "700 12px Space Grotesk, sans-serif" : "500 11px Space Grotesk, sans-serif",
            fill: new ol.style.Fill({ color: "#edf4ff" }),
            stroke: new ol.style.Stroke({ color: "rgba(8, 17, 31, 0.95)", width: 3 })
        })
    });
}

function updateStudioMapVisualization() {
    if (!studioActiveFeature) {
        return;
    }

    const hotspot = getStudioHotspot();
    const yearRecord = getStudioYearRecord();
    const mode = studioModeDetails[studioState.viewMode];
    const center = ol.proj.fromLonLat(hotspot.center);

    studioActiveFeature.setGeometry(new ol.geom.Circle(center, yearRecord.footprintKm * 1000));
    studioActiveFeature.setStyle(new ol.style.Style({
        fill: new ol.style.Fill({ color: mode.color }),
        stroke: new ol.style.Stroke({ color: "rgba(255, 255, 255, 0.62)", width: 2 })
    }));

    Object.values(studioHotspotFeatures).forEach((feature) => {
        feature.setStyle(getStudioPointStyle(feature));
    });
}

function zoomStudioToHotspot() {
    if (!studioMap) {
        return;
    }
    const hotspot = getStudioHotspot();
    studioMap.getView().animate({
        center: ol.proj.fromLonLat(hotspot.center),
        zoom: hotspot.zoom,
        duration: 800
    });
}

function updateStudioBasemapVisibility() {
    if (!studioBaseLayers || Object.keys(studioBaseLayers).length === 0) {
        return;
    }

    Object.entries(studioBaseLayers).forEach(([key, layer]) => {
        layer.setVisible(key === studioState.basemap);
    });
}

function initializeStudioCustomBands() {
    const options = Object.entries(BAND_KEY_LABELS)
        .map(([key, label]) => `<option value="${key}">${label}</option>`)
        .join("");
    [studioBandR, studioBandG, studioBandB].forEach((select) => {
        select.innerHTML = options;
    });
    studioBandR.value = studioState.customBands.r;
    studioBandG.value = studioState.customBands.g;
    studioBandB.value = studioState.customBands.b;

    const wireBandSelect = (channel, select) => {
        select.addEventListener("change", () => {
            studioState.customBands[channel] = select.value;
            updateStudioMapVisualization();
            updateStudioRasterLayer();
            renderStudioPanels();
        });
    };
    wireBandSelect("r", studioBandR);
    wireBandSelect("g", studioBandG);
    wireBandSelect("b", studioBandB);
}

function renderStudio() {
    renderStudioChoiceButtons(studioBasemap, studioOptions.basemaps, studioState.basemap, (id) => {
        studioState.basemap = id;
        renderStudio();
        updateStudioBasemapVisibility();
    });
    renderStudioChoiceButtons(studioSatellite, studioOptions.satellites, studioState.satellite, (id) => {
        studioState.satellite = id;
        renderStudio();
    });
    renderStudioChoiceButtons(studioViewmode, studioOptions.viewModes, studioState.viewMode, (id) => {
        studioState.viewMode = id;
        renderStudio();
        updateStudioMapVisualization();
        updateStudioRasterLayer();
    });
    studioCustomBands.hidden = studioState.viewMode !== "custom";
    renderStudioHotspots();
    renderStudioPanels();
    updateStudioBasemapVisibility();
    updateStudioMapVisualization();
}

function refreshStudioMapLayout() {
    if (!studioMap || !studioMapTarget) {
        return;
    }

    const { width, height } = studioMapTarget.getBoundingClientRect();
    if (!width || !height) {
        return;
    }

    studioMap.updateSize();
    studioMap.renderSync();
}

async function initializeStudioMap() {
    if (
        !isReady(
            studioMapTarget,
            studioBasemap,
            studioSatellite,
            studioViewmode,
            studioCustomBands,
            studioBandR,
            studioBandG,
            studioBandB,
            studioHotspotsContainer,
            studioYearSlider,
            studioYearLabel,
            studioYearNote,
            studioCloudSlider,
            studioCloudLabel,
            studioPopupTitle,
            studioPopupCopy,
            studioMapCaption,
            studioSpectralTitle,
            studioSpectralChart,
            studioHoverProbe,
            studioSpectralCopy,
            studioIndexTitle,
            studioIndexCard,
            studioHistoryTitle,
            studioHistoryMetrics,
            studioHistoryCopy,
            studioScenesList,
            studioSceneDetail,
            studioPixelInspector
        )
    ) {
        return;
    }

    const studioCatalogReady = await loadStudioCatalog();
    if (!studioCatalogReady) {
        return;
    }

    studioBaseLayers = {
        imagery: new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                crossOrigin: "anonymous",
                attributions: "Esri"
            }),
            visible: true
        }),
        light: new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: "https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
                crossOrigin: "anonymous",
                attributions: "OpenStreetMap, CARTO"
            }),
            visible: false
        }),
        terrain: new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
                crossOrigin: "anonymous",
                attributions: "OpenTopoMap"
            }),
            visible: false
        })
    };

    studioVectorSource = new ol.source.Vector();
    studioHotspots.forEach((hotspot) => {
        const feature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat(hotspot.center)),
            hotspotId: hotspot.id,
            type: "hotspot"
        });
        feature.setStyle(getStudioPointStyle(feature));
        studioHotspotFeatures[hotspot.id] = feature;
        studioVectorSource.addFeature(feature);
    });

    studioActiveFeature = new ol.Feature({
        geometry: new ol.geom.Circle(ol.proj.fromLonLat(getStudioHotspot().center), 10000),
        type: "active-area"
    });

    studioHotspotLayer = new ol.layer.Vector({ source: studioVectorSource });
    studioActiveLayer = new ol.layer.Vector({
        source: new ol.source.Vector({ features: [studioActiveFeature] })
    });
    studioSceneSource = new ol.source.Vector();
    studioSceneLayer = new ol.layer.Vector({ source: studioSceneSource });

    const createDefaultControls =
        typeof ol.control?.defaults === "function"
            ? ol.control.defaults
            : ol.control?.defaults?.defaults;

    studioMap = new ol.Map({
        target: studioMapTarget,
        layers: [studioBaseLayers.imagery, studioBaseLayers.light, studioBaseLayers.terrain, studioSceneLayer, studioActiveLayer, studioHotspotLayer],
        view: new ol.View({
            center: ol.proj.fromLonLat([8, 15]),
            zoom: 2
        }),
        controls: createDefaultControls ? createDefaultControls({ rotate: false }) : undefined,
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true
    });

    if (studioMapTarget) {
        if (studioMapResizeObserver) {
            studioMapResizeObserver.disconnect();
        }

        if (typeof ResizeObserver === "function") {
            studioMapResizeObserver = new ResizeObserver(() => {
                refreshStudioMapLayout();
            });
            studioMapResizeObserver.observe(studioMapTarget);
        } else {
            window.addEventListener("resize", refreshStudioMapLayout);
        }
    }

    studioMap.on("click", (event) => {
        const feature = studioMap.forEachFeatureAtPixel(event.pixel, (candidate) => candidate);
        if (!feature) {
            sampleStudioPixel(event.pixel, event.coordinate);
            return;
        }
        if (feature.get("type") === "scene") {
            studioState.selectedSceneId = feature.get("sceneId");
            renderStudioScenesList();
            updateStudioSceneStyles();
            updateStudioRasterLayer();
            return;
        }
        if (feature.get("type") !== "hotspot") {
            sampleStudioPixel(event.pixel, event.coordinate);
            return;
        }
        studioState.hotspotId = feature.get("hotspotId");
        studioState.yearIndex = getStudioHotspot().years.length - 1;
        renderStudio();
        zoomStudioToHotspot();
        scheduleStudioSceneLoad(0);
    });

    studioMap.on("pointermove", (event) => {
        if (event.dragging) {
            return;
        }
        queueStudioHoverSample(event.pixel, event.coordinate);
    });

    studioMap.getViewport().addEventListener("mouseleave", () => {
        clearStudioHoverSample();
    });

    studioYearSlider.addEventListener("input", () => {
        studioState.yearIndex = Number(studioYearSlider.value);
        renderStudioPanels();
        updateStudioMapVisualization();
        scheduleStudioSceneLoad();
    });

    studioCloudSlider.addEventListener("input", () => {
        studioState.cloudMax = Number(studioCloudSlider.value);
        studioCloudLabel.textContent = `${studioState.cloudMax}%`;
        scheduleStudioSceneLoad();
    });

    initializeStudioCustomBands();
    renderStudio();
    renderStudioPixelInspector();
    renderStudioHoverProbe();
    refreshStudioMapLayout();
    zoomStudioToHotspot();
    requestAnimationFrame(() => {
        refreshStudioMapLayout();
        zoomStudioToHotspot();
    });
    setTimeout(() => {
        refreshStudioMapLayout();
    }, 250);
    window.addEventListener("load", refreshStudioMapLayout, { once: true });
    setTimeout(() => {
        refreshStudioMapLayout();
    }, 1000);
    scheduleStudioSceneLoad(0);
}

async function initializeMissionExplorer() {
    if (
        !isReady(
            filterRow,
            missionGrid,
            searchInput,
            sortSelect,
            detailImage,
            detailEyebrow,
            detailTitle,
            detailSummary,
            detailHighlight,
            detailGrid,
            compareSelection,
            compareGrid,
            compareClearButton
        )
    ) {
        return;
    }

    const catalogReady = await loadMissionCatalog();
    if (!catalogReady) {
        return;
    }

    searchInput.addEventListener("input", renderMissionCards);
    sortSelect.addEventListener("change", renderMissionCards);
    compareClearButton.addEventListener("click", () => {
        comparedMissionIds = [];
        renderMissionCards();
        renderCompareSelection();
        renderCompareGrid();
    });

    renderFilters();
    renderMissionCards();
    renderMissionDetail(missions.find((mission) => mission.id === activeMissionId));
    renderCompareSelection();
    renderCompareGrid();
}

function shouldAutoLoadHeroVideo() {
    const saveData = navigator.connection?.saveData === true;
    const reducedData = window.matchMedia("(prefers-reduced-data: reduce)").matches;
    const smallViewport = window.innerWidth < 700;
    return !saveData && !reducedData && !smallViewport;
}

function loadHeroVideoSource(video) {
    if (video.dataset.loaded === "true") {
        return;
    }

    video.querySelectorAll("source[data-src]").forEach((source) => {
        source.src = source.dataset.src;
        source.removeAttribute("data-src");
    });
    video.load();
    video.dataset.loaded = "true";
}

function initializeHeroVideoControls() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll("[data-video-toggle]").forEach((button) => {
        const hero = button.closest(".hero");
        const video = hero?.querySelector(".hero-video");
        if (!video) {
            button.hidden = true;
            return;
        }

        const syncButton = () => {
            button.textContent = video.paused ? "Play video" : "Pause video";
            button.setAttribute("aria-pressed", String(!video.paused));
        };

        if (shouldAutoLoadHeroVideo()) {
            loadHeroVideoSource(video);
            if (reducedMotion) {
                video.pause();
            }
        } else {
            // Skip the ~19 MB hero video download by default on small screens, metered
            // connections (Save-Data), or when the user prefers reduced data usage. The
            // poster image still renders; pressing play loads and starts the video on demand.
            button.textContent = "Play video";
            button.setAttribute("aria-pressed", "false");
        }

        button.addEventListener("click", () => {
            loadHeroVideoSource(video);
            if (video.paused) {
                video.play().catch(() => {});
            } else {
                video.pause();
            }
            syncButton();
        });
        video.addEventListener("play", syncButton);
        video.addEventListener("pause", syncButton);
        syncButton();
    });
}

function initializeLegacyAnchorRedirects() {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, "");
    const hash = window.location.hash.toLowerCase();
    const redirects = {
        "/#overview": "/briefing/overview",
        "/#foundations": "/briefing/foundations",
        "/#missions": "/briefing/missions",
        "/#applications": "/briefing/applications",
        "/#products": "/briefing/products",
        "/#future": "/briefing/future",
        "/#resources": "/briefing/resources",
        "/briefing#overview": "/briefing/overview",
        "/briefing#foundations": "/briefing/foundations",
        "/briefing#missions": "/briefing/missions",
        "/briefing#applications": "/briefing/applications",
        "/briefing#products": "/briefing/products",
        "/briefing#future": "/briefing/future",
        "/briefing#resources": "/briefing/resources",
        "/studio#orbit-lab": "/studio/orbit-lab",
        "/studio#resolution-lab": "/studio/resolution-lab",
        "/studio#band-lab": "/studio/band-lab",
        "/studio#studio": "/studio/remote-sensing-studio"
    };
    const target = redirects[`${path}${hash}`];
    if (!target) {
        return false;
    }

    window.location.replace(target);
    return true;
}

function initializeWayfinding() {
    const navLinks = Array.from(document.querySelectorAll(".topnav .nav-link"));
    const normalizePath = (value) => value.toLowerCase().replace(/\/$/, "") || "/";
    const currentPath = normalizePath(window.location.pathname);
    navLinks.forEach((link) => {
        const url = new URL(link.getAttribute("href") || "", window.location.origin);
        if (url.origin === window.location.origin && !url.hash) {
            link.classList.toggle("active", normalizePath(url.pathname) === currentPath);
        }
    });

    const localLinks = navLinks
        .map((link) => {
            const href = link.getAttribute("href") || "";
            if (!href.startsWith("#") || href.length <= 1) {
                return null;
            }
            const section = document.getElementById(href.slice(1));
            return section ? { link, section } : null;
        })
        .filter(Boolean);

    if (localLinks.length === 0) {
        return;
    }

    const setActiveLink = (sectionId) => {
        localLinks.forEach(({ link, section }) => {
            link.classList.toggle("active", section.id === sectionId);
        });
    };

    const initialSection = window.location.hash
        ? document.getElementById(window.location.hash.slice(1))
        : localLinks[0].section;
    if (initialSection) {
        setActiveLink(initialSection.id);
    }

    localLinks.forEach(({ link, section }) => {
        link.addEventListener("click", () => setActiveLink(section.id));
    });

    if (!("IntersectionObserver" in window)) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        const visibleEntry = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visibleEntry) {
            setActiveLink(visibleEntry.target.id);
        }
    }, {
        rootMargin: "-32% 0px -58% 0px",
        threshold: [0.1, 0.25, 0.5]
    });

    localLinks.forEach(({ section }) => observer.observe(section));
}

document.addEventListener("DOMContentLoaded", async () => {
    if (initializeLegacyAnchorRedirects()) {
        return;
    }

    initializeHeroVideoControls();
    initializeWayfinding();
    await initializeOrbitLab();
    await initializeResolutionLab();
    await initializeBandLab();
    await initializeMissionExplorer();
    await initializeImpactStudio();
    await initializeWorkflowGuide();
    await initializeStudioMap();
});
