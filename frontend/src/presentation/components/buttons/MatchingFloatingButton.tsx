// src/components/MatchingFloatingButton.tsx
import React, { useEffect, useState } from "react";
import { Button, Tooltip } from "antd";
import { WifiOutlined, DisconnectOutlined } from "@ant-design/icons";
import { useMatchmakingUseCase } from "domain/usecases/MatchmakingUseCase";

const MatchingFloatingButton: React.FC = () => {
    const { state, connectSocket, disconnectSocket } = useMatchmakingUseCase();
    const [isConnected, setIsConnected] = useState(state.connected);

    useEffect(() => {
        setIsConnected(state.connected);
    }, [state.connected]);

    const handleClick = () => {
        if (!isConnected) {
            connectSocket();
        } else {
            disconnectSocket();
        }
    };

    const getButtonProps = () => {
        if (!isConnected) {
            return {
                icon: <DisconnectOutlined />,
                style: { backgroundColor: "#ff4d4f" },
                tooltipTitle: "Disconnected. Click to connect"
            };
        } else {
            return {
                icon: <WifiOutlined />,
                style: { backgroundColor: "#52c41a" },
                tooltipTitle: "Connected. Click to disconnect"
            };
        }
    };

    const { icon, style, tooltipTitle } = getButtonProps();

    return (
        <Tooltip title={tooltipTitle}>
            <Button
                type="primary"
                shape="circle"
                icon={icon}
                onClick={handleClick}
                style={{
                    ...style,
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    zIndex: 1000,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
                }}
            />
        </Tooltip>
    );
};

export default MatchingFloatingButton;
