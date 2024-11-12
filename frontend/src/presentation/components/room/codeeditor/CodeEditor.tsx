import React, { useState, useEffect, useRef } from "react";
import styles from "./CodeEditor.module.css";
import Editor from "@monaco-editor/react";
import { Button, Spin, Modal } from "antd";
import { useCollaboration } from "domain/context/CollaborationContext";
import * as monaco from "monaco-editor";
import { SunOutlined, MoonFilled } from "@ant-design/icons";
import { LanguageSelector } from "./LanguageSelector";
import { CodeActionButtons } from "./CodeActionButtons";
import LeaveButton from "./LeaveButton";

interface CodeEditorProps {
    questionId: string;
    roomId: string;
    attemptStartedAt: Date;
    collaboratorId: string;
}

function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
    questionId,
    roomId,
    attemptStartedAt,
    collaboratorId
}) => {
    const { onEditorIsMounted, isExecuting, setRoomId, connectedUsers } = useCollaboration();
    const [theme, setTheme] = useState("vs-light");
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [leftUser, setLeftUser] = useState<string | null>(null);

    const prevConnectedUsers = usePrevious(connectedUsers);

    useEffect(() => {
        let resizeObserver: ResizeObserver | null = null;
        let resizeTimeout: NodeJS.Timeout;

        if (containerRef.current && editorRef.current) {
            resizeObserver = new ResizeObserver((entries) => {
                // Debounce resize events
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    if (editorRef.current) {
                        editorRef.current.layout();
                    }
                }, 100);
            });

            resizeObserver.observe(containerRef.current);
        }

        return () => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            clearTimeout(resizeTimeout);
        };
    }, []);

    useEffect(() => {
        if (prevConnectedUsers) {
            const leftUsers = prevConnectedUsers.filter(user => !connectedUsers.includes(user));
            if (leftUsers.length > 0) {
                setLeftUser(leftUsers[0]);
                setIsModalVisible(true);
            }
        }
    }, [connectedUsers, prevConnectedUsers]);

    const handleOk = () => {
        setIsModalVisible(false);
        setLeftUser(null);
    };

    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
        editorRef.current = editor;
        onEditorIsMounted(editor);
        setRoomId(roomId);
    };

    const handleToggleTheme = () => {
        setTheme(theme === "vs-light" ? "vs-dark" : "vs-light");
    };

    return (
        <div className={styles.container} ref={containerRef}>
            <Modal
                title="User Disconnected"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleOk}
                footer={[
                    <Button key="ok" type="primary" onClick={handleOk}>
                        OK
                    </Button>,
                ]}
            >
                {leftUser ? (
                    <p>User <strong>{leftUser}</strong> has left the session.</p>
                ) : (
                    <p>A user has left the session.</p>
                )}
            </Modal>

            <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                    <LanguageSelector />
                    {isExecuting && (
                        <div className={styles.pendingExecution}>
                            <Spin />
                            <p>Running...</p>
                        </div>
                    )}
                </div>
                <div className={styles.toolbarRight}>
                    <div className={styles.connectionStatusContainer}>
                        {connectedUsers.map((user) => (
                            <div key={user} className={styles.connectionStatus}>
                                <div className={styles.greenCircle}></div>
                                <div className={styles.statusUsername}>{user}</div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.buttonGroup}>
                        <Button
                            onClick={handleToggleTheme}
                            type="text"
                            icon={theme === "vs-light" ? <SunOutlined /> : <MoonFilled />}
                        />

                        <CodeActionButtons 
                            disabled={isExecuting}
                            getEditorText={() => editorRef.current?.getValue() || ""}
                            questionId={questionId}
                            roomId={roomId}
                            attemptStartedAt={attemptStartedAt}
                            collaboratorId={collaboratorId}
                        />
                        <LeaveButton
                            getEditorText={() => editorRef.current?.getValue() || ""}
                            questionId={questionId}
                            roomId={roomId}
                            attemptStartedAt={attemptStartedAt}
                            collaboratorId={collaboratorId}
                        />
                    </div>
                </div>
            </div>
            <div className={styles.editor}>
                <Editor
                    theme={theme}
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: false },
                        scrollbar: { verticalScrollbarSize: 4 },
                        formatOnPaste: true,
                    }}
                />
            </div>
        </div>
    );
};

export default CodeEditor;
