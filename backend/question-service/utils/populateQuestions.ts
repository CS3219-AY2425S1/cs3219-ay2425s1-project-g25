import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

export async function populateQuestions() {
    const PORT = process.env.PORT;
    const url = `http://localhost:${PORT}/api/questions/`;

    const jsonPath = path.resolve(__dirname, "../data/questions.json");
    const fileData = fs.readFileSync(jsonPath, "utf8");
    const questions = JSON.parse(fileData);

    for (const question of questions) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(question),
            });
        } catch (error) {
            console.error("Error posting question:", error);
        }
    }

    console.log("Questions populated.");
}
