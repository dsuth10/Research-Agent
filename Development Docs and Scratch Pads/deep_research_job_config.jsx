import React, { useState, useMemo } from "react";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// -------------------------
// Types & Validation Schema
// -------------------------
const ToolSchema = z.object({
  useWebSearch: z.boolean(),
  webSearchContextSize: z.enum(["low", "medium", "high"]).optional(),
  useMCP: z.boolean(),
  mcpLabel: z.string(),
  mcpUrl: z.string().url().optional(),
  mcpApproval: z.enum(["never", "auto", "manual"]).optional(),
  toolChoiceOverride: z.enum(["auto", "web_search_preview", "mcp"]).optional(),
});

export const JobSchema = z.object({
  query: z.string().min(1, "Prompt is required"),
  systemPrompt: z.string().optional(),
  model: z.enum(["o3-deep-research-2025-06-26", "o4-mini-deep-research-2025-06-26"]),
  maxTokens: z.number().min(100).max(8192),
  tools: ToolSchema,
  reasoningSummary: z.enum(["auto", "concise", "detailed"]),
  reasoningEffort: z.enum(["low", "medium", "high"]),
  seed: z.union([z.number(), z.null()]),
  runAsync: z.boolean(),
  webhookUrl: z.string().url().optional(),
});

export type DeepResearchJob = z.infer<typeof JobSchema>;

// --------------
// Helper Methods
// --------------
const defaultJob: DeepResearchJob = {
  query: "",
  systemPrompt: "",
  model: "o3-deep-research-2025-06-26",
  maxTokens: 2000,
  tools: {
    useWebSearch: true,
    webSearchContextSize: "medium",
    useMCP: false,
    mcpLabel: "",
    mcpUrl: "",
    mcpApproval: "never",
    toolChoiceOverride: "auto",
  },
  reasoningSummary: "auto",
  reasoningEffort: "medium",
  seed: null,
  runAsync: true,
  webhookUrl: "",
};

// -------------------
// Main Layout Component
// -------------------
export default function DeepResearchJobConfig() {
  const [job, setJob] = useState<DeepResearchJob>(defaultJob);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Derived JSON preview
  const previewJson = useMemo(() => {
    /* Build API payload in the exact shape OpenAI expects */
    const toolsArray: any[] = [];
    if (job.tools.useWebSearch) {
      toolsArray.push({
        type: "web_search_preview",
        search_context_size: job.tools.webSearchContextSize,
      });
    }
    if (job.tools.useMCP) {
      toolsArray.push({
        type: "mcp",
        server_label: job.tools.mcpLabel,
        server_url: job.tools.mcpUrl,
        require_approval: job.tools.mcpApproval,
      });
    }

    const payload = {
      model: job.model,
      input: [
        {
          role: "developer",
          content: [
            {
              type: "input_text",
              text: job.systemPrompt || "You are a helpful research assistant.",
            },
          ],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: job.query }],
        },
      ],
      max_tokens: job.maxTokens,
      background: job.runAsync,
      ...(job.webhookUrl && job.runAsync ? { webhook_url: job.webhookUrl } : {}),
      reasoning: {
        summary: job.reasoningSummary,
        effort: job.reasoningEffort,
      },
      tools: toolsArray,
      ...(job.tools.toolChoiceOverride && job.tools.toolChoiceOverride !== "auto"
        ? { tool_choice: { type: job.tools.toolChoiceOverride } }
        : {}),
      ...(job.seed !== null ? { seed: job.seed } : {}),
    };

    return JSON.stringify(payload, null, 2);
  }, [job]);

  // ------------------
  // Handlers & Helpers
  // ------------------
  function update<K extends keyof DeepResearchJob>(key: K, value: DeepResearchJob[K]) {
    setJob((prev) => ({ ...prev, [key]: value }));
  }

  function updateTools<K extends keyof DeepResearchJob["tools"]>(key: K, value: any) {
    setJob((prev) => ({ ...prev, tools: { ...prev.tools, [key]: value } }));
  }

  function runJob() {
    // TODO: replace with actual API call
    console.log("Running job with payload", previewJson);
    alert("Job submitted! Check console for payload.");
  }

  // ---------------
  // Validation Flags
  // ---------------
  const toolsValid = job.tools.useWebSearch || job.tools.useMCP;
  const queryValid = job.query.trim().length > 0;
  const modelValid = !!job.model;
  const overallValid = queryValid && modelValid && toolsValid;

  // ---------------
  // Render
  // ---------------
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-900 text-white p-4 space-y-4">
        {[
          "Query & Prompt",
          "Model & Tokens",
          "Tools",
          "Advanced",
          "Preview JSON",
        ].map((label, idx) => (
          <div
            key={label}
            className={`cursor-pointer flex items-center gap-2 ${activeStep === idx ? "font-bold" : "opacity-75"}`}
            onClick={() => setActiveStep(idx)}
          >
            <span
              className={`h-3 w-3 rounded-full ${
                (idx === 0 && queryValid) ||
                (idx === 1 && modelValid) ||
                (idx === 2 && toolsValid) ||
                idx > 2
                  ? "bg-emerald-400"
                  : "bg-red-500"
              }`}
            />
            {label}
          </div>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {/* Header */}
        <div className="flex justify-between items-center sticky top-0 bg-slate-50 py-2 z-10">
          <h1 className="text-xl font-semibold">Deep Research Job Config</h1>
          <Button onClick={runJob} disabled={!overallValid}>
            Run ▶
          </Button>
        </div>

        {/* Step Panels */}
        {activeStep === 0 && (
          <Card>
            <CardContent className="space-y-4 p-6">
              <Textarea
                value={job.query}
                onChange={(e) => update("query", e.target.value)}
                placeholder="Enter your research question…"
                className="min-h-[8rem]"
              />
              <Textarea
                value={job.systemPrompt}
                onChange={(e) => update("systemPrompt", e.target.value)}
                placeholder="Optional system instructions…"
                className="min-h-[6rem]"
              />
            </CardContent>
          </Card>
        )}

        {activeStep === 1 && (
          <Card>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <div>
                <label className="block mb-1 font-medium">Model</label>
                <Select value={job.model} onValueChange={(val) => update("model", val as any)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="o3-deep-research-2025-06-26">o3‑deep‑research</SelectItem>
                    <SelectItem value="o4-mini-deep-research-2025-06-26">o4‑mini‑deep‑research</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block mb-1 font-medium">Max output tokens</label>
                <Input
                  type="number"
                  value={job.maxTokens}
                  min={100}
                  max={8192}
                  onChange={(e) => update("maxTokens", Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeStep === 2 && (
          <Card>
            <CardContent className="space-y-6 p-6">
              {/* Web Search */}
              <div className="flex items-start gap-4">
                <Checkbox
                  id="web-search"
                  checked={job.tools.useWebSearch}
                  onCheckedChange={(val) => updateTools("useWebSearch", Boolean(val))}
                />
                <label htmlFor="web-search" className="space-y-1">
                  <span className="font-medium">Enable Web Search Preview</span>
                  {job.tools.useWebSearch && (
                    <div className="mt-2">
                      <label className="mr-2">Context size:</label>
                      <Select
                        value={job.tools.webSearchContextSize}
                        onValueChange={(val) => updateTools("webSearchContextSize", val as any)}
                      >
                        <SelectTrigger className="inline-flex w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">low</SelectItem>
                          <SelectItem value="medium">medium</SelectItem>
                          <SelectItem value="high">high</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </label>
              </div>

              {/* MCP */}
              <div className="flex items-start gap-4">
                <Checkbox
                  id="mcp"
                  checked={job.tools.useMCP}
                  onCheckedChange={(val) => updateTools("useMCP", Boolean(val))}
                />
                <label htmlFor="mcp" className="space-y-1">
                  <span className="font-medium">Enable MCP (private data)</span>
                </label>
              </div>

              {job.tools.useMCP && (
                <div className="ml-8 space-y-4">
                  <Input
                    placeholder="Server label"
                    value={job.tools.mcpLabel}
                    onChange={(e) => updateTools("mcpLabel", e.target.value)}
                  />
                  <Input
                    placeholder="Server URL (https://)"
                    value={job.tools.mcpUrl}
                    onChange={(e) => updateTools("mcpUrl", e.target.value)}
                  />
                  <Select
                    value={job.tools.mcpApproval}
                    onValueChange={(val) => updateTools("mcpApproval", val as any)}
                  >
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">never</SelectItem>
                      <SelectItem value="auto">auto</SelectItem>
                      <SelectItem value="manual">manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Error if neither tool chosen */}
              {!toolsValid && (
                <p className="text-sm text-red-600">Select at least one tool (required).</p>
              )}

              {/* Tool choice override */}
              {job.tools.useWebSearch && job.tools.useMCP && (
                <div>
                  <label className="mr-2 font-medium">Tool choice override:</label>
                  <Select
                    value={job.tools.toolChoiceOverride}
                    onValueChange={(val) => updateTools("toolChoiceOverride", val as any)}
                  >
                    <SelectTrigger className="w-48 inline-flex"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">auto</SelectItem>
                      <SelectItem value="web_search_preview">web_search_preview</SelectItem>
                      <SelectItem value="mcp">mcp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeStep === 3 && (
          <Card>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              {/* Reasoning summary */}
              <div>
                <label className="block mb-1 font-medium">Reasoning summary</label>
                <Select
                  value={job.reasoningSummary}
                  onValueChange={(val) => update("reasoningSummary", val as any)}
                >
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">auto</SelectItem>
                    <SelectItem value="concise">concise</SelectItem>
                    <SelectItem value="detailed">detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reasoning effort */}
              <div>
                <label className="block mb-1 font-medium">Reasoning effort</label>
                <Select
                  value={job.reasoningEffort}
                  onValueChange={(val) => update("reasoningEffort", val as any)}
                >
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">low</SelectItem>
                    <SelectItem value="medium">medium</SelectItem>
                    <SelectItem value="high">high</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Seed */}
              <div>
                <label className="block mb-1 font-medium">Seed (optional)</label>
                <Input
                  type="number"
                  placeholder="e.g. 42"
                  value={job.seed ?? ""}
                  onChange={(e) =>
                    update("seed", e.target.value === "" ? null : Number(e.target.value))
                  }
                />
              </div>

              {/* Async toggle */}
              <div className="flex items-center gap-3 mt-4">
                <Switch
                  id="run-async"
                  checked={job.runAsync}
                  onCheckedChange={(val) => update("runAsync", Boolean(val))}
                />
                <label htmlFor="run-async" className="font-medium">
                  Run asynchronously
                </label>
              </div>

              {job.runAsync && (
                <div className="col-span-2">
                  <label className="block mb-1 font-medium">Webhook URL</label>
                  <Input
                    placeholder="https://yourapp.com/openai/webhook"
                    value={job.webhookUrl}
                    onChange={(e) => update("webhookUrl", e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeStep === 4 && (
          <Card>
            <CardContent className="p-0">
              <pre className="p-6 text-sm overflow-x-auto whitespace-pre-wrap">
                {previewJson}
              </pre>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
