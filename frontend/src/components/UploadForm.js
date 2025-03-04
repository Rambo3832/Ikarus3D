import { useState } from 'react';
import axios from 'axios';

export default function UploadForm({ onUploadComplete }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [modelUrl, setModelUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', {
        name,
        description,
        modelUrl
      });

      // Clear form
      setName('');
      setDescription('');
      setModelUrl('');

      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload model');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '80px',
      left: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '20px',
      borderRadius: '5px',
      width: '300px',
      zIndex: 1000,
    }}>
      <h3 style={{ color: 'white', margin: '0 0 15px 0' }}>Upload Model</h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Model name"
            required
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid #666',
              borderRadius: '4px',
              color: 'white',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid #666',
              borderRadius: '4px',
              color: 'white',
              minHeight: '80px',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <input
            type="url"
            value={modelUrl}
            onChange={(e) => setModelUrl(e.target.value)}
            placeholder="Model URL (.glb/.gltf)"
            required
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid #666',
              borderRadius: '4px',
              color: 'white',
            }}
          />
        </div>

        {error && (
          <div style={{
            color: '#ff6b6b',
            marginBottom: '15px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#666' : '#4a9eff',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Uploading...' : 'Upload Model'}
        </button>
      </form>
    </div>
  );
}