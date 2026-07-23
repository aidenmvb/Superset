import { Link } from 'react-router-dom';
import { useCart } from '../cartContext';
import { formatMoney } from '../format';
import ProductPhoto from './ProductPhoto';
import { Pill } from './ui';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-paper-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-cyan/40 hover:shadow-lg hover:shadow-cyan/10">
      <Link to={`/product/${product.slug}`} className="block min-h-0 flex-1">
        <div className="relative overflow-hidden">
          <ProductPhoto product={product} size="md" />
          {!product.inStock && (
            <span className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/85 px-2.5 py-1 text-[10px] font-semibold text-white">
              Out of stock
            </span>
          )}
          <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1">
            <Pill className="bg-white/90 shadow-sm">{product.categoryName}</Pill>
            {product.applicationLabel && (
              <Pill
                className={
                  product.applicationRoute === 'topical'
                    ? 'bg-violet/90 text-white'
                    : product.applicationRoute === 'nasal'
                      ? 'bg-teal-deep/90 text-white'
                      : 'bg-ink/85 text-white'
                }
              >
                {product.applicationRoute === 'topical'
                  ? 'Topical'
                  : product.applicationRoute === 'nasal'
                    ? 'Nasal'
                    : 'Injectable'}
              </Pill>
            )}
          </div>
        </div>
      </Link>

      <div className="flex flex-col gap-2 border-t border-paper-line p-3.5 sm:p-4">
        <h3 className="font-display text-sm font-semibold leading-snug text-ink sm:text-[15px]">
          <Link to={`/product/${product.slug}`} className="hover:text-teal-deep">
            {product.name}
          </Link>
        </h3>
        {product.shortDescription && (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-graphite-soft sm:text-xs">
            {product.shortDescription}
          </p>
        )}
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <div>
            <div className="font-display text-base font-semibold text-ink sm:text-lg">
              {formatMoney(product.price)}
            </div>
            <div className="text-[11px] text-graphite-soft">
              {product.vialSize}
              {product.purity ? ` · ${product.purity}` : ''}
            </div>
          </div>
          <button
            type="button"
            disabled={!product.inStock}
            onClick={() => product.inStock && addItem(product, 1)}
            className="rounded-full bg-gradient-to-r from-teal to-violet px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
          >
            {product.inStock ? 'Add' : 'Sold out'}
          </button>
        </div>
      </div>
    </article>
  );
}
