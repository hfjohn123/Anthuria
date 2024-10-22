export type Message = {
  type: string;
  sender?: string;
  content: string;
  citations?: string[];
  time: Date;
};
