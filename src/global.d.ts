declare module '*.woff2' {
  const src: string;
  export default src;
}
declare const require: {
  context(dir: string, recursive: boolean, filter: RegExp): {
    keys(): string[];
    (id: string): unknown;
  };
};
