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
import { ExtraModeControls } from './ExtraModeControls';
import { Prompt } from './Prompt';
import { SideControls } from './SideControls';
import { TopBar } from './TopBar';
import { DetectTypes } from './Types';
import {
  BumpSessionAtom,
  DetectTypeAtom,
  ImageSrcAtom,
  InitFinishedAtom,
  IsUploadedImageAtom,
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
    <div className="dashboard-container animate-fade-in relative">
      {/* Theme Toggle - Top Right Corner */}
      <div className="absolute top-4 right-4 z-50">
        <TopBar />
      </div>

      {/* Sidebar (Left - 20%) */}
      <div className="sidebar">
        <div className="flex flex-col gap-4 mb-4">
          <span className="font-semibold text-lg text-[var(--text-primary)]">Spatial Understanding</span>
        </div>

        <DetectTypeSelector />
        <Prompt />
        <SideControls />
      </div>

      {/* Main Content (Right - 80%) */}
      <div className="main-content">
        {initFinished ? <Content /> : null}
        <ExtraModeControls />
      </div>
    </div>
  );
}

export default App;
