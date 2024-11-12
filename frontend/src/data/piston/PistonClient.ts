import axios from "axios";
import { CodeExecResult } from "domain/entities/CodeExecResult";
import { Language } from "domain/entities/Language";

const API_URL = "https://emkc.org/api/v2/piston";

const pistonAxios = axios.create({ baseURL: API_URL });

class PistonClient {
    static async executeCode(language: Language, sourceCode: string): Promise<CodeExecResult> {
        const res = await pistonAxios.post("/execute", {
            language: language.language,
            version: language.version,
            files: [{ content: sourceCode }]
        });
        const output = res.data.run;
        return {
            stdout: output.stdout,
            stderr: output.stderr,
            success: output.code === 0,
            timeout: output.signal !== null
        };
    }

    static async getLanguageVersions() {
        const res = await pistonAxios.get("/runtimes");
        return res.data;
    }
}

export default PistonClient;
