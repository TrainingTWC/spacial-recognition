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
import { useEffect } from 'react';
import { Content } from './Content';
import { DetectTypeSelector } from './DetectTypeSelector';
import { ExampleImages } from './ExampleImages';
import { ExtraModeControls } from './ExtraModeControls';
import { Prompt } from './Prompt';
import { SideControls } from './SideControls';
import { TopBar } from './TopBar';
import { DetectTypes } from './Types';
import {
  BumpSessionAtom,
  DetectTypeAtom,
  HoverEnteredAtom,
  ImageSrcAtom,
  InitFinishedAtom,
  IsUploadedImageAtom,
  RevealOnHoverModeAtom,
} from './atoms';
import { useResetState } from './hooks';
import { hash } from './utils';

function App() {
  const [, setImageSrc] = useAtom(ImageSrcAtom);
  const resetState = useResetState();
  const [initFinished, setInitFinished] = useAtom(InitFinishedAtom);
  const [, setBumpSession] = useAtom(BumpSessionAtom);
  const [, setIsUploadedImage] = useAtom(IsUploadedImageAtom);
  const [, setDetectType] = useAtom(DetectTypeAtom);
  const [revealOnHover, setRevealOnHoverMode] = useAtom(RevealOnHoverModeAtom);
  const [, setHoverEntered] = useAtom(HoverEnteredAtom);

  useEffect(() => {
    if (!window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.remove('dark');
    }
    const params = hash();
    const taskParam = params.task;

    if (taskParam) {
      let newDetectType: DetectTypes | null = null;
      switch (taskParam) {
        case '2d-bounding-boxes':
          newDetectType = '2D bounding boxes';
          break;
        case 'segmentation-masks':
          newDetectType = 'Segmentation masks';
          break;
        case 'points':
          newDetectType = 'Points';
          break;
        case '3d-bounding-boxes':
          newDetectType = '3D bounding boxes';
          break;
        default:
          console.warn(`Unknown task parameter in URL hash: ${taskParam}`);
      }
      if (newDetectType) {
        setDetectType(newDetectType);
      }
    }
  }, [setDetectType]);

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Sidebar */}
      <div className="sidebar">
        <DetectTypeSelector />
        <Prompt />

        {/* Visual Slider Placeholder */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm font-medium">
            <span>General</span>
            <span>Detailed</span>
          </div>
          <input type="range" min="0" max="100" defaultValue="50" disabled />
        </div>

        <SideControls />
      </div>

      {/* Main Content */}
      <div className="main-content relative">
        {/* Top Right Toggle */}
        <div className="absolute top-4 right-6 z-10 flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div className={`w-4 h-4 border-2 border-black flex items-center justify-center ${revealOnHover ? 'bg-black' : 'bg-white'}`}>
              {revealOnHover && <span className="text-white text-xs">✓</span>}
            </div>
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
            <span className="font-bold">Reveal On Hover</span>
          </label>
        </div>

        {initFinished ? <Content /> : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Upload an image to start
          </div>
        )}
        <ExtraModeControls />
      </div>
    </div>
  );
}

export default App;
