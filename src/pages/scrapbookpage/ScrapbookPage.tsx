import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fabric } from 'fabric';
import { getStorage, ref, uploadString } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase/firebaseConfig';
import './scrapbookpage.css';
import { getAuth } from 'firebase/auth';

const ScrapbookPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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
    if (canvasRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current);
      
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
  
      setCanvas(fabricCanvas);
    }
  }, []);
  

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
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
              selectable: true, // Add this line
              evented: true,
            });
            img.scaleToWidth(200);
            canvas?.add(img);
            canvas?.setActiveObject(img);
            canvas?.renderAll();
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveScrapbook = async () => {
    if (canvas && userId) {
      const dataURL = canvas.toDataURL();
      const scrapbookRef = ref(storage, `scrapbooks/${userId}.png`);
      try {
        await uploadString(scrapbookRef, dataURL, 'data_url');
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, { scrapbookUrl: dataURL });
        alert('Scrapbook saved successfully!');
      } catch (error) {
        console.error('Error saving scrapbook:', error);
        alert('Failed to save scrapbook. Please try again.');
      }
    }
  };

  const handleLoadScrapbook = async () => {
    if (userId) {
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const scrapbookUrl = userDoc.data().scrapbookUrl;
          if (scrapbookUrl) {
            fabric.Image.fromURL(scrapbookUrl, (img) => {
              canvas?.clear();
              canvas?.add(img);
              canvas?.renderAll();
            });
          }
        }
      } catch (error) {
        console.error('Error loading scrapbook:', error);
        alert('Failed to load scrapbook. Please try again.');
      }
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
      <div className="scrapbook-container">
        <div className="canvas-container">
          <canvas ref={canvasRef} width={800} height={600} />
        </div>
        <div className="button-container">
          <input type="file" onChange={handleImageUpload} accept="image/*" />
          <button onClick={handleSaveScrapbook}>Save Scrapbook</button>
          <button onClick={handleLoadScrapbook}>Load Scrapbook</button>
        </div>
      </div>
    </>
  );
};

export default ScrapbookPage;