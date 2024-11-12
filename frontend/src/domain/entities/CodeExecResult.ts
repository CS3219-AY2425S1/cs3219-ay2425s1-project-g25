export interface CodeExecResult {
    stdout: string;
    stderr: string;
    success: boolean;
    timeout: boolean;
}
