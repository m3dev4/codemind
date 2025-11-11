import { statusConfig } from "@/constants/statusConfig";
import { ProjectStatus } from "@/types/projects/project.type";
import { Badge } from "../ui/badge";

const StatusBadge = ({ status }: { status: ProjectStatus }) => {
  const config = statusConfig[status];

  return (
    <>
      <Badge
        className={`${config.bg} ${config.border} ${config.text} border backdrop-blur-sm font-sora font-medium px-4 py-1.5`}
      >
        {config.label}
      </Badge>
    </>
  );
};
