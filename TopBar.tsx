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
    <div className="flex w-full items-center px-6 py-4 border-b justify-between glass">
      <div className="flex gap-4 items-center">
        <button
          onClick={() => {
            resetState();
          }}
          className="ghost icon-only"
          title="Reset session"
          style={{
            minHeight: '40px',
          }}>
          <RotateCcw size={18} />
        </button>
        <span className="font-semibold text-lg">Spatial Understanding</span>
      </div>
      <div className="flex gap-4 items-center">
        {detectType === '2D bounding boxes' ||
          detectType === 'Segmentation masks' ? (
          <label className="flex items-center gap-3 px-4 py-2 select-none whitespace-nowrap cursor-pointer rounded-full bg-[var(--bg-secondary)] transition-all hover:bg-[var(--border-color)]">
            <input
              type="checkbox"
              checked={revealOnHover}
              onChange={(e) => {
                if (e.target.checked) {
                  setHoverEntered(false);
                }
                setRevealOnHoverMode(e.target.checked);
              }}
              className="cursor-pointer"
            />
            <span className="text-sm font-medium">Reveal on hover</span>
          </label>
        ) : null}
      </div>
    </div>
  );
}
