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

  const formTone =
    product.applicationRoute === 'topical'
      ? 'bg-fuchsia-500/90 text-white'
      : product.applicationRoute === 'nasal'
        ? 'bg-sky-500/90 text-white'
        : 'bg-indigo-500/90 text-white';

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.07]">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden">
          <ProductPhoto product={product} size="md" showCaption={false} className="bg-ink-soft" />
          <span
            className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-sm ${formTone}`}
          >
            {formLabel}
          </span>
          {!product.inStock && (
            <span className="absolute right-3 top-3 z-10 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold text-white">
              Out of stock
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 border-t border-white/10 p-3.5 sm:p-4">
        <h3 className="font-display text-sm font-semibold leading-snug text-white sm:text-[15px]">
          <Link to={`/product/${product.slug}`} className="hover:text-indigo-200">
            {product.name}
          </Link>
        </h3>
        <p className="text-[11px] text-white/45">
          {product.vialSize}
          {product.purity ? ` · ${product.purity}` : ''}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <div className="font-display text-base font-semibold text-white sm:text-lg">
            {formatMoney(product.price)}
          </div>
          <button
            type="button"
            disabled={!product.inStock}
            onClick={() => product.inStock && addItem(product, 1)}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:from-white/20 disabled:to-white/20 disabled:text-white/40"
          >
            {product.inStock ? 'Add' : 'Sold out'}
          </button>
        </div>
      </div>
    </article>
  );
}
