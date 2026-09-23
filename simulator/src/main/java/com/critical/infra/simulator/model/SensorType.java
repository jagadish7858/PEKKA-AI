package com.critical.infra.simulator.model;

public enum SensorType {
    TEMPERATURE("Temperature", "\u00B0C", 55.0, 70.0, 70.0, 85.0, 85.0, 130.0),
    VOLTAGE("Voltage", "V", 220.0, 240.0, 205.0, 250.0, 180.0, 260.0),
    CURRENT("Current", "A", 300.0, 450.0, 450.0, 600.0, 600.0, 950.0),
    VIBRATION("Vibration", "mm/s", 1.0, 3.0, 3.0, 6.0, 6.0, 20.0),
    LOAD("Load", "%", 40.0, 70.0, 70.0, 90.0, 90.0, 120.0),
    POWER_FACTOR("Power factor", "", 0.90, 0.99, 0.82, 0.90, 0.50, 0.82),
    FREQUENCY("Frequency", "Hz", 49.8, 50.2, 49.2, 50.8, 47.0, 53.0),
    OIL_TEMPERATURE("Oil temperature", "\u00B0C", 45.0, 65.0, 65.0, 82.0, 82.0, 120.0),
    OIL_PRESSURE("Oil pressure", "bar", 1.2, 2.0, 2.0, 2.8, 2.8, 4.5);

    private final String displayName;
    private final String defaultUnit;
    private final double normalMin;
    private final double normalMax;
    private final double warningMin;
    private final double warningMax;
    private final double criticalMin;
    private final double criticalMax;

    SensorType(String displayName, String defaultUnit,
               double normalMin, double normalMax,
               double warningMin, double warningMax,
               double criticalMin, double criticalMax) {
        this.displayName = displayName;
        this.defaultUnit = defaultUnit;
        this.normalMin = normalMin;
        this.normalMax = normalMax;
        this.warningMin = warningMin;
        this.warningMax = warningMax;
        this.criticalMin = criticalMin;
        this.criticalMax = criticalMax;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDefaultUnit() {
        return defaultUnit;
    }

    public double getNormalMin() {
        return normalMin;
    }

    public double getNormalMax() {
        return normalMax;
    }

    public double getWarningMin() {
        return warningMin;
    }

    public double getWarningMax() {
        return warningMax;
    }

    public double getCriticalMin() {
        return criticalMin;
    }

    public double getCriticalMax() {
        return criticalMax;
    }

    /**
     * Determines status based on sensor type characteristics.
     * Most sensors alert when exceeding thresholds; Voltage and Frequency alert when deviating on either side;
     * Power factor alerts when falling below acceptable thresholds.
     */
    public SensorStatus evaluateStatus(double value) {
        switch (this) {
            case VOLTAGE:
                if (value < 200.0 || value > 255.0) {
                    return SensorStatus.CRITICAL;
                }
                if (value < normalMin || value > normalMax) {
                    return SensorStatus.WARNING;
                }
                return SensorStatus.NORMAL;

            case FREQUENCY:
                if (value < 49.0 || value > 51.0) {
                    return SensorStatus.CRITICAL;
                }
                if (value < normalMin || value > normalMax) {
                    return SensorStatus.WARNING;
                }
                return SensorStatus.NORMAL;

            case POWER_FACTOR:
                if (value < 0.80) {
                    return SensorStatus.CRITICAL;
                }
                if (value < 0.90) {
                    return SensorStatus.WARNING;
                }
                return SensorStatus.NORMAL;

            case OIL_PRESSURE:
                if (value < 0.9 || value > 3.0) {
                    return SensorStatus.CRITICAL;
                }
                if (value < normalMin || value > normalMax) {
                    return SensorStatus.WARNING;
                }
                return SensorStatus.NORMAL;

            case TEMPERATURE:
            case CURRENT:
            case VIBRATION:
            case LOAD:
            case OIL_TEMPERATURE:
            default:
                if (value >= criticalMin) {
                    return SensorStatus.CRITICAL;
                }
                if (value >= warningMin) {
                    return SensorStatus.WARNING;
                }
                return SensorStatus.NORMAL;
        }
    }
}
