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
import { RotateCcw } from 'lucide-react';
import { DetectTypeAtom, HoverEnteredAtom, RevealOnHoverModeAtom } from './atoms';
import { useResetState } from './hooks';

export function TopBar() {
  const resetState = useResetState();
  const [revealOnHover, setRevealOnHoverMode] = useAtom(RevealOnHoverModeAtom);
  const [detectType] = useAtom(DetectTypeAtom);
  const [, setHoverEntered] = useAtom(HoverEnteredAtom);

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => {
          resetState();
        }}
        className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
        title="Reset session"
      >
        <RotateCcw size={18} />
      </button>

      {(detectType === '2D bounding boxes' || detectType === 'Segmentation masks') && (
        <label className="cursor-pointer" title="Reveal on hover">
          <input
            type="checkbox"
            checked={revealOnHover}
            onChange={(e) => {
              if (e.target.checked) {
                setHoverEntered(false);
              }
              setRevealOnHoverMode(e.target.checked);
            }}
            className="hidden"
          />
          <span className={`text-xs font-medium px-2 py-1 rounded border ${revealOnHover
              ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
              : 'text-[var(--text-secondary)] border-[var(--border-color)]'
            }`}>
            Reveal
          </span>
        </label>
      )}
    </div>
  );
}
