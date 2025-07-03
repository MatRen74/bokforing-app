import React, { useRef, useState } from 'react';
import { DocumentArrowUpIcon } from './icons/DocumentArrowUpIcon';

interface FileUploadProps {
  onFileProcessed: (content: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const processFile = (file: File) => {
    if (file && (file.name.endsWith('.se') || file.name.endsWith('.si'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          onFileProcessed(text);
        }
      };
      // SIE files often use this encoding, not UTF-8.
      reader.readAsText(file, 'ISO-8859-1');
    } else {
      alert('Vänligen välj en giltig SIE-fil (med filändelsen .se eller .si)');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const onBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl text-center">
      <h1 className="text-5xl font-bold text-gray-100 mb-2">Bokföring man kan känna</h1>
      <p className="text-xl text-gray-400 mb-8">Ladda upp din SIE4-fil för att omvandla siffror till insikt.</p>

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-xl transition-colors duration-300 ${isDragging ? 'border-sky-400 bg-sky-900/50' : 'border-gray-600 hover:border-sky-500 hover:bg-gray-800/50'}`}
      >
        <DocumentArrowUpIcon className="w-16 h-16 mb-4 text-gray-500" />
        <p className="text-lg text-gray-300">Dra och släpp din SIE-fil här</p>
        <p className="text-gray-500 my-2">eller</p>
        <button
          onClick={onBrowseClick}
          className="px-6 py-2 bg-sky-600 hover:bg-sky-700 rounded-md font-semibold transition-colors"
        >
          Välj fil från datorn
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".si,.se"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
       <p className="text-xs text-gray-600 mt-4 max-w-md mx-auto">Filen analyseras i din webbläsare. Vid syntaxfel eller logiska problem kan delar av innehållet skickas till en säker AI-tjänst för att ge förslag.</p>
    </div>
  );
};

export default FileUpload;
