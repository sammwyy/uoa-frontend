import { Tool } from "@/lib/data/tools";
import { useCallback, useEffect, useState } from "react";

// Generic config type
export interface ToolConfig {
  [key: string]:
    | string
    | number
    | boolean
    | string[]
    | number[]
    | boolean[]
    | object
    | object[]
    | undefined;
}

// Tool state interface combining tool data with its state and config
export interface ToolState {
  tool: Tool;
  isEnabled: boolean;
  config?: ToolConfig;
}

export function useTools(defaultTools?: Tool[]) {
  const [availableTools, setAvailableTools] = useState<Tool[]>(
    defaultTools ?? []
  );
  const [toolStateMap, setToolStateMap] = useState<Record<string, ToolState>>(
    {}
  );

  // Set available tools and initialize state map
  const updateAvailableTools = useCallback(
    (tools: Tool[]) => {
      const newMap: Record<string, ToolState> = {};
      tools.forEach((tool) => {
        newMap[tool.id] = toolStateMap[tool.id] ?? {
          tool,
          isEnabled: false,
          config: undefined,
        };
      });
      setAvailableTools(tools);
      setToolStateMap(newMap);
    },
    [toolStateMap]
  );

  // Toggle tool enabled/disabled
  const toggleTool = useCallback((toolId: string) => {
    setToolStateMap((prev) => {
      const tool = prev[toolId];
      if (!tool) return prev;

      return {
        ...prev,
        [toolId]: {
          ...tool,
          isEnabled: !tool.isEnabled,
        },
      };
    });
  }, []);

  // Convert map to array for rendering
  const toolStates = Object.values(toolStateMap);

  useEffect(() => {
    updateAvailableTools(availableTools);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    availableTools,
    setAvailableTools: updateAvailableTools,
    toolStateMap,
    toolStates,
    toggleTool,
  };
}
