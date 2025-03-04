const admin = require('firebase-admin');
const path = require('path');

try {
  let serviceAccount;
  try {
    serviceAccount = require('./serviceAccountKey.json');
  } catch (err) {
    console.error('Failed to load serviceAccountKey.json:', err.message);
    throw new Error('ServiceAccountKey not found or invalid');
  }

  if (!serviceAccount.project_id || !serviceAccount.private_key) {
    throw new Error('Invalid service account configuration');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const db = admin.firestore();
  const modelsCollection = db.collection('models');

  console.log('Firebase initialized successfully');
  module.exports = { db, modelsCollection };

} catch (error) {
  console.error('Error initializing Firebase:', error.message);
  console.log('Falling back to local file mode');
  
  // Provide mock implementations for development without Firebase
  module.exports = {
    db: null,
    modelsCollection: null
  };
} 