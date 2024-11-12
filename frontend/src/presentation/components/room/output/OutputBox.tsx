import { useCollaboration } from "domain/context/CollaborationContext";
import styles from "./OutputBox.module.css";
import { useEffect, useState } from "react";

export const OutputBox: React.FC<{}> = () => {
    const { execResult } = useCollaboration();
    const hasExecuted = execResult !== null;
    const isSuccess = execResult?.success;
    const isTimeout = execResult?.timeout;
    const stdout = execResult?.stdout;
    const stderr = execResult?.stderr;

    // Output box flash color when it receives an output
    const [flashColor, setFlashColor] = useState<"red" | "green" | null>(null);
    useEffect(() => {
        if (execResult) {
            setFlashColor(execResult?.success ? "green" : "red");
            const id = setTimeout(() => setFlashColor(null), 500);
            return () => clearTimeout(id);
        }
    }, [execResult]);

    return (
        <div className={`${styles.container} `} style={{ borderColor: flashColor ?? "transparent" }}>
            <div className={styles.header}>
                <h3>Output</h3>
                {hasExecuted && (
                    <div className={styles.status}>
                        {isSuccess ? (
                            <p className={styles.successStatus}>Success</p>
                        ) : (
                            <p className={styles.failStatus}>{isTimeout ? "Time Limit Exceeded" : "Failed"}</p>
                        )}
                    </div>
                )}
            </div>
            <div className={styles.content}>
                {stdout && <p>{stdout}</p>}
                {stderr && <p>{stderr}</p>}
            </div>
        </div>
    );
};
