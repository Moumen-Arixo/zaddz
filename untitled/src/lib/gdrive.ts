export async function getOrCreateFolder(token: string, folderName: string, parentId: string = 'root') {
  try {
    const q = encodeURIComponent(`mimeType='application/vnd.google-apps.folder' and name='${folderName.replace(/'/g, "\\'")}' and '${parentId}' in parents and trashed=false`);
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id, name)`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const searchData = await searchRes.json();
    
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }

    // Create if not exists
    const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId]
      })
    });
    const createData = await createRes.json();
    return createData.id;
  } catch (err) {
    console.error("GDRIVE folder error", err);
    return null;
  }
}

export async function uploadFileToGDrive(token: string, file: File, parentId: string) {
  try {
    const metadata = {
      name: file.name,
      parents: [parentId]
    };
    
    const formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    formData.append("file", file);

    const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await res.json();
    
    // We make it accessible to anyone with the link so students can view it
    if (data.id) {
       await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
         method: "POST",
         headers: {
           Authorization: `Bearer ${token}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           role: 'reader',
           type: 'anyone'
         })
       });
    }

    return data;
  } catch (err) {
    console.error("GDRIVE upload error", err);
    return null;
  }
}

export async function setupCourseFoldersInGDrive(token: string, subjectName: string, courseName: string) {
  // 1. Get/Create Root "ZADDZ" or just Subject name
  const subjectFolderId = await getOrCreateFolder(token, subjectName, 'root');
  if (!subjectFolderId) return null;
  
  // 2. Course folder
  const courseFolderId = await getOrCreateFolder(token, courseName, subjectFolderId);
  if (!courseFolderId) return null;

  // 3. Subfolders
  const docId = await getOrCreateFolder(token, "الملفات والمراجع", courseFolderId);
  const vidId = await getOrCreateFolder(token, "الدروس المسجلة", courseFolderId);
  const exeId = await getOrCreateFolder(token, "التمارين والتطبيقات", courseFolderId);

  return {
    courseFolderId,
    subfolders: {
      document: docId,
      video: vidId,
      exercise: exeId
    }
  };
}
