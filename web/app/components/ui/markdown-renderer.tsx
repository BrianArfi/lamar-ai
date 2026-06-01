'use client';

import React from 'react';

interface MarkdownRendererProps {
  text: string;
}

export function MarkdownRenderer({ text }: MarkdownRendererProps) {
  if (!text) return null;

  const lines = text.split('\n');

  // Helper function to render text with bold formatting (**text**)
  const renderFormattedText = (rawText: string, textClass: string = "text-zinc-450") => {
    if (!rawText) return null;
    const parts = rawText.split('**');
    return (
      <span className={textClass}>
        {parts.map((part, index) => 
          index % 2 === 1 ? (
            <strong key={index} className="font-semibold text-zinc-150">
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="space-y-2.5 font-sans">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        // 1. Headers
        if (trimmed.startsWith('#')) {
          const depth = (trimmed.match(/#/g) || []).length;
          const cleanText = trimmed.replace(/#/g, '').trim();
          if (depth === 1) {
            return (
              <h1 key={i} className="text-sm font-extrabold text-zinc-100 border-b border-zinc-800 pb-2 mb-2 tracking-tight">
                {renderFormattedText(cleanText, "text-zinc-100")}
              </h1>
            );
          }
          if (depth === 2) {
            return (
              <h2 key={i} className="text-xs font-bold text-zinc-200 mt-4 tracking-tight">
                {renderFormattedText(cleanText, "text-zinc-200")}
              </h2>
            );
          }
          return (
            <h3 key={i} className="text-xs font-bold text-violet-400 mt-3 tracking-wide">
              {renderFormattedText(cleanText, "text-violet-400")}
            </h3>
          );
        }

        // 2. Block titles (e.g. Block A:)
        if (trimmed.startsWith('Block ') || trimmed.startsWith('Bloque ')) {
          return (
            <h3 key={i} className="text-xs font-extrabold text-violet-450 mt-4 tracking-wider uppercase border-l-2 border-violet-500 pl-2">
              {trimmed}
            </h3>
          );
        }

        // 3. Dividers
        if (trimmed === '---' || trimmed === '===') {
          return <hr key={i} className="border-zinc-800 my-3" />;
        }

        // 4. List items (starting with - or * followed by a space)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const cleanText = trimmed.slice(2).trim();
          return (
            <div key={i} className="flex items-start gap-2 text-xs text-zinc-400 pl-2 leading-relaxed">
              <span className="text-violet-400 mt-1.5 text-[6px]">●</span>
              {renderFormattedText(cleanText, "text-zinc-400")}
            </div>
          );
        }

        // 5. Standard paragraphs
        if (trimmed.length > 0) {
          return (
            <p key={i} className="text-xs text-zinc-400 leading-relaxed">
              {renderFormattedText(trimmed, "text-zinc-400")}
            </p>
          );
        }

        return <div key={i} className="h-1.5" />;
      })}
    </div>
  );
}
