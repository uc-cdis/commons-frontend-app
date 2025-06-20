import React from 'react';
import AttritionTable from './AttrtitionTable';
import { AttritionTableJSONType } from '../../../Utils/gwasWorkflowApi';
const AttritionTableWrapper = ({ data }: {data:AttritionTableJSONType[]}) => (
  <section
    data-testid='attrition-table-wrapper'
    className='attrition-table-wrapper'
  >
    {data[1]?.table_type === 'control' ? (
      <section>
        <AttritionTable
          tableData={data[0]}
          title='Case Cohort Attrition Table'
        />
        <AttritionTable
          tableData={data[1]}
          title='Control Cohort Attrition Table'
        />
      </section>
    )
      : <AttritionTable tableData={data[0]} title='Attrition Table' />}
  </section>
);

export default AttritionTableWrapper;
