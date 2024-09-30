export type MessageItem = {
  cdt: number;
  id?: number;
  isSender: boolean;
  type: string; // text, image
  userId: number;
  value: string;
};
