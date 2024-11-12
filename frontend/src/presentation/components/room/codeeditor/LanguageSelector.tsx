import { Select } from "antd";
import { useCollaboration } from "domain/context/CollaborationContext";
import { Language } from "domain/entities/Language";
import { useMemo } from "react";

interface LanguageOption {
    label: string;
    value: string;
    langData: Language;
}
export const LanguageSelector: React.FC<{}> = () => {
    const { languages, selectedLanguage, handleChangeLanguage } = useCollaboration();
    const languageOptions: LanguageOption[] = useMemo(() => {
        return languages.map((lang: Language) => ({
            label: lang.alias,
            value: lang.language,
            langData: lang
        }));
    }, [languages]);

    return (
        <Select
            variant="borderless"
            style={{ width: "150px" }}
            placeholder="Select language"
            options={languageOptions}
            value={selectedLanguage.language}
            onChange={(_, option) => {
                const langOption = option as LanguageOption;
                handleChangeLanguage(langOption.langData);
            }}
        />
    );
};
