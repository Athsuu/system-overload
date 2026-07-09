import { useCallback, useLayoutEffect, useState, type RefObject } from 'react';

import type { TreeNodeId } from '../store/moduleTree';

import { getNodeHexRadius } from './moduleTreeGeometry';

import {

  getModuleAnchorRect,

  placeModuleTreePopover,

  type ModulePopoverPlacement,

  type ModuleTreePanTransform,

} from './moduleTreePopoverPlacement';



interface UseModuleTreePopoverLayoutOptions {

  viewportRef: RefObject<HTMLDivElement | null>;

  transform: ModuleTreePanTransform;

  canvasX: number;

  canvasY: number;

  nodeId: TreeNodeId | 'core';

  popoverWidth: number;

  popoverHeight: number;

}



interface UseModuleTreePopoverLayoutResult {

  placement: ModulePopoverPlacement | null;

  dialogRef: (node: HTMLDivElement | null) => void;

}



export function useModuleTreePopoverLayout({

  viewportRef,

  transform,

  canvasX,

  canvasY,

  nodeId,

  popoverWidth,

  popoverHeight,

}: UseModuleTreePopoverLayoutOptions): UseModuleTreePopoverLayoutResult {

  const [placement, setPlacement] = useState<ModulePopoverPlacement | null>(null);

  const [dialogNode, setDialogNode] = useState<HTMLDivElement | null>(null);



  const dialogRef = useCallback((node: HTMLDivElement | null) => {

    setDialogNode(node);

  }, []);



  useLayoutEffect(() => {

    const viewport = viewportRef.current;

    if (!viewport) {

      setPlacement(null);

      return;

    }



    const update = () => {

      const measured = dialogNode?.getBoundingClientRect().height;

      const height = measured && measured > 0 ? measured : popoverHeight;

      const anchor = getModuleAnchorRect(

        canvasX,

        canvasY,

        getNodeHexRadius(nodeId),

        transform,

      );

      setPlacement(

        placeModuleTreePopover(

          anchor,

          popoverWidth,

          height,

          { width: viewport.clientWidth, height: viewport.clientHeight },

        ),

      );

    };



    update();



    const observer = new ResizeObserver(update);

    observer.observe(viewport);

    if (dialogNode) observer.observe(dialogNode);

    window.addEventListener('resize', update);



    return () => {

      observer.disconnect();

      window.removeEventListener('resize', update);

    };

  }, [

    canvasX,

    canvasY,

    dialogNode,

    nodeId,

    popoverHeight,

    popoverWidth,

    transform.scale,

    transform.x,

    transform.y,

    viewportRef,

  ]);



  return { placement, dialogRef };

}


