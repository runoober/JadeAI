'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { INTERVIEWER_COLORS, DEFAULT_INTERVIEWER_COLOR } from '@/lib/interview/interviewers';
import type { InterviewerConfig } from '@/types/interview';

interface InterviewerMessageProps {
  content: string;
  config: InterviewerConfig;
}

export function InterviewerMessage({ content, config }: InterviewerMessageProps) {
  const colorClass = INTERVIEWER_COLORS[config.type] || DEFAULT_INTERVIEWER_COLOR;
  const displayContent = content.replace(/\[ROUND_COMPLETE\]/g, '').trim();

  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold dark:bg-zinc-800">
        {config.name[0]}
      </div>
      <div className={cn('max-w-[80%] rounded-lg border px-4 py-3 text-sm', colorClass)}>
        <p className="mb-1 text-xs font-medium text-zinc-500">{config.name}</p>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
