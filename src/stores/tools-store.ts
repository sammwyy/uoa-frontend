import { Tool } from "@/lib/data/tools";
import { create } from "zustand";

// Generic config type - can be extended for specific tool configurations
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

interface ToolsStore {
  // Available tools list
  availableTools: Tool[];

  // Tools state with enabled/disabled status and config
  toolsState: Record<string, ToolState>;

  // Actions
  setAvailableTools: (tools: Tool[]) => void;
  resetTools: () => void;
  toggleTool: (toolId: string) => void;
  setToolConfig: (toolId: string, config: ToolConfig) => void;
  updateToolConfig: (toolId: string, configUpdate: Partial<ToolConfig>) => void;

  // Getters
  getEnabledTools: () => ToolState[];
  getToolState: (toolId: string) => ToolState | undefined;
  getAllToolsState: () => ToolState[];
  isToolEnabled: (toolId: string) => boolean;
}

export const useToolsStore = create<ToolsStore>((set, get) => ({
  availableTools: [],
  toolsState: {},

  // Set the list of available tools and initialize their state
  setAvailableTools: (tools: Tool[]) => {
    set((state) => {
      const newToolsState: Record<string, ToolState> = {};

      tools.forEach((tool) => {
        // Preserve existing state if tool already exists
        const existingState = state.toolsState[tool.id];
        newToolsState[tool.id] = existingState || {
          tool,
          isEnabled: false, // Default to disabled
          config: undefined,
        };
      });

      return {
        availableTools: tools,
        toolsState: newToolsState,
      };
    });
  },

  // Reset all tools to default state (disabled, no config)
  resetTools: () => {
    set((state) => {
      const resetToolsState: Record<string, ToolState> = {};

      state.availableTools.forEach((tool) => {
        resetToolsState[tool.id] = {
          tool,
          isEnabled: false,
          config: undefined,
        };
      });

      return {
        toolsState: resetToolsState,
      };
    });
  },

  // Toggle tool enabled/disabled status
  toggleTool: (toolId: string) => {
    set((state) => {
      const toolState = state.toolsState[toolId];
      if (!toolState) return state;

      return {
        toolsState: {
          ...state.toolsState,
          [toolId]: {
            ...toolState,
            isEnabled: !toolState.isEnabled,
          },
        },
      };
    });
  },

  // Set complete config for a tool
  setToolConfig: (toolId: string, config: ToolConfig) => {
    set((state) => {
      const toolState = state.toolsState[toolId];
      if (!toolState) return state;

      return {
        toolsState: {
          ...state.toolsState,
          [toolId]: {
            ...toolState,
            config,
          },
        },
      };
    });
  },

  // Update specific config properties for a tool
  updateToolConfig: (toolId: string, configUpdate: Partial<ToolConfig>) => {
    set((state) => {
      const toolState = state.toolsState[toolId];
      if (!toolState) return state;

      return {
        toolsState: {
          ...state.toolsState,
          [toolId]: {
            ...toolState,
            config: {
              ...toolState.config,
              ...configUpdate,
            },
          },
        },
      };
    });
  },

  // Get only enabled tools
  getEnabledTools: () => {
    const state = get();
    return Object.values(state.toolsState).filter(
      (toolState) => toolState.isEnabled
    );
  },

  // Get specific tool state
  getToolState: (toolId: string) => {
    const state = get();
    return state.toolsState[toolId];
  },

  // Get all tools state (enabled and disabled)
  getAllToolsState: () => {
    const state = get();
    return Object.values(state.toolsState);
  },

  // Check if specific tool is enabled
  isToolEnabled: (toolId: string) => {
    const state = get();
    return state.toolsState[toolId]?.isEnabled || false;
  },
}));
