export type Service = {
  id: string;
  name: string;
  ports?: number[];
  command: string;
  description?: string;
  status: "RUNNING" | "STOPPED";
  createdAt: string;
};
