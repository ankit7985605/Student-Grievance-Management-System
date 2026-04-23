import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [grievances, setGrievances] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Academic');
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem('student'));
  const token = localStorage.getItem('token');

  const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/grievances`,
    headers: { Authorization: `Bearer ${token}` }
  });

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    setLoading(true);
    try {
      const res = await api.get('/');
      setGrievances(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim() === '') {
      fetchGrievances();
      return;
    }
    try {
      const res = await api.get(`/search?title=${term}`);
      setGrievances(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      if (editId) {
        await api.put(`/${editId}`, { title, description, category });
        setMessage('Grievance updated successfully');
        setEditId(null);
      } else {
        await api.post('/', { title, description, category });
        setMessage('Grievance submitted successfully');
      }
      setTitle('');
      setDescription('');
      setCategory('Academic');
      fetchGrievances();
    } catch (err) {
      setMessage('Operation failed');
    }
  };

  const handleEdit = (g) => {
    setEditId(g._id);
    setTitle(g.title);
    setDescription(g.description);
    setCategory(g.category);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this grievance?')) {
      try {
        await api.delete(`/${id}`);
        fetchGrievances();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('student');
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="container">
      <div className="nav">
        <h2>Welcome, {student?.name}</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <h1>Student Grievance Dashboard</h1>

      {message && <div className="alert alert-success">{message}</div>}

      <form onSubmit={handleSubmit}>
        <h3>{editId ? 'Update Grievance' : 'Submit New Grievance'}</h3>
        <input 
          type="text" 
          placeholder="Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
        />
        <textarea 
          placeholder="Description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          required 
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Academic">Academic</option>
          <option value="Hostel">Hostel</option>
          <option value="Transport">Transport</option>
          <option value="Other">Other</option>
        </select>
        <button type="submit">{editId ? 'Update' : 'Submit'}</button>
        {editId && <button type="button" onClick={() => {setEditId(null); setTitle(''); setDescription('');}} style={{backgroundColor: '#7f8c8d'}}>Cancel</button>}
      </form>

      <hr />

      <div className="grievance-list">
        <h2>Your Grievances</h2>
        <input 
          type="text" 
          placeholder="Search by title..." 
          className="search-bar"
          value={searchTerm}
          onChange={handleSearch}
        />

        {loading ? <p style={{textAlign: 'center'}}>Loading...</p> : (
          grievances.length === 0 ? <p style={{textAlign: 'center'}}>No grievances found.</p> : (
            grievances.map(g => (
              <div key={g._id} className="grievance-card">
                <span className={`status-badge status-${g.status.toLowerCase()}`}>
                  {g.status}
                </span>
                <h3>{g.title}</h3>
                <p><strong>Category:</strong> {g.category}</p>
                <p>{g.description}</p>
                <p><small>Date: {new Date(g.date).toLocaleDateString()}</small></p>
                <div style={{marginTop: '10px'}}>
                  <button className="edit-btn" onClick={() => handleEdit(g)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(g._id)}>Delete</button>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

export default Dashboard;
