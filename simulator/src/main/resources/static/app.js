// State management
let currentEquipmentId = 'TRANSFORMER-01';
let equipmentList = [];
let sensorsMeta = {};
let latestReadings = {};
let isPlaying = true;
let stompClient = null;
let pollFallbackInterval = null;

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    await fetchEquipment();
    await fetchSensors();
    await fetchSimulationStatus();
    await fetchLatestTelemetry();

    connectWebSocket();
}

async function fetchEquipment() {
    try {
        const res = await fetch('/api/v1/equipment');
        if (res.ok) {
            equipmentList = await res.json();
            renderEquipmentTabs();
        }
    } catch (e) {
        console.error('Failed to load equipment', e);
    }
}

async function fetchSensors() {
    try {
        const res = await fetch('/api/v1/sensors');
        if (res.ok) {
            const list = await res.json();
            sensorsMeta = {};
            list.forEach(s => {
                sensorsMeta[s.sensorId] = s;
            });
            renderSensorsGrid();
        }
    } catch (e) {
        console.error('Failed to load sensors', e);
    }
}

async function fetchSimulationStatus() {
    try {
        const res = await fetch('/api/v1/simulation/status');
        if (res.ok) {
            const status = await res.json();
            updateSimulationStatusUI(status);
        }
    } catch (e) {
        console.error('Failed to fetch status', e);
    }
}

async function fetchLatestTelemetry() {
    try {
        const res = await fetch(`/api/v1/readings/${currentEquipmentId}`);
        if (res.ok) {
            const readings = await res.json();
            updateReadings(readings);
        }
    } catch (e) {
        console.error('Failed to fetch telemetry', e);
    }
}

function renderEquipmentTabs() {
    const container = document.getElementById('equipmentTabs');
    if (!container) return;
    container.innerHTML = '';

    equipmentList.forEach((eq, idx) => {
        const btn = document.createElement('button');
        btn.className = `eq-tab ${eq.equipmentId === currentEquipmentId ? 'active' : ''}`;
        btn.textContent = eq.equipmentId;
        btn.onclick = () => selectEquipment(eq.equipmentId);
        container.appendChild(btn);
    });

    updateEquipmentHeaderMeta();
}

function selectEquipment(eqId) {
    currentEquipmentId = eqId;
    renderEquipmentTabs();
    renderSensorsGrid();
    fetchLatestTelemetry();
}

function updateEquipmentHeaderMeta() {
    const eq = equipmentList.find(e => e.equipmentId === currentEquipmentId);
    if (!eq) return;

    document.getElementById('eqMetaName').textContent = eq.name;
    document.getElementById('eqMetaLocation').textContent = eq.location;
}

function renderSensorsGrid() {
    const container = document.getElementById('sensorsGrid');
    if (!container) return;
    container.innerHTML = '';

    const eq = equipmentList.find(e => e.equipmentId === currentEquipmentId);
    const sensors = eq ? eq.sensors : Object.values(sensorsMeta);

    sensors.forEach(sensor => {
        const card = document.createElement('div');
        card.className = 'sensor-card status-normal';
        card.id = `card-${sensor.sensorId}`;

        card.innerHTML = `
            <div class="card-top">
                <div class="sensor-info">
                    <span class="sensor-id">${sensor.sensorId}</span>
                    <h4 class="sensor-name">${sensor.name}</h4>
                </div>
                <span class="status-badge normal" id="badge-${sensor.sensorId}">NORMAL</span>
            </div>
            <div class="card-value-box">
                <span class="card-value" id="val-${sensor.sensorId}">--</span>
                <span class="card-unit">${sensor.unit}</span>
            </div>
            <div class="card-bottom">
                <div class="progress-track">
                    <div class="progress-fill" id="fill-${sensor.sensorId}" style="width: 50%;"></div>
                </div>
                <div class="range-labels">
                    <span>Nominal: ${sensor.normalMin} - ${sensor.normalMax} ${sensor.unit}</span>
                    <span id="rangeStatus-${sensor.sensorId}">Stable</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function updateReadings(readings) {
    if (!Array.isArray(readings)) return;

    let hasCritical = false;
    let hasWarning = false;

    readings.forEach(reading => {
        if (reading.equipmentId !== currentEquipmentId) return;

        latestReadings[reading.sensorId] = reading;

        const valElem = document.getElementById(`val-${reading.sensorId}`);
        const badgeElem = document.getElementById(`badge-${reading.sensorId}`);
        const cardElem = document.getElementById(`card-${reading.sensorId}`);
        const fillElem = document.getElementById(`fill-${reading.sensorId}`);
        const rangeStatusElem = document.getElementById(`rangeStatus-${reading.sensorId}`);

        if (valElem) {
            valElem.textContent = reading.value;
        }

        const status = reading.status || 'NORMAL';
        if (status === 'CRITICAL') hasCritical = true;
        else if (status === 'WARNING') hasWarning = true;

        if (badgeElem) {
            badgeElem.textContent = status;
            badgeElem.className = `status-badge ${status.toLowerCase()}`;
        }

        if (cardElem) {
            cardElem.className = `sensor-card status-${status.toLowerCase()}`;
        }

        if (fillElem && sensorsMeta[reading.sensorId]) {
            const meta = sensorsMeta[reading.sensorId];
            const span = meta.criticalMax - meta.normalMin;
            const pct = Math.min(100, Math.max(5, ((reading.value - meta.normalMin) / (span || 1)) * 100));
            fillElem.style.width = `${pct}%`;
        }

        if (rangeStatusElem) {
            rangeStatusElem.textContent = status === 'NORMAL' ? 'Nominal' : status === 'WARNING' ? 'Degrading' : 'CRITICAL FAULT';
        }
    });

    // Update equipment overall badge
    const overallBadge = document.getElementById('eqOverallStatus');
    if (overallBadge) {
        const overall = hasCritical ? 'CRITICAL' : hasWarning ? 'WARNING' : 'NORMAL';
        overallBadge.textContent = overall;
        overallBadge.className = `status-badge ${overall.toLowerCase()}`;
    }

    // Update Raw Feed JSON Display
    const jsonDisplay = document.getElementById('rawJsonFeed');
    if (jsonDisplay && readings.length > 0) {
        // Show sample reading nicely formatted
        jsonDisplay.textContent = JSON.stringify(readings.slice(0, 3), null, 2);
    }
}

function updateSimulationStatusUI(status) {
    if (!status) return;

    // Ticks
    const ticksElem = document.getElementById('statTicks');
    if (ticksElem) ticksElem.textContent = status.tickCount;

    // Mode buttons
    const activeMode = status.globalMode;
    ['Normal', 'Warning', 'Critical'].forEach(m => {
        const btn = document.getElementById(`btnMode${m}`);
        if (btn) {
            btn.classList.toggle('active', m.toUpperCase() === activeMode);
        }
    });

    // Pulse indicator color
    const pulse = document.getElementById('pulseIndicator');
    if (pulse) {
        if (activeMode === 'CRITICAL') {
            pulse.style.backgroundColor = 'var(--color-critical)';
            pulse.style.boxShadow = '0 0 12px var(--color-critical)';
        } else if (activeMode === 'WARNING') {
            pulse.style.backgroundColor = 'var(--color-warning)';
            pulse.style.boxShadow = '0 0 12px var(--color-warning)';
        } else {
            pulse.style.backgroundColor = 'var(--color-normal)';
            pulse.style.boxShadow = '0 0 12px var(--color-normal)';
        }
    }

    // Interval select
    const intervalSelect = document.getElementById('intervalSelect');
    if (intervalSelect && status.intervalMs) {
        intervalSelect.value = status.intervalMs.toString();
    }

    // Play/Pause
    isPlaying = status.state === 'RUNNING';
    const playIcon = document.getElementById('playIcon');
    const playText = document.getElementById('playText');
    if (playIcon && playText) {
        playIcon.textContent = isPlaying ? '⏸' : '▶';
        playText.textContent = isPlaying ? 'Pause' : 'Resume';
    }
}

// WebSocket Connection
function connectWebSocket() {
    const wsStatus = document.getElementById('wsStatus');

    if (typeof SockJS === 'undefined' || typeof Stomp === 'undefined') {
        console.warn('SockJS or Stomp not loaded, falling back to HTTP polling.');
        startPollingFallback();
        return;
    }

    try {
        const socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
        stompClient.debug = null; // suppress verbose debug logs

        stompClient.connect({}, frame => {
            if (wsStatus) {
                wsStatus.textContent = 'LIVE (WS)';
                wsStatus.className = 'stat-status live';
            }
            if (pollFallbackInterval) {
                clearInterval(pollFallbackInterval);
                pollFallbackInterval = null;
            }

            // Subscribe to all readings
            stompClient.subscribe('/topic/readings', message => {
                const readings = JSON.parse(message.body);
                updateReadings(readings);
            });

            // Subscribe to simulation status
            stompClient.subscribe('/topic/simulation-status', message => {
                const status = JSON.parse(message.body);
                updateSimulationStatusUI(status);
            });

            // Subscribe to equipment telemetry
            stompClient.subscribe(`/topic/equipment/${currentEquipmentId}`, message => {
                const telemetry = JSON.parse(message.body);
                if (telemetry.readings) {
                    updateReadings(telemetry.readings);
                }
            });
        }, error => {
            console.warn('WebSocket connection failed, using polling fallback.', error);
            if (wsStatus) {
                wsStatus.textContent = 'POLLING (HTTP)';
                wsStatus.className = 'stat-status live';
            }
            startPollingFallback();
        });
    } catch (e) {
        console.error('Error establishing WebSocket', e);
        startPollingFallback();
    }
}

function startPollingFallback() {
    if (pollFallbackInterval) return;
    pollFallbackInterval = setInterval(async () => {
        await fetchSimulationStatus();
        await fetchLatestTelemetry();
    }, 1000);
}

// User Actions
async function setMode(mode) {
    try {
        const res = await fetch('/api/v1/simulation/mode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode })
        });
        if (res.ok) {
            const status = await res.json();
            updateSimulationStatusUI(status);
        }
    } catch (e) {
        console.error('Failed to set mode', e);
    }
}

async function changeInterval(intervalMs) {
    try {
        const res = await fetch('/api/v1/simulation/interval', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ intervalMs: parseInt(intervalMs, 10) })
        });
        if (res.ok) {
            const status = await res.json();
            updateSimulationStatusUI(status);
        }
    } catch (e) {
        console.error('Failed to change interval', e);
    }
}

async function togglePlay() {
    const endpoint = isPlaying ? '/api/v1/simulation/stop' : '/api/v1/simulation/start';
    try {
        const res = await fetch(endpoint, { method: 'POST' });
        if (res.ok) {
            const status = await res.json();
            updateSimulationStatusUI(status);
        }
    } catch (e) {
        console.error('Failed to toggle play state', e);
    }
}

async function resetBaseline() {
    try {
        const res = await fetch('/api/v1/simulation/reset', { method: 'POST' });
        if (res.ok) {
            const status = await res.json();
            updateSimulationStatusUI(status);
            fetchLatestTelemetry();
        }
    } catch (e) {
        console.error('Failed to reset simulation', e);
    }
}

function injectFaultModal() {
    document.getElementById('anomalyModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('anomalyModal').style.display = 'none';
}

async function submitAnomaly() {
    const equipmentId = document.getElementById('modalEquipment').value;
    const sensorType = document.getElementById('modalSensorType').value;
    const delta = parseFloat(document.getElementById('modalDelta').value);
    const durationTicks = parseInt(document.getElementById('modalTicks').value, 10);

    try {
        const res = await fetch('/api/v1/simulation/inject-anomaly', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ equipmentId, sensorType, delta, durationTicks })
        });
        if (res.ok) {
            closeModal();
        }
    } catch (e) {
        console.error('Failed to inject anomaly', e);
    }
}

async function testEndpoint(url) {
    try {
        const res = await fetch(url);
        const data = await res.json();
        const jsonDisplay = document.getElementById('rawJsonFeed');
        if (jsonDisplay) {
            jsonDisplay.textContent = `// Response from ${url}\n` + JSON.stringify(data, null, 2);
        }
    } catch (e) {
        console.error('Test endpoint error', e);
    }
}
