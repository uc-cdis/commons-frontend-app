import { basePath } from 'next/router';
import path from 'path';

export default function myImageLoader({src, width, quality}) {
  if( basePath && path.isAbsolute(src) && !src.includes(basePath) ){
    return `${basePath}${src}?width=${width}&q=${quality || 75}`;
  }
  return `${src}?width=${width}&q=${quality || 75}`;
}
