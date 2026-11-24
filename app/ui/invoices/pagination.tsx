import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { generatePagination } from '@/app/lib/utils';

export default function Pagination({
  totalPages,
  currentPage,
  query,
}: {
  totalPages: number;
  currentPage?: number;
  query?: string;
}) {
  if (currentPage === undefined || totalPages <= 1) return null;

  function pageUrl(page: number) {
    const params = new URLSearchParams({ page: String(page) });
    if (query) params.set('query', query);
    return '?' + params;
  }

  const linkClass =
    'flex h-10 min-w-10 items-center justify-center rounded-md border px-2 text-sm hover:bg-gray-100';

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      {currentPage > 1 && (
        <Link href={pageUrl(currentPage - 1)} aria-label="Previous page" className={linkClass}>
          <ArrowLeftIcon className="w-4" aria-hidden="true" />
        </Link>
      )}
      {generatePagination(currentPage, totalPages).map((page, index) =>
        typeof page === 'string' ? (
          <span key={'ellipsis-' + index} aria-hidden="true" className="px-2">{page}</span>
        ) : (
          <Link
            key={page}
            href={pageUrl(page)}
            aria-label={'Page ' + page}
            aria-current={page === currentPage ? 'page' : undefined}
            className={linkClass + (page === currentPage ? ' border-blue-700 font-bold text-blue-700' : '')}
          >
            {page}
          </Link>
        ),
      )}
      {currentPage < totalPages && (
        <Link href={pageUrl(currentPage + 1)} aria-label="Next page" className={linkClass}>
          <ArrowRightIcon className="w-4" aria-hidden="true" />
        </Link>
      )}
    </nav>
  );
}
