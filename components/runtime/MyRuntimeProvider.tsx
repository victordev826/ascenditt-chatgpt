"use client";

import type { ReactNode } from "react";
import {
    AssistantRuntimeProvider,
    useLocalRuntime,
    type ChatModelAdapter,
} from "@assistant-ui/react";

const MyModelAdapter: ChatModelAdapter = {
    async run({ messages, abortSignal }) {
        // TODO replace with your own API
        const result = await fetch(`/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // forward the messages in the chat to the API
            body: JSON.stringify({
                messages,
            }),
            // if the user hits the "cancel" button or escape keyboard key, cancel the request
            signal: abortSignal,
        });

        const data = await result.json();

        console.log(data)
        return {
            content: [
                {
                    type: "text",
                    text: data,
                },
            ],
        };
    },
};

export function MyRuntimeProvider({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    const runtime = useLocalRuntime(MyModelAdapter);

    return (
        <AssistantRuntimeProvider runtime={runtime}>
            {children}
        </AssistantRuntimeProvider>
    );
}