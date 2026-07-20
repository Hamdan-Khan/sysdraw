import { BaseGroupData, RegisteredGroups } from "@sysdraw/models";
import { NodeComponentType, NodePropsType } from "../../canvas";
import { GenericGroup } from "./GenericGroup";
import { GroupWrapper } from "./GroupWrapper";

export const groupTypes = Object.values(RegisteredGroups).reduce(
  (acc, groupType) => {
    acc[groupType] = (props: NodePropsType<BaseGroupData>) => {
      const handles = props.data.handles || [];

      return (
        <GroupWrapper
          selected={props.selected}
          handles={handles}
          width={props.width}
          height={props.height}
        >
          <GenericGroup data={props.data} />
        </GroupWrapper>
      );
    };
    return acc;
  },
  {} as Record<RegisteredGroups, NodeComponentType<BaseGroupData>>,
);
