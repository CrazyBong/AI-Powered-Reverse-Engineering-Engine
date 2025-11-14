/// <reference types="vite/client" />

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function jsonFetch(url: string, opts: RequestInit = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: {
      // allow file uploads to set their own content-type
      Accept: "application/json",
      ...opts.headers,
    },
    ...opts,
  });
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw { status: res.status, data };
    return data;
  } catch (e) {
    if (e instanceof SyntaxError) {
      // non-json body
      if (!res.ok) throw { status: res.status, body: text };
      return text;
    }
    throw e;
  }
}

export async function uploadFile(file: File) {
  const fd = new FormData();
  fd.append("file", file, file.name);
  const res = await fetch(`${BASE}/upload/`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Upload failed: ${res.status} ${t}`);
  }
  return res.json();
}

export async function getStatus(fileId: string) {
  return jsonFetch(`/status/${fileId}`);
}

export async function getFunctions(fileId: string) {
  return jsonFetch(`/functions/${fileId}`);
}

export async function getDisassembly(fileId: string, addr: string) {
  return jsonFetch(`/disassembly/${fileId}/${addr}`);
}

/**
 * Fetch explanation from backend.
 * Returns { file_id, addr, explanation }.
 */
export async function getExplanation(fileId: string, addr: string) {
  const res = await fetch(`${BASE}/explain/${fileId}/${addr}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch explanation: ${res.status}`);
  }
  return res.json();
}