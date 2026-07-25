import { Link } from 'react-router-dom';
import { useCart } from '../cartContext';
import { formatMoney } from '../format';
import ProductPhoto from './ProductPhoto';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const formLabel =
    product.applicationRoute === 'topical'
      ? 'Topical'
      : product.applicationRoute === 'nasal'
        ? 'Nasal'
        : 'Injectable';

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-paper-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-teal/30 hover:shadow-lg">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden">
          <ProductPhoto product={product} size="md" showCaption={false} />
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-ink shadow-sm">
            {formLabel}
          </span>
          {!product.inStock && (
            <span className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/85 px-2.5 py-1 text-[10px] font-semibold text-white">
              Out of stock
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 border-t border-paper-line p-3.5 sm:p-4">
        <h3 className="font-display text-sm font-semibold leading-snug text-ink sm:text-[15px]">
          <Link to={`/product/${product.slug}`} className="hover:text-teal-deep">
            {product.name}
          </Link>
        </h3>
        <p className="text-[11px] text-graphite-soft">
          {product.vialSize}
          {product.purity ? ` · ${product.purity}` : ''}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <div className="font-display text-base font-semibold text-ink sm:text-lg">
            {formatMoney(product.price)}
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
