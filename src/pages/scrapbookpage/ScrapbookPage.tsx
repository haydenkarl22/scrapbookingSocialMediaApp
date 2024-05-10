import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fabric } from 'fabric';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase/firebaseConfig';
import './scrapbookpage.css';
import { getAuth } from 'firebase/auth';

const ScrapbookPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      navigate('/profile?mode=signin', { replace: true });
    }
  }, [userId, navigate]);

  useEffect(() => {
    if (canvasRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
      });

      // Clear any existing objects from the canvas
      fabricCanvas.clear();

      fabricCanvas.on('object:selected', (event) => {
        const selectedObject = event.target;
        if (selectedObject) {
          selectedObject.set({
            borderColor: 'red',
            cornerColor: 'red',
            cornerSize: 10,
            transparentCorners: false,
          });
          fabricCanvas.renderAll();
        }
      });

      fabricCanvas.on('object:moving', (event) => {
        fabricCanvas.renderAll();
      });

      fabricCanvas.on('object:rotating', (event) => {
        fabricCanvas.renderAll();
      });

      // Add delete functionality
      window.addEventListener('keydown', (event) => {
        const activeObject = fabricCanvas.getActiveObject();
        if (event.key === 'Delete' && activeObject) {
          fabricCanvas.remove(activeObject);
          fabricCanvas.renderAll();
        }
      });

      setCanvas(fabricCanvas);

      // Clean up the fabric instance and event listener when the component unmounts
      return () => {
        fabricCanvas.dispose();
        window.removeEventListener('keydown', () => {});
      };
    }
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && canvas) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          fabric.Image.fromURL(e.target.result as string, (img) => {
            img.set({
              left: 100,
              top: 100,
              angle: 0,
              padding: 10,
              cornerSize: 10,
              hasRotatingPoint: true,
              hasControls: true,
              selectable: true,
              evented: true,
            });
            img.scaleToWidth(200);
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveScrapbook = async () => {
    if (canvas && userId) {
      const dataURL = canvas.toDataURL();
      const storage = getStorage();
      const scrapbookRef = ref(storage, `scrapbooks/${userId}.png`);
  
      try {
        await uploadString(scrapbookRef, dataURL, 'data_url');
        const downloadURL = await getDownloadURL(scrapbookRef);
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, { scrapbookUrl: downloadURL });
        alert('Scrapbook saved successfully!');
      } catch (error) {
        console.error('Error saving scrapbook:', error);
        alert('Failed to save scrapbook. Please try again.');
      }
    }
  };

  const handleAddText = () => {
    if (text.trim() !== '' && canvas) {
      const textBox = new fabric.Textbox(text, {
        left: 100,
        top: 100,
        width: 200,
        fontSize: 20,
        fontFamily: 'Arial',
        fill: 'black',
        hasControls: true,
        selectable: true,
      });
      canvas.add(textBox);
      canvas.setActiveObject(textBox);
      canvas.renderAll();
      setText('');
    }
  };

  const handleResetScrapbook = () => {
    if (window.confirm('Are you sure you want to reset your scrapbook? This action cannot be undone.')) {
      canvas?.clear();
      canvas?.renderAll();
      alert('Scrapbook has been reset.');
    }
  };

  if (!userId) {
    return <div>Sign in to make a scrapbook.</div>;
  }

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
      <div className="scrapbook-container">
        <div className="canvas-container">
          <canvas ref={canvasRef} className="canvas" width={800} height={600} />
        </div>
        <div className="button-container">
          <input type="file" onChange={handleImageUpload} accept="image/*" />
          <button onClick={handleSaveScrapbook}>Save Scrapbook</button>
          <button onClick={handleResetScrapbook}>Reset Scrapbook</button>
          <div className="input-text-container">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text..."
            />
            <button onClick={handleAddText}>Add Text</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScrapbookPage;