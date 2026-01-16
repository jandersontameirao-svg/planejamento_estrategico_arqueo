import { Button } from "@/components/ui/button";
import { RotateCcw, RotateCw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UndoRedoToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  className?: string;
}

export function UndoRedoToolbar({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  className = "",
}: UndoRedoToolbarProps) {
  return (
    <TooltipProvider>
      <div className={`flex gap-2 ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Desfazer
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Desfazer (Ctrl+Z)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="gap-2"
            >
              <RotateCw className="h-4 w-4" />
              Refazer
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Refazer (Ctrl+Y)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
