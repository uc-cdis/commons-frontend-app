import type { ReactElement, ReactNode } from "react";
import { Fragment } from "react";
import { Badge, Button, Divider, Tooltip } from "@mantine/core";
import { Icon } from "@iconify-icon/react";
import type { EmbeddingInfo } from "./types";
import { formatDate } from "../../utils/date";

export interface EmbeddingCardProps extends EmbeddingInfo {
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

const EmbeddingCard = ({
  collectionName,
  description,
  dimensions,
  vectorType,
  createdAt,
  updatedAt,
  detailsLabel = "View Embedding Details",
  onViewDetails,
  detailsHref,
}: EmbeddingCardProps): ReactElement => {
  const summaryItems: ReactNode[] = [
    <span key="dimensions">
      <span className="font-bold">{dimensions}</span> Dimensions
    </span>,
    ...(createdAt
      ? [<span key="created">Created {formatDate(createdAt)}</span>]
      : []),
    ...(updatedAt && updatedAt !== createdAt
      ? [<span key="updated">Updated {formatDate(updatedAt)}</span>]
      : []),
  ];

  return (
    <div className="flex flex-col items-start gap-2 bg-base-max border border-solid border-base px-4 py-[11px] text-base-contrast">
      <div className="flex flex-col justify-center w-full">
        <div className="flex items-start gap-1">
          <Icon
            icon="carbon:data-vis-4"
            width={16}
            height={16}
            className="mt-1 shrink-0 text-[#cc4b05]"
          />
          <p className="m-0 text-base-contrast font-bold leading-6">
            {collectionName}
          </p>
        </div>
      </div>
      <Divider className="w-full" color="#e1e1e1" />
      {description ? (
        <p className="m-0 w-full text-sm leading-[22px] text-base-contrast">
          {description}
        </p>
      ) : null}
      <div className="w-full text-sm leading-[22px] text-[#333]">
        <p className="m-0">{joinWithSeparator(summaryItems)}</p>
      </div>
      <div className="w-full flex flex-col wrap space-y-2 justify-end items-start mt-auto">
        {vectorType ? (
          <div className="w-full flex wrap space-x-2">
            <Tooltip label={`Vector type: ${vectorType}`}>
              <Badge variant="outline">{vectorType}</Badge>
            </Tooltip>
          </div>
        ) : null}
        {(detailsHref || onViewDetails) && (
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

export default EmbeddingCard;
