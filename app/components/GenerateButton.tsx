"use client";

import { Loader2 } from "lucide-react";
import { Button } from "./ui/Button";

interface Props {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export default function GenerateButton({ loading, disabled, onClick }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-border">
      <div className="max-w-2xl mx-auto">
        <Button
          onClick={onClick}
          disabled={disabled}
          size="xl"
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              正在生成...
            </>
          ) : (
            "生成课后总结"
          )}
        </Button>
      </div>
    </div>
  );
}
