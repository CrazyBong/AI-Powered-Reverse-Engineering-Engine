export type FileState = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";

export interface FunctionEntry {
  name?: string;
  offset: number;
  size?: number;
  [k: string]: any;
}