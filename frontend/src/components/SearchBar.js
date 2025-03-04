import { useState } from 'react'

export default function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
    }}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search models..."
          style={{
            padding: '8px 16px',
            fontSize: '16px',
            borderRadius: '20px',
            border: '1px solid #666',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            width: '300px',
          }}
        />
      </form>
    </div>
  )
} 