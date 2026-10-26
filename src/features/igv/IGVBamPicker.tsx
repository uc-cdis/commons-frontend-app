import type { IgvBrowserConfiguration } from '@/features/igv/types';
import React, { useMemo, useState } from 'react';
import {
  Combobox,
  Group,
  Input,
  InputBase,
  Loader,
  ScrollArea,
  Stack,
  useCombobox,
} from '@mantine/core';
import { useGetRawDataAndTotalCountsQuery } from '@gen3/core';
import IGVAppWrapper from '@/features/igv/IGVAppWrapper';

export interface IGVBamPickerProps {
  configuration: IgvBrowserConfiguration;
}
const IGVBamPicker = ({ configuration }: IGVBamPickerProps) => {
  const [value, setValue] = useState<string | null>(null);
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const { data, isFetching, isSuccess, isError } =
    useGetRawDataAndTotalCountsQuery({
      type: 'file',
      filters: {
        mode: 'and',
        root: {
          data_types: {
            operator: 'in',
            field: 'data_format',
            operands: ['BAM'],
          },
        },
      },
      fields: ['object_id', 'file_name'],
      size: 200,
    });

  const files = data?.data?.file ?? [];

  const selectedFile = files.find(
    (x: { file_name: string; object_id: string }) => x.object_id === value,
  );

  const bamList = useMemo(() => {
    if (!isSuccess || !data) return null;

    return files.map((x: { file_name: string; object_id: string }) => (
      <Combobox.Option value={x.object_id} key={x.object_id}>
        {x.file_name}
      </Combobox.Option>
    ));
  }, [data, files, isSuccess]);

  if (isError) {
    return <div className="w-full m-10">Error fetching data</div>;
  }

  if (isFetching) {
    return (
      <div className="w-full m-10">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full m-10">
      <Stack>
        <Group justify="flex-start">
          <Combobox
            store={combobox}
            withinPortal={false}
            onOptionSubmit={(val) => {
              setValue(val);
              combobox.closeDropdown();
            }}
          >
            <Combobox.Target>
              <InputBase
                component="button"
                type="button"
                pointer
                rightSection={<Combobox.Chevron />}
                onClick={() => combobox.toggleDropdown()}
                rightSectionPointerEvents="none"
              >
                {selectedFile?.file_name || (
                  <Input.Placeholder>
                    Select a BAM File to View
                  </Input.Placeholder>
                )}
              </InputBase>
            </Combobox.Target>

            <Combobox.Dropdown>
              <ScrollArea.Autosize mah={200} type="scroll">
                <Combobox.Options>{bamList}</Combobox.Options>
              </ScrollArea.Autosize>
            </Combobox.Dropdown>
          </Combobox>
        </Group>

        {value ? (
          <IGVAppWrapper bamId={value} configuration={configuration} />
        ) : null}
      </Stack>
    </div>
  );
};

export default IGVBamPicker;
