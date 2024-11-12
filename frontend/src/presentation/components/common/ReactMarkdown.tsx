import MDEditor, { ContextStore } from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";

interface ReactMarkdownProps {
    isReadOnly?: boolean;
    value: string;
    onChange?: (value?: string, event?: React.ChangeEvent<HTMLTextAreaElement>, state?: ContextStore) => void;
}

export const ReactMarkdown: React.FC<ReactMarkdownProps> = ({ isReadOnly, value, onChange }) => {
    return isReadOnly ? (
        <MDEditor.Markdown source={value} />
    ) : (
        <MDEditor
            value={value}
            onChange={onChange}
            overflow={false}
            enableScroll
            height={300}
            previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
        />
    );
};
