import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { Avatar, Box } from '@mui/material';
import { useState } from 'react';

interface LogoUploadProps {
  value?: string;
  onChange: (file: File | null, previewUrl: string | null) => void;
}

export default function LogoUpload({ value, onChange }: LogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setPreview(url);
        onChange(file, url);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      onChange(null, null);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 3,
      }}
    >
      <label htmlFor="logo-upload-input">
        <input
          id="logo-upload-input"
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />
        <Avatar
          src={preview || undefined}
          sx={{
            width: 100,
            height: 100,
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: 'divider',
            '&:hover': { borderColor: 'primary.main' },
          }}
        >
          {!preview && <AddAPhotoIcon fontSize="large" />}
        </Avatar>
      </label>
    </Box>
  );
}
