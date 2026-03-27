'use client';

import { useTranslations } from 'next-intl';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const MAX_JD_LENGTH = 5000;

interface JDInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function JDInput({ value, onChange }: JDInputProps) {
  const t = useTranslations('interview.setup');

  return (
    <div className="space-y-2">
      <Label>{t('jdLabel')}</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_JD_LENGTH))}
        placeholder={t('jdPlaceholder')}
        className="min-h-[200px] resize-y"
      />
      <p className="text-right text-xs text-zinc-400">
        {t('jdCharCount', { count: value.length })}
      </p>
    </div>
  );
}
