import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useMap } from '@vis.gl/react-google-maps';
import type { ControlPosition as ControlPositionType } from '@vis.gl/react-google-maps';

interface MapControlProps {
  position: ControlPositionType;
  children: ReactNode;
}

export function MapControl({ position, children }: MapControlProps) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const map = useMap();
  
  // Create control container once using useMemo
  const controlDiv = useMemo(() => {
    const div = document.createElement('div');
    div.style.margin = '10px';
    return div;
  }, []);

  useEffect(() => {
    if (!map || !controlDiv) return;

    // Add control to map
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const controls = map.controls[position];
    
    // Verify controls exist before adding
    if (!controls) return;
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    controls.push(controlDiv);

    // Cleanup: remove control from map
    return () => {
      // Check if controls and getArray method exist
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!controls || typeof controls.getArray !== 'function') return;
      
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const controlArray = controls.getArray();
      if (!controlArray) return;
      
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const index = controlArray.indexOf(controlDiv);
      if (index > -1) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        controls.removeAt(index);
      }
    };
  }, [map, position, controlDiv]);

  // Render children into the control div using portal
  return controlDiv ? createPortal(children, controlDiv) : null;
}
