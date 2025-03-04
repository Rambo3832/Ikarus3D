import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Environment, useGLTF } from '@react-three/drei'
import { useState, useEffect, Suspense } from 'react'
import axios from 'axios'
import SearchBar from './SearchBar'

function Model({ modelUrl, onError, scale =1 }) {
  useGLTF.preload(modelUrl)
  const gltf = useGLTF(modelUrl)
  
  try {
    return <primitive object={gltf.scene}  scale={[scale,scale,scale]}/>

  } catch (error) {
    console.error('Error loading model:', error)
    onError(error)
    return <LoadingBox />
  }
}

function LoadingBox() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="gray" wireframe />
    </mesh>
  )
}

export default function Scene3D() {
  const [autoRotate, setAutoRotate] = useState(true)
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch models from backend
  const fetchModels = async (searchTerm = '') => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`http://localhost:5000/api/models?search=${searchTerm}`)
      setModels(response.data)
      // Select first model if available and no model is currently selected
      if (response.data.length > 0 && !selectedModel) {
        setSelectedModel(response.data[0])
      }
    } catch (err) {
      setError('Failed to fetch models')
      console.error('Error fetching models:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModels()
  }, [])

  const handleSearch = (searchTerm) => {
    fetchModels(searchTerm)
  }

  const handleModelError = (error) => {
    setError(`Failed to load model: ${error.message}`)
  }

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <SearchBar onSearch={handleSearch} />
      
      {error && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'red',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 1000,
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 1000,
        }}>
          Loading...
        </div>
      )}

      <Canvas camera={{ position: [3, 3, 3], fov: 75 }}>
        <color attach="background" args={['#1a1a1a']} />
        
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        
        {/* Environment and Grid */}
        <Environment preset="city" />
        <Grid
          renderOrder={-1}
          position={[0, -0.5, 0]}
          infiniteGrid
          cellSize={0.6}
          cellThickness={0.6}
          cellColor="#6f6f6f"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#9d4b4b"
          fadeDistance={30}
          fadeStrength={1}
        />
        
        {/* Main Content */}
        <Suspense fallback={<LoadingBox />}>
          {selectedModel ? (
            <Model 
              modelUrl={selectedModel.url} 
              onError={handleModelError}
              scale={6}
            />
          ) : (
            <LoadingBox />
          )}
        </Suspense>
        
        {/* Controls */}
        <OrbitControls
        //   autoRotate={autoRotate}
          autoRotateSpeed={2}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
      
      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '14px',
        userSelect: 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '10px',
        borderRadius: '5px',
      }}>
        {/* Space to toggle auto-rotation<br /> */}
        Left click + drag to rotate<br />
        Right click + drag to pan<br />
        Scroll to zoom
      </div>

      {/* Model List */}
      {models.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '80px',
          right: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '10px',
          borderRadius: '5px',
          maxHeight: '60vh',
          overflowY: 'auto',
        }}>
          <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>Available Models</h3>
          {models.map((model) => (
            <div
              key={model.id}
              onClick={() => setSelectedModel(model)}
              style={{
                color: 'white',
                padding: '5px 10px',
                cursor: 'pointer',
                backgroundColor: selectedModel?.id === model.id ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                borderRadius: '3px',
                marginBottom: '5px',
              }}
            >
              {model.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 