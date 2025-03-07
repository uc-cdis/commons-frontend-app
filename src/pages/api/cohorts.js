// use: http://localhost:3000/api/cohorts

export default function handler(req, res) {
  // Define the JSON data
  const data = [
    {
      cohort_definition_id: 573,
      cohort_name: 'team2 - test new cohort - catch all',
      size: 70240,
    },
    {
      cohort_definition_id: 559,
      cohort_name: 'test new cohort - catch all',
      size: 70240,
    },
    {
      cohort_definition_id: 574,
      cohort_name: 'team2 - test new cohort - medium + large',
      size: 23800,
    },
    {
      cohort_definition_id: 575,
      cohort_name: 'team2 - test new cohort - small',
      size: 80,
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const convariteResponce = {
    concepts: [
      {
        concept_id: 3000009001,
        prefixed_concept_id: 'ID_3000009001',
        concept_name: 'Body Mass Index (BMI) [MVP Demographics]',
        concept_code: '',
        concept_type: 'MVP Continuous',
      },
      {
        concept_id: 3000009002,
        prefixed_concept_id: 'ID_3000009002',
        concept_name: 'Body Mass Index squared [MVP Demographics]',
        concept_code: '',
        concept_type: 'MVP Continuous',
      },
      {
        concept_id: 3000010001,
        prefixed_concept_id: 'ID_3000010001',
        concept_name: 'Framingham risk score v1',
        concept_code: '',
        concept_type: 'MVP Continuous',
      },
      {
        concept_id: 3000010002,
        prefixed_concept_id: 'ID_3000010002',
        concept_name: 'Framingham risk score v2',
        concept_code: '',
        concept_type: 'MVP Continuous',
      },
      {
        concept_id: 3000010003,
        prefixed_concept_id: 'ID_3000010003',
        concept_name: 'Framingham risk score v3',
        concept_code: '',
        concept_type: 'MVP Continuous',
      },
      {
        concept_id: 3000010004,
        prefixed_concept_id: 'ID_3000010004',
        concept_name: 'Framingham risk score v4',
        concept_code: '',
        concept_type: 'MVP Continuous',
      },
      {
        concept_id: 3000010005,
        prefixed_concept_id: 'ID_3000010005',
        concept_name: 'Framingham risk score v5',
        concept_code: '',
        concept_type: 'MVP Continuous',
      },
      {
        concept_id: 3000011001,
        prefixed_concept_id: 'ID_3000011001',
        concept_name: 'Systolic blood pressure average [MVP Vitals]',
        concept_code: '',
        concept_type: 'MVP Continuous',
      },
      {
        concept_id: 3000011002,
        prefixed_concept_id: 'ID_3000011002',
        concept_name: 'Diastolic blood pressure average [MVP Vitals]',
        concept_code: '',
        concept_type: 'MVP Continuous',
      },
      {
        concept_id: 3000011003,
        prefixed_concept_id: 'ID_3000011003',
        concept_name: 'Resting heart rate [MVP Vitals]',
        concept_code: '',
        concept_type: 'MVP Continuous',
      },
    ],
  };

  // Send JSON response
  res.status(200).json(data);
}
