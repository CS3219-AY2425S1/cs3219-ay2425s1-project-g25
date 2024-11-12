import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { TooltipPlacement } from "antd/es/tooltip";

interface TooltipProps {
    title: string | React.ReactNode | (() => React.ReactNode);
    overlayStyle?: React.CSSProperties;
    placement?: TooltipPlacement;
}
export const CustomTooltip: React.FC<TooltipProps> = ({ title, overlayStyle, placement = "top" }) => {
    return (
        <Tooltip title={title} overlayStyle={overlayStyle} placement={placement}>
            <InfoCircleOutlined style={{ fontSize: "16px", color: "#1890ff", cursor: "pointer" }} />
        </Tooltip>
    );
};
