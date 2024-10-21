import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from "react";
import { Monaco } from "@monaco-editor/react";
import * as Y from "yjs";
import * as monaco from "monaco-editor";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";
import { AWARENESS_KEYS } from "presentation/utils/constants";

interface CollaborationContextType {
    initialiseEditor: (roomId: string, editor: any, monaco: Monaco) => void;
    selectedLanguage: string;
    languages: any;
    handleChangeLanguage: (lang: string) => void;
}
const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export const CollaborationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const userId = user?._id;

    const { USER_ID, SELECTED_LANGUAGE } = AWARENESS_KEYS;

    const [selectedLanguage, setSelectedLanguage] = useState<string>("javascript");
    const [languages, setLanguages] = useState<{ label: string; value: string }[]>([]);

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);
    const ydocRef = useRef<Y.Doc | null>(null);

    const initialiseEditor = (roomId: string, editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        const allLanguages = monaco.languages.getLanguages();

        // TODO: Filter all the useless ones like HTML
        setLanguages(
            allLanguages.map((lang) => ({
                label: lang.aliases && lang.aliases.length > 0 ? lang.aliases[0] : lang.id,
                value: lang.id
            }))
        );

        const doc = new Y.Doc();
        ydocRef.current = doc;

        // TODO: Replace serverUrl once BE ready
        // Test locally across browers with 'HOST=localhost PORT 1234 npx y-websocket'
        const provider = new WebsocketProvider("ws://localhost:1234", roomId, doc);
        provider.on("status", (event: any) => {
            console.log(event.status);
        });
        providerRef.current = provider;
        const type = doc.getText("monaco");
        const editorModel = editor.getModel();

        if (editorModel == null) {
            toast.error("There was an issue with initialising the code editor");
            return;
        }
        const binding = new MonacoBinding(type, editorModel, new Set([editor]), provider.awareness);
        bindingRef.current = binding;

        // Initialise awareness states
        provider.awareness.setLocalStateField(USER_ID, userId);

        // TODO: initialise with correct language on page reload
        provider.awareness.setLocalStateField(SELECTED_LANGUAGE, selectedLanguage);

        provider.awareness.on("change", ({ updated }: { updated: any }) => {
            // On change language
            updated.forEach((id: number) => {
                const trigger = provider.awareness.getStates().get(id); // Get the user who initiated the change
                if (trigger && trigger.selectedLanguage) {
                    // Ignore all state updates caused by the current user
                    if (trigger.userId !== userId) {
                        setSelectedLanguage(trigger.selectedLanguage);
                    }
                }
            });
        });
    };

    const handleChangeLanguage = (lang: string) => {
        setSelectedLanguage(lang);
        providerRef.current?.awareness.setLocalStateField(SELECTED_LANGUAGE, lang);
    };
    useEffect(() => {
        return () => {
            bindingRef.current?.destroy();
            providerRef.current?.awareness.setLocalState(null);
            providerRef.current?.disconnect();
            editorRef.current?.dispose();
            ydocRef.current?.destroy();
        };
    }, []);

    return (
        <CollaborationContext.Provider value={{ initialiseEditor, selectedLanguage, languages, handleChangeLanguage }}>
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
