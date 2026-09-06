import { Link } from 'react-router-dom';

export default function BlogCard({ post, featured = false }) {
  const link = `/blog/${post.slug || post.id}`;
  return (
    <article className={`rounded-[2rem] border border-ink/10 bg-pearl ${featured ? 'grid lg:grid-cols-2' : ''}`}>
      <Link to={link} className={`block overflow-hidden rounded-t-[2rem] ${featured ? 'lg:rounded-l-[2rem] lg:rounded-tr-none' : ''}`}>
        <img src={post.image} alt={post.title} loading="lazy" className={`w-full object-cover ${featured ? 'h-full min-h-[22rem]' : 'aspect-[16/11]'}`} />
      </Link>
      <div className="p-6 md:p-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[.28em] text-bronze">{post.category} · {new Date(post.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        <Link to={link}><h3 className={`${featured ? 'text-5xl md:text-6xl' : 'text-4xl'} font-display font-semibold leading-none`}>{post.title}</h3></Link>
        <p className="mt-4 text-sm leading-7 text-ink/62">{post.excerpt}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {(post.tags || []).map((tag) => <span key={tag} className="rounded-full bg-ink/[.05] px-3 py-1 text-xs text-ink/58">#{tag}</span>)}
        </div>
      </div>
    </article>
  );
}
