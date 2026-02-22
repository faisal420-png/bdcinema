'use client';
import React from 'react';

export function GlitchText({ text, className = '' }: { text: string; className?: string }) {
    return <span className={className}>{text}</span>;
}
