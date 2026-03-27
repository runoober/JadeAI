'use client';

import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { InterviewerConfig } from '@/types/interview';
import { INTERVIEWER_COLORS, DEFAULT_INTERVIEWER_COLOR } from '@/lib/interview/interviewers';

interface InterviewerCardProps {
  interviewer: InterviewerConfig;
  selected: boolean;
  onToggle: () => void;
  index?: number;
}

export function InterviewerCard({ interviewer, selected, onToggle, index }: InterviewerCardProps) {
  const t = useTranslations('interview.interviewers');
  const colorClass = INTERVIEWER_COLORS[interviewer.type] || DEFAULT_INTERVIEWER_COLOR;

  return (
    <Card
      className={cn(
        'relative cursor-pointer border-2 p-4 transition-all hover:shadow-md',
        selected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent',
        colorClass
      )}
      onClick={onToggle}
    >
      {selected && (
        <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
          {index !== undefined ? <span className="text-xs font-bold">{index + 1}</span> : <Check className="h-3 w-3" />}
        </div>
      )}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg font-semibold">{interviewer.name}</span>
        <Badge variant="secondary" className="text-xs">{t(interviewer.type as any)}</Badge>
      </div>
      <p className="mb-1 text-sm text-zinc-600 dark:text-zinc-400">{interviewer.title}</p>
      <p className="mb-2 text-xs text-zinc-500">{interviewer.bio}</p>
      <div className="flex flex-wrap gap-1">
        {interviewer.focusAreas.slice(0, 3).map((area) => (
          <Badge key={area} variant="outline" className="text-xs">
            {area}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
