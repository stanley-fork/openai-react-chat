import React, { useState, useEffect } from 'react';

export interface ImageSource {
  data: string | null;
  type: 'svg' | 'raster' | null;
}

interface AvatarFieldEditorProps {
  image: ImageSource;
  onImageChange: (newImage: ImageSource) => void;
  readOnly?: boolean;
  size?: number;
}

const AvatarFieldEditor: React.FC<AvatarFieldEditorProps> = ({
                                                               image,
                                                               onImageChange,
                                                               readOnly = false,
                                                               size = 120
                                                             }) => {
  const [imageSrc, setImageSrc] = useState<ImageSource>(image);

  useEffect(() => {
    setImageSrc(image);
  }, [image]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) {
      return;
    }

    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target!.result as string;
        if (file.type.startsWith('image/svg+xml')) {
          setImageSrc({ data: result, type: 'svg' });
          onImageChange({ data: result, type: 'svg' });
        } else if (file.type.startsWith('image/')) {
          const img = new Image();
          img.src = result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > size) {
                height *= size / width;
                width = size;
              }
            } else {
              if (height > size) {
                width *= size / height;
                height = size;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
            }
            const resizedImgDataURL = canvas.toDataURL('image/png');
            setImageSrc({ data: resizedImgDataURL, type: 'raster' });
            onImageChange({ data: resizedImgDataURL, type: 'raster' });
          };
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative flex justify-center items-center">
      {imageSrc.data ? (
        <img
          src={imageSrc.data}
          alt="User Avatar"
          style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{ width: `${size}px`, height: `${size}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed gray', borderRadius: '50%' }}
        >
          <svg
            className="text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ width: `${size * 0.29}px`, height: `${size * 0.29}px` }} // Adjust SVG size relative to the container size
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      )}
      {!readOnly && ( // Conditionally render the input based on readOnly status
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ position: 'absolute', opacity: 0, width: `${size}px`, height: `${size}px`, cursor: 'pointer' }}
        />
      )}
    </div>
  );
};

export default AvatarFieldEditor;