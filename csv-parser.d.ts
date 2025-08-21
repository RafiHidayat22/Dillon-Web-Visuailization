declare module 'csv-parser' {
  import { Transform } from 'stream';
  interface CsvParserOptions {
    separator?: string;
    newline?: string;
    headers?: boolean | string[];
    mapHeaders?: (args: { header: string; index: number }) => string | null;
    mapValues?: (args: { header: string; index: number; value: string }) => string;
    strict?: boolean;
  }
  function csvParser(opts?: CsvParserOptions): Transform;
  export = csvParser;
}
