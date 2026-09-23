import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.storage.memory_store import get_store


@pytest.fixture(autouse=True)
def clean_store():
    """Ensures each test starts with an isolated empty in-memory store."""
    store = get_store()
    store.clear()
    yield
    store.clear()


@pytest.fixture
def client():
    """Test client for FastAPI app."""
    return TestClient(app)


@pytest.fixture
def sample_reading_payload():
    """Standard valid normal reading payload matching contract."""
    return {
        "sensorId": "TEMP-T01",
        "equipmentId": "TRANSFORMER-01",
        "sensorType": "TEMPERATURE",
        "value": 72.4,
        "unit": "°C",
        "timestamp": "2026-09-23T10:30:00Z",
        "status": "NORMAL",
    }
