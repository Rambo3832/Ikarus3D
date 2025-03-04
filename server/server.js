const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for the React frontend
app.use(cors());

// Serve static files from the models directory
app.use('/models', express.static(path.join(__dirname, 'models')));

// GET /models endpoint
app.get('/api/models', async (req, res) => {
  try {
    const searchTerm = req.query.search?.toLowerCase() || '';
    const modelsDir = path.join(__dirname, 'models');
    
    // Read all files in the models directory
    const files = await fs.readdir(modelsDir);
    
    // Filter .glb files and create model objects
    const models = files
      .filter(file => file.toLowerCase().endsWith('.glb'))
      .map((file, index) => ({
        id: index + 1,
        name: path.parse(file).name,
        url: `http://localhost:${PORT}/models/${file}`
      }))
      // Filter based on search term if provided
      .filter(model => 
        searchTerm ? model.name.toLowerCase().includes(searchTerm) : true
      );

    res.json(models);
  } catch (error) {
    console.error('Error reading models directory:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
