import { useCallback, useLayoutEffect, useState, type RefObject } from 'react';

import type { TreeNodeId } from '../store/skillTree';

import { getNodeHexRadius } from './skillTreeGeometry';

import {

  getSkillAnchorRect,

  placeSkillTreePopover,

  type SkillPopoverPlacement,

  type SkillTreePanTransform,

} from './skillTreePopoverPlacement';



interface UseSkillTreePopoverLayoutOptions {

  viewportRef: RefObject<HTMLDivElement | null>;

  transform: SkillTreePanTransform;

  canvasX: number;

  canvasY: number;

  nodeId: TreeNodeId | 'core';

  popoverWidth: number;

  popoverHeight: number;

}



interface UseSkillTreePopoverLayoutResult {

  placement: SkillPopoverPlacement | null;

  dialogRef: (node: HTMLDivElement | null) => void;

}



export function useSkillTreePopoverLayout({

  viewportRef,

  transform,

  canvasX,

  canvasY,

  nodeId,

  popoverWidth,

  popoverHeight,

}: UseSkillTreePopoverLayoutOptions): UseSkillTreePopoverLayoutResult {

  const [placement, setPlacement] = useState<SkillPopoverPlacement | null>(null);

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

      const anchor = getSkillAnchorRect(

        canvasX,

        canvasY,

        getNodeHexRadius(nodeId),

        transform,

      );

      setPlacement(

        placeSkillTreePopover(

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


