export const data = {
  name: 'gwas-workflow-1000001',
  phase: 'Succeeded',
  gen3username: 'user996@example.com',
  submittedAt: '2024-12-23T04:23:53Z',
  startedAt: '2024-12-23T04:23:53Z',
  finishedAt: '2025-01-07T02:32:30Z',
  wf_name: 'test 1',
  arguments: {
    parameters: [
      {
        name: 'n_pcs',
        value: '3',
      },
      {
        name: 'variables',
        value:
          '[{"variable_type": "concept", "concept_id": 5350450469, "concept_name": "Theta Baseline Index"}, {"variable_type": "concept", "concept_id": 1321922298, "concept_name": "Delta Parameter Reading"}, {"variable_type": "concept", "concept_id": 3723846140, "concept_name": "Eta Composite Score"}]',
      },
      {
        name: 'out_prefix',
        default: 'genesis_vadc',
        value: '3859895161',
      },
      {
        name: 'outcome',
        value:
          '{"variable_type": "concept", "concept_id": 3723846140, "concept_name": "Eta Composite Score"}',
      },
      {
        name: 'hare_population',
        value: 'Group C',
      },
      {
        name: 'hare_concept_id',
        default: '8361572894',
        value: '8361572894',
      },
      {
        name: 'maf_threshold',
        value: '0.01',
      },
      {
        name: 'imputation_score_cutoff',
        value: '0.3',
      },
      {
        name: 'template_version',
        value: 'gwas-template-genesisupdate',
      },
      {
        name: 'source_id',
        value: '12',
      },
      {
        name: 'source_population_cohort',
        value: '2356',
      },
      {
        name: 'workflow_name',
        value: 'test 1',
      },
      {
        name: 'team_project',
        value: '/research_projects/PROJECT_BETA',
      },
      {
        name: 'genome_build',
        default: 'hg19',
        value: 'hg19',
        enum: ['hg38', 'hg19'],
      },
      {
        name: 'pca_file',
        value: '/commons-data/pcs.RData',
      },
      {
        name: 'relatedness_matrix_file',
        value: '/commons-data/KINGmatDeg3.RData',
      },
      {
        name: 'widget_table',
        value: '/commons-data/mvp_widget_table.csv',
      },
      {
        name: 'related_samples',
        value: '/commons-data/related_samples.csv',
      },
      {
        name: 'n_segments',
        value: '0',
      },
      {
        name: 'segment_length',
        default: '2000',
        value: '2000',
      },
      {
        name: 'variant_block_size',
        default: '1024',
        value: '100',
      },
      {
        name: 'mac_threshold',
        value: '0',
      },
      {
        name: 'gds_files',
        value:
          '["/commons-data/gds/chr1.merged.vcf.gz.gds", "/commons-data/gds/chr2.merged.vcf.gz.gds", "/commons-data/gds/chr3.merged.vcf.gz.gds", "/commons-data/gds/chr4.merged.vcf.gz.gds", "/commons-data/gds/chr5.merged.vcf.gz.gds", "/commons-data/gds/chr6.merged.vcf.gz.gds", "/commons-data/gds/chr7.merged.vcf.gz.gds", "/commons-data/gds/chr8.merged.vcf.gz.gds", "/commons-data/gds/chr9.merged.vcf.gz.gds", "/commons-data/gds/chr10.merged.vcf.gz.gds", "/commons-data/gds/chr11.merged.vcf.gz.gds", "/commons-data/gds/chr12.merged.vcf.gz.gds", "/commons-data/gds/chr13.merged.vcf.gz.gds", "/commons-data/gds/chr14.merged.vcf.gz.gds", "/commons-data/gds/chr15.merged.vcf.gz.gds", "/commons-data/gds/chr16.merged.vcf.gz.gds", "/commons-data/gds/chr17.merged.vcf.gz.gds", "/commons-data/gds/chr18.merged.vcf.gz.gds", "/commons-data/gds/chr19.merged.vcf.gz.gds", "/commons-data/gds/chr20.merged.vcf.gz.gds", "/commons-data/gds/chr21.merged.vcf.gz.gds", "/commons-data/gds/chr22.merged.vcf.gz.gds", "/commons-data/gds/chrX.merged.vcf.gz.gds"]',
      },
      {
        name: 'internal_api_env',
        default: 'default',
        value: 'default',
      },
    ],
  },
  progress: '1618/1620',
  outputs: {
    parameters: [
      {
        name: 'gwas_archive_index',
        value:
          '{"baseid": "af4fb252-d773-4f9b-9a4f-5a7251c54b46", "did": "dg.TST0/9aee8147-97e7-4b07-9690-bf26e953ed2a", "rev": "ed3d2bcf"}',
      },
      {
        name: 'manhattan_plot_index',
        value:
          '{"baseid": "7637a41e-cbec-4ba2-8556-3b8a506498bb", "did": "dg.TST0/e41e7a85-baba-4a37-8871-45bc3c375c7f", "rev": "c60b974f"}',
      },
      {
        name: 'attrition_json_index',
        value:
          '{"baseid": "a13b170e-e8c1-4750-831f-1b1587bd960a", "did": "dg.TST0/08803c69-3ef9-46c9-b025-fd12e0ed6d23", "rev": "8ab52ddc"}',
      },
      {
        name: 'pheweb_manhattan_json_index',
        value:
          '{"baseid": "6129ca03-c9c1-4b27-b410-6773fac5bcce", "did": "dg.TST0/4dda3cba-636d-400b-ac70-3c8872c4d4ca", "rev": "ec930d6b"}',
      },
      {
        name: 'pheweb_qq_json_index',
        value:
          '{"baseid": "4135bb4b-3634-4fce-8bf6-fa533b253585", "did": "dg.TST0/5d458b10-ff4c-4920-8d28-9f2956e6dec8", "rev": "7dfb5d18"}',
      },
    ],
  },
  gen3teamproject: '/research_projects/PROJECT_BETA',
};
