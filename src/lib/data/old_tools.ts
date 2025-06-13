export interface Tool {
  id: string;
  name: string;
  icon: string;
  description: string;
  active: boolean;
}

export const Tools: Tool[] = [
  {
    id: "web-search",
    name: "Search Web",
    icon: "Globe",
    description: "Search the internet for current information",
    active: false,
  },
  {
    id: "deep-think",
    name: "Deep Think",
    icon: "Brain",
    description: "Enable enhanced reasoning and analysis",
    active: false,
  },
  {
    id: "functions",
    name: "Functions",
    icon: "Wrench",
    description: "Access to external tools and APIs",
    active: false,
  },
  {
    id: "mcp",
    name: "MCP",
    icon: "Puzzle",
    description: "Model Context Protocol integration",
    active: false,
  },
];
