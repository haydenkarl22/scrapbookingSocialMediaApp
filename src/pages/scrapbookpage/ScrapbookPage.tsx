import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import './scrapbookpage.css';

interface ImagePosition {
  x: number;
  y: number;
}

interface TextElement {
  text: string;
  position: ImagePosition;
}

const ScrapbookPage: React.FC = () => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<{ file: File; position: ImagePosition }[]>([]);
  const [textElements, setTextElements] = useState<TextElement[]>([]);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImages([...images, { file: event.target.files[0], position: { x: 0, y: 0 } }]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      setImages([
        ...images,
        { file: files[0], position: { x: event.clientX, y: event.clientY } },
      ]);
    }
  };

  const handleImageDrag = (event: React.DragEvent<HTMLImageElement>, index: number) => {
    event.preventDefault();
    const target = event.target as HTMLImageElement;
    const rect = target.getBoundingClientRect();
    const newImages = [...images];
    newImages[index].position = {
      x: event.clientX - rect.width / 2,
      y: event.clientY - rect.height / 2,
    };
    setImages(newImages);
  };

  const handleAddText = () => {
    if (text.trim()) {
      setTextElements([...textElements, { text: text.trim(), position: { x: 0, y: 0 } }]);
      setText('');
    }
  };

  return (
    <>
      <header className="nohead">ScrapP@ges</header>
      <div className="buttonbar">
        <Link to="/friends" className="friendsbutton">
          Friends
        </Link>
        <Link to="/" className="homebutton">
          Home
        </Link>
        <Link to="/profile" className="profilebutton">
          My Profile
        </Link>
        <Link to="/scrapbook" className="scrapbookbutton">
          Scrapbook
        </Link>
      </div>
      <div className="subDiv">
        <div className="sub">
          <textarea value={text} onChange={handleTextChange} placeholder="Enter text..." />
          <button onClick={handleAddText}>Add Text</button>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
              position: 'relative',
              width: '100%',
              height: '500px',
              border: '2px dashed #ccc',
              padding: '20px',
            }}
          >
            {images.map((image, index) => (
              <img
                key={index}
                src={URL.createObjectURL(image.file)}
                alt="Uploaded"
                style={{
                  position: 'absolute',
                  left: image.position.x,
                  top: image.position.y,
                  cursor: 'move',
                  maxWidth: '200px',
                  maxHeight: '200px',
                }}
                draggable
                onDragStart={(event) => event.dataTransfer.setData('text/plain', '')}
                onDrag={(event) => handleImageDrag(event, index)}
              />
            ))}
            {textElements.map((textElement, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  left: textElement.position.x,
                  top: textElement.position.y,
                  cursor: 'move',
                }}
              >
                {textElement.text}
              </div>
            ))}
            <input type="file" onChange={handleImageChange} accept="image/*" />
          </div>
        </div>
      </div>
    </>
  );
};

export default ScrapbookPage;