import { GitBranch, Plus } from "lucide-react";
import React from "react";

import { ChatBranch } from "@/lib/graphql";
import { Button } from "../ui/Button";
import { Dropdown } from "../ui/Dropdown";

interface BranchDropdownProps {
  branches: ChatBranch[];
  currentBranchId?: string;
  onBranchSelect: (branchId: string) => void;
  onCreateBranch: () => void;
  disabled?: boolean;
}

export const BranchDropdown: React.FC<BranchDropdownProps> = ({
  branches,
  currentBranchId,
  onBranchSelect,
  onCreateBranch,
  disabled = false,
}) => {
  const currentBranch = branches.find((b) => b._id === currentBranchId);

  // Convert branches to dropdown options
  const branchOptions = branches.map((branch) => ({
    value: branch._id,
    label: branch.name,
    description: `${branch.messageCount} messages${
      !branch.isActive ? " (inactive)" : ""
    }`,
    icon: GitBranch,
  }));

  return (
    <div className="flex items-center gap-2">
      <Dropdown
        options={branchOptions}
        value={currentBranchId}
        onSelect={onBranchSelect}
        placeholder="Select branch..."
        disabled={disabled}
        className="min-w-[140px]"
      />

      <Button
        variant="ghost"
        size="sm"
        icon={Plus}
        onClick={onCreateBranch}
        disabled={disabled}
        className="p-2 flex-shrink-0"
        title="Create new branch"
      />
    </div>
  );
};
