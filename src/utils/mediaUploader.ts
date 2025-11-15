export type UploadedMedia = {
  url: string;
  fileName: string;
  path: string;
};

export async function uploadMedia(fileInputElement: HTMLInputElement): Promise<UploadedMedia> {
  const file = fileInputElement.files?.[0];
  if (!file) throw new Error('No file selected');

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/media-upload', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const text = await response.text();

  if (!response.ok) {
    try {
      const errJson = JSON.parse(text);
      throw new Error(errJson.error || errJson.message || 'Upload failed');
    } catch {
      throw new Error(text || 'Upload failed');
    }
  }

  const json = JSON.parse(text) as { url: string; fileName: string; };
  const url = json.url;
  const fileName = json.fileName;
  const path = url.startsWith('/media/') ? url.slice('/media/'.length) : url;

  return { url, fileName, path };
}
