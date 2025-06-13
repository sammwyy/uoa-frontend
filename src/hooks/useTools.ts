import { useToolsStore } from "@/stores/tools-store";

export const useEnabledTools = () => {
  return useToolsStore((state) => state.getEnabledTools());
};

export const useTools = () => {
  return useToolsStore((state) => state.getAllToolsState());
};

export const useToolConfig = (toolId: string) => {
  return useToolsStore((state) => state.getToolState(toolId)?.config);
};

export const useIsToolEnabled = (toolId: string) => {
  return useToolsStore((state) => state.isToolEnabled(toolId));
};
