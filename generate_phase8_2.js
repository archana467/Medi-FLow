const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const PROM_DIR = path.join(BASE_DIR, 'prometheus');
const GRAFANA_DIR = path.join(BASE_DIR, 'grafana');

const files = {};

// 1. prometheus/prometheus.yml
files[path.join(PROM_DIR, 'prometheus.yml')] = `
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - 'alert.rules'

scrape_configs:
  - job_name: 'mediflow-backend'
    static_configs:
      - targets: ['backend:5000']
`;

// 2. prometheus/alert.rules
files[path.join(PROM_DIR, 'alert.rules')] = `
groups:
- name: mediflow_alerts
  rules:
  - alert: HighErrorRate
    expr: sum(rate(http_requests_total{code=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: High HTTP 5xx error rate detected
      description: "More than 5% of requests are failing."

  - alert: HighRequestLatency
    expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: High request latency
      description: "95th percentile latency is over 2 seconds."
`;

// 3. grafana/provisioning/datasources/datasource.yml
files[path.join(GRAFANA_DIR, 'provisioning', 'datasources', 'datasource.yml')] = `
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
`;

// 4. grafana/provisioning/dashboards/dashboard.yml
files[path.join(GRAFANA_DIR, 'provisioning', 'dashboards', 'dashboard.yml')] = `
apiVersion: 1
providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    options:
      path: /etc/grafana/dashboards
`;

// 5. grafana/dashboards/mediflow.json
files[path.join(GRAFANA_DIR, 'dashboards', 'mediflow.json')] = `
{
  "title": "MediFlow Production Dashboard",
  "panels": [
    {
      "type": "timeseries",
      "title": "Total Requests",
      "targets": [
        {
          "expr": "sum(rate(http_requests_total[1m]))",
          "legendFormat": "Requests / sec"
        }
      ]
    },
    {
      "type": "timeseries",
      "title": "Error Rate (5xx)",
      "targets": [
        {
          "expr": "sum(rate(http_requests_total{code=~\\"5..\\"}[1m]))",
          "legendFormat": "5xx Errors"
        }
      ]
    },
    {
      "type": "timeseries",
      "title": "P95 Latency",
      "targets": [
        {
          "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
          "legendFormat": "Seconds"
        }
      ]
    }
  ],
  "schemaVersion": 36
}
`;

Object.keys(files).forEach(filepath => {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, files[filepath].trim() + '\\n');
});

console.log("Phase 8 Infrastructure setup generated");
