"use client";

import { useEdgeRuntime } from "@assistant-ui/react";
import { Thread } from "@assistant-ui/react";
import { makeMarkdownText } from "@assistant-ui/react-markdown";

const MarkdownText = makeMarkdownText();

export function MyAssistant() {
  // const runtime = useEdgeRuntime({ api: "/api/chat/google-ads/query" });

  return (
    <div className="h-full">
      <Thread
        // runtime={runtime}
        assistantMessage={{
          components: { Text: MarkdownText },
        }}
      />
    </div>
  );
}
