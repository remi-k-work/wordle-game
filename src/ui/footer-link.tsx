// services, features, and other libraries
import { T, useGT } from "gt-react";

export function FooterLink() {
  const gt = useGT();

  return (
    <a
      href="https://www.remiforge.dev"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={gt("Visit RemiForge Portfolio (opens in a new tab)")}
      className="mx-auto mt-9 flex max-w-xl flex-wrap items-center gap-5 rounded-xl border border-gray-700 bg-neutral-900 p-4 text-start text-neutral-200 no-underline transition-colors hover:border-gray-500"
    >
      <img
        src="https://www.remiforge.dev/opengraph-image.jpg"
        width="1200"
        height="630"
        alt={gt("RemiForge Portfolio")}
        loading="lazy"
        decoding="async"
        className="aspect-1200/630 h-auto w-32 flex-none rounded-lg object-cover"
      />
      <div className="min-w-56 flex-1">
        <div className="mb-1 text-sm tracking-wider text-neutral-400 uppercase">
          <span aria-hidden="true">👨‍💻</span> <T>Built By</T>
        </div>
        <div className="flex items-center gap-2 text-2xl font-bold text-white">
          RemiForge
          <span aria-hidden="true" className="text-xl font-normal text-gray-500">
            ↗
          </span>
        </div>
        <div className="mt-1 text-sm text-neutral-400">
          <T>Portfolio of Projects, Experiments & Contact</T>
        </div>
      </div>
    </a>
  );
}
