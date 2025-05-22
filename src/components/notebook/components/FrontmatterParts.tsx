import React from 'react';
import { type KnownParts } from './utils';
import { Abstract } from './Abstract';
import { Keywords } from './Keywords';

export function FrontmatterParts({
  parts,
  keywords,
  hideKeywords,
  containerClassName,
  innerClassName,
}: {
  parts: KnownParts;
  keywords?: string[];
  hideKeywords?: boolean;
  containerClassName?: string;
  innerClassName?: string;
}) {
  if (!parts.abstract && !parts.keypoints && !parts.summary) return null;
  return (
    <div className={containerClassName}>
      <Abstract className={innerClassName} content={parts.abstract} />
      <Abstract
        className={innerClassName}
        content={parts.keypoints}
        title="Key Points"
        id="keypoints"
      />
      <Abstract
        className={innerClassName}
        content={parts.summary}
        title="Plain Language Summary"
        id="summary"
      />
      <Keywords className={innerClassName} keywords={keywords} hideKeywords={hideKeywords} />
    </div>
  );
}
