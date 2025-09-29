import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalLists: 0,
    totalItems: 0,
    recentLists: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch agents and lists in parallel
      const [agentsResponse, listsResponse] = await Promise.all([
        axios.get("/api/agents"),
        axios.get("/api/lists"),
      ]);

      const agents = agentsResponse.data.agents || [];
      const lists = listsResponse.data.lists || [];

      // Calculate total items across all lists
      const totalItems = lists.reduce(
        (sum, list) => sum + (list.totalItems || 0),
        0
      );

      // Get recent lists (last 5)
      const recentLists = lists.slice(0, 5);

      setStats({
        totalAgents: agents.length,
        totalLists: lists.length,
        totalItems,
        recentLists,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Total Agents</h3>
          <p>{stats.totalAgents}</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Lists</h3>
          <p>{stats.totalLists}</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Items</h3>
          <p>{stats.totalItems}</p>
        </div>
      </div>

      {stats.recentLists.length > 0 && (
        <div className="recent-lists">
          <h3>Recent Lists</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Items</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLists.map((list) => (
                  <tr key={list._id}>
                    <td>{list.filename}</td>
                    <td>{list.totalItems}</td>
                    <td>{new Date(list.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
