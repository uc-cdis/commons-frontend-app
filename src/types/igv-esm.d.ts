declare module 'igv/dist/igv.esm.min.js' {
  export interface IgvBrowser {
    dispose?: () => void | Promise<void>;
    loadTrack?: (track: any) => Promise<any>;
    search?: (locus: string) => Promise<void>;
  }

  export interface IgvModule {
    createBrowser: (el: HTMLElement, options: any) => Promise<IgvBrowser>;
  }

  const igv: IgvModule;
  export default igv;
}
