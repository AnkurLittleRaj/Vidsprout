'use client';
import { useEffect, useRef, type RefObject } from 'react';
export function useDialogFocus(ref:RefObject<HTMLElement|null>, close:()=>void) {
  const closeRef=useRef(close);closeRef.current=close;
  useEffect(()=>{
    const before=document.activeElement as HTMLElement|null;
    const root=ref.current;if(!root)return;
    const elements=()=>Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href], video[controls], [tabindex="0"]'));
    (root.querySelector<HTMLElement>('[autofocus]') || elements()[0])?.focus();
    function handle(event:KeyboardEvent) {
      if(event.key==='Escape'){closeRef.current();return;}
      if(event.key!=='Tab')return;
      const items=elements(); const first=items[0],last=items[items.length-1];
      if(!first){event.preventDefault();return;}
      if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
    }
    const oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
    document.addEventListener('keydown',handle);
    return()=>{document.removeEventListener('keydown',handle);document.body.style.overflow=oldOverflow;before?.focus();};
  },[ref]);
}
