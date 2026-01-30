const API_BASE = "https://mzjssilu9k.execute-api.eu-north-1.amazonaws.com";

export async function getImages() {
  const res = await fetch(`${API_BASE}/images`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to load images");
  return data.images;
}

export async function uploadImage(file) {
  // 1) get presigned URL
  const presignRes = await fetch(`${API_BASE}/images/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || "application/octet-stream",
    }),
  });

  const presignData = await presignRes.json();
  if (!presignRes.ok) throw new Error(presignData?.error || "Presign failed");

  // 2) upload to S3 using the presigned URL
  const putRes = await fetch(presignData.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });

  if (!putRes.ok) throw new Error("S3 upload failed");

  // 3) return created image record
  return presignData.image;
}

export async function analyzeImage(imageId) {
  const res = await fetch(`${API_BASE}/analysis/${imageId}/analyze`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Analyse failed");
  return data.analysis;
}

export async function getAnalysis(imageId) {
  const res = await fetch(`${API_BASE}/analysis/${imageId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Get analysis failed");
  return data.analysis;
}

export async function getStats() {
  const res = await fetch(`${API_BASE}/stats`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Stats failed");
  return data.stats;
}

export async function deleteImage(imageId) {
  const res = await fetch(`${API_BASE}/images/${imageId}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Delete failed");
  return data;
}