import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import UploadSection from '../components/UploadSection';
import StatCard from '../components/StatCard';
import ImageCard from '../components/ImageCard';
import AnalysisPanel from '../components/AnalysisPanel';
import { getImages, getStats, deleteImage } from '../services/api';

function Dashboard() {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [imagesData, statsData] = await Promise.all([
        getImages(),
        getStats()
      ]);
      setImages(imagesData);
      setFilteredImages(imagesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredImages(images);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = images.filter(image => {
      // Search in image name
      if (image.name.toLowerCase().includes(query)) return true;
      
      // Search in AI tags
      if (image.aiTags && image.aiTags.some(tag => 
        tag.toLowerCase().includes(query)
      )) return true;
      
      return false;
    });
    
    setFilteredImages(filtered);
  }, [searchQuery, images]);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleClosePanel = () => {
    setSelectedImage(null);
  };

  const handleDeleteImage = async (imageId, event) => {
    event.stopPropagation(); // Prevent opening the analysis panel
    
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await deleteImage(imageId);
      // Reload data after deletion
      await loadData();
      // Close panel if deleted image was selected
      if (selectedImage && selectedImage.id === imageId) {
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading IRIS...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="iris-background"></div>
      <div className="organic-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      <div className="container">
        <Header />
        
        <div className="main-content">
          <Sidebar />
          
          <main className="content-area">
            <div className="page-header">
              <h1 className="page-title">Welcome to IRIS</h1>
              <p className="page-subtitle">AI-Powered Image Intelligence Platform</p>
            </div>

            <UploadSection onUploadComplete={loadData} />

            {stats && (
              <div className="stats-grid">
                <StatCard value={stats.totalImages} label="Total Images" />
                <StatCard value={stats.analyzed} label="AI Analysed" />
                <StatCard value={stats.objectsDetected} label="Objects Detected" />
                <StatCard value={stats.facesFound} label="Faces Found" />
              </div>
            )}

            <div className="search-section">
              <div className="search-bar">
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search by name, objects, or tags... (e.g., 'person', 'nature')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="search-btn" onClick={() => setSearchQuery('')}>
                  {searchQuery ? '✕ Clear' : '🔍 Search'}
                </button>
              </div>
              {searchQuery && (
                <p className="search-results">
                  Found {filteredImages.length} result{filteredImages.length !== 1 ? 's' : ''} for "{searchQuery}"
                </p>
              )}
            </div>

            <div className="section-header">
              <h2 className="section-title">
                {searchQuery ? 'Search Results' : 'Recent Uploads'}
              </h2>
              <div className="view-options">
                <button className="view-btn active">Grid</button>
                <button className="view-btn">List</button>
              </div>
            </div>

            {filteredImages.length === 0 ? (
              <div className="no-results">
                <p>
                  {searchQuery 
                    ? `No images found matching "${searchQuery}"`
                    : 'No images uploaded yet. Upload your first image above!'
                  }
                </p>
              </div>
            ) : (
              <div className="image-grid">
                {filteredImages.map(image => (
                  <div key={image.id} onClick={() => handleImageClick(image)}>
                    <ImageCard 
                      image={image}
                      onDelete={(e) => handleDeleteImage(image.id, e)}
                    />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {selectedImage && (
        <AnalysisPanel 
          image={selectedImage} 
          onClose={handleClosePanel}
        />
      )}

      <style jsx>{`
        .no-results {
          text-align: center;
          padding: 60px 20px;
          color: #687078;
          font-size: 18px;
        }

        .search-results {
          margin-top: 10px;
          color: #8B5CF6;
          font-size: 14px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

export default Dashboard;