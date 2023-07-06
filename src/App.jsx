import React, { useState, useEffect } from 'react';
import Dropzone from 'react-dropzone';
import { IoMoonOutline, IoSunnyOutline, IoCopy } from 'react-icons/io5';
import { FaGithub } from 'react-icons/fa';
import { FiServer } from 'react-icons/fi';
import './styles/App.css';


function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [showLinkDiv, setShowLinkDiv] = useState(false);


  const handleFileDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.size <= 100 * 1024 && file.type.startsWith('image/')) {
      setUploadedFile(file);
      uploadFile(file);
    } else {
      // Show warning message
      const popup = document.createElement('div');
      popup.innerText = 'Invalid file! Please upload an image file (less than 100 KB).';
      popup.className = 'popup';

      document.body.appendChild(popup);

      setTimeout(() => {
        popup.remove();
      }, 5000);
    }
  };

const uploadFile = (file) => {
  setShowLinkDiv(false);
  const reader = new FileReader();
  reader.onload = () => {
    const fileDataUrl = reader.result;
    setFileUrl(fileDataUrl);

    // Upload file to GitHub repository 
    const githubRepo = import.meta.env.VITE_GITHUB_REPO;
    const fileName = `uploads/${file.name}`;
    const fileContent = btoa(fileDataUrl.split(',')[1]); // Convert base64 string
    const commitMessage = `Upload ${file.name}`;

    const apiUrl = `https://api.github.com/repos/${githubRepo}/contents/${fileName}`;
    fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${import.meta.env.VITE_GITHUB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: commitMessage,
        content: fileContent,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        const uploadedFileUrl = data.content.download_url;
        setFileUrl(uploadedFileUrl);
        setShowLinkDiv(true);

        // Generate link for the uploaded file
        const link = document.createElement('a');
        link.href = uploadedFileUrl;
        link.target = '_blank';
        link.innerText = 'Download File';
        document.body.appendChild(link);
      })
      .catch((error) => console.error(error));
  };

  reader.readAsDataURL(file);
};

const handleLinkCopy = () => {
  const linkInput = document.getElementById('link-input');
  linkInput.select();
  document.execCommand('copy');

  // Show warning message
  const popup = document.createElement('div');
  popup.innerText = 'Link copied to clipboard!';
  popup.className = 'popup';

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 3000);
};



  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if(newDarkMode) {
      localStorage.theme = 'light'
    } else {
      localStorage.theme = 'dark'      
    }
  };

  return (
    <div className={`App ${darkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-slate-800">
        <div className="container mx-auto p-4 vh-100 cb text-slate-900 dark:text-slate-300  min-h-screen">

          <div className="flex justify-between items-center px-6">
            <a
                href="https://github.com/your-username/your-repo"
                target="_blank"
                rel="noopener noreferrer"
                className="btn text-gray-600 dark:text-gray-400 text-sm"
              >
                <FaGithub size={20} className="inline-block align-text-bottom mr-1" />
                View on GitHub
              </a>
            <button onClick={toggleDarkMode} className="theme-toggle-button shadow-xl">
              {darkMode ? <IoSunnyOutline size={22} /> : <IoMoonOutline size={22} />}
            </button>
          </div>

          <h1 className="text-2xl tracking-wider text-center my-5 p-5 subpixel-antialiased font-extrabold bg-gray-200 dark:bg-gray-800 rounded">
            <span className="flex items-center justify-center">
              <FiServer className="mr-2" size={24} />
              Lite Host
            </span>
          </h1>

          <Dropzone onDrop={handleFileDrop}>
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps({ className: 'dropzone-container align-middle cursor-cell' })}>
                <input {...getInputProps()} type="file" accept=".jpg, .jpeg, .png, .svg, .webp" multiple={false} />
                <p>
                  Drag and drop an image file here, or 
                  <span class="m-2 py-1 px-2 rounded-full border-0 text-sm font-semibold bg-violet-50 text-violet-700">click to select a file</span>
                </p>
                <p className="text-slate-500 text-sm">( You can upload an image file with a size less than 100 KB. )</p>
              </div>
            )}
          </Dropzone>

          {fileUrl && <img src={fileUrl} alt="Uploaded file" className="uploaded-file" />}

          {showLinkDiv && (
            <div className="text-center mt-4 rounded">
              <div className="flex items-center justify-center">
                <input
                  type="text"
                  id="link-input"
                  value={fileUrl}
                  readOnly
                  className="border p-2 bg-gray-200 w-full dark:bg-gray-800 select-all"
                />
                <button
                  onClick={handleLinkCopy}
                  className="px-4 py-2 border bg-gray-300 text-gray-800 hover:bg-gray-300 flex items-center"
                >
                  <IoCopy size={24} className="" />
                </button>
              </div>
            </div>

          )}

        </div>
      </div>
    </div>
  );
}

export default App;