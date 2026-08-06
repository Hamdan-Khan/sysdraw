import {
  GROUP_CONTAINER_CLASS_ID,
  GROUP_LABEL_CLASS_ID,
} from "@zero-sketch/common";

export const GROUP_BG_COLOR = "#e9e9e9";
export const GROUP_BORDER_COLOR = "#b3b3b3";
export const GROUP_BORDER_RADIUS = 12;
export const GROUP_BORDER_WIDTH = 2;
export const GROUP_STROKE_DASHARRAY = "6 6";

export const GROUP_LABEL_TOP = -12;
export const GROUP_LABEL_LEFT = 20;
export const GROUP_LABEL_HEIGHT = 24;
export const GROUP_LABEL_BORDER_RADIUS = GROUP_LABEL_HEIGHT / 2;
export const GROUP_LABEL_PADDING_X = 8;
export const GROUP_LABEL_FONT_SIZE = 14;

export const GenericGroup = ({
  data,
}: {
  data: { label: string; color?: string };
}) => {
  return (
    <div
      className={`w-full h-full border border-dashed rounded-xl p-2.5 relative ${GROUP_CONTAINER_CLASS_ID}`}
      style={{
        backgroundColor: GROUP_BG_COLOR,
        borderColor: GROUP_BORDER_COLOR,
        borderWidth: GROUP_BORDER_WIDTH,
        borderRadius: GROUP_BORDER_RADIUS,
      }}
    >
      {data.label && (
        <div
          className={`absolute font-bold text-sm pointer-events-auto ${GROUP_LABEL_CLASS_ID}`}
          style={{
            top: `${GROUP_LABEL_TOP}px`,
            left: `${GROUP_LABEL_LEFT}px`,
            backgroundColor: GROUP_BG_COLOR,
            borderColor: GROUP_BORDER_COLOR,
            borderWidth: 1,
            borderRadius: `${GROUP_LABEL_BORDER_RADIUS}px`,
            paddingLeft: `${GROUP_LABEL_PADDING_X}px`,
            paddingRight: `${GROUP_LABEL_PADDING_X}px`,
            fontSize: `${GROUP_LABEL_FONT_SIZE}px`,
            height: `${GROUP_LABEL_HEIGHT}px`,
            display: "flex",
            alignItems: "center",
            color: data.color || "var(--color-secondary)",
          }}
        >
          {data.label}
        </div>
      )}
    </div>
  );
};
