import { getAccessToken } from './googleDriveAuth';

export interface DriveFileMetadata {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
  size?: string;
}

/**
 * Uploads a Vehicle Intelligence & Next Location Prediction Report to Google Drive.
 */
export async function uploadVehicleReportToDrive(
  vehiclePlate: string,
  reportData: Record<string, any>
): Promise<DriveFileMetadata> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Drive access token missing. Please sign in with Google.');
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `EAGLE_EYE_PREDICTION_${vehiclePlate}_${timestamp}.json`;

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: `Vehicle Surveillance & Next Location Prediction Intelligence Dossier for ${vehiclePlate} created by EagleEye Command Center`
  };

  const fileContent = JSON.stringify(reportData, null, 2);

  // Multi-part upload request
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,createdTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload dossier to Google Drive (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Lists previously generated vehicle dossiers stored in Google Drive.
 */
export async function listSavedDossiers(): Promise<DriveFileMetadata[]> {
  const token = await getAccessToken();
  if (!token) {
    return [];
  }

  const query = "name contains 'EAGLE_EYE_PREDICTION_' and trashed = false";
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,mimeType,webViewLink,createdTime,size)&orderBy=createdTime desc&pageSize=15`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Error listing Drive files:', err);
    return [];
  }

  const data = await response.json();
  return data.files || [];
}
