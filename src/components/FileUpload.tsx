import { useRef, useState } from 'react';
import { Button, Form, Stack, Spinner } from 'react-bootstrap';
import { uploadMedia } from '../utils/mediaUploader';

type Props = {
  onUploaded?: (payload: { url: string; path: string; fileName: string; }) => void;
  buttonText?: string;
};

export default function FileUpload({ onUploaded, buttonText = 'Upload image' }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handlePick = () => fileInputRef.current?.click();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatus('');
    setPreviewUrl('');
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    const input = fileInputRef.current;
    if (!input?.files?.[0]) {
      setStatus('Please select a file first');
      return;
    }

    setIsUploading(true);
    setStatus('Uploading…');

    try {
      const res = await uploadMedia(input);
      setStatus(`Upload successful: ${res.fileName}`);
      onUploaded?.(res);

    } catch (err) {
      setStatus(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <Form.Control
        type="file"
        accept="image/*"
        onChange={handleChange}
        ref={fileInputRef}
        className="mb-2"
      />

      <Stack direction="horizontal" gap={2} className="mb-2">
        <Button variant="secondary" type="button" onClick={handlePick} disabled={isUploading}>
          Choose file…
        </Button>
        <Button variant="primary" type="button" onClick={handleUpload} disabled={isUploading}>
          {isUploading ? (<><Spinner size="sm" animation="border" /> Uploading…</>) : buttonText}
        </Button>
      </Stack>

      {status && (
        <div className={status.startsWith('Upload failed') ? 'text-danger' : 'text-success'}>
          {status}
        </div>
      )}

      {previewUrl && (
        <div className="mt-2">
          <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
}
