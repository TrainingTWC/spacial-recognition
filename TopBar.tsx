/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* tslint:disable */
// Copyright 2024 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { useAtom } from 'jotai';
import { RotateCcw, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DetectTypeAtom, RevealOnHoverModeAtom } from './atoms';
import { useResetState } from './hooks';

export function TopBar() {
  const resetState = useResetState();
  const [revealOnHover, setRevealOnHover] = useAtom(RevealOnHoverModeAtom);
  const [, setDetectType] = useAtom(DetectTypeAtom);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Initialize theme from system preference or default to dark
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    if (!prefersDark) {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="flex items-center gap-3">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
        aria-label="Toggle theme">
        {isDarkMode ? (
          <Sun className="w-4 h-4 text-[var(--text-secondary)]" />
        ) : (
          <Moon className="w-4 h-4 text-[var(--text-secondary)]" />
        )}
      </button>

      {/* Reset Button */}
      <button
        onClick={() => {
          resetState();
          setDetectType('2D bounding boxes');
        }}
        className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
        aria-label="Reset session">
        <RotateCcw className="w-4 h-4 text-[var(--text-secondary)]" />
      </button>

      {/* Reveal on Hover Toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none group">
        <input
          type="checkbox"
          checked={revealOnHover}
          onChange={(e) => setRevealOnHover(e.target.checked)}
          className="accent-[var(--accent-primary)]"
        />
        <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
          Reveal
        </span>
      </label>
    </div>
  );
}
