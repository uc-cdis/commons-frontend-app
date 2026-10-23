import React, { useMemo, useState } from 'react';
import {
  Button,
  Combobox,
  Group,
  Input,
  InputBase,
  Loader,
  ScrollArea,
  Stack,
  useCombobox,
} from '@mantine/core';
import { useRouter } from 'next/dist/client/router';
import type { IgvBrowserConfiguration } from './types';
import type { NextRouter } from 'next/router';
import IGVAppPage from './IGVAppPage';
import { useGetRawDataAndTotalCountsQuery } from '@gen3/core';

interface IGVAppProps {
  bamId: string;
  mode: string;
  returnData: string;
}
const getBamFileURL = (router: NextRouter): Partial<IGVAppProps> => {
  const { bam, mode, returnData } = router.query;

  return {
    bamId: typeof bam === 'object' ? bam[0] : bam,
    mode: typeof mode === 'object' ? mode[0] : mode,
    returnData: typeof returnData === 'object' ? returnData[0] : returnData,
  };
};

interface IGVExplorerViewerProps {
  bamId: string;
  returnData: string;
  configuration: IgvBrowserConfiguration;
}

const IGVExplorerViewer = ({
  bamId,
  returnData,
  configuration,
}: IGVExplorerViewerProps) => {
  const router = useRouter();

  return (
    <div className="w-full m-10">
      <Stack>
        <Group justify="flex-start">
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              router.push(`${'/Explorer?activeTab=' + returnData}`)
            }
          >
            Return To Data Files
          </Button>
        </Group>

        <IGVAppPage bamId={bamId} configuration={configuration} />
      </Stack>
    </div>
  );
};

interface IGVBamPickerProps {
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
          <IGVAppPage bamId={value} configuration={configuration} />
        ) : null}
      </Stack>
    </div>
  );
};

const IGVApp = (configuration: IgvBrowserConfiguration) => {
  const router = useRouter();
  const { bamId, mode, returnData } = getBamFileURL(router);

  if (mode == 'explorer') {
    return (
      <IGVExplorerViewer
        bamId={bamId ?? ''}
        configuration={configuration}
        returnData={returnData ?? ''}
      />
    );
  }
  if (mode === 'app') {
    return <IGVBamPicker configuration={configuration} />;
  }
};

export default IGVApp;
