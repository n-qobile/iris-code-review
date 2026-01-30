import React, { useState, useEffect } from 'react';
import { getAnalysis } from '../services/api';

function AnalysisPanel({ image, onClose }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (image && image.analyzed) {
      loadAnalysis();
    }
  }, [image]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const data = await getAnalysis(image.id);
      setAnalysis(data);
    } catch (error) {
      console.error('Error loading analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!image) return null;

  return (
    <div className="analysis-overlay" onClick={onClose}>
      <div className="analysis-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <div className="analysis-content">
          {/* Image Section */}
          <div className="analysis-image-section">
            <img 
              src={image.s3Url} 
              alt={image.name}
              className="analysis-image-full"
            />
            <div className="image-info-detail">
              <h2>{image.name}</h2>
              <p>Uploaded: {new Date(image.createdAt).toLocaleString()}</p>
              <p>Status: {image.analyzed ? '✅ Analysed' : '⏳ Pending'}</p>
            </div>
          </div>

          {/* Analysis Results Section */}
          <div className="analysis-results-section">
            {loading ? (
              <div className="loading">Loading analysis...</div>
            ) : !image.analyzed ? (
              <div className="not-analyzed">
                <p>This image hasn't been analysed yet.</p>
                <button className="analyze-btn">Analyse Now</button>
              </div>
            ) : analysis ? (
              <>
                {/* Labels/Objects Detected */}
                {analysis.labels && analysis.labels.length > 0 && (
                  <div className="analysis-section">
                    <h3>🏷️ Objects Detected</h3>
                    <div className="labels-grid">
                      {analysis.labels.map((label, idx) => (
                        <div key={idx} className="label-card">
                          <span className="label-name">{label.name}</span>
                          <span className="label-confidence">
                            {Math.round(label.confidence)}%
                          </span>
                          <div className="confidence-bar">
                            <div 
                              className="confidence-fill"
                              style={{width: `${label.confidence}%`}}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Faces Detected */}
                {analysis.faces && analysis.faces.length > 0 && (
                  <div className="analysis-section">
                    <h3>😊 Faces Detected ({analysis.faces.length})</h3>
                    {analysis.faces.map((face, idx) => (
                      <div key={idx} className="face-card">
                        <h4>Face {idx + 1}</h4>
                        {face.ageRange && (
                          <p>
                            <strong>Age Range:</strong> {face.ageRange.Low} - {face.ageRange.High} years
                          </p>
                        )}
                        {face.emotions && face.emotions.length > 0 && (
                          <div className="emotions">
                            <strong>Emotions:</strong>
                            <div className="emotions-list">
                              {face.emotions
                                .sort((a, b) => b.Confidence - a.Confidence)
                                .slice(0, 3)
                                .map((emotion, i) => (
                                  <span key={i} className="emotion-tag">
                                    {emotion.Type}: {Math.round(emotion.Confidence)}%
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                        <p>
                          <strong>Confidence:</strong> {Math.round(face.confidence)}%
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Text Detected */}
                {analysis.textDetections && analysis.textDetections.length > 0 && (
                  <div className="analysis-section">
                    <h3>📝 Text Detected</h3>
                    <div className="text-detections">
                      {analysis.textDetections
                        .filter(text => text.type === 'LINE')
                        .map((text, idx) => (
                          <div key={idx} className="text-item">
                            <span className="text-content">"{text.text}"</span>
                            <span className="text-confidence">
                              {Math.round(text.confidence)}%
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {(!analysis.labels || analysis.labels.length === 0) &&
                 (!analysis.faces || analysis.faces.length === 0) &&
                 (!analysis.textDetections || analysis.textDetections.length === 0) && (
                  <div className="no-results">
                    <p>No objects, faces, or text detected in this image.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="error">Failed to load analysis results.</div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .analysis-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .analysis-modal {
          background: white;
          border-radius: 16px;
          max-width: 1200px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 24px;
          cursor: pointer;
          z-index: 10;
          transition: background 0.3s;
        }

        .close-btn:hover {
          background: rgba(0, 0, 0, 0.8);
        }

        .analysis-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          padding: 30px;
        }

        .analysis-image-section {
          position: sticky;
          top: 30px;
          height: fit-content;
        }

        .analysis-image-full {
          width: 100%;
          height: auto;
          max-height: 500px;
          object-fit: contain;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .image-info-detail {
          margin-top: 20px;
        }

        .image-info-detail h2 {
          font-size: 24px;
          margin-bottom: 10px;
          color: #232F3E;
        }

        .image-info-detail p {
          margin: 5px 0;
          color: #545B64;
        }

        .analysis-results-section {
          overflow-y: auto;
        }

        .analysis-section {
          margin-bottom: 30px;
        }

        .analysis-section h3 {
          font-size: 20px;
          margin-bottom: 15px;
          color: #232F3E;
          border-bottom: 2px solid #8B5CF6;
          padding-bottom: 8px;
        }

        .labels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
        }

        .label-card {
          background: #F7F9FA;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #E1E8ED;
        }

        .label-name {
          display: block;
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 8px;
          color: #232F3E;
        }

        .label-confidence {
          display: block;
          font-size: 14px;
          color: #8B5CF6;
          margin-bottom: 8px;
        }

        .confidence-bar {
          width: 100%;
          height: 6px;
          background: #E1E8ED;
          border-radius: 3px;
          overflow: hidden;
        }

        .confidence-fill {
          height: 100%;
          background: linear-gradient(90deg, #8B5CF6, #A78BFA);
          transition: width 0.3s ease;
        }

        .face-card {
          background: #F7F9FA;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 15px;
          border-left: 4px solid #8B5CF6;
        }

        .face-card h4 {
          margin-top: 0;
          margin-bottom: 10px;
          color: #8B5CF6;
        }

        .face-card p {
          margin: 8px 0;
          color: #545B64;
        }

        .emotions-list {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .emotion-tag {
          background: #8B5CF6;
          color: white;
          padding: 5px 12px;
          border-radius: 16px;
          font-size: 12px;
        }

        .text-detections {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .text-item {
          background: #F7F9FA;
          padding: 15px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .text-content {
          font-size: 16px;
          color: #232F3E;
          flex: 1;
        }

        .text-confidence {
          color: #8B5CF6;
          font-weight: bold;
          margin-left: 15px;
        }

        .loading, .not-analyzed, .no-results, .error {
          text-align: center;
          padding: 40px;
          color: #545B64;
        }

        .analyze-btn {
          background: #8B5CF6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 15px;
          transition: background 0.3s;
        }

        .analyze-btn:hover {
          background: #7C3AED;
        }

        @media (max-width: 768px) {
          .analysis-content {
            grid-template-columns: 1fr;
          }

          .analysis-image-section {
            position: relative;
            top: 0;
          }

          .labels-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default AnalysisPanel;