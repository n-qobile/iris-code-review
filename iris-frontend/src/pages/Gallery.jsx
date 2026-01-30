import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ImageCard from "../components/ImageCard";
import { getImages } from "../services/api";

function Gallery() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const loadImages = async () => {
      const data = await getImages();
      setImages(data);
    };
    loadImages();
  }, []);

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
              <h1 className="page-title">Image Gallery</h1>
              <p className="page-subtitle">Browse all your analysed images</p>
            </div>

            <div className="image-grid">
              {images.map((image) => (
                <ImageCard key={image.id} image={image} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Gallery;
