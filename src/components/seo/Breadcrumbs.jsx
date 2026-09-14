import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbJsonLd } from '@/utils/seo';

/**
 * Responsive Breadcrumbs Component with embedded BreadcrumbList JSON-LD Schema
 * @param {Array<{name: string, url: string}>} items
 */
export default function Breadcrumbs({ items = [] }) {
  const fullItems = [
    { name: 'Home', url: '/' },
    ...items,
  ];

  const jsonLd = getBreadcrumbJsonLd(fullItems);

  return (
    <>
      <JsonLd data={jsonLd} />
      <nav aria-label="Breadcrumb" className="mb-6 overflow-x-auto py-1.5 px-3 rounded-lg bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm text-xs font-medium text-slate-400 flex items-center gap-2 whitespace-nowrap">
        {fullItems.map((item, index) => {
          const isLast = index === fullItems.length - 1;
          return (
            <React.Fragment key={item.url + index}>
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />}
              {isLast ? (
                <span className="text-emerald-400 font-semibold truncate max-w-[200px] sm:max-w-[300px]" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1 text-slate-300"
                >
                  {index === 0 && <Home className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{item.name}</span>
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </>
  );
}
