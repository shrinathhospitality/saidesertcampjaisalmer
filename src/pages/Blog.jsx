import { useMemo, useState } from 'react';
import Page from '../components/Page.jsx';
import SEO from '../seo/SEO.jsx';
import PageHero from '../components/PageHero.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import BlogCard from '../components/cards/BlogCard.jsx';
import { useContent } from '../context/ContentContext.jsx';
import { getCategories } from '../utils/format';

export default function Blog() {
  const { blogs } = useContent();
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const categories = useMemo(() => getCategories(blogs), [blogs]);
  const filtered = blogs.filter((post) => {
    const matchesCategory = category === 'All' || post.category === category;
    const matchesQuery = [post.title, post.excerpt, post.category, ...(post.tags || [])].join(' ').toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });
  const featured = blogs.find((post) => post.featured);

  return (
    <Page>
      <SEO title="Blog" description="Sai Desert Camp & Resort journal with destination, dining, wellness, and design stories." path="/blog" />
      <PageHero eyebrow="Journal" title="Stories with destination intelligence" text="Search and filter articles managed from the admin dashboard." image="/assets/blog-1.svg" breadcrumbs={[{ label: 'Blog' }]} />
      <section className="section-pad">
        <div className="container-lux">
          <SectionTitle eyebrow="Featured Article" title="Editorial notes from the estate" />
          <div className="mt-10">{featured && <BlogCard post={featured} featured />}</div>
          <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_18rem]">
            <div>
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-3">
                  {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[.18em] ${category === item ? 'border-champagne bg-champagne' : 'border-ink/10'}`}>{item}</button>)}
                </div>
                <label className="sr-only" htmlFor="blog-search">Search posts</label>
                <input id="blog-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search journal" className="min-h-12 rounded-full border border-ink/10 bg-pearl px-5 outline-none focus:border-champagne" />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {filtered.map((post) => <BlogCard key={post.id} post={post} />)}
              </div>
            </div>
            <aside className="h-fit rounded-[2rem] border border-ink/10 bg-pearl p-6 shadow-sm lg:sticky lg:top-28">
              <h3 className="font-display text-3xl">Sidebar</h3>
              <p className="mt-3 text-sm leading-7 text-ink/60">Categories, editor picks, and promotions are managed from the admin dashboard.</p>
              <div className="mt-5 grid gap-3">
                {blogs.slice(0, 3).map((post) => <a key={post.id} href={`/blog/${post.slug || post.id}`} className="text-sm font-semibold hover:text-bronze">{post.title}</a>)}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </Page>
  );
}
