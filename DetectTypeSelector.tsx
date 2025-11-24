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
import { Box, Layers, MapPin, Box as Box3d } from 'lucide-react';
import { DetectTypeAtom, HoverEnteredAtom } from './atoms';
import { DetectTypes } from './Types';

const DETECTION_TYPES = [
  { label: '2D bounding boxes', icon: Box },
  { label: 'Segmentation masks', icon: Layers },
  { label: 'Points', icon: MapPin },
  { label: '3D bounding boxes', icon: Box3d },
] as const;

export function DetectTypeSelector() {
  return (
    <div className="flex flex-col flex-shrink-0 gap-2">
      <div className="text-xs font-bold text-[var(--text-color-secondary)] uppercase tracking-wide">
        Detection Type
      </div>
      <div className="flex flex-col gap-1">
        {DETECTION_TYPES.map(({ label, icon: Icon }) => (
          <SelectOption key={label} label={label} icon={Icon} />
        ))}
      </div>
    </div>
  );
}

function SelectOption({
  label,
  icon: Icon,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  const [detectType, setDetectType] = useAtom(DetectTypeAtom);
  const [, setHoverEntered] = useAtom(HoverEnteredAtom);
  const isActive = detectType === label;

  return (
    <button
      className={`card interactive flex items-center gap-4 px-6 py-5 text-left ${isActive ? 'active' : ''
        }`}
      style={{
        background: isActive
          ? 'var(--gradient-primary)'
          : 'var(--box-color)',
        color: isActive ? 'white' : 'var(--text-color-primary)',
        border: 'none',
        minHeight: '64px',
      }}
      onClick={() => {
        setHoverEntered(false);
        setDetectType(label as DetectTypes);
      }}>
      <Icon
        size={24}
        className={isActive ? 'opacity-100' : 'opacity-60'}
      />
      <span className="font-medium">{label}</span>
    </button>
  );
}
