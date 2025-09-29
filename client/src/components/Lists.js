import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Lists = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/lists');
      setLists(response.data.lists || []);
    } catch (error) {
      console.error('Error fetching lists:', error);
      setError('Failed to fetch lists');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a CSV, XLS, or XLSX file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size must be less than 5MB');
      return;
    }
    
    setSelectedFile(file);
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('/api/lists/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess(response.data.message);
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('fileInput');
      if (fileInput) fileInput.value = '';
      
      // Refresh lists
      fetchLists();
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (listId) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      try {
        await axios.delete(`/api/lists/${listId}`);
        setSuccess('List deleted successfully');
        fetchLists();
      } catch (error) {
        console.error('Error deleting list:', error);
        setError(error.response?.data?.message || 'Failed to delete list');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="lists-container">Loading lists...</div>;
  }

  return (
    <div className="lists-container">
      <div className="lists-header">
        <h1>Lists Management</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* File Upload Section */}
      <div className="upload-section">
        <h3>Upload New List</h3>
        <div 
          className={`file-upload ${dragOver ? 'dragover' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input
            type="file"
            id="fileInput"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          
          {selectedFile ? (
            <div>
              <p><strong>Selected:</strong> {selectedFile.name}</p>
              <p><strong>Size:</strong> {Math.round(selectedFile.size / 1024)} KB</p>
            </div>
          ) : (
            <div>
              <p>Click here or drag and drop a CSV/Excel file</p>
              <p>Accepted formats: CSV, XLS, XLSX</p>
              <p>Maximum file size: 5MB</p>
            </div>
          )}
        </div>
        
        {selectedFile && (
          <div style={{ marginTop: '1rem' }}>
            <button 
              className="btn btn-success" 
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload and Distribute'}
            </button>
            <button 
              className="btn" 
              onClick={() => {
                setSelectedFile(null);
                document.getElementById('fileInput').value = '';
              }}
              style={{ marginLeft: '1rem' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Lists Display */}
      {lists.length === 0 ? (
        <div className="no-data">
          <p>No lists uploaded yet. Upload your first CSV file to get started.</p>
        </div>
      ) : (
        <div className="lists-display">
          <h3>Uploaded Lists ({lists.length})</h3>
          
          {lists.map((list) => (
            <div key={list._id} className="list-card">
              <div className="list-header">
                <h4>{list.filename}</h4>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleDelete(list._id)}
                >
                  Delete
                </button>
              </div>
              
              <div className="list-meta">
                <span><strong>Total Items:</strong> {list.totalItems}</span>
                <span><strong>Uploaded:</strong> {formatDate(list.createdAt)}</span>
                <span><strong>Agents:</strong> {list.distributions?.length || 0}</span>
              </div>
              
              {list.distributions && list.distributions.length > 0 && (
                <div className="distributions">
                  <h5>Distribution:</h5>
                  {list.distributions.map((dist, index) => (
                    <div key={index} className="distribution-item">
                      <div className="distribution-header">
                        <span className="agent-name">{dist.agentName}</span>
                        <span className="item-count">{dist.itemCount} items</span>
                      </div>
                      
                      {dist.items && dist.items.length > 0 && (
                        <div className="distribution-items">
                          <strong>Sample Items:</strong>
                          <ul>
                            {dist.items.slice(0, 3).map((item, itemIndex) => (
                              <li key={itemIndex}>
                                {item.firstName} - {item.phone}
                                {item.notes && ` (${item.notes})`}
                              </li>
                            ))}
                            {dist.items.length > 3 && (
                              <li>... and {dist.items.length - 3} more items</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Lists;