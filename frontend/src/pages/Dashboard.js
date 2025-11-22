// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { fetchDashboardStats } from "../api";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (e) {
        setErr(e.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading dashboard…</div>;
  if (err) return <div style={{ color: "red" }}>{err}</div>;
  if (!stats) return null;

  const { summary, plan_chart } = stats;

  // --- derived stats for extra insight ---
  const totalPayments =
    typeof summary.total_payments === "number"
      ? summary.total_payments
      : Number(summary.total_payments || 0);

  const avgPayment =
    summary.total_memberships > 0
      ? totalPayments / summary.total_memberships
      : 0;

  let mostPopularPlan = "-";
  if (plan_chart.labels && plan_chart.data && plan_chart.labels.length > 0) {
    const maxIndex = plan_chart.data.indexOf(
      Math.max(...plan_chart.data.map((n) => Number(n) || 0))
    );
    mostPopularPlan = plan_chart.labels[maxIndex];
  }

  const chartData =
    plan_chart.labels && plan_chart.labels.length > 0
      ? {
          labels: plan_chart.labels,
          datasets: [
            {
              label: "Memberships",
              data: plan_chart.data,
              backgroundColor: "#60a5fa",
              borderRadius: 8,
            },
          ],
        }
      : null;

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw} members`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div>
      <h2 className="page-title">Dashboard</h2>

      {/* TOP STAT CARDS */}
      <div className="card-row">
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{summary.total_users}</div>
          <div className="stat-caption">All registered accounts</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Memberships</div>
          <div className="stat-value">{summary.total_memberships}</div>
          <div className="stat-caption">Active membership records</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Classes</div>
          <div className="stat-value">{summary.total_classes}</div>
          <div className="stat-caption">Classes configured</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Payments ($)</div>
          <div className="stat-value">
            {totalPayments.toFixed ? totalPayments.toFixed(2) : totalPayments}
          </div>
          <div className="stat-caption">
            Avg per membership: ${avgPayment.toFixed(2)}
          </div>
        </div>
      </div>

      {/* CHART + INSIGHTS GRID */}
      <div className="dashboard-grid">
        <div className="chart-card">
          <div className="card-header">
            <h3 className="card-title">Memberships by Plan Type</h3>
            <span className="card-subtitle">
              Distribution of active membership plans
            </span>
          </div>
          {chartData ? (
            <Bar data={chartData} options={options} />
          ) : (
            <div style={{ padding: "16px 0", color: "#6b7280" }}>
              No membership plan data available.
            </div>
          )}
        </div>

        <div className="chart-card">
          <div className="card-header">
            <h3 className="card-title">Quick Insights</h3>
          </div>
          <ul className="insights-list">
            <li>
              <span className="insight-label">Most Popular Plan</span>
              <span className="insight-value">{mostPopularPlan}</span>
            </li>
            <li>
              <span className="insight-label">Average Payment</span>
              <span className="insight-value">
                ${avgPayment.toFixed(2)}
              </span>
            </li>
            <li>
              <span className="insight-label">Users per Class (approx.)</span>
              <span className="insight-value">
                {summary.total_classes > 0
                  ? (summary.total_users / summary.total_classes).toFixed(1)
                  : "N/A"}
              </span>
            </li>
            <li>
              <span className="insight-label">
                Memberships per User (approx.)
              </span>
              <span className="insight-value">
                {summary.total_users > 0
                  ? (
                      summary.total_memberships / summary.total_users
                    ).toFixed(2)
                  : "N/A"}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
 
export default Dashboard;
