// frontend/src/hooks/useDragDrop3D.ts
import { useRef, useState, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ObjetoSimulacion } from '../types/simulacion.types';

interface UseDragDrop3DReturn {
  isDragging: boolean;
  draggedObject: ObjetoSimulacion | null;
  handlePointerDown: (e: any, objeto: ObjetoSimulacion) => void;
  handlePointerUp: () => void;
  handlePointerMove: (e: any) => void;
}

export const useDragDrop3D = (
  onObjectMove: (id: string, position: [number, number, number]) => void
): UseDragDrop3DReturn => {
  const { camera, gl, raycaster, mouse } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [draggedObject, setDraggedObject] = useState<ObjetoSimulacion | null>(null);
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const intersectionPoint = useRef(new THREE.Vector3());
  const previousMouse = useRef(new THREE.Vector2());

  raycaster.far = 100;

  const handlePointerDown = useCallback((e: any, objeto: ObjetoSimulacion) => {
    e.stopPropagation();
    setIsDragging(true);
    setDraggedObject(objeto);
    gl.domElement.style.cursor = 'grabbing';
    
    previousMouse.current.set(e.clientX, e.clientY);
  }, [gl]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setDraggedObject(null);
    gl.domElement.style.cursor = 'auto';
  }, [gl]);

  const handlePointerMove = useCallback((e: any) => {
    if (!isDragging || !draggedObject) return;

    e.stopPropagation();

    const deltaX = e.clientX - previousMouse.current.x;
    const deltaY = e.clientY - previousMouse.current.y;
    previousMouse.current.set(e.clientX, e.clientY);

    raycaster.setFromCamera(
      new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      ),
      camera
    );

    if (raycaster.ray.intersectPlane(dragPlane.current, intersectionPoint.current)) {
      const clampedX = Math.max(-3.5, Math.min(3.5, intersectionPoint.current.x));
      const clampedZ = Math.max(-1.5, Math.min(1.5, intersectionPoint.current.z));
      
      const newPosition: [number, number, number] = [clampedX, 0.1, clampedZ];
      
      const currentPos = new THREE.Vector3(...draggedObject.position);
      const targetPos = new THREE.Vector3(...newPosition);
      const smoothedPos = currentPos.lerp(targetPos, 0.3);
      
      onObjectMove(draggedObject.id, [smoothedPos.x, smoothedPos.y, smoothedPos.z]);
    }
  }, [isDragging, draggedObject, camera, raycaster, onObjectMove]);

  useFrame(() => {
    if (isDragging && draggedObject) {
      const currentPos = new THREE.Vector3(...draggedObject.position);
      if (currentPos.y < 0.15) {
        const elevatedPos: [number, number, number] = [
          currentPos.x,
          0.15,
          currentPos.z
        ];
        onObjectMove(draggedObject.id, elevatedPos);
      }
    }
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isDragging) {
      handlePointerUp();
    }
  }, [isDragging, handlePointerUp]);

  useState(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  return {
    isDragging,
    draggedObject,
    handlePointerDown,
    handlePointerUp,
    handlePointerMove
  };
};

export const useDragDropObject3D = (
  objeto: ObjetoSimulacion,
  onMove: (position: [number, number, number]) => void
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { gl } = useThree();

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    gl.domElement.style.cursor = isHovered ? 'grab' : 'auto';
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setIsHovered(true);
    if (!isDragging) {
      gl.domElement.style.cursor = 'grab';
    }
  };

  const handlePointerOut = () => {
    setIsHovered(false);
    if (!isDragging) {
      gl.domElement.style.cursor = 'auto';
    }
  };

  return {
    isDragging,
    isHovered,
    handlePointerDown,
    handlePointerUp,
    handlePointerOver,
    handlePointerOut
  };
};