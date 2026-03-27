'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Resume } from '@/types/resume';

interface ResumeSelectorProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

export function ResumeSelector({ value, onChange }: ResumeSelectorProps) {
  const t = useTranslations('interview.setup');
  const [resumes, setResumes] = useState<Resume[]>([]);

  useEffect(() => {
    const fp = localStorage.getItem('jade_fingerprint');
    fetch('/api/resume', {
      headers: fp ? { 'x-fingerprint': fp } : {},
    })
      .then((r) => r.json())
      .then((data) => setResumes(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-2">
      <Label>{t('resumeLabel')}</Label>
      <Select value={value || '_none'} onValueChange={(v) => onChange(v === '_none' ? undefined : v)}>
        <SelectTrigger>
          <SelectValue placeholder={t('resumePlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_none">{t('resumeNone')}</SelectItem>
          {resumes.map((r) => (
            <SelectItem key={r.id} value={r.id}>
              {r.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-zinc-400">{t('resumeHint')}</p>
    </div>
  );
}
