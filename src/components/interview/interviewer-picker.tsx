'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InterviewerCard } from './interviewer-card';
import { CustomInterviewerDialog } from './custom-interviewer-dialog';
import { getPresetInterviewers } from '@/lib/interview/interviewers';
import type { InterviewerConfig } from '@/types/interview';

interface InterviewerPickerProps {
  selected: InterviewerConfig[];
  onChange: (selected: InterviewerConfig[]) => void;
}

export function InterviewerPicker({ selected, onChange }: InterviewerPickerProps) {
  const t = useTranslations('interview.setup');
  const locale = useLocale() as 'zh' | 'en';
  const presets = getPresetInterviewers(locale);

  const allInterviewers = [
    ...presets,
    ...selected.filter((s) => s.type.startsWith('custom_')),
  ];

  const toggleInterviewer = (interviewer: InterviewerConfig) => {
    const exists = selected.find((s) => s.type === interviewer.type);
    if (exists) {
      onChange(selected.filter((s) => s.type !== interviewer.type));
    } else {
      onChange([...selected, interviewer]);
    }
  };

  const handleAddCustom = (config: InterviewerConfig) => {
    onChange([...selected, config]);
  };

  return (
    <div className="space-y-2">
      <Label>{t('interviewerLabel')}</Label>
      <p className="text-xs text-zinc-400">{t('interviewerHint')}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {allInterviewers.map((interviewer) => {
          const selectedIndex = selected.findIndex((s) => s.type === interviewer.type);
          return (
            <InterviewerCard
              key={interviewer.type}
              interviewer={interviewer}
              selected={selectedIndex >= 0}
              onToggle={() => toggleInterviewer(interviewer)}
              index={selectedIndex >= 0 ? selectedIndex : undefined}
            />
          );
        })}
      </div>
      <CustomInterviewerDialog
        onAdd={handleAddCustom}
        trigger={
          <Button variant="outline" size="sm">
            <Plus className="mr-1 h-3 w-3" />
            {t('customInterviewer')}
          </Button>
        }
      />
    </div>
  );
}
