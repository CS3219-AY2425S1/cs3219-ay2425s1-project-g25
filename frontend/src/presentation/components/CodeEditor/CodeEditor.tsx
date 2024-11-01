import React, { useState } from "react";
import styles from "./CodeEditor.module.css";
import Editor, { Monaco } from "@monaco-editor/react";
import { Button, Spin } from "antd";
import { useCollaboration } from "domain/context/CollaborationContext";
import * as monaco from "monaco-editor";
import { SunOutlined, MoonFilled } from "@ant-design/icons";
import { LanguageSelector } from "./LanguageSelector";
import { CodeActionButtons } from "./CodeActionButtons";

interface CodeEditorProps {
    roomId: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ roomId }) => {
    const { onEditorIsMounted, isExecuting, setRoomId, connectedUsers } = useCollaboration();
    const [theme, setTheme] = useState("vs-light");

    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
        onEditorIsMounted(editor);
        setRoomId(roomId);
    };

    const handleToggleTheme = () => {
        if (theme === "vs-light") {
            setTheme("vs-dark");
        } else {
            setTheme("vs-light");
        }
    };

    return (
        <div className={styles.container}>
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

                        <CodeActionButtons disabled={isExecuting} />
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
                        formatOnPaste: true
                    }}
                />
            </div>
        </div>
    );
};

export default CodeEditor;