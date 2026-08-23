// types
import type { ComponentPropsWithRef } from "react";

export function PlFlagIcon({ ref, className }: ComponentPropsWithRef<"svg">) {
  return (
    <svg ref={ref} viewBox="0 0 512 512" className={className}>
      <g fillRule="evenodd">
        <path fill="#fff" d="M512 512H0V0h512z" />
        <path fill="#dc143c" d="M512 512H0V256h512z" />
      </g>
    </svg>
  );
}
