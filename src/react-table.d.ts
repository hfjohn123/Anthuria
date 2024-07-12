import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta {
    type?: string;
    wrap: boolean;
  }
}
