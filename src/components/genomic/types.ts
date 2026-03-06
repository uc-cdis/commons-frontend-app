export interface AnnotationTrack {
  name: string;
  type: string;
  format: string;
  displayMode: 'EXPANDED' | 'COLLAPSED';
  color: string;
}

export interface IgvBrowserConfiguration {
  locus?: string;
  genome: string;
  showDefaultTracks?: boolean;
  track: AnnotationTrack;
}
