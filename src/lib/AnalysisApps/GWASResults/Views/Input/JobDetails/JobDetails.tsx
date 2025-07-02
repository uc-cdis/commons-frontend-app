import React, { useContext } from 'react';
import { Loader, Card, Title, Group, Divider } from '@mantine/core';
import { isEqual } from 'lodash';

import IsJsonString from '../../../Utils/IsJsonString';
import SharedContext from '../../../Utils/SharedContext';
import LoadingErrorMessage from '../../../../SharedUtils/LoadingErrorMessage/LoadingErrorMessage';
import DismissibleMessage from '../../../../SharedUtils/DismissibleMessage/DismissibleMessage';
import { AttritionTableJSONType, WorkflowDetailsType } from '../../../Utils/gwasWorkflowApi';

import useSWR from 'swr';
import { GEN3_WORKFLOW_API } from '../../../../SharedUtils/Endpoints';

const JobDetails = ({ attritionTableData }: {attritionTableData: AttritionTableJSONType[]}) => {
  const { selectedRowData } = useContext(SharedContext);
  if (!selectedRowData) {
    throw new Error('selectedRowData is not defined in SharedContext');
  }
  const { name, uid } = selectedRowData;
  //TODO clean this up and make only one api call, move up to parent
  const endpoint = `${GEN3_WORKFLOW_API}/status/${name}?uid=${uid}`;
  const minimumRecommendedCohortSize = 1000;
  const cohortNameValue = attritionTableData[0].rows[0].name;

  const { data, error, isLoading, isValidating } = useSWR(
    endpoint,
    (...args) => fetch(...args).then((res) => (res.json() as Promise<WorkflowDetailsType>)),
  );

  if (error) {
    return <LoadingErrorMessage message={`Error getting job details: ${error}`} />;
  }
  if (isLoading || isValidating) {
    return (
      <div className='spinner-container' data-testid='spinner'>
        <Loader />
      </div>
    );
  }

  if (!data) {
    return <LoadingErrorMessage message='Issue Loading Data for Job Details' />;
  }

  const getParameterData = (key: string) => {
    const datum = data?.arguments?.parameters?.find((obj) => obj.name === key);
    return datum?.value || 'Unexpected Error';
  };

  const getPhenotype = () => {
    if (
      getParameterData('outcome')
      && IsJsonString(getParameterData('outcome'))
    ) {
      return (
        JSON.parse(getParameterData('outcome'))?.concept_name
        || JSON.parse(getParameterData('outcome'))?.provided_name
      );
    }
    // eslint-disable-next-line no-console
    console.error('Data not found or not in expected JSON format');
    return 'Unexpected Error';
  };

  const removeOutcomeFromVariablesData = (variablesArray: any) => {
    const outcome = JSON.parse(getParameterData('outcome'));
    const filteredResult = variablesArray.filter(
      (obj: any) => !isEqual(obj, outcome),
    );
    return filteredResult;
  };

  const processCovariates = () => {
    const variablesData = getParameterData('variables');
    if (IsJsonString(variablesData)) {
      const covariatesArray = removeOutcomeFromVariablesData(
        JSON.parse(variablesData),
      );
      return covariatesArray;
    }
    return false;
  };

  const displayCovariates = () => {
    const covariates = processCovariates();
    if (covariates && covariates.length > 0) {
      return covariates.map((obj: any, index: number) => (
        <React.Fragment key={index}>
          <span className='covariate-item'>
            {obj?.concept_name}
            {obj?.provided_name}
            {!obj?.concept_name && !obj?.provided_name && 'Unexpected Error'}
          </span>
          <br />
        </React.Fragment>
      ));
    }
    return 'No covariates';
  };

  const findAncestrySizeOfLastRow = (tableData: AttritionTableJSONType, hareAncestry: string) => {
    const lastRowOfData = tableData?.rows[tableData?.rows.length - 1];
    const datum = lastRowOfData?.concept_breakdown.find(
      (obj) => obj.concept_value_name === hareAncestry,
    );
    return datum?.persons_in_cohort_with_value;
  };

  const getTotalSizes = () => {
    const hareAncestry = getParameterData('hare_population');
    const caseSize = attritionTableData[0]?.rows
      && findAncestrySizeOfLastRow(attritionTableData[0], hareAncestry);
    const controlSize = attritionTableData[1]?.rows
      ? findAncestrySizeOfLastRow(attritionTableData[1], hareAncestry)
      : null;
    const totalSize = controlSize !== null ? `${caseSize}${controlSize}` : `${caseSize}`;
    return {
      caseSize,
      controlSize,
      totalSize,
    };
  };
  const { caseSize, controlSize, totalSize } = getTotalSizes();
  const displayTotalSizes = () => (controlSize === null ? (
    <Group justify="space-between" className='w-full px-4'>
      <span>Total Size</span>
      <span>{totalSize || '---'}</span>
    </Group>
  ) : (
    <React.Fragment>
      <Group justify="space-between" className='w-full px-4'>
        <span>Control Size</span>
        <span>{controlSize}</span>
      </Group>
      <Group justify="space-between" className='w-full px-4'>
        <span>Case Size</span>
        <span>{caseSize}</span>
      </Group>
      <Group justify="space-between" className='w-full px-4'>
        <span>Total Size</span>
        <span>{totalSize}</span>
      </Group>
    </React.Fragment>
  ));

  const showCautionMessages = () => {
    if (caseSize && caseSize < minimumRecommendedCohortSize && controlSize === null) {
      return (
        <DismissibleMessage
          messageType='caution'
          title={`The total cohort size is small and can lead to low statistical power or cause the GWAS model to fail.
          Use caution when submitting to minimize computational resource usage.`}
        />
      );
    }
    if (
      caseSize
      && caseSize < minimumRecommendedCohortSize
      || controlSize
      && (controlSize !== null && controlSize < minimumRecommendedCohortSize)
    ) {
      return (
        <DismissibleMessage
          messageType='caution'
          title={`The total cohort size of either your case or control groups that you have chosen is small
          and can lead to low statistical power or cause the GWAS model to fail.
          Use caution when submitting to minimize computational resource usage.`}
        />
      );
    }
    return null;
  };

  return (
    <React.Fragment>
      {showCautionMessages()}
      <Card shadow="sm" padding="lg" radius="md" withBorder className='w-1/2'>
        <Card.Section>
          <Title order={3} className='px-4'>{data.wf_name}</Title>
          <Divider />
          <Group>
            <Group justify="space-between" mt='sm' className='w-full px-4'>
              <span>Number of PCs</span>
              <span>{getParameterData('n_pcs')}</span>
            </Group>
            <Group justify="space-between" className='w-full px-4'>
              <span>MAF Cutoff</span>
              <span>{getParameterData('maf_threshold')}</span>
            </Group>
            <Group justify="space-between" className='w-full px-4'>
              <span>HARE Ancestry</span>
              <span>{getParameterData('hare_population')}</span>
            </Group>
            <Group justify="space-between" mb='sm' className='w-full px-4'>
              <span>Imputation Score Cutoff</span>
              <span>{getParameterData('imputation_score_cutoff')}</span>
            </Group>
          </Group>
          <Divider />
          <Group>
            <Group justify="space-between" mt='sm' className='w-full px-4'>
              <span>Cohort</span>
              <span>{cohortNameValue}</span>
            </Group>
            <Group justify="space-between" className='w-full px-4'>
              <span>Outcome Phenotype</span>
              <span>{getPhenotype()}</span>
            </Group>
            {displayTotalSizes()}
            <Group justify="space-between" mb='sm' className='w-full px-4'>
              <span>Covariates</span>
              <span>{displayCovariates()}</span>
            </Group>
          </Group>
        </Card.Section>
      </Card>
    </React.Fragment>
  );
};

export default JobDetails;
