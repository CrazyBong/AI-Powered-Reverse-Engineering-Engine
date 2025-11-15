export interface UploadResponse {
  file_id: string;
  status: string;
}

export interface StatusResponse {
  file_id: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
}

export interface FunctionEntry {
  name: string;
  address: string;  // hex string
  size: number;
}

export interface DisassemblyLine {
  offset: number;
  opcode: string;
  disasm: string;
  bytes: string;
  size: number;
  type: string;
  jump?: number;
  comment?: string;
}

export interface DisassemblyResponse {
  function_name: string;
  address: string;
  lines: DisassemblyLine[];
}

export interface ExplanationResponse {
  explanation: string;
  cached?: boolean;
}