import React from "react";

function ImageCard({ image, onDelete }) {
  return (
    <div className="image-card">
      <button 
        className="delete-btn"
        onClick={onDelete}
        title="Delete image"
      >
        🗑️
      </button>
      
      <div className="image-thumbnail">
        {image.s3Url ? (
          <img 
            src={image.s3Url} 
            alt={image.name} 
            style={{width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px'}}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '📷';
            }}
          />
        ) : (
          <div style={{fontSize: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px'}}>📷</div>
        )}
      </div>
      
      <div className="image-info">
        <div className="image-name" title={image.name}>{image.name}</div>
        <div className="image-tags">
          {(image.aiTags || []).map((tag, index) => (
            <span key={index} className="tag ai-tag">
              {tag}
            </span>
          ))}
          {!image.analyzed && <span className="tag">Pending Analysis</span>}
        </div>
        <div className="image-meta">
          {image.analyzed ? "✅ Analysed" : "⏳ Processing"} • {image.size || 'Unknown size'} • {image.uploadedAt || new Date(image.createdAt).toLocaleDateString()}
        </div>
      </div>

      <style jsx>{`
        .image-card {
          position: relative;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .image-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
        }

        .delete-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          font-size: 18px;
          cursor: pointer;
          z-index: 10;
          opacity: 0;
          transition: opacity 0.2s, background 0.2s, transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .image-card:hover .delete-btn {
          opacity: 1;
        }

        .delete-btn:hover {
          background: #EF4444;
          transform: scale(1.1);
        }

        .delete-btn:active {
          transform: scale(0.95);
        }

        .image-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}

export default ImageCard;