import type {
  UploadResponse,
  StatusResponse,
  FunctionEntry,
  DisassemblyResponse,
  ExplanationResponse,
} from '../types';

// Safe environment variable access
const getBaseUrl = () => {
  try {
    // @ts-ignore
    return typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE 
      // @ts-ignore
      ? import.meta.env.VITE_API_BASE 
      : 'http://localhost:8000';
  } catch (e) {
    return 'http://localhost:8000';
  }
};

const BASE = getBaseUrl();
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

export async function uploadFile(file: File) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/upload/`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error("Upload failed");

  return await res.json(); // { file_id, status }
}

export async function getStatus(fileId: string) {
  const res = await fetch(`${BASE}/status/${fileId}`);

  if (!res.ok) throw new Error("Status check failed");

  return await res.json(); // { file_id, status }
}

export async function getFunctions(fileId: string) {
  const res = await fetch(`${BASE}/functions/${fileId}`);
  if (!res.ok) throw new Error("Failed to load functions");

  const data = await res.json();

  return data.functions.map((fn: any) => ({
    name: fn.name,
    address: "0x" + fn.offset.toString(16),  // convert number → hex string
    size: fn.size,
  }));
}

export async function getDisassembly(fileId: string, addr: string) {
  // Convert address from hex string (0x1234) to decimal string (4660)
  const addrDecimal = parseInt(addr, 16).toString();
  
  const res = await fetch(`${BASE}/disassembly/${fileId}/${addrDecimal}`);
  if (!res.ok) throw new Error("Failed to load disassembly");

  const data = await res.json();

  return {
    function_name: data.disassembly.name || `Function at ${data.addr}`,  
    address: data.addr,
    lines: data.disassembly.ops.map((op: any) => ({
      offset: op.offset,
      opcode: op.opcode || op.disasm || '',
      disasm: op.disasm || op.opcode || '',
      bytes: op.bytes || "",
      size: op.size || 0,
      type: op.type || 'unknown',
      jump: op.jump,
      comment: op.comment || "",
    })),
  };
}

export async function getExplanation(fileId: string, addr: string) {
  // Convert address from hex string (0x1234) to decimal string (4660)
  const addrDecimal = parseInt(addr, 16).toString();
  
  const cacheKey = `explain:${fileId}:${addrDecimal}`;

  // 1) Check localStorage
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    return { explanation: cached, cached: true };
  }

  // 2) Fetch backend
  const res = await fetch(`${BASE}/explain/${fileId}/${addrDecimal}`);
  if (!res.ok) throw new Error("Failed to load explanation");

  const data = await res.json();

  // 3) Cache result
  localStorage.setItem(cacheKey, data.explanation);

  return { explanation: data.explanation, cached: false };
}

export interface CFGBlock {
  offset: string;
  size: number;
  jump?: string;
  fail?: string;
  instructions?: Array<{
    offset: string;
    opcode: string;
    disasm: string;
  }>;
}

export interface CFGResponse {
  file_id: string;
  address: string;
  blocks: CFGBlock[];
}

export const getCFG = async (fileId: string, address: string) => {
  const addr = address?.toString() ?? '';
  if (!fileId || !addr) throw new Error('fileId and address are required');
  const res = await fetch(`${API_BASE_URL}/cfg/${encodeURIComponent(fileId)}/${encodeURIComponent(addr)}`);
  if (!res.ok) throw new Error(`Failed to fetch CFG (${res.status})`);
  return res.json();
};