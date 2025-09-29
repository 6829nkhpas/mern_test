import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/agents');
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingAgent) {
        // Update existing agent
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password; // Don't update password if not provided
        }
        
        await axios.put(`/api/agents/${editingAgent._id}`, updateData);
        setSuccess('Agent updated successfully');
      } else {
        // Create new agent
        await axios.post('/api/agents', formData);
        setSuccess('Agent created successfully');
      }
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
      fetchAgents();
    } catch (error) {
      console.error('Error saving agent:', error);
      setError(error.response?.data?.message || 'Failed to save agent');
    }
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      mobile: agent.mobile,
      password: '' // Don't populate password for security
    });
    setShowModal(true);
  };

  const handleDelete = async (agentId) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await axios.delete(`/api/agents/${agentId}`);
        setSuccess('Agent deleted successfully');
        fetchAgents();
      } catch (error) {
        console.error('Error deleting agent:', error);
        setError(error.response?.data?.message || 'Failed to delete agent');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      mobile: '',
      password: ''
    });
    setEditingAgent(null);
    setError('');
    setSuccess('');
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  if (loading) {
    return <div className="agents-container">Loading agents...</div>;
  }

  return (
    <div className="agents-container">
      <div className="agents-header">
        <h1>Agents Management</h1>
        <button className="btn btn-success" onClick={openCreateModal}>
          Add New Agent
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {agents.length === 0 ? (
        <div className="no-data">
          <p>No agents found. Add your first agent to get started.</p>
        </div>
      ) : (
        <div className="agents-grid">
          {agents.map((agent) => (
            <div key={agent._id} className="agent-card">
              <h3>{agent.name}</h3>
              <p><strong>Email:</strong> {agent.email}</p>
              <p><strong>Mobile:</strong> {agent.mobile}</p>
              <p><strong>Status:</strong> {agent.isActive ? 'Active' : 'Inactive'}</p>
              <p><strong>Created:</strong> {new Date(agent.createdAt).toLocaleDateString()}</p>
              
              <div className="agent-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleEdit(agent)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleDelete(agent._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingAgent ? 'Edit Agent' : 'Add New Agent'}</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="mobile">Mobile Number (with country code)</label>
                <input
                  type="text"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">
                  Password {editingAgent && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingAgent}
                  minLength="6"
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  {editingAgent ? 'Update Agent' : 'Create Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;