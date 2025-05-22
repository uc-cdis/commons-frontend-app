
export interface MystMdConfiguration {
   projectPath: string;
   rewriteLinks?: LinkRewriteOptions;
}

export interface LinkRewriteOptions {
  rewriteStaticFolder?: boolean
};
