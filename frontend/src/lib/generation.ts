import type { Project } from "../types";

// Must match GENERATION_FAILED_MESSAGE in backend/config/openAi.ts
export const GENERATION_FAILED_MESSAGE = "I couldn't generate your website";

export type GenerationState = "generating" | "failed" | "ready";

export const getGenerationState = (project: Project): GenerationState => {
    if (project.current_code) return "ready";
    const lastAssistant = [...(project.conversation || [])].reverse().find((m) => m.role === "assistant");
    if (lastAssistant?.content.startsWith(GENERATION_FAILED_MESSAGE)) return "failed";
    return "generating";
};

// The backend writes these chat messages as it moves through each stage
export const getGenerationStep = (project: Project): number => {
    const contents = (project.conversation || []).map((m) => m.content);
    if (contents.some((c) => c.startsWith("Generating your website"))) return 1;
    return 0;
};

export const GENERATION_STEPS = [
    { label: "Writing a design brief", detail: "Turning your idea into layout, colour and content decisions" },
    { label: "Building your website", detail: "Writing the HTML and Tailwind styles for every section" },
];
