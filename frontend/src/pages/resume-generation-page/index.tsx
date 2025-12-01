import { Splitter } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

import { useDebouncedMutation } from '@/hooks/utils/useDebouncedMutation';
import { generateResumeContent, getResume, getResumeHtml, updateResume } from '@/services/resume';
import type { Resume, ResumeData } from '@/types/resume';

import Editor from './Editor';
import Preview from './Preview';

export default function ResumeGenerationPage() {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resumeId');
  const queryClient = useQueryClient();

  const [resumeData, setResumeData] = useState('');

  // Get existing resume by ID
  const { data: resume } = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: () => getResume(resumeId!),
    enabled: !!resumeId,
    staleTime: Infinity,
    retry: false,
  });

  // Get resume HTML separately (no cache, always fresh)
  const { data: html = '' } = useQuery({
    queryKey: ['resume', resumeId, 'html'],
    queryFn: () => getResumeHtml(resumeId!),
    enabled: !!resumeId,
    staleTime: 0, // Always fetch fresh HTML
  });

  // Generate content for empty shell
  const { mutate: generateContent, isPending: isGenerating } = useMutation({
    mutationFn: (resumeId: string) => generateResumeContent(resumeId),
    onSuccess: (data) => {
      // Update cache and editor with generated content
      queryClient.setQueryData(['resume', resumeId], data);
      setResumeData(JSON.stringify(data.data, null, 2));
      // Invalidate HTML cache to get fresh render
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId, 'html'] });
    },
  });

  // Track if we've already initiated generation to prevent double-firing
  const hasInitiatedGenerationRef = useRef(false);

  // Initialize resume data and trigger generation for empty shells
  useEffect(() => {
    if (!resume) return;

    // Always update editor with current data
    setResumeData(JSON.stringify(resume.data, null, 2));

    // Auto-generate if shell is empty (only once)
    const isEmpty = resume.data.sections.length === 0;
    if (isEmpty && !hasInitiatedGenerationRef.current && !isGenerating) {
      hasInitiatedGenerationRef.current = true;
      generateContent(resume.id);
    }
  }, [resume, isGenerating, generateContent]);

  const { mutate: saveResume, isPending: isSaving } = useDebouncedMutation<Resume, Error, string>({
    mutationFn: async (jsonData: string) => {
      if (!resumeId) throw new Error('No resume ID');
      const parsedData: ResumeData = JSON.parse(jsonData);
      return updateResume(resumeId, parsedData);
    },
    onSuccess: () => {
      // Invalidate HTML cache to trigger re-render with new data
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId, 'html'] });
    },
    onError: (error) => {
      console.error('Failed to save resume:', error);
    },
    delay: 1000,
  });

  const handleEditorChange = (value: string) => {
    setResumeData(value);

    // Try to parse and save if valid JSON
    try {
      JSON.parse(value);
      saveResume(value);
    } catch {
      // Invalid JSON, don't save yet
    }
  };

  return (
    <Splitter.Root panels={[{ id: 'editor' }, { id: 'preview' }]}>
      <Splitter.Panel id="editor">
        <Editor value={resumeData} onChange={handleEditorChange} />
      </Splitter.Panel>

      <Splitter.ResizeTrigger id="editor:preview" />

      <Splitter.Panel id="preview">
        <Preview html={html} isSaving={isSaving} isGenerating={isGenerating} />
      </Splitter.Panel>
    </Splitter.Root>
  );
}
