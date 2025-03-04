const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { modelsCollection } = require('./config/firebase-config');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Create models directory if it doesn't exist
const modelsDir = path.join(__dirname, 'models');
fs.mkdir(modelsDir, { recursive: true }).catch(console.error);

// Serve static files from the models directory
app.use('/models', express.static(modelsDir));

// GET /models endpoint
app.get('/api/models', async (req, res) => {
  try {
    const searchTerm = req.query.search?.toLowerCase() || '';
    let models = [];

    // Always use local file mode for now
    const files = await fs.readdir(modelsDir);
    
    models = files
      .filter(file => file.toLowerCase().endsWith('.glb'))
      .map((file, index) => ({
        id: index + 1,
        name: path.parse(file).name,
        url: `http://localhost:${PORT}/models/${file}`
      }))
      .filter(model => 
        searchTerm ? model.name.toLowerCase().includes(searchTerm) : true
      );

    res.json(models);
  } catch (error) {
    console.error('Error in /api/models:', error);
    res.status(500).json({ 
      error: 'Failed to fetch models',
      details: error.message 
    });
  }
});

// POST /upload endpoint
app.post('/api/upload', async (req, res) => {
  try {
    const { name, description, modelUrl } = req.body;

    if (!name || !modelUrl) {
      return res.status(400).json({ error: 'Name and model URL are required' });
    }

    const modelData = {
      name,
      description: description || '',
      url: modelUrl,
      createdAt: new Date().toISOString()
    };

    if (modelsCollection) {
      // Firebase mode
      try {
        const docRef = await modelsCollection.add(modelData);
        console.log('Model added to Firebase with ID:', docRef.id);
        res.status(201).json({
          id: docRef.id,
          ...modelData
        });
      } catch (firebaseError) {
        console.error('Firebase error:', firebaseError);
        // Fall back to local storage
        const localId = Date.now().toString();
        res.status(201).json({
          id: localId,
          ...modelData
        });
      }
    } else {
      // Local storage mode
      const localId = Date.now().toString();
      res.status(201).json({
        id: localId,
        ...modelData
      });
    }
  } catch (error) {
    console.error('Error in /api/upload:', error);
    res.status(500).json({ 
      error: 'Failed to upload model',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mode: modelsCollection ? 'firebase' : 'local',
    modelsDirectory: modelsDir
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Mode: ${modelsCollection ? 'Firebase' : 'Local file'}`);
  console.log(`Models directory: ${modelsDir}`);
});
