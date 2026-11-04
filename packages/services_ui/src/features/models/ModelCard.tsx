import type { ReactElement, ReactNode } from "react";
import { Fragment } from "react";
import { Badge, Button, Divider, Tooltip } from "@mantine/core";
import { Icon } from "@iconify-icon/react";
import type { ModelInformation } from "./types";
import { formatDate } from "../../utils/date";

export interface ModelCardStat {
  label: string;
  value: string | number;
}

export interface ModelCardProps extends ModelInformation {
  stats?: ModelCardStat[]; // e.g. Notebooks, Variations, Runs, Downloads
  detailsLabel?: string;
  onViewDetails?: () => void;
  detailsHref?: string;
}

const Separator = (): ReactElement => (
  <span className="text-[#cc4b05]" aria-hidden="true">
    {" • "}
  </span>
);

const joinWithSeparator = (items: ReactNode[]): ReactElement[] =>
  items.map((item, index) => (
    <Fragment key={index}>
      {index > 0 && <Separator />}
      {item}
    </Fragment>
  ));

const ModelCard = ({
  name,
  description,
  createdAt,
  stats = [],
  tags = [],
  detailsLabel = "View Model Details",
  onViewDetails,
  detailsHref,
}: ModelCardProps): ReactElement => {
  const summaryItems: ReactNode[] = [
    ...(createdAt
      ? [<span key="created">Created {formatDate(createdAt)}</span>]
      : []),
    ...stats.map((stat) => (
      <span key={stat.label}>
        <span className="font-bold">{stat.value}</span> {stat.label}
      </span>
    )),
  ];

  return (
    <div className="flex flex-col items-start gap-2 bg-base-max border border-solid border-base px-4 py-[11px] text-base-contrast">
      <div className="flex flex-col justify-center w-full">
        <div className="flex items-start gap-1">
          <Icon
            icon="carbon:model-alt"
            width={16}
            height={16}
            className="mt-1 shrink-0 text-[#cc4b05]"
          />
          <p className="m-0 text-base-contrast font-bold leading-6">{name}</p>
        </div>
      </div>
      <Divider className="w-full" color="#e1e1e1" />
      {description ? (
        <p className="m-0 w-full text-sm leading-[22px] text-base-contrast">
          {description}
        </p>
      ) : null}
      {summaryItems.length > 0 ? (
        <div className="w-full text-sm leading-[22px] text-[#333]">
          {summaryItems.length > 0 ? (
            <p className="m-0">{joinWithSeparator(summaryItems)}</p>
          ) : null}
        </div>
      ) : null}
      <div className="w-full flex flex-col wrap space-y-2 justify-end items-start mt-auto">
        {tags.length > 0 ? (
          <div className="w-full flex wrap space-x-2">
            {tags.map((tag) => (
              <Tooltip label={tag} key={tag}>
                <Badge variant="outline">{tag}</Badge>
              </Tooltip>
            ))}
          </div>
        ) : null}
        {detailsHref && (
          <>
            <Divider className="w-full" color="#e1e1e1" />
            <Button
              variant="outline"
              color="#0b7284"
              size="compact-md"
              radius={4}
              className="bg-base-max font-semibold tracking-[0.2px]"
              onClick={onViewDetails}
              {...(detailsHref ? { component: "a", href: detailsHref } : {})}
            >
              {detailsLabel}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ModelCard;
