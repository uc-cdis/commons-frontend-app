import React from 'react';
import { Accordion } from '@mantine/core';
import { AttritionTableJSONType, AttritionTableJSONconcept_breakdownType, AttritionTableJSONrowsType } from '../../../Utils/gwasWorkflowApi';

const defaultHareGroups = ['Non-Hispanic Black', 'Non-Hispanic Asian', 'Non-Hispanic White', 'Hispanic'];

const AttritionTable = ({ tableData, title }: {tableData: AttritionTableJSONType, title: string}) => {

  if (!tableData || !tableData.rows || tableData.rows.length === 0) {
    return (
      <section data-testid='attrition-table' className='attrition-table'>
        <div className='attrition-table'>
          <h3>No attrition data available</h3>
        </div>
      </section>
    );
  }

  const displayRowType = (rowType: string) => {
    if (rowType) {
      return rowType === 'outcome' ? 'Outcome Phenotype' : rowType;
    }
    return <h3>❌</h3>;
  };

  const displayNumberOrX = (data?: number) => {
    if (data || data === 0) {
      return data;
    }
    return <h3>❌</h3>;
  };

  const getHareGroups = (conceptBreakdownArray : AttritionTableJSONconcept_breakdownType[]) => {
    const groupNames = conceptBreakdownArray.map((item) => (item.concept_value_name));
    return groupNames;
  };

  const displayHareGroupHeaders = (hareGroupNames: string[]) => {
    let i = 0;
    const hareGroupNamesJSX = [];

    while (i < hareGroupNames.length) {
      let groupName = hareGroupNames[i];
      groupName = groupName.charAt(0).toUpperCase() + groupName.slice(1);

      if (i === 0) {
        hareGroupNamesJSX.push(<th className='attrition-table--w15 attrition-table--leftpad'>{groupName}</th>);
      } else {
        hareGroupNamesJSX.push(<th className='attrition-table--w15'>{groupName}</th>);
      }
      i += 1;
    }

    return hareGroupNamesJSX;
  };

  const getBreakDownForGroup = (groupName: string, conceptBreakdownArray: AttritionTableJSONconcept_breakdownType[]) => {
    let matchingObject: AttritionTableJSONconcept_breakdownType | undefined;
    if (conceptBreakdownArray) {
      matchingObject  = conceptBreakdownArray.find(
        (obj) => obj.concept_value_name === groupName,
      );
    }

    return displayNumberOrX(matchingObject?.persons_in_cohort_with_value);
  };

  const displayGroupBreakDowns = (hareGroupNames: string[], row: AttritionTableJSONrowsType) => {
    const hareGroupCountsJSX: JSX.Element[] = [];

    hareGroupNames.forEach((hareGroupName) => {
      const count = getBreakDownForGroup(hareGroupName, row?.concept_breakdown);
      hareGroupCountsJSX.push(<td>{count}</td>);
    });

    return hareGroupCountsJSX;
  };

  let hareGroupNames = defaultHareGroups;

  if (tableData.rows) {
    hareGroupNames = getHareGroups(tableData.rows[0].concept_breakdown);
  }

  return (
    <section data-testid='attrition-table' className='attrition-table'>
      <div className='attrition-table'>
        <Accordion
          defaultValue="1"
        >
          <Accordion.Item key={'1'} value={title}>
            <Accordion.Control>{title}</Accordion.Control>
            <Accordion.Panel>
              <table>
                <thead>
                  <tr>
                    <th className='attrition-table--leftpad attrition-table--w15'>
                      Type
                    </th>
                    <th className='attrition-table--w15'>Name</th>
                    <th className='attrition-table--rightborder attrition-table--w5'>
                      Size
                    </th>
                    {displayHareGroupHeaders(hareGroupNames)}
                  </tr>
                </thead>
                <tbody>
                  {tableData.rows.map((row, index) => (
                    <tr key={index}>
                      <td className='row-type'>{displayRowType(row?.type)}</td>
                      <td>{row?.name || <h3>❌</h3>}</td>
                      <td className='attrition-table--rightborder'>
                        {displayNumberOrX(row?.size)}
                      </td>
                      {displayGroupBreakDowns(hareGroupNames, row)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>
    </section>
  );
};

export default AttritionTable;
