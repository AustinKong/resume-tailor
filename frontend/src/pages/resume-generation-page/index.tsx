import { Splitter } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

import { generateResume } from '@/services/resume';

import Editor from './Editor';
import Preview from './Preview';

export default function ResumeGenerationPage() {
  const [searchParams] = useSearchParams();
  const listingIdParam = searchParams.get('listingId');

  const [resumeData, setResumeData] = useState('');
  const [resumeHtml, setResumeHtml] = useState('');

  useEffect(() => {
    if (!listingIdParam) return;

    const handleGenerate = async () => {
      const { resume, html } = await generateResume(listingIdParam);
      setResumeData(JSON.stringify(resume, null, 2));
      setResumeHtml(html);
    };

    handleGenerate();
  }, [listingIdParam]);

  return (
    <Splitter.Root panels={[{ id: 'editor' }, { id: 'preview' }]}>
      <Splitter.Panel id="editor">
        <Editor value={resumeData} onChange={setResumeData} />
      </Splitter.Panel>

      <Splitter.ResizeTrigger id="editor:preview" />

      <Splitter.Panel id="preview">
        <Preview html={resumeHtml} />
      </Splitter.Panel>
    </Splitter.Root>
  );
}
