---
title: Turning Pull Requests into Blog Posts 
date: 2025-07-19
tags:
category: ai
description: Technical guide covering the implementation of an AI-powered prompt editor with text selection detection, sidebar interface, Supabase edge functions, and streaming OpenAI responses. Includes code examples, security considerations, and cost optimization strategies using GPT-4o tier models.
---

Here's the thing about technical blog posts—they require a unique blend of technical accuracy, storytelling, and accessibility. When you're deep in the code, you understand every nuance. But by the time you sit down to write about it days or weeks later, you've lost that immediate connection.

I've been a long proponent for using GitHub pull requests for knowledge sharing and if you do it correctly, you can turn pull requests into blog posts. This is exactly what i've done with [PR#23](https://github.com/bdougie/pull2press/pull/23), in my pull2press project. 

![pull2press editor](https://mzjbwtuwfhqujpktlonh.supabase.co/storage/v1/object/public/editor-images/35c8273e-0adb-4869-8bcf-e709645599a4/1752963779704-ml4dmyq.png)

## Purpose and Context

The primary goal of these changes is to streamline the writing process for users by leveraging the capabilities of OpenAI's language models. We have introduced an intuitive prompt editor that detects text selection and offers a sidebar interface for AI-driven enhancements. The changes are part of our commitment to improving user productivity and content quality.

## Technical Implementation Details

### Prompt Editor

The prompt editor is the centerpiece of these changes. It detects when users select text within the markdown editor and activates a sliding sidebar that provides a chat-style interface for interaction with OpenAI's models.

#### Sidebar Interface

The sidebar interface is a significant UX enhancement over traditional pop-up dialogs. It provides a non-intrusive, consistent space for users to interact with AI suggestions without losing the context of their work. The implementation involves a new `PromptEditorSidebar` component that elegantly slides in from the right, housing all the chat functionality within a 400px width container.

```jsx
// PromptEditorSidebar.tsx
import React from 'react';
...
export default function PromptEditorSidebar({ isOpen, onToggle }) {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      ...
      {/* Sidebar content goes here */}
      ...
    </div>
  );
}
```

### Supabase Edge Function

Security and performance are paramount in our implementation. By switching from a client-side OpenAI SDK to a Supabase edge function, we ensure that the OpenAI API key is securely handled server-side. This prevents exposure of sensitive data and offloads the computational workload.

```javascript
// /api/prompt-editor/route.ts
import { createClient } from '@supabase/supabase-js';
...
export default async function handler(req, res) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  ...
  const { data, error } = await supabase.functions.invoke('openai-call', {
    body: JSON.stringify({ prompt: userPrompt }),
  });
  ...
}
```

### OpenAI Tier Models

Cost optimization is another critical aspect of this update. We have transitioned to the OpenAI gpt-4o tier, which allows for up to 1 million free tokens per day, greatly reducing operational costs while maintaining the same level of functionality.

## Important Code Changes

### Text Selection Detection

A refined text selection detection system has been implemented. This feature is crucial for triggering the prompt editor interface. The system now includes a debounce mechanism to improve reliability and performance.

```javascript
// useTextSelection.ts
import { useState, useEffect } from 'react';
...
export default function useTextSelection() {
  const [selectedText, setSelectedText] = useState('');
  ...
  useEffect(() => {
    const handleTextSelect = debounce(() => {
      const text = window.getSelection().toString();
      setSelectedText(text);
    }, 100);
    document.addEventListener('selectionchange', handleTextSelect);
    return () => document.removeEventListener('selectionchange', handleTextSelect);
  }, []);
  ...
}
```

### Streaming Responses

The prompt editor now supports real-time streaming of AI responses. This feature allows users to see suggestions as they're being generated, providing an interactive and dynamic experience.

```javascript
// PromptEditorSidebar.tsx
...
function streamResponses(prompt) {
  const stream = new EventSource('/api/stream-responses');
  stream.onmessage = function (event) {
    const data = JSON.parse(event.data);
    if (data.message) {
      updateMessages(data.message);
    }
  };
  sendPrompt(prompt);
}
...
```

### Updated Documentation

Comprehensive documentation has been added to guide users and developers through the new prompt editor. This includes technical details, usage instructions, and a troubleshooting guide.

```markdown
# Prompt Editor Documentation

The prompt editor is designed to assist users in improving their writing by providing AI-powered suggestions...

## Features

- Text Selection Detection
- Sidebar Interface
- AI-Powered Improvements
- ...

## Technical Implementation

- Supabase Edge Function
- Streaming Responses
- ...

## Usage

To activate the prompt editor, simply select the text you wish to improve and click on the "AI Editor" button...
```

## Conclusions: Impact and Benefits

The integration of the AI-powered prompt editor is a testament to our commitment to delivering state-of-the-art tools that enhance user experience. With features like text selection detection, a sidebar UI, streaming responses, and context management, users can now interact with AI in a seamless and intuitive manner.

The switch to Supabase edge functions for OpenAI API calls not only prioritizes security but also ensures a performant and scalable infrastructure. Moreover, the shift to OpenAI's gpt-4o tier models presents a cost-effective solution without compromising on capabilities.

Ultimately, these changes signify our dedication to innovation, user satisfaction, and operational excellence. We are excited to see how our users leverage this new editor to produce content that is not only engaging but also finely crafted with the assistance of AI.

Stay tuned for more updates as we continue to push the boundaries of what's possible in the realm of content creation tools.
