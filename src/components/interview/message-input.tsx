'use client';

import { useTranslations } from 'next-intl';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  input: string;
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function MessageInput({ input, isLoading, onChange, onSubmit }: MessageInputProps) {
  const t = useTranslations('interview.room');

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Textarea
        value={input}
        onChange={onChange}
        placeholder={t('inputPlaceholder')}
        disabled={isLoading}
        className="min-h-[60px] flex-1 resize-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            onSubmit(e as any);
          }
        }}
      />
      <Button type="submit" disabled={!input.trim() || isLoading} size="icon" className="h-[60px] w-[60px]">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
