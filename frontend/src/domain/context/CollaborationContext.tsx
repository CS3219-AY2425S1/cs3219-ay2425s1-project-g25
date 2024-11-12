import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import * as Y from "yjs";
import * as monaco from "monaco-editor";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";
import { COLLABORATION_AWARENESS_KEYS, COLLABORATION_YMAP_KEYS } from "presentation/utils/constants";
import PistonClient from "data/piston/PistonClient";
import { Language } from "domain/entities/Language";
import { CodeExecResult } from "domain/entities/CodeExecResult";

interface CollaborationContextType {
    onEditorIsMounted: (editor: monaco.editor.IStandaloneCodeEditor) => void;
    selectedLanguage: Language;
    languages: Language[];
    handleChangeLanguage: (lang: Language) => void;
    handleExecuteCode: () => Promise<void>;
    isExecuting: boolean;
    execResult: CodeExecResult | null;
    setRoomId: (roomId: string) => void;
    connectedUsers: string[];
    disconnect: () => void;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export const CollaborationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const username = user?.username;

    const { USERNAME } = COLLABORATION_AWARENESS_KEYS;
    const { SELECTED_LANGUAGE } = COLLABORATION_YMAP_KEYS;

    const [selectedLanguage, setSelectedLanguage] = useState<Language>({
        language: "javascript",
        version: "1.32.3",
        alias: "Javascript"
    });

    const [roomId, setRoomId] = useState<string | null>(null);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [execResult, setExecResult] = useState<CodeExecResult | null>(null);
    const [isExecuting, setIsExecuting] = useState<boolean>(false);
    const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
    const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [provider, setProvider] = useState<WebsocketProvider | null>(null);

    useEffect(() => {
        if (!roomId) return;
        const ydoc = new Y.Doc();
        const provider = new WebsocketProvider(`ws://${process.env.REACT_APP_COLLAB_SOCKET_URL}/${roomId}`, roomId, ydoc);
        setProvider(provider);

        provider.awareness.setLocalStateField(USERNAME, username);
        provider.awareness.on("change", () => {
            const users = Array.from(provider.awareness.getStates().values());
            setConnectedUsers(Array.from(new Set(users.map((user) => user[USERNAME]))));
        });

        return () => provider.destroy();
    }, [roomId, username, USERNAME]);

    useEffect(() => {
        if (!provider || !editor) return;

        const ytext = provider.doc.getText("monaco");
        const binding = new MonacoBinding(ytext, editor.getModel()!, new Set([editor]), provider.awareness);

        const ymap = provider.doc.getMap("sharedMap");
        ymap.observe((event) => {
            if (event.changes.keys.has(SELECTED_LANGUAGE)) {
                const language = ymap.get(SELECTED_LANGUAGE) as Language;
                setSelectedLanguage(language);
                monaco.editor.setModelLanguage(editor.getModel()!, language.language);
            }
        });

        const initialLanguage = ymap.get(SELECTED_LANGUAGE) as Language;
        if (initialLanguage) {
            setSelectedLanguage(initialLanguage);
            monaco.editor.setModelLanguage(editor.getModel()!, initialLanguage.language);
        }

        return () => binding.destroy();
    }, [provider, editor, SELECTED_LANGUAGE]);

    useEffect(() => {
        const initialiseLanguages = async () => {
            const allLanguages = monaco.languages.getLanguages();
            const pistonLanguageVersions = await PistonClient.getLanguageVersions();
            setLanguages(
                allLanguages
                    .filter((lang) => pistonLanguageVersions.some((pistonLang: any) => pistonLang.language === lang.id))
                    .map((lang) => ({
                        alias: lang.aliases?.[0] || lang.id,
                        language: lang.id,
                        version: pistonLanguageVersions.find((pistonLang: any) => pistonLang.language === lang.id)
                            ?.version
                    }))
            );
        };
        initialiseLanguages();
    }, []);

    const handleChangeLanguage = (lang: Language) => {
        provider?.doc.getMap("sharedMap")?.set(SELECTED_LANGUAGE, lang);
    };

    const handleExecuteCode = async () => {
        try {
            setIsExecuting(true);
            const sourceCode = editor?.getValue();
            if (!sourceCode) return;

            const output = await PistonClient.executeCode(selectedLanguage, sourceCode);
            setExecResult(output);
        } catch {
            toast.error("There was an issue running the code");
        } finally {
            setIsExecuting(false);
        }
    };

    const onEditorIsMounted = (editor: monaco.editor.IStandaloneCodeEditor) => setEditor(editor);

    return (
        <CollaborationContext.Provider
            value={{
                onEditorIsMounted,
                setRoomId,
                selectedLanguage,
                languages,
                handleChangeLanguage,
                handleExecuteCode,
                isExecuting,
                execResult,
                connectedUsers,
                disconnect: () => provider?.disconnect()
            }}
        >
            {children}
        </CollaborationContext.Provider>
    );
};

export const useCollaboration = () => {
    const context = useContext(CollaborationContext);
    if (!context) {
        throw new Error("useCollaboration must be used within a CollaborationProvider");
    }
    return context;
};
