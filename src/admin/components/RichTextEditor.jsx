import { useEffect, useRef } from 'react';
import {
  FiBold, FiItalic, FiLink, FiList, FiUnderline,
} from 'react-icons/fi';
import { MdFormatListNumbered, MdFormatQuote } from 'react-icons/md';

/**
 * A small dependency-free rich-text editor (contentEditable + execCommand)
 * for blog content. Kept deliberately lightweight rather than pulling in a
 * full editor framework — the PHP API sanitizes saved HTML against an
 * allowlist regardless of what this editor produces.
 */
export default function RichTextEditor({ label, value, onChange, hint }) {
  const ref = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current && ref.current) {
      ref.current.innerHTML = value || '';
      isFirstRender.current = false;
    }
  }, [value]);

  const exec = (command, arg) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    onChange(ref.current.innerHTML);
  };

  const handleLink = () => {
    const url = window.prompt('Link URL');
    if (url) exec('createLink', url);
  };

  return (
    <div>
      {label && <span className="block text-sm font-medium text-slate-700">{label}</span>}
      {hint && <span className="mt-1 block text-xs font-normal text-slate-400">{hint}</span>}
      <div className="mt-1.5 overflow-hidden rounded-lg border border-slate-200">
        <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-1.5">
          <ToolBtn onClick={() => exec('bold')}><FiBold /></ToolBtn>
          <ToolBtn onClick={() => exec('italic')}><FiItalic /></ToolBtn>
          <ToolBtn onClick={() => exec('underline')}><FiUnderline /></ToolBtn>
          <ToolBtn onClick={() => exec('formatBlock', 'H2')}>H2</ToolBtn>
          <ToolBtn onClick={() => exec('formatBlock', 'H3')}>H3</ToolBtn>
          <ToolBtn onClick={() => exec('formatBlock', 'P')}>P</ToolBtn>
          <ToolBtn onClick={() => exec('insertUnorderedList')}><FiList /></ToolBtn>
          <ToolBtn onClick={() => exec('insertOrderedList')}><MdFormatListNumbered /></ToolBtn>
          <ToolBtn onClick={() => exec('formatBlock', 'BLOCKQUOTE')}><MdFormatQuote /></ToolBtn>
          <ToolBtn onClick={handleLink}><FiLink /></ToolBtn>
        </div>
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={() => onChange(ref.current.innerHTML)}
          onBlur={() => onChange(ref.current.innerHTML)}
          className="min-h-[240px] px-4 py-3 text-sm leading-6 text-slate-800 outline-none [&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
        />
      </div>
      <p className="mt-1 text-xs text-slate-400">Saved content is sanitized on the server against a safe allowlist.</p>
    </div>
  );
}

function ToolBtn({ children, onClick }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="grid h-7 min-w-7 place-items-center rounded-md px-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
    >
      {children}
    </button>
  );
}
